import type { Metadata } from "next";
import Link from "next/link";
import ExploreNodes from "@/components/shared/ExploreNodes";

export const metadata: Metadata = {
  title: "Lowkey",
  description:
    "Lowkey is a non-caffeinated energy drink engineered for sustained focus and chill productivity.",
};

export default function HomePage() {
  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "80px 24px 120px" }}>
      {/* Hero */}
      <section style={{ marginBottom: "96px" }}>
        <p className="text-label" style={{ marginBottom: "24px" }}>
          v1.0.0-alpha — In Development
        </p>

        <h1 className="text-display" style={{ marginBottom: "28px" }}>
          Focus without<br />the crash.
        </h1>

        <p style={{
          fontSize: "1rem",
          color: "var(--text-secondary)",
          maxWidth: "480px",
          lineHeight: 1.7,
          marginBottom: "40px",
        }}>
          Lowkey is a non-caffeinated energy drink built for developers, students,
          and creators who need sustained focus on their own terms.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/shop" className="btn-primary">Get a can</Link>
          <Link href="/changelog" className="btn-outline">View formula</Link>
        </div>
      </section>

      {/* Connected-node explore section */}
      <ExploreNodes />
    </div>
  );
}
