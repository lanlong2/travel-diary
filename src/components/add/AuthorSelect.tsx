import type { Author } from '../../types'

interface AuthorSelectProps {
  value: Author
  onChange: (author: Author) => void
}

export function AuthorSelect({ value, onChange }: AuthorSelectProps) {
  return (
    <div className="page-mx">
      <label className="mb-3 flex items-center gap-2 text-[13px] font-medium tracking-[0.04em] text-dusk-100/80">
        <span className="h-1 w-1 rounded-full bg-amber/60" />
        记录者
      </label>
      <div role="group" aria-label="记录者" className="grid grid-cols-2 gap-2">
        {(['我', '她'] as Author[]).map((author) => (
          <button
            key={author}
            type="button"
            aria-pressed={value === author}
            onClick={() => onChange(author)}
            className={`min-h-11 rounded-[12px] border px-4 py-2.5 text-[13px] font-medium tracking-[0.04em] transition-all active:scale-[0.98] ${
              value === author
                ? 'border-amber/55 bg-amber/15 text-amber shadow-[0_4px_16px_oklch(68%_0.17_40_/_0.12)]'
                : 'border-dusk-300/20 bg-dusk-600/30 text-dusk-100/65 hover:border-dusk-300/45 hover:bg-dusk-600/55'
            }`}
          >
            {author}
          </button>
        ))}
      </div>
    </div>
  )
}
