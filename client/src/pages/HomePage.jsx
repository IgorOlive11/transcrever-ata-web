import { useState } from 'react'
import { Mic, Wand2, AlertCircle, RotateCcw, ChevronRight } from 'lucide-react'

import AudioUploader from '../components/AudioUploader'
import TranscriptionEditor from '../components/TranscriptionEditor'
import AtaPreview from '../components/AtaPreview'
import AssemblyInfoModal from '../components/AssemblyInfoModal'
import ProgressIndicator from '../components/ProgressIndicator'
import StepIndicator from '../components/StepIndicator'

import { useTranscricao, useGerarAta } from '../hooks/useTranscricao'

const STEPS = [
  { label: 'Áudio', desc: 'Selecione ou cole texto' },
  { label: 'Transcrição', desc: 'Revise o texto gerado' },
  { label: 'Ata', desc: 'Ata formal gerada' },
]

export default function HomePage() {
  const [audioFile, setAudioFile] = useState(null)
  const [step, setStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [infoAssembleia, setInfoAssembleia] = useState(null)

  const transcricao = useTranscricao()
  const gerarAta = useGerarAta()

  // ── Transcrever ────────────────────────────────────────────────────────────
  const handleTranscrever = async () => {
    if (!audioFile) return
    await transcricao.transcrever(audioFile)
    if (transcricao.status !== 'error') setStep(2)
  }

  // Se a transcrição foi concluída via SSE, avançar step
  const handleTranscricaoDone = () => {
    setStep(2)
  }

  // ── Colar texto manual ─────────────────────────────────────────────────────
  const handleTextChange = (val) => {
    transcricao.setText(val)
    if (val.trim() && step === 1) setStep(2)
    if (!val.trim() && step === 2) setStep(1)
  }

  // ── Gerar ATA ──────────────────────────────────────────────────────────────
  const handleGerarAta = () => {
    const texto = transcricao.text.trim()
    if (!texto) return
    setShowModal(true)
  }

  const handleModalConfirm = async (info) => {
    setShowModal(false)
    setInfoAssembleia(info)
    await gerarAta.gerar(transcricao.text, info)
    setStep(3)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAudioFile(null)
    setStep(1)
    setInfoAssembleia(null)
    transcricao.reset()
    gerarAta.reset()
  }

  const isTranscribing = transcricao.status === 'transcribing'
  const isGenerating = gerarAta.status === 'gerando'
  const hasText = !!transcricao.text.trim()
  const hasAta = !!gerarAta.ataTexto.trim()

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold text-paper-50">
            Gerar <span className="text-gold-400 italic">Ata</span>
          </h2>
          <p className="text-ink-500 font-body text-sm mt-1">
            Transcreva assembleias de condomínio e gere atas formais com IA
          </p>
        </div>

        {step > 1 && (
          <button onClick={handleReset} className="btn-ghost text-xs gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Recomeçar
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="card">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* ── STEP 1 & 2: Audio + Transcription ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Upload + controls */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
              <Mic className="w-3 h-3 text-gold-400" />
            </div>
            <h3 className="font-display text-base font-semibold text-paper-100">Áudio</h3>
          </div>

          <AudioUploader
            file={audioFile}
            onFileSelect={setAudioFile}
            disabled={isTranscribing}
          />

          {/* Transcribe button */}
          <button
            onClick={handleTranscrever}
            disabled={!audioFile || isTranscribing || isGenerating}
            className="btn-primary w-full justify-center"
          >
            {isTranscribing
              ? <><span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" /> Transcrevendo...</>
              : <><Mic className="w-4 h-4" /> Transcrever Áudio</>
            }
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-700" />
            <span className="text-xs text-ink-600 font-body uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-ink-700" />
          </div>

          <p className="text-xs text-ink-500 font-body text-center">
            Cole um texto de transcrição diretamente no editor ao lado
          </p>

          {/* Progress */}
          <ProgressIndicator
            visible={isTranscribing}
            message={transcricao.progress}
          />

          {/* Transcription error */}
          {transcricao.status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 font-body">{transcricao.error}</p>
            </div>
          )}
        </div>

        {/* Right: Transcription editor */}
        <div className="card flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-paper-100">Transcrição</h3>
            {transcricao.status === 'done' && (
              <span className="text-xs text-emerald-400 font-body flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Concluída
              </span>
            )}
          </div>

          <div className="flex-1">
            <TranscriptionEditor
              value={transcricao.text}
              onChange={handleTextChange}
              placeholder={
                isTranscribing
                  ? 'Transcrevendo...'
                  : 'Cole uma transcrição aqui ou use o botão Transcrever Áudio →'
              }
            />
          </div>
        </div>
      </div>

      {/* ── STEP 2 → 3: Generate ATA button ─────────────────────────────────── */}
      {hasText && !hasAta && (
        <div className="flex flex-col items-center gap-4 py-2 animate-fade-up">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-ink-600 to-transparent" />

          <button
            onClick={handleGerarAta}
            disabled={isGenerating || isTranscribing}
            className="btn-primary text-base px-8 py-4 rounded-xl gap-3"
          >
            {isGenerating
              ? <><span className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" /> Gerando Ata...</>
              : <><Wand2 className="w-5 h-5" /> Gerar Síntese da Ata</>
            }
          </button>

          <ProgressIndicator visible={isGenerating} message={gerarAta.progress} />

          {gerarAta.status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm max-w-lg w-full">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 font-body">{gerarAta.error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: ATA Preview ──────────────────────────────────────────────── */}
      {hasAta && (
        <div className="card flex flex-col min-h-[600px] animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wand2 className="w-3 h-3 text-emerald-400" />
              </div>
              <h3 className="font-display text-base font-semibold text-paper-100">Ata Gerada</h3>
            </div>
            <span className="text-xs text-emerald-400 font-body flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Pronta para download
            </span>
          </div>

          <div className="flex-1">
            <AtaPreview
              ataTexto={gerarAta.ataTexto}
              infoAssembleia={infoAssembleia}
              onChange={gerarAta.setAtaTexto}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AssemblyInfoModal
          transcricao={transcricao.text}
          onConfirm={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
