import { Document, Page, View, Text, StyleSheet, Svg, Path } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },

  // ── HEADER BANNER ──────────────────────────────────────────
  headerBanner: {
    backgroundColor: "#1D2D5F",
    paddingHorizontal: 48,
    paddingTop: 32,
    paddingBottom: 24,
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flexDirection: "column" },
  brandLabel: {
    fontSize: 9,
    color: "#8BA3D4",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  reportTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  reportMeta: { fontSize: 9, color: "#8BA3D4" },
  headerRight: { alignItems: "flex-end" },
  riskBadgeBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 90,
  },
  riskBadgeLabel: {
    fontSize: 8,
    color: "#1D2D5F",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  riskBadgeScore: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#1D2D5F",
  },
  riskBadgeSub: { fontSize: 8, color: "#666" },

  // ── CONTENT AREA ───────────────────────────────────────────
  contentArea: { paddingHorizontal: 48 },

  // ── GAUGE SECTION ──────────────────────────────────────────
  gaugeSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 4,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8ECF5",
  },
  gaugeSvgWrap: { marginRight: 24 },
  gaugeLegendWrap: { flexDirection: "column" },
  gaugeLegendTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1D2D5F",
    marginBottom: 8,
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 9, color: "#444" },

  // ── SECTION HEADERS ────────────────────────────────────────
  sectionBlock: { marginBottom: 28 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1D2D5F",
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1D2D5F",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionHeaderCount: {
    fontSize: 9,
    color: "#8BA3D4",
    fontFamily: "Helvetica-Bold",
    marginLeft: 8,
    marginTop: 2,
  },

  // ── SUMMARY BULLETS ────────────────────────────────────────
  summarySubheading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1D2D5F",
    marginBottom: 4,
    marginTop: 8,
  },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
  bulletDash: { fontSize: 10, color: "#8BA3D4", marginRight: 8, fontFamily: "Helvetica-Bold" },
  bulletText: { fontSize: 10, color: "#2C2C2C", lineHeight: 1.6, flex: 1 },

  // ── RISK CLAUSE CARDS ──────────────────────────────────────
  clauseCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8ECF5",
    borderRadius: 4,
    overflow: "hidden",
  },
  clauseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F8FC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF5",
  },
  clauseCardHeaderLeft: { flexDirection: "row", alignItems: "center" },
  clauseNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1D2D5F",
    marginRight: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  severityPillText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  riskTypePill: {
    fontSize: 8,
    color: "#555",
    marginLeft: 8,
    fontFamily: "Helvetica",
  },
  clauseBody: { padding: 14 },
  clauseSnippet: {
    fontSize: 10,
    color: "#2C2C2C",
    lineHeight: 1.6,
    marginBottom: 10,
    fontFamily: "Helvetica",
  },
  clauseQuoteBar: {
    width: 3,
    backgroundColor: "#E74C3C",
    marginRight: 10,
    borderRadius: 2,
  },
  clauseQuoteRow: { flexDirection: "row", marginBottom: 10 },
  suggestionBox: {
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#C3E6CB",
    borderRadius: 3,
    padding: 10,
  },
  suggestionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#27AE60",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  suggestionText: { fontSize: 9, color: "#2C2C2C", lineHeight: 1.5 },


  // ── FOOTER ─────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1D2D5F",
    paddingVertical: 10,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 8, color: "#8BA3D4" },
  footerBrand: { fontSize: 8, color: "#FFFFFF", fontFamily: "Helvetica-Bold" },

  // ── EMPTY STATE ────────────────────────────────────────────
  emptyText: { fontSize: 9, color: "#999", fontFamily: "Helvetica" },
});

function normalizeToSections(parsed) {
  if (!parsed) return [{ Summary: ["No data"] }];
  if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object" && !Array.isArray(parsed[0])) {
    return parsed.map(obj => {
      const out = {}; 
      for (const [k, v] of Object.entries(obj)) out[k] = Array.isArray(v) ? v.map(String) : [String(v)];
      return out;
    });
  }
  if (Array.isArray(parsed) && parsed.every(p => typeof p === "string")) return [{ Summary: parsed }];
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).map(([k, v]) => ({ [k]: Array.isArray(v) ? v.map(String) : [String(v)] }));
  }
  return [{ Summary: [String(parsed)] }];
}

