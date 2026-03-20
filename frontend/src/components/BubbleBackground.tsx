import { useEffect, useRef } from 'react'

interface Bubble {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
  wobble: number
  wobbleSpeed: number
  wobbleOffset: number
}

export default function BubbleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationId: number
    let bubbles: Bubble[] = []
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    const createBubble = (): Bubble => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      radius: Math.random() * 6 + 2,
      speed: Math.random() * 0.6 + 0.2,
      opacity: Math.random() * 0.25 + 0.05,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      wobbleOffset: Math.random() * Math.PI * 2
    })
    const init = () => {
      resize()
      bubbles = Array.from({ length: 35 }, createBubble).map(b => ({
        ...b,
        y: Math.random() * canvas.height
      }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bubbles.forEach(bubble => {
        bubble.y -= bubble.speed
        bubble.wobble += bubble.wobbleSpeed
        const xOffset = Math.sin(bubble.wobble + bubble.wobbleOffset) * 1.5
        if (bubble.y + bubble.radius < 0) {
          bubble.y = canvas.height + bubble.radius
          bubble.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.arc(bubble.x + xOffset, bubble.y, bubble.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(52, 211, 153, ${bubble.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(
          bubble.x + xOffset - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          bubble.radius * 0.25,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = `rgba(167, 243, 208, ${bubble.opacity * 1.5})`
        ctx.fill()
      })
      animationId = requestAnimationFrame(draw)
    }
    init()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
