"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
  batchId: string;
  appUrl: string;
}

export default function BatchQRCode({ batchId, appUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${appUrl}/batch/${batchId}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 180,
      margin: 2,
      color: {
        dark:  "#f0f0f2",
        light: "#141416",
      },
    });
  }, [batchId, appUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
      <p className="text-label">Scan to access this batch</p>
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      />
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        /batch/{batchId}
      </p>
    </div>
  );
}
