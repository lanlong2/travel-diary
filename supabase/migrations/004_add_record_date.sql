-- ============================================
-- 支持自定义记录日期 + 编辑记录
-- ============================================

-- 1. 添加 record_date 列
ALTER TABLE photos ADD COLUMN IF NOT EXISTS record_date DATE;

-- 2. 确保 UPDATE 策略存在（001 已有，如果缺失则补充）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'photos_update' AND tablename = 'photos'
  ) THEN
    CREATE POLICY "photos_update" ON photos FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;
