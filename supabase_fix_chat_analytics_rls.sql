-- Fix RLS for chat_analytics VIEW
-- Run this in Supabase SQL Editor after importing the main migration

-- Drop the existing view first
DROP VIEW IF EXISTS chat_analytics;

-- Recreate the view (sama seperti sebelumnya)
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

-- Enable RLS on the view
ALTER VIEW chat_analytics SET (security_invoker = true);

-- Grant select permission to authenticated users (opsional)
-- Uncomment jika Anda ingin authenticated users bisa akses view ini
-- GRANT SELECT ON chat_analytics TO authenticated;

-- Grant select permission to service role (untuk admin)
GRANT SELECT ON chat_analytics TO service_role;

-- NOTES:
-- 1. View "chat_analytics" akan inherit RLS dari table "chat_history"
-- 2. Karena chat_history hanya bisa dilihat oleh admin, maka view ini juga hanya untuk admin
-- 3. "Unrestricted" di Table Editor adalah normal untuk VIEW - tidak masalah
-- 4. Yang penting adalah underlying table (chat_history) sudah ada RLS policy

-- Test query untuk admin:
-- SELECT * FROM chat_analytics LIMIT 10;
