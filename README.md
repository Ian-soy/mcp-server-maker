# mcp-server-maker MCP Server

write new notes.

This is a TypeScript-based MCP server help you write new notes.

## preview

![](./public/1.png)

## Features

### Tools

- `write_note`
  - Takes content as required parameters

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
