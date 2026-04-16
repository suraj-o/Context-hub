import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

// Lazily load the pipeline so we don't start it immediately on import if not needed
let embedder: FeatureExtractionPipeline | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    // all-MiniLM-L6-v2 outputs a 384 dimensional vector
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

/**
 * Generates a 384-dimensional embedding vector for the given text
 * using Hugging Face's all-MiniLM-L6-v2 model via Transformers.js.
 *
 * Runs locally inside Node.js.
 *
 * @param text - The input text to embed
 * @returns A 384-length number array representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  
  // The output is a Tensor. We convert its data payload into a standard array.
  return Array.from(output.data);
}
