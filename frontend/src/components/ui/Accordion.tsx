"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  question: string;
  answer: ReactNode;
}

export function Accordion({
  items,
  defaultOpenIndex = 0,
  variant = "default",
}: {
  items: AccordionItemData[];
  defaultOpenIndex?: number | null;
  variant?: "default" | "editorial";
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const isEditorial = variant === "editorial";

  return (
    <div className={cn("divide-y", isEditorial ? "divide-obsidian/12" : "divide-obsidian/20")}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "font-sans tracking-tight text-obsidian",
                  isEditorial ? "text-base font-medium" : "text-xl font-semibold"
                )}
              >
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-obsidian transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div
                className={cn(
                  "mt-3 font-sans leading-relaxed animate-fade-in",
                  isEditorial ? "text-sm text-obsidian/70" : "text-sm text-obsidian/80"
                )}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
