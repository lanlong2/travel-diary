-- Data-preserving hardening for the shared travel diary.
-- This migration is intentionally backward compatible with the pre-refactor client.

create table if not exists public.diary_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.diary_members (user_id)
select id
from auth.users
where email in ('love@qq.cl', 'test@qq.com')
on conflict (user_id) do nothing;

-- Normalize only URLs that point to objects known to exist in this project's private bucket.
update public.photos as photo
set image_url = regexp_replace(
  photo.image_url,
  '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/',
  ''
)
where photo.image_url ~ '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/'
  and exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'photos'
      and object.name = regexp_replace(
        photo.image_url,
        '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/',
        ''
      )
  );

update public.trips as trip
set cover_photo = regexp_replace(
  trip.cover_photo,
  '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/',
  ''
)
where trip.cover_photo ~ '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/'
  and exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'photos'
      and object.name = regexp_replace(
        trip.cover_photo,
        '^https://tivsegprbxjrbjsbjxmi\.supabase\.co/storage/v1/object/public/photos/',
        ''
      )
  );

update public.photos
set record_date = (created_at at time zone 'Asia/Shanghai')::date
where record_date is null;

update public.trips set title = btrim(title);
update public.trip_cities set city_name = btrim(city_name);
update public.photos set city_name = btrim(city_name);

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'trips_title_not_blank'
      and conrelid = 'public.trips'::regclass
  ) then
    alter table public.trips
      add constraint trips_title_not_blank check (btrim(title) <> '') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'trip_cities_city_name_not_blank'
      and conrelid = 'public.trip_cities'::regclass
  ) then
    alter table public.trip_cities
      add constraint trip_cities_city_name_not_blank check (btrim(city_name) <> '') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'trip_cities_latitude_range'
      and conrelid = 'public.trip_cities'::regclass
  ) then
    alter table public.trip_cities
      add constraint trip_cities_latitude_range check (lat between -90 and 90) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'trip_cities_longitude_range'
      and conrelid = 'public.trip_cities'::regclass
  ) then
    alter table public.trip_cities
      add constraint trip_cities_longitude_range check (lng between -180 and 180) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'trip_cities_sort_order_nonnegative'
      and conrelid = 'public.trip_cities'::regclass
  ) then
    alter table public.trip_cities
      add constraint trip_cities_sort_order_nonnegative check (sort_order >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'photos_city_name_not_blank'
      and conrelid = 'public.photos'::regclass
  ) then
    alter table public.photos
      add constraint photos_city_name_not_blank check (btrim(city_name) <> '') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'photos_entry_content_consistent'
      and conrelid = 'public.photos'::regclass
  ) then
    alter table public.photos
      add constraint photos_entry_content_consistent check (
        (
          entry_type = 'photo'
          and image_url is not null
          and btrim(image_url) <> ''
        )
        or (
          entry_type = 'note'
          and image_url is null
          and btrim(note) <> ''
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'trip_cities_trip_city_unique'
      and conrelid = 'public.trip_cities'::regclass
  ) then
    alter table public.trip_cities
      add constraint trip_cities_trip_city_unique unique (trip_id, city_name);
  end if;
end
$constraints$;

alter table public.trips validate constraint trips_title_not_blank;
alter table public.trip_cities validate constraint trip_cities_city_name_not_blank;
alter table public.trip_cities validate constraint trip_cities_latitude_range;
alter table public.trip_cities validate constraint trip_cities_longitude_range;
alter table public.trip_cities validate constraint trip_cities_sort_order_nonnegative;
alter table public.photos validate constraint photos_city_name_not_blank;
alter table public.photos validate constraint photos_entry_content_consistent;

create index if not exists trips_start_date_id_idx
  on public.trips (start_date desc, id);
create index if not exists trip_cities_trip_sort_id_idx
  on public.trip_cities (trip_id, sort_order, id);
create index if not exists photos_trip_record_created_id_idx
  on public.photos (trip_id, record_date desc nulls last, created_at desc, id);
create index if not exists photos_record_created_id_idx
  on public.photos (record_date desc nulls last, created_at desc, id);

alter table public.trips enable row level security;
alter table public.trip_cities enable row level security;
alter table public.photos enable row level security;
alter table public.diary_members enable row level security;
alter table public.trips force row level security;
alter table public.trip_cities force row level security;
alter table public.photos force row level security;
alter table public.diary_members force row level security;

drop policy if exists "diary_members_select_own" on public.diary_members;
create policy "diary_members_select_own"
  on public.diary_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "trips_select" on public.trips;
drop policy if exists "trips_insert" on public.trips;
drop policy if exists "trips_update" on public.trips;
drop policy if exists "trips_delete" on public.trips;
drop policy if exists "trip_cities_select" on public.trip_cities;
drop policy if exists "trip_cities_insert" on public.trip_cities;
drop policy if exists "trip_cities_update" on public.trip_cities;
drop policy if exists "trip_cities_delete" on public.trip_cities;
drop policy if exists "photos_select" on public.photos;
drop policy if exists "photos_insert" on public.photos;
drop policy if exists "photos_update" on public.photos;
drop policy if exists "photos_delete" on public.photos;

create policy "trips_select" on public.trips
  for select to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trips_insert" on public.trips
  for insert to authenticated
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trips_update" on public.trips
  for update to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )))
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trips_delete" on public.trips
  for delete to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));

