import { createClient } from '@supabase/supabase-js'
import { expect, test } from '@playwright/test'
import { E2E_EMAIL, E2E_PASSWORD, E2E_TRIP_PREFIX } from './fixture'

test('serializes concurrent city creation for one trip', async ({ page }, testInfo) => {
  void page
  test.skip(testInfo.project.name !== 'chromium', 'Database concurrency runs once')

  const url = process.env.VITE_SUPABASE_URL ?? process.env.API_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Local Supabase client credentials are missing')

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: authError } = await client.auth.signInWithPassword({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
  })
  if (authError) throw authError

  const title = `${E2E_TRIP_PREFIX}concurrency-${Date.now()}`
  const { data: trip, error: tripError } = await client.rpc('create_trip_with_cities', {
    title,
    cover_path: '',
    start_date: '2026-08-24',
    end_date: '2026-08-24',
    created_by: '我',
    cities_json: [],
  })
  if (tripError) throw tripError

  const createRecord = (note: string) =>
    client.rpc('create_record', {
      id: crypto.randomUUID(),
      trip_id: trip.id,
      city_name: '并发测试城',
      lat: 30.2741,
      lng: 120.1551,
      image_path: '',
      note,
      author: '我',
      entry_type: 'note',
      record_date: '2026-08-24',
    })

  const results = await Promise.all([createRecord('并发记录 A'), createRecord('并发记录 B')])
  for (const result of results) expect(result.error).toBeNull()

  const { data: cities, error: citiesError } = await client
    .from('trip_cities')
    .select('id, city_name')
    .eq('trip_id', trip.id)
    .eq('city_name', '并发测试城')
  if (citiesError) throw citiesError
  expect(cities).toHaveLength(1)

  const { error: deleteError } = await client.from('trips').delete().eq('id', trip.id)
  expect(deleteError).toBeNull()
  await client.auth.signOut()
})
