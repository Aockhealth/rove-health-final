import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog";

export function ArticleCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/library/${post.slug}`} className="group/card block shrink-0 snap-start">
      <div className="relative aspect-[4/5] w-[200px] overflow-hidden rounded-xl bg-taupe-light shadow-sm transition-all duration-300 group-hover/card:scale-[1.03] group-hover/card:shadow-lg md:w-[260px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          sizes="(max-width: 768px) 200px, 260px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-obsidian/15 to-transparent opacity-85 transition-opacity duration-300 group-hover/card:opacity-95" />

        {post.readTime && (
          <span className="absolute right-3 top-3 rounded-full border border-white-bone/10 bg-obsidian/40 px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-widest text-white-bone backdrop-blur-md">
            {post.readTime}
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white-bone">
          <span className="mb-1 block font-sans text-[9px] font-bold uppercase tracking-widest opacity-70">
            {post.category}
          </span>
          <h4 className="line-clamp-2 font-sans text-sm font-bold leading-tight drop-shadow-md">
            {post.title}
          </h4>
        </div>
      </div>
    </Link>
  );
}
