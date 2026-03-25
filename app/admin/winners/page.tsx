'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWinners = async () => {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name), draw_results(prize_amount, draws(month))')
      .order('created_at', { ascending: false })
    setWinners(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchWinners() }, [])

  const verify = async (id: string, status: 'approved' | 'rejected') => {
    const notes = prompt(`Enter notes for ${status}:`)
    const res = await fetch('/api/admin/winners/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId: id, status, notes })
    })

    if (res.ok) {
      toast.success(`Winner ${status}!`)
      fetchWinners()
    } else {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white">Winner Verification</h1>
        <p className="text-white/50 text-sm mt-1">Review scorecard proofs and approve payouts.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/2 text-white/40 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Draw</th>
              <th className="px-6 py-4 font-medium">Prize</th>
              <th className="px-6 py-4 font-medium">Proof</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {winners.map((w) => (
              <tr key={w.id} className="text-sm text-white/70 hover:bg-white/2 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{w.profiles.full_name}</td>
                <td className="px-6 py-4">{new Date(w.draw_results.draws.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                <td className="px-6 py-4 text-green-400 font-bold">₹{w.draw_results.prize_amount}</td>
                <td className="px-6 py-4">
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" className="text-blue-400 flex items-center gap-1 hover:underline">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-white/20">None</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                    w.verification_status === 'approved' ? 'border-green-500/30 text-green-400' :
                    w.verification_status === 'rejected' ? 'border-red-500/30 text-red-400' :
                    'border-amber-500/30 text-amber-400'
                  }`}>
                    {w.verification_status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => verify(w.id, 'approved')} className="p-2 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => verify(w.id, 'rejected')} className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
