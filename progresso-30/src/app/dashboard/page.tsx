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
import { getRank, xpForNextLevel, DIFFICULTY_CONFIG, getRankInfo } from '@/lib/game'
import type { Rank, Difficulty } from '@/lib/game'
import Link from 'next/link'
import { triggerLevelUpConfetti } from '@/lib/confetti'

type UserData = { name: string; xp: number; level: number; coins: number; rank: Rank }
type Habit = { id: string; name: string; xpReward: number; coinsReward: number; checkins: any[] }
type BadHabit = { id: string; name: string; xpLost: number; coinsLost: number; logs: any[] }
type Mission = { id: string; name: string; difficulty: string; xpReward: number; coinsReward: number; status: string }

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<{ user: UserData; habits: Habit[]; badHabits: BadHabit[]; missions: Mission[] } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const res = await fetch('/api/dashboard')
    if (res.status === 401) { router.push('/login'); return }
    if (res.ok) setData(await res.json())
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const isCheckedInToday = (habit: Habit) => {
    const today = new Date().setHours(0, 0, 0, 0)
    return habit.checkins.some(c => new Date(c.date).setHours(0, 0, 0, 0) === today)
  }
  const loggedTodayBad = (bh: BadHabit) => {
    const today = new Date().setHours(0, 0, 0, 0)
    return bh.logs.some(l => new Date(l.date).setHours(0, 0, 0, 0) === today)
  }

  const handleCheckin = async (habitId: string, checked: boolean) => {
    const res = await fetch(`/api/habits/${habitId}/checkin`, { method: checked ? 'DELETE' : 'POST' })
    const d = await res.json()
    if (res.ok) {
      if (checked) {
        toast.info(`Check-in desfeito. -${d.xpLost} XP`)
        if (d.newLevel < data!.user.level) {
          toast.warning(`Você desceu para o Nível ${d.newLevel}...`, { icon: '📉' })
        }
      } else {
        toast.success(`+${d.xpEarned} XP  +${d.coinsEarned} 🪙`)
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
      }
    } else toast.error(d.message)
    fetchData()
  }

  const handleBadHabit = async (id: string, alreadyLogged: boolean) => {
    const res = await fetch(`/api/bad-habits/${id}/log`, { method: alreadyLogged ? 'DELETE' : 'POST' })
    const d = await res.json()
    if (res.ok) toast[alreadyLogged ? 'info' : 'warning'](d.message)
    else toast.error(d.message)
    fetchData()
  }

  const handleCompleteMission = async (missionId: string) => {
    const res = await fetch(`/api/missions/${missionId}/complete`, { method: 'POST' })
    const d = await res.json()
    if (res.ok) {
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

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>
  if (!data) return null

  const { user, habits, badHabits, missions } = data
  const rank = getRank(user.level)
  const xpNext = xpForNextLevel(user.level)
  const xpPercent = Math.round((user.xp / xpNext) * 100)
  const completedToday = habits.filter(h => isCheckedInToday(h)).length

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">

        {/* ─── Hero: Status do Personagem ─────────────────────────── */}
        <Card className={`${getRankInfo(user.level).bgColor} border-0 shadow-lg`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Olá, {user.name.split(' ')[0]}!</p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Nível {user.level}</h1>
              </div>
              <div className={`text-5xl font-black ${getRankInfo(user.level).color}`}>
                {rank}
              </div>
            </div>
            <Progress value={xpPercent} className="h-3 mb-1" />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{user.xp} XP</span>
              <span>{xpNext} XP para nível {user.level + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* ─── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
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
        </div>

        {/* ─── Bons Hábitos ───────────────────────────────────────── */}
        <section>
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
              const checked = isCheckedInToday(habit)
              return (
                <Card key={habit.id} className={`transition-all ${checked ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Button
                      variant="ghost" size="icon"
                      className={`h-11 w-11 rounded-full border-2 shrink-0 transition-all ${checked ? 'border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-400 hover:text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-green-400 hover:text-green-500'}`}
                      onClick={() => handleCheckin(habit.id, checked)}
                      title={checked ? 'Desfazer check-in' : 'Marcar como feito'}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${checked ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>{habit.name}</p>
                      <p className="text-xs text-slate-400">+{habit.xpReward} XP · +{habit.coinsReward} 🪙</p>
                    </div>
                    {checked && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 shrink-0">Feito</Badge>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* ─── Maus Hábitos ───────────────────────────────────────── */}
        <section>
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
                <Card key={bh.id} className={`transition-all ${logged ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Button
                      variant="ghost" size="icon"
                      className={`h-11 w-11 rounded-full border-2 shrink-0 transition-all ${logged ? 'border-red-400 bg-red-100 dark:bg-red-900/40 text-red-500 hover:border-slate-400 hover:text-slate-400' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-400 hover:text-red-500'}`}
                      onClick={() => handleBadHabit(bh.id, logged)}
                      title={logged ? 'Desfazer' : 'Registrar que fiz isso'}
                    >
                      <Skull className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{bh.name}</p>
                      <p className="text-xs text-red-400">-{bh.xpLost} XP {bh.coinsLost > 0 && `· -${bh.coinsLost} 🪙`}</p>
                    </div>
                    {logged && <Badge className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-0 shrink-0">Registrado</Badge>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* ─── Missões ────────────────────────────────────────────── */}
        <section>
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
                <Card key={m.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff?.bgColor} ${diff?.color}`}>{diff?.label}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                      <p className="text-xs text-slate-400">+{m.xpReward} XP · +{m.coinsReward} 🪙</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                      onClick={() => handleCompleteMission(m.id)}
                    >
                      Concluir
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}
