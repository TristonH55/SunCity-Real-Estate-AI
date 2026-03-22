//////test working !/ 
// "use client";

// export const dynamic = "force-dynamic";

// import { useState } from "react";
// import Image from "next/image";
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
//   const [extrasComplete, setExtrasComplete] = useState(false);
//   const [calculatedPrice, setCalculatedPrice] = useState<any | null>(null);

//   return (
//     <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-7xl mx-auto">
      
//       {/* Logo */}
//       <div className="mb-8 flex justify-center">
//         <Image
//           src="/images/suncity-logo-transparient.jpg.png"
//           alt="SunCity Certified Insurance Provider"
//           width={350}
//           height={80}
//           priority
//         />
//       </div>

//       {/* Region */}
//       <RegionSelect
//         value={region}
//         onChange={(val) => {
//           setRegion(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//           setExtrasComplete(false);
//         }}
//       />

//       {/* System Type */}
//       <SystemTypeSelect
//         value={systemType}
//         onChange={(val) => {
//           setSystemType(val);
//           setSelectedSystemId(null);
//           setSelectedExtras([]);
//           setExtrasComplete(false);
//         }}
//       />

//       {/* MAIN GRID LAYOUT */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">

//         {/* LEFT COLUMN — SYSTEMS */}

//         <div>

//           {region && systemType && (
//             <SystemList
//               region={region}
//               systemType={systemType}
//               selectedSystemId={selectedSystemId}
//               onSelect={(id) => {
//                 setSelectedSystemId(id);
//                 setSelectedExtras([]);
//                 setExtrasComplete(false);
//               }}
//             />
//           )}

//         </div>

//         {/* RIGHT COLUMN — EXTRAS + SUMMARY */}

//         <div>

//           {region && systemType && selectedSystemId && (
//             <ExtrasList
//               region={region}
//               systemType={systemType}
//               selectedExtras={selectedExtras}
//               onChange={setSelectedExtras}
//               onCompletionChange={setExtrasComplete}
//             />
//           )}

//           {region && selectedSystemId && (
//             <PriceSummary
//               region={region}
//               systemId={selectedSystemId}
//               extraIds={selectedExtras}
//               extrasComplete={extrasComplete}
//             />
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }


////1 LATEST WORKING VERSION
// "use client";

// export const dynamic = "force-dynamic";

// import { useState } from "react";
// import Image from "next/image";
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
//   const [extrasComplete, setExtrasComplete] = useState(false);

//   return (

//     <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-7xl mx-auto">

//       {/* LOGO */}

//       <div className="mb-8 flex justify-center">
//         <Image
//           src="/images/suncity-logo-transparient.jpg.png"
//           alt="SunCity Certified Insurance Provider"
//           width={350}
//           height={80}
//           priority
//         />
//       </div>

//       {/* STEP 1 */}

//       <div className="border rounded-lg p-6 mb-6 bg-red-200">

//         <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//           Step 1 — Select Region & System Type
//         </h2>

//         <div className="space-y-4">

//           <RegionSelect
//             value={region}
//             onChange={(val) => {
//               setRegion(val);
//               setSelectedSystemId(null);
//               setSelectedExtras([]);
//               setExtrasComplete(false);
//             }}
//           />

//           <SystemTypeSelect
//             value={systemType}
//             onChange={(val) => {
//               setSystemType(val);
//               setSelectedSystemId(null);
//               setSelectedExtras([]);
//               setExtrasComplete(false);
//             }}
//           />

//         </div>

//       </div>

//       {/* MAIN GRID */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">

//         {/* LEFT COLUMN */}

//         <div>

//           <div className="border rounded-lg p-6">

//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 2 — Select System
//             </h2>

//             {region && systemType && (
//               <SystemList
//                 region={region}
//                 systemType={systemType}
//                 selectedSystemId={selectedSystemId}
//                 onSelect={(id) => {
//                   setSelectedSystemId(id);
//                   setSelectedExtras([]);
//                   setExtrasComplete(false);
//                 }}
//               />
//             )}

//           </div>

//         </div>

//         {/* RIGHT COLUMN */}

//         <div className="space-y-8">

//           {/* STEP 3 */}

//           <div className="border rounded-lg p-6">

//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 3 — Extras
//             </h2>

//             {region && systemType && selectedSystemId && (
//               <ExtrasList
//                 region={region}
//                 systemType={systemType}
//                 selectedExtras={selectedExtras}
//                 onChange={setSelectedExtras}
//                 onCompletionChange={setExtrasComplete}
//               />
//             )}

//           </div>

//           {/* STEP 4 + 5 */}

//           <div className="border rounded-lg p-6">

//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 4 — Customer Details
//             </h2>

//             {/* <h2 className="text-lg font-semibold mb-6 text-[#db231f]">
//               Step 5 — Confirm & Lock Price
//             </h2> */}

//             {region && selectedSystemId && (
//               <PriceSummary
//                 region={region}
//                 systemId={selectedSystemId}
//                 extraIds={selectedExtras}
//                 extrasComplete={extrasComplete}
//               />
//             )}

//           </div>

//         </div>

//       </div>

//     </div>

//   );
// }

///// MOBILE READY VERSION last tested working//
// "use client";

// export const dynamic = "force-dynamic";

// import { useState, useRef } from "react";
// import Image from "next/image";
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
//   const [extrasComplete, setExtrasComplete] = useState(false);

//   // reference for auto scroll
//   const extrasRef = useRef<HTMLDivElement | null>(null);
//   const systemsRef = useRef<HTMLDivElement | null>(null);
//   return (

//     <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-7xl mx-auto">

//       {/* LOGO */}

