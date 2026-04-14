import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a 1536-dimensional embedding vector for the given text
 * using OpenAI's `text-embedding-3-small` model.
 *
 * The returned vector is used for cosine similarity search
 * against the `context_store.embedding` pgvector column.
 *
 * @param text - The input text to embed
 * @returns A 1536-length number array representing the embedding vector
 * @throws If the OpenAI API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
