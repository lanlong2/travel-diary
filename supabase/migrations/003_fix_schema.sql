-- ============================================
-- 修复 schema：支持纯文字记录
-- ============================================

-- 1. image_url 允许 NULL（纯文字记录不需要图片）
ALTER TABLE photos ALTER COLUMN image_url DROP NOT NULL;

-- 2. 添加 entry_type 列区分照片 / 纯文字
ALTER TABLE photos ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'photo' CHECK (entry_type IN ('photo', 'note'));
