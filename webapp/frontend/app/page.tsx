import type { Metadata } from "next";
import Link from "next/link";
import CanSceneWrapper from "@/components/3d/CanSceneWrapper";

export const metadata: Metadata = {
  title: "Lowkey",
  description:
    "Lowkey is a non-caffeinated energy drink engineered for sustained focus and chill productivity.",
};

export default function HomePage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px 120px" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "48px",
        alignItems: "center",
        minHeight: "60vh"
      }}>
        {/* Left Column: Hero Text */}
        <section>
          <p className="text-label" style={{ marginBottom: "24px" }}>
            v1.0.0-alpha — In Development
          </p>

          <h1 className="text-display" style={{ marginBottom: "28px" }}>
            Focus without<br />the crash.
          </h1>

          <p style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: "480px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}>
            Lowkey is a non-caffeinated energy drink built for developers, students,
            and creators who need sustained focus on their own terms.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/shop" className="btn-primary" style={{ padding: "12px 24px", fontSize: "1.125rem", borderRadius: "8px" }}>Get a can</Link>
            <Link href="/changelog" className="btn-outline" style={{ padding: "12px 24px", fontSize: "1.125rem", borderRadius: "8px" }}>View formula</Link>
          </div>
        </section>

        {/* Right Column: 3D Can element */}
        <section style={{ height: "600px", position: "relative" }}>
          <CanSceneWrapper />
        </section>
      </div>
    </div>
  );
}
