import { articleBodyToHtml, localizedArticle, safeArticleLink } from '@/lib/article-content'
import { field } from '@/lib/supabase/locale'
import { TrackArticleRead } from '@/components/quiz/TrackArticleRead'
import styles from './ArticleView.module.css'
import { formatShowcaseDate } from '@/lib/showcase-date'

function articleDate(value:string, locale:string) {
  if (locale !== 'ru') return formatShowcaseDate(value, locale)
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  const date = new Date(Date.parse(value) + 5 * 60 * 60 * 1000)
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

const labels = {
  uz: { author:'Muallif', category:'Kategoriya', published:'Chop etilgan', leader:"Bo'lim rahbari", editor:'Muharrir', translator:'Tarjimon', researcher:'Tadqiqotchi', fallback:"Bu maqolaning tarjimasi hali tayyor emas. O'zbekcha matn ko'rsatilmoqda.", preview:"Ko'rib chiqish — bu nusxa hali chop etilmagan." },
  en: { author:'Author', category:'Category', published:'Published', leader:'Leader', editor:'Editor', translator:'Translator', researcher:'Researcher', fallback:'This translation is not available yet. The Uzbek article is shown below.', preview:'Visitor preview — this version has not been published.' },
  ru: { author:'Автор', category:'Категория', published:'Опубликовано', leader:'Руководитель', editor:'Редактор', translator:'Переводчик', researcher:'Исследователь', fallback:'Перевод пока не готов. Ниже показана статья на узбекском языке.', preview:'Предпросмотр — эта версия ещё не опубликована.' },
}

/** The admin preview and public route deliberately use the same rendering. */
export function ArticleView({ article, locale, preview = false }: { article:Record<string, any>; locale:string; preview?:boolean }) {
  const localized = localizedArticle(article, locale)
  const label = labels[locale as keyof typeof labels] || labels.uz
  let bodyHtml: string
  try { bodyHtml = articleBodyToHtml(localized.body) }
  catch (error) {
    console.error('Article body rendering failed', { articleId:article.id, slug:article.slug, locale, error })
    throw error // A rendering failure must be observable, never disguised as 404.
  }
  const credits = [
    { label:label.leader, value:article.department_leader },
    { label:label.editor, value:article.editor },
    { label:label.translator, value:article.translator },
    { label:label.researcher, value:article.researcher },
  ].filter(item => typeof item.value === 'string' && item.value.trim())
  const cover = typeof article.cover_image_url === 'string' && /^https?:\/\//.test(article.cover_image_url) ? safeArticleLink(article.cover_image_url) : null
  const date = article.published_date ? new Date(article.published_date) : null
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {!preview && article.id && <TrackArticleRead articleId={article.id} categoryId={article.category_id ?? null} />}
      {preview && <p className="mb-6 rounded border border-border bg-muted px-4 py-3 text-sm" role="status">{label.preview}</p>}
      {localized.isFallback && <p className="mb-6 rounded border border-border bg-muted px-4 py-3 text-sm text-muted-foreground" role="note">{label.fallback}</p>}
      {cover && <div className="aspect-video overflow-hidden mb-8 rounded bg-muted"><img src={cover} alt={localized.title} width={1600} height={900} className="w-full h-full object-cover" fetchPriority="high" /></div>}
      <h1 className="text-3xl sm:text-4xl leading-tight font-bold mb-4" lang={localized.contentLocale}>{localized.title}</h1>
      <div className="space-y-2 mb-8">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {article.authors?.name && <span>{label.author}: <span className="text-foreground">{article.authors.name}</span></span>}
          {article.categories && <span>{label.category}: {field(article.categories, 'name', locale)}</span>}
          {date && !Number.isNaN(date.getTime()) && <span>{label.published}: <time dateTime={date.toISOString()}>{articleDate(date.toISOString(), locale)}</time></span>}
        </div>
        {credits.length > 0 && <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{credits.map(item => <span key={item.label}>{item.label}: <span className="text-foreground/90">{item.value}</span></span>)}</div>}
      </div>
      {Array.isArray(article.tags) && article.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-8">{article.tags.filter((tag:unknown) => typeof tag === 'string').map((tag:string, i:number) => <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{tag}</span>)}</div>}
      <div className={styles.body} lang={localized.contentLocale} dangerouslySetInnerHTML={{ __html:bodyHtml }} />
    </article>
  )
}
