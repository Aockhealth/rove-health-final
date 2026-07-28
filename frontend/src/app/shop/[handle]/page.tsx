import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, FlaskConical } from "lucide-react";
import { getLocalProduct, LAUNCHED_PRODUCTS } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfoTabs } from "@/components/shop/ProductInfoTabs";

export function generateStaticParams() {
  return LAUNCHED_PRODUCTS.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = getLocalProduct(handle);
  if (!product) return {};
  return {
    title: `${product.title} | Rove Health`,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = getLocalProduct(handle);
  if (!product || !product.launched) notFound();

  const otherProducts = LAUNCHED_PRODUCTS.filter((p) => p.handle !== product.handle);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery image={product.image} alt={product.title} />

        <div>
          <Badge variant={product.phaseVariant}>{product.phaseLabel}</Badge>
          <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-tight text-obsidian">
            {product.title}
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-obsidian/70">{product.tagline}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {product.benefits.map((benefit) => (
              <li
                key={benefit}
                className="inline-flex items-center gap-1.5 rounded-full bg-taupe-light px-3 py-1.5 font-sans text-xs font-medium text-obsidian/80"
              >
                <Check className="h-3 w-3 text-obsidian/50" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-3 rounded-[16px] border border-obsidian/10 bg-white p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taupe-light text-obsidian">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-obsidian/50">
                {product.scienceHighlight.title}
              </p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-obsidian/75">
                {product.scienceHighlight.detail}
              </p>
            </div>
          </div>

          <p className="mt-5 font-sans text-sm leading-relaxed text-obsidian/70">
            <span className="font-semibold text-obsidian">Who it&apos;s for: </span>
            {product.whoItsFor}
          </p>

          <p className="mt-6 font-sans text-2xl font-semibold text-obsidian">₹{product.price}</p>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

        </div>
      </div>

      <ProductInfoTabs product={product} />

      {/* FAQ */}
      <div className="mt-20 max-w-2xl">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-obsidian">
          Questions about {product.title.replace("Cycle Sync ", "")}.
        </h2>
        <div className="mt-6">
          <Accordion items={product.faqs} defaultOpenIndex={null} />
        </div>
      </div>

      {/* Cross-sell */}
      {otherProducts.length > 0 && (
      <div className="mt-20 border-t border-obsidian/10 pt-14">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-obsidian">
          Complete your system.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {otherProducts.map((p) => (
            <Link
              key={p.handle}
              href={`/shop/${p.handle}`}
              className="group flex items-center gap-4 rounded-[20px] border border-obsidian/8 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px]">
                <Image src={p.image} alt={p.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <Badge variant={p.phaseVariant}>{p.phaseLabel}</Badge>
                <h3 className="mt-2 font-sans text-base font-semibold tracking-tight text-obsidian">
                  {p.title}
                </h3>
                <p className="mt-1 font-sans text-sm text-obsidian/60">₹{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
