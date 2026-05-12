'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { getRank, xpForNextLevel, CLASS_CONFIG, getRankInfo, RANK_CONFIGS } from '@/lib/game'
import type { Rank, CharacterClass } from '@/lib/game'
import { Star, Coins, TrendingUp, ShieldCheck, Flame, Info, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { triggerSimpleConfetti } from '@/lib/confetti'
import { CharacterAvatar } from '@/components/character-avatar'

type User = { name: string; xp: number; level: number; coins: number; rank: Rank; characterClass: string; streak: number }

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClassOpen, setIsClassOpen] = useState(false)

  const fetchUser = () => {
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) { router.push('/login'); return }
      const data = await r.json()
      setUser(data)
      setLoading(false)
      if (data.characterClass === 'Iniciante' && data.level >= 1) {
        setIsClassOpen(true)
      }
    })
  }

  useEffect(() => { fetchUser() }, [])

  const handleSelectClass = async (className: CharacterClass) => {
    const res = await fetch('/api/user/class', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterClass: className })
    })
    if (res.ok) {
      toast.success(`Parabéns! Você agora é um ${className}!`)
      triggerSimpleConfetti()
      setIsClassOpen(false)
      fetchUser()
    } else {
      toast.error('Erro ao selecionar classe')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>
  if (!user) return null

  const rank = getRank(user.level)
  const rankInfo = getRankInfo(user.level)
  const xpNext = xpForNextLevel(user.level)
  const xpPercent = Math.round((user.xp / xpNext) * 100)
  const charClass = CLASS_CONFIG[user.characterClass as CharacterClass] || CLASS_CONFIG.Iniciante

  const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S']
  const RANK_LABELS: Record<Rank, string> = {
    E: 'Nível 1–9', D: 'Nível 10–19', C: 'Nível 20–34',
    B: 'Nível 35–49', A: 'Nível 50–79', S: 'Nível 80+'
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 space-y-6">

        {/* ─── Hero Card ────────────────────────────────────────────── */}
        <Card className={`${rankInfo.bgColor} border-0 shadow-xl overflow-hidden relative`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-24 w-24" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-5 mb-6">
              <CharacterAvatar level={user.level} characterClass={user.characterClass} size="lg" />
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user.name}</h1>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${rankInfo.color}`}>{rankInfo.label} — {rankInfo.title}</p>
                  <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-0 text-xs font-bold uppercase tracking-wider">
                    {charClass.label}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Nível {user.level}</p>
              </div>
              <div className={`ml-auto text-7xl font-black ${rankInfo.color} opacity-20 select-none`}>
                {rank}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-700 dark:text-slate-300">{user.xp} / {xpNext} XP</span>
                <span className="text-slate-500 dark:text-slate-400">{xpPercent}%</span>
              </div>
              <Progress value={xpPercent} className="h-4" />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                Faltam {xpNext - user.xp} XP para o nível {user.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame className="h-6 w-6 text-orange-500" />, label: 'Sequência', value: `${user.streak} dias` },
            { icon: <Star className="h-6 w-6 text-yellow-500" />, label: 'XP atual', value: user.xp },
            { icon: <Coins className="h-6 w-6 text-amber-500" />, label: 'Moedas', value: user.coins },
          ].map(s => (
            <Card key={s.label} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Class Info ───────────────────────────────────────────── */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" /> Sua Classe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex gap-4 items-start">
              <div className="text-4xl">{charClass.icon}</div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{charClass.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{charClass.description}</p>
                {user.characterClass === 'Iniciante' ? (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsClassOpen(true)}>
                    Escolher uma Classe
                  </Button>
                ) : (
                  <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0">Bônus Ativo</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Rank Progression ─────────────────────────────────────── */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-500" /> Progressão de Rank
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {RANKS.map(r => (
                <div
                  key={r}
                  className={`rounded-xl p-3 text-center transition-all ${r === rank
                    ? `${RANK_CONFIGS[r].bgColor} ring-2 ring-offset-2 ring-current ${RANK_CONFIGS[r].color} scale-105`
                    : 'bg-slate-50 dark:bg-slate-800 opacity-50'
                  }`}
                >
                  <div className={`text-3xl font-black ${RANK_CONFIGS[r].color}`}>{r}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{RANK_LABELS[r]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>

      {/* ─── Dialog Seleção de Classe ────────────────────────────── */}
      <Dialog open={isClassOpen} onOpenChange={setIsClassOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-500" /> Escolha sua Classe
            </DialogTitle>
            <DialogDescription>
              As classes definem seu estilo de vida e dão bônus de **+20% XP** em categorias específicas. Escolha com sabedoria!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {(Object.entries(CLASS_CONFIG) as [CharacterClass, typeof CLASS_CONFIG[CharacterClass]][])
              .filter(([key]) => key !== 'Iniciante')
              .map(([key, cfg]) => (
                <Card 
                  key={key} 
                  className="cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-slate-200 dark:border-slate-800"
                  onClick={() => handleSelectClass(key)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-4xl">{cfg.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{cfg.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">Selecionar</Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
