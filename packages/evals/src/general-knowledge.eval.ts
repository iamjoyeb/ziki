import { expect } from "vitest";
import { describeEval } from "vitest-evals";
import { zikiCodingAgentHarness } from "./ziki-harness.ts";

describeEval("general knowledge", { harness: zikiCodingAgentHarness }, (it) => {
	it("knows the capital of France", async ({ run }) => {
		const result = await run("What's the capital of France? Respond with only the city name.");

		expect(result.output.trim()).toBe("Paris");
		expect(result.errors).toEqual([]);
		expect(result.usage.provider).toBe(process.env.ZIKI_PROVIDER);
		expect(result.usage.model).toBe(process.env.ZIKI_MODEL);
		expect(result.usage.totalTokens).toBeGreaterThan(0);
	});
});
