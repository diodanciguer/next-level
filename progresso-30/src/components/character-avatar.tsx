'use client'

import { getRankInfo, CLASS_CONFIG, CharacterClass } from '@/lib/game'
import { cn } from '@/lib/utils'

interface CharacterAvatarProps {
  level: number
  characterClass: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function CharacterAvatar({ level, characterClass, size = 'md', className }: CharacterAvatarProps) {
  const rankInfo = getRankInfo(level)
  const classInfo = CLASS_CONFIG[characterClass as CharacterClass] || CLASS_CONFIG['Iniciante']

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs border-[1.5px]',
    md: 'h-10 w-10 text-lg border-2',
    lg: 'h-20 w-20 text-4xl border-4',
    xl: 'h-32 w-32 text-6xl border-[6px]',
  }

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", className)}>
      {/* Aura Effect for High Ranks */}
      <div className={cn("absolute inset-0 transition-all duration-1000", rankInfo.auraClass)} />
      
      {/* Main Avatar Circle */}
      <div 
        className={cn(
          "relative z-10 rounded-full flex items-center justify-center transition-all duration-500",
          rankInfo.bgColor,
          rankInfo.borderColor,
          rankInfo.glowColor,
          sizeClasses[size]
        )}
      >
        <span>{classInfo.icon}</span>

        {/* Rank Badge at the bottom */}
        <div className={cn(
          "absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase border shadow-sm z-20",
          rankInfo.bgColor,
          rankInfo.borderColor,
          rankInfo.color,
          size === 'sm' && 'scale-90 -bottom-1 -right-1.5',
          (size === 'lg' || size === 'xl') && 'text-[12px] -bottom-2 -right-2 px-3 py-1'
        )}>
          {rankInfo.label.split(' ')[1]}
        </div>
      </div>
    </div>
  )
}
