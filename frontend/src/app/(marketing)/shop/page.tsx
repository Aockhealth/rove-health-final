import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";
import { getCommerceProducts } from "@/lib/shopify/client";
import { LOCAL_PRODUCTS, getRecommendedProductHandles, type ProductHandle } from "@/data/commerce";
import { createClient } from "@/utils/supabase/server";
import { calculatePhase as calculatePhaseCanonical, type CycleSettings } from "@shared/cycle/phase";

export const metadata: Metadata = {
  title: "Cycle Sync Supplements for Women | Rove Health",
  description:
    "Shop Rove's phased cycle-sync supplement formulas — designed for Indian women. Hormone Balance, Cycle Sync Rise, and Cycle Sync Restore. Ashwagandha, Shatavari, Magnesium & more.",
  keywords: [
    "cycle sync supplements India",
    "women hormone supplements",
    "PCOS supplement India",
    "ashwagandha for women",
    "shatavari supplement",
    "magnesium for PMS",
    "hormone balance supplement India",
  ],
};

async function getShopPersonalization(): Promise<{
  phaseName: string | null;
  recommendedHandles: ProductHandle[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        phaseName: null,
        recommendedHandles: getRecommendedProductHandles(null, false),
      };
    }

    const [{ data: cycleSettings }, { data: onboarding }] = await Promise.all([
      supabase
        .from("user_cycle_settings")
        .select("last_period_start, cycle_length_days, period_length_days")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_onboarding")
        .select("metabolic_conditions")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const settings = cycleSettings
      ? ({
          last_period_start: cycleSettings.last_period_start,
          cycle_length_days: cycleSettings.cycle_length_days || 28,
          period_length_days: cycleSettings.period_length_days || 5,
        } satisfies CycleSettings)
      : null;

    const phaseName = settings
      ? calculatePhaseCanonical(new Date(), settings, {}).phase || null
      : null;
    const metabolicConditions = Array.isArray(onboarding?.metabolic_conditions)
      ? onboarding.metabolic_conditions
      : [];
    const hasMetabolicSignal = metabolicConditions.length > 0;

    return {
      phaseName,
      recommendedHandles: getRecommendedProductHandles(phaseName, hasMetabolicSignal),
    };
  } catch {
    return {
      phaseName: null,
      recommendedHandles: getRecommendedProductHandles(null, false),
    };
  }
}

export default async function ShopPage() {
  const [products, personalization] = await Promise.all([
    getCommerceProducts(),
    getShopPersonalization(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rovehealth.in";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": LOCAL_PRODUCTS.map((product) => ({
      "@type": "Product",
      name: product.title,
      brand: { "@type": "Brand", name: "Rove Health" },
      description: product.description,
      image: `${siteUrl}${product.image}`,
      category: "Health supplement",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ShopClient
        products={products}
        phaseName={personalization.phaseName}
        recommendedHandles={personalization.recommendedHandles}
      />
    </>
  );
}
