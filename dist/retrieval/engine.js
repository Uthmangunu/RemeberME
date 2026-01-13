"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.constructContextPacket = constructContextPacket;
const db_js_1 = require("../db.js");
const openai_1 = __importDefault(require("openai"));
const config_js_1 = require("../config.js");
const openai = new openai_1.default({ apiKey: config_js_1.config.OPENAI_API_KEY });
async function search(query, filters = {}, limit = 5) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await db_js_1.supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.7, // Adjust as needed
        match_count: limit,
        filter: filters,
    });
    if (error)
        throw new Error(`Error searching documents: ${error.message}`);
    return data;
}
function constructContextPacket(results) {
    // Simple construction for now. Could be enhanced with LLM summarization.
    const summary = `Found ${results.length} relevant chunks.`;
    return {
        summary,
        results,
    };
}
async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}
