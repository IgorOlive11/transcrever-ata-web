import { useRef, useEffect } from 'react'
import { FileText, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function TranscriptionEditor({ value, onChange, placeholder, readOnly = false }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0
  const charCount = value ? value.length : 0

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-t-xl border-b-0">
        <div className="flex items-center gap-2 text-xs text-ink-500 font-body">
          <FileText className="w-3.5 h-3.5" />
          <span>{wordCount.toLocaleString()} palavras</span>
          <span className="text-ink-700">·</span>
          <span>{charCount.toLocaleString()} caracteres</span>
        </div>
        <button
          onClick={copy}
          disabled={!value}
          className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <textarea
        value={value}
        onChange={e => !readOnly && onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder || 'Aguardando transcrição...'}
        className="flex-1 w-full bg-ink-800 border border-ink-600 rounded-b-xl px-4 py-4
                   text-paper-100 font-body text-sm leading-relaxed
                   placeholder-ink-600 resize-none
                   focus:outline-none focus:border-ink-500
                   transition-colors duration-200 min-h-[200px]"
        style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
      />
    </div>
  )
}
