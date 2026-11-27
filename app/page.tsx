import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Public customers' home page. Real estate agents have their own landing page
// at /real-estate-hot-water-quotes (logged-in agents are sent there).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hot Water Quotes in Minutes | SunCity Hot Water",
  description:
    "Get an instant price on a new hot water system for your home. Compare up to 3 options, then approve online.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "agent") redirect("/real-estate-hot-water-quotes");

  return (
    <div className="min-h-screen text-white pb-24 relative">

      {/* Top-right: link to the real estate agents' page */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8">
        <Link
          href="/real-estate-hot-water-quotes"
          className="text-sm font-semibold text-slate-300 hover:text-white border border-white/15 bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2 transition"
        >
          Real Estate Agents →
        </Link>
      </div>

      {/* HERO */}

      <section className="text-center py-20 px-6">
        {/* LOGO */}

      <div className="mb-8 flex justify-center">
        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Hot Water"
          width={350}
          height={80}
          priority
        />
      </div>

        <h1 className="text-4xl md:text-5xl heading mb-4">
          <span className="text-gradient">Hot Water Quotes in Minutes</span>
        </h1>

        <p className="max-w-xl mx-auto text-slate-400 mb-8 text-lg">
          Get an instant price on a new hot water system for your home.
          Compare up to 3 options, then approve online.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="btn-primary px-8 py-4"
          >
            Get a quote
          </Link>
          <Link
            href="/login?customer=1"
            className="px-8 py-4 rounded-xl font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 transition"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      {/* <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-10">

        <div className="text-center">
          <Image
            src="/images/system-selection.png"
            alt="System Selection"
            width={300}
            height={200}
            className="mx-auto mb-4 rounded-lg"
          />
          <h3 className="font-bold text-lg mb-2">System Selection</h3>
          <p className="text-sm text-gray-600">
            Select approved hot water systems based on region and system type.
          </p>
        </div>

        <div className="text-center">
          <Image
            src="/images/pricing-engine.png"
            alt="Pricing Engine"
            width={300}
            height={200}
            className="mx-auto mb-4 rounded-lg"
          />
          <h3 className="font-bold text-lg mb-2">Accurate Pricing</h3>
          <p className="text-sm text-gray-600">
            Automatic price calculations including extras and GST.
          </p>
        </div>

        <div className="text-center">
          <Image
            src="/images/confirmation.png"
            alt="Price Confirmation"
            width={300}
            height={200}
            className="mx-auto mb-4 rounded-lg"
          />
          <h3 className="font-bold text-lg mb-2">Locked Quotes</h3>
          <p className="text-sm text-gray-600">
            Confirm and generate a locked quote with PDF documentation.
          </p>
        </div>

      </section> */}

    {/* FEATURES / HOW IT WORKS — banner steps, stacked (wide on desktop, tall on mobile) */}
        <section className="max-w-5xl mx-auto py-16 px-6">

        <h2 className="text-2xl md:text-3xl heading text-center mb-12">
        How the SunCity Pricing Tool Works
        </h2>

    <div className="space-y-8">

    {/* STEP 1 */}
    <div className="glass-card p-3 transition-all duration-200 hover:-translate-y-1">
      {/* Desktop / tablet (wide banner) */}
      <Image
        src="/images/step1-r.png"
        alt="Step 1 — Select region, system type and size"
        width={1140}
        height={469}
        priority
        className="hidden md:block w-full h-auto rounded-xl"
      />
      {/* Mobile (tall, readable) */}
      <Image
        src="/images/step1-1-r-Mobile.png"
        alt="Step 1 — Select region, system type and size"
        width={345}
        height={481}
        priority
        className="block md:hidden w-full h-auto rounded-xl"
      />
    </div>

    {/* STEP 2 */}
    <div className="glass-card p-3 transition-all duration-200 hover:-translate-y-1">
      <Image
        src="/images/step2-r.png"
        alt="Step 2 — Select installation extras and homeowner details"
        width={1135}
        height={473}
        className="hidden md:block w-full h-auto rounded-xl"
      />
      <Image
        src="/images/step2-r-Mobile.png"
        alt="Step 2 — Select installation extras and homeowner details"
        width={336}
        height={473}
        className="block md:hidden w-full h-auto rounded-xl"
      />
    </div>

    {/* STEP 3 */}
    <div className="glass-card p-3 transition-all duration-200 hover:-translate-y-1">
      <Image
        src="/images/step3-r.png"
        alt="Step 3 — Generate the quote and lock the chosen system"
        width={1135}
        height={477}
        className="hidden md:block w-full h-auto rounded-xl"
      />
      <Image
        src="/images/step3-r-Mobile.png"
        alt="Step 3 — Generate the quote and lock the chosen system"
        width={336}
        height={477}
        className="block md:hidden w-full h-auto rounded-xl"
      />
    </div>

  </div>
</section>


      {/* CALL TO ACTION */}
      <section className="text-center py-16 px-6">
        <div className="glass-card-strong max-w-3xl mx-auto py-12 px-6">
          <h2 className="text-2xl md:text-3xl heading mb-4">
            Get Your Hot Water Quote
          </h2>

          <Link
            href="/signup"
            className="btn-primary px-8 py-4"
          >
            Get a quote
          </Link>
        </div>
      </section>

    </div>
  );
}