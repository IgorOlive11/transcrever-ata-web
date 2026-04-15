import { Check } from 'lucide-react'
import clsx from 'clsx'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const num = i + 1
        const done = num < currentStep
        const active = num === currentStep
        const future = num > currentStep

        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  done && 'bg-emerald-500 text-white',
                  active && 'bg-gold-400 text-ink-950 ring-4 ring-gold-400/20',
                  future && 'bg-ink-800 text-ink-500 border border-ink-600'
                )}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <div>
                <p className={clsx(
                  'text-xs font-semibold leading-none',
                  active ? 'text-gold-400' : done ? 'text-emerald-400' : 'text-ink-500'
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-ink-600 font-body mt-0.5">{step.desc}</p>
              </div>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={clsx(
                'w-12 h-px mx-4 transition-all duration-500',
                done ? 'bg-emerald-500/50' : 'bg-ink-700'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
