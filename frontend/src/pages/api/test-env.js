export default function handler(req, res) {
  res.status(200).json({
    url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    key2: Boolean(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY),
    envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}
