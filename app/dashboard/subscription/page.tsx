'use client'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Subscription } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

import { Suspense } from 'react'

function SubscriptionContent() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  const searchParams = useSearchParams()
  const autoPlan = searchParams.get('plan')

  useEffect(() => {
    const fetchSub = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setSub(data)
      setLoading(false)

      // Auto-trigger checkout if plan is in URL and no active sub
      if (autoPlan && data?.status !== 'active') {
        handleCheckout(autoPlan as 'monthly' | 'yearly')
      }
    }
    fetchSub()
  }, [autoPlan])

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setPortalLoading(true)
    try {
      console.log('Starting checkout for:', plan)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Checkout failed')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (e: any) {
      console.error('Checkout error:', e)
      toast.error(e.message || 'Failed to start checkout. Please try again.')
      setPortalLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  const isActive = sub?.status === 'active'

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-white">Subscription Management</h1>
        <p className="text-white/50 text-sm mt-1">Manage your plan, billing cycle, and payment methods.</p>
      </div>

      <div className="glass-card p-6 lg:p-8 mb-8">
        {!isActive ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active subscription</h3>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
              Subscribe to log your Stableford scores, enter the monthly prize draws, and support your favourite charity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => handleCheckout('monthly')} 
                disabled={portalLoading}
                className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe Monthly (₹999)'}
              </button>
              <button 
                onClick={() => handleCheckout('yearly')} 
                disabled={portalLoading}
                className="py-3 px-6 rounded-xl border border-white/20 hover:bg-white/5 text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe Yearly (₹8999)'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Plan details</span>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  {sub.plan === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
                </div>
                <div className="text-green-400 text-sm mt-1">{sub.plan === 'yearly' ? '₹8999 / year' : '₹999 / month'}</div>
              </div>
              
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Next billing date</span>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  {sub.current_period_end ? formatDate(sub.current_period_end) : 'Processing...'}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-white/40 text-sm max-w-sm">
                Update payment methods, view invoices, or cancel your subscription via Stripe Customer Portal.
              </p>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {portalLoading ? 'Redirecting...' : <><ExternalLink className="w-4 h-4" /> Manage Billing</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <DashboardSidebar>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
         <SubscriptionContent />
      </Suspense>
    </DashboardSidebar>
  )
}

