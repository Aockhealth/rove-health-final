import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { getAllPosts, getPostsByCategory } from "@/lib/blog";
import { ContentRow } from "@/components/blog/ContentRow";

export const metadata: Metadata = {
  title: "The Library | Rove Health",
  description: "Deep-dive into holistic science, Ayurvedic practices, and body literacy.",
};

export default function LibraryPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const categories = getPostsByCategory();

  return (
    <div>
      {featured && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-obsidian">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-black/30" />

          <div className="absolute bottom-0 left-0 w-full space-y-4 p-8 pb-12 md:w-2/3 md:p-16 lg:w-1/2">
            <span className="inline-flex items-center gap-2 rounded-md bg-obsidian px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white-bone">
              Featured Series
            </span>
            <h1 className="font-sans text-4xl font-semibold leading-[0.95] tracking-tight text-obsidian md:text-6xl">
              {featured.title}
            </h1>
            <p className="max-w-lg font-sans text-sm font-medium text-obsidian/80 md:text-base">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-3 pt-4">
              <Link
                href={`/library/${featured.slug}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-rove-red to-lavender-soft px-8 py-3 font-sans font-bold text-white-bone shadow-md transition-all hover:brightness-110 active:scale-95"
              >
                <Play className="h-5 w-5 fill-white-bone" /> Read Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="font-label text-xs font-semibold uppercase tracking-wide text-obsidian">
            The Library
          </span>
          <p className="mt-3 font-sans text-sm leading-relaxed text-obsidian/60">
            Deep-dive into holistic science, Ayurvedic practices, and body literacy, the same
            Library from the Cycle Sync app, reviewed by doctors.
          </p>
        </div>

        <div className="mt-12">
          {categories.map(({ category, categorySlug, posts: categoryPosts }) => (
            <ContentRow key={categorySlug} title={category} posts={categoryPosts} />
          ))}
        </div>
      </div>
    </div>
  );
}
