import { useState } from 'react'
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { API_URL } from '../utils/api'

const TIPOS_ASSEMBLEIA = [
  'EXTRAORDINÁRIA',
  'ORDINÁRIA',
  'ESPECIAL',
]

function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-gold-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function IaButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex-shrink-0 w-9 h-9 rounded-lg bg-ink-700 border border-ink-600
                 hover:border-gold-400/50 hover:bg-ink-600 text-ink-400 hover:text-gold-400
                 transition-all duration-200 flex items-center justify-center
                 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Detectar com IA"
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Sparkles className="w-3.5 h-3.5" />
      }
    </button>
  )
}

export default function AssemblyInfoModal({ transcricao, onConfirm, onCancel }) {
  const today = new Date()
  const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`
  const nowStr = `${String(today.getHours()).padStart(2,'0')}h${String(today.getMinutes()).padStart(2,'0')}`

  const [form, setForm] = useState({
    nome_condominio: 'CONDOMÍNIO MILLENNIUM RESIDENCE',
    endereco_condominio: 'Avenida Engenheiro Valdir Pedro Monachesi, 1.400, Aeroporto, Juiz de Fora/MG',
    tipo_assembleia: 'EXTRAORDINÁRIA',
    data_assembleia: todayStr,
    horario_inicio: '19h30',
    horario_encerramento: '21h30',
    presidente_nome: '',
    presidente_apartamento: '',
    secretario_nome: '',
    secretario_apartamento: '',
    numero_presentes: '20',
    local_realizacao: 'pelo Zoom dentro do aplicativo Condomob condomínios',
    pautas_texto: 'Retificação do planejamento orçamentário aprovado na AGO',
  })

  const [iaLoading, setIaLoading] = useState({})
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const detectarIA = async (campo) => {
    if (!transcricao?.trim()) return alert('Nenhuma transcrição disponível para detecção por IA.')
    setIaLoading(prev => ({ ...prev, [campo]: true }))
    try {
      const res = await fetch('${API_URL}/api/ia/detectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campo, transcricao }),
      })
      const data = await res.json()
      if (data.resultado) {
        if (campo === 'nome_condominio') set('nome_condominio', data.resultado)
        if (campo === 'pautas') set('pautas_texto', data.resultado)
      }
    } catch {}
    setIaLoading(prev => ({ ...prev, [campo]: false }))
  }

  const validate = () => {
    const e = {}
    if (!form.nome_condominio.trim()) e.nome_condominio = 'Obrigatório'
    if (!form.presidente_nome.trim()) e.presidente_nome = 'Obrigatório'
    if (!form.secretario_nome.trim()) e.secretario_nome = 'Obrigatório'
    if (!form.data_assembleia.trim()) e.data_assembleia = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const pautas = form.pautas_texto
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
    onConfirm({
      ...form,
      pautas,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-ink-900 border border-ink-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-800">
          <div>
            <h2 className="font-display text-xl font-semibold text-paper-100">Informações da Assembleia</h2>
            <p className="text-xs text-ink-500 font-body mt-0.5">Preencha os dados para gerar a ata formal</p>
          </div>
          <button onClick={onCancel} className="btn-ghost p-2 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Seção: Identificação */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">Identificação</p>
            <div className="space-y-4">

              <Field label="Nome do Condomínio" required>
                <div className="flex gap-2">
                  <input
                    value={form.nome_condominio}
                    onChange={e => set('nome_condominio', e.target.value)}
                    className={clsx('input-field flex-1', errors.nome_condominio && 'border-red-500')}
                    placeholder="Ex: CONDOMÍNIO MILLENNIUM RESIDENCE"
                  />
                  <IaButton onClick={() => detectarIA('nome_condominio')} loading={iaLoading.nome_condominio} />
                </div>
                {errors.nome_condominio && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.nome_condominio}
                  </p>
                )}
              </Field>

              <Field label="Endereço">
                <input
                  value={form.endereco_condominio}
                  onChange={e => set('endereco_condominio', e.target.value)}
                  className="input-field"
                  placeholder="Endereço completo"
                />
              </Field>
            </div>
          </div>

          {/* Seção: Dados da Reunião */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">Dados da Reunião</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Assembleia">
                <select
                  value={form.tipo_assembleia}
                  onChange={e => set('tipo_assembleia', e.target.value)}
                  className="input-field"
                >
                  {TIPOS_ASSEMBLEIA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Data" required>
                <input
                  value={form.data_assembleia}
                  onChange={e => set('data_assembleia', e.target.value)}
                  className={clsx('input-field', errors.data_assembleia && 'border-red-500')}
                  placeholder="DD/MM/AAAA"
                />
              </Field>

              <Field label="Horário de Início">
                <input
                  value={form.horario_inicio}
                  onChange={e => set('horario_inicio', e.target.value)}
                  className="input-field"
                  placeholder="19h30"
                />
              </Field>

              <Field label="Horário de Encerramento">
                <input
                  value={form.horario_encerramento}
                  onChange={e => set('horario_encerramento', e.target.value)}
                  className="input-field"
                  placeholder="21h30"
                />
              </Field>

              <Field label="Nº de Presentes">
                <input
                  type="number"
                  min="1"
                  value={form.numero_presentes}
                  onChange={e => set('numero_presentes', e.target.value)}
                  className="input-field"
                />
              </Field>

              <Field label="Local de Realização">
                <input
                  value={form.local_realizacao}
                  onChange={e => set('local_realizacao', e.target.value)}
                  className="input-field"
                  placeholder="Ex: Salão de festas / Zoom"
                />
              </Field>
            </div>
          </div>

          {/* Seção: Mesa Diretora */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">Mesa Diretora</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome do Presidente" required>
                <input
                  value={form.presidente_nome}
                  onChange={e => set('presidente_nome', e.target.value)}
                  className={clsx('input-field', errors.presidente_nome && 'border-red-500')}
                  placeholder="Nome completo"
                />
                {errors.presidente_nome && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.presidente_nome}
                  </p>
                )}
              </Field>

              <Field label="Apartamento">
                <input
                  value={form.presidente_apartamento}
                  onChange={e => set('presidente_apartamento', e.target.value)}
                  className="input-field"
                  placeholder="Ex: 401"
                />
              </Field>

              <Field label="Nome do Secretário" required>
                <input
                  value={form.secretario_nome}
                  onChange={e => set('secretario_nome', e.target.value)}
                  className={clsx('input-field', errors.secretario_nome && 'border-red-500')}
                  placeholder="Nome completo"
                />
                {errors.secretario_nome && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.secretario_nome}
                  </p>
                )}
              </Field>

              <Field label="Apartamento">
                <input
                  value={form.secretario_apartamento}
                  onChange={e => set('secretario_apartamento', e.target.value)}
                  className="input-field"
                  placeholder="Ex: 201"
                />
              </Field>
            </div>
          </div>

          {/* Seção: Pautas */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">Pautas</p>
            <Field label="Pautas da Reunião (separadas por vírgula)">
              <div className="flex gap-2">
                <textarea
                  value={form.pautas_texto}
                  onChange={e => set('pautas_texto', e.target.value)}
                  rows={3}
                  className="input-field flex-1 resize-none"
                  placeholder="Ex: Aprovação de obras, Revisão de taxas condominiais"
                />
                <IaButton onClick={() => detectarIA('pautas')} loading={iaLoading.pautas} />
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-800 bg-ink-900/80">
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            Gerar Ata
          </button>
        </div>
      </div>
    </div>
  )
}
