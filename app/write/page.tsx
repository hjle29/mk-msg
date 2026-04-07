'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, SITUATIONS } from '@/data/situations'
import { Situation, CategorySlug, Answer, Scene, Question, Lang } from '@/lib/types'
import { nanoid } from 'nanoid'

type Step = 'categories' | 'situations' | 'custom' | 'questions' | 'scenes' | 'preview'

interface WriteState {
  step: Step
  selectedCategory: CategorySlug | null
  situation: Situation | null
  customSituation: string
  currentQuestionIndex: number
  answers: Answer[]
  scenes: Scene[]
  generatedLetter: string
  isGenerating: boolean
  shareId: string | null
  lang: Lang
}

const INITIAL_STATE: WriteState = {
  step: 'categories',
  selectedCategory: null,
  situation: null,
  customSituation: '',
  currentQuestionIndex: 0,
  answers: [],
  scenes: [{ id: nanoid(), content: '' }],
  generatedLetter: '',
  isGenerating: false,
  shareId: null,
  lang: 'ko',
}

// ── Sub-components ──────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors text-sm font-sans">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full bg-stone-200 rounded-full h-0.5">
      <div
        className="bg-stone-500 h-0.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.round((current / total) * 100)}%` }}
      />
    </div>
  )
}

// ── Category Step ───────────────────────────────────────────

