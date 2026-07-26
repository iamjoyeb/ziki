/**
 * Bash Spawn Hook Example
 *
 * Adjusts command, cwd, and env before execution.
 *
 * Usage:
 *   ziki -e ./bash-spawn-hook.ts
 */

import type { ExtensionAPI } from "@zikilabs/ziki-coding-agent";
import { createBashTool } from "@zikilabs/ziki-coding-agent";

export default function (ziki: ExtensionAPI) {
	const cwd = process.cwd();

	const bashTool = createBashTool(cwd, {
		spawnHook: ({ command, cwd, env }) => ({
			command: `source ~/.profile\n${command}`,
			cwd,
			env: { ...env, ZIKI_SPAWN_HOOK: "1" },
		}),
	});

	ziki.registerTool({
		...bashTool,
		execute: async (id, params, signal, onUpdate, _ctx) => {
			return bashTool.execute(id, params, signal, onUpdate);
		},
	});
}
