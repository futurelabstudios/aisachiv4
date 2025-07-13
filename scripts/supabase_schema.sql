-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for public user profiles
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.users FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.users FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.users FOR UPDATE
  USING ( auth.uid() = id );

-- This trigger automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Conversations table linked to users
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_question TEXT NOT NULL,
    assistant_answer TEXT NOT NULL,
    response_time INTEGER NOT NULL, -- Response time in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Row Level Security (RLS) policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user-based access
CREATE POLICY "Users can access their own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

-- Remove the old session-based cleanup function if it exists
DROP FUNCTION IF EXISTS cleanup_old_conversations(); 