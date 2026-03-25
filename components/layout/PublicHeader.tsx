'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Trophy, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gradient-text">Golf</span>
              <span className="text-white">Gives</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/charities" className="text-white/70 hover:text-white text-sm transition-colors">Charities</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white text-sm transition-colors">Pricing</Link>
            <Link href="/about" className="text-white/70 hover:text-white text-sm transition-colors">About</Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
                <button onClick={handleSignOut} className="text-sm text-white/50 hover:text-white transition-colors">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">Sign In</Link>
                <Link href="/signup" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
                  Subscribe Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/5"
          >
            <div className="flex flex-col gap-3 pb-4">
              <Link href="/charities" className="text-white/70 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Charities</Link>
              <Link href="/pricing" className="text-white/70 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link href="/about" className="text-white/70 hover:text-white py-2" onClick={() => setMenuOpen(false)}>About</Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-white/70 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button onClick={handleSignOut} className="text-left text-white/50 py-2">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white/70 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link href="/signup" className="btn-primary text-center py-3 text-sm" onClick={() => setMenuOpen(false)}>Subscribe Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#080d1a] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg"><span className="gradient-text">Golf</span>Gives</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              The subscription platform where every swing has purpose. Play, win, and give back — all at once.
            </p>
            <div className="flex items-center gap-1 mt-4 text-white/40 text-xs">
              <Heart className="w-3 h-3 text-red-400" />
              <span>Supporting charities across the UK</span>
            </div>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><Link href="/charities" className="hover:text-white/70 transition-colors">Charities</Link></li>
              <li><Link href="/pricing" className="hover:text-white/70 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white/70 transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><Link href="/signup" className="hover:text-white/70 transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-white/70 transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-white/70 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} GolfGives Ltd. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Registered charity platform. Regulated by UK Gambling Commission.
          </p>
        </div>
      </div>
    </footer>
  )
}
