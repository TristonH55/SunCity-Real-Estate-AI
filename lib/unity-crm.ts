// export async function sendLeadToCMS({
//     confirmation,
//     customer,
//     regionCode,
//   }: any) {
//     const res = await fetch(
//       "https://jobs.suncityhotwater.com.au/api/leads/add",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization:
//             "Basic " +
//             Buffer.from(
//               `${process.env.UNITY_API_KEY}:${process.env.UNITY_API_SECRET}`
//             ).toString("base64"),
//         },
//         body: JSON.stringify({
//           lead_data: {
//             status: "d651",
//             source: "2d2e",
//             source_domain: "localhost",
//             source_url: "http://localhost:3000/pricing",
//             enquiry_type: "f176", // New System / Replacement
//             system_type: "8563", // Solar (adjust later if needed)
//             location: customer.suburb ?? "",
//             meta_data: {
//               confirmationId: confirmation.id,
//               regionCode,
//               totalIncGst: confirmation.totalIncGst,
//             },
//           },
//           contact_data: {
//             first_name: customer.firstName,
//             last_name: customer.lastName,
//             email: customer.email,
//             phone: customer.phone,
//           },
//         }),
//       }
//     );
  
//     const text = await res.text();
  
//     if (text) {
//       try {
//         const json = JSON.parse(text);
//         console.log("📨 CMS lead response:", json);
//       } catch {
//         console.warn("⚠️ CMS returned non-JSON:", text);
//       }
//     } else {
//       console.log("📨 CMS lead sent (empty response body)");
//     }
//   }


//////TEST
// type LeadPayload = {
//   lead_data: any;
//   contact_data: any;
// };

// export async function sendLeadToCMS(payload: LeadPayload) {
//   const res = await fetch(
//     "https://jobs.suncityhotwater.com.au/api/leads/add",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization:
//           "Basic " +
//           Buffer.from(
//             `${process.env.CMS_API_KEY}:${process.env.CMS_API_SECRET}`
//           ).toString("base64"),
//       },
//       body: JSON.stringify(payload),
//     }
//   );

//   // UnityCRM often returns EMPTY BODY on success
//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(`CMS error ${res.status}: ${text}`);
//   }

//   if (text) {
//     console.log("📨 CMS response:", JSON.parse(text));
//   } else {
//     console.log("📨 CMS lead sent (empty response body)");
//   }
// }

// GROK TEST
// lib/unity-crm.ts
// Safe wrapper that matches your Postman success case

type CMSPayload = {
  lead_data: Record<string, any>;
  contact_data: Record<string, any>;
};

export async function sendLeadToCMS(payload: CMSPayload) {
  try {
    const key = process.env.CMS_API_KEY;
    const secret = process.env.CMS_API_SECRET;


    if (!key || !secret) {
      throw new Error("Missing CMS_API_KEY or CMS_API_SECRET in env");
    }

    const auth = Buffer.from(`${key}:${secret}`).toString("base64");

    const res = await fetch("https://jobs.suncityhotwater.com.au/api/leads/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    // ... rest of your code
  } catch (err) {
    console.error("[CMS] Send failed:", err);
    throw err;
  }
}