import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">

      {/* HERO */}
      
      <section className="text-center py-16 px-6 bg-gray-50">
        {/* LOGO */}

      <div className="mb-8 flex justify-center">
        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Certified Insurance Provider"
          width={350}
          height={80}
          priority
        />
      </div>

        <h1 className="text-4xl font-bold mb-4 text-red-600">
          Hot Water Insurance Portal
        </h1>

        <p className="max-w-xl mx-auto text-gray-600 mb-8">
          Fast and accurate hot water replacement pricing for insurance
          companies. Generate approved system quotes instantly and lock the
          final price for claim processing.
        </p>

        <Link
          href="/register"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold"
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

    {/* FEATURES / HOW IT WORKS */}
        <section className="max-w-6xl mx-auto py-16 px-6">

        <h2 className="text-2xl font-bold text-center mb-12 text-red-600">
        How the SunCity Pricing Tool Works
        </h2>

    <div className="grid md:grid-cols-3 gap-12">

    {/* STEP 1 */}
    <div className="text-center">
      <Image
        src="/images/step-11.jpg"
        alt="Select System"
        width={350}
        height={240}
        className="mx-auto rounded-lg shadow mb-6 object-cover"
      />

      <h3 className="font-bold text-lg text-green-600 mb-2">
        STEP 1 — Select System
      </h3>

      <p className="text-sm text-gray-600">
        Choose the correct hot water system based on region and system type.
      </p>
    </div>

    {/* STEP 2 */}
    <div className="text-center">
      <Image
        src="/images/step-2.jpg"
        alt="Extras and Pricing"
        width={350}
        height={240}
        className="mx-auto rounded-lg shadow mb-6"
      />

      <h3 className="font-bold text-lg text-green-600 mb-2">
        STEP 2 — Select Installation Extras
      </h3>

      <p className="text-sm text-gray-600">
        Answer installation questions and add any required extras to the job.
      </p>
    </div>

    {/* STEP 3 */}
    <div className="text-center">
      <Image
        src="/images/step-3.jpg"
        alt="Confirm Quote"
        width={350}
        height={240}
        className="mx-auto rounded-lg shadow mb-6"
      />

      <h3 className="font-bold text-lg text-green-600 mb-2">
        STEP 3 — Confirm Price
      </h3>

      <p className="text-sm text-gray-600">
        Lock the final price and generate the official confirmation PDF.
      </p>
    </div>

  </div>
</section>


      {/* CALL TO ACTION */}
      <section className="text-center py-16 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">
          Join SunCity Pricing Portal 
        </h2>

        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold"
        >
          Get Approved
        </Link>
      </section>

    </div>
  );
}