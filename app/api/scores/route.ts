export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(5)

  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { score, played_at } = await req.json()

  if (!score || score < 1 || score > 45) {
    return new NextResponse('Invalid score', { status: 400 })
  }

  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score,
      played_at,
    })
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json(data)
}
