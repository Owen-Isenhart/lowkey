"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function QRScanner() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "scanning" | "found" | "no-camera" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualId, setManualId] = useState("");
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const scriptLoadedRef = useRef(false);

  // Load html5-qrcode script once
  useEffect(() => {
    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  async function startScan() {
    setStatus("loading");

    // Probe for camera access first — gives a friendlier error than html5-qrcode
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some((d) => d.kind === "videoinput");
      if (!hasCam) {
        setStatus("no-camera");
        return;
      }
      // Also try getting a stream to force permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop()); // release immediately
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("NotFound") || message.includes("DevicesNotFound")) {
        setStatus("no-camera");
      } else {
        setStatus("error");
        setErrorMsg(message.includes("Permission") ? "Camera permission denied." : `Camera error: ${message}`);
      }
      return;
    }

    // Load html5-qrcode if not yet loaded
    if (!scriptLoadedRef.current) {
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[data-id="html5-qrcode"]');
        if (existing) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
        s.dataset.id = "html5-qrcode";
        s.async = true;
        s.onload = () => { scriptLoadedRef.current = true; resolve(); };
        s.onerror = () => reject(new Error("Failed to load scanner library"));
        document.head.appendChild(s);
      }).catch((e) => {
        setStatus("error");
        setErrorMsg(e.message);
        return;
      });
    }

    // @ts-expect-error — window type augmented at runtime
    const { Html5QrcodeScanner } = window;
    if (!Html5QrcodeScanner) {
      setStatus("error");
      setErrorMsg("Scanner library unavailable.");
      return;
    }

    setStatus("scanning");

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        async (text: string) => {
          setStatus("found");
          await scanner.clear().catch(() => {});
          try {
            const url = new URL(text);
            router.push(url.pathname);
          } catch {
            router.push(`/batch/${text.trim()}`);
          }
        },
        (err: string) => {
          if (!err.includes("NotFoundException")) console.warn("QR:", err);
        }
      );
    }, 50);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = manualId.trim();
    if (id) router.push(`/batch/${id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Scan button */}
      {(status === "idle" || status === "no-camera" || status === "error") && (
        <button
          onClick={startScan}
          style={{
            padding: "14px 28px",
            background: "var(--accent)",
            color: "#0c0c0e",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
            width: "fit-content",
            transition: "opacity 200ms",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Open Camera
        </button>
      )}

      {status === "loading" && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Requesting camera access…</p>
      )}

      {status === "found" && (
        <p style={{ color: "var(--accent)", fontSize: "0.875rem" }}>QR code found — redirecting…</p>
      )}

      {status === "no-camera" && (
        <div style={{
          padding: "16px 20px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            No camera detected on this device.
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Enter the batch ID printed on the label below instead.
          </p>
        </div>
      )}

      {status === "error" && (
        <div style={{
          padding: "16px 20px",
          background: "var(--bg-elevated)",
          border: "1px solid #d46b6b44",
          borderRadius: "var(--radius-md)",
        }}>
          <p style={{ fontSize: "0.875rem", color: "#d46b6b" }}>{errorMsg}</p>
        </div>
      )}

      {/* html5-qrcode mount point */}
      {status === "scanning" && (
        <div
          id="qr-reader"
          style={{
            width: "100%",
            maxWidth: "360px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        />
      )}

      {/* Manual batch ID fallback */}
      <div>
        <p className="text-label" style={{ marginBottom: "12px" }}>Or enter batch ID</p>
        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px", maxWidth: "320px" }}>
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="e.g. LK-001"
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 180ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
          >
            Go
          </button>
        </form>
      </div>

      <style>{`
        #qr-reader { background: var(--bg-elevated) !important; color: var(--text-secondary) !important; }
        #qr-reader * { color: var(--text-secondary) !important; }
        #qr-reader video { border-radius: var(--radius-md); }
        #qr-reader__scan_region { border: none !important; }
        #qr-reader__scan_region img { display: none !important; }
        #qr-reader__dashboard_section_csr button {
          background: var(--bg-subtle) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          padding: 8px 16px !important;
          color: var(--text-secondary) !important;
          cursor: pointer !important;
          font-size: 0.8125rem !important;
          font-family: inherit !important;
        }
        #qr-reader__dashboard_section_swapLink {
          background: none !important; border: none !important;
          text-decoration: underline !important; text-underline-offset: 3px !important;
        }
        #qr-reader select {
          background: var(--bg-subtle) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-sm) !important;
          color: var(--text-secondary) !important;
          padding: 6px 10px !important;
          font-size: 0.8125rem !important;
        }
      `}</style>
    </div>
  );
}
