// "use client";

// import { useState } from "react";
// import RegionSelect from "./components/RegionSelect";
// import SystemTypeSelect from "./components/SystemTypeSelect";
// import SystemList from "./components/SystemList";
// import ExtrasList from "./components/ExtrasList";

// export default function PricingPage() {
//   const [region, setRegion] = useState<string | null>(null);
//   const [systemType, setSystemType] = useState<string | null>(null);
//   const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
//   const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

//   return (
//     <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">
//         SunCity Certified Insurance Provider App
//       </h1>

//       {/* REGION */}
//       <RegionSelect
//         value={region}
//         onChange={(val) => {
//           setRegion(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//         }}
//       />

//       {/* SYSTEM TYPE */}
//       <SystemTypeSelect
//         value={systemType}
//         onChange={(val) => {
//           setSystemType(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//         }}
//       />

//       {/* SYSTEM LIST */}
//       {region && systemType && (
//         <SystemList
//           region={region}
//           systemType={systemType}
//           selectedSystemId={selectedSystemId}
//           onSelect={(id) => {
//             setSelectedSystemId(id);
//             setSelectedExtras([]);
//           }}
//         />
//       )}

//       {/* EXTRAS */}
//       {region && systemType && selectedSystemId && (
//         <ExtrasList
//           region={region}
//           systemType={systemType}
//           selectedExtras={selectedExtras}
//           onChange={setSelectedExtras}
//         />
//       )}
//     </div>
//   );
// }
///////////////////CORRECT ONE BELOW USE THIS://///////////

// "use client";

// import { useState } from "react";
// import RegionSelect from "./components/RegionSelect";
// import SystemTypeSelect from "./components/SystemTypeSelect";
// import SystemList from "./components/SystemList";
// import ExtrasList from "./components/ExtrasList";
// import PriceSummary from "./components/PriceSummary";

// export default function PricingPage() {
//   const [region, setRegion] = useState<string | null>(null);
//   const [systemType, setSystemType] = useState<string | null>(null);
//   const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
//   const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

//   return (
//     <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">
//         SunCity Certified Insurance Provider App
//       </h1>

//       <RegionSelect
//         value={region}
//         onChange={(val) => {
//           setRegion(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//         }}
//       />

//       <SystemTypeSelect
//         value={systemType}
//         onChange={(val) => {
//           setSystemType(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//         }}
//       />

//       {region && systemType && (
//         <SystemList
//           region={region}
//           systemType={systemType}
//           selectedSystemId={selectedSystemId}
//           onSelect={(id) => {
//             setSelectedSystemId(id);
//             setSelectedExtras([]);
//           }}
//         />
//       )}

//       {region && systemType && selectedSystemId && (
//         <ExtrasList
//           region={region}
//           systemType={systemType}
//           selectedExtras={selectedExtras}
//           onChange={setSelectedExtras}
//         />
//       )}

//       {region && selectedSystemId && (
//         <PriceSummary
//           region={region}
//           systemId={selectedSystemId}
//           extraIds={selectedExtras}
//         />
//       )}
//     </div>
//   );
// }

////////////////working test 1/////

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import RegionSelect from "./components/RegionSelect";
import SystemTypeSelect from "./components/SystemTypeSelect";
import SystemList from "./components/SystemList";
import ExtrasList from "./components/ExtrasList";
import PriceSummary from "./components/PriceSummary";

export default function PricingPage() {
  const [region, setRegion] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-4xl mx-auto">
      {/* Logo instead of text heading */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Certified Insurance Provider"
          width={260}
          height={80}
          priority
        />
      </div>

      <RegionSelect
        value={region}
        onChange={(val) => {
          setRegion(val);
          setSelectedSystemId(null);
          setSelectedExtras([]);
        }}
      />

      <SystemTypeSelect
        value={systemType}
        onChange={(val) => {
          setSystemType(val);
          setSelectedSystemId(null);
          setSelectedExtras([]);
        }}
      />

      {region && systemType && (
        <SystemList
          region={region}
          systemType={systemType}
          selectedSystemId={selectedSystemId}
          onSelect={(id) => {
            setSelectedSystemId(id);
            setSelectedExtras([]);
          }}
        />
      )}

      {region && systemType && selectedSystemId && (
        <ExtrasList
          region={region}
          systemType={systemType}
          selectedExtras={selectedExtras}
          onChange={setSelectedExtras}
        />
      )}

      {region && selectedSystemId && (
        <PriceSummary
          region={region}
          systemId={selectedSystemId}
          extraIds={selectedExtras}
        />
      )}
    </div>
  );
}


// NEW TEST
