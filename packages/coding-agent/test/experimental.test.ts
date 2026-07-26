import { afterEach, describe, expect, it } from "vitest";
import { areExperimentalFeaturesEnabled } from "../src/core/experimental.ts";

describe("areExperimentalFeaturesEnabled", () => {
	const originalPiExperimental = process.env.ZIKI_EXPERIMENTAL;

	afterEach(() => {
		if (originalPiExperimental === undefined) {
			delete process.env.ZIKI_EXPERIMENTAL;
		} else {
			process.env.ZIKI_EXPERIMENTAL = originalPiExperimental;
		}
	});

	it("returns false when ZIKI_EXPERIMENTAL is unset", () => {
		delete process.env.ZIKI_EXPERIMENTAL;

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns false when ZIKI_EXPERIMENTAL is empty", () => {
		process.env.ZIKI_EXPERIMENTAL = "";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns true when ZIKI_EXPERIMENTAL is set to 1", () => {
		process.env.ZIKI_EXPERIMENTAL = "1";

		expect(areExperimentalFeaturesEnabled()).toBe(true);
	});

	it("returns false when ZIKI_EXPERIMENTAL is set to 0", () => {
		process.env.ZIKI_EXPERIMENTAL = "0";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});

	it("returns false when ZIKI_EXPERIMENTAL is set to a non-1 value", () => {
		process.env.ZIKI_EXPERIMENTAL = "true";

		expect(areExperimentalFeaturesEnabled()).toBe(false);
	});
});
