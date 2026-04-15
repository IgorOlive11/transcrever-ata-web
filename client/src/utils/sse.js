/**
 * parseSSE - fetch + parse SSE stream
 * onEvent(eventName, data) called for each event
 * Returns a promise that resolves when stream ends
 */
export async function fetchSSE(url, options, onEvent) {
  const res = await fetch(url, options)

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

    // Split into lines
    const lines = buffer.split('\n')
    buffer = lines.pop() // incomplete last line stays in buffer

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
