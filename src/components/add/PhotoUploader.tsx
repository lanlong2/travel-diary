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
      <label className="block text-sm font-semibold text-warm-700 mb-3">📸 照片</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {preview ? (
        <div className="relative animate-scale-in">
          <div className="bg-white p-4 pb-10 rounded-sm shadow-md rotate-[0.5deg]">
            <img src={preview} alt="预览" className="w-full aspect-[4/3] object-cover rounded-sm" />
            <p className="text-center text-[11px] text-wood/50 mt-2 italic">预览</p>
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-6 bg-warm-400/25 -rotate-2 rounded-sm blur-[0.5px]" />
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); inputRef.current?.click() }}
            className="absolute -bottom-1 right-6 flex items-center gap-1.5 px-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-600 shadow-sm hover:bg-warm-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重拍
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-warm-300/70 rounded-2xl p-12 text-center hover:border-warm-500/70 hover:bg-warm-50/50 transition-all group"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warm-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8 text-warm-500" />
          </div>
          <p className="text-base text-warm-500 font-medium">点击拍照或选择照片</p>
          <p className="text-xs text-warm-300/70 mt-2">JPG / PNG / HEIC</p>
        </button>
      )}
    </div>
  )
}
