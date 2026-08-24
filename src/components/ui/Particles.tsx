import { useEffect, useRef } from 'react'

type ParticleType = 'heart' | 'sparkle' | 'dust'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  type: ParticleType
  hue: number
  wobble: number
  wobbleSpeed: number
  pulsePhase: number
  twinklePhase: number
  twinkleSpeed: number
}

interface LightOrb {
  x: number
  y: number
  radius: number
  hue: number
  opacity: number
  driftAngle: number
  driftRadius: number
  speed: number
  phase: number
}

interface FlashLight {
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  hue: number
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

const isMobile = () =>
  typeof window !== 'undefined' &&
  ((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches) ||
    (navigator.maxTouchPoints ?? 0) > 1)

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return
    const canvas = canvasElement

    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      canvas.hidden = true
      return () => {
        canvas.hidden = false
      }
    }

    const drawingContext = canvas.getContext('2d')
    if (!drawingContext) return
    const ctx: CanvasRenderingContext2D = drawingContext

    let animId = 0
    let resizeFrame = 0
    let lastFrameTime = 0
    let lastFlashTime = 0
    let running = !document.hidden
    const mobile = isMobile()
    const frameInterval = mobile ? 1000 / 30 : 1000 / 60
    const viewport = { width: 0, height: 0, dpr: 1 }
    const particles: Particle[] = []
    const orbs: LightOrb[] = []
    let flashes: FlashLight[] = []
    let nextFlashDelay = 5000 + Math.random() * 5000

    // 减少粒子量，加重光斑 — 更"黄昏"
    const PARTICLE_COUNT = mobile ? 18 : 38
    const ORB_COUNT = mobile ? 3 : 5
    const heartPath = typeof Path2D === 'undefined' ? null : new Path2D(HEART_PATH)

    function resize() {
      resizeFrame = 0
      const width = Math.max(1, window.innerWidth)
      const height = Math.max(1, window.innerHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      viewport.width = width
      viewport.height = height
      viewport.dpr = dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function scheduleResize() {
      if (resizeFrame) return
      resizeFrame = window.requestAnimationFrame(resize)
    }

    resize()
    window.addEventListener('resize', scheduleResize, { passive: true })
    window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true })

    function createParticle(randomY: boolean): Particle {
      const typeRoll = Math.random()
      const type: ParticleType = typeRoll < 0.3 ? 'heart' : typeRoll < 0.65 ? 'sparkle' : 'dust'

      return {
        x: Math.random() * viewport.width,
        y: randomY ? Math.random() * viewport.height : viewport.height + 20,
        size:
          type === 'heart'
            ? 4 + Math.random() * 8
            : type === 'sparkle'
              ? 1.5 + Math.random() * 3
              : 0.8 + Math.random() * 1.8,
        speed: 0.06 + Math.random() * 0.2,
        opacity: 0.08 + Math.random() * 0.14,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type,
        // 暮色琥珀色板 — 暖色 hue 18-45
        hue:
          type === 'heart'
            ? 18 + Math.random() * 10
            : type === 'sparkle'
              ? 30 + Math.random() * 15
              : 25 + Math.random() * 20,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.006 + Math.random() * 0.018,
        pulsePhase: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.012 + Math.random() * 0.025,
      }
    }

    function createOrb(): LightOrb {
      // 大光斑偏暖橙
      const hues = [18, 28, 22, 38, 35]
      return {
        x: Math.random() * viewport.width,
        y: Math.random() * viewport.height,
        radius: 140 + Math.random() * 240,
        hue: hues[Math.floor(Math.random() * hues.length)],
        opacity: 0.05 + Math.random() * 0.05,
        driftAngle: Math.random() * Math.PI * 2,
        driftRadius: 80 + Math.random() * 100,
        speed: 0.0002 + Math.random() * 0.0005,
        phase: Math.random() * Math.PI * 2,
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true))
    }
    for (let i = 0; i < ORB_COUNT; i++) {
      orbs.push(createOrb())
    }

    function drawHeart(
      x: number,
      y: number,
      size: number,
      opacity: number,
      hue: number,
      rotation: number,
    ) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 65%, 68%)`
      const scale = size / 24
      ctx.scale(scale, scale)
      if (heartPath) ctx.fill(heartPath)
      ctx.restore()
    }

    function drawSparkle(x: number, y: number, size: number, opacity: number, hue: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 75%, 78%)`
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
      ctx.fillStyle = `hsl(${hue}, 45%, 72%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawOrb(orb: LightOrb, time: number) {
      const cx = orb.x + Math.cos(orb.driftAngle + time * orb.speed) * orb.driftRadius
      const cy = orb.y + Math.sin(orb.driftAngle + time * orb.speed * 0.7) * orb.driftRadius
      const pulse = 1 + Math.sin(time * 0.0006 + orb.phase) * 0.1
      const r = orb.radius * pulse

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, `hsla(${orb.hue}, 65%, 60%, ${orb.opacity})`)
      grad.addColorStop(0.4, `hsla(${orb.hue}, 55%, 55%, ${orb.opacity * 0.5})`)
      grad.addColorStop(1, `hsla(${orb.hue}, 55%, 50%, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawFlash(flash: FlashLight) {
      const progress = flash.life / flash.maxLife
      const opacity = Math.sin(progress * Math.PI) * 0.3
      const size = flash.size * (0.5 + progress * 0.5)

      const grad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, size)
      grad.addColorStop(0, `hsla(${flash.hue}, 80%, 82%, ${opacity})`)
      grad.addColorStop(0.4, `hsla(${flash.hue}, 65%, 68%, ${opacity * 0.4})`)
      grad.addColorStop(1, `hsla(${flash.hue}, 60%, 55%, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    function maybeSpawnFlash(time: number) {
      if (time - lastFlashTime > nextFlashDelay) {
        flashes.push({
          x: Math.random() * viewport.width,
          y: Math.random() * viewport.height * 0.8 + viewport.height * 0.1,
          life: 0,
          maxLife: 1800,
          size: 50 + Math.random() * 80,
          hue: 22 + Math.random() * 18,
        })
        lastFlashTime = time
        nextFlashDelay = 5000 + Math.random() * 5000
      }
    }

    function animate(time: number) {
      if (!running) return

      if (lastFrameTime && time - lastFrameTime < frameInterval) {
        animId = requestAnimationFrame(animate)
        return
      }

      const delta = lastFrameTime ? Math.min(50, time - lastFrameTime) : 16.67
      const frameScale = delta / 16.67
      lastFrameTime = time
      ctx.clearRect(0, 0, viewport.width, viewport.height)

      // 底层 — 大光斑（更明显的黄昏天光）
      ctx.globalCompositeOperation = 'screen'
      orbs.forEach((orb) => drawOrb(orb, time))
      ctx.globalCompositeOperation = 'source-over'

      // 顶层 — 偶发光点
      ctx.globalCompositeOperation = 'screen'
      maybeSpawnFlash(time)
      flashes = flashes.filter((f) => f.life < f.maxLife)
      flashes.forEach((flash) => {
        drawFlash(flash)
        flash.life += delta
      })
      ctx.globalCompositeOperation = 'source-over'

      // 中层 — 粒子
      ctx.globalCompositeOperation = 'screen'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed * frameScale
        p.rotation += p.rotationSpeed * frameScale
        p.wobble += p.wobbleSpeed * frameScale
        p.pulsePhase += 0.025 * frameScale
        p.twinklePhase += p.twinkleSpeed * frameScale

        const pulse = 1 + Math.sin(p.pulsePhase) * 0.2
        const twinkle = 0.55 + Math.sin(p.twinklePhase) * 0.35
        const xOffset = Math.sin(p.wobble) * 12

        const fadeZone = 100
        let opacity = p.opacity
        if (p.y < fadeZone) {
          opacity = p.opacity * (p.y / fadeZone)
        } else if (p.y > viewport.height - fadeZone) {
          opacity = p.opacity * ((viewport.height - p.y) / fadeZone)
        }
        if (p.type === 'sparkle') opacity *= twinkle

        const drawSize = p.size * (p.type === 'heart' ? pulse : 1)

        switch (p.type) {
          case 'heart':
            drawHeart(p.x + xOffset, p.y, drawSize, Math.max(0, opacity), p.hue, p.rotation)
            break
          case 'sparkle':
            drawSparkle(p.x + xOffset, p.y, drawSize, Math.max(0, opacity), p.hue)
            break
          case 'dust':
            drawDust(p.x + xOffset, p.y, drawSize, Math.max(0, opacity), p.hue)
            break
        }

        if (p.y < -30) {
          particles[i] = createParticle(false)
        }
      }
      ctx.globalCompositeOperation = 'source-over'

      animId = requestAnimationFrame(animate)
    }

    const handleVisibilityChange = () => {
      running = !document.hidden
      if (running) {
        lastFrameTime = 0
        cancelAnimationFrame(animId)
        animId = requestAnimationFrame(animate)
      } else {
        cancelAnimationFrame(animId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    if (running) animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', scheduleResize)
      window.visualViewport?.removeEventListener('resize', scheduleResize)
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
