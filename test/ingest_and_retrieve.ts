import { processFile } from '../src/ingestion/processor.js';
import { storeDocument } from '../src/ingestion/store.js';
import { search } from '../src/retrieval/engine.js';
import path from 'path';

async function main() {
    try {
        console.log('--- Starting Ingestion Test ---');
        // Create a dummy file for testing if needed, or use an existing one
        const testFile = path.resolve('README.md');

        console.log(`Processing file: ${testFile}`);
        const processedDoc = await processFile(testFile);
        console.log('File processed successfully.');
        console.log(`Chunks generated: ${processedDoc.chunks.length}`);

        console.log('Storing document...');
        const docId = await storeDocument(processedDoc);
        console.log(`Document stored with ID: ${docId}`);

        console.log('\n--- Starting Retrieval Test ---');
        const query = 'What is this project about?';
        console.log(`Searching for: "${query}"`);

        const results = await search(query);
        console.log('Search results:');
        results.forEach((result, i) => {
            console.log(`[${i + 1}] Similarity: ${result.similarity.toFixed(4)}`);
            console.log(`    Content: ${result.content.substring(0, 100)}...`);
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
