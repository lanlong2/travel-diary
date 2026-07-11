import { useRef, useState } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void
}

export function PhotoUploader({ onFileSelect }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

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
        <div className="relative animate-scale-in">
          <div className="glass-card p-3 overflow-hidden">
            <img src={preview} alt="预览" className="w-full aspect-[4/3] object-cover rounded-lg" />
            <p className="text-center text-[11px] text-dusk-100/50 mt-2 italic tracking-wider">预览</p>
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
          className="w-full border-2 border-dashed border-dusk-300/40 rounded-2xl p-12 text-center hover:border-amber/50 hover:bg-amber/5 transition-all group"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber/12 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8 text-amber" />
          </div>
          <p className="text-sm text-dusk-50 font-medium tracking-wide">点击拍照或选择照片</p>
          <p className="text-xs text-dusk-100/40 mt-2 tracking-wider">JPG / PNG / HEIC</p>
        </button>
      )}
    </div>
  )
}
