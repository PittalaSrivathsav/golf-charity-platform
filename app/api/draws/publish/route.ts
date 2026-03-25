import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient()
    const { drawId } = await req.json()
    
    // Check if draw exists and is running
    const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
    
    if (!draw || draw.status !== 'running') {
      return new NextResponse('Invalid draw or draw is not in running state', { status: 400 })
    }

    // Update draw status to published
    await supabase.from('draws').update({ status: 'published' }).eq('id', drawId)
    
    // (Optional logic here: trigger email dispatch to winners using Resend)
    // For now, updating the status makes it surface on the user dashboard.

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Publish draw error:', err)
    return new NextResponse(`Error: ${err.message}`, { status: 500 })
  }
}
