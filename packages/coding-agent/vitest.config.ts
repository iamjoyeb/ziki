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
