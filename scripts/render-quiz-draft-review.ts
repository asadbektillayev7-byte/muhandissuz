/**
 * Create an offline editorial review. No network calls or publication actions.
 * Usage: node --import tsx scripts/render-quiz-draft-review.ts /absolute/output.html
 * The optional import receipt adds authenticated admin preview/edit links.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { readQuizDraftBatch, validateQuizDraftBatch, type ArticleQuizDraft } from './lib/quiz-draft-data'

type Manifest = {
  reviewed_at: string
  published_article_count: number
  quiz_count: number
  question_count: number
  pending_articles: Array<{ id: number; slug: string; title: string; reason: string }>
  guidance: Array<{ title: string; url: string }>
}
type Receipt = {
  imported_at: string
  drafts: Array<{ id: number; slug: string; article_id: number; published: false; questions: number }>
}

const drafts = await readQuizDraftBatch()
const counts = validateQuizDraftBatch(drafts)
const manifest: Manifest = JSON.parse(await readFile(new URL('../content/quiz-drafts/manifest.json', import.meta.url), 'utf8'))
if (counts.quizzes !== manifest.quiz_count || counts.questions !== manifest.question_count) {
  throw new Error('Manifest counts do not match the quiz content.')
}
let receipt: Receipt | undefined
try {
  receipt = JSON.parse(await readFile(new URL('../content/quiz-drafts/import-receipt.json', import.meta.url), 'utf8'))
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
}
const imported = new Map(receipt?.drafts.map(row => [row.article_id, row]) ?? [])
for (const draft of drafts) {
  const row = imported.get(draft.article_id)
  if (row && (row.published !== false || row.slug !== draft.slug || row.questions !== draft.questions.length || !Number.isSafeInteger(row.id) || row.id < 1)) {
    throw new Error(`Import receipt does not match draft ${draft.article_id}.`)
  }
}

const esc = (value: unknown) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
const both = (uz: string, en: string) => `<span lang="uz">${esc(uz)}</span><span lang="en">${esc(en)}</span>`
const site = 'https://www.muhandiss.uz'
const sourceLink = (slug: string) => `${site}/uz/articles/${encodeURIComponent(slug)}`
const categories: Record<string, [string, string]> = {
  'motorsports-engineering': ['Motosport', 'Motorsport'],
  'environmental-engineering': ['Atrof-muhit', 'Environment'],
  'mechanical-engineering': ['Mexanika', 'Mechanical'],
  'electrical-engineering': ['Elektr', 'Electrical'],
  'chemical-engineering': ['Kimyo', 'Chemical'],
  'civil-engineering': ['Qurilish', 'Civil'],
  'artificial-intelligence': ['Sun’iy intellekt', 'Artificial intelligence'],
}
const categoryLabel = (slug: string) => categories[slug] ?? [slug, slug]

function quizCard(quiz: ArticleQuizDraft, index: number) {
  const saved = imported.get(quiz.article_id)
  const preview = saved ? `${site}/admin/quiz/${saved.id}/preview` : undefined
  const search = [quiz.title_uz, quiz.title_en, quiz.source_title, ...quiz.questions.flatMap(q => [q.question_uz, q.question_en, ...q.options_uz, ...q.options_en])].join(' ')
  return `<article class="quiz-card" data-category="${esc(quiz.category_slug)}" data-search="${esc(search)}" id="quiz-${quiz.article_id}">
    <div class="card-top"><span class="number">${String(index + 1).padStart(2, '0')}</span><span class="category">${both(...categoryLabel(quiz.category_slug) as [string, string])}</span><span class="draft">${both('QORALAMA', 'DRAFT')}</span></div>
    <h2>${both(quiz.title_uz, quiz.title_en)}</h2>
    <p class="description">${both(quiz.description_uz, quiz.description_en)}</p>
    <p class="meta">${both(`${quiz.questions.length} savol · Taxminan ${quiz.duration_minutes} daqiqa`, `${quiz.questions.length} questions · About ${quiz.duration_minutes} minutes`)}</p>
    <div class="source"><span class="small-label">${both('ASOS BO‘LGAN MAQOLA', 'SOURCE ARTICLE')}</span><a href="${esc(sourceLink(quiz.article_slug))}" target="_blank" rel="noopener noreferrer">${esc(quiz.source_title)} ↗</a></div>
    ${preview ? `<div class="admin-links"><a class="preview-link" data-preview="${esc(preview)}" href="${esc(preview)}?lang=uz" target="_blank" rel="noopener noreferrer">${both('Admin orqali sinab ko‘rish', 'Try the admin preview')} ↗</a><a href="${esc(`${site}/admin/quiz/${saved!.id}`)}" target="_blank" rel="noopener noreferrer">${both('Tahrirlash', 'Edit')} ↗</a><span class="muted">${both('Admin hisobiga kirish kerak', 'Admin sign-in required')}</span></div>` : ''}
    <details class="quiz-questions"><summary>${both('4 savolni ko‘rib chiqish', 'Review the 4 questions')}<span aria-hidden="true">＋</span></summary><div class="questions">
      ${quiz.questions.map((q, i) => `<section class="question"><h3><span class="question-number">${i + 1}.</span> ${both(q.question_uz, q.question_en)}</h3>
        <ol class="options" type="A">${q.options_uz.map((option, j) => `<li data-correct="${j === q.correct_index}">${both(option, q.options_en[j])}</li>`).join('')}</ol>
        <details class="answer"><summary>${both('Javob va izoh', 'Answer and explanation')}</summary><div class="answer-body"><p class="correct-answer">${both('To‘g‘ri javob', 'Correct answer')}: ${String.fromCharCode(65 + q.correct_index)} — ${both(q.options_uz[q.correct_index], q.options_en[q.correct_index])}</p><p>${both(q.explanation_uz, q.explanation_en)}</p>
          <details class="evidence"><summary>${both('Maqoladagi dalilni ko‘rish', 'See the supporting source passage')}</summary><blockquote>${esc(q.evidence.quote)}</blockquote><p class="objective"><strong>${both('O‘rganish maqsadi', 'Learning objective')}:</strong> ${esc(q.evidence.learning_objective)}</p></details>
        </div></details>
      </section>`).join('')}
    </div></details>
  </article>`
}

const categoryOptions = [...new Set(drafts.map(quiz => quiz.category_slug))].sort().map(slug => {
  const [uz, en] = categoryLabel(slug)
  return `<option value="${esc(slug)}" data-uz="${esc(uz)}" data-en="${esc(en)}">${esc(uz)}</option>`
}).join('')
const html = `<!doctype html>
<html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Muhandiss · Quiz qoralamalari</title>
<style>
:root{color-scheme:light;--bg:#f5f5fa;--card:#fff;--text:#252433;--muted:#656474;--line:#dedee8;--accent:#6543c9;--accent-soft:#f0ebff;--green:#146444;--green-bg:#e9f7ef;--amber:#84581c;--amber-bg:#fff5db;--shadow:0 8px 28px #25243307}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;--bg:#14131c;--card:#1d1c28;--text:#efedf7;--muted:#b1adbf;--line:#373442;--accent:#bba4ff;--accent-soft:#302343;--green:#9de0b8;--green-bg:#1b3528;--amber:#f2cf89;--amber-bg:#342a19;--shadow:none}}
:root[data-theme=dark]{color-scheme:dark;--bg:#14131c;--card:#1d1c28;--text:#efedf7;--muted:#b1adbf;--line:#373442;--accent:#bba4ff;--accent-soft:#302343;--green:#9de0b8;--green-bg:#1b3528;--amber:#f2cf89;--amber-bg:#342a19;--shadow:none}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}button,summary,a,select{touch-action:manipulation}a{color:var(--accent);text-underline-offset:3px}a:hover{text-decoration-thickness:2px}button,select,input{border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--text)}button,select{cursor:pointer}button{padding:9px 14px}button:hover,summary:hover{background:var(--accent-soft)}:focus-visible{outline:3px solid var(--accent);outline-offset:4px}html[lang=uz] [lang=en],html[lang=en] [lang=uz],[hidden]{display:none!important}.wrap{max-width:1060px;margin:auto;padding:28px 28px 64px}.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:35px}.brand{font-weight:800;letter-spacing:-.03em;font-size:21px}.top-actions{display:flex;gap:8px;align-items:center}.languages{display:flex;padding:3px;background:var(--card);border:1px solid var(--line);border-radius:13px}.languages button{border:0;padding:5px 12px;border-radius:9px;background:transparent}.languages button[aria-pressed=true]{background:var(--accent-soft);color:var(--accent);font-weight:750}.eyebrow,.small-label{font-size:11px;letter-spacing:.12em;font-weight:750;display:block;color:var(--muted)}.eyebrow{color:var(--accent);margin-bottom:10px}h1{font-size:clamp(30px,5.2vw,48px);letter-spacing:-.045em;line-height:1.12;margin:0 0 16px;max-width:780px}p{margin:0 0 12px}.intro{color:var(--muted);max-width:760px;font-size:17px}.status{border:1px solid color-mix(in srgb,var(--amber) 24%,transparent);background:var(--amber-bg);color:var(--amber);padding:15px 19px;border-radius:14px;margin:22px 0}.status strong{display:block;margin-bottom:4px}.status p{font-size:14px;margin:0}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0 26px}.stat{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:17px 20px}.stat strong{font-size:30px;letter-spacing:-.04em;display:block;line-height:1.2}.stat span{color:var(--muted);font-size:13px}.controls{position:sticky;top:0;z-index:2;background:var(--bg);padding:12px 0;border-bottom:1px solid var(--line);margin-bottom:22px}.filter-row{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px}.field label{display:block;font-size:12px;font-weight:700;color:var(--muted);margin:0 0 5px}.field input,.field select{width:100%;padding:11px 13px}.action-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:11px}.action-row button{font-size:13px;padding:7px 11px}.result-count{font-size:13px;color:var(--muted);margin-left:auto}.quiz-card{border:1px solid var(--line);border-radius:20px;background:var(--card);box-shadow:var(--shadow);padding:25px 27px;margin-bottom:18px;scroll-margin-top:190px}.card-top{display:flex;align-items:center;gap:10px;margin-bottom:13px}.number{font-size:12px;font-weight:800;color:var(--accent);background:var(--accent-soft);width:29px;height:29px;border-radius:9px;display:grid;place-items:center}.category{font-size:12px;font-weight:650;color:var(--muted)}.draft{margin-left:auto;padding:3px 8px;border-radius:7px;background:var(--amber-bg);color:var(--amber);font-size:10px;font-weight:800;letter-spacing:.08em}h2{font-size:23px;line-height:1.25;letter-spacing:-.025em;margin:0 0 9px}.description{font-size:15px;color:var(--muted);margin:0 0 9px}.meta{font-size:12px;font-weight:650;color:var(--muted)}.source{border-left:3px solid var(--line);padding:2px 0 2px 13px;margin:16px 0}.source a{font-size:14px}.source .small-label{margin-bottom:3px;letter-spacing:.07em}.admin-links{display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:13px;margin:12px 0 19px}.admin-links .preview-link{font-weight:700}.muted{color:var(--muted);font-size:12px}.quiz-questions>summary{display:flex;align-items:center;justify-content:space-between;list-style:none;border-top:1px solid var(--line);padding:14px 0 0;margin-top:17px;font-size:14px;font-weight:750;cursor:pointer;color:var(--accent)}.quiz-questions>summary::-webkit-details-marker{display:none}.quiz-questions[open]>summary>span:last-child{transform:rotate(45deg)}.question{border-top:1px solid var(--line);padding-top:22px;margin-top:22px}.question:first-child{border:0;padding-top:4px}.question h3{font-size:17px;line-height:1.5;margin:0 0 14px;font-weight:680}.question-number{color:var(--accent);font-weight:800}.options{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;list-style-position:inside;padding:0;margin:0 0 14px}.options li{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px 14px;font-size:14px}.options li::marker{font-weight:800;color:var(--muted)}.question:has(.answer[open]) li[data-correct=true]{background:var(--green-bg);border-color:var(--green);color:var(--green)}.answer>summary{cursor:pointer;color:var(--accent);font-size:13px;font-weight:650;width:fit-content;border-radius:7px;padding:4px}.answer-body{margin-top:10px;border-radius:12px;background:var(--green-bg);padding:16px 18px;font-size:14px}.correct-answer{font-weight:750;color:var(--green)}.answer-body p:last-child{margin-bottom:0}.evidence{border-top:1px solid color-mix(in srgb,var(--green) 22%,transparent);padding-top:10px;margin-top:14px}.evidence summary{font-size:12px;cursor:pointer;color:var(--green)}blockquote{font-size:13px;border-left:3px solid var(--green);padding-left:13px;margin:13px 0;white-space:pre-wrap}.objective{font-size:12px;color:var(--muted)}.empty{padding:45px;text-align:center;border:1px dashed var(--line);border-radius:18px;color:var(--muted)}.pending{border:1px solid var(--line);border-radius:18px;background:var(--card);padding:22px 26px;margin-top:32px}.pending>summary{cursor:pointer;font-size:18px;font-weight:750;line-height:1.4}.pending-intro{color:var(--muted);font-size:14px;margin-top:15px}.pending ol{padding-left:23px}.pending li{padding:8px 0;font-size:14px}.pending li small{color:var(--muted);display:block;font-size:12px}.notes{margin-top:30px;border-top:1px solid var(--line);padding-top:22px;color:var(--muted);font-size:13px}.notes h2{font-size:17px;color:var(--text)}.notes ul{padding-left:20px}.footer{margin-top:25px;font-size:12px;color:var(--muted)}
@media(max-width:600px){.wrap{padding:18px 16px 40px}.topbar{align-items:flex-start;margin-bottom:25px}.brand{font-size:18px}.top-actions{gap:5px}.top-actions>button{font-size:12px;padding:9px}.languages button{padding:5px 8px}.stats{gap:8px}.stat{padding:14px 12px}.stat strong{font-size:25px}.stat span{font-size:11px}.filter-row{grid-template-columns:1fr}.controls{position:static}.quiz-card{padding:20px 17px}.options{grid-template-columns:1fr}.result-count{width:100%;margin:3px 0}.pending{padding:19px 17px}h2{font-size:21px}.answer-body{padding:13px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{:root{color-scheme:light!important;--bg:white!important;--card:white!important;--text:#111!important;--muted:#444!important;--line:#ccc!important;--accent:#333!important;--green:#135332!important;--green-bg:#f5faf6!important;--amber:#5e4819!important;--amber-bg:white!important}body{font-size:11pt}.wrap{max-width:none;padding:0}.controls,.top-actions,.admin-links,.footer{display:none!important}.quiz-card{box-shadow:none;break-inside:auto;padding:16px;margin:0 0 18px}.question,.source,.stat{break-inside:avoid}.options{grid-template-columns:1fr 1fr}.question h3{font-size:12pt}.options li,.answer-body{font-size:10pt}.pending{break-before:page}.status{padding:12px}.quiz-questions>summary{display:none}.answer>summary{display:none}.evidence{display:none}.stats{margin:15px 0}.notes{font-size:9pt}h1{font-size:29pt}h2{font-size:17pt}.intro{font-size:11pt}}
</style></head><body><div class="wrap">
<header><div class="topbar"><div class="brand">Muhandiss<span style="color:var(--accent)">.uz</span></div><div class="top-actions"><div class="languages" aria-label="Language / Til"><button id="lang-uz" aria-pressed="true">UZ</button><button id="lang-en" aria-pressed="false">EN</button></div><button id="theme">${both('◐ Mavzu', '◐ Theme')}</button></div></div>
<div class="eyebrow">${both(`MUHARRIR UCHUN · ${manifest.reviewed_at}`, `EDITORIAL REVIEW · ${manifest.reviewed_at}`)}</div><h1>${both('Maqoladan bilimga. Bir quizdan boshlang.', 'From reading to understanding. One quiz at a time.')}</h1><p class="intro">${both('Maqolalarga asoslangan qisqa quizlar. Savollar, javoblar va izohlarni ko‘rib chiqing; har bir javobning maqoladagi dalili ham saqlangan.', 'Short quizzes based on published articles. Review the questions, answers and explanations, with a supporting source passage for every answer.')}</p>
<div class="status"><strong>${both('Qoralamalar — saytda e’lon qilinmagan', 'Drafts — not published on the website')}</strong><p>${both(imported.size ? `${imported.size} quiz admin panelda qoralama sifatida saqlangan. Ko‘rib chiqish tugagach, har birini alohida e’lon qilishingiz mumkin.` : 'Bu fayl savollarni ko‘rib chiqish uchun tayyorlangan. Uni ochish yoki tugmalarini bosish hech narsani e’lon qilmaydi.', imported.size ? `${imported.size} quizzes were saved as drafts in the admin panel. You can publish each individually after review.` : 'This file is prepared for editorial review. Opening it or using its controls does not publish anything.')}</p></div>
<div class="stats"><div class="stat"><strong>${counts.quizzes}</strong>${both('maqolaga asoslangan quiz', 'article-based quizzes')}</div><div class="stat"><strong>${counts.questions}</strong>${both('savol · UZ va EN', 'questions · UZ and EN')}</div><div class="stat"><strong>${manifest.pending_articles.length}</strong>${both('maqolaga to‘liq matn kerak', 'articles need full body text')}</div></div></header>
<main><section class="controls" aria-label="Review controls"><div class="filter-row"><div class="field"><label for="search">${both('Quiz yoki savol qidirish', 'Search quizzes or questions')}</label><input id="search" type="search" placeholder="Masalan: suv, motor, sun’iy intellekt" autocomplete="off"></div><div class="field"><label for="category">${both('Yo‘nalish', 'Category')}</label><select id="category"><option value="" data-uz="Barcha yo‘nalishlar" data-en="All categories">Barcha yo‘nalishlar</option>${categoryOptions}</select></div></div><div class="action-row"><button id="expand-all">${both('Savollarni ochish', 'Expand questions')}</button><button id="collapse-all">${both('Yig‘ish', 'Collapse')}</button><button id="answers" aria-pressed="false">${both('Javoblarni ko‘rsatish', 'Show answers')}</button><button id="print">${both('Chop etish', 'Print')}</button><span class="result-count" id="result-count" role="status" aria-live="polite"></span></div></section>
<div id="quizzes">${drafts.map(quizCard).join('')}</div><p class="empty" id="empty" hidden>${both('Mos quiz topilmadi. Qidiruv yoki yo‘nalishni o‘zgartiring.', 'No matching quizzes. Try another search or category.')}</p>
<details class="pending"><summary>${both(`To‘liq matn kerak bo‘lgan ${manifest.pending_articles.length} maqola`, `${manifest.pending_articles.length} articles awaiting full body text`)}</summary><p class="pending-intro">${both('Bu yozuvlar e’lon qilingan, ammo o‘zbekcha va inglizcha asosiy matnlari bo‘sh. Ularda faqat qisqa tavsif bor; to‘liq maqolalarsiz savollar tuzilmadi.', 'These records are published, but both their Uzbek and English bodies are empty. They have short excerpts only, so no new article-based questions were created for them.')}</p><ol>${manifest.pending_articles.map(article => `<li><a href="${esc(sourceLink(article.slug))}" target="_blank" rel="noopener noreferrer">${esc(article.title)} ↗</a><small>${both(`Maqola #${article.id} · Asosiy matnni qo‘shish kerak`, `Article #${article.id} · Full body text needed`)}</small></li>`).join('')}</ol></details>
<section class="notes"><h2>${both('Ko‘rib chiqishda nimalarga qarash kerak?', 'What to look for during review')}</h2><p>${both('Har bir savolda bitta eng to‘g‘ri javob bor. Javob izohi tushunchani mustahkamlaydi. Savollar yosh o‘quvchilar uchun yozilgan; murakkablik darajalari qo‘yilmagan.', 'Each question has one best answer. Its explanation reinforces the idea being learned. The questions are written for young readers without difficulty labels.')}</p><p>${both('Bu material imtihon yoki bilim darajasini sertifikatlash testi emas; maqolalarni tushunish va eslab qolishga yordam beradi.', 'This is a learning activity to support understanding and recall of the articles, rather than a certification or high-stakes assessment.')}</p><ul>${manifest.guidance.map(source => { const url = new URL(source.url); if (url.protocol !== 'https:') throw new Error('Guidance links must use HTTPS.'); return `<li><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>` }).join('')}</ul></section>
</main><footer class="footer">${both('Mustaqil ko‘rib chiqish fayli. Qidiruv va javoblar internetga ulanmasdan ishlaydi; tashqi havolalar uchun internet kerak.', 'Standalone review file. Search and answers work offline; external links require an internet connection.')} · ${esc(manifest.reviewed_at)}</footer></div>
<script>
(function(){
  const root=document.documentElement, cards=Array.from(document.querySelectorAll('.quiz-card'));
  const search=document.getElementById('search'), category=document.getElementById('category');
  let language='uz', showAnswers=false;
  function normalise(value){return value.toLocaleLowerCase().replace(/[‘’ʻʼ'\u0060]/g,'');}
  function filter(){
    const term=normalise(search.value.trim()); let shown=0;
    cards.forEach(card=>{card.hidden=!!((category.value&&card.dataset.category!==category.value)||(term&&!normalise(card.dataset.search).includes(term)));if(!card.hidden)shown++;});
    document.getElementById('result-count').textContent=language==='uz'?shown+' / '+cards.length+' quiz':shown+' of '+cards.length+' quizzes';
    document.getElementById('empty').hidden=shown!==0;
  }
  function setLanguage(next){
    language=next;root.lang=next;
    ['uz','en'].forEach(lang=>document.getElementById('lang-'+lang).setAttribute('aria-pressed',String(lang===next)));
    category.querySelectorAll('option').forEach(option=>option.textContent=option.dataset[next]);
    search.placeholder=next==='uz'?'Masalan: suv, motor, sun’iy intellekt':'Try water, engines, artificial intelligence';
    document.querySelectorAll('[data-preview]').forEach(link=>link.href=link.dataset.preview+'?lang='+next);
    filter();
  }
  function setAnswers(visible){
    showAnswers=visible;
    document.querySelectorAll('.answer').forEach(answer=>answer.open=visible);
    document.getElementById('answers').setAttribute('aria-pressed',String(visible));
    document.querySelector('#answers [lang=uz]').textContent=visible?'Javoblarni yashirish':'Javoblarni ko‘rsatish';
    document.querySelector('#answers [lang=en]').textContent=visible?'Hide answers':'Show answers';
  }
  document.getElementById('lang-uz').addEventListener('click',()=>setLanguage('uz'));
  document.getElementById('lang-en').addEventListener('click',()=>setLanguage('en'));
  search.addEventListener('input',filter);category.addEventListener('change',filter);
  document.getElementById('expand-all').addEventListener('click',()=>cards.filter(card=>!card.hidden).forEach(card=>card.querySelector('.quiz-questions').open=true));
  document.getElementById('collapse-all').addEventListener('click',()=>document.querySelectorAll('.quiz-questions').forEach(quiz=>quiz.open=false));
  document.getElementById('answers').addEventListener('click',()=>{setAnswers(!showAnswers);if(showAnswers)cards.filter(card=>!card.hidden).forEach(card=>card.querySelector('.quiz-questions').open=true);});
  document.getElementById('theme').addEventListener('click',()=>{const isDark=root.dataset.theme?root.dataset.theme==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;root.dataset.theme=isDark?'light':'dark';});
  let printState=[];
  window.addEventListener('beforeprint',()=>{printState=Array.from(document.querySelectorAll('details')).map(detail=>[detail,detail.open]);document.querySelectorAll('.quiz-questions,.answer,.pending').forEach(detail=>detail.open=true);});
  window.addEventListener('afterprint',()=>printState.forEach(([detail,open])=>detail.open=open));
  document.getElementById('print').addEventListener('click',()=>window.print());
  filter();
})();
</script></body></html>`

const output = resolve(process.argv[2] ?? 'quiz-drafts-review.html')
await mkdir(dirname(output), { recursive: true })
await writeFile(output, html, 'utf8')
console.log(`Rendered ${counts.quizzes} draft quizzes and ${counts.questions} questions to ${output}${receipt ? ' (with admin links)' : ''}.`)
