import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const share_id = nanoid(10)

    const { data, error } = await getSupabase()
      .from('letters')
      .insert({
        share_id,
        situation_id: body.situation_id ?? null,
        custom_situation: body.custom_situation ?? null,
        answers: body.answers,
        scenes: body.scenes,
        content: body.content,
        lang: body.lang,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ share_id: data.share_id })
  } catch (error) {
    console.error('Save letter error:', error)
    return NextResponse.json({ error: 'Failed to save letter' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const share_id = req.nextUrl.searchParams.get('share_id')
  if (!share_id) return NextResponse.json({ error: 'Missing share_id' }, { status: 400 })

  const { data, error } = await getSupabase()
    .from('letters')
    .select('*')
    .eq('share_id', share_id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(data)
}
