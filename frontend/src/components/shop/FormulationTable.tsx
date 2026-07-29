import type { FormulationItem } from "@/data/products";

export function FormulationTable({ formulation }: { formulation: FormulationItem[] }) {
  const hasAnyRda = formulation.some((item) => item.rda);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-taupe-light">
              <th className="border-b border-obsidian/20 px-3 py-2.5 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
                Nutrient
              </th>
              <th className="w-32 border-b border-obsidian/20 px-3 py-2.5 text-right font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
                Dose
              </th>
              <th className="w-20 border-b border-obsidian/20 px-3 py-2.5 text-right font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-obsidian">
                %RDA
              </th>
            </tr>
          </thead>
          <tbody>
            {formulation.map((item) => (
              <tr key={item.nutrient} className="border-b border-obsidian/12">
                <td className="px-3 py-3.5 font-sans text-sm text-obsidian">{item.nutrient}</td>
                <td className="w-32 px-3 py-3.5 text-right font-sans text-sm font-medium tabular-nums text-obsidian/70">
                  {item.dose}
                </td>
                <td className="w-20 px-3 py-3.5 text-right font-sans text-sm tabular-nums text-obsidian/70">
                  {item.rda ?? "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasAnyRda && (
        <p className="mt-3 font-sans text-xs text-obsidian/70">
          %RDA is shown where the label declares one.
        </p>
      )}
    </div>
  );
}
