import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  type: 'heart' | 'sparkle' | 'dust'
  hue: number
  wobble: number
  wobbleSpeed: number
}

// 爱心 SVG path
const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    let particles: Particle[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 创建粒子 — 数量更多、更大、更明显
    const PARTICLE_COUNT = 55
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true))
    }

    function createParticle(randomY: boolean): Particle {
      const types = ['heart', 'sparkle', 'dust'] as const
      const type = types[Math.floor(Math.random() * 3)]
      return {
        x: Math.random() * canvas!.width,
        y: randomY ? Math.random() * canvas!.height : canvas!.height + 20,
        size: type === 'heart' ? 8 + Math.random() * 12
          : type === 'sparkle' ? 3 + Math.random() * 5
          : 1.5 + Math.random() * 3,
        speed: 0.1 + Math.random() * 0.35,
        opacity: 0.25 + Math.random() * 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        type,
        hue: type === 'heart' ? 340 + Math.random() * 30
          : type === 'sparkle' ? 25 + Math.random() * 20
          : 20 + Math.random() * 30,
        wobble: 0,
        wobbleSpeed: 0.01 + Math.random() * 0.03,
      }
    }

    function drawHeart(x: number, y: number, size: number, opacity: number, hue: number, rotation: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 70%, 75%)`

      const path = new Path2D(HEART_PATH)
      const scale = size / 24
      ctx.scale(scale, scale)
      ctx.fill(path)
      ctx.restore()
    }

    function drawSparkle(x: number, y: number, size: number, opacity: number, hue: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 80%, 85%)`
      ctx.shadowColor = `hsl(${hue}, 80%, 85%)`
      ctx.shadowBlur = size * 2

      // 四角星
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        const innerR = size * 0.3
        const outerR = size
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR)
        ctx.lineTo(Math.cos(angle + Math.PI / 4) * innerR, Math.sin(angle + Math.PI / 4) * innerR)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    function drawDust(x: number, y: number, size: number, opacity: number, hue: number) {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 50%, 80%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed
        p.rotation += p.rotationSpeed
        p.wobble += p.wobbleSpeed
        const xOffset = Math.sin(p.wobble) * 15

        // 淡入淡出
        const fadeZone = 100
        let opacity = p.opacity
        if (p.y < fadeZone) {
          opacity = p.opacity * (p.y / fadeZone)
        } else if (p.y > canvas!.height - fadeZone) {
          opacity = p.opacity * ((canvas!.height - p.y) / fadeZone)
        }

        switch (p.type) {
          case 'heart':
            drawHeart(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue, p.rotation)
            break
          case 'sparkle':
            drawSparkle(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue)
            break
          case 'dust':
            drawDust(p.x + xOffset, p.y, p.size, Math.max(0, opacity), p.hue)
            break
        }

        // 超出画布后重生
        if (p.y < -20) {
          particles[i] = createParticle(false)
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