export default function ReportDocument({ summary, title = "Docspect AI Report", riskScore = null, riskClauses = [] }) {
  const sections = normalizeToSections(summary);
  const score = Number.isFinite(riskScore) ? Math.max(0, Math.min(100, Math.round(riskScore))) : 56;

  function severityColor(severity) {
    if (severity === "High") return "#E74C3C";
    if (severity === "Medium") return "#F39C12";
    return "#2ECC71";
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg + 180) * Math.PI / 180.0;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER BANNER ── */}
        <View style={styles.headerBanner} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.brandLabel}>Docspect.AI</Text>
            <Text style={styles.reportTitle}>{title}</Text>
            <Text style={styles.reportMeta}>
              Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.riskBadgeBox, { borderLeftWidth: 4, borderLeftColor: severityColor(score >= 60 ? "High" : score >= 40 ? "Medium" : "Low") }]}>
              <Text style={styles.riskBadgeLabel}>Risk Score</Text>
              <Text style={[styles.riskBadgeScore, { color: severityColor(score >= 60 ? "High" : score >= 40 ? "Medium" : "Low") }]}>{score}</Text>
              <Text style={styles.riskBadgeSub}>out of 100</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentArea}>

          {/* ── GAUGE SECTION ── */}
          <View style={styles.gaugeSection}>
            <View style={styles.gaugeSvgWrap}>
              <Svg width={160} height={85} viewBox="0 0 180 100">
                {(() => {
                  const cx = 90, cy = 90, r = 70;
                  const segments = [
                    { from: 0, to: 20, color: "#2ECC71" },
                    { from: 20, to: 40, color: "#F1C40F" },
                    { from: 40, to: 60, color: "#F39C12" },
                    { from: 60, to: 80, color: "#E67E22" },
                    { from: 80, to: 100, color: "#E74C3C" },
                  ];
                  const gap = 2;
                  const segs = segments.map((s, i) => {
                    const a1 = 180 * (s.from / 100) + gap / 2;
                    const a2 = 180 * (s.to / 100) - gap / 2;
                    if (a2 > a1) {
                      return <Path key={i} d={describeArc(cx, cy, r, a1, a2)} stroke={s.color} strokeWidth={18} fill="none" strokeLinecap="round" />;
                    }
                    return null;
                  }).filter(Boolean);
                  const centerAngle = 180 * (score / 100);
                  const tip = polarToCartesian(cx, cy, r - 32, centerAngle);
                  return (
                    <>
                      {segs}
                      <Path d={`M ${cx} ${cy} L ${tip.x} ${tip.y}`} stroke="#1D2D5F" strokeWidth={5} strokeLinecap="round" fill="none" />
                      <Path d={`M ${cx-7} ${cy} a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0`} fill="#1D2D5F" />
                      <Path d={`M ${cx-3} ${cy} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`} fill="#fff" />
                    </>
                  );
                })()}
              </Svg>
            </View>
            <View style={styles.gaugeLegendWrap}>
              <Text style={styles.gaugeLegendTitle}>Document Risk Scale</Text>
              {[
                { color: "#2ECC71", label: "0–40   Generally safe" },
                { color: "#F39C12", label: "40–60  Use caution" },
                { color: "#E74C3C", label: "60–100 Needs review" },
              ].map((l, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── DOCUMENT SUMMARY ── */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>Document Summary</Text>
            </View>
            {sections.map((section, sidx) =>
              Object.entries(section).map(([heading, items], idx) => (
                <View key={`${sidx}-${idx}`}>
                  <Text style={styles.summarySubheading}>{heading}</Text>
                  {items.map((it, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bulletDash}>—</Text>
                      <Text style={styles.bulletText}>{String(it)}</Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          {/* ── RISK CLAUSES ── */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>Detected Risk Clauses</Text>
              <Text style={styles.sectionHeaderCount}>
                {riskClauses && riskClauses.length > 0 ? `${riskClauses.length} found` : "none"}
              </Text>
            </View>
            {riskClauses && riskClauses.length > 0 ? (
              riskClauses.map((clause, index) => (
                <View key={index} style={styles.clauseCard} wrap={false}>
                  <View style={styles.clauseCardHeader}>
                    <View style={styles.clauseCardHeaderLeft}>
                      <Text style={styles.clauseNumber}>Clause {index + 1}</Text>
                      <View style={[styles.severityPill, { backgroundColor: severityColor(clause.severity) }]}>
                        <Text style={styles.severityPillText}>{clause.severity || "—"}</Text>
                      </View>
                      <Text style={styles.riskTypePill}>{clause.risk_type || ""}</Text>
                    </View>
                  </View>
                  <View style={styles.clauseBody}>
                    <View style={styles.clauseQuoteRow}>
                      <View style={styles.clauseQuoteBar} />
                      <Text style={styles.clauseSnippet}>
                        {clause.clause_snippet || "No clause text available."}
                      </Text>
                    </View>
                    <View style={styles.suggestionBox}>
                      <Text style={styles.suggestionLabel}>AI Suggestion</Text>
                      <Text style={styles.suggestionText}>
                        {clause.ai_suggestion || "No suggestion available."}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No risk clauses detected.</Text>
            )}
          </View>

          

        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>Docspect.AI</Text>
          <Text style={styles.footerText}>Confidential · AI-generated · Verify before use</Text>
        </View>

      </Page>
    </Document>
  );
}
