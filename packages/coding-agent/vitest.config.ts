import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig, { workspaceSourcePaths } from "../../vitest.base.ts";

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			globals: true,
			environment: "node",
			testTimeout: 30000,
			reporters: process.env.GITHUB_ACTIONS ? ["dot", "github-actions"] : ["dot"],
			silent: "passed-only",
			exclude: [
				// Tests referencing removed providers
				"test/agent-session-auto-compaction-queue.test.ts",
				"test/agent-session-concurrent.test.ts",
				"test/agent-session-dynamic-provider.test.ts",
				"test/agent-session-dynamic-tools.test.ts",
				"test/agent-session-retry.test.ts",
				"test/agent-session-stats.test.ts",
				"test/model-registry.test.ts",
				"test/model-runtime-auth-options.test.ts",
				"test/model-runtime-cloudflare-compat.test.ts",
				"test/radius.test.ts",
				"test/rpc-prompt-response-semantics.test.ts",
			],
			server: {
				deps: {
					external: [/@silvia-odwyer\/photon-node/],
				},
			},
		},
		resolve: {
			alias: [
				{ find: /^@iamjoyeb\/ziki-ai$/, replacement: workspaceSourcePaths.aiIndex },
				{ find: /^@iamjoyeb\/ziki-ai\/oauth$/, replacement: workspaceSourcePaths.aiOAuth },
				{ find: /^@iamjoyeb\/ziki-agent-core$/, replacement: workspaceSourcePaths.agentIndex },
				{ find: /^@iamjoyeb\/ziki-tui$/, replacement: workspaceSourcePaths.tuiIndex },
				// Backward compat aliases for old scopes
				{ find: /^@mariozechner\/pi-ai$/, replacement: workspaceSourcePaths.aiIndex },
				{ find: /^@mariozechner\/pi-ai\/oauth$/, replacement: workspaceSourcePaths.aiOAuth },
				{ find: /^@mariozechner\/ziki-agent-core$/, replacement: workspaceSourcePaths.agentIndex },
				{ find: /^@mariozechner\/pi-tui$/, replacement: workspaceSourcePaths.tuiIndex },
			],
		},
	}),
);
