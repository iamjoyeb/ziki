import { afterEach, describe, expect, it, vi } from "vitest";
import { InMemoryCredentialStore } from "../src/auth/credential-store.ts";
import { openRouterOAuth } from "../src/auth/oauth/openrouter.ts";
import { createModels } from "../src/models.ts";
import * as extensionOAuthCompatibility from "../src/oauth.ts";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe.sequential("OAuthAuth adapters", () => {
	it("keeps the extension OAuth barrel free of built-in flow implementations", () => {
		expect(extensionOAuthCompatibility).not.toHaveProperty("loginAnthropic");
		expect(extensionOAuthCompatibility).not.toHaveProperty("anthropicOAuth");
	});

	it("openRouter OAuth exchanges device-code for access token", async () => {
		const events: any[] = [];
		vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
			const path = typeof url === "string" ? url : (url as Request).url;
			if (path.includes("auth/device")) {
				return jsonResponse({
					device_code: "device-123",
					user_code: "USER-CODE",
					verification_uri: "https://openrouter.ai/auth/device",
					interval: 0.1,
				});
			}
			if (path.includes("auth/device/token")) {
				return jsonResponse({ access_token: "token-456" });
			}
			throw new Error(`Unexpected ${path}`);
		});

		const credential = await openRouterOAuth.login({
			prompt: async () => "",
			notify: (e) => events.push(e),
			signal: new AbortController().signal,
		});
		expect(credential).toEqual({ type: "oauth", token: "token-456" });
		expect(events).toHaveLength(4);
	});

	it("openRouter OAuth cancelled via signal", async () => {
		vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
			const path = typeof url === "string" ? url : (url as Request).url;
			if (path.includes("auth/device")) {
				return jsonResponse({
					device_code: "device-123",
					user_code: "USER-CODE",
					verification_uri: "https://openrouter.ai/auth/device",
					interval: 0.1,
				});
			}
			throw new Error(`Unexpected ${path}`);
		});

		const ctrl = new AbortController();
		setTimeout(() => ctrl.abort(), 50);
		await expect(
			openRouterOAuth.login({
				prompt: async () => "",
				notify: () => {},
				signal: ctrl.signal,
			}),
		).rejects.toThrow("aborted");
	});
});
