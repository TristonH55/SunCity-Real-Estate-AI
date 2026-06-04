

// ////////// USEING ////////
// "use client";

// import { useEffect, useState } from "react";

// type Extra = {
//   extraId: string;
//   name: string;
//   priceExGst: number;
//   included: boolean;
// };

// export default function ExtrasList({
//   region,
//   systemType,
//   selectedExtras,
//   onChange,
// }: {
//   region: string;
//   systemType: string;
//   selectedExtras: string[];
//   onChange: (extras: string[]) => void;
// }) {
//   const [extras, setExtras] = useState<Extra[]>([]);

//   useEffect(() => {
//     if (!region || !systemType) return;

//     fetch(
//       `/api/pricing/extras?region=${region}&type=${systemType}`
//     )
//       .then((res) => res.json())
//       .then(setExtras);
//   }, [region, systemType]);

//   if (!extras.length) return null;

//   const includedExtras = extras.filter((e) => e.included);
//   const optionalExtras = extras.filter((e) => !e.included);

//   const toggleExtra = (id: string) => {
//     if (selectedExtras.includes(id)) {
//       onChange(selectedExtras.filter((x) => x !== id));
//     } else {
//       onChange([...selectedExtras, id]);
//     }
//   };

//   return (
//     <div className="mt-8">
//       <h2 className="text-xl font-semibold mb-4">Extras</h2>

//       {/* INCLUDED */}
//       {includedExtras.length > 0 && (
//         <div className="mb-6">
//           <h3 className="font-medium text-green-700 mb-2">
//             Included (no charge)
//           </h3>

//           <div className="space-y-2">
//             {includedExtras.map((e) => (
//               <div
//                 key={e.extraId}
//                 className="flex items-center justify-between p-3 rounded border bg-green-50 text-green-800"
//               >
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked
//                     disabled
//                     className="accent-green-600"
//                   />
//                   <span>{e.name}</span>
//                 </div>

//                 <span className="text-sm font-medium">Included</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* OPTIONAL */}
//       {optionalExtras.length > 0 && (
//         <div>
//           <h3 className="font-medium text-gray-800 mb-2">
//             Optional extras
//           </h3>

//           <div className="space-y-2">
//             {optionalExtras.map((e) => (
//               <label
//                 key={e.extraId}
//                 className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-gray-50"
//               >
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedExtras.includes(e.extraId)}
//                     onChange={() => toggleExtra(e.extraId)}
//                     className="accent-[#db231f]"
//                   />
//                   <span>{e.name}</span>
//                 </div>

//                 <span className="text-sm font-medium">
//                   ${e.priceExGst.toLocaleString()} ex-GST
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// ////////MY EXTRASLIST.TSX //////////
"use client";

import { useEffect, useState } from "react";
import ToggleButton from "./ToggleButton";

type Extra = {
  extraId: string;
  name: string;
  priceExGst: number;
  included: boolean;
};

// type Props = {
//   region: string;
//   systemType: string;
//   selectedExtras: string[];
//   onChange: (extras: string[]) => void;
// };

  type Props = {
    region: string;
    systemType: string;
    selectedExtras: string[];
    onChange: (extras: string[]) => void;
    onCompletionChange?: (complete:boolean)=>void;
  };

