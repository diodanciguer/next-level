'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Flame, Coins, Star, Skull, Swords, Trophy, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { getRank, xpForNextLevel, DIFFICULTY_CONFIG, getRankInfo, CLASS_CONFIG } from '@/lib/game'
import type { Rank, Difficulty, CharacterClass } from '@/lib/game'
import { triggerLevelUpConfetti } from '@/lib/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { useFloatingXp } from '@/components/floating-xp'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'
import Link from 'next/link'

type UserData = { name: string; xp: number; level: number; coins: number; rank: Rank; characterClass: string }
type Habit = { id: string; name: string; xpReward: number; coinsReward: number; checkins: any[] }
type BadHabit = { id: string; name: string; xpLost: number; coinsLost: number; logs: any[] }
type Mission = { id: string; name: string; difficulty: string; xpReward: number; coinsReward: number; status: string }

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<{ user: UserData; habits: Habit[]; badHabits: BadHabit[]; missions: Mission[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const { addFloatingXp, FloatingXpContainer } = useFloatingXp()

  const fetchData = async () => {
    const res = await fetch('/api/dashboard')
    if (res.status === 401) { router.push('/login'); return }
    if (res.ok) setData(await res.json())
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const isHabitDone = (habit: Habit) => {
    const now = new Date()
    const today = new Date(now).setHours(0, 0, 0, 0)
    
    if (habit.frequency === 'diário') {
      return habit.checkins.some(c => new Date(c.date).setHours(0, 0, 0, 0) === today)
    } else {
      // Semanal: Já vem filtrado da API desde segunda-feira
      return habit.checkins.length > 0
    }
  }
  const loggedTodayBad = (bh: BadHabit) => {
    const today = new Date().setHours(0, 0, 0, 0)
    return bh.logs.some(l => new Date(l.date).setHours(0, 0, 0, 0) === today)
  }

  const handleCheckin = async (e: React.MouseEvent, habitId: string, checked: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const res = await fetch(`/api/habits/${habitId}/checkin`, { method: checked ? 'DELETE' : 'POST' })
    const d = await res.json()
    if (res.ok) {
      if (!checked) {
        addFloatingXp(d.xpEarned, rect.left + rect.width / 2, rect.top)
        
        if (d.goalReached) {
          toast.success("🏆 META MENSAL ATINGIDA!", {
            description: `Você completou este hábito ${d.goalReached ? 'pelo número de vezes definido!' : ''} +${d.xpEarned} XP e +${d.coinsEarned} 🪙`,
            duration: 6000
          })
          triggerLevelUpConfetti()
        } else {
          toast.success(`+${d.xpEarned} XP  +${d.coinsEarned} 🪙`)
        }
        
        // Verificar se todos os hábitos foram concluídos agora
        const habitsRes = await fetch('/api/dashboard')
        const latestData = await habitsRes.json()
        const allDone = latestData.habits.every((h: any) => isHabitDone(h))
        
        if (allDone && latestData.habits.length > 0) {
          setTimeout(() => {
            toast.success("🔥 DIA PERFEITO! Todos os hábitos concluídos!", { duration: 6000 })
            triggerLevelUpConfetti()
          }, 500)
        }

        if (d.leveledUp) {
          toast.success(`🎉 LEVEL UP! Você é agora Nível ${d.newLevel}!`, { duration: 5000 })
          triggerLevelUpConfetti()
        }
        if (d.unlockedAchievements?.length > 0) {
          d.unlockedAchievements.forEach((ach: any) => {
            toast.success(`🏆 CONQUISTA DESBLOQUEADA: ${ach.name}`, { 
              description: ach.description,
              icon: ach.icon,
              duration: 6000 
            })
          })
        }
      } else {
        toast.info(`Check-in desfeito. -${d.xpLost} XP`)
        if (d.newLevel < data!.user.level) {
          toast.warning(`Você desceu para o Nível ${d.newLevel}...`, { icon: '📉' })
        }
      }
    } else toast.error(d.message)
    fetchData()
  }

  const handleBadHabit = async (e: React.MouseEvent, id: string, alreadyLogged: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const res = await fetch(`/api/bad-habits/${id}/log`, { method: alreadyLogged ? 'DELETE' : 'POST' })
    const d = await res.json()
    if (res.ok) {
      if (!alreadyLogged) {
        addFloatingXp(d.xpLost, rect.left + rect.width / 2, rect.top, true)
      }
      toast[alreadyLogged ? 'info' : 'warning'](d.message)
    } else toast.error(d.message)
    fetchData()
  }

  const handleCompleteMission = async (e: React.MouseEvent, missionId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const res = await fetch(`/api/missions/${missionId}/complete`, { method: 'POST' })
    const d = await res.json()
    if (res.ok) {
      addFloatingXp(d.xpEarned, rect.left + rect.width / 2, rect.top)
      toast.success(`${d.message} +${d.xpEarned} XP +${d.coinsEarned} 🪙`)
      if (d.leveledUp) {
        toast.success(`🎉 LEVEL UP! Nível ${d.newLevel}!`, { duration: 5000 })
        triggerLevelUpConfetti()
      }
      if (d.unlockedAchievements?.length > 0) {
        d.unlockedAchievements.forEach((ach: any) => {
          toast.success(`🏆 CONQUISTA DESBLOQUEADA: ${ach.name}`, { 
            description: ach.description,
            icon: ach.icon,
            duration: 6000 
          })
        })
      }
    } else toast.error(d.message)
    fetchData()
  }

  if (loading) return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <DashboardSkeleton />
    </div>
  )
  if (!data) return null

  const { user, habits, badHabits, missions } = data
  const rank = getRank(user.level)
  const xpNext = xpForNextLevel(user.level)
  const xpPercent = Math.round((user.xp / xpNext) * 100)
  const completedToday = habits.filter(h => isHabitDone(h)).length
  const classConfig = CLASS_CONFIG[user.characterClass as CharacterClass] || CLASS_CONFIG.Iniciante

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <FloatingXpContainer />
      <motion.main 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto p-4 space-y-6"
      >

        {/* ─── Hero: Status do Personagem ─────────────────────────── */}
        <motion.div variants={item}>
          <Card className={`relative overflow-hidden bg-gradient-to-br ${classConfig.gradient} text-white border-0 shadow-xl`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-9xl font-black">{rank}</span>
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md text-3xl">
                    {classConfig.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{classConfig.label} · Nível {user.level}</p>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      {user.name.split(' ')[0]}
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                    {getRankInfo(user.level).title}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>EXP</span>
                  <span>{xpPercent}%</span>
                </div>
                <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                  />
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-white/60">
                  <span>{user.xp} XP ATUAL</span>
                  <span>{xpNext} XP PARA PRÓXIMO NÍVEL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Stats ──────────────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.xp}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">XP no nível</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.coins}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Moedas</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completedToday}/{habits.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Hoje</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Bons Hábitos ───────────────────────────────────────── */}
        <motion.section variants={item}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Bons Hábitos
            </h2>
            <Link href="/habits"><Button variant="ghost" size="sm" className="text-xs">Ver todos <ChevronRight className="h-3 w-3 ml-1" /></Button></Link>
          </div>
          <div className="space-y-2">
            {habits.length === 0 ? (
              <Link href="/habits"><Card className="p-4 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-sm">
                <p className="text-slate-500 text-sm">Nenhum hábito. Criar agora →</p>
              </Card></Link>
            ) : habits.map(habit => {
              const checked = isHabitDone(habit)
              return (
                <motion.div key={habit.id} layout>
                  <Card className={`transition-all ${checked ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost" size="icon"
                          className={`h-11 w-11 rounded-full border-2 shrink-0 transition-all ${checked ? 'border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-400 hover:text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-green-400 hover:text-green-500'}`}
                          onClick={(e) => handleCheckin(e, habit.id, checked)}
                          title={checked ? 'Desfazer check-in' : 'Marcar como feito'}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${checked ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>{habit.name}</p>
                        <p className="text-xs text-slate-400">+{habit.xpReward} XP · +{habit.coinsReward} 🪙</p>
                      </div>
                      {checked && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 shrink-0">Feito</Badge>}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ─── Maus Hábitos ───────────────────────────────────────── */}
        <motion.section variants={item}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Skull className="h-5 w-5 text-red-400" /> Maus Hábitos
            </h2>
            <Link href="/bad-habits"><Button variant="ghost" size="sm" className="text-xs">Ver todos <ChevronRight className="h-3 w-3 ml-1" /></Button></Link>
          </div>
          <div className="space-y-2">
            {badHabits.length === 0 ? (
              <Link href="/bad-habits"><Card className="p-4 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-sm">
                <p className="text-slate-500 text-sm">Nenhum mau hábito cadastrado →</p>
              </Card></Link>
            ) : badHabits.map(bh => {
              const logged = loggedTodayBad(bh)
              return (
                <motion.div key={bh.id} layout>
                  <Card className={`transition-all ${logged ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost" size="icon"
                          className={`h-11 w-11 rounded-full border-2 shrink-0 transition-all ${logged ? 'border-red-400 bg-red-100 dark:bg-red-900/40 text-red-500 hover:border-slate-400 hover:text-slate-400' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-400 hover:text-red-500'}`}
                          onClick={(e) => handleBadHabit(e, bh.id, logged)}
                          title={logged ? 'Desfazer' : 'Registrar que fiz isso'}
                        >
                          <Skull className="h-5 w-5" />
                        </Button>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{bh.name}</p>
                        <p className="text-xs text-red-400">-{bh.xpLost} XP {bh.coinsLost > 0 && `· -${bh.coinsLost} 🪙`}</p>
                      </div>
                      {logged && <Badge className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-0 shrink-0">Registrado</Badge>}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ─── Missões ────────────────────────────────────────────── */}
        <motion.section variants={item}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Swords className="h-5 w-5 text-purple-500" /> Missões Pendentes
            </h2>
            <Link href="/missions"><Button variant="ghost" size="sm" className="text-xs">Ver todas <ChevronRight className="h-3 w-3 ml-1" /></Button></Link>
          </div>
          <div className="space-y-2">
            {missions.length === 0 ? (
              <Link href="/missions"><Card className="p-4 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-sm">
                <p className="text-slate-500 text-sm">Nenhuma missão pendente. Criar →</p>
              </Card></Link>
            ) : missions.map(m => {
              const diff = DIFFICULTY_CONFIG[m.difficulty as Difficulty]
              return (
                <motion.div key={m.id} layout>
                  <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff?.bgColor} ${diff?.color}`}>{diff?.label}</span>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400">+{m.xpReward} XP · +{m.coinsReward} 🪙</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                          onClick={(e) => handleCompleteMission(e, m.id)}
                        >
                          Concluir
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

      </motion.main>
    </div>
  )
}
