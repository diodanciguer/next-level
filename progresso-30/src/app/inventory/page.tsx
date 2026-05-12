'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Play, Calendar, CheckCircle2, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { triggerSimpleConfetti } from '@/lib/confetti'
import Link from 'next/link'

type InventoryItem = {
  id: string
  reward: {
    name: string
    description?: string
    category: string
  }
  date: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/inventory')
      if (res.ok) setItems(await res.json())
    } catch (error) {
      toast.error('Erro ao carregar mochila')
    } finally {
      setLoading(false)
      window.dispatchEvent(new Event('user-updated'))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUse = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}/use`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message, { icon: '🎁' })
        triggerSimpleConfetti()
        if (data.leveledUp) {
          toast.success(`🎉 LEVEL UP! Você subiu para o Nível ${data.newLevel}!`, { duration: 5000 })
          const { triggerLevelUpConfetti } = await import('@/lib/confetti')
          triggerLevelUpConfetti()
        }
        fetchData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erro ao usar item')
    }
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 sm:pt-16 bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="py-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="text-blue-500" /> Sua Mochila
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Itens que você comprou na loja e ainda não utilizou.</p>
        </header>

        {loading ? (
          <div className="text-center p-12 text-slate-500">Abrindo mochila...</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="bg-slate-50 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sua mochila está vazia</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Você ainda não tem itens guardados. Vá até a loja e resgate suas recompensas!</p>
            <Link href="/rewards">
              <Button className="bg-blue-600 hover:bg-blue-700">Ir para a Loja</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <Card key={item.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-2">{item.reward.category}</Badge>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.reward.name}</CardTitle>
                  {item.reward.description && (
                    <CardDescription className="line-clamp-2">{item.reward.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button 
                    className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white transition-colors gap-2"
                    onClick={() => handleUse(item.id)}
                  >
                    <Play className="h-4 w-4 fill-current" /> Usar Agora
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
