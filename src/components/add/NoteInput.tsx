interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  rows?: number
}

export function NoteInput({ value, onChange, rows = 5 }: NoteInputProps) {
  return (
    <div className="page-mx">
      <label
        htmlFor="record-note"
        className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2"
      >
        <span className="w-1 h-1 rounded-full bg-amber/60" />
        想说的话
      </label>
      <textarea
        id="record-note"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写下这一刻的感受…"
        rows={rows}
        maxLength={500}
        className="w-full bg-dusk-600/40 backdrop-blur-sm border border-dusk-300/30 rounded-[14px] p-5 text-[15px] text-dusk-50 placeholder:text-dusk-100/30 focus:outline-none focus:ring-[1px] focus:ring-amber/30 focus:border-amber/55 focus:bg-dusk-600/55 focus:shadow-[inset_0_1px_0_oklch(80%_0.14_60_/_0.1)] transition-all resize-none italic font-serif"
      />
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-[11px] text-dusk-100/45 italic tracking-[0.04em] font-serif">
          说点什么吧
        </p>
        <p
          className={`text-[11px] font-medium tabular-nums font-mono tracking-[0.04em] ${value.length > 400 ? 'text-amber' : 'text-dusk-100/45'}`}
        >
          {value.length}/500
        </p>
      </div>
    </div>
  )
}
