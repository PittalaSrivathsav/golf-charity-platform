'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PublicHeader, PublicFooter } from '@/components/layout/PublicHeader'
import {
  Trophy,
  Heart,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

function CountUp({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / 60
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [end])
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

const charities = [
  { name: 'Cancer Research UK', raised: '₹12,45,000', icon: '🎗️', color: 'from-pink-500 to-rose-600' },
  { name: 'British Heart Foundation', raised: '₹8,32,000', icon: '❤️', color: 'from-red-500 to-pink-600' },
  { name: 'RNLI', raised: '₹6,89,000', icon: '⛵', color: 'from-blue-500 to-cyan-600' },
  { name: 'Mind', raised: '₹5,24,000', icon: '🧠', color: 'from-purple-500 to-violet-600' },
]

const steps = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Subscribe & Choose',
    desc: 'Pick a monthly or yearly plan and select the charity closest to your heart.',
    color: 'from-green-400 to-emerald-600',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Log Your Scores',
    desc: 'Enter your last 5 Stableford scores after each round. Simple, fast, no fuss.',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Win Monthly Prizes',
    desc: 'Each month we match scores to winning numbers. 3, 4, or 5 matches wins a share of the pool.',
    color: 'from-amber-400 to-orange-600',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Give Automatically',
    desc: 'A portion of every subscription goes directly to your chosen charity. Effortless generosity.',
    color: 'from-pink-400 to-rose-600',
  },
]

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Monthly draws · Real prizes · Real impact
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
              <span className="text-white">Golf that</span>
              <br />
              <span className="gradient-text">gives back.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Subscribe. Log your scores. Win monthly prizes. Support a charity you love.
              It{"'"}s not just a round of golf — it{"'"}s a movement.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 rounded-xl">
                Start for ₹999 / month
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/charities"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-200 text-base"
              >
                Browse Charities
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-12 text-white/40 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                4.9 / 5 rating
              </span>
              <span>2,400+ subscribers</span>
              <span>₹48,00,000+ raised for charity</span>
              <span>6 charities supported</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { label: 'Active Subscribers', value: 2400, suffix: '+' },
              { label: 'Raised for Charity', value: 4800000, prefix: '₹' },
              { label: 'Prizes Awarded', value: 127 },
              { label: 'Charities Supported', value: 6 },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl lg:text-4xl font-black gradient-text mb-2">
                  <CountUp end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="text-green-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-white mb-4">
            Four steps to<br /><span className="gradient-text">make a difference</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-lg max-w-xl mx-auto">
            Simple by design. Meaningful by nature.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="glass-card p-6 relative group hover:border-white/15 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <div className="text-white/20 text-5xl font-black absolute top-4 right-5 leading-none">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured charities */}
      <section className="py-24 bg-[#080d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="text-pink-400 font-semibold text-sm uppercase tracking-widest mb-3">Charity Impact</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-white mb-4">
              Your subscriptions<br /><span className="gradient-text">fund real change</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {charities.map((charity) => (
              <motion.div key={charity.name} variants={fadeUp} className="glass-card p-6 text-center group hover:scale-[1.02] transition-all duration-300">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${charity.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {charity.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{charity.name}</h3>
                <div className="text-green-400 font-bold mt-2">{charity.raised}</div>
                <div className="text-white/30 text-xs">raised to date</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              href="/charities"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              View all charities <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card glow-green p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Trophy className="w-3.5 h-3.5" />
              This Month{"'"}s Draw
            </motion.div>
            <motion.div variants={fadeUp} className="text-6xl lg:text-8xl font-black gradient-text mb-4">
              ₹24,00,000
            </motion.div>
            <motion.p variants={fadeUp} className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Current jackpot pool. Match 5 numbers to win 40%. Draw happens on the 1st of every month.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { label: '5-match jackpot', pct: '40%', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: '4-match prize', pct: '35%', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: '3-match prize', pct: '25%', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              ].map((tier) => (
                <div key={tier.label} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${tier.color}`}>
                  {tier.label} · {tier.pct}
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4 rounded-xl">
                Enter the Draw <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-black text-white mb-6">
            Ready to play with<br /><span className="gradient-text">purpose?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Join 2,400+ golfers turning their passion into genuine positive impact.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 rounded-xl">
              Get Started <TrendingUp className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-200">
              View Plans
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <PublicFooter />
    </>
  )
}
