import { createClient } from './server'

export async function getCategories(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name_uz')
  return data || []
}

export async function getArticles(locale: string, categorySlug?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('articles')
    .select('*, categories!inner(*)')
    .order('published_date', { ascending: false })

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data } = await query
  return data || []
}

export async function getArticleBySlug(slug: string, locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('*, categories(*), authors(*)')
    .eq('slug', slug)
    .single()
  return data
}

export async function getHackathons(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*, media(*)')
    .order('date_range_start', { ascending: false })
  return data || []
}

export async function getHackathonBySlug(slug: string, locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getTeamMembers(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_members')
    .select('*')
  return data || []
}

export async function getPartners() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partners')
    .select('*')
  return data || []
}

export async function getProjects(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_projects')
    .select('*, categories(*)')
  return data || []
}

export async function getProjectBySlug(slug: string, locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_projects')
    .select('*, categories(*), hackathons(*)')
    .eq('slug', slug)
    .single()
  return data
}

export async function getMentors(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mentors')
    .select('*')
  return data || []
}

export async function getMentorBySlug(slug: string, locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mentors')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getGlossaryTerms() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('glossary_terms')
    .select('*')
  return data || []
}

export async function getMedia(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return data || []
}

export async function getStats() {
  const supabase = await createClient()
  const [articles, hackathons, projects, mentors] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('hackathons').select('id', { count: 'exact', head: true }),
    supabase.from('student_projects').select('id', { count: 'exact', head: true }),
    supabase.from('mentors').select('id', { count: 'exact', head: true }),
  ])
  return {
    articles: articles.count || 0,
    hackathons: hackathons.count || 0,
    projects: projects.count || 0,
    mentors: mentors.count || 0,
  }
}

export async function getSiteSettings(locale: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .single()
  return data
}

export async function getCategoriesList() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name_uz')
  return data || []
}
