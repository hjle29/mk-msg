import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SharedLetterPage({
  params,
}: {
  params: Promise<{ share_id: string }>
}) {
  const { share_id } = await params

  const { data, error } = await getSupabase()
    .from('letters')
    .select('*')
    .eq('share_id', share_id)
    .single()

  if (error || !data) notFound()

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-10">
        <Link href="/" className="font-serif text-xl text-stone-400 hover:text-stone-600 transition-colors">
          Dear,
        </Link>

        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="font-serif text-stone-800 text-base leading-relaxed whitespace-pre-wrap">
            {data.content}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-stone-400 text-xs font-sans">
            {data.lang === 'ko' ? '나도 편지를 써보고 싶어요' : 'I want to write a letter too'}
          </p>
          <Link
            href="/write"
            className="px-6 py-2.5 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 transition-colors"
          >
            {data.lang === 'ko' ? '편지 쓰기' : 'Write a letter'}
          </Link>
        </div>
      </div>
    </main>
  )
}
