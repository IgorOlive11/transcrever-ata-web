import { Outlet } from 'react-router-dom'
import { FileText, Cpu, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_URL } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const [apiStatus, setApiStatus] = useState(null)
  const { logout } = useAuth()

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(r => r.json())
      .then(setApiStatus)
      .catch(() => setApiStatus({ status: 'error' }))
}, [])

return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-paper-100 leading-none">
                Transcrever <span className="text-gold-400">ATA</span>
              </h1>
              <p className="text-xs text-ink-500 font-body mt-0.5">Contato · Administração de Condomínios</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* API Status */}
            {apiStatus && (
              <div className="flex items-center gap-3 text-xs font-body">
                <div className="flex items-center gap-1.5">
                  <span className={`status-dot ${apiStatus.assemblyai ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-ink-500">AssemblyAI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`status-dot ${apiStatus.openai ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-ink-500">OpenAI</span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800 py-4 text-center">
        <p className="text-xs text-ink-600 font-body flex items-center justify-center gap-1.5">
          <Cpu className="w-3 h-3" />
          Powered by AssemblyAI + OpenAI GPT-4o
        </p>
      </footer>
    </div>
  )
}