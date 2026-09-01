/**
 * Every line the assistant says on its own, in one place.
 *
 * Components read from here and hold no copy of their own, so wording is
 * edited in this file and nowhere else.
 *
 * Keys are the pathname with the locale prefix removed: '/' is the homepage,
 * '/quiz' the quiz section, and so on. A route not listed here gets no
 * proactive message at all — Media and Hamkorlar are deliberately absent
 * rather than present-but-empty.
 *
 * Tone: the audience is school-age students, so warm and plain. The single
 * wrench in the homepage greeting is the only emoji anywhere in bot copy.
 */

export type Localised = { uz: string; en: string }

export type BotCopy = {
  /** Shown once per session when a visitor lands on the route. */
  greeting: Localised
  /** Chips offered at the start of a chat. Three per route, four at most. */
  suggestions: { uz: string[]; en: string[] }
}

/**
 * Used when the visitor opens the chat by hand on a route with no proactive
 * greeting of its own. It is a reply to being opened, not an interruption.
 */
export const DEFAULT_GREETING: Localised = {
  uz: 'Salom! Men Murvatcha. Sayt bo\'yicha yoki muhandislik haqida savolingiz bo\'lsa, yozing.',
  en: "Hello! I'm The Fixy. Ask me about the site or about engineering.",
}

export const BOT_MESSAGES: Record<string, BotCopy> = {
  '/': {
    greeting: {
      uz: 'Salom! Men Murvatcha 🔧 Muhandislik olamiga birga sayohat qilamizmi? Istalgan savolingizni bering!',
      en: "Hello! I'm The Fixy 🔧 Shall we explore the world of engineering together? Ask me anything!",
    },
    suggestions: {
      uz: ['Hakatonlar qachon bo\'ladi?', 'Menga loyiha g\'oyasi ber', 'MUHANDISS.UZ nima?'],
      en: ['When are the hackathons?', 'Give me a project idea', 'What is MUHANDISS.UZ?'],
    },
  },

  '/quiz': {
    greeting: {
      uz: 'Muhandislik bilimingizni sinab ko\'ramizmi?',
      en: 'Shall we test what you know about engineering?',
    },
    suggestions: {
      uz: ['Qaysi quizdan boshlay?', 'Oson quizlar bormi?', 'Quiz qanday ishlaydi?'],
      en: ['Which quiz should I start with?', 'Are there easy quizzes?', 'How does a quiz work?'],
    },
  },

  '/hackathons': {
    greeting: {
      uz: 'Hakatonda birinchi marta qatnashyapsizmi? Jamoa tuzish va g\'oya tanlash bo\'yicha maslahat beray!',
      en: 'First time at a hackathon? Let me help you build a team and pick an idea!',
    },
    suggestions: {
      uz: ['Hakaton nima?', 'Jamoani qanday tuzaman?', 'Qanday g\'oya tanlasam bo\'ladi?'],
      en: ['What is a hackathon?', 'How do I build a team?', 'What idea should I pick?'],
    },
  },

  '/articles': {
    greeting: {
      uz: 'Qaysi mavzu qiziq? Sizga mos maqolani topib beraman.',
      en: 'Which topic interests you? I can find the right article for you.',
    },
    suggestions: {
      uz: ['Qanday yo\'nalishlar bor?', 'Boshlovchilar uchun nima o\'qiy?', 'Elektr haqida maqola bormi?'],
      en: ['What subjects are covered?', 'What should a beginner read?', 'Any articles on electronics?'],
    },
  },

  '/projects': {
    greeting: {
      uz: 'Bu loyihalarni sizdek o\'quvchilar qilgan. G\'oya kerakmi?',
      en: 'Students like you built these projects. Need an idea?',
    },
    suggestions: {
      uz: ['Menga loyiha g\'oyasi ber', 'Qayerdan boshlasam bo\'ladi?', 'Loyihamni qanday joylayman?'],
      en: ['Give me a project idea', 'Where do I start?', 'How do I submit my project?'],
    },
  },

  '/team': {
    greeting: {
      uz: 'Bu bizning jamoa. Qanday qo\'shilish mumkinligini bilasizmi?',
      en: 'This is our team. Do you know how you can join?',
    },
    suggestions: {
      uz: ['Jamoaga qanday qo\'shilaman?', 'Kimlar ishtirok etadi?', 'Qanday yordam bera olaman?'],
      en: ['How do I join the team?', 'Who takes part?', 'How can I help?'],
    },
  },
}

/** Strips the locale prefix. '/uz/quiz' becomes '/quiz'; '/uz' becomes '/'. */
export function routeKey(pathname: string): string {
  const stripped = pathname.replace(/^\/(uz|en)(?=\/|$)/, '')
  return stripped === '' ? '/' : stripped
}

/**
 * The copy for a path, or null when the route has no proactive message.
 *
 * Section keys match by prefix, so a detail page such as
 * /uz/articles/gears-and-gearboxes inherits the Maqolalar copy. The homepage
 * is matched exactly, otherwise '/' would swallow every route.
 */
export function copyForPath(pathname: string): BotCopy | null {
  const key = routeKey(pathname)
  if (key === '/') return BOT_MESSAGES['/']

  for (const section of Object.keys(BOT_MESSAGES)) {
    if (section === '/') continue
    if (key === section || key.startsWith(section + '/')) return BOT_MESSAGES[section]
  }
  return null
}

export function pick(value: Localised, locale: string): string {
  return locale === 'en' ? value.en : value.uz
}

export function pickList(value: { uz: string[]; en: string[] }, locale: string): string[] {
  return locale === 'en' ? value.en : value.uz
}
