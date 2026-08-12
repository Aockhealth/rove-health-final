import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug, getPostsByCategory } from "@/lib/blog";
import { ContentRow } from "@/components/blog/ContentRow";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Rove Health`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getPostsByCategory()
    .find((c) => c.categorySlug === post.categorySlug)
    ?.posts.filter((p) => p.slug !== post.slug);

  return (
    <div className="bg-paper pb-20">
      <div className="relative h-[45vh] w-full bg-taupe-light">
        <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-obsidian/20 to-obsidian/40" />

        <div className="absolute left-0 top-0 w-full p-6 pb-6 pt-6">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-full bg-white-bone/20 px-4 py-2 font-sans text-sm font-medium text-white-bone shadow-sm backdrop-blur-md transition-all hover:bg-white-bone/30"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Library
          </Link>
        </div>
      </div>

      <div className="relative z-10 -mt-20 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] border border-obsidian/12 bg-white-bone/85 p-6 shadow-sm backdrop-blur-xl sm:p-10 md:p-14">
          <div className="mb-8 flex flex-wrap items-center gap-3 font-sans text-sm font-medium text-obsidian/70">
            <span className="rounded-full bg-taupe-light px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-obsidian/70">
              {post.category}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1.5 rounded-full bg-taupe-light/60 px-3 py-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" /> {post.readTime}
              </span>
            )}
          </div>

          <h1 className="mb-6 font-sans text-3xl font-semibold leading-[1.15] tracking-tight text-obsidian md:text-5xl">
            {post.title}
          </h1>

          <div className="mb-8 flex items-center gap-4 border-b border-obsidian/8 pb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-taupe-light">
              <User className="h-5 w-5 text-obsidian/65" />
            </div>
            <div>
              <p className="mb-0.5 font-sans text-xs font-bold uppercase tracking-widest text-obsidian/65">
                Verified &amp; Reviewed By
              </p>
              <p className="font-sans text-sm font-medium leading-snug text-obsidian">
                Dr. Aditya Oswal, Dr. Chaitanya Kalra and Dr. Harshita Pathak
              </p>
            </div>
          </div>

          <article className="w-full max-w-none pb-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-6 mt-12 font-sans text-3xl font-semibold tracking-tight text-obsidian md:text-4xl">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-5 mt-10 font-sans text-2xl font-semibold tracking-tight text-obsidian md:text-3xl">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-4 mt-8 font-serif text-xl italic font-medium text-obsidian md:text-2xl">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mb-3 mt-8 font-sans text-lg font-bold uppercase tracking-wide text-obsidian">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mb-6 break-words font-sans text-base leading-[1.8] tracking-wide text-obsidian/80 md:text-[17px]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-8 ml-5 list-outside list-disc space-y-3 font-sans text-base leading-[1.8] text-obsidian/80 md:text-[17px]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-8 ml-5 list-outside list-decimal space-y-3 font-sans text-base leading-[1.8] text-obsidian/80 md:text-[17px]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="my-8 rounded-r-2xl border-l-4 border-rove-lime-deep bg-rove-lime/12 px-6 py-4 font-medium italic text-obsidian/90">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-medium text-rove-plum underline decoration-rove-plum/35 underline-offset-4 transition-all hover:decoration-rove-plum"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold text-obsidian">{children}</strong>,
                img: ({ src, alt }) => {
                  if (!src || typeof src !== "string") return null;
                  return (
                    <span className="my-10 block overflow-hidden rounded-2xl border border-obsidian/8 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={alt || "Article image"}
                        className="h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                        loading="lazy"
                      />
                      {alt && (
                        <span className="mb-3 mt-3 block text-center font-sans text-xs italic text-obsidian/65">
                          {alt}
                        </span>
                      )}
                    </span>
                  );
                },
                code: ({ children }) => (
                  <code className="rounded bg-taupe-light px-1.5 py-0.5 font-mono text-sm text-obsidian">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mb-6 overflow-x-auto rounded-xl border border-obsidian/8 bg-taupe-light/40 p-4 font-mono text-sm">
                    {children}
                  </pre>
                ),
                hr: () => <hr className="my-10 border-obsidian/10" />,
              }}
            >
              {post.content}
            </ReactMarkdown>

            <div className="mt-14 rounded-[16px] border border-obsidian/10 bg-taupe-light/40 p-5">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/65">
                A note on medical advice
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/70">
                This article is for general education and is not a substitute for professional
                medical advice, diagnosis, or treatment. Always speak with a qualified doctor about
                your symptoms, and never start, stop, or change a medication or supplement based on
                what you read here.
              </p>
            </div>
          </article>
        </div>
      </div>

      {related && related.length > 0 && (
        <div className="mt-16">
          <ContentRow title={`More on ${post.category}`} posts={related} />
        </div>
      )}
    </div>
  );
}
