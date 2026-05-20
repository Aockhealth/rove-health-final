"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import {
  EVIDENCE_LABELS,
  INGREDIENT_GLOSSARY,
  PRODUCT_LABELS,
  searchGlossaryEntries,
  type EvidenceLevel,
  type IngredientEntry,
  type ProductHandle,
} from "@/data/commerce";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  ...Array.from(new Set(INGREDIENT_GLOSSARY.map((entry) => entry.category))).sort(),
] as Array<IngredientEntry["category"] | "All">;
const products = ["All", "hormone-balance", "cycle-sync-rise", "cycle-sync-restore"] as Array<
  ProductHandle | "All"
>;
const evidenceLevels = ["All", "foundational", "emerging", "traditional"] as Array<
  EvidenceLevel | "All"
>;

export function GlossaryClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IngredientEntry["category"] | "All">("All");
  const [product, setProduct] = useState<ProductHandle | "All">("All");
  const [evidenceLevel, setEvidenceLevel] = useState<EvidenceLevel | "All">("All");

  const entries = useMemo(
    () => searchGlossaryEntries(query, { category, product, evidenceLevel }),
    [category, evidenceLevel, product, query]
  );

  return (
    <div>
      <section className="bg-white-bone px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-rove-stone">
            Ingredient glossary
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <h1 className="font-serif text-5xl leading-[0.98] text-rove-charcoal sm:text-6xl">
              Read the label before you buy.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-rove-stone">
              Every ingredient across Balance, Rise, and Restore is listed with its formula role,
              dose, evidence label, and safety note. This is transparency, not medical advice.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-y border-rove-stone/10 bg-paper/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rove-stone" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search iron, magnesium, chasteberry..."
              className="h-11 w-full rounded-lg border border-rove-stone/20 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-rove-charcoal"
            />
          </label>

          <FilterSelect
            label="Product"
            value={product}
            onChange={(value) => setProduct(value as ProductHandle | "All")}
            options={products.map((item) => ({
              value: item,
              label: item === "All" ? "All products" : PRODUCT_LABELS[item],
            }))}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(value) => setCategory(value as IngredientEntry["category"] | "All")}
            options={categories.map((item) => ({ value: item, label: item }))}
          />
          <FilterSelect
            label="Evidence"
            value={evidenceLevel}
            onChange={(value) => setEvidenceLevel(value as EvidenceLevel | "All")}
            options={evidenceLevels.map((item) => ({
              value: item,
              label: item === "All" ? "All evidence" : EVIDENCE_LABELS[item],
            }))}
          />
        </div>
      </section>

      <section className="bg-paper px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-rove-stone">
              {entries.length} ingredient{entries.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <article
                key={entry.slug}
                className="rounded-lg border border-rove-stone/15 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-rove-cream px-3 py-1 text-xs font-bold text-rove-charcoal">
                    {entry.category}
                  </span>
                  <span className="rounded-full bg-phase-follicular/10 px-3 py-1 text-xs font-bold text-phase-follicular">
                    {EVIDENCE_LABELS[entry.evidenceLevel]}
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-3xl leading-tight text-rove-charcoal">
                  {entry.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-rove-stone">{entry.role}</p>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-rove-stone">
                    Found in
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.foundIn.map((handle) => (
                      <span
                        key={handle}
                        className="rounded-full border border-rove-stone/20 px-3 py-1 text-xs font-semibold text-rove-charcoal"
                      >
                        {PRODUCT_LABELS[handle]}: {entry.dosages[handle]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-rove-cream/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-rove-stone">
                    Evidence note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-rove-charcoal">{entry.evidenceNote}</p>
                </div>

                <div className="mt-4 flex gap-3 rounded-lg border border-phase-menstrual/15 bg-phase-menstrual/5 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-phase-menstrual" />
                  <p className="text-sm leading-6 text-rove-charcoal">{entry.safetyNote}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.sourceLinks.map((source) => (
                    <a
                      key={`${entry.slug}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-rove-stone underline-offset-4 hover:text-rove-charcoal hover:underline"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="rounded-lg border border-rove-stone/15 bg-white p-10 text-center">
              <h2 className="font-serif text-3xl text-rove-charcoal">No ingredient found</h2>
              <p className="mt-2 text-sm text-rove-stone">
                Try clearing a filter or searching for a broader term.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white-bone px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-rove-stone/15 bg-white p-5 text-sm leading-6 text-rove-stone">
          This glossary is educational and does not replace medical advice. Ingredient needs and
          safety can change with pregnancy, breastfeeding, health conditions, lab values, and
          medication use.
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-11 w-full rounded-lg border border-rove-stone/20 bg-white px-4 text-sm font-semibold text-rove-charcoal outline-none transition focus:border-rove-charcoal",
          "lg:w-48"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
