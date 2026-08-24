begin;

create extension if not exists pgtap with schema extensions;

select plan(27);

select has_table('public', 'diary_members', 'membership table exists');
select ok(
  has_table_privilege('service_role', 'public.diary_members', 'INSERT'),
  'service_role retains membership administration privileges'
);
select has_function(
  'public',
  'create_trip_with_cities',
  array['text', 'text', 'date', 'date', 'text', 'jsonb'],
  'atomic trip RPC exists'
);
select has_function(
  'public',
  'create_record',
  array[
    'uuid',
    'uuid',
    'text',
    'double precision',
    'double precision',
    'text',
    'text',
    'text',
    'text',
    'date'
  ],
  'atomic record RPC exists'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'member@example.test',
    crypt('test-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'outsider@example.test',
    crypt('test-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into public.diary_members (user_id)
values ('11111111-1111-4111-8111-111111111111');

insert into public.trips (
  id,
  title,
  cover_photo,
  start_date,
  end_date,
  created_by
)
values (
  '33333333-3333-4333-8333-333333333333',
  'RLS fixture',
  null,
  '2026-08-01',
  '2026-08-02',
  '我'
);

set local role anon;
select throws_ok(
  'select count(*) from public.trips',
  '42501',
  null,
  'anon has no table privilege'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);
select is(
  (select count(*) from public.trips),
  0::bigint,
  'authenticated non-member cannot read diary rows'
);
select throws_ok(
  $sql$
    insert into public.trips (title, start_date, end_date, created_by)
    values ('blocked', '2026-08-01', '2026-08-02', '我')
  $sql$,
  '42501',
  null,
  'authenticated non-member cannot insert diary rows'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
select is(
  (select count(*) from public.trips where id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'member can read diary rows'
);
select lives_ok(
  $sql$
    select public.create_trip_with_cities(
      'Atomic trip',
      null,
      '2026-08-10',
      '2026-08-12',
      '她',
      '[{"city_name":"杭州","lat":30.2741,"lng":120.1551}]'::jsonb
    )
  $sql$,
  'member can create a trip and its cities atomically'
);
select is(
  (
    select count(*)
    from public.trip_cities as city
    join public.trips as trip on trip.id = city.trip_id
    where trip.title = 'Atomic trip'
      and city.city_name = '杭州'
  ),
  1::bigint,
  'trip RPC inserts the related city'
);

select lives_ok(
  $sql$
    select public.create_record(
      '44444444-4444-4444-8444-444444444444',
      '33333333-3333-4333-8333-333333333333',
      '成都',
      30.5728,
      104.0668,
      null,
      '纯文字测试',
      '我',
      'note',
      '2026-08-01'
    )
  $sql$,
  'member can create a note record atomically'
);
select is(
  (
    select count(*)
    from public.photos
    where id = '44444444-4444-4444-8444-444444444444'
      and image_url is null
      and entry_type = 'note'
  ),
  1::bigint,
  'note record is stored with consistent content'
);
select is(
  (
    select count(*)
    from public.trip_cities
    where trip_id = '33333333-3333-4333-8333-333333333333'
      and city_name = '成都'
  ),
  1::bigint,
  'record RPC inserts a missing city once'
);
select lives_ok(
  $sql$
    select public.create_record(
      '55555555-5555-4555-8555-555555555555',
      '33333333-3333-4333-8333-333333333333',
      '成都',
      30.5728,
      104.0668,
      null,
      '重复城市测试',
      '她',
      'note',
      '2026-08-02'
    )
  $sql$,
  'second record for the same city succeeds'
);
select is(
  (
    select count(*)
    from public.trip_cities
    where trip_id = '33333333-3333-4333-8333-333333333333'
      and city_name = '成都'
  ),
  1::bigint,
  'unique city constraint prevents duplicate city rows'
);
select throws_ok(
  $sql$
    insert into public.photos (
      trip_id,
      city_name,
      image_url,
      note,
      author,
      entry_type,
      record_date
    )
    values (
      '33333333-3333-4333-8333-333333333333',
      '成都',
      null,
      '',
      '我',
      'note',
      '2026-08-01'
    )
  $sql$,
  '23514',
  null,
  'empty note records are rejected'
);
select ok(
  has_table_privilege('authenticated', 'public.diary_members', 'SELECT')
    and not has_table_privilege('authenticated', 'public.diary_members', 'INSERT')
    and not has_table_privilege('anon', 'public.trips', 'SELECT'),
  'least-privilege grants are enforced'
);
select ok(
  not has_table_privilege('authenticated', 'public.trips', 'TRUNCATE')
    and not has_table_privilege('authenticated', 'public.trips', 'REFERENCES')
    and not has_table_privilege('authenticated', 'public.trips', 'TRIGGER')
    and not has_table_privilege('authenticated', 'public.trips', 'MAINTAIN'),
  'authenticated has no table-owner capabilities'
);
select ok(
  (
    select bool_and(relforcerowsecurity)
    from pg_class
    where oid in (
      'public.trips'::regclass,
      'public.trip_cities'::regclass,
      'public.photos'::regclass,
      'public.diary_members'::regclass
    )
  ),
  'all exposed application tables force RLS'
);
select ok(
  (
    select bool_and(
      not procedure.prosecdef
      and coalesce(array_to_string(procedure.proconfig, ',') like '%search_path=%', false)
    )
    from pg_proc as procedure
    where procedure.oid in (
      'public.create_trip_with_cities(text,text,date,date,text,jsonb)'::regprocedure,
      'public.create_record(uuid,uuid,text,double precision,double precision,text,text,text,text,date)'::regprocedure
    )
  ),
  'RPCs are security invoker with a fixed search path'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_record(uuid,uuid,text,double precision,double precision,text,text,text,text,date)',
    'EXECUTE'
  )
    and not has_function_privilege(
      'anon',
      'public.create_record(uuid,uuid,text,double precision,double precision,text,text,text,text,date)',
      'EXECUTE'
    ),
  'only authenticated users can execute record RPC'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);
select throws_ok(
  $sql$
    select public.create_trip_with_cities(
      'blocked RPC',
      null,
      '2026-08-10',
      '2026-08-12',
      '她',
      '[]'::jsonb
    )
  $sql$,
  '42501',
  null,
  'non-member cannot call trip RPC'
);
select throws_ok(
  $sql$
    select public.create_record(
      '66666666-6666-4666-8666-666666666666',
      '33333333-3333-4333-8333-333333333333',
      '成都',
      30.5728,
      104.0668,
      null,
      'blocked RPC',
      '我',
      'note',
      '2026-08-01'
    )
  $sql$,
  'P0002',
  null,
  'non-member cannot call record RPC'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
select throws_ok(
  $sql$
    select public.create_trip_with_cities(
      'must roll back',
      null,
      '2026-08-10',
      '2026-08-12',
      '她',
      '[{"city_name":"invalid","lat":999,"lng":120}]'::jsonb
    )
  $sql$,
  '23514',
  null,
  'invalid city rolls the atomic trip RPC back'
);
select is(
  (select count(*) from public.trips where title = 'must roll back'),
  0::bigint,
  'failed trip RPC leaves no partial trip'
);
select throws_ok(
  $sql$
    select public.create_record(
      '77777777-7777-4777-8777-777777777777',
      '33333333-3333-4333-8333-333333333333',
      '成都',
      30.5728,
      104.0668,
      'trips/33333333-3333-4333-8333-333333333333/not-the-record-id.jpg',
      '',
      '我',
      'photo',
      '2026-08-01'
    )
  $sql$,
  '23514',
  null,
  'record RPC rejects a mismatched photo path'
);
reset role;
select ok(
  (
    select not public
      and file_size_limit = 15728640
      and allowed_mime_types @> array['image/avif', 'image/heic', 'image/jpeg', 'image/png', 'image/webp']::text[]
    from storage.buckets
    where id = 'photos'
  ),
  'photo bucket is private and enforces size and MIME limits'
);

select * from finish();
rollback;
