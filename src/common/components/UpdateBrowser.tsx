"use client";

import { Info, X } from "lucide-react";
import { useState, useEffect } from "react";

export const UpdateBrowser = () => {
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

    if (isSafari) {
      const match = userAgent.match(/Version\/(\d+)\.(\d*)/);
      if (match) {
        const majorVersion = parseInt(match[1], 10);
        const minorVersion = match[2] ? parseInt(match[2], 10) : 0;

        if (majorVersion < 16 || (majorVersion === 16 && minorVersion < 4)) {
          setShowUpdateMessage(true);
        }
      }
    }
  }, []);

  if (!showUpdateMessage) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        color: "#1B1735",
        background: "#ffc062db",
        padding: "16px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 2px 0 rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Info width={18} height={18} color="#1B1735" />
        <p style={{ margin: 0 }}>
          Your Safari browser is out of date. For the best experience, please
          update it to the latest version.
        </p>
      </div>
      <button
        onClick={() => setShowUpdateMessage(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ position: "absolute", left: "-9999px" }}>
          Close update message
        </span>
        <X width={24} height={24} color="#1B1735" />
      </button>
    </div>
  );
};
