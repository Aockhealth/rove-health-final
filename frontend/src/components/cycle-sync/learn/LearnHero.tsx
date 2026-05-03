"use client";

import { motion } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getStorageUrl } from "@/lib/utils";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";

interface LearnHeroProps {
    article: LearnArticle;
    cleanTitle: (title: string) => string;
}

export default function LearnHero({ article, cleanTitle }: LearnHeroProps) {
    const imageUrl = getStorageUrl("learn-images", article.image_path);

    return (
        <div className="relative h-[70vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-neutral-900">
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={cleanTitle(article.title)}
                        fill
                        className="object-cover opacity-80"
                        priority
                        sizes="100vw"
                        unoptimized
                    />
                )}
                <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-gradient-to-br from-stone-900 to-black" />
            </div>

            {/* Clean single gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />

            <div className="absolute bottom-0 left-0 p-8 md:p-16 pb-12 w-full md:w-2/3 lg:w-1/2 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-rove-charcoal text-white rounded-md text-[9px] font-bold uppercase tracking-[0.2em]"
                >
                    Featured Series
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-6xl font-heading text-rove-charcoal leading-[0.9] text-balance"
                >
                    {cleanTitle(article.title)}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-rove-charcoal/80 text-sm md:text-base font-medium line-clamp-3 md:line-clamp-none max-w-lg"
                >
                    {article.excerpt}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 pt-4"
                >
                    <Link href={`/cycle-sync/learn/${article.id}`}>
                        <button className="flex items-center gap-2 px-8 py-3 bg-rove-charcoal text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
                            <Play className="w-5 h-5 fill-white" /> Read Now
                        </button>
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 bg-rove-charcoal/5 border border-rove-charcoal/10 text-rove-charcoal rounded-xl font-bold hover:bg-rove-charcoal/10 transition-all active:scale-95">
                        <Bookmark className="w-5 h-5" /> Save
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
