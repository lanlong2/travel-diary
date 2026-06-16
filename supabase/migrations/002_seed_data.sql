-- ============================================
-- 种子数据：自动确认用户 + 添加示例旅行和照片
-- 请在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 自动确认共享账号（跳过邮箱验证）
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email = 'us@journey.app';

-- 2. 川西环线
INSERT INTO trips (id, title, cover_photo, start_date, end_date, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '川西环线',
  NULL,
  '2025-09-15',
  '2025-09-25',
  '我'
);

INSERT INTO trip_cities (trip_id, city_name, lat, lng, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', '成都', 30.5728, 104.0668, 0),
  ('00000000-0000-0000-0000-000000000001', '康定', 30.0553, 101.9648, 1),
  ('00000000-0000-0000-0000-000000000001', '新都桥', 30.0574, 101.4988, 2),
  ('00000000-0000-0000-0000-000000000001', '稻城亚丁', 28.5100, 100.3844, 3),
  ('00000000-0000-0000-0000-000000000001', '色达', 32.2681, 100.3325, 4);

INSERT INTO photos (trip_id, city_name, image_url, note, author) VALUES
  ('00000000-0000-0000-0000-000000000001', '成都', 'https://images.unsplash.com/photo-1609953911797-5b98c890e964?w=600&h=600&fit=crop', '在宽窄巷子吃了火锅，辣得她直喝水 😂', '她'),
  ('00000000-0000-0000-0000-000000000001', '康定', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', '跑马溜溜的山上～第一次看到雪山', '我'),
  ('00000000-0000-0000-0000-000000000001', '新都桥', 'https://images.unsplash.com/photo-1508923567004-3a6b8004f276?w=600&h=600&fit=crop', '摄影师的天堂，金秋十月太美了', '我'),
  ('00000000-0000-0000-0000-000000000001', '稻城亚丁', 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=600&h=600&fit=crop', '牛奶海！虽然高反但值了 💙', '她'),
  ('00000000-0000-0000-0000-000000000001', '色达', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=600&fit=crop', '满山红房子，她说像另一个世界', '我'),
  ('00000000-0000-0000-0000-000000000001', '成都', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&h=600&fit=crop', '回来又吃火锅，圆满结束 🍲', '她');

-- 3. 云南之旅
INSERT INTO trips (id, title, cover_photo, start_date, end_date, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '云南漫游记',
  NULL,
  '2025-07-01',
  '2025-07-10',
  '她'
);

INSERT INTO trip_cities (trip_id, city_name, lat, lng, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000002', '昆明', 25.0389, 102.7183, 0),
  ('00000000-0000-0000-0000-000000000002', '大理', 25.5895, 100.2259, 1),
  ('00000000-0000-0000-0000-000000000002', '丽江', 26.8721, 100.2299, 2),
  ('00000000-0000-0000-0000-000000000002', '香格里拉', 27.8256, 99.7018, 3);

INSERT INTO photos (trip_id, city_name, image_url, note, author) VALUES
  ('00000000-0000-0000-0000-000000000002', '大理', 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=600&fit=crop', '洱海边的日落，我们会再来', '她'),
  ('00000000-0000-0000-0000-000000000002', '丽江', 'https://images.unsplash.com/photo-1528169627845-4e338b7b45d0?w=600&h=600&fit=crop', '古城里的咖啡馆，坐了一下午', '我'),
  ('00000000-0000-0000-0000-000000000002', '香格里拉', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', '普达措国家公园，像仙境一样', '她'),
  ('00000000-0000-0000-0000-000000000002', '昆明', 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&h=600&fit=crop', '滇池喂海鸥，她开心得像个孩子', '我');

-- 4. 青岛周末
INSERT INTO trips (id, title, cover_photo, start_date, end_date, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '青岛看海',
  NULL,
  '2026-04-01',
  '2026-04-03',
  '我'
);

INSERT INTO trip_cities (trip_id, city_name, lat, lng, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000003', '青岛', 36.0671, 120.3826, 0);

INSERT INTO photos (trip_id, city_name, image_url, note, author) VALUES
  ('00000000-0000-0000-0000-000000000003', '青岛', 'https://images.unsplash.com/photo-1559827291-baf8cf16d4ea?w=600&h=600&fit=crop', '栈桥的风好大，但啤酒好好喝 🍺', '我'),
  ('00000000-0000-0000-0000-000000000003', '青岛', 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&h=600&fit=crop', '八大关的红瓦绿树，假装在欧洲', '她');

-- 5. 北京周末游（最近）
INSERT INTO trips (id, title, cover_photo, start_date, end_date, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '北京周末游',
  NULL,
  '2026-05-20',
  '2026-05-22',
  '她'
);

INSERT INTO trip_cities (trip_id, city_name, lat, lng, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000004', '北京', 39.9042, 116.4074, 0);

INSERT INTO photos (trip_id, city_name, image_url, note, author) VALUES
  ('00000000-0000-0000-0000-000000000004', '北京', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=600&fit=crop', '故宫600年，和你一起走过 💕', '她'),
  ('00000000-0000-0000-0000-000000000004', '北京', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=600&fit=crop', '长城！她说不累其实已经喘了 😂', '我'),
  ('00000000-0000-0000-0000-000000000004', '北京', 'https://images.unsplash.com/photo-1559084739-e7950961cb39?w=600&h=600&fit=crop', '烤鸭！她吃了半只', '她');