create policy "trip_cities_select" on public.trip_cities
  for select to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trip_cities_insert" on public.trip_cities
  for insert to authenticated
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trip_cities_update" on public.trip_cities
  for update to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )))
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "trip_cities_delete" on public.trip_cities
  for delete to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));

create policy "photos_select" on public.photos
  for select to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "photos_insert" on public.photos
  for insert to authenticated
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "photos_update" on public.photos
  for update to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )))
  with check ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));
create policy "photos_delete" on public.photos
  for delete to authenticated
  using ((select exists (
    select 1 from public.diary_members as member
    where member.user_id = (select auth.uid())
  )));

revoke all privileges
  on table public.trips, public.trip_cities, public.photos
  from public, anon, authenticated;
revoke all privileges
  on table public.diary_members
  from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.trips to authenticated;
grant select, insert, update, delete on table public.trip_cities to authenticated;
grant select, insert, update, delete on table public.photos to authenticated;
grant select on table public.diary_members to authenticated;
grant usage on schema public to service_role;
grant all privileges on table public.trips to service_role;
grant all privileges on table public.trip_cities to service_role;
grant all privileges on table public.photos to service_role;
grant all privileges on table public.diary_members to service_role;

update storage.buckets
set public = false,
    file_size_limit = 15728640,
    allowed_mime_types = array[
      'image/avif',
      'image/gif',
      'image/heic',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]::text[]
where id = 'photos';

drop policy if exists "storage_select" on storage.objects;
drop policy if exists "storage_insert" on storage.objects;
drop policy if exists "storage_update" on storage.objects;
drop policy if exists "storage_delete" on storage.objects;

create policy "storage_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'photos'
    and (select exists (
      select 1 from public.diary_members as member
      where member.user_id = (select auth.uid())
    ))
  );

create policy "storage_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (select exists (
      select 1 from public.diary_members as member
      where member.user_id = (select auth.uid())
    ))
    and case
      when name ~* '^trips/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(avif|gif|heic|jpe?g|png|webp)$'
      then exists (
        select 1
        from public.trips as trip
        where trip.id = split_part(name, '/', 2)::uuid
      )
      else false
    end
  );

create policy "storage_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and (select exists (
      select 1 from public.diary_members as member
      where member.user_id = (select auth.uid())
    ))
  );

