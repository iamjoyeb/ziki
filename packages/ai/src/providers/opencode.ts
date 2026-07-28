import { anthropicMessagesApi } from "../api/anthropic-messages.lazy.ts";
import { googleGenerativeAIApi } from "../api/google-generative-ai.lazy.ts";
import { openAICompletionsApi } from "../api/openai-completions.lazy.ts";
import { openAIResponsesApi } from "../api/openai-responses.lazy.ts";
import { envApiKeyAuth } from "../auth/helpers.ts";
import { createProvider, type Provider, type RefreshModelsContext } from "../models.ts";
import { OPENCODE_MODELS } from "./opencode.models.ts";

const OPENCODE_ZEN_API_BASE = "https://opencode.ai/zen/v1";
const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000;

/** Additional models fetched dynamically from the OpenCode Zen API, keyed by id. */
let dynamicModels: Record<string, boolean> | undefined;

async function fetchOpenCodeModels(
	ctx: RefreshModelsContext,
): Promise<readonly string[]> {
	const url = `${OPENCODE_ZEN_API_BASE}/models`;
	const response = await fetch(url, {
		headers: { accept: "application/json" },
		signal: ctx.signal,
	});
	if (!response.ok) {
		throw new Error(`OpenCode Zen models endpoint returned ${response.status}`);
	}
	type OpenAIModelListEntry = { id: string };
	type OpenAIModelList = { data: OpenAIModelListEntry[] };
	const body = (await response.json()) as OpenAIModelList;
	return (body.data ?? []).map((m: OpenAIModelListEntry) => m.id);
}

export function opencodeProvider(): Provider<
	"anthropic-messages" | "google-generative-ai" | "openai-completions" | "openai-responses"
> {
	const baseProvider = createProvider({
		id: "opencode",
		name: "OpenCode Zen",
		auth: { apiKey: envApiKeyAuth("OpenCode API key", ["OPENCODE_API_KEY"], "https://opencode.ai/api-keys") },
		models: Object.values(OPENCODE_MODELS),
		api: {
			"anthropic-messages": anthropicMessagesApi(),
			"google-generative-ai": googleGenerativeAIApi(),
			"openai-completions": openAICompletionsApi(),
			"openai-responses": openAIResponsesApi(),
		},
	});

	return {
		...baseProvider,
		refreshModels: async (ctx) => {
			const stored = await ctx.store.read();
			if (
				!ctx.force &&
				stored?.checkedAt !== undefined &&
				Date.now() - stored.checkedAt < REFRESH_INTERVAL_MS
			) {
				return;
			}

			try {
				const remoteIds = await fetchOpenCodeModels(ctx);
				const modelIds: string[] = Object.values(OPENCODE_MODELS).map((m) => m.id);
				const knownIds = new Set<string>(modelIds);
				const newIds = remoteIds.filter((id) => !knownIds.has(id));
				dynamicModels = Object.fromEntries(newIds.map((id) => [id, true]));
				await ctx.store.write({
					models: [],
					checkedAt: Date.now(),
					lastModified: 0,
				});
			} catch {
				await ctx.store.write({
					models: [],
					checkedAt: Date.now(),
				});
			}
		},
		getModels: () => {
			const staticModels = Object.values(OPENCODE_MODELS);
			if (!dynamicModels) return staticModels;
			const knownIds: Set<string> = new Set(staticModels.map((m) => m.id));
			const api: "openai-completions" = "openai-completions";
			return [
				...staticModels,
				...Object.keys(dynamicModels)
					.filter((id: string) => !knownIds.has(id))
					.map((id) => ({
						id,
						name: id,
						api,
						provider: "opencode" as const,
						baseUrl: OPENCODE_ZEN_API_BASE,
						reasoning: false,
						input: ["text" as const],
						cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
						contextWindow: 128000,
						maxTokens: 4096,
					})),
			];
		},
	};
}
