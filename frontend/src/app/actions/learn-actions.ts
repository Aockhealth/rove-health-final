"use server";

import { createClient } from "@/utils/supabase/server";

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

// Helper to check if string is UUID
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function fetchLearnArticles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learn_articles")
    .select("*")
    .eq("is_published", true)
    .order("published_date", { ascending: false });

  if (error) {
    console.error("Error fetching learn articles:", error);
    return [];
  }

  return data as LearnArticle[];
}

export async function fetchArticleById(id: string) {
  // ✅ FIX: Prevent crashing if ID is invalid/undefined
  if (!id || !isUUID(id)) {
    console.warn(`Invalid Article ID provided: ${id}`);
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learn_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }

  return data as LearnArticle;
}