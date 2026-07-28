import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LAUNCHED_PRODUCTS } from "@/data/products";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Shop | Rove Health",
  description:
    "Cycle Sync Balance: doctor-formulated support for cycles that don't follow a predictable rhythm.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-obsidian/50">
          The Cycle Sync System
        </span>
        <h1 className="mt-3 font-sans text-4xl font-semibold leading-tight tracking-tight text-obsidian md:text-5xl">
          Every cycle, fully supported.
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-obsidian/70">
          Balance brings structure back to cycles that don&apos;t follow a predictable rhythm.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {LAUNCHED_PRODUCTS.map((product) => (
          <Link
            key={product.handle}
            href={`/shop/${product.handle}`}
            className="group block overflow-hidden rounded-[20px] bg-white border border-obsidian/8 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <Badge variant={product.phaseVariant}>{product.phaseLabel}</Badge>
              <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-obsidian">
                {product.title}
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-obsidian/70">
                {product.tagline}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {product.benefits.slice(0, 2).map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-full bg-taupe-light px-2.5 py-1 font-sans text-[11px] font-medium text-obsidian/70"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-sans text-sm font-semibold text-obsidian">₹{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
