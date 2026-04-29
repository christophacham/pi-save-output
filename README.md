# pi-save-output

A pi extension that saves the last assistant message to a markdown file.

When you see something you like — a nice bit of output, a summary you want to keep — the old way was to ask the model to write it to a file for you. That works, but it burns tokens and pollutes the model context just to shuffle text around. This extension side-steps all of that. It takes the last assistant message straight from the session and writes it to disk. No round-trip through the model, no context noise, just done.

## Usage

```
/save-output <path/to/file.md>
```

When you run the command, it scans the session history in reverse to find the most recent assistant message, extracts the text from it, and writes that text to the file you specified. Parent directories are created automatically if they don't exist. If the file already exists, you'll be prompted to confirm overwriting it before anything is written.

Non-text content (tool calls, images, etc.) is stripped out — only the actual written response ends up in the file.

## Install

```bash
pi install npm:@nonplanarslicer/pi-save-output
```

Or run it without installing:

```bash
pi -e ./index.ts
```
