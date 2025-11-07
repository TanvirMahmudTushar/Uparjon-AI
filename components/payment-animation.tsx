"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface PaymentAnimationProps {
  isActive: boolean
  amount: number
}

export function PaymentAnimation({ isActive, amount }: PaymentAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    if (!isActive) return

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 1000)
    return () => clearTimeout(timer)
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
        </div>

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary rounded-full animate-out fade-out zoom-out"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px))`,
              animation: "float-out 1s ease-out forwards",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float-out {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(${particles[0]?.x || 0}px, ${particles[0]?.y || 0}px);
          }
        }
      `}</style>
    </div>
  )
}
