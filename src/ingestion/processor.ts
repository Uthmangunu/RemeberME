import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface ProcessedDocument {
    content: string;
    metadata: Record<string, any>;
    chunks: {
        content: string;
        embedding: number[];
        metadata: Record<string, any>;
    }[];
}

export async function processFile(filePath: string): Promise<ProcessedDocument> {
    const content = await extractText(filePath);
    const metadata = {
        source: filePath,
        filename: path.basename(filePath),
        extension: path.extname(filePath),
        processedAt: new Date().toISOString(),
    };

    const textChunks = chunkText(content, 1000, 200); // Chunk size 1000 chars, overlap 200
    const chunks = await Promise.all(
        textChunks.map(async (chunk, index) => {
            const embedding = await generateEmbedding(chunk);
            return {
                content: chunk,
                embedding,
                metadata: {
                    ...metadata,
                    chunkIndex: index,
                },
            };
        })
    );

    return { content, metadata, chunks };
}

async function extractText(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        // @ts-ignore
        const data = await pdf(dataBuffer);
        return data.text;
    } else {
        // Assume text file for now
        return await fs.readFile(filePath, 'utf-8');
    }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}
