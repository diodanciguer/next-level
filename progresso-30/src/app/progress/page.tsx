'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts'
import { TrendingUp, CheckCircle2, Star, Zap, Calendar, Target, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type StatData = {
  chartData: { date: string; label: string; xp: number; habits: number }[]
  categoryData: { name: string; value: number }[]
  stats: {
    totalXp: number
    totalHabits: number
    avgXp: number
    bestDay: { label: string; xp: number } | null
  }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

export default function ProgressPage() {
  const [data, setData] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4 pt-20 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 sm:pb-10 sm:pt-16">
      <Navbar />

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <TrendingUp className="text-blue-500 h-8 w-8" /> 
            Dashboard de Evolução
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Acompanhe sua jornada épica e visualize seu crescimento.
          </p>
        </header>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="h-16 w-16" />
            </div>
            <CardContent className="p-5">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">XP Total (Semana)</p>
              <h2 className="text-3xl font-black mt-1">{data?.stats.totalXp}</h2>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Hábitos Concluídos</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{data?.stats.totalHabits}</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Média de XP/Dia</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{data?.stats.avgXp}</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Melhor Dia</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{data?.stats.bestDay?.label || '--'}</h2>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* XP Progress Chart */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" /> Curva de Aprendizado (XP)
              </CardTitle>
              <CardDescription>Ganhos de XP nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habit Consistency Chart */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" /> Consistência de Hábitos
              </CardTitle>
              <CardDescription>Quantidade de check-ins diários</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9', opacity: 0.5}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="habits" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Pie Chart */}
          <Card className="lg:col-span-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Foco por Categoria</CardTitle>
              <CardDescription>Distribuição de XP</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {data?.categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                  Sem dados suficientes
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data?.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tips/Motivational Card */}
          <Card className="lg:col-span-2 bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full">
              <div className="bg-blue-500/20 w-fit p-3 rounded-2xl mb-6">
                <Star className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Mantenha a chama acesa, Herói!</h2>
              <p className="text-slate-300 leading-relaxed max-w-xl">
                Seu crescimento nos últimos dias mostra que você está se tornando uma versão melhor de si mesmo. 
                Lembre-se: o segredo não é a perfeição, mas sim a consistência. Cada pequeno hábito conta como um passo em direção ao topo!
              </p>
              <div className="mt-8 flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest">Dica do Dia</span>
                  <span className="text-sm font-medium italic">"Pequenos hábitos hoje, grandes conquistas amanhã."</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
