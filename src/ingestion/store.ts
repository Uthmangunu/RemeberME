import { supabase } from '../db.js';
import { ProcessedDocument } from './processor.js';

export async function storeDocument(document: ProcessedDocument) {
    // 1. Insert Document
    const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
            content: document.content,
            metadata: document.metadata,
        })
        .select()
        .single();

    if (docError) throw new Error(`Error inserting document: ${docError.message}`);

    const documentId = docData.id;

    // 2. Insert Chunks
    const chunksToInsert = document.chunks.map((chunk) => ({
        document_id: documentId,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
    }));

    const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(chunksToInsert);

    if (chunkError) throw new Error(`Error inserting chunks: ${chunkError.message}`);

    return documentId;
}
