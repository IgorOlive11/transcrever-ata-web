import { useRef, useState } from 'react'
import { Upload, FileAudio, X } from 'lucide-react'
import clsx from 'clsx'

const ACCEPTED = '.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac,.mp4'
const MAX_MB = 500

export default function AudioUploader({ file, onFileSelect, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    const allowed = ['mp3','wav','m4a','aac','ogg','webm','flac','mp4']
    if (!allowed.includes(ext)) {
      alert('Formato não suportado. Use: MP3, WAV, M4A, AAC, OGG, WEBM, FLAC ou MP4.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo: ${MAX_MB}MB`)
      return
    }
    onFileSelect(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    handleFile(e.dataTransfer.files[0])
  }

  const sizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : 0

  return (
    <div className="space-y-3">
      <label className="label">Arquivo de Áudio</label>

      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
        className={clsx(
          'relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer',
          dragging && !disabled ? 'border-gold-400 bg-gold-400/5' : 'border-ink-600 hover:border-ink-500',
          file ? 'p-4' : 'p-10',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        {file ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
              <FileAudio className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-paper-100 truncate">{file.name}</p>
              <p className="text-xs text-ink-500 mt-0.5">{sizeMB} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFileSelect(null) }}
              className="p-1.5 rounded-lg hover:bg-ink-700 text-ink-500 hover:text-paper-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
              <Upload className="w-5 h-5 text-ink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-paper-200">
                Arraste um arquivo ou <span className="text-gold-400">clique para selecionar</span>
              </p>
              <p className="text-xs text-ink-500 mt-1">MP3, WAV, M4A, AAC, OGG, WEBM, FLAC, MP4 · Máx {MAX_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
