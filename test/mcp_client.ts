import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
    ListToolsResultSchema,
    CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';

async function main() {
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/server/index.js'],
    });

    const client = new Client(
        {
            name: 'test-client',
            version: '1.0.0',
        },
        {
            capabilities: {},
        }
    );

    await client.connect(transport);
    console.log('Connected to MCP Server');

    // List Tools
    const tools = await client.request(
        { method: 'tools/list' },
        ListToolsResultSchema
    );
    console.log('Available Tools:', tools.tools.map(t => t.name));

    // Call search_context (will fail without env vars, but tests connection)
    try {
        console.log('Calling search_context...');
        const result = await client.request(
            {
                method: 'tools/call',
                params: {
                    name: 'search_context',
                    arguments: {
                        query: 'test query',
                    },
                },
            },
            CallToolResultSchema
        );
        console.log('Result:', result);
    } catch (error) {
        console.log('Call failed (expected if no env vars):', error);
    }

    await client.close();
}

main();
