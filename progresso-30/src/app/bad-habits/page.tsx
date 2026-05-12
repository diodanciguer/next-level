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
import { Skull, Plus, Undo2, AlertTriangle, Trash2, Pencil } from 'lucide-react'

type BadHabit = { id: string; name: string; description?: string; category: string; xpLost: number; coinsLost: number; logs: { date: string }[] }

export default function BadHabitsPage() {
  const [badHabits, setBadHabits] = useState<BadHabit[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Saúde')
  const [xpLost, setXpLost] = useState('10')
  const [coinsLost, setCoinsLost] = useState('0')

  const fetchData = async () => {
    const res = await fetch('/api/bad-habits')
    if (res.ok) setBadHabits(await res.json())
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/bad-habits/${editingId}` : '/api/bad-habits'
    const method = editingId ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, category, xpLost: Number(xpLost), coinsLost: Number(coinsLost) })
    })
    
    if (res.ok) {
      toast.success(editingId ? 'Mau hábito atualizado!' : 'Mau hábito cadastrado!')
      handleCloseDialog()
      fetchData()
    } else toast.error(editingId ? 'Erro ao atualizar' : 'Erro ao criar mau hábito')
  }

  const handleCloseDialog = () => {
    setIsOpen(false)
    setEditingId(null)
    setName('')
    setDescription('')
    setCategory('Saúde')
    setXpLost('10')
    setCoinsLost('0')
  }

  const openEditDialog = (bh: BadHabit) => {
    setEditingId(bh.id)
    setName(bh.name)
    setDescription(bh.description || '')
    setCategory(bh.category)
    setXpLost(String(bh.xpLost))
    setCoinsLost(String(bh.coinsLost))
    setIsOpen(true)
  }

  const handleLog = async (id: string, alreadyLogged: boolean) => {
    const res = await fetch(`/api/bad-habits/${id}/log`, { method: alreadyLogged ? 'DELETE' : 'POST' })
    const d = await res.json()
    if (res.ok) toast[alreadyLogged ? 'info' : 'warning'](d.message)
    else toast.error(d.message)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este mau hábito e todo o seu histórico?')) return
    const res = await fetch(`/api/bad-habits/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Mau hábito removido!')
      fetchData()
    } else {
      toast.error('Erro ao remover mau hábito')
    }
  }

  const isLoggedToday = (bh: BadHabit) => {
    const today = new Date().setHours(0, 0, 0, 0)
    return bh.logs.some(l => new Date(l.date).setHours(0, 0, 0, 0) === today)
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">

        <header className="py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Skull className="text-red-500" /> Maus Hábitos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Registre quando ceder e veja o impacto no seu progresso.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger render={<Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { handleCloseDialog(); setIsOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Novo
              </Button>}>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Mau Hábito' : 'Cadastrar Mau Hábito'}</DialogTitle>
                <DialogDescription>Um hábito que você quer evitar. Quando registrá-lo, perderá XP.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Gastei por impulso" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Contexto do hábito" />
                </div>
                <div className="grid grid-cols-3 gap-3">
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
                    <Label>XP perdido</Label>
                    <Input type="number" min="1" value={xpLost} onChange={e => setXpLost(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Moedas perdidas</Label>
                    <Input type="number" min="0" value={coinsLost} onChange={e => setCoinsLost(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Mau Hábito'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Sugestões de Maus Hábitos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Skull className="h-4 w-4" /> Sugestões de Vilões
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
              { name: 'Fumar', cat: 'Saúde' },
              { name: 'Comer Doces', cat: 'Saúde' },
              { name: 'Redes Sociais', cat: 'Procrastinação' },
              { name: 'Gastar à toa', cat: 'Finanças' },
              { name: 'Roer Unhas', cat: 'Saúde' },
              { name: 'Dormir Tarde', cat: 'Saúde' },
              { name: 'Refrigerante', cat: 'Saúde' },
              { name: 'Fast Food', cat: 'Saúde' },
              { name: 'Reclamar', cat: 'Outro' },
              { name: 'Sedentarismo', cat: 'Saúde' }
            ].map(s => (
              <Button 
                key={s.name} 
                variant="outline" 
                size="sm" 
                className="shrink-0 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 text-xs gap-2"
                onClick={() => {
                  setName(s.name); setCategory(s.cat === 'Procrastinação' ? 'Trabalho' : s.cat); setIsOpen(true)
                }}
              >
                <Plus className="h-3 w-3" /> {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Aviso motivacional */}
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Seja honesto com você mesmo. A punição é leve — o objetivo não é te desmotivar, mas te fazer consciente dos seus hábitos. Após registrar, crie uma <strong>missão de recuperação</strong> para compensar!
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {loading ? <p className="text-center text-slate-500 py-8">Carregando...</p>
          : badHabits.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <Skull className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Nenhum mau hábito cadastrado.</p>
              <p className="text-slate-400 text-sm">Cadastre os hábitos que quer evitar para acompanhar.</p>
            </Card>
          ) : badHabits.map(bh => {
            const logged = isLoggedToday(bh)
            return (
              <Card key={bh.id} className={`transition-all ${logged ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{bh.name}</h3>
                      <Badge variant="secondary" className="text-xs">{bh.category}</Badge>
                    </div>
                    {bh.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bh.description}</p>}
                    <p className="text-sm text-red-500 font-medium mt-1">
                      -{bh.xpLost} XP {bh.coinsLost > 0 && `· -${bh.coinsLost} 🪙`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!logged && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(bh)}
                          className="text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 opacity-50 hover:opacity-100 transition-opacity">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(bh.id)}
                          className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {logged && (
                      <Button variant="ghost" size="icon" title="Desfazer" onClick={() => handleLog(bh.id, true)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant={logged ? 'secondary' : 'destructive'}
                      size="sm"
                      onClick={() => handleLog(bh.id, logged)}
                    >
                      {logged ? 'Feito hoje' : 'Registrar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
