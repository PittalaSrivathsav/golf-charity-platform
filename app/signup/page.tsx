'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Trophy, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'

const benefits = [
  'Monthly prize draws',
  'Support a charity you care about',
  'Easy Stableford score tracking',
  'Cancel anytime',
]

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Please check your email to confirm.')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#0a0f1e]">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg"><span className="gradient-text">Golf</span>Gives</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Play with
            <br />
            <span className="gradient-text">purpose.</span>
          </h1>
          <p className="text-white/50 text-base mb-8 leading-relaxed">
            Join the golf subscription platform that turns every round into charitable impact — and gives you the chance to win.
          </p>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-8">
            <h2 className="text-xl font-black text-white mb-1">Create your account</h2>
            <p className="text-white/40 text-sm mb-6">Start your 7-day free trial. No card needed.</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all pr-12"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="signup-button"
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-white/30 text-xs mt-5">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="text-center text-white/40 text-sm mt-3">
              Already a member?{' '}
              <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
