interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

export function NoteInput({ value, onChange, rows = 5 }: NoteInputProps) {
  return (
    <div className="mx-7">
      <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.02em]">想说的话</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写下这一刻的感受"
        rows={rows}
        maxLength={500}
        className="w-full bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 rounded-[14px] p-5 text-[15px] text-dusk-50 placeholder:text-dusk-100/25 focus:outline-none focus:ring-[1px] focus:ring-amber/25 focus:border-amber/50 transition-colors resize-none"
      />
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-[11px] text-dusk-100/40 italic tracking-[0.02em]">说点什么吧</p>
        <p className={`text-[11px] font-medium tabular-nums font-mono tracking-[0.02em] ${value.length > 400 ? 'text-amber' : 'text-dusk-100/40'}`}>
          {value.length}/500
        </p>
      </div>
    </div>
  )
}
