-- Chat History Table Migration
-- Add this to your existing Supabase database
-- Execute this in Supabase SQL Editor

-- ============================================
-- TABLE: chat_history
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent VARCHAR(100) DEFAULT NULL,
  confidence DECIMAL(3,2) DEFAULT NULL,
  user_ip VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_intent ON public.chat_history(intent);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert chat history (untuk save dari frontend)
CREATE POLICY "Chat: Anyone can insert" ON public.chat_history
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can view all chat history
CREATE POLICY "Chat: Admin can view all" ON public.chat_history
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: Users can view their own session history (based on session_id)
-- Note: This is optional - jika Anda ingin user bisa lihat history mereka sendiri
CREATE POLICY "Chat: Users can view own session" ON public.chat_history
  FOR SELECT USING (
    session_id = current_setting('app.session_id', true)
  );

-- ============================================
-- HELPER VIEW: Chat Analytics (Admin Only)
-- ============================================
CREATE OR REPLACE VIEW chat_analytics AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT session_id) as unique_sessions,
  intent,
  AVG(confidence) as avg_confidence
FROM chat_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), intent
ORDER BY date DESC, total_messages DESC;

-- Grant admin access to view
-- Note: Adjust based on your auth setup
COMMENT ON VIEW chat_analytics IS 'Daily chat statistics for analytics dashboard';

-- ============================================
-- SAMPLE QUERY Examples
-- ============================================

-- Get all chats from last 7 days:
-- SELECT * FROM chat_history WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC;

-- Get chat by session:
-- SELECT * FROM chat_history WHERE session_id = 'your-session-id' ORDER BY created_at ASC;

-- Get most common intents:
-- SELECT intent, COUNT(*) as count FROM chat_history GROUP BY intent ORDER BY count DESC LIMIT 10;

-- Get average confidence per intent:
-- SELECT intent, AVG(confidence) as avg_conf FROM chat_history GROUP BY intent ORDER BY avg_conf DESC;

-- ============================================
-- CLEANUP: Delete old chat history (optional)
-- ============================================
-- Uncomment this if you want to auto-delete chats older than 90 days
-- You can run this as a scheduled task using Supabase Edge Functions or pg_cron

-- DELETE FROM chat_history WHERE created_at < NOW() - INTERVAL '90 days';
