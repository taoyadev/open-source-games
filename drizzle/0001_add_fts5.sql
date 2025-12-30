-- Migration: Add FTS5 full-text search support
-- Open Source Games Platform - P2
--
-- FTS5 (Full-Text Search 5) provides efficient text search with:
-- - Tokenization and stemming
-- - Phrase matching
-- - Boolean operators (AND, OR, NOT)
-- - Proximity search (NEAR)
-- - BM25 ranking

-- Create FTS5 virtual table for full-text search
-- Uses content sync with the main games table
CREATE VIRTUAL TABLE IF NOT EXISTS `games_fts` USING fts5(
  id UNINDEXED,       -- Keep ID for joining but don't index it
  title,              -- Searchable: game title
  description,        -- Searchable: game description
  ai_review,          -- Searchable: AI-generated review content
  topics,             -- Searchable: topics/tags as text
  content='games',    -- Sync content from games table
  content_rowid='rowid'
);

-- Triggers to keep FTS index synchronized with games table

-- Insert trigger: add new games to FTS index
CREATE TRIGGER IF NOT EXISTS games_fts_insert AFTER INSERT ON `games` BEGIN
  INSERT INTO games_fts(rowid, id, title, description, ai_review, topics)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.title,
    NEW.description,
    NEW.ai_review,
    NEW.topics
  );
END;

-- Update trigger: update FTS index when games are modified
CREATE TRIGGER IF NOT EXISTS games_fts_update AFTER UPDATE ON `games` BEGIN
  INSERT INTO games_fts(games_fts, rowid, id, title, description, ai_review, topics)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.title,
    OLD.description,
    OLD.ai_review,
    OLD.topics
  );
  INSERT INTO games_fts(rowid, id, title, description, ai_review, topics)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.title,
    NEW.description,
    NEW.ai_review,
    NEW.topics
  );
END;

-- Delete trigger: remove games from FTS index
CREATE TRIGGER IF NOT EXISTS games_fts_delete AFTER DELETE ON `games` BEGIN
  INSERT INTO games_fts(games_fts, rowid, id, title, description, ai_review, topics)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.title,
    OLD.description,
    OLD.ai_review,
    OLD.topics
  );
END;

-- Populate FTS table with existing data (if any)
-- This handles cases where games already exist before FTS was added
INSERT OR IGNORE INTO games_fts(rowid, id, title, description, ai_review, topics)
SELECT rowid, id, title, description, ai_review, topics FROM games;
