-- Migration to update Academy Courses with new video-based curriculum
-- Run this in your Supabase SQL Editor

-- 1. Insert/Update Courses
INSERT INTO public.courses (id, title, description, level, icon, xp_reward, total_lessons, estimated_time)
VALUES 
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'GSE & Stock Market Fundamentals', 'Master the architecture of the Ghana Stock Exchange and starting your investment journey.', 'Foundational', 'Globe', 1000, 7, '2h 30m'),
('b7e2a9e3-2e4a-4e8b-9d6c-7f5a1b2c3d4e', 'Investment Apps & Digital Tools', 'Navigate the digital landscape of Ghanaian investment platforms.', 'Foundational', 'Smartphone', 800, 4, '1h 45m'),
('a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d', 'Mutual Funds & ETFs', 'Diversify your wealth through professionally managed funds and indices.', 'Professional', 'BrainCircuit', 1200, 4, '2h 15m'),
('f1e2d3c4-b5a6-4987-9abc-0d1e2f3a4b5c', 'Portfolio Management & Strategy', 'Advanced frameworks for risk management and long-term hold strategies.', 'Advanced', 'Shield', 2000, 4, '2h 00m')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  icon = EXCLUDED.icon,
  xp_reward = EXCLUDED.xp_reward,
  total_lessons = EXCLUDED.total_lessons,
  estimated_time = EXCLUDED.estimated_time;

-- Optional: Clean up old dummy courses if they aren't being used
DELETE FROM public.courses 
WHERE id NOT IN (
  'd290f1ee-6c54-4b01-90e6-d701748f0851',
  'b7e2a9e3-2e4a-4e8b-9d6c-7f5a1b2c3d4e',
  'a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d',
  'f1e2d3c4-b5a6-4987-9abc-0d1e2f3a4b5c'
);
