import {
  INGREDIENT_GLOSSARY,
  getRecommendedProductHandles,
  searchGlossaryEntries,
} from "@/data/commerce";

describe("commerce content helpers", () => {
  it("recommends Rise in luteal phase", () => {
    expect(getRecommendedProductHandles("Luteal", false)).toContain("cycle-sync-rise");
  });

  it("prioritizes Balance when metabolic signal exists", () => {
    expect(getRecommendedProductHandles("Ovulatory", true)[0]).toBe("hormone-balance");
  });

  it("includes every launch product in the glossary", () => {
    const foundProducts = new Set(INGREDIENT_GLOSSARY.flatMap((entry) => entry.foundIn));
    expect(foundProducts).toEqual(
      new Set(["hormone-balance", "cycle-sync-rise", "cycle-sync-restore"])
    );
  });

  it("searches ingredients by name and filters by product", () => {
    const magnesiumEntries = searchGlossaryEntries("magnesium", {
      product: "cycle-sync-rise",
    });

    expect(magnesiumEntries.map((entry) => entry.slug)).toContain("magnesium-bisglycinate");
    expect(magnesiumEntries.every((entry) => entry.foundIn.includes("cycle-sync-rise"))).toBe(
      true
    );
  });
});
