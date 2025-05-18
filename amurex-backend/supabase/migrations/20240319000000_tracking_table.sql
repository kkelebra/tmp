CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    uuid TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    meeting_id TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_uuid ON analytics(uuid);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_meeting_id ON analytics(meeting_id); 