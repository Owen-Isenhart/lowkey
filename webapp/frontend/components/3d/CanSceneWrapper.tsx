"use client";

import dynamic from "next/dynamic";

const CanScene = dynamic(() => import("./CanScene"), { ssr: false });

export default function CanSceneWrapper() {
  return <CanScene />;
}
