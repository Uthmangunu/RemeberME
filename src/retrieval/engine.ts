import { supabase } from '../db.js';
import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface SearchResult {
    id: string;
    content: string;
    metadata: Record<string, any>;
    similarity: number;
}

export interface ContextPacket {
    summary: string;
    results: SearchResult[];
}

export async function search(query: string, filters: Record<string, any> = {}, limit: number = 5): Promise<SearchResult[]> {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.7, // Adjust as needed
        match_count: limit,
        filter: filters,
    });

    if (error) throw new Error(`Error searching documents: ${error.message}`);

    return data as SearchResult[];
}

export function constructContextPacket(results: SearchResult[]): ContextPacket {
    // Simple construction for now. Could be enhanced with LLM summarization.
    const summary = `Found ${results.length} relevant chunks.`;
    return {
        summary,
        results,
    };
}

async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}
