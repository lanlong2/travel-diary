import { createClient } from '@supabase/supabase-js'

export function createLocalAdminClient() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.API_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Local Supabase E2E credentials are missing. Export API_URL and SERVICE_ROLE_KEY from `supabase status -o env`.',
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
