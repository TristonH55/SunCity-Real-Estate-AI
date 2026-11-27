import Image from "next/image";

// "Trusted Brands" section (home page + real estate page).
// Logos are 150×80 in public/images/brand-logos.
const BRANDS = [
  { name: "Omni X Hot Water Systems", logo: "omnix-black.png" },
  { name: "Rheem Hot Water Systems", logo: "rheem.png" },
  { name: "Aquamax Hot Water Systems", logo: "aquamax.png" },
  { name: "iHeat Solar Hot Water", logo: "iheat-solar-hot-water-systems-logo.png" },
  { name: "iStore Heat Pump Hot Water", logo: "istore.png" },
  { name: "Apricus Solar Hot Water", logo: "apricus-logo.png" },
  { name: "Reclaim Residential", logo: "reclaim.png" },
  { name: "Haier Heat Pumps", logo: "haier-logo.png" },
  { name: "Evoheat Heat Pumps", logo: "Evoheat-logo.png" },
  { name: "Thermastore", logo: "Thermostore-logo.png" },
  { name: "Bosch Hot Water Systems", logo: "bosch.png" },
  { name: "Stiebel Eltron Water Heater", logo: "stiebel-eltron.png" },
  { name: "Dux Hot Water Systems", logo: "dux.png" },
];

export default function TrustedBrands() {
  return (
    <section className="max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-10">
        <p className="flex items-center justify-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-[#ff5a2c] mb-3">
          <span className="h-px w-8 bg-[#ff5a2c]" />
          Trusted Brands
          <span className="h-px w-8 bg-[#ff5a2c]" />
        </p>
        <h2 className="text-3xl md:text-4xl heading mb-3">
          Australia&apos;s Leading Hot Water Brands
        </h2>
        <p className="text-slate-400">We supply, install &amp; service all major brands.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {BRANDS.map((b) => (
          <div
            key={b.name}
            className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(16.666%-0.84rem)] rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <Image
              src={`/images/brand-logos/${b.logo}`}
              alt={`${b.name} logo`}
              width={150}
              height={80}
              className="h-auto w-full max-w-[150px]"
            />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#0d2240] leading-snug">
              {b.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
