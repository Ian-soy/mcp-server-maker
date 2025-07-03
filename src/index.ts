#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { MakerClient } from"./maker.js";

/**
 * 从从命令行参数中读取 flomo_api_url
 * Parse command line arguments
 * Example: node index.js --flomo_api_url=https://flomoapp.com/iwh/xxx/xxx/
 */
function parseArgs() {
  const args: Record<string, string> = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value;
    }
  });
  return args;
}

const args = parseArgs();
const apiUrl = args.flomo_api_url || process.env.FLOMO_API_URL || "";

// node build/index.js --flomo_api_url=https://flomoapp.com/iwh/MTA4MjYz/1b5817dcd3decd55c834249fd9c7f9ae/

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "mcp-server-maker",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {}
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes a single "create_note" tool that lets clients create new notes.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "write_note",
        description: "Make new content",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "Text content of the note"
            }
          },
          required: ["content"]
        }
      }
    ]
  };
});

/**
 * Handler for the create_note tool.
 * Creates a new note with the provided title and content, and returns success message.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "write_note": {

      if (!apiUrl) {
        throw new Error("Flomo API URL not set");
      }

      const content = String(request.params.arguments?.content);
      if (!content) {
        throw new Error("Title and content are required");
      }

      // 网上找的测试地址
      // const apiUrl = "https://flomoapp.com/iwh/MTA4MjYz/1b5817dcd3decd55c834249fd9c7f9ae/";

      const maker = new MakerClient({ apiUrl });
      const resp = await maker.writeNote({ content });

      // 增加详情页的反悔，以便查看
      if (!resp.memo || !resp.memo.slug) {
      throw new Error(
          `Failed to write note to flomo: ${resp?.message || "unknown error"}`
        );
      }

      const flomoUrl = `https://v.flomoapp.com/mine/?memo_id=${resp.memo.slug}`;

      return {
        content: [{
          type: "text",
          // text: `make a note success ${JSON.stringify(resp)}` // 测试反悔地址
          text: `make a note success, flomo url: ${flomoUrl}`
        }]
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
