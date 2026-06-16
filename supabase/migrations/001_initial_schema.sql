-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_photo TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by TEXT NOT NULL CHECK (created_by IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip cities table
CREATE TABLE IF NOT EXISTS trip_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL CHECK (author IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users full access
CREATE POLICY "trips_select" ON trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "trips_insert" ON trips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trips_update" ON trips FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trips_delete" ON trips FOR DELETE TO authenticated USING (true);

CREATE POLICY "trip_cities_select" ON trip_cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "trip_cities_insert" ON trip_cities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trip_cities_update" ON trip_cities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trip_cities_delete" ON trip_cities FOR DELETE TO authenticated USING (true);

CREATE POLICY "photos_select" ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_insert" ON photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "photos_update" ON photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "photos_delete" ON photos FOR DELETE TO authenticated USING (true);

-- Storage RLS
CREATE POLICY "storage_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos');
