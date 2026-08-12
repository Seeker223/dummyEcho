export function resolveEchoId(user) {
  const value =
    user?.submission_key ||
    user?.echo_id ||
    user?.echoId ||
    user?.submissionKey ||
    ''

  if (value) return String(value).trim()

  const fallback = String(user?.id || '').trim()
  return fallback ? `EE_${fallback.slice(0, 8).toUpperCase()}` : 'No ID assigned'
}

