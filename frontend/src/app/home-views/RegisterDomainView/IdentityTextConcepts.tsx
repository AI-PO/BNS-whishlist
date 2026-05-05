"use client";

import React, { useEffect, useState, useRef } from "react";

import { cn } from "@/lib/utils";

// 1. "Physical Gold" 3D Extrusion
export const Concept1_3DExtrusion = () => (
  <span 
    className="inline-block text-[#f7931a] relative"
    style={{
      textShadow: "1px 1px 0 #d97d10, 2px 2px 0 #cc720a, 3px 3px 0 #b36306, 4px 4px 0 #8c4c01, 6px 6px 12px rgba(247,147,26,0.4)",
      animation: "floating-3d 4s ease-in-out infinite"
    }}
  >
    identity
  </span>
);

// 2. Cryptographic "Decryption" Loop
export const Concept2_CryptoGlitch = () => {
  const [text, setText] = useState("identity");
  const original = "identity";
  const chars = "01abc89xf";
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const glitchCycle = () => {
      let iterations = 0;
      interval = setInterval(() => {
        setText(original.split("").map((_, index) => {
          if (index < iterations) return original[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(""));
        
        if (iterations >= original.length) {
          clearInterval(interval);
          setTimeout(glitchCycle, 4000); // Wait 4 seconds then glitch again
        }
        iterations += 1 / 3; // Controls decode speed
      }, 40);
    };
    
    setTimeout(glitchCycle, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block text-[#f7931a] relative">
      <span className="inline-block" style={{ animation: text !== original ? "text-glitch 0.2s linear infinite" : "none" }}>
        {text}
      </span>
    </span>
  );
};

// 3. Animated "Liquid Gold" Shimmer
export const Concept3_LiquidGold = () => {
  const [isShimmering, setIsShimmering] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const triggerShimmer = () => {
      setIsShimmering(true);
      // Play animation for 3 seconds
      timeoutId = setTimeout(() => {
        setIsShimmering(false);
        // Wait 5 seconds before next play (adjust this value for longer/shorter breaks)
        timeoutId = setTimeout(triggerShimmer, 5000);
      }, 3000);
    };

    // Handle the very first cycle
    timeoutId = setTimeout(() => {
      setIsShimmering(false);
      timeoutId = setTimeout(triggerShimmer, 5000);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <span 
      className="inline-block text-transparent bg-clip-text relative transition-all duration-700"
      style={{
        backgroundImage: isShimmering 
          ? "linear-gradient(90deg, #f7931a 0%, #f7931a 35%, #ffd700 50%, #f7931a 65%, #f7931a 100%)"
          : "linear-gradient(90deg, #f7931a 0%, #f7931a 100%)",
        backgroundSize: "300% auto",
        backgroundPosition: "0% center",
        WebkitBackgroundClip: "text",
        animation: isShimmering ? "shimmer-right-to-left 3s linear forwards" : "none",
        filter: "drop-shadow(0px 4px 15px rgba(247,147,26,0.35))"
      }}
    >
      identity
    </span>
  );
};

// 4. Interactive 3D Perspective
export const Concept4_Interactive3D = () => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!textRef.current) return;
      const rect = textRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      setRotation({
        x: -(distanceY / window.innerHeight) * 40,
        y: (distanceX / window.innerWidth) * 40
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <span 
      className="inline-block"
      style={{ perspective: "1000px" }}
    >
      <span 
        ref={textRef}
        className="inline-block text-[#f7931a] transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          textShadow: `${-rotation.y * 1}px ${rotation.x * 1 + 5}px 20px rgba(247,147,26,0.4)`
        }}
      >
        identity
      </span>
    </span>
  );
};

// 5. "Glass-Engraved" Refraction
export const Concept5_GlassEngraved = () => (
  <span 
    className="inline-block text-transparent relative"
    style={{
      WebkitTextStroke: "1px rgba(247,147,26, 0.85)",
      textShadow: "0px 10px 30px rgba(247,147,26, 0.6)",
      backgroundImage: "linear-gradient(to bottom, rgba(247,147,26,0.1), rgba(247,147,26,0.4))",
      WebkitBackgroundClip: "text",
    }}
  >
    identity
  </span>
);
