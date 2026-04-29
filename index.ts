import type { ExtensionAPI, SessionEntry, SessionMessageEntry } from "@mariozechner/pi-coding-agent";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const extractText = (content: unknown): string => {
	if (typeof content === "string") {
		return content;
	}
	if (!Array.isArray(content)) {
		return "";
	}
	const parts: string[] = [];
	for (const item of content) {
		if (!item || typeof item !== "object") continue;
		const block = item as Record<string, unknown>;
		if (block.type === "text" && typeof block.text === "string") {
			parts.push(block.text);
		}
	}
	return parts.join("\n\n");
};

export default function (pi: ExtensionAPI) {
	pi.registerCommand("save-output", {
		description: "Save the last assistant message to a markdown file",
		handler: async (args, ctx) => {
			if (!args || !args.trim()) {
				ctx.ui.notify("Usage: /save-output <path/to/file.md>", "error");
				return;
			}

			const entries = ctx.sessionManager.getEntries();
			let lastAssistant: SessionMessageEntry | null = null;

			for (let i = entries.length - 1; i >= 0; i--) {
				const entry = entries[i];
				if (entry.type === "message" && entry.message.role === "assistant") {
					lastAssistant = entry;
					break;
				}
			}

			if (!lastAssistant) {
				ctx.ui.notify("No assistant message found in this session", "error");
				return;
			}

			const markdown = extractText(lastAssistant.message.content);
			if (!markdown.trim()) {
				ctx.ui.notify("Last assistant message has no text content", "warning");
				return;
			}

			const filePath = resolve(ctx.cwd, args.trim());

			try {
				let exists = false;
				try {
					await access(filePath);
					exists = true;
				} catch {
					// file does not exist, proceed
				}

				if (exists) {
					const overwrite = await ctx.ui.confirm(
						"File already exists",
						`${filePath} already exists. Overwrite?`,
					);
					if (!overwrite) {
						ctx.ui.notify("Save cancelled", "info");
						return;
					}
				}

				await mkdir(dirname(filePath), { recursive: true });
				await writeFile(filePath, markdown, "utf-8");
				ctx.ui.notify(`Saved output to ${filePath}`, "success");
			} catch (err: any) {
				ctx.ui.notify(`Failed to save file: ${err.message}`, "error");
			}
		},
	});
}
