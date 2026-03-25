import { createAdminClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient()

  const [
    { count: totalUsers },
    { data: activeSubs },
    { data: winners },
    { data: charities }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id').eq('status', 'active'),
    supabase.from('winners').select('id, draw_results(prize_amount)'),
    supabase.from('charities').select('total_raised')
  ])

  const totalPrizePool = (winners as any[])?.reduce((acc, w) => acc + (w.draw_results?.prize_amount || 0), 0) || 0
  const totalCharityRaised = (charities as any[])?.reduce((acc, c) => acc + (Number(c.total_raised) || 0), 0) || 0
  
  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: <Users />, color: 'text-blue-400' },
    { label: 'Active Subscribers', value: activeSubs?.length ?? 0, icon: <TrendingUp />, color: 'text-green-400' },
    { label: 'Prize Pool Paid', value: `₹${totalPrizePool.toFixed(2)}`, icon: <Trophy />, color: 'text-amber-400' },
    { label: 'Charity Raised', value: `₹${totalCharityRaised.toFixed(2)}`, icon: <Heart />, color: 'text-pink-400' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/50">System overview and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-3xl font-black text-white mb-1">{s.value}</div>
            <div className="text-white/40 text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
           <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
           <div className="grid grid-cols-2 gap-4">
             <Link href="/admin/draws" className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/15 transition-all text-center">
                <Trophy className="mx-auto mb-2" />
                <span className="font-bold">Run Draw</span>
             </Link>
             <Link href="/admin/winners" className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 transition-all text-center">
                <AlertCircle className="mx-auto mb-2" />
                <span className="font-bold">Verify Winners</span>
             </Link>
             <Link href="/admin/charities" className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/15 transition-all text-center">
                <Heart className="mx-auto mb-2" />
                <span className="font-bold">Charities</span>
             </Link>
             <Link href="/admin/users" className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 transition-all text-center">
                <Users className="mx-auto mb-2" />
                <span className="font-bold">View Users</span>
             </Link>
           </div>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-amber-500/10 to-transparent">
           <h2 className="text-xl font-bold text-white mb-2">Pending Verifications</h2>
           <p className="text-white/40 text-sm mb-6">Winners waiting for scorecard approval.</p>
           {/* Summary link */}
           <Link href="/admin/winners" className="btn-primary w-full py-3 rounded-xl block text-center">
              Go to Winner Review →
           </Link>
        </div>
      </div>
    </div>
  )
}
