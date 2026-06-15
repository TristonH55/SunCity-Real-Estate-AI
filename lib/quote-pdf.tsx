import { prisma } from "@/lib/prisma";
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
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  logo: { width: 150, marginBottom: 8 },
  heading: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  box: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 12 },
  boxTitle: { fontWeight: "bold", marginBottom: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { fontWeight: "bold" },
  optionsRow: { flexDirection: "row", gap: 8 },
  optionCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
  },
  brand: { fontSize: 12, fontWeight: "bold", color: "#db231f", marginBottom: 2 },
  model: { marginBottom: 2 },
  meta: { color: "#555", marginBottom: 6 },
  breakRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    fontWeight: "bold",
  },
  footer: { marginTop: 18, fontSize: 8, color: "#666" },
});

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

/**
 * Renders the single homeowner-facing 3-option quote PDF.
 * Shared by the download route and the email route so both produce identical
 * output. Returns null if the quote doesn't exist. Performs NO auth — callers
 * must enforce agent ownership before exposing/sending the result.
 */
export async function renderQuotePdf(quoteId: string): Promise<
  | {
      buffer: Buffer;
      filename: string;
      quote: NonNullable<Awaited<ReturnType<typeof loadQuote>>>;
    }
  | null
> {
  const quote = await loadQuote(quoteId);
  if (!quote) return null;

  const extras = quote.extraIds.length
    ? await prisma.extra.findMany({
        where: { id: { in: quote.extraIds } },
        select: { name: true },
      })
    : [];

  const customer = (quote.customerSnapshot ?? {}) as Record<string, string>;
  const options = [...quote.options].sort(
    (a, b) => Number(a.totalIncGst) - Number(b.totalIncGst)
  );

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image
          src={`${process.env.NEXTAUTH_URL}/images/suncity-logo-transparient.jpg.png`}
          style={styles.logo}
        />
        <Text style={styles.heading}>
          SunCity Hot Water — Hot Water System Quote
        </Text>

        {/* Customer & property */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Customer &amp; Property</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Name</Text>
            <Text>
              {customer.firstName || "—"} {customer.lastName || ""}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Email</Text>
            <Text>{customer.email || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Mobile</Text>
            <Text>{customer.phone || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Address</Text>
            <Text>{customer.address || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Property type</Text>
            <Text>{customer.propertyType || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Existing system</Text>
            <Text>{customer.existingSystemType || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>System location</Text>
            <Text>{customer.systemLocation || "—"}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>System size / type</Text>
            <Text>
              {quote.capacityLitres} L · {quote.systemType.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Selected extras (shared across all options) */}
        {extras.length > 0 && (
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Selected extras</Text>
            {extras.map((e, i) => (
              <Text key={i}>• {e.name}</Text>
            ))}
          </View>
        )}

        {/* Options side-by-side (dynamic count: 1–3) */}
        <Text style={[styles.boxTitle, { marginBottom: 6 }]}>
          Your {options.length} option{options.length === 1 ? "" : "s"}
        </Text>
        <View style={styles.optionsRow}>
          {options.map((o) => (
            <View key={o.id} style={styles.optionCol}>
              <Text style={styles.brand}>{o.system.brand}</Text>
              <Text style={styles.model}>{o.system.model}</Text>
              <Text style={styles.meta}>
                {o.system.capacityLitres} L · warranty{" "}
                {o.system.warrantyPrimaryYears}
                {o.system.warrantySecondaryYears
                  ? ` + ${o.system.warrantySecondaryYears}`
                  : ""}{" "}
                yrs
              </Text>

              <View style={styles.breakRow}>
                <Text>Base (ex GST)</Text>
                <Text>{money(Number(o.basePriceExGst))}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text>Extras (ex GST)</Text>
                <Text>{money(Number(o.extrasTotalExGst))}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text>Subtotal (ex GST)</Text>
                <Text>{money(Number(o.subtotalExGst))}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text>GST</Text>
                <Text>{money(Number(o.gst))}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Total (inc GST)</Text>
                <Text>{money(Number(o.totalIncGst))}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Quote #{quote.id} · Generated{" "}
          {quote.createdAt.toISOString().slice(0, 10)} · SunCity Hot Water.
          Prices include GST where shown. Contact SunCity for installation.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    filename: `SunCity-Quote-${quote.id}.pdf`,
    quote,
  };
}

function loadQuote(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      options: {
        include: {
          system: {
            select: {
              brand: true,
              model: true,
              capacityLitres: true,
              warrantyPrimaryYears: true,
              warrantySecondaryYears: true,
            },
          },
        },
      },
    },
  });
}
