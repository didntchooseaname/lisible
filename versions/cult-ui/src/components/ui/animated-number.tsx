"use client"

import { useEffect } from "react"
import { motion, useSpring, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"

interface AnimatedNumberProps {
  value: number
  locale: string
  mass?: number
  stiffness?: number
  damping?: number
  precision?: number
  format?: (value: number) => string
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}

export function AnimatedNumber({
  value,
  locale,
  mass = 0.8,
  stiffness = 75,
  damping = 15,
  precision = 0,
  format,
  onAnimationStart,
  onAnimationComplete,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { mass, stiffness, damping })
  const display: MotionValue<string> = useTransform(spring, (current) =>
    (format ?? ((number) => new Intl.NumberFormat(locale).format(number)))(
      parseFloat(current.toFixed(precision)),
    )
  )

  useEffect(() => {
    spring.set(value)
    if (onAnimationStart) onAnimationStart()
    const unsubscribe = spring.on("change", () => {
      if (spring.get() === value && onAnimationComplete) onAnimationComplete()
    })
    return () => unsubscribe()
  }, [spring, value, onAnimationStart, onAnimationComplete])

  return <motion.span>{display}</motion.span>
}
