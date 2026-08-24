import { E2E_EMAIL, E2E_TRIP_PREFIX } from './fixture'
import { createLocalAdminClient } from './supabase-admin'

export default async function globalTeardown() {
  const admin = createLocalAdminClient()

  const { error: cleanupError } = await admin
    .from('trips')
    .delete()
    .like('title', `${E2E_TRIP_PREFIX}%`)
  if (cleanupError) throw cleanupError

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  const user = data.users.find((candidate) => candidate.email === E2E_EMAIL)
  if (user) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError
  }
}
