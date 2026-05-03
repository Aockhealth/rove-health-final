import Link from "next/link";
import Image from "next/image";
import { getStorageUrl } from "@/lib/utils";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";

interface ArticleCardProps {
    article: LearnArticle;
    cleanTitle: (title: string) => string;
}

export default function ArticleCard({ article, cleanTitle }: ArticleCardProps) {
    const imageUrl = getStorageUrl("learn-images", article.image_path);

    return (
        <Link href={`/cycle-sync/learn/${article.id}`}>
            <div className="min-w-[200px] w-[200px] md:min-w-[260px] md:w-[260px] cursor-pointer group/card relative snap-start">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm mb-3 bg-neutral-100 transition-all duration-300 group-hover/card:shadow-lg group-hover/card:shadow-black/8 group-hover/card:scale-[1.03]">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={cleanTitle(article.title)}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                            sizes="(max-width: 768px) 200px, 260px"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400">
                            No Image
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 transition-opacity duration-300 group-hover/card:opacity-95" />

                    {/* Read time badge */}
                    {article.read_time && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                            {article.read_time}
                        </span>
                    )}

                    {/* Card content */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1 block">
                            {article.category}
                        </span>
                        <h4 className="font-bold leading-tight text-sm line-clamp-2 drop-shadow-md">
                            {cleanTitle(article.title)}
                        </h4>
                    </div>
                </div>
            </div>
        </Link>
    );
}
