-- Harden the shared diary data model and keep the private photo bucket usable.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trips_date_order_check'
      AND conrelid = 'public.trips'::regclass
  ) THEN
    ALTER TABLE public.trips
      ADD CONSTRAINT trips_date_order_check CHECK (end_date >= start_date);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_shared_diary_member()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((SELECT auth.jwt() ->> 'email') = 'us@journey.app', false);
$$;

REVOKE ALL ON FUNCTION public.is_shared_diary_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_shared_diary_member() TO authenticated;

DROP POLICY IF EXISTS "trips_select" ON public.trips;
DROP POLICY IF EXISTS "trips_insert" ON public.trips;
DROP POLICY IF EXISTS "trips_update" ON public.trips;
DROP POLICY IF EXISTS "trips_delete" ON public.trips;
DROP POLICY IF EXISTS "trip_cities_select" ON public.trip_cities;
DROP POLICY IF EXISTS "trip_cities_insert" ON public.trip_cities;
DROP POLICY IF EXISTS "trip_cities_update" ON public.trip_cities;
DROP POLICY IF EXISTS "trip_cities_delete" ON public.trip_cities;
DROP POLICY IF EXISTS "photos_select" ON public.photos;
DROP POLICY IF EXISTS "photos_insert" ON public.photos;
DROP POLICY IF EXISTS "photos_update" ON public.photos;
DROP POLICY IF EXISTS "photos_delete" ON public.photos;

CREATE POLICY "trips_select" ON public.trips
  FOR SELECT TO authenticated
  USING (public.is_shared_diary_member());
CREATE POLICY "trips_insert" ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "trips_update" ON public.trips
  FOR UPDATE TO authenticated
  USING (public.is_shared_diary_member())
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "trips_delete" ON public.trips
  FOR DELETE TO authenticated
  USING (public.is_shared_diary_member());

CREATE POLICY "trip_cities_select" ON public.trip_cities
  FOR SELECT TO authenticated
  USING (public.is_shared_diary_member());
CREATE POLICY "trip_cities_insert" ON public.trip_cities
  FOR INSERT TO authenticated
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "trip_cities_update" ON public.trip_cities
  FOR UPDATE TO authenticated
  USING (public.is_shared_diary_member())
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "trip_cities_delete" ON public.trip_cities
  FOR DELETE TO authenticated
  USING (public.is_shared_diary_member());

CREATE POLICY "photos_select" ON public.photos
  FOR SELECT TO authenticated
  USING (public.is_shared_diary_member());
CREATE POLICY "photos_insert" ON public.photos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "photos_update" ON public.photos
  FOR UPDATE TO authenticated
  USING (public.is_shared_diary_member())
  WITH CHECK (public.is_shared_diary_member());
CREATE POLICY "photos_delete" ON public.photos
  FOR DELETE TO authenticated
  USING (public.is_shared_diary_member());

UPDATE storage.buckets
SET public = false
WHERE id = 'photos';

DROP POLICY IF EXISTS "storage_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;

CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_shared_diary_member()
  );
CREATE POLICY "storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND name LIKE 'trips/%'
    AND public.is_shared_diary_member()
  );
CREATE POLICY "storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_shared_diary_member()
  )
  WITH CHECK (
    bucket_id = 'photos'
    AND name LIKE 'trips/%'
    AND public.is_shared_diary_member()
  );
CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'photos'
    AND public.is_shared_diary_member()
  );

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_cities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
