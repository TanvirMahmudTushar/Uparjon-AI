"use client"

import type React from "react"
import { Card } from "@/components/ui/card"

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  return (
    <Card
      className={`bg-card border-border animate-in fade-in slide-in-from-bottom-4 ${className}`}
      style={{
        animationDelay: `${delay * 100}ms`,
        animationDuration: "500ms",
      }}
    >
      {children}
    </Card>
  )
}
