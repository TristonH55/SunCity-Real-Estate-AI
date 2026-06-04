// "use client";

// import { useState } from "react";

// export default function JobPage({ params }: { params: { id: string } }) {
//   const [notes, setNotes] = useState("");
//   const [uploading, setUploading] = useState(false);

//   const handleUpload = async (file: File) => {
//     setUploading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();

//     await fetch("/api/job/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id: params.id,
//         imageUrl: data.url,
//         notes,
//       }),
//     });

//     setUploading(false);
//     alert("Uploaded!");
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto space-y-6">

//       <h1 className="text-xl font-bold">Job #{params.id}</h1>

//       <textarea
//         placeholder="Internal notes..."
//         value={notes}
//         onChange={(e) => setNotes(e.target.value)}
//         className="w-full border p-3 rounded"
//       />

//       <input
//         type="file"
//         onChange={(e) => {
//           if (e.target.files?.[0]) {
//             handleUpload(e.target.files[0]);
//           }
//         }}
//       />

//       {uploading && <p>Uploading...</p>}
//     </div>
//   );
// }

///V2
// "use client";

// import { useEffect, useState, use } from "react";

// export default function JobPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   // ✅ FIX — unwrap params
//   const { id } = use(params);

//   const [job, setJob] = useState<any>(null);
//   const [notes, setNotes] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // 🔥 LOAD JOB
//   useEffect(() => {
//     async function loadJob() {
//       const res = await fetch(`/api/job/${id}`);
//       const data = await res.json();
//       setJob(data);
//       setNotes(data.notes || "");
//     }

//     loadJob();
//   }, [id]);

//   // 🔥 UPLOAD IMAGE
//   const handleUpload = async (file: File) => {
//     setUploading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();

//     await fetch("/api/job/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id,
//         imageUrl: data.url,
//         notes,
//       }),
//     });

//     // reload job
//     const updated = await fetch(`/api/job/${id}`);
//     const updatedData = await updated.json();
//     setJob(updatedData);

//     setUploading(false);
//   };

//   // 🔥 SAVE NOTES
//   const saveNotes = async () => {
//     await fetch("/api/job/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id,
//         notes,
//       }),
//     });

//     alert("Notes saved");
//   };

//   if (!job) {
//     return <div className="p-10 text-center">Loading job...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="glass-card p-6">
//           <h1 className="text-2xl font-bold text-[#db231f]">
//             Job #{job.id}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {new Date(job.createdAt).toLocaleDateString("en-AU")}
//           </p>
//         </div>

//         {/* CUSTOMER */}
//         <div className="glass-card p-6">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Customer Details
//           </h2>

//           <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
//             <div><strong>Name:</strong> {job.customer?.firstName} {job.customer?.lastName}</div>
//             <div><strong>Email:</strong> {job.customer?.email}</div>
//             <div><strong>Phone:</strong> {job.customer?.phone}</div>
//             <div><strong>Postcode:</strong> {job.customer?.postcode}</div>
//           </div>
//         </div>

//         {/* INSURER */}
// <div className="glass-card p-6">
//   <h2 className="text-lg font-semibold mb-4 text-[#db231f]">
//     Insurer Details
//   </h2>

//   {job.insurer ? (
//     <div className="grid grid-cols-2 gap-4 text-sm text-black">
//       <div>
//         <strong>Company:</strong> {job.insurer.companyName}
//       </div>
//       <div>
//         <strong>Email:</strong> {job.insurer.email}
//       </div>
//     </div>
//   ) : (
//     <p className="text-gray-500">No insurer linked</p>
//   )}
// </div>


//         {/* SYSTEM */}
//         <div className="glass-card p-6 text-slate-200">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             System Details
//           </h2>

//           <p><strong>Region:</strong> {job.regionCode}</p>
//           {/* <p><strong>System:</strong> {job.systemId}</p> */}
//           <p>
//             <strong>System:</strong>{" "}
//             {job.system
//             ? `${job.system.brand} ${job.system.model} (${job.system.capacityLitres}L)`
//             : "Loading..."}
//             </p>
//           <p><strong>Total:</strong> ${Number(job.totalIncGst).toLocaleString()}</p>
//         </div>

//         {/* IMAGES */}
//         <div className="glass-card p-6 text-slate-200">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Job Images
//           </h2>

//           <div className="flex gap-4 flex-wrap mb-4">
//             {job.images?.length > 0 ? (
//               job.images.map((img: string) => (
//                 <img key={img} src={img} className="w-40 h-40 rounded object-cover" />
//               ))
//             ) : (
//               <p>No images yet</p>
//             )}
//           </div>

