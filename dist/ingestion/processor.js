"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFile = processFile;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openai_1 = __importDefault(require("openai"));
const config_js_1 = require("../config.js");
const openai = new openai_1.default({ apiKey: config_js_1.config.OPENAI_API_KEY });
async function processFile(filePath) {
    const content = await extractText(filePath);
    const metadata = {
        source: filePath,
        filename: path_1.default.basename(filePath),
        extension: path_1.default.extname(filePath),
        processedAt: new Date().toISOString(),
    };
    const textChunks = chunkText(content, 1000, 200); // Chunk size 1000 chars, overlap 200
    const chunks = await Promise.all(textChunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk);
        return {
            content: chunk,
            embedding,
            metadata: {
                ...metadata,
                chunkIndex: index,
            },
        };
    }));
    return { content, metadata, chunks };
}
async function extractText(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
        const dataBuffer = await promises_1.default.readFile(filePath);
        // @ts-ignore
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        return data.text;
    }
    else {
        // Assume text file for now
        return await promises_1.default.readFile(filePath, 'utf-8');
    }
}
function chunkText(text, chunkSize, overlap) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}
async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}
