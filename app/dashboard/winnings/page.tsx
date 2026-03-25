'use client'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Trophy, Upload, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface WinnerRecord {
  id: string
  draw_result_id: string
  proof_url: string | null
  verification_status: 'pending' | 'approved' | 'rejected'
  payment_status: 'pending' | 'paid'
  draw_results: {
    prize_amount: number
    draws: { month: string }
  }
}

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<WinnerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWinnings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get winning records
    const { data } = await supabase
      .from('winners')
      .select('*, draw_results(*, draws(*))')
      .eq('user_id', user.id)

    setWinnings(data as any[] ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchWinnings() }, [])

  const handleUpload = async (winnerId: string) => {
    const url = prompt('Enter proof image URL (e.g. Imgur, Scorecard photo link):')
    if (!url) return

    const { error } = await supabase
      .from('winners')
      .update({ proof_url: url, verification_status: 'pending' })
      .eq('id', winnerId)

    if (error) toast.error('Failed to update proof')
    else {
      toast.success('Proof uploaded! Waiting for admin approval.')
      fetchWinnings()
    }
  }

  return (
    <DashboardSidebar>
       <div className="p-6 lg:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white">My Winnings</h1>
          <p className="text-white/50 text-sm mt-1">View your prizes and verify your scores.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : winnings.length > 0 ? (
          <div className="grid gap-6">
            {winnings.map((w) => (
              <div key={w.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">₹{w.draw_results.prize_amount}</div>
                    <div className="text-white/40 text-sm">
                      Draw: {new Date(w.draw_results.draws.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Badges */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    w.verification_status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    w.verification_status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {w.verification_status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                     w.verification_status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : 
                     <Clock className="w-3.5 h-3.5" />}
                    {w.verification_status.toUpperCase()}
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    w.payment_status === 'paid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  }`}>
                    {w.payment_status.toUpperCase()}
                  </div>

                  {/* Actions */}
                  {!w.proof_url ? (
                    <button 
                      onClick={() => handleUpload(w.id)}
                      className="btn-primary py-2 px-4 rounded-lg text-xs flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Proof
                    </button>
                  ) : (
                    <a href={w.proof_url} target="_blank" className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs">
                       View Proof <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
             <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-white">No winnings yet</h3>
             <p className="text-white/40 text-sm">Log your scores and keep playing! Your time will come.</p>
          </div>
        )}
       </div>
    </DashboardSidebar>
  )
}
