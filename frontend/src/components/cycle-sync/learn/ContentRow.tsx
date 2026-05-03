import { ArrowRight } from "lucide-react";
import ArticleCard from "./ArticleCard";
import type { LearnArticle } from "@backend/actions/cycle-sync/learn/learn-actions";

interface ContentRowProps {
    title: string;
    articles: LearnArticle[];
    cleanTitle: (title: string) => string;
}

export default function ContentRow({ title, articles, cleanTitle }: ContentRowProps) {
    if (!articles || articles.length === 0) return null;

    return (
        <div className="mb-10 pl-4 md:pl-8">
            <h3 className="text-lg md:text-xl font-heading text-rove-charcoal mb-1 flex items-center gap-2 group cursor-pointer hover:text-black transition-colors">
                {title}
                <span className="text-xs font-sans font-medium text-rove-stone">
                    · {articles.length} {articles.length === 1 ? "article" : "articles"}
                </span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
            </h3>
            <div className="w-12 h-[2px] bg-rove-charcoal/10 rounded-full mb-4" />
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -ml-4 pl-4 md:pl-8 pr-4 mask-fade-right snap-x snap-mandatory scroll-pl-4">
                {articles.map((article) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        cleanTitle={cleanTitle}
                    />
                ))}
            </div>
        </div>
    );
}
