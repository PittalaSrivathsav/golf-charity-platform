'use client'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Heart, Search, Check } from 'lucide-react'
import type { Charity } from '@/types'

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [contribution, setContribution] = useState(10)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: charityData }, { data: subData }] = await Promise.all([
        supabase.from('charities').select('*').eq('active', true).order('name'),
        supabase.from('subscriptions').select('charity_id, charity_contribution_pct').eq('user_id', user.id).single(),
      ])

      setCharities(charityData ?? [])
      if (subData?.charity_id) setSelected(subData.charity_id)
      if (subData?.charity_contribution_pct) setContribution(subData.charity_contribution_pct)
    }
    fetchData()
  }, [])

  const saveCharity = async () => {
    if (!selected) { toast.error('Please select a charity first'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('subscriptions')
      .update({ charity_id: selected, charity_contribution_pct: contribution })
      .eq('user_id', user.id)

    if (error) toast.error('Failed to save. Do you have an active subscription?')
    else toast.success('Charity preference saved!')
    setLoading(false)
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  return (
    <DashboardSidebar>
      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white">My Charity</h1>
          <p className="text-white/50 text-sm mt-1">Select which charity receives part of your subscription.</p>
        </div>

        {/* Contribution slider */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-bold text-white mb-1">Your Contribution</h2>
          <p className="text-white/40 text-sm mb-5">Set what % of your subscription goes to your chosen charity.</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-sm">Contribution</span>
            <span className="text-2xl font-black text-green-400">{contribution}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={contribution}
            onChange={(e) => setContribution(Number(e.target.value))}
            className="w-full accent-green-400"
          />
          <div className="flex justify-between text-white/30 text-xs mt-1">
            <span>10% (min)</span>
            <span>90% (max)</span>
          </div>
        </div>

        {/* Charity search */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-bold text-white mb-4">Select a Charity</h2>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charities..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filtered.map((charity) => (
              <button
                key={charity.id}
                onClick={() => setSelected(charity.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left ${
                  selected === charity.id
                    ? 'border-green-500/40 bg-green-500/10'
                    : 'border-white/5 bg-white/2 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                    selected === charity.id ? 'bg-green-500/20' : 'bg-white/5'
                  }`}>
                    {charity.category === 'Health' ? '🎗️' :
                     charity.category === 'Rescue' ? '⛵' :
                     charity.category === 'Mental Health' ? '🧠' :
                     charity.category === 'Environment' ? '🌍' : '❤️'}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{charity.name}</div>
                    <div className="text-white/30 text-xs">{charity.category}</div>
                  </div>
                </div>
                {selected === charity.id && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          id="save-charity-btn"
          onClick={saveCharity}
          disabled={loading || !selected}
          className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
          ) : (
            <><Heart className="w-4 h-4" /> Save Charity Preference</>
          )}
        </button>
      </div>
    </DashboardSidebar>
  )
}
