import { compare, valid } from "semver";
import { PACKAGE_NAME } from "../config.ts";

const NPM_LATEST_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
const DEFAULT_VERSION_CHECK_TIMEOUT_MS = 10000;

export interface LatestZikiRelease {
	version: string;
	packageName?: string;
	note?: string;
}

export function comparePackageVersions(leftVersion: string, rightVersion: string): number | undefined {
	const left = valid(leftVersion.trim());
	const right = valid(rightVersion.trim());
	if (!left || !right) {
		return undefined;
	}
	return compare(left, right);
}

export function isNewerPackageVersion(candidateVersion: string, currentVersion: string): boolean {
	const comparison = comparePackageVersions(candidateVersion, currentVersion);
	if (comparison !== undefined) {
		return comparison > 0;
	}
	return candidateVersion.trim() !== currentVersion.trim();
}

export async function getLatestZikiRelease(
	_currentVersion: string,
	options: { timeoutMs?: number } = {},
): Promise<LatestZikiRelease | undefined> {
	if (process.env.ZIKI_OFFLINE) return undefined;

	const response = await fetch(NPM_LATEST_URL, {
		signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_VERSION_CHECK_TIMEOUT_MS),
	});
	if (!response.ok) return undefined;

	const data = (await response.json()) as {
		version?: unknown;
	};
	if (typeof data.version !== "string" || !data.version.trim()) {
		return undefined;
	}
	return { version: data.version.trim() };
}

export async function getLatestZikiVersion(
	currentVersion: string,
	options: { timeoutMs?: number } = {},
): Promise<string | undefined> {
	return (await getLatestZikiRelease(currentVersion, options))?.version;
}

export async function checkForNewZikiVersion(currentVersion: string): Promise<LatestZikiRelease | undefined> {
	if (process.env.ZIKI_SKIP_VERSION_CHECK) return undefined;

	try {
		const latestRelease = await getLatestZikiRelease(currentVersion);
		if (latestRelease && isNewerPackageVersion(latestRelease.version, currentVersion)) {
			return latestRelease;
		}
		return undefined;
	} catch {
		return undefined;
	}
}
