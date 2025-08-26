-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database if it doesn't exist (this is handled by Docker)
-- The database is already created in docker-compose.yml