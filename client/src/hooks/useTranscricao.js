import { useState, useCallback } from 'react'
import { fetchSSE } from '../utils/sse'

export function useTranscricao() {
  const [status, setStatus] = useState('idle') // idle | transcribing | done | error
  const [progress, setProgress] = useState('')
  const [text, setText] = useState('')
  const [wordData, setWordData] = useState(null)
  const [error, setError] = useState(null)

  const transcrever = useCallback(async (file) => {
    setStatus('transcribing')
    setProgress('Enviando arquivo...')
    setError(null)
    setText('')
    setWordData(null)

    const formData = new FormData()
    formData.append('audio', file)

    try {
      await fetchSSE(
        '/api/transcricao/transcrever',
        { method: 'POST', body: formData },
        (event, data) => {
          if (event === 'progress') {
            setProgress(data.message || '')
          } else if (event === 'text_chunk') {
            setText(data.text || '')
          } else if (event === 'full_data') {
            setWordData(data)
            setText(data.text || '')
          } else if (event === 'done') {
            setStatus('done')
            setProgress('')
          } else if (event === 'error') {
            throw new Error(data.message || 'Erro na transcrição')
          }
        }
      )
    } catch (err) {
      setStatus('error')
      setError(err.message)
      setProgress('')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress('')
    setText('')
    setWordData(null)
    setError(null)
  }, [])

  return { status, progress, text, wordData, error, transcrever, reset, setText }
}

export function useGerarAta() {
  const [status, setStatus] = useState('idle') // idle | gerando | done | error
  const [progress, setProgress] = useState('')
  const [ataTexto, setAtaTexto] = useState('')
  const [error, setError] = useState(null)

  const gerar = useCallback(async (transcricao, infoAssembleia) => {
    setStatus('gerando')
    setProgress('Iniciando geração...')
    setError(null)
    setAtaTexto('')

    try {
      await fetchSSE(
        '/api/ata/gerar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcricao, info_assembleia: infoAssembleia }),
        },
        (event, data) => {
          if (event === 'progress') {
            setProgress(data.message || '')
          } else if (event === 'done') {
            setAtaTexto(data.ata || '')
            setStatus('done')
            setProgress('')
          } else if (event === 'error') {
            throw new Error(data.message || 'Erro ao gerar ata')
          }
        }
      )
    } catch (err) {
      setStatus('error')
      setError(err.message)
      setProgress('')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress('')
    setAtaTexto('')
    setError(null)
  }, [])

  return { status, progress, ataTexto, error, gerar, reset, setAtaTexto }
}
