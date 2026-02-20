"use client";

import dynamic from "next/dynamic";

// Three.js can't run on the server — load only in the browser
const Beams = dynamic(() => import("./background"), { ssr: false });

export default function BackgroundBeams() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor:"black",
        pointerEvents: "none",
        opacity: 0.90,
      }}
    >
      <Beams
        beamWidth={2.2}
        beamHeight={18}
        beamNumber={10}
        lightColor="#E63946"   // accent red
        speed={5}
        noiseIntensity={1.6}
        scale={0.18}
        rotation={-20}         // slight diagonal tilt
      />
    </div>
  );
}
