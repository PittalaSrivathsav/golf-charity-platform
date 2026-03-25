'use client'

import { useState } from 'react'
import { Trophy, Play, Info, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDrawsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runDraw = async (simulation: boolean) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/draws/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulation })
      })
      const data = await res.json()
      setResult(data)
      if (!simulation) toast.success('Monthly draw published successfully!')
    } catch (e) {
      toast.error('Draw failed to run')
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white">Monthly Prize Draw</h1>
        <p className="text-white/50 text-sm mt-1">Generate winners based on user scores and randomly picked numbers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-8 border-amber-500/20 bg-amber-500/5">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-500" /> Draw Control
              </h2>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Running a draw will fetch all active subscribers, pull their last 5 scores, 
                and match them against 5 random winning numbers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                   onClick={() => runDraw(true)}
                   disabled={loading}
                   className="btn-primary bg-white/10 border-white/20 text-white hover:bg-white/15 px-8 py-4 rounded-2xl font-bold flex-1"
                >
                  {loading ? 'Processing...' : 'Run Simulation'}
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to PUBLISH this draw? This will notify winners and update their dashboards.')) {
                      runDraw(false)
                    }
                  }}
                  disabled={loading}
                  className="btn-primary bg-green-500 text-[#0a0f1e] hover:bg-green-400 px-8 py-4 rounded-2xl font-bold flex-1"
                >
                   {loading ? 'Processing...' : 'Publish Monthly Draw'}
                </button>
              </div>
           </div>

           {result && (
              <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-xl font-black text-white mb-6 underline decoration-green-500 underline-offset-8">Draw Results Summary</h2>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                       <div className="text-white/40 text-xs mb-1 uppercase">Winning Nos</div>
                       <div className="text-green-400 font-black text-lg">{result.winningNumbers.join(', ')}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                       <div className="text-white/40 text-xs mb-1 uppercase">Total Winners</div>
                       <div className="text-white font-black text-lg">{result.winners.length}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                       <div className="text-white/40 text-xs mb-1 uppercase">Prize Pool</div>
                       <div className="text-amber-400 font-black text-lg">₹{result.jackpotPool.toFixed(0)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                       <div className="text-white/40 text-xs mb-1 uppercase">Rollover</div>
                       <div className="text-blue-400 font-black text-lg">₹{result.rolloverAmount}</div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="text-white font-bold flex items-center gap-2 mb-2">
                       <CheckCircle className="w-4 h-4 text-green-500" /> Tier Breakdown
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                          <div className="text-xs text-white/30 uppercase">5 Matches</div>
                          <div className="text-xl font-bold text-white">{result.matches[5]} winners</div>
                       </div>
                       <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                          <div className="text-xs text-white/30 uppercase">4 Matches</div>
                          <div className="text-xl font-bold text-white">{result.matches[4]} winners</div>
                       </div>
                       <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                          <div className="text-xs text-white/30 uppercase">3 Matches</div>
                          <div className="text-xl font-bold text-white">{result.matches[3]} winners</div>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div>
           <div className="glass-card p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Info className="w-4 h-4 text-blue-400" /> Guidelines
              </h2>
              <ul className="text-sm text-white/50 space-y-4 list-disc pl-4">
                 <li>Simulations do not save data to the database or notify users.</li>
                 <li><b>Publishing</b> creates permanent records in <code>draws</code> and <code>draw_results</code>.</li>
                 <li>Prize distribution follows the PRD: 40% (5 match), 35% (4 match), 25% (3 match).</li>
                 <li>Unclaimed tier pools roll over to the next monthly jackpot.</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  )
}
