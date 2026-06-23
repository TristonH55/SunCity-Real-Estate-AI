"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  existingSystemType: string;
  systemLocation: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white";

export default function GenerateQuote({
  region,
  systemType,
  capacityLitres,
  extraIds,
  extrasComplete,
}: {
  region: string;
  systemType: string;
  capacityLitres: number | null;
  extraIds: string[];
  extrasComplete: boolean;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [addressInput, setAddressInput] = useState("");

  const [customer, setCustomer] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    postcode: "",
    propertyType: "",
    existingSystemType: "",
    systemLocation: "",
  });

  const customerComplete = Object.values(customer).every((v) =>
    v?.toString().trim()
  );

  const handleGenerate = async () => {
    setError(null);
    if (!capacityLitres) {
      setError("Please select a tank size.");
      return;
    }
    for (const [key, value] of Object.entries(customer)) {
      if (!value?.toString().trim()) {
        setError(`Please fill in "${key.replace(/([A-Z])/g, " $1")}".`);
        return;
      }
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/pricing/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionCode: region,
          systemType,
          capacityLitres,
          extraIds,
          customer,
        }),
      });
      const data = await res.json();

      if (res.ok && data.quoteId) {
        router.push(`/quote/${data.quoteId}`);
      } else {
        setError(data.error || "Failed to generate quote. Please try again.");
      }
    } catch {
      setError("Failed to generate quote. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="First name"
          value={customer.firstName}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, firstName: e.target.value }))
          }
          className={inputClass}
        />
        <input
          placeholder="Last name"
          value={customer.lastName}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, lastName: e.target.value }))
          }
          className={inputClass}
        />
        <input
          placeholder="Email"
          type="email"
          value={customer.email}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, email: e.target.value }))
          }
          className={inputClass}
        />
        <input
          placeholder="Mobile"
          type="tel"
          value={customer.phone}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, phone: e.target.value }))
          }
          className={inputClass}
        />

        {/* Google address autocomplete */}
        <div className="relative">
          <input
            placeholder="Start typing address..."
            value={addressInput}
            onChange={async (e) => {
              const value = e.target.value;
              setAddressInput(value);
              if (value.length < 3) {
                setSuggestions([]);
                return;
              }
              const res = await fetch(
                `/api/google/autocomplete?input=${encodeURIComponent(value)}`
              );
              const data = await res.json();
              const qldOnly = (data.predictions || []).filter((p: any) =>
                p.description.includes("QLD")
              );
              setSuggestions(qldOnly);
            }}
            className={inputClass}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-50 bg-[#0d1220] border border-white/10 w-full mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <div
                  key={s.place_id}
                  className="p-2 hover:bg-white/10 cursor-pointer text-sm text-slate-200"
                  onClick={async () => {
                    const res = await fetch(
                      `/api/google/place-details?placeId=${encodeURIComponent(
                        s.place_id
                      )}`
                    );
                    const data = await res.json();
                    const components = data.result.address_components || [];
                    const suburb =
                      components.find((c: any) =>
                        c.types.includes("locality")
                      )?.long_name || "";
                    const postcode =
                      components.find((c: any) =>
                        c.types.includes("postal_code")
                      )?.long_name || "";
                    const fullAddress =
                      data.result.formatted_address || s.description;
                    setCustomer((prev) => ({
                      ...prev,
                      suburb,
                      postcode,
                      address: fullAddress,
                    }));
                    setAddressInput(fullAddress);
                    setSuggestions([]);
                  }}
                >
                  {s.description}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          placeholder="Postcode"
          value={customer.postcode}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, postcode: e.target.value }))
          }
          className={inputClass}
        />

        {/* CMS-mapped dropdowns (exact key strings from lib/cms-mapping.ts) */}
        <select
          value={customer.propertyType}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, propertyType: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">Property type…</option>
          <option value="House">House</option>
          <option value="Unit">Unit</option>
          <option value="Townhouse">Townhouse</option>
          <option value="Commercial">Commercial</option>
        </select>

        <select
          value={customer.existingSystemType}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, existingSystemType: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">Existing system…</option>
          <option value="Electric">Electric</option>
          <option value="Gas">Gas</option>
          <option value="Solar">Solar</option>
          <option value="Heat Pump">Heat Pump</option>
          <option value="Not Sure">Not Sure</option>
          <option value="No Existing System">No Existing System</option>
        </select>

        <select
          value={customer.systemLocation}
          onChange={(e) =>
            setCustomer((s) => ({ ...s, systemLocation: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">System location…</option>
          <option value="Inside">Inside</option>
          <option value="Outside">Outside</option>
          <option value="Roof">Roof</option>
          <option value="No Existing System">No Existing System</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={
          generating || !extrasComplete || !customerComplete || !capacityLitres
        }
        className="btn-primary w-full"
      >
        {generating ? "Generating quote…" : "Generate quote (3 options)"}
      </button>

      {!extrasComplete && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ Please answer all extras before generating the quote.
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
