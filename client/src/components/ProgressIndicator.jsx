import { Loader2 } from 'lucide-react'

export default function ProgressIndicator({ message, visible }) {
  if (!visible) return null
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-ink-800 border border-ink-600 rounded-xl text-sm text-paper-200 font-body">
      <Loader2 className="w-4 h-4 animate-spin text-gold-400 flex-shrink-0" />
      <span className="animate-pulse-soft">{message || 'Processando...'}</span>
    </div>
  )
}
