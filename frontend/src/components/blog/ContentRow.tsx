import { ArrowRight } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import type { BlogPostMeta } from "@/lib/blog";

export function ContentRow({ title, posts }: { title: string; posts: BlogPostMeta[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mb-10 pl-6 md:pl-10">
      <h3 className="group flex cursor-default items-center gap-2 font-sans text-lg font-semibold text-obsidian md:text-xl">
        {title}
        <span className="font-sans text-xs font-medium text-obsidian/45">
          · {posts.length} {posts.length === 1 ? "article" : "articles"}
        </span>
        <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </h3>
      <div className="mb-4 mt-2 h-px w-12 rounded-full bg-obsidian/10" />
      <div className="no-scrollbar -ml-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-6 pb-4 pl-6 pr-6 md:-ml-10 md:pl-10">
        {posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
