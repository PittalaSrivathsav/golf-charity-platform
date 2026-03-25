'use client'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Target, Plus, Trash2, Calendar } from 'lucide-react'
import type { Score } from '@/types'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const supabase = createClient()

  const fetchScores = async () => {
    setFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
    setScores(data ?? [])
    setFetching(false)
  }

  useEffect(() => { fetchScores() }, [])

  const addScore = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(newScore)
    if (isNaN(val) || val < 1 || val > 45) {
      toast.error('Score must be between 1 and 45')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('scores').insert({
      user_id: user.id,
      score: val,
      played_at: newDate,
    })

    if (error) {
      toast.error('Failed to save score')
    } else {
      toast.success('Score saved! Oldest removed if you had 5.')
      setNewScore('')
      setNewDate(new Date().toISOString().split('T')[0])
      fetchScores()
    }
    setLoading(false)
  }

  const barWidth = (score: number) => `${(score / 45) * 100}%`

  return (
    <DashboardSidebar>
      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white">My Scores</h1>
          <p className="text-white/50 text-sm mt-1">
            Log your Stableford scores. We keep your last 5.
          </p>
        </div>

        {/* Add score form */}
        <div className="glass-card p-6 mb-8">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" /> Add New Score
          </h2>
          <form onSubmit={addScore} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-white/50 text-xs mb-1.5 block uppercase tracking-wide">Stableford Score (1–45)</label>
              <input
                id="score-input"
                type="number"
                min="1"
                max="45"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="e.g. 36"
              />
            </div>
            <div className="flex-1">
              <label className="text-white/50 text-xs mb-1.5 block uppercase tracking-wide">Date Played</label>
              <div className="relative">
                <input
                  id="score-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                id="add-score-btn"
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
                ) : 'Add Score'}
              </button>
            </div>
          </form>
          {scores.length >= 5 && (
            <p className="text-amber-400/70 text-xs mt-3 flex items-center gap-1.5">
              ⚠️ You have 5 scores. Adding a new one will replace the oldest.
            </p>
          )}
        </div>

        {/* Scores list */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> Your Last 5 Scores
            </h2>
            <span className="text-white/30 text-sm">{scores.length}/5 logged</span>
          </div>

          {fetching ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : scores.length > 0 ? (
            <AnimatePresence>
              <div className="space-y-4">
                {scores.map((score, i) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          i === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/70'
                        }`}>
                          {score.score}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {score.score} pts
                            {i === 0 && <span className="ml-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">Latest</span>}
                          </div>
                          <div className="flex items-center gap-1 text-white/30 text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(score.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: barWidth(score.score) }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                        className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/20'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No scores logged yet. Add your first score above!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardSidebar>
  )
}
