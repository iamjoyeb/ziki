export function areExperimentalFeaturesEnabled(): boolean {
	return process.env.ZIKI_EXPERIMENTAL === "1";
}
