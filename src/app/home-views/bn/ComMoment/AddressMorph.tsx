"use client";

import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";

const EXTENSIONS = [".btc", ".site", ".nft", ".wallet"];

export const AddressMorph = () => {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [extIndex, setExtIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (stage !== 2) return;
    const id = setInterval(() => {
      setExtIndex((i) => (i + 1) % EXTENSIONS.length);
    }, 1800);
    return () => clearInterval(id);
  }, [stage]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 min-h-[160px]">
      <div className="font-mono-bn text-[10px] uppercase tracking-[0.18em] text-bn-text-dim">
        Before
      </div>
      <code className="font-mono-bn text-bn-text-muted text-[12px] md:text-[13px] tracking-[0.05em] break-all text-center max-w-full">
        bc1q9xj7fkn3d4sr8kvsk8t5u2qmaw9n4rk8a2p7z
      </code>

      <m.div
        animate={{
          opacity: stage === 0 ? 0.2 : 1,
          y: stage === 0 ? 6 : 0,
        }}
        transition={{ duration: 0.4 }}
        className="text-bn-text-dim"
      >
        <ArrowDown weight="bold" size={14} />
      </m.div>

      <div className="font-mono-bn text-[10px] uppercase tracking-[0.18em] text-bn-text-dim">
        After
      </div>

      <AnimatePresence mode="wait">
        {stage < 2 ? (
          <m.span
            key="name"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: stage >= 1 ? 1 : 0.2, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-bn-text text-[26px] md:text-[34px] leading-none font-medium tracking-tight"
          >
            @yourname
          </m.span>
        ) : (
          <m.span
            key="ext"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex items-baseline text-[26px] md:text-[34px] leading-none font-medium tracking-tight"
          >
            <span className="text-bn-text">@yourname</span>
            <AnimatePresence mode="wait">
              <m.span
                key={EXTENSIONS[extIndex]}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="text-bn-accent ml-0.5"
              >
                {EXTENSIONS[extIndex]}
              </m.span>
            </AnimatePresence>
          </m.span>
        )}
      </AnimatePresence>
    </div>
  );
};
