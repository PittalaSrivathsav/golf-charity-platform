'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('name')
    setCharities(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCharities() }, [])

  const addCharity = async () => {
    const name = prompt('Charity Name:')
    const category = prompt('Category (Health, Environment, etc):')
    if (!name) return

    const res = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, active: true })
    })

    if (res.ok) {
      toast.success('Charity added!')
      fetchCharities()
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">Manage Charities</h1>
          <p className="text-white/50 text-sm mt-1">Add or edit partner charities.</p>
        </div>
        <button onClick={addCharity} className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((c) => (
          <div key={c.id} className="glass-card p-6">
            <div className="flex justify-between mb-4">
              <div className="text-2xl">{c.category === 'Health' ? '🎗️' : '❤️'}</div>
              <div className="flex gap-2">
                <button className="text-white/20 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
            <p className="text-white/40 text-xs mb-4">{c.category}</p>
            <div className="pt-4 border-t border-white/10 text-xs text-white/30 flex justify-between items-center">
               <span>Total Raised</span>
               <span className="text-green-400 font-bold">₹{c.total_raised || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
