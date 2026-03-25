import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Trophy, Heart, LogOut, ChevronLeft } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const nav = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Draws', href: '/admin/draws', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Winners', href: '/admin/winners', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Charities', href: '/admin/charities', icon: <Heart className="w-4 h-4" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
  ]

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-8">
          <Link href="/" className="text-xl font-black text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center text-[#0a0f1e] text-sm">G</span>
            <span>GolfGives <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded ml-1">ADMIN</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-sm">
             <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
