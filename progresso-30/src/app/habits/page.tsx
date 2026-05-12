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
import { ListChecks, Plus, Trash2, Star, Coins, Pencil, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFloatingXp } from '@/components/floating-xp'
import { HabitsListSkeleton } from '@/components/dashboard-skeleton'
import { triggerLevelUpConfetti } from '@/lib/confetti'

type Habit = { id: string; name: string; category: string; frequency: string; goal: number; xpReward: number; coinsReward: number; active: boolean; checkins: any[] }

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { addFloatingXp, FloatingXpContainer } = useFloatingXp()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/habits/${editingId}` : '/api/habits'
    const method = editingId ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, frequency, goal: Number(goal), xpReward: Number(xpReward), coinsReward: Number(coinsReward) })
    })
    
    if (res.ok) {
      toast.success(editingId ? 'Hábito atualizado!' : 'Hábito criado!')
      handleCloseDialog()
      fetchData()
    } else toast.error(editingId ? 'Erro ao atualizar' : 'Erro ao criar hábito')
  }

  const handleCloseDialog = () => {
    setIsOpen(false)
    setEditingId(null)
    setName('')
    setCategory('Saúde')
    setFrequency('diário')
    setGoal('30')
    setXpReward('10')
    setCoinsReward('5')
  }

  const openEditDialog = (habit: Habit) => {
    setEditingId(habit.id)
    setName(habit.name)
    setCategory(habit.category)
    setFrequency(habit.frequency)
    setGoal(String(habit.goal))
    setXpReward(String(habit.xpReward))
    setCoinsReward(String(habit.coinsReward))
    setIsOpen(true)
  }

  const handleCheckin = async (e: React.MouseEvent, habitId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const res = await fetch(`/api/habits/${habitId}/checkin`, { method: 'POST' })
    const d = await res.json()
    if (res.ok) {
      addFloatingXp(d.xpEarned, rect.left + rect.width / 2, rect.top)
      if (d.goalReached) {
        toast.success("🏆 META MENSAL ATINGIDA!", {
          description: `Bônus de 5x aplicado! +${d.xpEarned} XP e +${d.coinsEarned} 🪙`,
          duration: 6000
        })
        triggerLevelUpConfetti()
      } else {
        toast.success(`+${d.xpEarned} XP  +${d.coinsEarned} 🪙`)
      }
      fetchData()
    } else toast.error(d.message)
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
      <FloatingXpContainer />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-4 space-y-6"
      >

        <header className="py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListChecks className="text-green-500" /> Bons Hábitos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Hábitos que constroem seu progresso diário.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger render={<Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { handleCloseDialog(); setIsOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Novo Hábito
              </Button>}>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Hábito' : 'Criar Bom Hábito'}</DialogTitle>
                <DialogDescription>Defina as recompensas de XP e moedas que você vai ganhar ao cumprir.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  {editingId ? 'Salvar Alterações' : 'Criar Hábito'}
                </Button>
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
          {loading ? <HabitsListSkeleton />
          : habits.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <ListChecks className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Nenhum hábito cadastrado ainda.</p>
              <p className="text-slate-400 text-sm">Crie seu primeiro hábito acima!</p>
            </Card>
          ) : (
            <AnimatePresence>
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 rounded-full border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-green-500 hover:border-green-500"
                            onClick={(e) => handleCheckin(e, habit.id)}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </Button>
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{habit.name}</h3>
                          <div className="flex gap-2 mt-0.5 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{habit.category}</Badge>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{habit.frequency}</Badge>
                          </div>
                          <div className="flex gap-3 mt-1.5 text-xs">
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500" /> +{habit.xpReward} XP
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Coins className="h-3 w-3 fill-amber-500" /> +{habit.coinsReward} moedas
                            </span>
                            <span className="text-slate-400">Meta: {habit.goal}x/mês</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(habit)}
                          className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(habit.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </motion.main>
    </div>
  )
}
