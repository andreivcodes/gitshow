"use client";

import { useMemo } from "react";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrbStyles(): React.CSSProperties {
  return {
    "--orb1-start-x": `${randomBetween(5, 30)}vw`,
    "--orb1-start-y": `${randomBetween(10, 40)}vh`,
    "--orb1-end-x": `${randomBetween(15, 45)}vw`,
    "--orb1-end-y": `${randomBetween(30, 60)}vh`,
    "--orb2-start-x": `${randomBetween(45, 75)}vw`,
    "--orb2-start-y": `${randomBetween(40, 70)}vh`,
    "--orb2-end-x": `${randomBetween(30, 60)}vw`,
    "--orb2-end-y": `${randomBetween(20, 50)}vh`,
    "--orb3-start-x": `${randomBetween(30, 60)}vw`,
    "--orb3-start-y": `${randomBetween(0, 20)}vh`,
    "--orb3-end-x": `${randomBetween(15, 45)}vw`,
    "--orb3-end-y": `${randomBetween(15, 40)}vh`,
    "--orb4-start-x": `${randomBetween(55, 85)}vw`,
    "--orb4-start-y": `${randomBetween(25, 50)}vh`,
    "--orb4-end-x": `${randomBetween(40, 70)}vw`,
    "--orb4-end-y": `${randomBetween(40, 65)}vh`,
    "--orb5-start-x": `${randomBetween(10, 35)}vw`,
    "--orb5-start-y": `${randomBetween(50, 75)}vh`,
    "--orb5-end-x": `${randomBetween(25, 55)}vw`,
    "--orb5-end-y": `${randomBetween(35, 60)}vh`,
    "--orb6-start-x": `${randomBetween(60, 90)}vw`,
    "--orb6-start-y": `${randomBetween(60, 85)}vh`,
    "--orb6-end-x": `${randomBetween(45, 70)}vw`,
    "--orb6-end-y": `${randomBetween(40, 65)}vh`,
  } as React.CSSProperties;
}

export function AnimatedOrbs() {
  // Generate random positions once on mount
  const styles = useMemo(() => generateOrbStyles(), []);

  return (
    <div className="orb-wrapper" style={styles}>
      <div className="orb orb-primary -z-10" aria-hidden="true" />
      <div className="orb orb-secondary -z-10" aria-hidden="true" />
      <div className="orb orb-tertiary -z-10" aria-hidden="true" />
    </div>
  );
}
