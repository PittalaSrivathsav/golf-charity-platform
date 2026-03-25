'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Target, Save, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    handicap_index: ''
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          handicap_index: profile.handicap_index ? profile.handicap_index.toString() : ''
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        handicap_index: formData.handicap_index ? parseFloat(formData.handicap_index) : null
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update: ' + error.message)
      console.error('Supabase update error:', error)
    } else {
      toast.success('Profile updated successfully')
    }
    setSaving(false)
  }

  return (
    <DashboardSidebar>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white">Your Profile</h1>
          <p className="text-white/50 text-sm mt-1">Manage your personal information and preferences.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : (
          <div className="glass-card p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                  />
                  <p className="text-white/30 text-xs mt-1.5">Email cannot be changed currently.</p>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Handicap Index
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.handicap_index}
                    onChange={(e) => setFormData({ ...formData, handicap_index: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="e.g. 12.5"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardSidebar>
  )
}
