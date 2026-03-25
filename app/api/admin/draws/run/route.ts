export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { runDrawEngine } from '@/lib/draw/engine'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { simulation } = await req.json()

  try {
    const result = await runDrawEngine(simulation)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Draw Engine Error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
