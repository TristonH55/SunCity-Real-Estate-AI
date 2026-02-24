// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   pdf,
// } from "@react-pdf/renderer";

// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontSize: 11,
//     fontFamily: "Helvetica",
//   },
//   heading: {
//     fontSize: 18,
//     marginBottom: 20,
//     fontWeight: "bold",
//   },
//   section: {
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   label: {
//     fontWeight: "bold",
//   },
//   total: {
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     fontSize: 13,
//     fontWeight: "bold",
//   },
// });

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id: params.id },
//   });

//   if (!confirmation) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   const money = (value: unknown) =>
//     Number(value).toLocaleString("en-AU");

//   const doc = (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={styles.heading}>
//           SunCity Hot Water — Pricing Confirmation
//         </Text>

//         <View style={styles.section}>
//           <Text>Confirmation ID: {confirmation.id}</Text>
//           <Text>Region: {confirmation.regionCode}</Text>
//           <Text>
//             Date: {confirmation.createdAt.toISOString().slice(0, 10)}
//           </Text>
//         </View>

//         <View style={styles.section}>
//           <View style={styles.row}>
//             <Text style={styles.label}>System (ex-GST)</Text>
//             <Text>${money(confirmation.basePriceExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>Extras (ex-GST)</Text>
//             <Text>${money(confirmation.extrasTotalExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>Subtotal (ex-GST)</Text>
//             <Text>${money(confirmation.subtotalExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>GST</Text>
//             <Text>${money(confirmation.gst)}</Text>
//           </View>

//           <View style={[styles.row, styles.total]}>
//             <Text>Total (inc-GST)</Text>
//             <Text>${money(confirmation.totalIncGst)}</Text>
//           </View>
//         </View>

//         <Text>
//           This pricing snapshot is locked and valid for insurance processing.
//         </Text>
//       </Page>
//     </Document>
//   );

//   // ✅ SAFEST METHOD — no streams, no TS issues
//   const blob = await pdf(doc).toBlob();
//   const arrayBuffer = await blob.arrayBuffer();

//   return new NextResponse(arrayBuffer, {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=SunCity-Pricing-${confirmation.id}.pdf`,
//     },
//   });
// }

///////USE THIS ONE BELOW IT IS WORKING ///////////////
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   pdf,
// } from "@react-pdf/renderer";

// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontSize: 11,
//     fontFamily: "Helvetica",
//   },
//   heading: {
//     fontSize: 18,
//     marginBottom: 20,
//     fontWeight: "bold",
//   },
//   section: {
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   label: {
//     fontWeight: "bold",
//   },
//   total: {
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     fontSize: 13,
//     fontWeight: "bold",
//   },
// });

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // ✅ REQUIRED IN NEXT.JS 16
//   const { id } = await params;

//   if (!id) {
//     return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//   }

//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id },
//   });

//   if (!confirmation) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   const money = (value: unknown) =>
//     Number(value).toLocaleString("en-AU");

//   const doc = (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={styles.heading}>
//           SunCity Hot Water — Pricing Confirmation
//         </Text>

//         <View style={styles.section}>
//           <Text>Confirmation ID: {confirmation.id}</Text>
//           <Text>Region: {confirmation.regionCode}</Text>
//           <Text>
//             Date: {confirmation.createdAt.toISOString().slice(0, 10)}
//           </Text>
//         </View>

//         <View style={styles.section}>
//           <View style={styles.row}>
//             <Text style={styles.label}>System (ex-GST)</Text>
//             <Text>${money(confirmation.basePriceExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>Extras (ex-GST)</Text>
//             <Text>${money(confirmation.extrasTotalExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>Subtotal (ex-GST)</Text>
//             <Text>${money(confirmation.subtotalExGst)}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>GST</Text>
//             <Text>${money(confirmation.gst)}</Text>
//           </View>

//           <View style={[styles.row, styles.total]}>
//             <Text>Total (inc-GST)</Text>
//             <Text>${money(confirmation.totalIncGst)}</Text>
//           </View>
//         </View>

//         <Text>
//           This pricing snapshot is locked and valid for insurance processing.
//         </Text>
//       </Page>
//     </Document>
//   );

//   // ✅ FULLY TYPED + SUPPORTED
//   const blob = await pdf(doc).toBlob();
//   const arrayBuffer = await blob.arrayBuffer();

//   return new NextResponse(arrayBuffer, {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=SunCity-Pricing-${confirmation.id}.pdf`,
//     },
//   });
// }
////TEST ONLY
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  heading: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
  },
  total: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    fontSize: 13,
    fontWeight: "bold",
  },
  systemBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 14,
  },
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const confirmation = await prisma.pricingConfirmation.findUnique({
    where: { id },
  });

  if (!confirmation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 🔹 Fetch system info
  const system = await prisma.system.findUnique({
    where: { id: confirmation.systemId },
    select: {
      brand: true,
      model: true,
      capacityLitres: true,
      tankMaterial: true,
    },
  });

  const money = (value: number) =>
    value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>
          SunCity Hot Water — Pricing Confirmation
        </Text>

        {/* SYSTEM INFO */}
        {system && (
          <View style={styles.systemBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
              Selected Hot Water System
            </Text>
            <Text>Brand: {system.brand}</Text>
            <Text>Model: {system.model}</Text>
            <Text>Capacity: {system.capacityLitres}L</Text>
            <Text>
              Tank: {system.tankMaterial.replace("_", " ")}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text>Confirmation ID: {confirmation.id}</Text>
          <Text>Region: {confirmation.regionCode}</Text>
          <Text>
            Date: {confirmation.createdAt.toISOString().slice(0, 10)}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>System (ex-GST)</Text>
            <Text>
              ${money(confirmation.basePriceExGst.toNumber())}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Extras (ex-GST)</Text>
            <Text>
              ${money(confirmation.extrasTotalExGst.toNumber())}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Subtotal (ex-GST)</Text>
            <Text>
              ${money(confirmation.subtotalExGst.toNumber())}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GST</Text>
            <Text>${money(confirmation.gst.toNumber())}</Text>
          </View>

          <View style={[styles.row, styles.total]}>
            <Text>Total (inc-GST)</Text>
            <Text>
              ${money(confirmation.totalIncGst.toNumber())}
            </Text>
          </View>
        </View>

        <Text>
          This pricing snapshot is locked and valid for insurance processing.
        </Text>
      </Page>
    </Document>
  );

  // ✅ Correct Next.js 16 PDF response
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=SunCity-Pricing-${confirmation.id}.pdf`,
    },
  });
}