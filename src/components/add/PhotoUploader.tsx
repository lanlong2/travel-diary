import { useRef, useState } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void
}

export function PhotoUploader({ onFileSelect }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    onFileSelect(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-7">
      <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.04em] flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-amber/60" />
        照片
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {preview ? (
        <div className="relative animate-scale-in">
          <div className="polaroid-frame rounded-[2px]">
            <img
              src={preview}
              alt="预览"
              className="w-full aspect-[4/3] object-cover rounded-[1px]"
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); inputRef.current?.click() }}
            className="absolute -bottom-1 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/15 border border-amber/30 backdrop-blur-md text-[12px] text-amber font-medium tracking-[0.04em] hover:bg-amber/25 transition-colors active:scale-95 duration-200"
          >
            <RefreshCw className="w-3 h-3" />
            换一张
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file && file.type.startsWith('image/')) handleFile(file)
          }}
          className={`w-full border-2 border-dashed rounded-[16px] p-12 text-center transition-all duration-300 relative overflow-hidden ${
            dragging
              ? 'border-amber bg-amber/8 scale-[1.01]'
              : 'border-dusk-300/40 hover:border-amber/55 hover:bg-amber/4'
          }`}
        >
          {/* 装饰角 — 编辑式四角小标 */}
          <span className="absolute top-2 left-2 w-3 h-3 border-l border-t border-amber/40" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-3 h-3 border-r border-t border-amber/40" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-amber/40" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-amber/40" aria-hidden="true" />

          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber/10 border border-amber/25">
              <Camera className="w-7 h-7 text-amber/75" />
            </div>
            <p className="text-[15px] text-dusk-50/85 font-medium tracking-[0.05em]">
              选择照片
            </p>
            <p className="text-[11px] text-dusk-100/45 mt-1 tracking-[0.04em] font-mono">
              或拖拽到此处
            </p>
          </div>
        </button>
      )}
    </div>
  )
}
