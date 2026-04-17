import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // login | signup

const handleSubmit = async () => {
  setLoading(true)
  setError(null)

  const { data, error } = mode === 'login'
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password })

  console.log('data:', data)   // ← adicionar
  console.log('error:', error) // ← adicionar

  if (error) setError(error.message)
  setLoading(false)
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-gold-400" />
          </div>
          <h1 className="font-display text-xl font-semibold text-paper-100">
            Transcrever <span className="text-gold-400">ATA</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-ink-900 border border-ink-700 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-paper-100 text-center">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="text-xs text-ink-500 text-center">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-gold-400 hover:underline"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}