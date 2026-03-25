export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .order('name')

  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('charities')
    .insert(body)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json(data)
}