function CategoryStep({ lang, onSelect, onLangToggle }: {
  lang: Lang
  onSelect: (category: CategorySlug) => void
  onLangToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-stone-400 hover:text-stone-600 transition-colors">
          <span className="font-serif text-xl">Dear,</span>
        </Link>
        <button onClick={onLangToggle} className="text-stone-400 hover:text-stone-600 text-sm font-sans transition-colors">
          {lang === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-stone-800">
          {lang === 'ko' ? '어떤 편지를 쓰고 싶어요?' : 'What kind of letter?'}
        </h2>
        <p className="text-stone-400 text-sm font-sans">
          {lang === 'ko' ? '상황을 골라주세요.' : 'Choose a situation.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className="flex flex-col items-start gap-2 p-4 bg-white border border-stone-200 rounded-2xl hover:border-stone-400 hover:shadow-sm transition-all text-left"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <div>
              <p className="font-sans font-medium text-stone-800 text-sm">
                {lang === 'ko' ? cat.name_ko : cat.name_en}
              </p>
              <p className="font-sans text-stone-400 text-xs mt-0.5">
                {lang === 'ko' ? cat.description_ko : cat.description_en}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Situation Step ──────────────────────────────────────────

function SituationStep({ category, lang, onSelect, onCustom, onBack }: {
  category: CategorySlug
  lang: Lang
  onSelect: (situation: Situation) => void
  onCustom: () => void
  onBack: () => void
}) {
  const cat = CATEGORIES.find((c) => c.slug === category)!
  const situations = SITUATIONS.filter((s) => s.category === category)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <BackButton onClick={onBack} />
        <span className="font-sans text-sm text-stone-400">{cat.emoji} {lang === 'ko' ? cat.name_ko : cat.name_en}</span>
      </div>

      <h2 className="font-serif text-2xl text-stone-800">
        {lang === 'ko' ? '어떤 상황인가요?' : 'What is the situation?'}
      </h2>

      <div className="flex flex-col gap-2">
        {situations.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-400 hover:shadow-sm transition-all text-left"
          >
            <span className="font-sans text-stone-800 text-sm">
              {lang === 'ko' ? s.name_ko : s.name_en}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-stone-300 flex-shrink-0">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}

        <button
          onClick={onCustom}
          className="flex items-center justify-between p-4 border border-dashed border-stone-300 rounded-xl hover:border-stone-500 transition-all text-left"
        >
          <span className="font-sans text-stone-500 text-sm">
            {lang === 'ko' ? '내 상황이 없어요 → 직접 설명할게요' : "My situation isn't here"}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-stone-300 flex-shrink-0">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Custom Situation Step ───────────────────────────────────

function CustomStep({ lang, value, onChange, onNext, onBack }: {
  lang: Lang
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <BackButton onClick={onBack} />

      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-stone-800">
          {lang === 'ko' ? '어떤 상황인지 편하게 말해주세요.' : 'Describe your situation.'}
        </h2>
        <p className="text-stone-400 text-sm font-sans">
          {lang === 'ko'
            ? '예) 장거리 연애 중인데 오랜만에 만나는 날'
            : 'e.g. Meeting my long-distance partner after months apart'}
        </p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={lang === 'ko' ? '상황을 설명해주세요...' : 'Describe your situation...'}
        rows={4}
        className="w-full p-4 bg-white border border-stone-200 rounded-xl font-sans text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none"
      />

      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="w-full py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {lang === 'ko' ? '다음' : 'Next'}
      </button>
    </div>
  )
}

// ── Question Step ───────────────────────────────────────────

function QuestionStep({ question, answer, lang, questionIndex, totalQuestions, onAnswer, onNext, onBack }: {
  question: Question
  answer: Answer | undefined
  lang: Lang
  questionIndex: number
  totalQuestions: number
  onAnswer: (value: string | string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const text = lang === 'ko' ? question.text_ko : question.text_en
  const currentValue = answer?.value ?? (question.type === 'multi' ? [] : '')
  const [customText, setCustomText] = useState('')

  const canProceed = question.required
    ? Array.isArray(currentValue)
      ? currentValue.length > 0
      : currentValue !== ''
    : true

  function handleSingleSelect(value: string) {
    onAnswer(value)
  }

  function handleMultiToggle(value: string) {
    const current = Array.isArray(currentValue) ? currentValue : []
    if (current.includes(value)) {
      onAnswer(current.filter((v) => v !== value))
    } else {
      onAnswer([...current, value])
    }
  }

  function handleCustomAdd() {
    if (!customText.trim()) return
    const current = Array.isArray(currentValue) ? currentValue : []
    if (!current.includes(customText.trim())) {
      onAnswer([...current, customText.trim()])
    }
    setCustomText('')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <BackButton onClick={onBack} />
          <span className="text-xs text-stone-400 font-sans">{questionIndex + 1} / {totalQuestions}</span>
        </div>
        <ProgressBar current={questionIndex + 1} total={totalQuestions} />
      </div>

      <h2 className="font-serif text-2xl text-stone-800 leading-snug">{text}</h2>

      {question.type === 'single' && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const label = lang === 'ko' ? opt.label_ko : opt.label_en
            const selected = currentValue === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleSingleSelect(opt.value)}
                className={`p-4 border rounded-xl text-left font-sans text-sm transition-all ${
                  selected
                    ? 'border-stone-600 bg-stone-800 text-stone-50'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'multi' && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const label = lang === 'ko' ? opt.label_ko : opt.label_en
            const current = Array.isArray(currentValue) ? currentValue : []
            const selected = current.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => handleMultiToggle(opt.value)}
                className={`p-4 border rounded-xl text-left font-sans text-sm transition-all ${
                  selected
                    ? 'border-stone-600 bg-stone-800 text-stone-50'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                }`}
              >
                {label}
              </button>
            )
          })}
          {question.placeholder_ko && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                placeholder={lang === 'ko' ? question.placeholder_ko : question.placeholder_en}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl font-sans text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
              />
              <button
                onClick={handleCustomAdd}
                className="px-4 py-3 border border-stone-200 rounded-xl font-sans text-sm text-stone-600 hover:border-stone-400 transition-colors"
              >
                +
              </button>
            </div>
          )}
          {Array.isArray(currentValue) && currentValue.filter(v => !question.options?.find(o => o.value === v)).map((custom) => (
            <div key={custom} className="flex items-center justify-between px-4 py-3 bg-stone-800 text-stone-50 rounded-xl">
              <span className="font-sans text-sm">{custom}</span>
              <button
                onClick={() => {
                  const current = Array.isArray(currentValue) ? currentValue : []
                  onAnswer(current.filter((v) => v !== custom))
                }}
                className="text-stone-400 hover:text-stone-200 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={typeof currentValue === 'string' ? currentValue : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={lang === 'ko' ? question.placeholder_ko : question.placeholder_en}
          rows={3}
          className="w-full p-4 bg-white border border-stone-200 rounded-xl font-sans text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none"
        />
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {lang === 'ko' ? '다음' : 'Next'}
      </button>
    </div>
  )
}

// ── Scenes Step ─────────────────────────────────────────────

function ScenesStep({ scenes, lang, onChange, onNext, onBack }: {
  scenes: Scene[]
  lang: Lang
  onChange: (scenes: Scene[]) => void
  onNext: () => void
  onBack: () => void
}) {
  function addScene() {
    onChange([...scenes, { id: nanoid(), content: '' }])
  }

  function updateScene(id: string, content: string) {
    onChange(scenes.map((s) => (s.id === id ? { ...s, content } : s)))
  }

  function removeScene(id: string) {
    if (scenes.length <= 1) return
    onChange(scenes.filter((s) => s.id !== id))
  }

  const hasAnyContent = scenes.some((s) => s.content.trim())

  return (
    <div className="flex flex-col gap-8">
      <BackButton onClick={onBack} />

      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-stone-800 leading-snug">
          {lang === 'ko'
            ? '기억에 남는 장면이 있나요?'
            : 'Any specific moments you remember?'}
        </h2>
        <p className="text-stone-500 text-sm font-sans leading-relaxed">
          {lang === 'ko'
            ? '작은 것도 괜찮아요. 말 한마디, 어떤 표정, 같이 있던 순간.'
            : 'Even small things. A word they said, an expression, a moment you shared.'}
        </p>
        <p className="text-stone-400 text-xs font-sans">
          {lang === 'ko'
            ? '구체적인 기억이 있을수록 편지가 달라집니다.'
            : 'The more specific, the more the letter feels like yours.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {scenes.map((scene, i) => (
          <div key={scene.id} className="flex gap-2">
            <textarea
              value={scene.content}
              onChange={(e) => updateScene(scene.id, e.target.value)}
              placeholder={
                lang === 'ko'
                  ? i === 0 ? '예) "자기야"라고 처음 불러줬을 때' : '또 다른 기억...'
                  : i === 0 ? 'e.g. The first time they called me by a nickname' : 'Another memory...'
              }
              rows={2}
              className="flex-1 p-3 bg-white border border-stone-200 rounded-xl font-sans text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none"
            />
            {scenes.length > 1 && (
              <button
                onClick={() => removeScene(scene.id)}
                className="self-start pt-3 text-stone-300 hover:text-stone-500 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addScene}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors font-sans text-sm mt-1"
        >
          <span className="text-lg leading-none">+</span>
          {lang === 'ko' ? '장면 추가하기' : 'Add another memory'}
        </button>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 transition-colors"
      >
        {hasAnyContent
          ? lang === 'ko' ? '편지 만들기' : 'Write my letter'
          : lang === 'ko' ? '건너뛰고 편지 만들기' : 'Skip and write my letter'}
      </button>
    </div>
  )
}

// ── Longer Questions by category ────────────────────────────

const LONGER_QUESTIONS: Record<string, [string, string][]> = {
  farewell: [
    ['앞으로 어떻게 됐으면 해요?', 'How do you hope things go from here?'],
    ['그 사람 없는 일상이 어떨 것 같아요?', 'What do you think daily life will feel like without them?'],
  ],
  gratitude: [
    ['그 사람이 없었다면 지금 어땠을까요?', 'Where do you think you\'d be without them?'],
    ['아직 못 했던 말이 있나요?', 'Is there something you\'ve never been able to say?'],
  ],
  apology: [
    ['가장 마음에 걸렸던 순간이 있나요?', 'Is there a specific moment that has weighed on you?'],
    ['다시 볼 수 있다면 제일 먼저 뭘 하고 싶어요?', 'If you could see them again, what would you do first?'],
  ],
  missing: [
    ['그 사람이 생각나는 특별한 순간이 있나요?', 'Are there particular moments when you think of them?'],
    ['다시 만나면 제일 먼저 뭘 하고 싶어요?', 'What would you want to do first if you met again?'],
  ],
  confession: [
    ['이 사람 곁에 있으면 어떤 기분이에요?', 'How do you feel when you\'re around this person?'],
    ['고백 후 어떻게 됐으면 해요?', 'What do you hope happens after this?'],
  ],
  cheering: [
    ['이 사람이 잘 될 거라고 생각하는 이유가 있나요?', 'What makes you believe in them?'],
    ['힘들 때 어떻게 있어줄 수 있을 것 같아요?', 'How do you think you can be there if things get hard?'],
  ],
  default: [
    ['더 전하고 싶은 기억이 있나요?', 'Is there another memory you\'d like to share?'],
    ['이 편지를 읽고 상대방이 어떤 기분이었으면 해요?', 'How do you hope they feel after reading this?'],
  ],
}

// ── Preview Step ────────────────────────────────────────────

function PreviewStep({
  letter, lang, isGenerating, shareId, category,
  onShorter, onLonger, onShare, onRestart
}: {
  letter: string
  lang: Lang
  isGenerating: boolean
  shareId: string | null
  category: CategorySlug | null
  onShorter: () => void
  onLonger: (context: string) => void
  onShare: () => void
  onRestart: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [longerMode, setLongerMode] = useState(false)
  const [longerAnswers, setLongerAnswers] = useState(['', ''])

  const qs = LONGER_QUESTIONS[category ?? 'default'] ?? LONGER_QUESTIONS.default

  async function handleCopy() {
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    onShare()
    setShareCopied(false)
  }

  async function handleCopyShareLink() {
    if (!shareId) return
    await navigator.clipboard.writeText(`${window.location.origin}/letter/${shareId}`)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  function handleLongerSubmit() {
    const context = qs
      .map((q, i) => longerAnswers[i].trim() ? `${lang === 'ko' ? q[0] : q[1]}: ${longerAnswers[i]}` : '')
      .filter(Boolean)
      .join('\n')
    setLongerMode(false)
    setLongerAnswers(['', ''])
    onLonger(context)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        <p className="text-stone-400 font-sans text-sm">
          {lang === 'ko' ? '편지를 쓰고 있어요...' : 'Writing your letter...'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <span className="font-serif text-xl text-stone-600">Dear,</span>
        <button onClick={onRestart} className="text-stone-400 hover:text-stone-600 font-sans text-sm transition-colors">
          {lang === 'ko' ? '처음부터' : 'Start over'}
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <p className="font-serif text-stone-800 text-base leading-relaxed whitespace-pre-wrap">
          {letter}
        </p>
      </div>

      {longerMode ? (
        <div className="flex flex-col gap-4 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
          <p className="font-sans text-sm text-stone-600">
            {lang === 'ko' ? '조금 더 알려주세요. 편지에 녹여드릴게요.' : 'Tell me a bit more and I\'ll weave it in.'}
          </p>
          {qs.map((q, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-stone-500">{lang === 'ko' ? q[0] : q[1]}</label>
              <textarea
                value={longerAnswers[i]}
                onChange={(e) => {
                  const next = [...longerAnswers]
                  next[i] = e.target.value
                  setLongerAnswers(next)
                }}
                rows={2}
                placeholder={lang === 'ko' ? '없어도 괜찮아요' : 'Optional'}
                className="w-full p-3 bg-white border border-stone-200 rounded-xl font-sans text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setLongerMode(false)}
              className="flex-1 py-2.5 border border-stone-200 rounded-full font-sans text-sm text-stone-500 hover:border-stone-400 transition-colors"
            >
              {lang === 'ko' ? '취소' : 'Cancel'}
            </button>
            <button
              onClick={handleLongerSubmit}
              className="flex-1 py-2.5 bg-stone-800 text-stone-50 rounded-full font-sans text-sm hover:bg-stone-700 transition-colors"
            >
              {lang === 'ko' ? '재생성' : 'Regenerate'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={onShorter}
              className="flex-1 py-2.5 border border-stone-200 rounded-full font-sans text-sm text-stone-600 hover:border-stone-400 transition-colors"
            >
              {lang === 'ko' ? '더 짧게' : 'Shorter'}
            </button>
            <button
              onClick={() => setLongerMode(true)}
              className="flex-1 py-2.5 border border-stone-200 rounded-full font-sans text-sm text-stone-600 hover:border-stone-400 transition-colors"
            >
              {lang === 'ko' ? '더 길게' : 'Longer'}
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-stone-800 text-stone-50 rounded-full font-sans text-sm tracking-wide hover:bg-stone-700 transition-colors"
          >
            {copied
              ? lang === 'ko' ? '복사됐어요' : 'Copied!'
              : lang === 'ko' ? '복사하기' : 'Copy'}
          </button>

          <button
            disabled
            className="w-full py-3 border border-stone-100 rounded-full font-sans text-sm text-stone-300 cursor-not-allowed"
          >
            {lang === 'ko' ? '링크로 공유하기 (준비 중)' : 'Share as link (coming soon)'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Write Page ─────────────────────────────────────────

export default function WritePage() {
  const [state, setState] = useState<WriteState>(INITIAL_STATE)

  const update = useCallback((patch: Partial<WriteState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  function getAnswer(questionId: string): Answer | undefined {
    return state.answers.find((a) => a.question_id === questionId)
  }

  function setAnswer(questionId: string, value: string | string[]) {
    setState((prev) => {
      const existing = prev.answers.find((a) => a.question_id === questionId)
      if (existing) {
        return { ...prev, answers: prev.answers.map((a) => a.question_id === questionId ? { ...a, value } : a) }
      }
      return { ...prev, answers: [...prev.answers, { question_id: questionId, value }] }
    })
  }

  async function generateLetter(targetLength?: 'shorter' | 'longer', additionalContext?: string) {
    update({ isGenerating: true, step: 'preview' })

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: state.situation,
          customSituation: state.customSituation || null,
          answers: state.answers,
          scenes: state.scenes.filter((s) => s.content.trim()),
          lang: state.lang,
          targetLength,
          currentContent: targetLength ? state.generatedLetter : undefined,
          additionalContext,
        }),
      })
      const data = await res.json()
      update({ generatedLetter: data.content, isGenerating: false })
    } catch {
      update({ isGenerating: false })
    }
  }

  async function handleShare() {
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation_id: state.situation?.id ?? null,
          custom_situation: state.customSituation || null,
          answers: state.answers,
          scenes: state.scenes.filter((s) => s.content.trim()),
          content: state.generatedLetter,
          lang: state.lang,
        }),
      })
      const data = await res.json()
      update({ shareId: data.share_id })
    } catch {
      console.error('Share failed')
    }
  }

  const questions = state.situation?.questions ?? []
  const currentQuestion = questions[state.currentQuestionIndex]

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-6 py-10">
      <div className="w-full max-w-md">

        {state.step === 'categories' && (
          <CategoryStep
            lang={state.lang}
            onSelect={(cat) => update({ selectedCategory: cat, step: 'situations' })}
            onLangToggle={() => update({ lang: state.lang === 'ko' ? 'en' : 'ko' })}
          />
        )}

        {state.step === 'situations' && state.selectedCategory && (
          <SituationStep
            category={state.selectedCategory}
            lang={state.lang}
            onSelect={(sit) => update({ situation: sit, currentQuestionIndex: 0, step: 'questions' })}
            onCustom={() => update({ step: 'custom' })}
            onBack={() => update({ step: 'categories' })}
          />
        )}

        {state.step === 'custom' && (
          <CustomStep
            lang={state.lang}
            value={state.customSituation}
            onChange={(v) => update({ customSituation: v })}
            onNext={() => update({ step: 'scenes' })}
            onBack={() => update({ step: 'situations' })}
          />
        )}

        {state.step === 'questions' && currentQuestion && (
          <QuestionStep
            question={currentQuestion}
            answer={getAnswer(currentQuestion.id)}
            lang={state.lang}
            questionIndex={state.currentQuestionIndex}
            totalQuestions={questions.length}
            onAnswer={(value) => setAnswer(currentQuestion.id, value)}
            onNext={() => {
              if (state.currentQuestionIndex < questions.length - 1) {
                update({ currentQuestionIndex: state.currentQuestionIndex + 1 })
              } else {
                update({ step: 'scenes' })
              }
            }}
            onBack={() => {
              if (state.currentQuestionIndex === 0) {
                update({ step: 'situations' })
              } else {
                update({ currentQuestionIndex: state.currentQuestionIndex - 1 })
              }
            }}
          />
        )}

        {state.step === 'scenes' && (
          <ScenesStep
            scenes={state.scenes}
            lang={state.lang}
            onChange={(scenes) => update({ scenes })}
            onNext={() => generateLetter()}
            onBack={() => {
              if (state.situation) {
                update({ step: 'questions', currentQuestionIndex: questions.length - 1 })
              } else {
                update({ step: 'custom' })
              }
            }}
          />
        )}

        {state.step === 'preview' && (
          <PreviewStep
            letter={state.generatedLetter}
            lang={state.lang}
            isGenerating={state.isGenerating}
            shareId={state.shareId}
            category={state.selectedCategory}
            onShorter={() => generateLetter('shorter')}
            onLonger={(context) => generateLetter('longer', context)}
            onShare={handleShare}
            onRestart={() => setState(INITIAL_STATE)}
          />
        )}
      </div>
    </main>
  )
}
