'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { History as HistoryIcon, TrendingUp, TrendingDown, Swords, Gift, CheckCircle2, Skull } from 'lucide-react'

export default function HistoryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { toast.error('Erro ao carregar histórico'); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="py-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HistoryIcon className="text-blue-500" /> Histórico
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tudo que aconteceu com seu personagem.</p>
        </header>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tudo</TabsTrigger>
            <TabsTrigger value="habits">Hábitos</TabsTrigger>
            <TabsTrigger value="missions">Missões</TabsTrigger>
            <TabsTrigger value="rewards">Loja</TabsTrigger>
          </TabsList>

          {/* Todas as transações */}
          <TabsContent value="all" className="mt-4 space-y-3">
            {data?.transactions?.length === 0
              ? <p className="text-center text-slate-500 py-8">Nenhuma transação ainda.</p>
              : data?.transactions?.map((t: any) => {
                const isGain = t.xpAmount > 0 || t.coinsAmount > 0
                const TypeIcon = t.type === 'HABIT_COMPLETE' ? CheckCircle2
                  : t.type === 'BAD_HABIT' ? Skull
                  : t.type === 'MISSION_COMPLETE' ? Swords : Gift
                return (
                  <Card key={t.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <CardContent className="p-4 flex gap-3 items-center">
                      <div className={`p-2 rounded-full shrink-0 ${isGain ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t.description}</p>
                        <p className="text-xs text-slate-400">{format(new Date(t.date), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        {t.xpAmount !== 0 && (
                          <p className={`text-sm font-bold ${t.xpAmount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                            {t.xpAmount > 0 ? '+' : ''}{t.xpAmount} XP
                          </p>
                        )}
                        {t.coinsAmount !== 0 && (
                          <p className={`text-sm font-bold ${t.coinsAmount > 0 ? 'text-amber-500' : 'text-red-400'}`}>
                            {t.coinsAmount > 0 ? '+' : ''}{t.coinsAmount} 🪙
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          {/* Check-ins de hábitos */}
          <TabsContent value="habits" className="mt-4 space-y-3">
            {data?.checkins?.length === 0
              ? <p className="text-center text-slate-500 py-8">Nenhum check-in ainda.</p>
              : data?.checkins?.map((c: any) => (
                <Card key={c.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{c.habit.name}</p>
                      <p className="text-xs text-slate-400">{format(new Date(c.date), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <div className="text-right text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      +{c.habit.xpReward} XP
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Missões */}
          <TabsContent value="missions" className="mt-4 space-y-3">
            {data?.completedMissions?.length === 0
              ? <p className="text-center text-slate-500 py-8">Nenhuma missão concluída ainda.</p>
              : data?.completedMissions?.map((m: any) => (
                <Card key={m.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-500 shrink-0">
                      <Swords className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                      <p className="text-xs text-slate-400">{format(new Date(m.completedAt || m.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">+{m.xpReward} XP</p>
                      <p className="text-xs text-amber-500">+{m.coinsReward} 🪙</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Loja */}
          <TabsContent value="rewards" className="mt-4 space-y-3">
            {data?.redemptions?.length === 0
              ? <p className="text-center text-slate-500 py-8">Nenhuma recompensa resgatada ainda.</p>
              : data?.redemptions?.map((r: any) => (
                <Card key={r.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full text-amber-500 shrink-0">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{r.reward.name}</p>
                      <p className="text-xs text-slate-400">{format(new Date(r.date), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <p className="text-sm font-bold text-red-400 shrink-0">-{r.reward.coinCost} 🪙</p>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
