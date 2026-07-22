import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

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
      <label className="block text-[13px] font-medium text-dusk-100/80 mb-3 tracking-[0.02em]">照片</label>

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
          {/* 纯文字链接，不抢眼 */}
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); inputRef.current?.click() }}
            className="absolute -bottom-1 right-4 text-[13px] text-amber/80 hover:text-amber transition-colors tracking-[0.02em]"
          >
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
          className={`w-full border rounded-[14px] p-12 text-center transition-colors duration-200 ${
            dragging
              ? 'border-amber'
              : 'border-dusk-300/40 hover:border-amber/50'
          }`}
          style={dragging ? { backgroundColor: 'oklch(58% 0.13 40 / 0.06)' } : undefined}
        >
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <Camera className="w-7 h-7 text-amber/70" />
            </div>
            <p className="text-[15px] text-dusk-50/85 font-medium tracking-[0.02em]">
              选择照片
            </p>
          </div>
        </button>
      )}
    </div>
  )
}