//           <input
//             type="file"
//             onChange={(e) => {
//               if (e.target.files?.[0]) {
//                 handleUpload(e.target.files[0]);
//               }
//             }}
//           />

//           {uploading && <p>Uploading...</p>}
//         </div>

//         {/* NOTES */}
//         <div className="glass-card p-6">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Internal Notes
//           </h2>

//           <textarea
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             className="w-full border p-3 rounded mb-4"
//           />

//           <button
//             onClick={saveNotes}
//             className="bg-black text-white px-6 py-2 rounded"
//           >
//             Save Notes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

///TESTING 1.0
// "use client";

// import { useEffect, useState, use } from "react";

// export default function JobPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);

//   const [job, setJob] = useState<any>(null);
//   const [notes, setNotes] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // 🔥 LOAD JOB
//   useEffect(() => {
//     async function loadJob() {
//       const res = await fetch(`/api/job/${id}`);
//       const data = await res.json();
//       setJob(data);
//       setNotes(data.notes || "");
//     }

//     loadJob();
//   }, [id]);

//   // 🔥 UPLOAD IMAGE
//   const handleUpload = async (file: File) => {
//     setUploading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();

//     await fetch("/api/job/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id,
//         imageUrl: data.url,
//         notes,
//       }),
//     });

//     // reload job
//     const updated = await fetch(`/api/job/${id}`);
//     const updatedData = await updated.json();
//     setJob(updatedData);

//     setUploading(false);
//   };

//   // 🔥 SAVE NOTES (FIXED)
//   const saveNotes = async () => {
//     await fetch("/api/job/update", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id,
//         notes,
//       }),
//     });

//     // reload job so UI updates
//     const updated = await fetch(`/api/job/${id}`);
//     const updatedData = await updated.json();
//     setJob(updatedData);

//     alert("Notes saved");
//   };

//   if (!job) {
//     return <div className="p-10 text-center">Loading job...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="glass-card p-6">
//           <h1 className="text-2xl font-bold text-[#db231f]">
//             Job #{job.id}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {new Date(job.createdAt).toLocaleDateString("en-AU")}
//           </p>
//         </div>

//         {/* CUSTOMER */}
//         <div className="glass-card p-6">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Customer Details
//           </h2>

//           <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
//             <div><strong>Name:</strong> {job.customer?.firstName} {job.customer?.lastName}</div>
//             <div><strong>Email:</strong> {job.customer?.email}</div>
//             <div><strong>Phone:</strong> {job.customer?.phone}</div>
//             <div><strong>Postcode:</strong> {job.customer?.postcode}</div>
//           </div>
//         </div>

//         {/* INSURER */}
//         <div className="glass-card p-6">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Insurer Details
//           </h2>

//           {job.insurer ? (
//             <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
//               <div><strong>Company:</strong> {job.insurer.companyName}</div>
//               <div><strong>Email:</strong> {job.insurer.email}</div>
//             </div>
//           ) : (
//             <p className="text-slate-400">No insurer linked</p>
//           )}
//         </div>

//         {/* SYSTEM */}
//         <div className="glass-card p-6 text-slate-200">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             System Details
//           </h2>

//           <p><strong>Region:</strong> {job.regionCode}</p>

//           <p>
//             <strong>System:</strong>{" "}
//             {job.system
//               ? `${job.system.brand} ${job.system.model} (${job.system.capacityLitres}L)`
//               : "Loading..."}
//           </p>

//           <p>
//             <strong>Total:</strong>{" "}
//             ${Number(job.totalIncGst).toLocaleString()}
//           </p>
//         </div>

//         {/* IMAGES */}
//         <div className="glass-card p-6 text-slate-200">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Job Images
//           </h2>

//           <div className="flex gap-4 flex-wrap mb-4">
//             {job.images?.length > 0 ? (
//               job.images.map((img: string) => (
//                 <img
//                   key={img}
//                   src={img}
//                   className="w-40 h-40 rounded object-cover"
//                 />
//               ))
//             ) : (
//               <p>No images yet</p>
//             )}
//           </div>

//           <input
//             type="file"
//             onChange={(e) => {
//               if (e.target.files?.[0]) {
//                 handleUpload(e.target.files[0]);
//               }
//             }}
//           />

//           {uploading && <p>Uploading...</p>}
//         </div>

//         {/* NOTES */}
//         <div className="glass-card p-6">
//           <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
//             Internal Notes
//           </h2>

//           {/* ✅ SHOW SAVED NOTES */}
//           {job.notes ? (
//             <div className="mb-4 p-4 bg-gray-100 rounded text-black whitespace-pre-wrap">
//               {job.notes}
//             </div>
//           ) : (
//             <p className="text-gray-500 mb-4">No notes yet</p>
//           )}

