import { useEffect, useRef } from 'react'

type ParticleType = 'heart' | 'sparkle' | 'dust'
type LightType = 'orb' | 'flash'

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
  driftX: number
  driftY: number
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

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

const isMobile = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 768px)').matches ||
    (navigator.maxTouchPoints ?? 0) > 1)

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = canvas.getContext('2d')!
    let animId = 0
    let particles: Particle[] = []
    let orbs: LightOrb[] = []
    let flashes: FlashLight[] = []
    let lastFlashTime = 0
    let nextFlashDelay = 4000 + Math.random() * 4000

    const mobile = isMobile()
    const PARTICLE_COUNT = mobile ? 25 : 55
    const ORB_COUNT = mobile ? 2 : 3

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function createParticle(randomY: boolean): Particle {
      const typeRoll = Math.random()
      const type: ParticleType = typeRoll < 0.34 ? 'heart'
        : typeRoll < 0.7 ? 'sparkle'
        : 'dust'

      return {
        x: Math.random() * canvas!.width,
        y: randomY ? Math.random() * canvas!.height : canvas!.height + 20,
        size: type === 'heart' ? 5 + Math.random() * 9
          : type === 'sparkle' ? 1.8 + Math.random() * 3.5
          : 1 + Math.random() * 2,
        speed: 0.08 + Math.random() * 0.25,
        opacity: 0.10 + Math.random() * 0.16,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        type,
        hue: type === 'heart' ? 18 + Math.random() * 12
          : type === 'sparkle' ? 30 + Math.random() * 12
          : 30 + Math.random() * 20,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.008 + Math.random() * 0.022,
        pulsePhase: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        driftX: 0,
        driftY: 0,
      }
    }

    function createOrb(): LightOrb {
      const hues = [18, 30, 22, 40]
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        radius: 100 + Math.random() * 200,
        hue: hues[Math.floor(Math.random() * hues.length)],
        opacity: 0.04 + Math.random() * 0.04,
        driftAngle: Math.random() * Math.PI * 2,
        driftRadius: 60 + Math.random() * 80,
        speed: 0.0003 + Math.random() * 0.0006,
        phase: Math.random() * Math.PI * 2,
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true))
    }
    for (let i = 0; i < ORB_COUNT; i++) {
      orbs.push(createOrb())
    }

    function drawHeart(x: number, y: number, size: number, opacity: number, hue: number, rotation: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = `hsl(${hue}, 60%, 70%)`
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
      ctx.fillStyle = `hsl(${hue}, 70%, 80%)`
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
      ctx.fillStyle = `hsl(${hue}, 40%, 75%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawOrb(orb: LightOrb, time: number) {
      const cx = orb.x + Math.cos(orb.driftAngle + time * orb.speed) * orb.driftRadius
      const cy = orb.y + Math.sin(orb.driftAngle + time * orb.speed * 0.7) * orb.driftRadius
      const pulse = 1 + Math.sin(time * 0.0008 + orb.phase) * 0.08
      const r = orb.radius * pulse

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, `hsla(${orb.hue}, 60%, 65%, ${orb.opacity})`)
      grad.addColorStop(0.5, `hsla(${orb.hue}, 55%, 60%, ${orb.opacity * 0.5})`)
      grad.addColorStop(1, `hsla(${orb.hue}, 55%, 55%, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawFlash(flash: FlashLight) {
      const progress = flash.life / flash.maxLife
      const opacity = Math.sin(progress * Math.PI) * 0.35
      const size = flash.size * (0.5 + progress * 0.5)

      const grad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, size)
      grad.addColorStop(0, `hsla(${flash.hue}, 75%, 85%, ${opacity})`)
      grad.addColorStop(0.4, `hsla(${flash.hue}, 65%, 70%, ${opacity * 0.4})`)
      grad.addColorStop(1, `hsla(${flash.hue}, 60%, 60%, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    function maybeSpawnFlash(time: number) {
      if (time - lastFlashTime > nextFlashDelay) {
        flashes.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height * 0.8 + canvas!.height * 0.1,
          life: 0,
          maxLife: 1500,
          size: 40 + Math.random() * 60,
          hue: 25 + Math.random() * 20,
        })
        lastFlashTime = time
        nextFlashDelay = 4000 + Math.random() * 4000
      }
    }

    function animate(time: number) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      // 底层 — 大光斑（极微妙）
      ctx.globalCompositeOperation = 'screen'
      orbs.forEach((orb) => drawOrb(orb, time))
      ctx.globalCompositeOperation = 'source-over'

      // 顶层 — 偶发光点
      ctx.globalCompositeOperation = 'screen'
      maybeSpawnFlash(time)
      flashes = flashes.filter((f) => f.life < f.maxLife)
      flashes.forEach((flash) => {
        drawFlash(flash)
        flash.life += 16
      })
      ctx.globalCompositeOperation = 'source-over'

      // 中层 — 粒子
      ctx.globalCompositeOperation = 'screen'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed
        p.rotation += p.rotationSpeed
        p.wobble += p.wobbleSpeed
        p.pulsePhase += 0.03
        p.twinklePhase += p.twinkleSpeed

        const pulse = 1 + Math.sin(p.pulsePhase) * 0.2
        const twinkle = 0.55 + Math.sin(p.twinklePhase) * 0.35
        const xOffset = Math.sin(p.wobble) * 15

        const fadeZone = 100
        let opacity = p.opacity
        if (p.y < fadeZone) {
          opacity = p.opacity * (p.y / fadeZone)
        } else if (p.y > canvas!.height - fadeZone) {
          opacity = p.opacity * ((canvas!.height - p.y) / fadeZone)
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

    animId = requestAnimationFrame(animate)

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
