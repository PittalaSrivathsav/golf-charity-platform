export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Check admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const { winnerId, status, notes } = await req.json()

  const { data, error } = await supabase
    .from('winners')
    .update({ 
      verification_status: status, 
      admin_notes: notes,
      payment_status: status === 'approved' ? 'pending' : 'pending' 
    })
    .eq('id', winnerId)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json(data)
}
