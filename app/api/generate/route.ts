import { NextRequest, NextResponse } from 'next/server'
import { GenerateRequest, Answer, Question } from '@/lib/types'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'gemma2-9b-it'

function buildAnswerSummary(
  answers: Answer[],
  questions: Question[],
  lang: 'ko' | 'en'
): string {
  return answers
    .map((a) => {
      const q = questions.find((q) => q.id === a.question_id)
      if (!q) return null

      const questionText = lang === 'ko' ? q.text_ko : q.text_en
      let valueText: string

      if (Array.isArray(a.value)) {
        valueText = a.value
          .map((v) => {
            const opt = q.options?.find((o) => o.value === v)
            return opt ? (lang === 'ko' ? opt.label_ko : opt.label_en) : v
          })
          .join(', ')
      } else {
        const opt = q.options?.find((o) => o.value === a.value)
        valueText = opt ? (lang === 'ko' ? opt.label_ko : opt.label_en) : a.value
      }

      if (!valueText) return null
      return `${questionText}: ${valueText}`
    })
    .filter(Boolean)
    .join('\n')
}

function buildPrompt(body: GenerateRequest): string {
  const { situation, customSituation, answers, scenes, lang, targetLength, currentContent, additionalContext } = body

  const situationName = situation
    ? lang === 'ko'
      ? situation.name_ko
      : situation.name_en
    : customSituation

  const answerSummary = situation
    ? buildAnswerSummary(answers, situation.questions, lang)
    : answers.map((a) => `${a.question_id}: ${Array.isArray(a.value) ? a.value.join(', ') : a.value}`).join('\n')

  const scenesList = scenes
    .filter((s) => s.content.trim())
    .map((s, i) => `${i + 1}. ${s.content}`)
    .join('\n')

  if (targetLength === 'shorter' && currentContent) {
    return lang === 'ko'
      ? `다음 편지를 더 짧고 간결하게 줄여주세요. 핵심 감정과 구체적인 기억은 유지하되, 전체적으로 압축해주세요.\n\n원본:\n${currentContent}`
      : `Please shorten the following letter while preserving the core emotion and specific memories.\n\nOriginal:\n${currentContent}`
  }

  if (targetLength === 'longer' && currentContent) {
    const extra = additionalContext ? `\n\n[추가로 알게 된 것]\n${additionalContext}` : ''
    return lang === 'ko'
      ? `다음 편지를 더 풍부하고 길게 다시 써주세요. 기존 내용을 바탕으로 하되, 아래 추가 정보를 자연스럽게 녹여서 감정과 기억을 더 깊이 표현해주세요. 단순히 늘리지 말고, 새 재료가 진짜 살아나도록 써주세요.\n\n원본:\n${currentContent}${extra}`
      : `Please rewrite and expand the following letter. Keep the original tone but weave in the additional context below so the new material feels genuine — don't just pad it out.\n\nOriginal:\n${currentContent}${additionalContext ? `\n\nAdditional context:\n${additionalContext}` : ''}`
  }

  if (lang === 'ko') {
    return `당신은 진심 어린 편지를 써주는 작가입니다. 아래 정보만 사용해서 한국어 편지를 써주세요.

상황: ${situationName}

[정보]
${answerSummary || '(없음)'}

[기억에 남는 장면 — 편지에 반드시 포함할 것]
${scenesList || '(없음)'}

[편지 스타일]
자연스러운 구어체. "~했어", "~거든", "~지" 같은 말투. 격식체("~입니다") 금지. 비속어 금지.
내(쓰는 사람)가 상대방("너")에게 쓰는 편지. 문단 2~3개.

[절대 금지]
- 위에 없는 내용 추가 금지 (없는 대화, 장소, 결과, 신체 묘사 등)
- 따옴표로 묶은 대사 지어내기 금지 ([기억에 남는 장면]에 대사가 없으면 대사 사용 금지)
- 메타 문장 시작 금지 ("편지를 쓴다", "마음을 전한다" 등)
- 질문으로 마무리 금지
- 조언/교훈 어투 금지 ("~해야 해", "~하는 게 좋아")

편지 본문만 쓸 것. 이름, 인사말 형식 불필요.`
  }

  return `You are a thoughtful letter writer who crafts personal, heartfelt letters.
Write a genuine, personal letter based on the information below.

Situation: ${situationName}

[Context]
${answerSummary}

[Specific memories]
${scenesList || '(none provided)'}

Guidelines:
- Weave the specific memories naturally into the letter
- Let the emotions selected permeate the whole letter
- Avoid generic phrases — make it feel like this specific person's story
- Write in natural, human English
- Write the body only — no salutation or sign-off needed
- Use appropriate paragraph breaks for readability
- Let the length be determined naturally by the richness of memories and emotions`
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const prompt = buildPrompt(body)

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    })

    if (!res.ok) throw new Error(`Groq error: ${res.status}`)

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    // Qwen3 thinking 태그 제거
    const content = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 })
  }
}
