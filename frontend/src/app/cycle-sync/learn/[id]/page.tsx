import { fetchArticleById } from "@backend/actions/cycle-sync/learn/learn-actions";
import { getStorageUrl } from "@/lib/utils";
import { ChevronLeft, Calendar, Clock, User, Share2, Bookmark, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

// ✅ Correct Type for Next.js 15+
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePage({ params }: Props) {
  // 1. Resolve Params
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id || id === "undefined") return notFound();

  // 2. Fetch Metadata from DB
  const article = await fetchArticleById(id);
  if (!article) return notFound();

  // 3. Construct URLs
  const imageUrl = getStorageUrl("learn-images", article.image_path);
  const markdownUrl = getStorageUrl("learn-md", article.md_file_path);

  // 4. Fetch the Markdown Content
  let markdownContent = "";
  if (markdownUrl) {
    try {
      const res = await fetch(markdownUrl);
      if (res.ok) {
        markdownContent = await res.text();
      } else {
        markdownContent = `_Error loading content: ${res.statusText}_`;
      }
    } catch (error) {
      console.error("Failed to fetch markdown:", error);
      markdownContent = "_Error loading article content._";
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[50vh] w-full bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized // Bypass Next.js proxy to avoid timeouts/500s
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400">
            <span className="text-sm font-medium">No Cover Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />

        {/* Navbar */}
        <div className="absolute top-0 left-0 p-6 z-10">
          <Link
            href="/cycle-sync/learn"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 -mt-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden">

          {/* Metadata Pills */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-6 font-medium">
            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold">
              {article.category}
            </span>
            {article.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {article.read_time}
              </span>
            )}
            {article.published_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.published_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-heading text-neutral-900 mb-6 leading-tight break-words">
            {article.title}
          </h1>

          {/* Author */}
          {article.author && (
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-neutral-100">
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">Written by</p>
                <p className="text-sm text-neutral-500">{article.author}</p>
              </div>
            </div>
          )}

          {/* Excerpt */}
          <p className="font-medium text-xl text-neutral-500 italic mb-8 border-l-4 border-rose-200 pl-4">
            {article.excerpt}
          </p>

          <hr className="my-8" />

          {/* ✅ RENDERED MARKDOWN CONTENT */}
          <article className="prose prose-lg prose-rose max-w-none prose-headings:font-heading prose-img:rounded-xl text-neutral-700">
            <ReactMarkdown
              components={{
                // 1. FIX IMAGE ERROR: Check for src before rendering
                img: ({ src, alt }) => {
                  if (!src) return null; // Stop empty src error
                  return (
                    <img
                      src={src}
                      alt={alt || "Article Image"}
                      className="rounded-xl w-full h-auto my-4"
                      loading="lazy"
                    />
                  );
                },
                // 2. FIX OVERFLOW: Force links to break
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-rose-600 break-all hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                // 3. FIX OVERFLOW: Ensure paragraph text breaks properly
                p: ({ children }) => (
                  <p className="mb-4 break-words">
                    {children}
                  </p>
                )
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </article>

        </div>
      </div>
    </div>
  );
}