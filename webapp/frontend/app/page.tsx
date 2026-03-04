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
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px 48px",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        {/* Left Column: Hero Text */}
        <section style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p className="text-label" style={{ marginBottom: "24px" }}>
            v1.0.0-alpha — In Development
          </p>

          <h1
            className="text-display"
            style={{ marginBottom: "28px", lineHeight: 1.1 }}
          >
            Focus without<br />the crash.
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: "40px",
            }}
          >
            Lowkey is a non-caffeinated energy drink built for developers, students,
            and creators who need sustained focus on their own terms.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link
              href="/shop"
              className="btn-primary"
              style={{
                padding: "12px 24px",
                fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                borderRadius: "8px",
              }}
            >
              Get a can
            </Link>
            <Link
              href="/changelog"
              className="btn-outline"
              style={{
                padding: "12px 24px",
                fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                borderRadius: "8px",
              }}
            >
              View formula
            </Link>
          </div>
        </section>

        {/* Right Column: 3D Can */}
        <section
          style={{
            width: "100%",
            aspectRatio: "1",
            minHeight: "300px",
            maxHeight: "600px",
          }}
        >
          <CanSceneWrapper minHeight="300px" />
        </section>
      </div>
    </div>
  );
}
