'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PublicHeader, PublicFooter } from '@/components/layout/PublicHeader'
import { Check, ArrowRight, Zap, Star } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 999,
    period: 'per month',
    description: 'Flexible. Cancel anytime.',
    popular: false,
    features: [
      'Monthly prize draw entry',
      'Log up to 5 Stableford scores',
      'Choose your charity',
      'Min 10% goes to charity',
      'Winner dashboard',
      'Email notifications',
    ],
    cta: 'Start Monthly',
    color: 'border-white/10',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 8999,
    period: 'per year',
    monthly: 750,
    description: 'Best value. Save 25%.',
    popular: true,
    features: [
      'Everything in Monthly',
      '25% discount vs monthly',
      '12 draw entries guaranteed',
      'Priority winner verification',
      'Charity impact report',
      'VIP support',
    ],
    cta: 'Start Yearly',
    color: 'border-green-500/40',
  },
]

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Simple, transparent pricing
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-black text-white mb-4">
              One subscription.<br /><span className="gradient-text">Endless impact.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/50 text-lg max-w-xl mx-auto">
              Choose your plan. Pick your charity. Start winning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={`glass-card p-8 relative ${plan.popular ? 'border-green-500/40 glow-green' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-[#0a0f1e] text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <p className="text-white/40 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{plan.price}</span>
                    <span className="text-white/40 text-sm">/{plan.period}</span>
                  </div>
                  {plan.monthly && (
                    <p className="text-green-400 text-sm mt-1">₹{plan.monthly}/month — save 25%</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/70 text-sm">
                      <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.id}`}
                  id={`pricing-${plan.id}`}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? 'btn-primary'
                      : 'border border-white/15 text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ / Notes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 text-white/30 text-sm space-y-2"
          >
            <p>All plans include a 7-day free trial. No credit card required to start.</p>
            <p>Part of each subscription supports your chosen charity automatically.</p>
            <p>Stripe-secured payments. Cancel anytime from your dashboard.</p>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
