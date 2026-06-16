import type { RippleData } from '../../hooks/useRipple'

interface RippleProps {
  ripples: RippleData[]
}

export function Ripple({ ripples }: RippleProps) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </>
  )
}
