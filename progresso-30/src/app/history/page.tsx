'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { History as HistoryIcon, TrendingUp, TrendingDown, Swords, Gift, CheckCircle2, Skull, RotateCcw } from 'lucide-react'

export default function HistoryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { toast.error('Erro ao carregar histórico'); setLoading(false) })
  }, [])

  const handleUndoHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/checkin`, { method: 'DELETE' })
      const d = await res.json()
      if (res.ok) {
        toast.success(d.message)
        // Refresh data
        const r = await fetch('/api/history')
        setData(await r.json())
      } else {
        toast.error(d.message)
      }
    } catch (error) {
      toast.error('Erro ao desfazer check-in')
    }
  }

  const handleUndoMission = async (missionId: string) => {
    try {
      const res = await fetch(`/api/missions/${missionId}/complete`, { method: 'PUT' })
      const d = await res.json()
      if (res.ok) {
        toast.success(d.message)
        const r = await fetch('/api/history')
        setData(await r.json())
      } else {
        toast.error(d.message)
      }
    } catch (error) {
      toast.error('Erro ao desfazer missão')
    }
  }

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

        {/* Heatmap Section */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Atividade (Últimos 30 dias)
            </h3>
            <div className="flex flex-wrap gap-1.5 justify-between">
              {Array.from({ length: 30 }).map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (29 - i))
                const dateStr = date.toISOString().split('T')[0]
                const count = data?.heatmapData?.[dateStr] || 0
                
                // Níveis de cor estilo GitHub
                let bgColor = 'bg-slate-100 dark:bg-slate-800'
                if (count >= 5) bgColor = 'bg-green-600'
                else if (count >= 3) bgColor = 'bg-green-500'
                else if (count >= 1) bgColor = 'bg-green-300 dark:bg-green-700'

                return (
                  <div 
                    key={i}
                    className={`h-4 w-4 rounded-sm ${bgColor} transition-all hover:scale-125 cursor-pointer`}
                    title={`${format(date, 'dd/MM')}: ${count} atividades`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium">
              <span>{format(new Date(new Date().setDate(new Date().getDate() - 29)), 'dd MMM')}</span>
              <span>Hoje</span>
            </div>
          </CardContent>
        </Card>

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
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right space-y-0.5">
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

                        {/* Botão de Desfazer na aba principal */}
                        {(t.type === 'HABIT_COMPLETE' || t.type === 'MISSION_COMPLETE') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1 text-[10px] border-red-100 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              // Precisamos extrair o ID original. Como a transação não guarda o ID do checkin, 
                              // vamos usar a descrição ou buscar pelo contexto.
                              // No entanto, para Habits, o handleUndoHabit já recebe o habitId (que podemos extrair se soubermos qual é).
                              // Por simplicidade, vou sugerir que usem as abas específicas ou vou melhorar o handleUndo.
                              toast.info("Por favor, use as abas 'Hábitos' ou 'Missões' para desfazer.")
                            }}
                          >
                            <RotateCcw className="h-3 w-3" /> Desfazer
                          </Button>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm font-bold text-yellow-600 dark:text-yellow-400">
                        +{c.habit.xpReward} XP
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleUndoHabit(c.habitId)}
                        title="Desfazer check-in"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">+{m.xpReward} XP</p>
                        <p className="text-xs text-amber-500">+{m.coinsReward} 🪙</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleUndoMission(m.id)}
                        title="Desfazer missão"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
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
