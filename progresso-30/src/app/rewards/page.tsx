'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Store, Plus, Trophy, Lock, Undo2, ShieldCheck } from 'lucide-react'

type Reward = { id: string; name: string; description?: string; coinCost: number; levelRequired: number; category: string }
type User = { coins: number; level: number }
type RecentRedemption = { rewardId: string; date: string }

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [recentRedemptions, setRecentRedemptions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coinCost, setCoinCost] = useState('100')
  const [levelRequired, setLevelRequired] = useState('1')
  const [category, setCategory] = useState('Lazer')

  const fetchData = async () => {
    const [userRes, rewardsRes, historyRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/rewards'),
      fetch('/api/history')
    ])
    const userData = await userRes.json()
    const rewardsData = await rewardsRes.json()
    const historyData = await historyRes.json()

    setUser(userData)
    setRewards(Array.isArray(rewardsData) ? rewardsData : [])

    const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    const recent = new Set<string>(
      (historyData.redemptions || [])
        .filter((r: RecentRedemption) => new Date(r.date) >= oneDayAgo)
        .map((r: RecentRedemption) => r.rewardId)
    )
    setRecentRedemptions(recent)
    setLoading(false)
    window.dispatchEvent(new Event('user-updated'))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, coinCost: Number(coinCost), levelRequired: Number(levelRequired), category })
    })
    if (res.ok) {
      toast.success('Recompensa criada!')
      setIsOpen(false); setName(''); setDescription('')
      fetchData()
    } else toast.error('Erro ao criar recompensa')
  }

  const handleRedeem = async (r: Reward) => {
    const res = await fetch(`/api/rewards/${r.id}/redeem`, { method: 'POST' })
    const d = await res.json()
    if (res.ok) {
      toast.success(`🎁 ${d.message}`, {
        action: { label: 'Desfazer', onClick: () => handleUndo(r) },
        duration: 8000
      })
      fetchData()
    } else toast.error(d.message)
  }

  const handleUndo = async (r: Reward) => {
    const res = await fetch(`/api/rewards/${r.id}/redeem`, { method: 'DELETE' })
    const d = await res.json()
    if (res.ok) toast.info(`↩️ Resgate desfeito. +${d.coinsReturned} 🪙 devolvidas.`)
    else toast.error(d.message)
    fetchData()
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-6">

        <header className="py-4 flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Suas Moedas</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user?.coins || 0} 🪙</h2>
            </div>
            <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Seu Nível</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nível {user?.level || 1}</h2>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-purple-600 hover:bg-purple-700 text-white" />}>
              <Plus className="mr-2 h-4 w-4" /> Nova Recompensa
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Recompensa</DialogTitle>
                <DialogDescription>Defina uma recompensa pessoal para comprar com moedas.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Assistir um filme" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhe..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={v => setCategory(v || 'Lazer')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Lazer','Descanso','Compra','Comida','Saúde','Especial'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Custo (🪙)</Label>
                    <Input type="number" min="1" value={coinCost} onChange={e => setCoinCost(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nível mín.</Label>
                    <Input type="number" min="1" value={levelRequired} onChange={e => setLevelRequired(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Criar Recompensa</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Store className="text-purple-500" /> Loja de Recompensas
          </h2>

          {loading ? <p className="text-center text-slate-500 py-8">Carregando...</p>
          : rewards.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <p className="text-slate-500">Sua loja está vazia.</p>
              <Button variant="link" onClick={() => setIsOpen(true)}>Criar primeira recompensa!</Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {rewards.map(reward => {
                const canAfford = user && user.coins >= reward.coinCost
                const hasLevel = user && user.level >= reward.levelRequired
                const canRedeem = canAfford && hasLevel
                const wasRecentlyRedeemed = recentRedemptions.has(reward.id)
                return (
                  <Card key={reward.id} className={`transition-all ${canRedeem ? 'border-t-4 border-t-purple-500 hover:shadow-md dark:bg-slate-900' : 'opacity-70 bg-slate-50 dark:bg-slate-900/60'}`}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-100">{reward.category}</Badge>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{reward.coinCost} 🪙</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{reward.name}</h3>
                      {reward.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reward.description}</p>}
                      {reward.levelRequired > 1 && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${hasLevel ? 'text-green-500' : 'text-orange-500'}`}>
                          <ShieldCheck className="h-3 w-3" /> Requer Nível {reward.levelRequired}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-5 pt-0 flex gap-2">
                      <Button
                        className={`flex-1 ${canRedeem ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                        disabled={!canRedeem}
                        onClick={() => handleRedeem(reward)}
                      >
                        {!canAfford && <Lock className="mr-2 h-4 w-4" />}
                        {!hasLevel ? `Nível ${reward.levelRequired} necessário` : canAfford ? 'Resgatar' : 'Sem moedas'}
                      </Button>
                      {wasRecentlyRedeemed && (
                        <Button variant="outline" size="icon" title="Desfazer" onClick={() => handleUndo(reward)}
                          className="text-orange-500 hover:text-orange-600 border-orange-200 dark:border-orange-800 shrink-0">
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
