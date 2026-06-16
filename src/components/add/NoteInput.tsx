interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

export function NoteInput({ value, onChange, rows = 5 }: NoteInputProps) {
  return (
    <div className="mx-6">
      <label className="block text-sm font-semibold text-warm-700 mb-3">💬 想说的话</label>
      <div className="relative">
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(180,150,120,0.08) 31px, rgba(180,150,120,0.08) 32px)',
            backgroundPosition: '0 10px',
          }}
        />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="写下这一刻的感受..."
          rows={rows}
          maxLength={500}
          className="w-full bg-white/90 border border-warm-300/70 rounded-2xl p-5 text-base text-warm-900 placeholder:text-warm-300/80 focus:outline-none focus:ring-2 focus:ring-warm-500/20 focus:border-warm-400 transition-all resize-none relative z-10"
          style={{ lineHeight: '32px', background: 'transparent' }}
        />
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs text-warm-300/80 italic">说点什么吧...</p>
        <p className={`text-xs font-medium tabular-nums ${value.length > 400 ? 'text-caramel' : 'text-warm-300'}`}>
          {value.length}/500
        </p>
      </div>
    </div>
  )
}
