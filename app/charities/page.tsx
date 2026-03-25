import { createClient } from '@/lib/supabase/server'
import { PublicHeader, PublicFooter } from '@/components/layout/PublicHeader'
import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  Health: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Rescue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Mental Health': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Environment: 'text-green-400 bg-green-500/10 border-green-500/20',
  Housing: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('active', true)
    .order('total_raised', { ascending: false })

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-sm font-medium mb-6">
              <Heart className="w-3.5 h-3.5" /> Supported Charities
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4">
              Choose your<br /><span className="gradient-text">cause.</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Every subscription you take out supports one of these incredible organisations.
            </p>
          </div>

          {/* Charity grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities?.map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.id}`}
                className="glass-card p-6 group hover:border-white/15 hover:scale-[1.01] transition-all duration-300 block"
              >
                {charity.featured && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
                    ⭐ Featured
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center text-2xl mb-4">
                  {charity.category === 'Health' ? '🎗️' :
                   charity.category === 'Rescue' ? '⛵' :
                   charity.category === 'Mental Health' ? '🧠' :
                   charity.category === 'Environment' ? '🌍' :
                   charity.category === 'Housing' ? '🏠' : '❤️'}
                </div>

                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-green-400 transition-colors">
                  {charity.name}
                </h3>

                {charity.category && (
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[charity.category] || 'text-white/40 bg-white/5 border-white/10'}`}>
                    {charity.category}
                  </span>
                )}

                <p className="text-white/50 text-sm mt-3 leading-relaxed line-clamp-2">
                  {charity.description}
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-green-400 font-bold">{formatCurrency(charity.total_raised)}</div>
                    <div className="text-white/30 text-xs">raised via GolfGives</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
