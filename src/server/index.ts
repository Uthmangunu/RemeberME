import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { search, constructContextPacket } from '../retrieval/engine.js';
import { supabase } from '../db.js';

const server = new Server(
    {
        name: 'hold-it-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_context',
                description: 'Search for relevant context from the user\'s personal data.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'The search query.',
                        },
                        limit: {
                            type: 'number',
                            description: 'The maximum number of results to return (default: 5).',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'list_folders',
                description: 'List all available folders/sources in the user\'s data.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'get_file_metadata',
                description: 'Get metadata for a specific file.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filename: {
                            type: 'string',
                            description: 'The name of the file.',
                        },
                    },
                    required: ['filename'],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case 'search_context': {
            const { query, limit = 5 } = request.params.arguments as { query: string; limit?: number };
            const results = await search(query, {}, limit);
            const packet = constructContextPacket(results);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(packet, null, 2),
                    },
                ],
            };
        }

        case 'list_folders': {
            // Query unique sources from documents metadata
            // Note: This is a simplified approach. Ideally, we'd have a separate folders table or efficient query.
            const { data, error } = await supabase
                .from('documents')
                .select('metadata');

            if (error) throw new Error(`Error listing folders: ${error.message}`);

            const folders = new Set<string>();
            data.forEach((doc) => {
                if (doc.metadata && doc.metadata.source) {
                    // Extract folder path from source
                    const dir = doc.metadata.source.substring(0, doc.metadata.source.lastIndexOf('/'));
                    if (dir) folders.add(dir);
                }
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(Array.from(folders), null, 2),
                    },
                ],
            };
        }

        case 'get_file_metadata': {
            const { filename } = request.params.arguments as { filename: string };
            const { data, error } = await supabase
                .from('documents')
                .select('metadata')
                .ilike('metadata->>filename', `%${filename}%`)
                .limit(1);

            if (error) throw new Error(`Error getting file metadata: ${error.message}`);
            if (!data || data.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `File not found: ${filename}`,
                        },
                    ],
                    isError: true,
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(data[0].metadata, null, 2),
                    },
                ],
            };
        }

        default:
            throw new Error('Unknown tool');
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Hold It MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
