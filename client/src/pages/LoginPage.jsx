import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Eye, EyeOff } from 'lucide-react'
import zxcvbn from 'zxcvbn' 

const TRADUCOES = {
  'Use a few words, avoid common phrases': 'Use algumas palavras, evite frases comuns',
  'No need for symbols, digits, or uppercase letters': 'Não precisa de símbolos, números ou maiúsculas',
  'Straight rows of keys are easy to guess': 'Sequências de teclado são fáceis de adivinhar',
  'Short keyboard patterns are easy to guess': 'Padrões curtos de teclado são fáceis de adivinhar',
  'Use a longer keyboard pattern with more turns': 'Use um padrão mais longo com mais variações',
  'Repeats like "aaa" are easy to guess': 'Repetições como "aaa" são fáceis de adivinhar',
  'Repeats like "abcabc" are only slightly harder to guess than "abc"': 'Repetições são fáceis de adivinhar',
  'Sequences like abc or 6543 are easy to guess': 'Sequências como abc ou 6543 são fáceis de adivinhar',
  'Recent years are easy to guess': 'Anos recentes são fáceis de adivinhar',
  'Dates are often easy to guess': 'Datas são fáceis de adivinhar',
  'This is a top-10 common password': 'Esta é uma das 10 senhas mais comuns',
  'This is a top-100 common password': 'Esta é uma das 100 senhas mais comuns',
  'This is a very common password': 'Esta é uma senha muito comum',
  'This is similar to a commonly used password': 'Esta senha é similar a senhas muito usadas',
  'A word by itself is easy to guess': 'Uma palavra sozinha é fácil de adivinhar',
  'Names and surnames by themselves are easy to guess': 'Nomes sozinhos são fáceis de adivinhar',
  'Common names and surnames are easy to guess': 'Nomes comuns são fáceis de adivinhar',
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de entrar.',
  'User already registered': 'Este email já possui uma conta.',
  'email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'Add another word or two. Uncommon words are better.': 'Adicione mais uma ou duas palavras incomuns.',
  'Capitalization doesn\'t help very much': 'Maiúsculas sozinhas não ajudam muito',
  'All-uppercase is almost as easy to guess as all-lowercase': 'Tudo maiúsculo é tão fácil quanto tudo minúsculo',
  'Reversed words aren\'t much harder to guess': 'Palavras invertidas não são muito mais difíceis',
  'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'Substituições como \'@\' no lugar de \'a\' não ajudam muito',
  'Use a longer password': 'Use uma senha mais longa',
}

const traduzir = (texto) => TRADUCOES[texto] || texto

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [sucesso, setSuccesso] = useState(null)

  const resultado = zxcvbn(password)
  const forca = resultado.score

  const trocarMode = (novoMode) => {
    setMode(novoMode)
    setError(null)
    setSuccesso(null)
  }

  const handleSubmit = async () => {
    if (mode === 'signup' && forca < 3) {
      setError('Senha fraca demais. Melhore a senha antes de continuar.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccesso(null)

    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(traduzir(error.message))
    } else if (mode === 'signup') {
      if (data.user?.identities?.length === 0) {
        setError('Este email já possui uma conta.')
      } else {
        setSuccesso('Conta criada! Verifique seu email para confirmar o cadastro.')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit() }}>
      <div className="bg-ink-900 border border-ink-700 rounded-2xl p-6 space-y-4">
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

              {/* Abas */}
              <div className="flex bg-ink-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => trocarMode('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'login' ? 'bg-ink-700 text-paper-100' : 'text-ink-500 hover:text-paper-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => trocarMode('signup')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'signup' ? 'bg-ink-700 text-paper-100' : 'text-ink-500 hover:text-paper-200'
                  }`}
                >
                  Criar conta
                </button>
              </div>

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

              {/* Senha */}
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    className="input-field w-full"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-500 hover:text-paper-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(nivel => (
                      <div
                        key={nivel}
                        className={`h-1 flex-1 rounded-full ${forca >= nivel ? forca <= 1 ? 'bg-red-500' : forca === 2 ? 'bg-yellow-400' : 'bg-emerald-400' : 'bg-ink-700'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${forca <= 1 ? 'text-red-400' : forca === 2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {forca <= 1 ? 'Senha muito fraca' : forca === 2 ? 'Senha fraca' : forca === 3 ? 'Senha boa' : 'Senha forte'}
                    {resultado.feedback.warning ? ` — ${traduzir(resultado.feedback.warning)}` : ''}
                  </p>
                  {resultado.feedback.suggestions.length > 0 && (
                    <p className="text-xs text-ink-500">{traduzir(resultado.feedback.suggestions[0])}</p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              {sucesso && (
                <p className="text-xs text-emerald-400">{sucesso}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>

            </div>
          </div>
        </div>
      </div>
    </form>
  )
}