-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the context_store table
CREATE TABLE context_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    content_hash VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_context_project ON context_store(project_id);
CREATE INDEX idx_context_hash ON context_store(content_hash);

-- IVFFlat index for fast cosine similarity search
-- Note: This index works best with >1000 rows. For smaller datasets,
-- pgvector will fall back to sequential scan automatically.
CREATE INDEX idx_context_embedding ON context_store
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
