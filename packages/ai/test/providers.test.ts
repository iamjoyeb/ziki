import { describe, expect, it } from "vitest";
import { envApiKeyAuth } from "../src/auth/helpers.ts";
import type { AuthContext } from "../src/auth/types.ts";
import { createModels } from "../src/models.ts";
import { builtinModels, builtinProviders } from "../src/providers/all.ts";
import { cloudflareWorkersAIProvider } from "../src/providers/cloudflare-workers-ai.ts";

function fakeAuthContext(env: Record<string, string>, files: string[] = []): AuthContext {
	return {
		env: async (name) => env[name],
		fileExists: async (path) => files.includes(path),
	};
}

describe("builtin providers", () => {
	it("builtinModels registers every builtin provider with models", async () => {
		const models = builtinModels();
		const providers = models.getProviders();
		expect(providers.length).toBe(builtinProviders().length);
		expect(providers.map((p) => p.id)).toContain("google");

		const all = models.getModels();
		expect(all.length).toBeGreaterThan(50);

		for (const provider of providers) {
			const list = models.getModels(provider.id);
			expect(list.length).toBeGreaterThan(0);
			expect(list.every((m) => m.provider === provider.id)).toBe(true);
		}
	});

	it("requires Cloudflare Workers AI account config and returns scoped env", async () => {
		const missingAccount = createModels({ authContext: fakeAuthContext({ CLOUDFLARE_API_KEY: "cf-key" }) });
		missingAccount.setProvider(cloudflareWorkersAIProvider());
		const model = missingAccount.getModels("cloudflare-workers-ai")[0];
		expect(await missingAccount.getAuth(model.provider)).toBeUndefined();

		const configured = createModels({
			authContext: fakeAuthContext({ CLOUDFLARE_API_KEY: "cf-key", CLOUDFLARE_ACCOUNT_ID: "account-id" }),
		});
		configured.setProvider(cloudflareWorkersAIProvider());
		const result = await configured.getAuth(model.provider);
		expect(result?.auth).toEqual({ apiKey: "cf-key" });
		expect(result?.env).toEqual({ CLOUDFLARE_ACCOUNT_ID: "account-id" });
	});
});

describe("envApiKeyAuth", () => {
	it("prefers the stored credential key and falls back through env vars in order", async () => {
		const auth = envApiKeyAuth("Test key", ["FIRST_KEY", "SECOND_KEY"]);

		const stored = await auth.resolve({
			ctx: fakeAuthContext({ FIRST_KEY: "env" }),
			credential: { type: "api_key", key: "stored" },
		});
		expect(stored?.auth.apiKey).toBe("stored");
		expect(stored?.source).toBe("stored credential");

		const second = await auth.resolve({ ctx: fakeAuthContext({ SECOND_KEY: "second" }) });
		expect(second?.auth.apiKey).toBe("second");
		expect(second?.source).toBe("SECOND_KEY");

		const missing = await auth.resolve({ ctx: fakeAuthContext({}) });
		expect(missing).toBeUndefined();
	});

	it("resolves credentials and env overrides", async () => {
		const apiKeyAuth = envApiKeyAuth("test", ["MANUAL_KEY"]);

		const manual = await apiKeyAuth.resolve({ ctx: fakeAuthContext({}), credential: { type: "api_key", key: "key" } });
		expect(manual?.auth).toEqual({ apiKey: "key" });

		const env = await apiKeyAuth.resolve({ ctx: fakeAuthContext({ MANUAL_KEY: "env-key" }) });
		expect(env?.auth.apiKey).toBe("env-key");
		expect(env?.source).toBe("MANUAL_KEY");
	});

	it("returns url from loginUrl field", async () => {
		const auth = envApiKeyAuth("Test", ["KEY"], "https://example.com/key");
		expect(auth.loginUrl).toBe("https://example.com/key");
	});
});
