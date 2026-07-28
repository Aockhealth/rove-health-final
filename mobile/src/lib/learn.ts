import { supabase } from './supabase';

export type LearnArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  md_file_path: string;
  image_path: string;
  read_time: string | null;
  author: string | null;
  published_date: string | null;
  is_published: boolean;
};

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function getStorageUrl(bucket: string, path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export function cleanTitle(title: string) {
  if (!title) return '';
  return title.replace(/^[A-Za-z][.\s-]*\d+[.\s-]*\s*/, '').replace(/\.[^/.]+$/, '').trim();
}

export async function fetchLearnArticles(): Promise<LearnArticle[]> {
  const { data, error } = await supabase
    .from('learn_articles')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching learn articles:', error);
    return [];
  }
  return (data as LearnArticle[]) || [];
}

export async function fetchArticleById(id: string): Promise<LearnArticle | null> {
  if (!id || !isUUID(id)) return null;

  const { data, error } = await supabase
    .from('learn_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }
  return data as LearnArticle;
}

export async function fetchArticleMarkdown(mdPath: string): Promise<string> {
  const url = getStorageUrl('learn-md', mdPath);
  if (!url) return '';

  try {
    const res = await fetch(url);
    if (!res.ok) return '_Error loading article content._';
    let text = await res.text();
    text = text.trimStart().replace(/^#\s+[^\n]+(\r?\n)*/, '');
    return text;
  } catch (error) {
    console.error('Failed to fetch markdown:', error);
    return '_Error loading article content._';
  }
}
