import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen text-white pb-24">

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
          <span className="text-gradient">Real Estate Quoting Portal</span>
        </h1>

        <p className="max-w-xl mx-auto text-slate-400 mb-8 text-lg">
          Fast and accurate hot water replacement pricing for real estate
          agents. Generate a 3-option quote in seconds and send it to the
          homeowner to review and approve.
        </p>

        <Link
          href="/register"
          className="btn-primary px-8 py-4"
        >
          Register Now
        </Link>
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
            Join SunCity Pricing Portal
          </h2>

          <Link
            href="/register"
            className="btn-primary px-8 py-4"
          >
            Get Approved
          </Link>
        </div>
      </section>

    </div>
  );
}