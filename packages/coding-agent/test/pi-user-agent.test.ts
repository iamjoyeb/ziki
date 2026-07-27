import { describe, expect, it } from "vitest";
import { getZikiUserAgent } from "../src/utils/ziki-user-agent.ts";

describe("getZikiUserAgent", () => {
	it("formats the user agent correctly", () => {
		const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
		const userAgent = getZikiUserAgent("1.2.3");

		expect(userAgent).toBe(`ziki/1.2.3 (${process.platform}; ${runtime}; ${process.arch})`);
		expect(userAgent).toMatch(/^ziki\/[^\s()]+ \([^;()]+;\s*[^;()]+;\s*[^()]+\)$/);
	});
});
