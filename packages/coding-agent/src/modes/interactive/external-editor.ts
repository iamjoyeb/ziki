import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface ExternalEditorOptions {
	command: string;
	content: string;
}

export type ExternalEditorResult = { status: "complete"; content: string } | { status: "failed" };

export async function editInExternalEditor(options: ExternalEditorOptions): Promise<ExternalEditorResult> {
	const directory = mkdtempSync(join(tmpdir(), "ziki-editor-"));
	const filePath = join(directory, "prompt.md");
	try {
		writeFileSync(filePath, options.content, "utf-8");
		// Parse the command string, respecting double-quoted segments (for paths with spaces on Windows)
		const commandParts: string[] = [];
		let current = "";
		let inQuote = false;
		for (const ch of options.command) {
			if (ch === '"') {
				inQuote = !inQuote;
			} else if (ch === " " && !inQuote) {
				if (current.length > 0) {
					commandParts.push(current);
					current = "";
				}
			} else {
				current += ch;
			}
		}
		if (current.length > 0) commandParts.push(current);
		const [editor, ...editorArgs] = commandParts;
		process.stdout.write(`Launching external editor: ${options.command}\nZiki will resume when the editor exits.\n`);

		// Do not use spawnSync here. On Windows, synchronous child_process calls can keep
		// Node/libuv's console input read active after the parent pauses stdin, racing
		// vim/nvim for the console input buffer until Ctrl+C cancels the pending read.
		const exitCode = await new Promise<number | null>((resolve) => {
			// On Windows with shell: true, Node.js passes args to cmd.exe without proper quoting
			// for paths with spaces. Manually quote each arg so cmd.exe receives them correctly.
			const quote = (s: string) => (s.includes(" ") ? `"${s}"` : s);
			const child = spawn(
				process.platform === "win32" ? quote(editor) : editor,
				[...editorArgs.map((a) => quote(a)), quote(filePath)],
				{
					stdio: "inherit",
					shell: process.platform === "win32",
				},
			);
			child.on("error", () => resolve(null));
			child.on("close", (code) => resolve(code));
		});

		if (exitCode !== 0) {
			return { status: "failed" };
		}

		return { status: "complete", content: readFileSync(filePath, "utf-8").replace(/\n$/, "") };
	} finally {
		try {
			rmSync(directory, { recursive: true, force: true });
		} catch {
			// Cleanup is best effort.
		}
	}
}
