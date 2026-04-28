import { fetchArticleById } from "@backend/actions/cycle-sync/learn/learn-actions";
import { getStorageUrl } from "@/lib/utils";
import { ChevronLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArticleTracker } from "./ArticleTracker";
type Props = {
  params: Promise<{ id: string }>;
};

const cleanTitle = (title: string) => {
    if (!title) return "";
    return title.replace(/^[A-Za-z][.\s-]*\d+[.\s-]*\s*/, "").replace(/\.[^/.]+$/, "").trim();
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
        // Remove the very first Markdown H1 heading to avoid duplicating the page title
        markdownContent = markdownContent.trimStart().replace(/^#\s+[^\n]+(\r?\n)*/, "");
      } else {
        markdownContent = `_Error loading content: ${res.statusText}_`;
      }
    } catch (error) {
      console.error("Failed to fetch markdown:", error);
      markdownContent = "_Error loading article content._";
    }
  }

  return (
    <div className="min-h-screen bg-rove-cream pb-20">
      <ArticleTracker articleId={id} articleTitle={cleanTitle(article.title)} category={article.category} />
      {/* --- HERO SECTION --- */}
      <div className="relative h-[45vh] w-full bg-rove-stone/20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cleanTitle(article.title)}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized // Bypass Next.js proxy to avoid timeouts/500s
          />
        ) : (
          <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400">
            <span className="text-sm font-medium">No Cover Image</span>
          </div>
        )}
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-rove-cream via-rove-charcoal/20 to-black/40" />

        {/* Navbar */}
        <div className="absolute top-0 left-0 p-6 z-10 w-full pt-safe-nav">
          <Link
            href="/cycle-sync/learn"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium hover:bg-white/30 transition-all text-sm shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </Link>
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 -mt-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[2.5rem] shadow-sm p-6 sm:p-10 md:p-14 overflow-hidden">

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-rove-stone mb-8 font-medium">
            <span className="bg-phase-ovulatory/10 text-phase-ovulatory px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-bold">
              {article.category}
            </span>
            {article.read_time && (
              <span className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full text-xs">
                <Clock className="w-3.5 h-3.5" /> {article.read_time}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-heading font-semibold text-rove-charcoal mb-6 leading-[1.15] tracking-tight text-balance">
            {cleanTitle(article.title)}
          </h1>

          {/* Medical Reviewers */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-rove-stone uppercase tracking-widest mb-0.5">
                Verified & Reviewed By
              </p>
              <p className="text-sm font-medium text-rove-charcoal leading-snug">
                Dr. Aditya Oswal, Dr. Chaitanya Kalra and Dr. Harshita Pathak
              </p>
            </div>
          </div>

          {/* ✅ HIGHLY STYLED MARKDOWN CONTENT */}
          <article className="w-full max-w-none pb-12">
            <ReactMarkdown
              components={{
                // Headings
                h1: ({ children }) => <h1 className="text-3xl md:text-4xl font-heading font-semibold text-rove-charcoal mt-12 mb-6 tracking-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal mt-10 mb-5 tracking-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl md:text-2xl font-heading font-medium text-rove-charcoal mt-8 mb-4">{children}</h3>,
                h4: ({ children }) => <h4 className="text-lg font-bold text-rove-charcoal uppercase tracking-wide mt-8 mb-3">{children}</h4>,

                // Paragraphs
                p: ({ children }) => (
                  <p className="text-base md:text-[17px] text-rove-charcoal/80 leading-[1.8] mb-6 tracking-wide break-words">
                    {children}
                  </p>
                ),

                // Lists
                ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-8 space-y-3 text-base md:text-[17px] text-rove-charcoal/80 leading-[1.8]">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-8 space-y-3 text-base md:text-[17px] text-rove-charcoal/80 leading-[1.8]">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,

                // Quotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-phase-ovulatory bg-phase-ovulatory/5 px-6 py-4 my-8 rounded-r-2xl text-rove-charcoal/90 italic font-medium">
                    {children}
                  </blockquote>
                ),

                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-phase-menstrual font-medium underline underline-offset-4 decoration-phase-menstrual/30 hover:decoration-phase-menstrual transition-all break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),

                // Inline bold/strong
                strong: ({ children }) => <strong className="font-semibold text-rove-charcoal">{children}</strong>,

                // Images
                img: ({ src, alt }) => {
                  if (!src) return null;
                  return (
                    <span className="block my-10 overflow-hidden rounded-2xl shadow-sm border border-stone-100">
                      <img
                        src={src}
                        alt={alt || "Article Image"}
                        className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                      />
                      {alt && <span className="block text-center text-xs text-rove-stone mt-3 pb-3 italic">{alt}</span>}
                    </span>
                  );
                },

                // Code Blocks & Inline Code (optional but good for technical content)
                code: ({ children }) => <code className="bg-stone-100 text-rove-charcoal px-1.5 py-0.5 rounded text-sm font-mono break-words">{children}</code>,
                pre: ({ children }) => <pre className="bg-stone-50 border border-stone-100 p-4 rounded-xl overflow-x-auto mb-6 text-sm font-mono">{children}</pre>,

                // Dividers
                hr: () => <hr className="my-10 border-stone-200" />
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