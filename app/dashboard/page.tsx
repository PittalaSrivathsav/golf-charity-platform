import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Target, Trophy, Heart, CreditCard, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, getNextDrawDate } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, { data: scores }, { data: recentDraw }] = await Promise.all([
    supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*, charities(name, logo_url)').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false }).limit(5),
    supabase.from('draws').select('*').eq('status', 'published').order('month', { ascending: false }).limit(1).single(),
  ])

  const nextDraw = getNextDrawDate()
  const daysUntilDraw = Math.ceil((nextDraw.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const cards = [
    {
      title: 'Subscription',
      value: subscription ? 'Active' : 'Inactive',
      sub: subscription ? `${subscription.plan} plan` : 'No active plan',
      icon: <CreditCard className="w-5 h-5" />,
      color: subscription ? 'text-green-400' : 'text-red-400',
      bg: subscription ? 'from-green-500/10 to-emerald-500/5' : 'from-red-500/10 to-rose-500/5',
      href: '/dashboard/subscription',
    },
    {
      title: 'Scores Logged',
      value: `${scores?.length ?? 0} / 5`,
      sub: scores?.length ? `Last: ${scores[0].score} pts` : 'No scores yet',
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-400',
      bg: 'from-blue-500/10 to-cyan-500/5',
      href: '/dashboard/scores',
    },
    {
      title: 'Next Draw',
      value: `${daysUntilDraw}d`,
      sub: nextDraw.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-orange-500/5',
      href: '/dashboard/winnings',
    },
    {
      title: 'Charity',
      value: subscription?.charities?.name ?? 'None',
      sub: subscription ? `${subscription.charity_contribution_pct}% contribution` : 'Select a charity',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-pink-400',
      bg: 'from-pink-500/10 to-rose-500/5',
      href: '/dashboard/charity',
    },
  ]

  return (
    <DashboardSidebar>
      <div className="p-6 lg:p-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white">
            Hey, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">Here{"'"}s your GolfGives overview.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Link key={card.title} href={card.href} className="glass-card p-5 group hover:border-white/15 transition-all duration-200">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center ${card.color} mb-3`}>
                {card.icon}
              </div>
              <div className={`text-xl font-black ${card.color} mb-0.5`}>{card.value}</div>
              <div className="text-white/40 text-xs leading-tight">{card.title}</div>
              <div className="text-white/30 text-xs mt-1">{card.sub}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent scores */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">My Scores</h2>
              <Link href="/dashboard/scores" className="text-green-400 text-sm hover:text-green-300 transition-colors">
                Manage →
              </Link>
            </div>
            {scores && scores.length > 0 ? (
              <div className="space-y-3">
                {scores.map((score, i) => (
                  <div key={score.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/60'
                      }`}>
                        {score.score}
                      </div>
                      <span className="text-white/40 text-sm">
                        {new Date(score.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {i === 0 && <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Latest</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">No scores logged yet</p>
                <Link href="/dashboard/scores" className="text-green-400 text-sm mt-2 inline-block hover:text-green-300">Add your first score →</Link>
              </div>
            )}
          </div>

          {/* Draw participation */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Draw Status</h2>
              <Link href="/dashboard/winnings" className="text-green-400 text-sm hover:text-green-300 transition-colors">
                View all →
              </Link>
            </div>

            {subscription && scores && scores.length === 5 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <div className="text-green-400 font-semibold text-sm">Entered for next draw</div>
                    <div className="text-white/40 text-xs">Draw on {nextDraw.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {scores.map((s) => (
                    <div key={s.id} className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                      {s.score}
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs text-center">Your 5 entry scores for the draw</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">
                  {!subscription ? 'Subscribe to enter draws' : 'Log 5 scores to enter the draw'}
                </p>
                <Link
                  href={!subscription ? '/dashboard/subscription' : '/dashboard/scores'}
                  className="text-green-400 text-sm mt-2 inline-block hover:text-green-300"
                >
                  {!subscription ? 'Subscribe now →' : 'Add scores →'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}
