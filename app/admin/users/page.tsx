'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(status, plan)')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.includes(search)
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white">Registered Users</h1>
        <p className="text-white/50 text-sm mt-1">Manage user profiles and check subscription status.</p>
      </div>

      <div className="glass-card mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-green-500/40"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/2 text-white/40 text-xs uppercase tracking-wider">
               <th className="px-6 py-4 font-medium">User</th>
               <th className="px-6 py-4 font-medium">Joined</th>
               <th className="px-6 py-4 font-medium">Role</th>
               <th className="px-6 py-4 font-medium">Subscription</th>
               <th className="px-6 py-4 font-medium">Handicap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => (
              <tr key={u.id} className="text-sm text-white/70 hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-white/30" />
                    <div>
                      <div className="font-bold text-white">{u.full_name || 'No Name'}</div>
                      <div className="text-[10px] text-white/20">{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                   {u.subscriptions?.[0]?.status === 'active' ? (
                     <span className="text-green-400 font-bold">● Active</span>
                   ) : (
                     <span className="text-white/20">Inactive</span>
                   )}
                </td>
                <td className="px-6 py-4">{u.handicap_index ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
