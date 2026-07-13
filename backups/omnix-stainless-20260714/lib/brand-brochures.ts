/**
 * Brand → brochure PDF(s). ELECTRIC only for now. Files live in
 * `public/pdfs/Electric/` (served at `/pdfs/Electric/…`). Filenames contain
 * spaces/underscores, so the href is URL-encoded. Unknown brands return [] (no
 * link) — heat pump / solar show nothing until their PDFs + entries are added.
 */

type Brochure = { label: string; file: string };

const BRAND_BROCHURES: Record<string, Brochure[]> = {
  "AquaMAX / Vulcan": [
    { label: "AquaMAX PDF", file: "Aquamax-Electric-brochure.pdf" },
    { label: "Vulcan PDF", file: "Vulcan_Gas___Electric_Brochure.pdf" },
  ],
  "OMNI X / Thermann": [
    { label: "OMNI X PDF", file: "OMNI-X-Stainless Steel-Electric-brochure.pdf" },
  ],
  "Rheem Stellar": [
    { label: "Rheem Stellar PDF", file: "Rheem-Stellar-Electric-brochure.pdf" },
  ],
};

export function brandBrochures(brand: string): { label: string; href: string }[] {
  return (BRAND_BROCHURES[brand] ?? []).map((b) => ({
    label: b.label,
    href: `/pdfs/Electric/${encodeURIComponent(b.file)}`,
  }));
}
