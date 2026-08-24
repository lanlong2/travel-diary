-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_photo TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by TEXT NOT NULL CHECK (created_by IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip cities table
CREATE TABLE IF NOT EXISTS public.trip_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  image_url TEXT,
  note TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL CHECK (author IN ('我', '她')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entry_type TEXT NOT NULL DEFAULT 'photo' CHECK (entry_type IN ('photo', 'note'))
);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users full access
CREATE POLICY "trips_select" ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "trips_insert" ON public.trips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trips_update" ON public.trips FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trips_delete" ON public.trips FOR DELETE TO authenticated USING (true);

CREATE POLICY "trip_cities_select" ON public.trip_cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "trip_cities_insert" ON public.trip_cities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trip_cities_update" ON public.trip_cities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trip_cities_delete" ON public.trip_cities FOR DELETE TO authenticated USING (true);

CREATE POLICY "photos_select" ON public.photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_insert" ON public.photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "photos_update" ON public.photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "photos_delete" ON public.photos FOR DELETE TO authenticated USING (true);

-- Storage RLS
CREATE POLICY "storage_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos');