//       <div className="mb-8 flex justify-center">
//         <Image
//           src="/images/suncity-logo-transparient.jpg.png"
//           alt="SunCity Certified Insurance Provider"
//           width={350}
//           height={80}
//           priority
//         />
//       </div>

//       {/* STEP 1 */}

//       <div className="border rounded-lg p-6 mb-6 bg-white max-w-sm">

//         <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//           Step 1 — Select Region & System Type
//         </h2>

//         <div className="space-y-4">

//           <RegionSelect
//             value={region}
//             onChange={(val) => {
//               setRegion(val);
//               setSelectedSystemId(null);
//               setSelectedExtras([]);
//               setExtrasComplete(false);
//             }}
//           />

//           <SystemTypeSelect
//             value={systemType}
//             onChange={(val) => {
//               setSystemType(val);
//               setSelectedSystemId(null);
//               setSelectedExtras([]);
//               setExtrasComplete(false);
//             }}
//           />

//         </div>

//       </div>

//       {/* MAIN GRID */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">

//         {/* LEFT COLUMN */}

//         <div>

//           {/* <div className="border rounded-lg p-6"> */}
//           <div ref={systemsRef} className="border rounded-lg p-6">
//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 2 — Select System
//             </h2>

//             {region && systemType && (
//               <SystemList
//                 region={region}
//                 systemType={systemType}
//                 selectedSystemId={selectedSystemId}
//                 onSelect={(id) => {

//                   setSelectedSystemId(id);
//                   setSelectedExtras([]);
//                   setExtrasComplete(false);

//                   // MOBILE ONLY auto scroll
//                   if (window.innerWidth < 1024) {
//                     setTimeout(() => {
//                       extrasRef.current?.scrollIntoView({
//                         behavior: "smooth",
//                         block: "start"
//                       });
//                     }, 120);
//                   }

//                 }}
//               />
//             )}

//           </div>

//         </div>

//         {/* RIGHT COLUMN */}

//         <div className="space-y-8">

//           {/* STEP 3 */}

//           <div ref={extrasRef} className="border rounded-lg p-6">

//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 3 — Extras
//             </h2>

//             {region && systemType && selectedSystemId && (
//               <ExtrasList
//                 region={region}
//                 systemType={systemType}
//                 selectedExtras={selectedExtras}
//                 onChange={setSelectedExtras}
//                 onCompletionChange={setExtrasComplete}
//               />
//             )}

//           </div>

//           {/* STEP 4 */}

//           <div className="border rounded-lg p-6">

//             <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//               Step 4 — Customer Details
//             </h2>

//             {region && selectedSystemId && (
//               <PriceSummary
//                 region={region}
//                 systemId={selectedSystemId}
//                 extraIds={selectedExtras}
//                 extrasComplete={extrasComplete}
//               />
//             )}

//           </div>
//               {/* MOBILE BACK TO SYSTEMS BUTTON */}

// <button
//   onClick={() => {
//     systemsRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   }}
//   className="lg:hidden fixed bottom-26 right-6 bg-[#000000] text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold"
// >
//   Top
// </button>
//         </div>

//       </div>

//     </div>

//   );
// }

/////test only with console logging debugging
"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import RegionSelect from "./components/RegionSelect";
import SystemTypeSelect from "./components/SystemTypeSelect";
import SystemList from "./components/SystemList";
import ExtrasList from "./components/ExtrasList";
import PriceSummary from "./components/PriceSummary";

export default function PricingPage() {

  // 🔥 DEBUG SESSION
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("🔥 PRICING PAGE LOADED");
    console.log("SESSION STATUS:", status);
    console.log("SESSION DATA:", session);
  }, [status, session]);

  const [region, setRegion] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extrasComplete, setExtrasComplete] = useState(false);

  const extrasRef = useRef<HTMLDivElement | null>(null);
  const systemsRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 px-8 py-10 max-w-7xl mx-auto">

      <div className="mb-8 flex justify-center">
        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Certified Insurance Provider"
          width={350}
          height={80}
          priority
        />
      </div>

      <div className="border rounded-lg p-6 mb-6 bg-white max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
          Step 1 — Select Region & System Type
        </h2>

        <div className="space-y-4">
          <RegionSelect
            value={region}
            onChange={(val) => {
              setRegion(val);
              setSelectedSystemId(null);
              setSelectedExtras([]);
              setExtrasComplete(false);
            }}
          />

          <SystemTypeSelect
            value={systemType}
            onChange={(val) => {
              setSystemType(val);
              setSelectedSystemId(null);
              setSelectedExtras([]);
              setExtrasComplete(false);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">

        <div>
          <div ref={systemsRef} className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
              Step 2 — Select System
            </h2>

            {region && systemType && (
              <SystemList
                region={region}
                systemType={systemType}
                selectedSystemId={selectedSystemId}
                onSelect={(id) => {
                  setSelectedSystemId(id);
                  setSelectedExtras([]);
                  setExtrasComplete(false);

                  if (window.innerWidth < 1024) {
                    setTimeout(() => {
                      extrasRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      });
                    }, 120);
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-8">

          <div ref={extrasRef} className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
              Step 3 — Extras
            </h2>

            {region && systemType && selectedSystemId && (
              <ExtrasList
                region={region}
                systemType={systemType}
                selectedExtras={selectedExtras}
                onChange={setSelectedExtras}
                onCompletionChange={setExtrasComplete}
              />
            )}
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
              Step 4 — Customer Details
            </h2>

            {region && selectedSystemId && (
              <PriceSummary
                region={region}
                systemId={selectedSystemId}
                extraIds={selectedExtras}
                extrasComplete={extrasComplete}
              />
            )}
          </div>

          <button
            onClick={() => {
              systemsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="lg:hidden fixed bottom-26 right-6 bg-[#000000] text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold"
          >
            Top
          </button>

        </div>
      </div>
    </div>
  );
}