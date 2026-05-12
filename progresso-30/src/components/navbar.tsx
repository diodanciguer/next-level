'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  ListChecks, 
  Store, 
  LogOut, 
  Skull, 
  Swords, 
  User, 
  Coins, 
  Flame, 
  Trophy, 
  Package,
  ChevronDown,
  TrendingUp,
  Rocket
} from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { CharacterAvatar } from './character-avatar'
import { Badge } from './ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) setUser(await res.json())
      else setUser(null)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    fetchUser()
    
    const handleUserUpdate = () => fetchUser()
    window.addEventListener('user-updated', handleUserUpdate)
    
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate)
    }
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const groups = [
    {
      label: 'Aventuras',
      icon: Swords,
      items: [
        { href: '/habits', icon: ListChecks, label: 'Hábitos' },
        { href: '/bad-habits', icon: Skull, label: 'Vilões' },
        { href: '/missions', icon: Swords, label: 'Missões' },
        { href: '/plans', icon: Rocket, label: 'Planos' },
      ]
    },
    {
      label: 'Arsenal',
      icon: Package,
      items: [
        { href: '/rewards', icon: Store, label: 'Loja' },
        { href: '/inventory', icon: Package, label: 'Mochila' },
      ]
    },
    {
      label: 'Herói',
      icon: User,
      items: [
        { href: '/profile', icon: User, label: 'Perfil' },
        { href: '/progress', icon: TrendingUp, label: 'Evolução' },
        { href: '/achievements', icon: Trophy, label: 'Conquistas' },
      ]
    }
  ]

  if (pathname === '/login' || pathname === '/register') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b h-16 sm:h-14">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full">
        
        {/* Logo & Brand (Desktop) */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/dashboard" className="font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Próximo Nível
          </Link>

          {/* Main Links (Desktop) */}
          <div className="flex items-center gap-1">
            <Link href="/dashboard">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                pathname === '/dashboard' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"
              )}>
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Home className="h-4 w-4" />
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">Dashboard</span>
              </div>
            </Link>

            {groups.map(group => {
              const isActive = group.items.some(item => pathname === item.href)
              return (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"
                  )}>
                    {group.label === 'Herói' && user ? (
                      <CharacterAvatar level={user.level} characterClass={user.characterClass} size="sm" />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <group.icon className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-[11px] uppercase tracking-widest font-bold">{group.label}</span>
                    <ChevronDown className={cn("h-3 w-3 opacity-30 transition-transform", isActive && "rotate-180")} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400">
                        {group.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {group.items.map(item => (
                        <Link key={item.href} href={item.href}>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <item.icon className="h-4 w-4" /> {item.label}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}
          </div>
        </div>

        {/* User Stats (Always visible) */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 text-xs font-bold">
                <Badge variant="outline" className="px-1.5 py-0 border-0 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  Lvl {user.level}
                </Badge>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Coins className="h-3.5 w-3.5" /> {user.coins}
              </div>
              {user.streak > 0 && (
                <>
                  <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                    <Flame className="h-3.5 w-3.5" /> {user.streak}
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="hidden sm:flex items-center gap-1 border-l pl-3 border-slate-200 dark:border-slate-800 ml-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation (Bottom) */}
        <div className="flex w-full justify-around sm:hidden">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className={pathname === '/dashboard' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500'}>
              <Home className="h-6 w-6" />
            </Button>
          </Link>
          
          {groups.map(group => {
            const isActive = group.items.some(item => pathname === item.href)
            return (
              <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger 
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500',
                      "outline-none relative"
                    )}
                  >
                    {group.label === 'Herói' && user ? (
                      <div className="relative">
                        <CharacterAvatar level={user.level} characterClass={user.characterClass} size="sm" />
                        {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />}
                      </div>
                    ) : (
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                        isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-slate-500"
                      )}>
                        <group.icon className="h-6 w-6" />
                      </div>
                    )}
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400">
                      {group.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem className="gap-2 p-3">
                          <item.icon className="h-5 w-5" /> {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 p-3 text-red-500">
                      <LogOut className="h-5 w-5" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
