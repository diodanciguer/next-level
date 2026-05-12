'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Swords, Plus, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react'
import { DIFFICULTY_CONFIG } from '@/lib/game'
import type { Difficulty } from '@/lib/game'
import { triggerLevelUpConfetti } from '@/lib/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { useFloatingXp } from '@/components/floating-xp'
import { MissionsSkeleton } from '@/components/dashboard-skeleton'

type Mission = { id: string; name: string; description?: string; difficulty: string; xpReward: number; coinsReward: number; status: string; createdAt: string; completedAt?: string }

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { addFloatingXp, FloatingXpContainer } = useFloatingXp()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')

  const fetchData = async () => {
    const res = await fetch('/api/missions')
    if (res.ok) setMissions(await res.json())
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const diff = DIFFICULTY_CONFIG[difficulty]
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, difficulty })
    })
    if (res.ok) {
      toast.success(`Missão criada! Recompensa: +${diff.xp} XP +${diff.coins} 🪙`)
      setIsOpen(false); setName(''); setDescription('')
      fetchData()
    } else toast.error('Erro ao criar missão')
  }

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const res = await fetch(`/api/missions/${id}/complete`, { method: 'POST' })
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
      fetchData()
    } else toast.error(d.message)
  }

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/missions/${id}/complete`, { method: 'DELETE' })
    if (res.ok) {
        toast.info('Missão cancelada.')
        fetchData()
    }
    else toast.error((await res.json()).message)
  }

  const handleUndo = async (id: string) => {
    const res = await fetch(`/api/missions/${id}/complete`, { method: 'PUT' })
    const d = await res.json()
    if (res.ok) {
      toast.info(`Missão desfeita. -${d.xpLost} XP`)
      fetchData()
    } else {
      toast.error(d.message)
    }
  }

  const pending = missions.filter(m => m.status === 'PENDING')
  const completed = missions.filter(m => m.status === 'COMPLETED')
  const cancelled = missions.filter(m => m.status === 'CANCELLED')

  const MissionCard = ({ m }: { m: Mission }) => {
    const diff = DIFFICULTY_CONFIG[m.difficulty as Difficulty]
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff?.bgColor} ${diff?.color}`}>
                    {diff?.label}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{m.name}</h3>
                {m.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.description}</p>}
                <p className="text-xs text-purple-500 font-medium mt-1">+{m.xpReward} XP · +{m.coinsReward} 🪙</p>
              </div>
              {m.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleCancel(m.id)}
                    className="text-slate-400 hover:text-red-500 h-8 px-2">
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8" onClick={(e) => handleComplete(e, m.id)}>
                        Concluir
                    </Button>
                  </motion.div>
                </div>
              )}
              {m.status === 'COMPLETED' && (
                <div className="flex gap-2 shrink-0 items-center">
                  <Button size="sm" variant="ghost" onClick={() => handleUndo(m.id)}
                    className="text-slate-400 hover:text-amber-500 h-8 px-2" title="Desfazer">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Concluída
                  </Badge>
                </div>
              )}
              {m.status === 'CANCELLED' && (
                <Badge variant="secondary" className="shrink-0 opacity-60">Cancelada</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <FloatingXpContainer />
      {loading ? <MissionsSkeleton /> : (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-4 space-y-6"
      >

        <header className="py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Swords className="text-purple-500" /> Missões
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Crie e conclua missões para ganhar XP e moedas.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Missão
              </Button>}>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Missão</DialogTitle>
                <DialogDescription>Escolha a dificuldade para definir a recompensa automaticamente.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome da Missão</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Organizar o quarto" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhe a missão..." />
                </div>
                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select value={difficulty} onValueChange={v => setDifficulty((v || 'NORMAL') as Difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className={cfg.color}>{cfg.label}</span>
                          <span className="text-slate-400 ml-2">+{cfg.xp} XP +{cfg.coins} 🪙</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {difficulty && (
                  <div className={`rounded-lg p-3 text-sm ${DIFFICULTY_CONFIG[difficulty].bgColor}`}>
                    <span className={`font-bold ${DIFFICULTY_CONFIG[difficulty].color}`}>Recompensa: </span>
                    +{DIFFICULTY_CONFIG[difficulty].xp} XP e +{DIFFICULTY_CONFIG[difficulty].coins} moedas
                  </div>
                )}
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Criar Missão</Button>
              </form>
            </DialogContent>
          </Dialog>
      </header>

        {/* Sugestões de Missões */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Swords className="h-4 w-4" /> Mural de Aventuras
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
              { name: 'Faxina Pesada', diff: 'HARD' },
              { name: 'Finalizar Curso', diff: 'EXTREME' },
              { name: 'Organizar Finanças', diff: 'NORMAL' },
              { name: '10km de Corrida', diff: 'HARD' },
              { name: 'Sem Redes Sociais', diff: 'NORMAL' },
              { name: 'Ler Livro Inteiro', diff: 'ABSURD' },
              { name: 'Consertar Algo', diff: 'NORMAL' },
              { name: 'Fazer Feira', diff: 'EASY' },
              { name: 'Reunião Importante', diff: 'HARD' },
              { name: 'Projeto Finalizado', diff: 'EXTREME' }
            ].map(s => (
              <Button 
                key={s.name} 
                variant="outline" 
                size="sm" 
                className="shrink-0 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-900/20 text-xs gap-2"
                onClick={() => {
                  setName(s.name); setDifficulty(s.diff as Difficulty); setIsOpen(true)
                }}
              >
                <Plus className="h-3 w-3" /> {s.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-4 w-4" /> Pendentes {pending.length > 0 && <Badge className="ml-1 h-4 w-4 p-0 text-xs bg-purple-500">{pending.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed"><CheckCircle2 className="h-4 w-4 mr-1" /> Concluídas</TabsTrigger>
            <TabsTrigger value="cancelled"><XCircle className="h-4 w-4 mr-1" /> Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
                {pending.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <Swords className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">Nenhuma missão pendente.</p>
                        <p className="text-slate-400 text-sm">Crie uma missão para começar!</p>
                    </Card>
                </motion.div>
                ) : pending.map(m => <MissionCard key={m.id} m={m} />)}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
                {completed.length === 0
                ? <p className="text-center text-slate-500 py-8">Nenhuma missão concluída ainda.</p>
                : completed.map(m => <MissionCard key={m.id} m={m} />)}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout">
                {cancelled.length === 0
                ? <p className="text-center text-slate-500 py-8">Nenhuma missão cancelada.</p>
                : cancelled.map(m => <MissionCard key={m.id} m={m} />)}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

      </motion.main>
      )}
    </div>
  )
}
