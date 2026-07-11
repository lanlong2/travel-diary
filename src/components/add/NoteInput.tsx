interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

export function NoteInput({ value, onChange, rows = 5 }: NoteInputProps) {
  return (
    <div className="mx-6">
      <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">想说的话</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写下这一刻的感受"
        rows={rows}
        maxLength={500}
        className="w-full bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 rounded-2xl p-5 text-base text-dusk-50 placeholder:text-dusk-100/35 focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 focus:bg-dusk-600/60 transition-all resize-none"
      />
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs text-dusk-100/40 italic tracking-wide">说点什么吧</p>
        <p className={`text-xs font-medium tabular-nums font-mono tracking-wider ${value.length > 400 ? 'text-amber' : 'text-dusk-100/40'}`}>
          {value.length}/500
        </p>
      </div>
    </div>
  )
}
