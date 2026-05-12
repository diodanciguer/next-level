'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FloatingXpProps {
  amount: number
  x: number
  y: number
  onComplete: () => void
  isBad?: boolean
}

export function FloatingXp({ amount, x, y, onComplete, isBad }: FloatingXpProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: y, x: x }}
      animate={{ opacity: 1, y: y - 50 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed z-[9999] pointer-events-none font-bold text-lg ${isBad ? 'text-red-500' : 'text-green-500'} drop-shadow-sm`}
    >
      {isBad ? '-' : '+'}{amount} XP
    </motion.div>
  )
}

export function useFloatingXp() {
  const [elements, setElements] = useState<{ id: number; amount: number; x: number; y: number; isBad?: boolean }[]>([])

  const addFloatingXp = (amount: number, x: number, y: number, isBad?: boolean) => {
    const id = Date.now()
    setElements(prev => [...prev, { id, amount, x, y, isBad }])
  }

  const removeFloatingXp = (id: number) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }

  const FloatingXpContainer = () => (
    <AnimatePresence>
      {elements.map(el => (
        <FloatingXp
          key={el.id}
          amount={el.amount}
          x={el.x}
          y={el.y}
          isBad={el.isBad}
          onComplete={() => removeFloatingXp(el.id)}
        />
      ))}
    </AnimatePresence>
  )

  return { addFloatingXp, FloatingXpContainer }
}
