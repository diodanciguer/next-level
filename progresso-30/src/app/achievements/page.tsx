'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Lock, CheckCircle2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/achievements')
      if (res.ok) setAchievements(await res.json())
    } catch (error) {
      console.error('Erro ao carregar conquistas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="min-h-screen pb-20 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <Trophy className="text-yellow-500" /> Galeria de Conquistas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Veja seus marcos alcançados na jornada.</p>
          </div>
          <Card className="bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-900/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unlockedCount} / {achievements.length}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Desbloqueadas</div>
              </div>
            </CardContent>
          </Card>
        </header>

        {loading ? (
          <div className="text-center p-12">Carregando conquistas...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map(ach => (
              <Card 
                key={ach.id} 
                className={`transition-all duration-300 border-l-4 ${ach.unlocked 
                  ? 'bg-white dark:bg-slate-900 border-l-yellow-500 shadow-md opacity-100' 
                  : 'bg-slate-50/50 dark:bg-slate-900/50 border-l-slate-300 dark:border-l-slate-700 opacity-60 grayscale-[0.5]'}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${ach.unlocked ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {ach.unlocked ? ach.icon : <Lock className="h-6 w-6 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold truncate ${ach.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{ach.name}</h3>
                      {ach.unlocked && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 text-[10px]">Novo!</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{ach.description}</p>
                    {ach.unlockedAt && (
                      <p className="text-[10px] text-slate-400 mt-1">Conquistado em {new Date(ach.unlockedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  {ach.unlocked && <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
