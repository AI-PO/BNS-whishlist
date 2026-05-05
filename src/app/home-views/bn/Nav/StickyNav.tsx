"use client";

import {
  ArrowUpRight,
  Compass,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, m, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "How it works", href: "#how", icon: Compass, desc: "From name to on-chain identity" },
  { label: "Quantum", href: "#quantum", icon: ShieldCheck, desc: "Post-quantum ready by design" },
  { label: "Premium", href: "#premium", icon: Sparkle, desc: "Curated premium names" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export const StickyNav = () => {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.8)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <m.nav style={{ backgroundColor: bg }} className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl">
      <m.div style={{ opacity: borderOpacity }} aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-bn-line" />
      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10 flex items-center justify-between h-[68px]">
        <Link href="/" className="group inline-flex items-center" aria-label="Bitcoin Names home">
          <Image src="/navbar_logo.svg" alt="Bitcoin Names" width={122} height={31} priority className="h-[38px] w-auto transition-transform group-hover:-translate-y-0.5" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="text-[14px] font-medium text-bn-ink-2 hover:text-bn-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="#waitlist" className="inline-flex items-center bg-bn-ink text-white font-medium text-[13px] px-5 py-2.5 rounded-full hover:bg-black transition-colors">
            Reserve your name
          </Link>
        </div>

        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close" : "Open"} className="md:hidden relative inline-flex items-center justify-center w-10 h-10 rounded-full text-bn-ink hover:bg-bn-page-2 transition-colors">
          <span className="relative block w-5 h-4" aria-hidden>
            <m.span className="absolute left-0 right-0 top-1/2 block h-[2px] -mt-px rounded-full bg-current" animate={open ? { y: 0, rotate: 45 } : { y: -6, rotate: 0 }} transition={{ duration: 0.3 }} />
            <m.span className="absolute left-0 right-0 top-1/2 block h-[2px] -mt-px rounded-full bg-current" animate={open ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} />
            <m.span className="absolute left-0 right-0 top-1/2 block h-[2px] -mt-px rounded-full bg-current" animate={open ? { y: 0, rotate: -45 } : { y: 6, rotate: 0 }} transition={{ duration: 0.3 }} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <m.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="md:hidden fixed inset-x-0 top-[68px] bottom-0 bg-bn-ink/20 backdrop-blur-sm" aria-hidden />
            <m.div key="panel" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="md:hidden absolute top-full inset-x-0 bg-bn-page border-t border-bn-line shadow-[0_24px_48px_-24px_rgba(10,10,10,0.25)]">
              <div className="px-4 pt-3 pb-5 flex flex-col gap-1">
                {LINKS.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="group flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-bn-page-2 transition-colors">
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-bn-page-2 text-bn-ink-2 group-hover:bg-bn-accent-10 group-hover:text-bn-accent transition-colors">
                        <Icon size={18} weight="bold" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-semibold text-bn-ink">{l.label}</span>
                        <span className="block text-[12px] text-bn-ink-muted mt-0.5 truncate">{l.desc}</span>
                      </span>
                      <ArrowUpRight size={16} weight="bold" className="text-bn-ink-dim" />
                    </Link>
                  );
                })}
                <div className="mt-3 pt-4 border-t border-bn-line flex flex-col gap-2">
                  <Link href="#waitlist" onClick={() => setOpen(false)} className="inline-flex items-center justify-center bg-bn-ink text-white font-medium text-[14px] px-5 py-3.5 rounded-full hover:bg-black transition-all">
                    Reserve your name
                  </Link>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </m.nav>
  );
};
