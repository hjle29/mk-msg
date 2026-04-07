export type CategorySlug = 'farewell' | 'gratitude' | 'apology' | 'missing' | 'confession' | 'cheering'
export type QuestionType = 'single' | 'multi' | 'text'
export type Lang = 'ko' | 'en'

export interface Category {
  slug: CategorySlug
  name_ko: string
  name_en: string
  emoji: string
  description_ko: string
  description_en: string
}

export interface QuestionOption {
  value: string
  label_ko: string
  label_en: string
}

export interface Question {
  id: string
  text_ko: string
  text_en: string
  type: QuestionType
  options?: QuestionOption[]
  placeholder_ko?: string
  placeholder_en?: string
  required: boolean
}

export interface Situation {
  id: string
  category: CategorySlug
  name_ko: string
  name_en: string
  questions: Question[]
}

export interface Scene {
  id: string
  content: string
}

export interface Answer {
  question_id: string
  value: string | string[]
}

export interface WriteState {
  step: 'situation' | 'custom' | 'questions' | 'preview'
  situation: Situation | null
  customSituation: string | null
  currentQuestionIndex: number
  answers: Answer[]
  scenes: Scene[]
  lang: Lang
}

export interface Letter {
  id: string
  share_id: string
  situation_id: string | null
  custom_situation: string | null
  answers: Answer[]
  scenes: Scene[]
  content: string
  lang: Lang
  created_at: string
}

export interface GenerateRequest {
  situation: Situation | null
  customSituation: string | null
  answers: Answer[]
  scenes: Scene[]
  lang: Lang
  targetLength?: 'shorter' | 'longer'
  currentContent?: string
  additionalContext?: string
}

export interface GenerateResponse {
  content: string
  needsMore?: boolean
  additionalQuestions?: Question[]
}
