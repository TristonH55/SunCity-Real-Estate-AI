// import { NextResponse } from "next/server"

// export async function POST(req: Request) {
//   const body = await req.json()

//   const { lead_data, contact_data } = body

//   const propertyMap:any = {
//     house: "8884",
//     unit: "1b54",
//     townhouse: "7b71",
//     commercial: "a0fe"
//   }

//   const systemTypeMap:any = {
//     electric: "c730",
//     gas: "412c",
//     solar: "8563",
//     "heat pump": "43c8",
//     "not sure": "bc1e",
//     none: "4577"
//   }

//   const locationMap:any = {
//     inside: "9603",
//     outside: "db09",
//     roof: "e4d8",
//     none: "a1f1"
//   }

//   const enquiryTypeMap:any = {
//     service: "57d8",
//     repair: "57d8",
//     installation: "f176",
//     replacement: "f176",
//     quote: "f176",
//     advice: "7f48",
//     parts: "4ce7"
//   }

//   // convert values
//   lead_data.property_type =
//     propertyMap[lead_data.property_type?.toLowerCase()] ||
//     lead_data.property_type

//   lead_data.system_type =
//     systemTypeMap[lead_data.system_type?.toLowerCase()] ||
//     lead_data.system_type

//   lead_data.system_location =
//     locationMap[lead_data.system_location?.toLowerCase()] ||
//     lead_data.system_location

//   lead_data.enquiry_type =
//     enquiryTypeMap[lead_data.enquiry_type?.toLowerCase()] ||
//     "f176"

//   if (!lead_data.enquiry) {
//     lead_data.enquiry = "Hot water system installation enquiry"
//   }

//   const payload = {
//     lead_data,
//     contact_data
//   }

//   const res = await fetch(
//     "https://jobs.suncityhotwater.com.au/api/leads/add",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization:
//           "Basic " +
//           Buffer.from(
//             process.env.CRM_USER + ":" + process.env.CRM_PASS
//           ).toString("base64")
//       },
//       body: JSON.stringify(payload)
//     }
//   )

//   const data = await res.json()

//   return NextResponse.json(data)
// }

/////V2
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const { lead_data, contact_data } = body;

//     const propertyMap: any = {
//       house: "8884",
//       unit: "1b54",
//       townhouse: "7b71",
//       commercial: "a0fe",
//     };

//     const systemTypeMap: any = {
//       electric: "c730",
//       gas: "412c",
//       solar: "8563",
//       "heat pump": "43c8",
//       "not sure": "bc1e",
//       none: "4577",
//     };

//     const locationMap: any = {
//       inside: "9603",
//       outside: "db09",
//       roof: "e4d8",
//       none: "a1f1",
//     };

//     const enquiryTypeMap: any = {
//       installation: "f176",
//       replacement: "f176",
//       quote: "f176",
//       repair: "57d8",
//       service: "57d8",
//       advice: "7f48",
//       parts: "4ce7",
//     };

//     // convert human values → CRM codes
//     lead_data.property_type =
//       propertyMap[lead_data.property_type?.toLowerCase()] ||
//       lead_data.property_type;

//     lead_data.system_type =
//       systemTypeMap[lead_data.system_type?.toLowerCase()] ||
//       lead_data.system_type;

//     lead_data.system_location =
//       locationMap[lead_data.system_location?.toLowerCase()] ||
//       lead_data.system_location;

//     lead_data.enquiry_type =
//       enquiryTypeMap[lead_data.enquiry_type?.toLowerCase()] || "f176";

//     if (!lead_data.enquiry) {
//       lead_data.enquiry = "Hot water system enquiry from AI assistant";
//     }

//     const payload = {
//       lead_data,
//       contact_data,
//     };

//     console.log("Sending to CRM:", payload);

//     const username = process.env.CMS_API_KEY;
//     const password = process.env.CMS_API_SECRET;

//     const auth = Buffer.from(`${username}:${password}`).toString("base64");

//     const res = await fetch(
//       "https://jobs.suncityhotwater.com.au/api/leads/add",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Basic ${auth}`,
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     const text = await res.text();

//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }

//     return NextResponse.json({
//       crm_status: res.status,
//       crm_response: data,
//     });
//   } catch (error) {
//     console.error("AI Lead Error:", error);

//     return NextResponse.json(
//       { error: "Middleware error", details: String(error) },
//       { status: 500 }
//     );
//   }
// }

/////////V3
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Incoming AI payload:", body);

    let { lead_data, contact_data } = body;

    if (!lead_data || !contact_data) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 }
      );
    }

    const clean = (v: any) =>
      typeof v === "string" ? v.trim().toLowerCase() : v;

    const propertyMap: any = {
      house: "8884",
      unit: "1b54",
      townhouse: "7b71",
      commercial: "a0fe",
    };

    const systemTypeMap: any = {
      electric: "c730",
      gas: "412c",
      solar: "8563",
      "heat pump": "43c8",
      "not sure": "bc1e",
      none: "4577",
    };

    const locationMap: any = {
      inside: "9603",
      outside: "db09",
      roof: "e4d8",
      none: "a1f1",
    };

    const enquiryTypeMap: any = {
      installation: "f176",
      replacement: "f176",
      quote: "f176",
      repair: "57d8",
      service: "57d8",
      advice: "7f48",
      parts: "4ce7",
    };

    /* -----------------------------
       SANITISE AI VALUES
    ------------------------------*/

    lead_data.property_type =
      propertyMap[clean(lead_data.property_type)] || "8884";

    lead_data.system_type =
      systemTypeMap[clean(lead_data.system_type)] || "c730";

    lead_data.system_location =
      locationMap[clean(lead_data.system_location)] || "9603";

    lead_data.enquiry_type =
      enquiryTypeMap[clean(lead_data.enquiry_type)] || "f176";

    if (!lead_data.enquiry) {
      lead_data.enquiry = "Hot water system enquiry from AI assistant";
    }

    if (lead_data.source_url) {
      lead_data.source_url = lead_data.source_url.trim();
    }

    if (!contact_data.email || contact_data.email === "") {
      delete contact_data.email;
    }

    const payload = {
      lead_data,
      contact_data,
    };

    console.log("Sending to CRM:", payload);

    /* -----------------------------
       ENV VARIABLES
    ------------------------------*/

    const username = process.env.CMS_API_KEY;
    const password = process.env.CMS_API_SECRET;

    console.log("ENV CHECK:", username ? "KEY OK" : "KEY MISSING");
    console.log("ENV CHECK:", password ? "SECRET OK" : "SECRET MISSING");

    if (!username || !password) {
      throw new Error("Missing CMS API credentials");
    }

    const auth = `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`;

    /* -----------------------------
       SEND TO CRM
    ------------------------------*/

    const res = await fetch(
      "https://jobs.suncityhotwater.com.au/api/leads/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await res.text();

    console.log("CRM Status:", res.status);
    console.log("CRM Response:", text);

    return NextResponse.json({
      crm_status: res.status,
      crm_response: text,
    });
  } catch (error) {
    console.error("AI Lead Error:", error);

    return NextResponse.json(
      {
        error: "Middleware error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}