-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simple conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_question TEXT NOT NULL,
    assistant_answer TEXT NOT NULL,
    response_time INTEGER NOT NULL, -- Response time in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy for session-based access
CREATE POLICY "Users can access their own session conversations" ON conversations
    FOR ALL USING (session_id = current_setting('app.session_id', true));

-- Function to cleanup old sessions (optional - run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversations 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql'; 