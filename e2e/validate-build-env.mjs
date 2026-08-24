const requiredVariables = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_AMAP_KEY',
  'VITE_AMAP_SECURITY_CODE',
]

const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim())

if (missingVariables.length > 0) {
  throw new Error(`Missing GitHub Pages build variables: ${missingVariables.join(', ')}`)
}
