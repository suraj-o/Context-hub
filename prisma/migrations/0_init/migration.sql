-- ============================================================
-- MCP Brain Server — Full Database Schema
-- PostgreSQL 16 + pgvector + Full-Text Search
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_api_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Workspaces ─────────────────────────────────────────────

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects ───────────────────────────────────────────────

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    repository_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Context Entries ────────────────────────────────────────

CREATE TABLE context_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Classification
    context_type VARCHAR(50) NOT NULL CHECK (
        context_type IN ('code_snippet', 'arch_decision', 'task', 'conversation', 'note')
    ),

    -- Content
    title VARCHAR(500) NOT NULL,
    raw_content TEXT NOT NULL,
    processed_content TEXT NOT NULL,

    -- Source tracking
    source_file_path VARCHAR(1000),
    source_language VARCHAR(50),
    source_line_start INTEGER,
    source_line_end INTEGER,

    -- Deduplication
    content_hash VARCHAR(64) NOT NULL,

    -- Scoring
    importance_score INTEGER DEFAULT 50 CHECK (importance_score BETWEEN 0 AND 100),
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Flexible metadata
    metadata JSONB DEFAULT '{}',

    -- Hierarchy
    parent_context_id UUID REFERENCES context_entries(id),
    linked_urls TEXT[],

    -- Full-text search column (auto-populated by trigger)
    search_vector tsvector,

    -- Unique per project
    UNIQUE(project_id, content_hash)
);

-- ── Context Embeddings ─────────────────────────────────────

CREATE TABLE context_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_entry_id UUID NOT NULL REFERENCES context_entries(id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    chunk_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tags ───────────────────────────────────────────────────

CREATE TABLE context_tags (
    context_id UUID REFERENCES context_entries(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (context_id, tag)
);

-- ── Relationships ──────────────────────────────────────────

CREATE TABLE context_relationships (
    source_id UUID REFERENCES context_entries(id) ON DELETE CASCADE,
    target_id UUID REFERENCES context_entries(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'related',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (source_id, target_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Primary lookup
CREATE INDEX idx_context_project_id ON context_entries(project_id);
CREATE INDEX idx_context_type ON context_entries(context_type);
CREATE INDEX idx_context_hash ON context_entries(content_hash);
CREATE INDEX idx_context_created_at ON context_entries(created_at DESC);
CREATE INDEX idx_context_last_accessed ON context_entries(last_accessed_at DESC);

-- Active entries only (soft delete filter)
CREATE INDEX idx_context_active ON context_entries(project_id) WHERE deleted_at IS NULL;

-- pgvector IVFFlat index for cosine similarity search
CREATE INDEX idx_embeddings_vector ON context_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search GIN index
CREATE INDEX idx_context_search_vector ON context_entries USING gin(search_vector);


-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-populate search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.processed_content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER context_search_vector_trigger
    BEFORE INSERT OR UPDATE ON context_entries
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER context_updated_at_trigger
    BEFORE UPDATE ON context_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
