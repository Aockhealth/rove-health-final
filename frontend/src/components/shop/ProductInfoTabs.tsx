"use client";

import { useState } from "react";
import {
  Activity,
  Building2,
  ChevronDown,
  Droplet,
  FileSearch,
  FlaskConical,
  Flower2,
  Leaf,
  Moon,
  Pill,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormulationItem, LocalProduct } from "@/data/products";

const TABS = ["Description", "Ingredients", "How to Use", "Our Standards"] as const;

const DOT: Record<string, string> = {
  menstrual: "bg-phase-menstrual",
  follicular: "bg-phase-follicular",
  ovulatory: "bg-phase-ovulatory",
  luteal: "bg-phase-luteal",
  balance: "bg-rove-gold",
};

const ICON_KEYWORDS: Array<[string, typeof Sparkles]> = [
  ["iron", Droplet],
  ["ferrous", Droplet],
  ["shatavari", Leaf],
  ["magnesium", Zap],
  ["astaxanthin", Sun],
  ["vitex", Flower2],
  ["ashwagandha", Moon],
  ["dim", FlaskConical],
  ["inositol", Activity],
  ["berberine", Leaf],
  ["chromium", Zap],
];

function iconFor(name: string) {
  const lower = name.toLowerCase();
  const match = ICON_KEYWORDS.find(([keyword]) => lower.includes(keyword));
  return match ? match[1] : Sparkles;
}

function findFormulationDetail(
  formulation: FormulationItem[],
  shortName: string
): FormulationItem | undefined {
  const keyword = shortName.split(" ")[0].toLowerCase();
  return formulation.find((item) => item.nutrient.toLowerCase().includes(keyword));
}

const STANDARDS = [
  { icon: FlaskConical, label: "Third-Party Tested" },
  { icon: Building2, label: "Made in GMP-Approved Facility" },
  { icon: FileSearch, label: "Research-Backed Doses" },
  { icon: Pill, label: "Bioavailable Formats" },
];

export function ProductInfoTabs({ product }: { product: LocalProduct }) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Description");
  const [showFullFormulation, setShowFullFormulation] = useState(false);
  const dotClass = DOT[product.phaseVariant];

  const keyIngredients = product.ingredients
    .map((name) => ({ name, detail: findFormulationDetail(product.formulation, name) }))
    .filter((item): item is { name: string; detail: FormulationItem } => Boolean(item.detail));

  return (
    <div className="mt-16">
      <div className="flex flex-wrap gap-2 border-b border-obsidian/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={cn(
              "-mb-px border-b-2 px-1 py-3 font-sans text-sm font-semibold transition-colors sm:px-2",
              active === tab
                ? "border-obsidian text-obsidian"
                : "border-transparent text-obsidian/45 hover:text-obsidian/70"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active === "Description" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/45">
                The biology
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/75">
                {product.description}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/45">
                The goal
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/75">{product.goal}</p>
            </div>
          </div>
        )}

        {active === "Ingredients" && (
          <div>
            {keyIngredients.length > 0 && (
              <div className="mb-12">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/45">
                  Key ingredients
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {keyIngredients.map(({ name, detail }) => {
                    const Icon = iconFor(name);
                    return (
                      <div
                        key={name}
                        className="flex gap-4 rounded-[16px] border border-obsidian/8 bg-white p-5 shadow-sm"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-taupe-light text-obsidian">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                            <span className="font-sans text-sm font-semibold text-obsidian">
                              {detail.nutrient}
                            </span>
                            <span className="shrink-0 rounded-full bg-taupe-light px-2 py-0.5 font-sans text-[11px] font-medium text-obsidian/60">
                              {detail.dose}
                            </span>
                          </div>
                          <p className="mt-1.5 font-sans text-xs leading-relaxed text-obsidian/65">
                            {detail.why}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowFullFormulation((v) => !v)}
              className="flex w-full items-center justify-between gap-4 border-t border-obsidian/10 py-4 text-left"
              aria-expanded={showFullFormulation}
            >
              <span className="font-sans text-sm font-semibold text-obsidian">
                Full formulation
                <span className="ml-2 font-normal text-obsidian/45">
                  ({product.formulation.length} ingredients)
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-obsidian transition-transform",
                  showFullFormulation && "rotate-180"
                )}
              />
            </button>

            {showFullFormulation && (
              <div className="mt-2 grid animate-fade-in gap-3 border-t border-obsidian/10 pt-6 sm:grid-cols-2">
                {product.formulation.map((item) => (
                  <div
                    key={item.nutrient}
                    className="flex gap-3 rounded-[14px] bg-taupe-light/40 p-4"
                  >
                    <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="font-sans text-sm font-semibold text-obsidian">
                          {item.nutrient}
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-sans text-[11px] font-medium text-obsidian/55">
                          {item.dose}
                        </span>
                      </div>
                      <p className="mt-1.5 font-sans text-xs leading-relaxed text-obsidian/65">
                        {item.why}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "How to Use" && (
          <div className="max-w-2xl space-y-4">
            <p className="font-sans text-sm font-semibold text-obsidian">{product.dosage}</p>
            <p className="font-sans text-sm leading-relaxed text-obsidian/75">
              Take consistently for the full window above, alongside food, for the best absorption.
              If you miss a day, just pick back up, there&apos;s no need to double up the next dose.
            </p>
          </div>
        )}

        {active === "Our Standards" && (
          <div className="grid max-w-xl grid-cols-2 gap-x-8 gap-y-10">
            {STANDARDS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <Icon className="h-8 w-8 text-obsidian" strokeWidth={1.5} />
                <p className="mt-3 font-sans text-sm font-bold uppercase tracking-wide text-obsidian">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
