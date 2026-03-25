'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  Heart,
  CreditCard,
  Trophy,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function DashboardSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm"><span className="gradient-text">Golf</span>Gives</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0e1424] border-r border-white/5 fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0e1424] border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm"><span className="gradient-text">Golf</span>Gives</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-white/70">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#0e1424] border-r border-white/5 z-50 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setMobileOpen(false)} className="p-2 text-white/50">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-[#0a0f1e]">
        {children}
      </main>
    </div>
  )
}
