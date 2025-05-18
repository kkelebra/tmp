-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    notion_connected BOOLEAN DEFAULT FALSE,
    notion_access_token TEXT,
    notion_workspace_id TEXT,
    notion_bot_id TEXT,

    google_docs_connected BOOLEAN DEFAULT FALSE,
    google_access_token TEXT,
    google_refresh_token TEXT,

    calendar_connected BOOLEAN DEFAULT FALSE,
    calendar_access_token TEXT,
    calendar_refresh_token TEXT,

    memory_enabled BOOLEAN DEFAULT TRUE
);

-- Ensure updated_at is updated automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

