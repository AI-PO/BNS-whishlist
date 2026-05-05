"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useEffect, useState } from "react";

/**
 * Fallback radial gradient that matches the live shader colors
 * (#ff5005 / #dbba95 / #d0bce1). Rendered as a static CSS layer so the
 * section is never empty while the WebGL canvas boots or repaints on
 * re-entry into the viewport.
 */
const FALLBACK_GRADIENT =
  "radial-gradient(60% 70% at 25% 55%, rgba(255, 80, 5, 0.9) 0%, rgba(255, 80, 5, 0) 60%)," +
  "radial-gradient(55% 65% at 70% 65%, rgba(219, 186, 149, 0.8) 0%, rgba(219, 186, 149, 0) 70%)," +
  "radial-gradient(55% 65% at 85% 30%, rgba(208, 188, 225, 0.65) 0%, rgba(208, 188, 225, 0) 70%)," +
  "linear-gradient(135deg, #2a1810 0%, #1a0d08 100%)";

export const ShaderBackground = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give the canvas one paint to upload shaders before we fade it in.
    const id = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      {/* Always-present CSS fallback so the section never appears empty */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: FALLBACK_GRADIENT }}
      />

      {/* Live shader canvas fades in smoothly on top of the fallback */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <ShaderGradientCanvas
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transform: "scale(1.35)",
            transformOrigin: "center center",
          }}
          pixelDensity={1}
        >
          <ShaderGradient
            animate="on"
            type="plane"
            color1="#ff5005"
            color2="#dbba95"
            color3="#d0bce1"
            brightness={1.2}
            envPreset="city"
            lightType="3d"
            grain="on"
            reflection={0.1}
            cDistance={2.6}
            cAzimuthAngle={180}
            cPolarAngle={90}
            cameraZoom={1.2}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            uAmplitude={1}
            uDensity={1.3}
            uFrequency={5.5}
            uSpeed={0.4}
            uStrength={4}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>
    </>
  );
};

export default ShaderBackground;