export default function ExtrasList({
  region,
  systemType,
  selectedExtras,
  onChange,
  onCompletionChange
}: Props) {

  const [extras, setExtras] = useState<Extra[]>([]);
  //const [answers, setAnswers] = useState<Record<string,"yes"|"no">>({});
  const [answers, setAnswers] = useState<Record<string,"yes"|"no"|null>>({});
  const [location,setLocation] = useState<"inside"|"outside"|null>(null);


  useEffect(() => {

    if (!region || !systemType) return;

    fetch(`/api/pricing/extras?region=${region}&type=${systemType}`)
      .then((res) => res.json())
      .then((data) => {

        setExtras(data);

        // const initial: Record<string,"yes"|"no"> = {};

        // data.forEach((e: Extra) => {
        //   initial[e.extraId] = "no";
        // });

        const initial: Record<string,"yes"|"no"|null> = {};

        data.forEach((e: Extra) => {
          initial[e.extraId] = null;
          });

        setAnswers(initial);
        onChange([]);

      });

  }, [region, systemType]);



  function updateAnswer(extraId: string,value:"yes"|"no"){

    const updated = {
      ...answers,
      [extraId]: value
    };

    setAnswers(updated);

    // const selected = Object.entries(updated)
    //   .filter(([_,v]) => v === "yes")
    //   .map(([id]) => id);
    const selected = Object.entries(updated)
      .filter(([_,v]) => v === "yes")
      .map(([id]) => id);
      onChange(selected);

  }






  const includedExtras = extras.filter(e=>e.included);
  const optionalExtras = extras.filter(e=>!e.included);
  // Only check visible extras
  const visibleExtras = optionalExtras.filter((e) => {

  if(location==="outside" && e.name.toLowerCase().includes("tray")){
    return false;
    }

    if(location==="inside" && e.name.toLowerCase().includes("concrete")){
    return false;
    }

    return true;
  });

  // // Check if every visible extra has an answer
  // const allAnswered = visibleExtras.every(
  //   (e)=>answers[e.extraId] !== null
  // );
  // if(onCompletionChange){
  //   onCompletionChange(allAnswered);
  // }
  // Check if every visible extra has an answer
const allAnswered =
location !== null &&
visibleExtras.every(
  (e) => answers[e.extraId] !== null
);

useEffect(() => {
if (onCompletionChange) {
  onCompletionChange(allAnswered);
}
}, [allAnswered, onCompletionChange]);

  return (

    <div className="mt-8">

      <h2 className="text-xl font-semibold mb-4">
        Extras
      </h2>



      {/* LOCATION SELECTOR */}

      <div className="mb-6 border border-white/10 bg-white/5 p-4 rounded-xl">

        <p className="font-medium mb-3 text-slate-300">
          Location of Existing System / New Installation
        </p>

        <div className="flex gap-3">

          <button
            onClick={()=>setLocation("inside")}
            className={`px-4 py-2 rounded-lg border transition ${
              location==="inside"
                ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            Inside
          </button>

          <button
            onClick={()=>setLocation("outside")}
            className={`px-4 py-2 rounded-lg border transition ${
              location==="outside"
                ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            Outside
          </button>

          {/* <button
            onClick={()=>setLocation("none")}
            className={`px-4 py-2 rounded ${
              location==="none"
                ? "bg-[#db231f] text-white"
                : "bg-gray-200"
            }`}
          >
            No Existing System
          </button> */}

        </div>

      </div>



      {/* INCLUDED */}

      {includedExtras.length > 0 && (

        <div className="mb-6">

          <h3 className="font-medium text-emerald-300 mb-2">
            Included (no charge)
          </h3>

          <div className="space-y-2">

            {includedExtras.map((e)=>(
              <div
                key={`included-${e.extraId}`}
                className="flex items-center justify-between p-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              >

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="accent-green-600"
                  />

                  <span>{e.name}</span>

                </div>

                <span className="text-sm font-medium">
                  Included
                </span>

              </div>
            ))}

          </div>

        </div>

      )}



      {/* OPTIONAL */}

      {optionalExtras.length > 0 && (

        <div>

          <h3 className="font-medium text-slate-300 mb-2">
            Optional extras
          </h3>

          <div className="space-y-2">

            {optionalExtras.map((e)=>{

              // Hide tray extras when outside
              if(
                location==="outside" &&
                e.name.toLowerCase().includes("tray")
              ){
                return null;
              }

              // Hide concrete base when inside
              if(
                location==="inside" &&
                e.name.toLowerCase().includes("concrete")
              ){
                return null;
              }

              return(

                <div
                  key={`extra-${e.extraId}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-white"
                >

                  {/* <div>
                    <span>{e.name}</span>
                  </div> */}

<div className="flex flex-col">
  <span>{e.name}</span>

  {/* Info PDF links */}
  {e.name.toLowerCase().includes("safe tray") && (
    <a
      href="/pdfs/Internal-hot-water-systems-safe-tray-and-mildred-valve.pdf"
      target="_blank"
      className="text-xs text-sky-300 underline mt-1"
    >
      Info PDF
    </a>
  )}

  {e.name.toLowerCase().includes("concrete base") && (
    <a
      href="/pdfs/external-hot-water-systems-support-base.pdf"
      target="_blank"
      className="text-xs text-sky-300 underline mt-1"
    >
      Info PDF
    </a>
  )}
</div>




                  <div className="flex items-center gap-4">

                    <span className="text-sm font-medium">
                      ${e.priceExGst.toLocaleString()} ex-GST
                    </span>

                    {/* <ToggleButton
                      value={answers[e.extraId]}
                      onChange={(v)=>updateAnswer(e.extraId,v)}
                    /> */}
                    <ToggleButton
                      value={answers[e.extraId] ?? null}
                      onChange={(v)=>updateAnswer(e.extraId,v)}
                    />
                  </div>

                </div>

              );

            })}

          </div>
          {!allAnswered && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300 flex items-center gap-2">
            ⚠️ Please answer all extras before continuing.
          </div>
          )}
        </div>

      )}

    </div>

  );

}
