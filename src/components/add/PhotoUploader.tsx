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
    <div className="mx-6">
      <label className="block text-sm font-medium text-dusk-100/80 mb-3 tracking-wide">照片</label>

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
        // 拍立得相纸风格预览
        <div className="relative animate-scale-in">
          <div className="polaroid-frame rounded-[2px]">
            <img
              src={preview}
              alt="预览"
              className="w-full aspect-[4/3] object-cover rounded-[1px]"
            />
            <p className="text-center text-[10px] text-dusk-900/60 mt-2 italic tracking-wider font-serif">
              · 我们的回忆 ·
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); inputRef.current?.click() }}
            className="absolute -bottom-2 right-4 flex items-center gap-1.5 px-4 py-2.5 glass-nav rounded-xl text-sm text-amber hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重拍
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
          className={`w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 group relative overflow-hidden ${
            dragging
              ? 'border-amber bg-amber/10 scale-[1.01]'
              : 'border-dusk-300/40 hover:border-amber/50 hover:bg-amber/5'
          }`}
        >
          {/* 背景呼吸 */}
          <span
            className="absolute inset-0 pointer-events-none opacity-50 animate-breathe"
            style={{
              background: 'radial-gradient(circle at 50% 50%, oklch(68% 0.17 40 / 0.06), transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber/12 flex items-center justify-center group-hover:scale-110 transition-transform animate-float-soft">
              <Camera className="w-8 h-8 text-amber" />
            </div>
            <p className="text-sm text-dusk-50 font-medium tracking-wide">
              点击拍照或选择照片
            </p>
            <p className="text-xs text-dusk-100/40 mt-2 tracking-wider">
              JPG / PNG / HEIC · 也支持拖拽上传
            </p>
          </div>
        </button>
      )}
    </div>
  )
}
