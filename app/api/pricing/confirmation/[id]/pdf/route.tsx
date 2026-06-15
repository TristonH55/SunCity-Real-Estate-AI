export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import {
  Image,
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
  customerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 14,
    backgroundColor: "#f9f9f9",
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
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

//TEST NEW 
// ✅ Convert regionCode → regionId
const region = await prisma.region.findUnique({
  where: { code: confirmation.regionCode },
  select: { id: true },
});

  // Fetch system info
  const system = await prisma.system.findUnique({
    where: { id: confirmation.systemId },
    select: {
      brand: true,
      model: true,
      capacityLitres: true,
      tankMaterial: true,
    },
  });

  // ✅ GET EXTRAS WITH PRICE (ADD THIS HERE)
const extras = await prisma.extra.findMany({
  where: {
    id: {
      in: confirmation.extraIds ?? [],
    },
  },
  select: {
    name: true,
    prices: {
      where: {
        regionId: region?.id,
      },
      select: {
        price: true,
      },
    },
  },
});


  
  // Get customer snapshot (safe access)
  const customer = confirmation.customerSnapshot as
    | {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        suburb?: string;
        postcode?: string;
        propertyType?: string;
        existingSystemType?: string;
        systemLocation?: string;
      }
    | undefined;

  const money = (value: number | string | undefined) =>
    value ? Number(value).toLocaleString("en-AU", { minimumFractionDigits: 0 }) : "—";

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* <Text style={styles.heading}>
          SunCity Hot Water — Pricing Confirmation
        </Text> */}

        <View style={{ marginBottom: 10 }}>
        <Image
          src={`${process.env.NEXTAUTH_URL}/images/suncity-logo-transparient.jpg.png`}
          style={{ width: 150, marginBottom: 10 }}
        />
        <Text style={styles.heading}>
          SunCity Hot Water — Pricing Confirmation
        </Text>
    </View>

        {/* CUSTOMER DETAILS (NEW SECTION) */}
        <View style={styles.customerBox}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Customer & Property Details
          </Text>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Name:</Text>
            <Text>
              {customer?.firstName || "—"} {customer?.lastName || ""}
            </Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Email:</Text>
            <Text>{customer?.email || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Mobile:</Text>
            <Text>{customer?.phone || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Address:</Text>
            <Text>{customer?.address || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Suburb:</Text>
            <Text>{customer?.suburb || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Postcode:</Text>
            <Text>{customer?.postcode || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Property Type:</Text>
            <Text>{customer?.propertyType || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>Existing System:</Text>
            <Text>{customer?.existingSystemType || "—"}</Text>
          </View>

          <View style={styles.customerRow}>
            <Text style={styles.label}>System Location:</Text>
            <Text>{customer?.systemLocation || "—"}</Text>
          </View>
        </View>

        {/* SYSTEM INFO */}
        {system && (
          <View style={styles.systemBox}>
            {/* EXTRAS */}
{extras.length > 0 && (
  <View style={styles.systemBox}>
    <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
      Selected Extras
    </Text>

    {extras.map((extra, index) => (
      <View key={index} style={styles.row}>
        <Text>{extra.name}</Text>
        <Text>
          $
          {extra.prices?.[0]?.price
            ? extra.prices[0].price.toNumber()
            : 0}
        </Text>
      </View>
    ))}
  </View>
)}


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

        {/* CONFIRMATION INFO */}
        <View style={styles.section}>
          <Text>Confirmation ID: {confirmation.id}</Text>
          <Text>Region: {confirmation.regionCode}</Text>
          <Text>
            Date: {confirmation.createdAt.toISOString().slice(0, 10)}
          </Text>
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>System (ex-GST)</Text>
            <Text>${money(confirmation.basePriceExGst.toNumber())}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Extras (ex-GST)</Text>
            <Text>${money(confirmation.extrasTotalExGst.toNumber())}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Subtotal (ex-GST)</Text>
            <Text>${money(confirmation.subtotalExGst.toNumber())}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GST</Text>
            <Text>${money(confirmation.gst.toNumber())}</Text>
          </View>

          <View style={[styles.row, styles.total]}>
            <Text>Total (inc-GST)</Text>
            <Text>${money(confirmation.totalIncGst.toNumber())}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, color: "#666" }}>
          This pricing snapshot is locked for the selected hot water system.
          SunCity Hot Water — Contact us for installation or questions.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=SunCity-Pricing-${confirmation.id}.pdf`,
    },
  });
}