import Link from 'next/link'

const EXAMPLE_LETTERS = [
  {
    situation: '퇴사하는 동료에게',
    situation_en: 'To a leaving colleague',
    preview: '3년이라는 시간이 생각보다 길었어. 처음에는 그냥 옆자리 사람이었는데, 어느 순간부터 네가 없으면 이 일이 버텨지지 않을 것 같다는 걸 알게 됐어.\n\n모르는 거 물어볼 때마다 귀찮아하지 않았던 것, 힘들다고 했을 때 밥 한 끼 같이 먹자고 먼저 말해줬던 것. 사실 그게 많이 힘이 됐어.\n\n잘 됐으면 좋겠어. 진심으로.',
  },
  {
    situation: '오래 못 본 친구에게',
    situation_en: 'To an old friend',
    preview: '얼마 만이야. 별로 연락을 안 하고 지냈는데, 가끔 네 생각이 났어. 그냥 아무것도 아닌 걸로 같이 웃던 게 생각났을 때.\n\n잘 지내고 있는지 궁금하다. 언제 한 번 보자는 말이 늘 흐지부지되는 것 같아서, 이번엔 제대로 말하고 싶었어.\n\n보고 싶다.',
  },
  {
    situation: '처음 마음을 전할 때',
    situation_en: 'Confessing for the first time',
    preview: '말하기 쑥스럽지만, 안 하면 계속 이상할 것 같아서.\n\n같이 있으면 편한데 괜히 설레. 이유가 뭔지 모르겠는데 네 얘기를 더 듣고 싶어. 그게 다야.\n\n부담은 갖지 않아도 돼. 그냥 솔직하게 전하고 싶었어.',
  },
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-16">

        {/* Hero */}
        <div className="flex flex-col items-center gap-6 text-center pt-8">
          <h1 className="font-serif text-6xl text-stone-800 tracking-tight">
            Dear,
          </h1>
          <p className="text-stone-500 text-base leading-relaxed font-sans max-w-xs">
            하고 싶은 말이 있는데 어떻게 전해야 할지 모를 때.
            <br />
            <span className="text-stone-400">당신의 이야기로 편지를 써드립니다.</span>
          </p>
          <Link
            href="/write"
            className="mt-2 px-8 py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 transition-colors"
          >
            편지 쓰기
          </Link>
          <p className="text-stone-400 text-xs font-sans -mt-2">
            계정 없이 바로 시작할 수 있어요
          </p>
        </div>

        {/* Example letters */}
        <div className="flex flex-col gap-4">
          <p className="text-stone-400 text-xs font-sans text-center tracking-wide uppercase">
            이런 편지를 써드려요
          </p>

          {EXAMPLE_LETTERS.map((ex, i) => (
            <div key={i} className="flex flex-col gap-3 bg-white border border-stone-200 rounded-2xl p-5">
              <span className="font-sans text-xs text-stone-400">
                {ex.situation}
              </span>
              <p className="font-serif text-stone-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-5">
                {ex.preview}
              </p>
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="flex flex-col items-center gap-4 pb-8">
          <Link
            href="/write"
            className="w-full py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 transition-colors text-center"
          >
            내 편지 쓰기
          </Link>
          <p className="text-stone-400 text-xs font-sans text-center leading-relaxed">
            상황을 고르고 기억을 알려주면
            <br />
            당신만의 편지가 만들어져요
          </p>
        </div>

      </div>
    </main>
  )
}
