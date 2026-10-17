import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { BOT_MESSAGES, copyForPath, greetingSection } from '../src/lib/botMessages'

test('every public section has fixed bilingual copy and detail pages share their section', () => {
  const sections = ['/', '/articles', '/quiz', '/hackathons', '/projects', '/team', '/media', '/partners', '/mentors', '/glossary', '/about', '/contact', '/feedback']
  for (const section of sections) for (const language of ['uz', 'en', 'ru']) {
    const path = `/${language}${section === '/' ? '' : section}`
    assert.equal(greetingSection(path), section)
    const copy = copyForPath(path)!
    assert.ok(copy.greeting.uz.length > 15 && copy.greeting.en.length > 15)
    assert.ok(copy.suggestions.uz.length && copy.suggestions.en.length)
    if (section !== '/') assert.equal(copyForPath(`${path}/example`), copy)
    assert.equal(copyForPath(`${path}/`), copy)
  }
  for (const path of ['/admin', '/uz/avatar-preview', '/uz/article-preview', '/uz/articles-not-real']) assert.equal(copyForPath(path), null)
  assert.equal(BOT_MESSAGES['/quiz'].greeting.uz, 'Muhandislik bilimingizni sinab ko\'ramizmi?')
})

test('greetings wait, follow navigation, dismiss per section, and respect foreground/chat/drag state', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {url:'https://greetings.example.test/uz', pretendToBeVisual:true})
  const window = dom.window
  const globals = globalThis as unknown as Record<string, unknown>
  const descriptors = new Map<string, PropertyDescriptor | undefined>()
  for (const name of ['window','document','navigator','HTMLElement','Element','Node','sessionStorage','IS_REACT_ACT_ENVIRONMENT']) {
    descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis,name))
    Object.defineProperty(globalThis,name,{configurable:true,writable:true,value:name==='window'?window:name==='IS_REACT_ACT_ENVIRONMENT'?true:(window as unknown as Record<string,unknown>)[name]})
  }
  let now = 0, nextId = 0
  const timers = new Map<number,{at:number;callback:()=>void}>()
  window.setTimeout = ((callback:()=>void,delay=0) => { const id=++nextId;timers.set(id,{at:now+delay,callback});return id }) as typeof window.setTimeout
  window.clearTimeout = id => {timers.delete(Number(id))}
  let hidden = false
  Object.defineProperty(window.document,'hidden',{configurable:true,get:()=>hidden})
  const {createElement,act}=await import('react')
  const {createRoot}=await import('react-dom/client')
  const {useAssistantGreeting,GREETING_DELAY_MS,greetingSessionKey}=await import('../src/components/useAssistantGreeting')
  let props={pathname:'/uz',locale:'uz',open:false,dragging:false}
  let api:ReturnType<typeof useAssistantGreeting>
  function Harness() { api=useAssistantGreeting(props);return createElement('output',{},api.teaser ?? '') }
  const container=window.document.getElementById('root')!
  let root=createRoot(container)
  const render=async(next:Partial<typeof props>={})=>{props={...props,...next};await act(async()=>{root.render(createElement(Harness))})}
  const tick=async(ms:number)=>{await act(async()=>{now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.callback()}})}
  const visible=()=>container.textContent
  const visibility=async(value:boolean)=>{await act(async()=>{hidden=value;window.document.dispatchEvent(new window.Event('visibilitychange'))})}
  const dismiss=async()=>{await act(async()=>{api!.dismiss()})}
  try {
    // Existing visitors may still have the obsolete whole-session mute flag.
    window.sessionStorage.setItem('murvatcha:closed','1')
    await render()
    await tick(GREETING_DELAY_MS-1)
    assert.equal(visible(),'')
    await tick(1)
    assert.equal(visible(),BOT_MESSAGES['/'].greeting.uz)
    assert.equal(window.sessionStorage.getItem(greetingSessionKey('/','uz')),'1')
    await dismiss()
    await visibility(true); await visibility(false); await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','dismissed greetings do not return after a visibility change')

    await render({pathname:'/uz/articles'})
    await tick(1000)
    await render({pathname:'/uz/hackathons'})
    await tick(GREETING_DELAY_MS-1)
    assert.equal(visible(),'','navigation cancels the old section timer')
    await tick(1)
    assert.equal(visible(),BOT_MESSAGES['/hackathons'].greeting.uz)
    await render({pathname:'/uz/projects'})
    assert.equal(visible(),'','never carry the previous section’s bubble onto another page')
    await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/projects'].greeting.uz)
    await render({pathname:'/uz/projects/example'})
    await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','details share the already-greeted section')

    await render({pathname:'/uz/articles'})
    await visibility(true); await tick(GREETING_DELAY_MS*2)
    assert.equal(visible(),'','background tabs do not consume the greeting')
    await visibility(false); await tick(GREETING_DELAY_MS-1); assert.equal(visible(),'')
    await tick(1); assert.equal(visible(),BOT_MESSAGES['/articles'].greeting.uz)
    await render({pathname:'/en/articles',locale:'en'})
    assert.equal(visible(),'')
    await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/articles'].greeting.en)

    await render({pathname:'/uz/quiz',locale:'uz',open:true})
    await tick(GREETING_DELAY_MS); assert.equal(visible(),'')
    await render({open:false}); await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','manual chat opening counts as greeting this section')
    await render({pathname:'/uz/media',dragging:true})
    await tick(GREETING_DELAY_MS); assert.equal(visible(),'')
    await render({dragging:false}); await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/media'].greeting.uz)
    await render({dragging:true}); assert.equal(visible(),'')
    await render({dragging:false}); assert.equal(visible(),BOT_MESSAGES['/media'].greeting.uz)
    await dismiss()

    await act(async()=>{root.unmount()});root=createRoot(container)
    await render();await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','session deduplication survives remounts')
    await render({pathname:'/uz/partners'});await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/partners'].greeting.uz,'closing other sections never mutes a new section')
    await render({pathname:'/uz/avatar-preview'});await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','preview pages stay quiet')

    Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get(){throw new Error('Storage blocked')}})
    await render({pathname:'/uz/contact'});await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/contact'].greeting.uz,'blocked storage still permits a welcome')
    await dismiss();await render({pathname:'/uz/feedback'});await tick(GREETING_DELAY_MS)
    assert.equal(visible(),BOT_MESSAGES['/feedback'].greeting.uz)
    await render({pathname:'/uz/contact'});await tick(GREETING_DELAY_MS)
    assert.equal(visible(),'','in-memory deduplication works without storage')
  } finally {
    await act(async()=>{root.unmount()})
    assert.equal(timers.size,0,'unmount cleans pending greeting timers')
    for(const [name,descriptor] of descriptors)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else Reflect.deleteProperty(globalThis,name)
    window.close()
  }
})
