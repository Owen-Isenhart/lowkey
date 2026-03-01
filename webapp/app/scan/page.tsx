import type { Metadata } from "next";
import QRScanner from "@/components/shared/QRScanner";

export const metadata: Metadata = {
  title: "Scan a Bottle",
  description: "Scan the QR code on your Lowkey bottle to view its digital twin — batch info, pH, and sourcing data.",
};

export default function ScanPage() {
  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Digital Twin</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>Scan your bottle.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "48px", fontSize: "0.875rem", lineHeight: 1.7 }}>
        Point your camera at the QR code on the package label. You&apos;ll be taken to the batch record
        for that specific production run — mix date, pH level, and full ingredient sourcing.
      </p>
      <QRScanner />
    </div>
  );
}
