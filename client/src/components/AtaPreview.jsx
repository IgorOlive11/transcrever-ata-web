import { useState } from 'react'
import { Download, Loader2, Eye, Code2 } from 'lucide-react'
import { API_URL } from '../utils/api'

// Renderizar markdown básico (**negrito**) para HTML visual
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>')
}

export default function AtaPreview({ ataTexto, infoAssembleia, onChange }) {
  const [mode, setMode] = useState('preview') // preview | raw
  const [downloading, setDownloading] = useState(false)

  const downloadDocx = async () => {
    setDownloading(true)
    try {
      const res = await fetch('${API_URL}/api/ata/download-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ata_texto: ataTexto, info_assembleia: infoAssembleia }),
      })
      if (!res.ok) throw new Error('Erro ao gerar DOCX')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const nome = infoAssembleia?.nome_condominio || 'condominio'
      const data = infoAssembleia?.data_assembleia || 'data'
      const nomeLimpo = nome.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_').slice(0,30).toLowerCase()
      const dataLimpa = data.replace(/\//g, '_')
      a.download = `ata_${nomeLimpo}_${dataLimpa}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro ao baixar: ' + err.message)
    }
    setDownloading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-t-xl border-b-0">
        <div className="flex items-center gap-1 bg-ink-900 rounded-lg p-1">
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'preview'
                ? 'bg-ink-700 text-paper-100'
                : 'text-ink-500 hover:text-paper-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            Visualizar
          </button>
          <button
            onClick={() => setMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'raw'
                ? 'bg-ink-700 text-paper-100'
                : 'text-ink-500 hover:text-paper-200'
            }`}
          >
            <Code2 className="w-3 h-3" />
            Texto
          </button>
        </div>

        <button
          onClick={downloadDocx}
          disabled={downloading || !ataTexto}
          className="btn-primary text-xs py-2 px-4"
        >
          {downloading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando DOCX...</>
            : <><Download className="w-3.5 h-3.5" /> Baixar .docx</>
          }
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-ink-800 border border-ink-600 rounded-b-xl overflow-hidden">
        {mode === 'preview' ? (
          <div
            className="h-full overflow-y-auto px-8 py-6 text-paper-100 font-body text-sm leading-relaxed"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            {/* Cabeçalho da ata */}
            {infoAssembleia && (
              <div className="text-center mb-6 pb-6 border-b border-ink-700">
                <p className="font-bold text-base text-paper-50 uppercase tracking-wide">
                  {infoAssembleia.nome_condominio}
                </p>
                <p className="font-bold text-sm text-paper-200 mt-1 uppercase">
                  ATA DA ASSEMBLEIA GERAL {infoAssembleia.tipo_assembleia} REALIZADA EM {infoAssembleia.data_assembleia}
                </p>
              </div>
            )}

            {/* Corpo */}
            <div
              className="text-justify space-y-4 leading-7"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-4">${renderMarkdown(ataTexto)}</p>`
              }}
            />

            {/* Assinaturas */}
            {infoAssembleia && (
              <div className="flex justify-between mt-12 pt-6 border-t border-ink-700 text-sm font-medium">
                <span>{infoAssembleia.presidente_nome}</span>
                <span>{infoAssembleia.secretario_nome}</span>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={ataTexto}
            onChange={e => onChange?.(e.target.value)}
            className="w-full h-full bg-transparent px-4 py-4 text-paper-100 font-mono text-xs
                       leading-relaxed resize-none focus:outline-none"
          />
        )}
      </div>
    </div>
  )
}