//           <textarea
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             placeholder="Add internal notes..."
//             className="w-full border p-3 rounded mb-4 text-black"
//           />

//           <button
//             onClick={saveNotes}
//             className="bg-black text-white px-6 py-2 rounded"
//           >
//             Save Notes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

///tESTING 1.2V
"use client";

import { useEffect, useState, use } from "react";

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [job, setJob] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔥 LOAD JOB
  useEffect(() => {
    async function loadJob() {
      const res = await fetch(`/api/job/${id}`);
      const data = await res.json();
      setJob(data);
    }

    loadJob();
  }, [id]);

  // 🔥 UPLOAD IMAGE
  const handleUpload = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    await fetch("/api/job/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        imageUrl: data.url,
      }),
    });

    const updated = await fetch(`/api/job/${id}`);
    const updatedData = await updated.json();
    setJob(updatedData);

    setUploading(false);
  };

  // 🔥 DELETE IMAGE
  const handleDeleteImage = async (imageUrl: string) => {
    await fetch("/api/job/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        imageUrl,
      }),
    });

    const updated = await fetch(`/api/job/${id}`);
    const updatedData = await updated.json();
    setJob(updatedData);
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch("/api/job/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: id,
        message,
      }),
    });

    setMessage("");

    const updated = await fetch(`/api/job/${id}`);
    const updatedData = await updated.json();
    setJob(updatedData);
  };

  if (!job) {
    return <div className="p-10 text-center text-slate-400">Loading job...</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="glass-card p-6">
          <h1 className="text-2xl heading text-gradient">
            Job #{job.id}
          </h1>
          <p className="text-slate-400 mt-1">
            {new Date(job.createdAt).toLocaleDateString("en-AU")}
          </p>
        </div>

        {/* CUSTOMER */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
            Customer Details
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
            <div><strong>Name:</strong> {job.customer?.firstName} {job.customer?.lastName}</div>
            <div><strong>Email:</strong> {job.customer?.email}</div>
            <div><strong>Phone:</strong> {job.customer?.phone}</div>
            <div><strong>Postcode:</strong> {job.customer?.postcode}</div>
            <div><strong>Address:</strong>{" "}{job.customer?.address || "Not provided"}</div>
          </div>
        </div>

        {/* INSURER */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
            Insurer Details
          </h2>

          {job.insurer ? (
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div><strong>Company:</strong> {job.insurer.companyName}</div>
              <div><strong>Email:</strong> {job.insurer.email}</div>
            </div>
          ) : (
            <p className="text-slate-400">No insurer linked</p>
          )}
        </div>

        {/* SYSTEM */}
        <div className="glass-card p-6 text-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
            System Details
          </h2>

          <p><strong>Region:</strong> {job.regionCode}</p>

          <p>
            <strong>System:</strong>{" "}
            {job.system
              ? `${job.system.brand} ${job.system.model} (${job.system.capacityLitres}L)`
              : "Loading..."}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            ${Number(job.totalIncGst).toLocaleString()}
          </p>

          <a
            href={`/pricing/confirmation/${job.id}`}
            target="_blank"
            className="text-sky-300 hover:text-sky-200 underline mt-2 inline-block"
            >
            View Confirmation
        </a>
        </div>

        {/* IMAGES */}
        <div className="glass-card p-6 text-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
            Job Images
          </h2>

          <div className="flex gap-4 flex-wrap mb-4">
            {job.images?.length > 0 ? (
              job.images.map((img: string) => (
                <div key={img} className="relative">
                  <img
                    src={img}
                    className="w-40 h-40 rounded object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(img)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No images yet</p>
            )}
          </div>

          {/* UPLOAD BUTTON */}
          <label className={`inline-flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${uploading
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-[#db231f] text-white hover:brightness-110 shadow-[0_0_18px_rgba(219,35,31,0.35)]"
            }`}>
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
                </svg>
                Upload Image
              </>
            )}
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* JOB CHAT */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#ff5a2c]">
            Job Notes / Messages
          </h2>

          {/* CHAT LIST */}
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
            {job.notesLog?.length > 0 ? (
              job.notesLog.map((n: any) => (
                <div key={n.id} className="border border-white/10 rounded-xl p-4 bg-white/5 text-sm text-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#db231f] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_14px_rgba(219,35,31,0.4)]">
                        {(n.user?.companyName || n.user?.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">
                          {n.user?.companyName || n.user?.email}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {n.user?.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(n.createdAt).toLocaleString("en-AU")}
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-10">{n.message}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No messages yet</p>
            )}
          </div>

          {/* INPUT */}
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              className="glass-input flex-1"
            />
            <button
              onClick={sendMessage}
              className="btn-primary px-5"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}