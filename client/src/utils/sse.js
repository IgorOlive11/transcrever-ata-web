import { supabase } from '../lib/supabase'

export async function fetchSSE(url, options, onEvent) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); msg = j.error || msg } catch {}
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = 'message'

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) {
        currentEvent = 'message'
        continue
      }
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7)
      } else if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          onEvent(currentEvent, data)
        } catch {
          onEvent(currentEvent, { raw: line.slice(6) })
        }
        currentEvent = 'message'
      }
    }
  }
}