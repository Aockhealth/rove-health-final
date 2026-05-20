import type { Metadata } from "next";
import { GlossaryClient } from "./GlossaryClient";

export const metadata: Metadata = {
  title: "Supplement Ingredient Glossary: Doses, Evidence & Safety | Rove Health",
  description:
    "Look up every ingredient in Rove's cycle-sync supplements — including dose, clinical role, evidence level, and safety notes. Transparent formulation for Indian women.",
  keywords: [
    "supplement ingredients glossary",
    "ashwagandha dose women",
    "shatavari benefits",
    "magnesium glycinate PMS",
    "women supplement ingredients India",
    "PCOS supplement ingredients",
  ],
};

export default function IngredientGlossaryPage() {
  return <GlossaryClient />;
}
