"use client";

import dynamic from "next/dynamic";

const AnimatedOrbs = dynamic(() => import("./animated-orbs").then((m) => m.AnimatedOrbs), {
  ssr: false,
});

export function AnimatedOrbsWrapper() {
  return <AnimatedOrbs />;
}
