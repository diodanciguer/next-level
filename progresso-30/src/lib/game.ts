// ─── Sistema de XP, Nível e Rank ─────────────────────────────────────────────

/** XP necessário para passar do nível `level` para `level + 1` */
export function xpForNextLevel(level: number): number {
  return level * 100
}

/** Calcula nível e XP atual a partir do XP acumulado */
export function calculateLevelFromXp(totalXp: number): { level: number; currentXp: number; xpForNext: number } {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level)
    level++
  }
  return { level, currentXp: remaining, xpForNext: xpForNextLevel(level) }
}

/** Aplica ganho de XP ao usuário — retorna novo nível e XP */
export function applyXpGain(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): { newLevel: number; newXp: number; leveledUp: boolean } {
  let level = currentLevel
  let xp = currentXp + xpGained
  let leveledUp = false

  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level)
    level++
    leveledUp = true
  }

  return { newLevel: level, newXp: xp, leveledUp }
}

/** Aplica perda de XP — nunca deixa cair abaixo de 0 no nível 1 */
export function applyXpLoss(
  currentLevel: number,
  currentXp: number,
  xpLost: number
): { newLevel: number; newXp: number } {
  let level = currentLevel
  let xp = currentXp - xpLost

  while (xp < 0 && level > 1) {
    level--
    xp += xpForNextLevel(level)
  }

  if (xp < 0) xp = 0

  return { newLevel: level, newXp: xp }
}

// ─── Ranks ───────────────────────────────────────────────────────────────────

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export function getRank(level: number): Rank {
  if (level < 10) return 'E'
  if (level < 20) return 'D'
  if (level < 35) return 'C'
  if (level < 50) return 'B'
  if (level < 80) return 'A'
  return 'S'
}

export const RANK_CONFIGS: Record<Rank, { 
  label: string, 
  title: string, 
  color: string, 
    bgColor: string, 
    borderColor: string,
    glowColor: string,
    auraClass: string 
}> = {
  E: { 
    label: 'Rank E', title: 'Recruta', 
    color: 'text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800', 
    borderColor: 'border-slate-300 dark:border-slate-700',
    glowColor: '', auraClass: '' 
  },
  D: { 
    label: 'Rank D', title: 'Aprendiz', 
    color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/40', 
    borderColor: 'border-green-500/50',
    glowColor: '', auraClass: '' 
  },
  C: { 
    label: 'Rank C', title: 'Aventureiro', 
    color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/40', 
    borderColor: 'border-blue-500',
    glowColor: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', auraClass: '' 
  },
  B: { 
    label: 'Rank B', title: 'Veterano', 
    color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/40', 
    borderColor: 'border-purple-500',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]', 
    auraClass: 'before:absolute before:inset-[-4px] before:rounded-full before:bg-gradient-to-tr before:from-purple-500 before:to-pink-500 before:opacity-20 before:animate-pulse' 
  },
  A: { 
    label: 'Rank A', title: 'Guardião', 
    color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/40', 
    borderColor: 'border-orange-500',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.7)]',
    auraClass: 'before:absolute before:inset-[-6px] before:rounded-full before:bg-gradient-to-tr before:from-orange-500 before:to-yellow-500 before:opacity-30 before:animate-spin-slow' 
  },
  S: { 
    label: 'Rank S', title: 'Lenda Viva', 
    color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/40', 
    borderColor: 'border-yellow-500 shadow-[0_0_10px_#f59e0b]',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.8)]',
    auraClass: 'before:absolute before:inset-[-8px] before:rounded-full before:bg-gradient-to-tr before:from-yellow-400 before:via-orange-500 before:to-red-500 before:opacity-40 before:animate-spin-slow after:absolute after:inset-[-2px] after:rounded-full after:bg-yellow-400 after:animate-ping after:opacity-20' 
  },
}

export function getRankInfo(level: number) {
  const rank = getRank(level)
  return RANK_CONFIGS[rank]
}

// ─── Missões ─────────────────────────────────────────────────────────────────

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME' | 'ABSURD'

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string
  xp: number
  coins: number
  color: string
  bgColor: string
}> = {
  EASY:    { label: 'Fácil',   xp: 10,  coins: 5,   color: 'text-green-500',  bgColor: 'bg-green-100 dark:bg-green-900/40' },
  NORMAL:  { label: 'Normal',  xp: 25,  coins: 10,  color: 'text-blue-500',   bgColor: 'bg-blue-100 dark:bg-blue-900/40' },
  HARD:    { label: 'Difícil', xp: 50,  coins: 25,  color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/40' },
  EXTREME: { label: 'Extrema', xp: 100, coins: 50,  color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
  ABSURD:  { label: 'Absurda', xp: 250, coins: 150, color: 'text-red-500',    bgColor: 'bg-red-100 dark:bg-red-900/40' },
}

// ─── Classes de Personagem ──────────────────────────────────────────────────

export type CharacterClass = 'Iniciante' | 'Guerreiro' | 'Mago' | 'Ladino' | 'Ferreiro'

export const CLASS_CONFIG: Record<CharacterClass, { label: string, description: string, bonusCategory: string, icon: string }> = {
  Iniciante: { label: 'Iniciante', description: 'O começo de uma grande jornada.', bonusCategory: '', icon: '🌟' },
  Guerreiro: { label: 'Guerreiro', description: '+20% XP em Saúde. Focado em força e disciplina física.', bonusCategory: 'Saúde', icon: '⚔️' },
  Mago:      { label: 'Mago',      description: '+20% XP em Estudos. Mestre do conhecimento e foco.', bonusCategory: 'Estudos', icon: '🧙' },
  Ladino:    { label: 'Ladino',    description: '+20% XP em Finanças. Ágil com moedas e economia.', bonusCategory: 'Finanças', icon: '💰' },
  Ferreiro:  { label: 'Ferreiro',  description: '+20% XP em Trabalho/Casa. Mestre da produtividade.', bonusCategory: 'Trabalho', icon: '🛠️' },
}

export function getXpBonus(charClass: string, category: string, baseId: number): number {
  const config = CLASS_CONFIG[charClass as CharacterClass]
  if (config && (config.bonusCategory === category || (config.label === 'Ferreiro' && (category === 'Trabalho' || category === 'Casa')))) {
    return Math.floor(baseId * 0.2) // 20% bonus
  }
  return 0
}
import { prisma } from './prisma'

export async function checkAndUnlockAchievements(userId: string) {
  const [user, habitsCount, missionsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { achievements: true } }),
    prisma.habitCheckin.count({ where: { habit: { userId } } }),
    prisma.mission.count({ where: { userId, status: 'COMPLETED' } })
  ])

  if (!user) return []

  const unlockedIds = new Set(user.achievements.map(a => a.achievementId))
  const allAchievements = await prisma.achievement.findMany()
  const newUnlocks = []

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue

    let met = false
    if (ach.type === 'LEVEL' && user.level >= ach.threshold) met = true
    if (ach.type === 'STREAK' && user.streak >= ach.threshold) met = true
    if (ach.type === 'HABITS_COUNT' && habitsCount >= ach.threshold) met = true
    if (ach.type === 'MISSIONS_COUNT' && missionsCount >= ach.threshold) met = true

    if (met) {
      await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } })
      newUnlocks.push(ach)
    }
  }

  return newUnlocks
}