create or replace function public.create_trip_with_cities(
  title text,
  cover_path text,
  start_date date,
  end_date date,
  created_by text,
  cities_json jsonb
)
returns public.trips
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  created_trip public.trips;
begin
  if jsonb_typeof(coalesce(cities_json, '[]'::jsonb)) <> 'array' then
    raise exception 'cities_json must be a JSON array'
      using errcode = '22023';
  end if;

  insert into public.trips (
    title,
    cover_photo,
    start_date,
    end_date,
    created_by
  )
  values (
    btrim(title),
    nullif(btrim(cover_path), ''),
    start_date,
    end_date,
    created_by
  )
  returning * into created_trip;

  insert into public.trip_cities (
    trip_id,
    city_name,
    lat,
    lng,
    sort_order
  )
  select
    created_trip.id,
    btrim(city ->> 'city_name'),
    (city ->> 'lat')::double precision,
    (city ->> 'lng')::double precision,
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(cities_json, '[]'::jsonb))
    with ordinality as item(city, ordinality);

  return created_trip;
end
$function$;

create or replace function public.create_record(
  id uuid,
  trip_id uuid,
  city_name text,
  lat double precision,
  lng double precision,
  image_path text,
  note text,
  author text,
  entry_type text,
  record_date date
)
returns public.photos
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  created_record public.photos;
  normalized_city text := btrim(city_name);
  normalized_image_path text := nullif(btrim(image_path), '');
begin
  if record_date is null then
    raise exception 'record_date is required'
      using errcode = '23502';
  end if;

  if entry_type = 'photo' then
    if normalized_image_path is null
      or normalized_image_path !~* format(
        '^trips/%s/%s\.(avif|gif|heic|jpe?g|png|webp)$',
        trip_id,
        id
      )
    then
      raise exception 'photo path must match its trip and record id'
        using errcode = '23514';
    end if;

    if not exists (
      select 1
      from storage.objects as object
      where object.bucket_id = 'photos'
        and object.name = normalized_image_path
    ) then
      raise exception 'photo object does not exist'
        using errcode = '23503';
    end if;
  elsif entry_type = 'note' and normalized_image_path is not null then
    raise exception 'note records cannot reference an image'
      using errcode = '23514';
  end if;

  perform 1
  from public.trips as trip
  where trip.id = create_record.trip_id
  for update;

  if not found then
    raise exception 'trip not found'
      using errcode = 'P0002';
  end if;

  insert into public.trip_cities (
    trip_id,
    city_name,
    lat,
    lng,
    sort_order
  )
  values (
    trip_id,
    normalized_city,
    lat,
    lng,
    (
      select coalesce(max(city.sort_order), -1) + 1
      from public.trip_cities as city
      where city.trip_id = create_record.trip_id
    )
  )
  on conflict on constraint trip_cities_trip_city_unique do nothing;

  insert into public.photos (
    id,
    trip_id,
    city_name,
    image_url,
    note,
    author,
    entry_type,
    record_date
  )
  values (
    id,
    trip_id,
    normalized_city,
    normalized_image_path,
    coalesce(note, ''),
    author,
    entry_type,
    record_date
  )
  returning * into created_record;

  if entry_type = 'photo' and normalized_image_path is not null then
    update public.trips as trip
    set cover_photo = normalized_image_path
    where trip.id = create_record.trip_id
      and trip.cover_photo is null;
  end if;

  return created_record;
end
$function$;

revoke all on function public.create_trip_with_cities(
  text, text, date, date, text, jsonb
) from public, anon;
grant execute on function public.create_trip_with_cities(
  text, text, date, date, text, jsonb
) to authenticated;

revoke all on function public.create_record(
  uuid, uuid, text, double precision, double precision,
  text, text, text, text, date
) from public, anon;
grant execute on function public.create_record(
  uuid, uuid, text, double precision, double precision,
  text, text, text, text, date
) to authenticated;

drop function if exists public.is_shared_diary_member();
