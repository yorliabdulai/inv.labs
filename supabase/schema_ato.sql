-- Ato AI Assistant Database Schema
-- This schema supports conversation history, message storage, and usage tracking for rate limiting

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
-- Stores conversation threads between users and Ato
CREATE TABLE public.ato_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
-- Stores individual messages within conversations
CREATE TABLE public.ato_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ato_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table for rate limiting
-- Tracks daily message count per user to enforce 50 messages/day limit
CREATE TABLE public.ato_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_ato_conversations_user_id ON public.ato_conversations(user_id);
CREATE INDEX idx_ato_conversations_updated_at ON public.ato_conversations(updated_at DESC);
CREATE INDEX idx_ato_messages_conversation_id ON public.ato_messages(conversation_id);
CREATE INDEX idx_ato_messages_created_at ON public.ato_messages(created_at DESC);
CREATE INDEX idx_ato_usage_user_date ON public.ato_usage(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.ato_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ato_conversations
CREATE POLICY "Users can view own conversations" 
  ON public.ato_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
  ON public.ato_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON public.ato_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
  ON public.ato_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for ato_messages
CREATE POLICY "Users can view own messages" 
  ON public.ato_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ato_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" 
  ON public.ato_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ato_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for ato_usage
CREATE POLICY "Users can view own usage" 
  ON public.ato_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" 
  ON public.ato_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" 
  ON public.ato_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ato_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on conversation updates
CREATE TRIGGER update_ato_conversation_timestamp
  BEFORE UPDATE ON public.ato_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ato_conversation_updated_at();

-- Function to increment daily usage count
CREATE OR REPLACE FUNCTION increment_ato_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.ato_usage (user_id, date, message_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET message_count = public.ato_usage.message_count + 1;
  
  SELECT message_count INTO v_count
  FROM public.ato_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily usage count
CREATE OR REPLACE FUNCTION get_ato_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COALESCE(message_count, 0) INTO v_count
  FROM public.ato_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_ato_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ato_usage(UUID) TO authenticated;
