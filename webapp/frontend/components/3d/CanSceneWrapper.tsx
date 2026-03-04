"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CanScene = dynamic(() => import("./CanScene"), { ssr: false });

interface CanSceneWrapperProps {
  containerClassName?: string;
  minHeight?: string;
}

export default function CanSceneWrapper({
  containerClassName = "",
  minHeight = "400px",
}: CanSceneWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || window.innerWidth,
          height: Math.max(clientHeight || 400, parseInt(minHeight) || 400),
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Update on window resize with debouncing
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [minHeight]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{
        width: "100%",
        height: "100%",
        minHeight,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {dimensions.width > 0 && <CanScene {...dimensions} />}
    </div>
  );
}
