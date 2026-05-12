'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ListChecks, Plus, Trash2, Star, Coins } from 'lucide-react'

type Habit = { id: string; name: string; category: string; frequency: string; goal: number; xpReward: number; coinsReward: number; active: boolean; checkins: any[] }

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Saúde')
  const [frequency, setFrequency] = useState('diário')
  const [goal, setGoal] = useState('30')
  const [xpReward, setXpReward] = useState('10')
  const [coinsReward, setCoinsReward] = useState('5')

  const fetchData = async () => {
    const res = await fetch('/api/habits')
    if (res.ok) setHabits(await res.json())
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, frequency, goal: Number(goal), xpReward: Number(xpReward), coinsReward: Number(coinsReward) })
    })
    if (res.ok) {
      toast.success('Hábito criado!')
      setIsOpen(false); setName('')
      fetchData()
    } else toast.error('Erro ao criar hábito')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este hábito?')) return
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Hábito excluído'); fetchData() }
    else toast.error('Erro ao excluir')
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">

        <header className="py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListChecks className="text-green-500" /> Bons Hábitos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Hábitos que constroem seu progresso diário.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-green-600 hover:bg-green-700 text-white" />}>
              <Plus className="mr-2 h-4 w-4" /> Novo Hábito
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Bom Hábito</DialogTitle>
                <DialogDescription>Defina as recompensas de XP e moedas que você vai ganhar ao cumprir.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome do Hábito</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Ir à academia" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={v => setCategory(v || 'Saúde')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Saúde','Estudos','Finanças','Trabalho','Casa','Outro'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select value={frequency} onValueChange={v => setFrequency(v || 'diário')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diário">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Meta (vezes/mês)</Label>
                    <Input type="number" min="1" value={goal} onChange={e => setGoal(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> XP</Label>
                    <Input type="number" min="1" value={xpReward} onChange={e => setXpReward(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Coins className="h-3 w-3 text-amber-500" /> Moedas</Label>
                    <Input type="number" min="0" value={coinsReward} onChange={e => setCoinsReward(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Criar Hábito</Button>
              </form>
            </DialogContent>
          </Dialog>
      </header>

        {/* Sugestões de Hábitos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Star className="h-4 w-4" /> Sugestões Rápidas
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
              { name: 'Beber 2L Água', cat: 'Saúde' },
              { name: 'Ler 10 Páginas', cat: 'Estudos' },
              { name: 'Academia', cat: 'Saúde' },
              { name: 'Meditar 5 min', cat: 'Saúde' },
              { name: 'Estudar 30 min', cat: 'Estudos' },
              { name: 'Arrumar Cama', cat: 'Casa' },
              { name: 'Dormir Cedo', cat: 'Saúde' },
              { name: 'Caminhada 15min', cat: 'Saúde' },
              { name: 'Organizar Dia', cat: 'Trabalho' },
              { name: 'Comer Fruta', cat: 'Saúde' }
            ].map(s => (
              <Button 
                key={s.name} 
                variant="outline" 
                size="sm" 
                className="shrink-0 bg-slate-50 hover:bg-green-50 dark:bg-slate-800 dark:hover:bg-green-900/20 text-xs gap-2"
                onClick={() => {
                  setName(s.name); setCategory(s.cat); setIsOpen(true)
                }}
              >
                <Plus className="h-3 w-3" /> {s.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? <p className="text-center text-slate-500 py-8">Carregando...</p>
          : habits.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <ListChecks className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Nenhum hábito cadastrado ainda.</p>
              <p className="text-slate-400 text-sm">Crie seu primeiro hábito acima!</p>
            </Card>
          ) : habits.map(habit => (
            <Card key={habit.id} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all">
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{habit.name}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{habit.category}</Badge>
                    <Badge variant="outline" className="text-xs">{habit.frequency}</Badge>
                  </div>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" /> +{habit.xpReward} XP
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Coins className="h-3 w-3" /> +{habit.coinsReward} moedas
                    </span>
                    <span className="text-slate-400 text-xs">Meta: {habit.goal}x/mês</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(habit.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  )
}
