'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Rocket, Target, CheckCircle2, Star, Coins } from 'lucide-react'

type PlanHabit = { id: string, name: string, category: string, goal: number, xpReward: number, coinsReward: number }
type Plan = { id: string, name: string, description: string, planHabits: PlanHabit[] }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans')
      const data = await res.json()
      setPlans(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleJoinPlan = async (planId: string) => {
    try {
      const res = await fetch(`/api/plans/${planId}/join`, { method: 'POST' })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erro ao ingressar no plano')
    }
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="py-4 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
            <Rocket className="text-blue-500" /> Planos de 30 Dias
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Escolha um desafio e transforme sua rotina com hábitos pré-configurados.</p>
        </header>

        {loading ? (
          <div className="text-center p-8">Carregando planos...</div>
        ) : plans.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
            <p className="text-slate-500">Nenhum plano disponível no momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map(plan => (
              <Card key={plan.id} className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md border-t-4 border-t-blue-500 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">{plan.name}</CardTitle>
                  <CardDescription className="dark:text-slate-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-blue-500" /> Hábitos inclusos:
                  </h4>
                  <ul className="space-y-2">
                    {plan.planHabits.map(habit => (
                      <li key={habit.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="flex-1 truncate">{habit.name}</span>
                        <div className="flex gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] px-1 border-yellow-200 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400">+{habit.xpReward} XP</Badge>
                          <Badge variant="outline" className="text-[10px] px-1 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">+{habit.coinsReward} 🪙</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleJoinPlan(plan.id)}>
                    Iniciar Plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
