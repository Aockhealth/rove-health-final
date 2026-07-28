import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  readTime: string;
  author: string;
  publishedDate: string;
  image: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function readSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllPosts(): BlogPostMeta[] {
  return readSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf-8");
      const { data } = matter(raw);
      return { slug, ...(data as Omit<BlogPostMeta, "slug">) };
    })
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, content, ...(data as Omit<BlogPostMeta, "slug">) };
}

export function getPostsByCategory(): Array<{ category: string; categorySlug: string; posts: BlogPostMeta[] }> {
  const posts = getAllPosts();
  const map = new Map<string, { category: string; categorySlug: string; posts: BlogPostMeta[] }>();
  for (const post of posts) {
    if (!map.has(post.categorySlug)) {
      map.set(post.categorySlug, { category: post.category, categorySlug: post.categorySlug, posts: [] });
    }
    map.get(post.categorySlug)!.posts.push(post);
  }
  return Array.from(map.values());
}
