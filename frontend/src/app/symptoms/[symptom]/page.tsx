import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocalProduct } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/shop/ProductGallery";
import dynamic from "next/dynamic";
import { ProductInfoTabs } from "@/components/shop/ProductInfoTabs";

const AddToCartButton = dynamic(() => import("@/components/shop/AddToCartButton").then((mod) => mod.AddToCartButton));

const SYMPTOM_MAP: Record<string, { title: string; description: string; keyword: string }> = {
  pcos: {
    title: "Manage PCOS Naturally",
    description: "Cycle Syncing and phase-aware supplementation to help balance hormones and manage PCOS symptoms.",
    keyword: "PCOS",
  },
  pms: {
    title: "Relieve PMS Symptoms",
    description: "Discover a doctor-formulated approach to reducing PMS severity through targeted cycle-syncing.",
    keyword: "PMS",
  },
  "irregular-cycle": {
    title: "Fix Irregular Cycles",
    description: "Regulate your cycle naturally with the clinical 40:1 ratio designed for unpredictable rhythms.",
    keyword: "Irregular Cycles",
  },
};

export function generateStaticParams() {
  return Object.keys(SYMPTOM_MAP).map((symptom) => ({ symptom }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symptom: string }>;
}): Promise<Metadata> {
  const { symptom } = await params;
  const data = SYMPTOM_MAP[symptom];
  if (!data) return {};

  return {
    title: `${data.title} | Rove Health`,
    description: data.description,
  };
}

export default async function SymptomLandingPage({ params }: { params: Promise<{ symptom: string }> }) {
  const { symptom } = await params;
  const data = SYMPTOM_MAP[symptom];
  if (!data) notFound();

  // Recommend Balance product for these symptoms
  const product = getLocalProduct("balance");
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-16 text-center">
        <h1 className="font-serif text-5xl font-medium tracking-tight text-obsidian md:text-6xl">
          {data.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-obsidian/80">
          {data.description} Our doctor-formulated <strong>Balance</strong> supplement is explicitly designed to support women struggling with {data.keyword}.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery image={product.image} alt={product.title} gallery={product.gallery} />

        <div>
          <Badge variant={product.phaseVariant}>{product.phaseLabel}</Badge>
          <h2 className="mt-4 font-sans text-4xl font-semibold leading-tight tracking-tight text-obsidian">
            {product.title}
          </h2>
          <p className="mt-3 font-sans text-base leading-relaxed text-obsidian/70">{product.tagline}</p>

          <div className="mt-8 border-t border-obsidian/10 pt-8">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-12">
            <ProductInfoTabs product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
