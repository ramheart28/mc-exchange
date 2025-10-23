'use client'
import { useEffect, useRef, useState } from 'react'

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    if (!vantaEffect && typeof window !== 'undefined' && (window as any).VANTA?.TOPOLOGY) {
      const effect = (window as any).VANTA.TOPOLOGY({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x000000,
        color: 0x0cbff0,
      })
      setVantaEffect(effect)
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 z-0 pointer-events-none bg-black"
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    />
  )
}

