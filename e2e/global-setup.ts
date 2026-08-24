import { E2E_EMAIL, E2E_PASSWORD, E2E_TRIP_PREFIX } from './fixture'
import { createLocalAdminClient } from './supabase-admin'

export default async function globalSetup() {
  const admin = createLocalAdminClient()
  const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listError) throw listError

  let user = usersPage.users.find((candidate) => candidate.email === E2E_EMAIL)
  if (user) {
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: E2E_PASSWORD,
      email_confirm: true,
    })
    if (error) throw error
    user = data.user
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      email_confirm: true,
    })
    if (error) throw error
    user = data.user
  }

  const { error: memberError } = await admin
    .from('diary_members')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
  if (memberError) throw memberError

  const { error: cleanupError } = await admin
    .from('trips')
    .delete()
    .like('title', `${E2E_TRIP_PREFIX}%`)
  if (cleanupError) throw cleanupError
}
