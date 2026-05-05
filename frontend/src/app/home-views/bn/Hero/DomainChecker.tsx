"use client";

import {
  ArrowRight,
  CircleNotch,
  CurrencyBtc,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useDebounce } from "react-use";

import {
  isDomainAvailable,
  isDomainAvailableOnMarketplace,
} from "@/app/actions/domains";
import { cn } from "@/lib/utils";

type CheckState =
  | { kind: "idle" }
  | { kind: "invalid"; reason: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken"; marketplaceContractId?: string };

const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
const PLACEHOLDERS = ["yourname", "satoshi", "vault", "miner", "lightning"];

const normalize = (value: string) =>
  value.toLowerCase().replace(/\.btc$/, "").trim();

const validate = (value: string): string | null => {
  if (!value) return null;
  if (value.length < 3) return "Names must be at least 3 characters.";
  if (value.length > 63) return "Names must be at most 63 characters.";
  if (!DOMAIN_REGEX.test(value)) return "Use a-z, 0-9, and hyphens only.";
  return null;
};

export type DomainCheckerHandle = {
  focus: () => void;
  setValue: (value: string) => void;
};

export const DomainChecker = forwardRef<DomainCheckerHandle>((_props, ref) => {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [state, setState] = useState<CheckState>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: (value: string) => {
      setRaw(value);
      inputRef.current?.focus();
    },
  }));

  const runCheck = useCallback(async (value: string) => {
    const clean = normalize(value);
    if (!clean) {
      setState({ kind: "idle" });
      return;
    }
    const invalid = validate(clean);
    if (invalid) {
      setState({ kind: "invalid", reason: invalid });
      return;
    }
    setState({ kind: "checking" });
    try {
      const available = await isDomainAvailable(clean);
      if (available) {
        setState({ kind: "available" });
        return;
      }
      const contractId = await isDomainAvailableOnMarketplace(clean);
      setState({ kind: "taken", marketplaceContractId: contractId });
    } catch {
      setState({ kind: "idle" });
    }
  }, []);

  useDebounce(() => void runCheck(raw), 300, [raw]);

  // Cycling typewriter placeholder (only when empty + not focused)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (raw || isFocused) return;
    let cancelled = false;
    let idx = 0;
    let typed = PLACEHOLDERS[0];

    const tick = async () => {
      while (!cancelled) {
        await wait(2200);
        if (cancelled) return;
        const current = PLACEHOLDERS[idx];
        for (let i = current.length; i >= 0; i--) {
          if (cancelled) return;
          typed = current.slice(0, i);
          setPlaceholder(typed);
          await wait(40);
        }
        idx = (idx + 1) % PLACEHOLDERS.length;
        const next = PLACEHOLDERS[idx];
        for (let i = 1; i <= next.length; i++) {
          if (cancelled) return;
          typed = next.slice(0, i);
          setPlaceholder(typed);
          await wait(70);
        }
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [raw, isFocused]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // void runCheck(raw);
    if (state.kind === "available") {
      router.push(`/register/${normalize(raw)}.btc`);
    } else if (state.kind === "taken" && state.marketplaceContractId) {
      router.push("/marketplace");
    }
  };

  const clean = normalize(raw);
  const fullName = clean ? `${clean}.btc` : "";

  const isAvailable = state.kind === "available";
  const isError = state.kind === "invalid";

  const wrapClass = cn(
    "group relative flex items-stretch rounded-2xl border bg-white transition-all overflow-hidden",
    "shadow-[0_1px_2px_rgba(10,10,10,0.04),0_12px_36px_-16px_rgba(10,10,10,0.18)]",
    isAvailable
      ? "border-bn-accent ring-4 ring-bn-accent/15"
      : isError
        ? "border-[rgba(204,68,102,0.6)]"
        : "border-bn-line-2 focus-within:border-bn-ink focus-within:ring-4 focus-within:ring-bn-ink/8 hover:border-bn-ink/40",
  );

  return (
    <form
      onSubmit={onSubmit}
      className="w-full"
      aria-label="Check a .btc name"
    >
      <div className={wrapClass}>
        <span className="hidden sm:flex items-center pl-5 text-bn-accent">
          <CurrencyBtc weight="bold" size={20} />
        </span>
        <div className="relative flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || "\u00A0"}
            className="w-full bg-transparent px-4 sm:px-5 py-4 sm:py-5 text-[17px] sm:text-[20px] leading-[1.2] text-bn-ink placeholder-bn-ink-dim focus:outline-none min-w-0"
            aria-label="Name"
          />
          <span className="font-mono-bn text-[13px] sm:text-[14px] text-bn-ink-muted pr-2 sm:pr-3 select-none">
            .btc
          </span>
        </div>
        <button
          type="submit"
          disabled={state.kind === "checking" || !clean}
          className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-7 m-1.5 rounded-lg sm:rounded-xl font-medium text-[13px] sm:text-[14px] bg-bn-ink text-white hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state.kind === "checking" ? (
            <CircleNotch weight="bold" size={16} className="animate-spin" />
          ) : isAvailable ? (
            <>
              Claim
              <ArrowRight weight="bold" size={14} />
            </>
          ) : (
            <>
              Check
              <ArrowRight weight="bold" size={14} />
            </>
          )}
        </button>
      </div>

      <Status state={state} fullName={fullName} />
    </form>
  );
});

DomainChecker.displayName = "DomainChecker";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Status = ({
  state,
  fullName,
}: {
  state: CheckState;
  fullName: string;
}) => {
  if (state.kind === "idle") {
    return (
      <p className="mt-3 text-[13px] text-bn-ink-muted min-h-[20px] pl-1">
        3–63 characters · letters, numbers, hyphens
      </p>
    );
  }

  if (state.kind === "invalid") {
    return (
      <p className="mt-3 text-[13px] text-bn-danger flex items-center gap-2 min-h-[20px] pl-1">
        <WarningCircle weight="fill" size={14} />
        {state.reason}
      </p>
    );
  }

  if (state.kind === "checking") {
    return (
      <p className="mt-3 text-[13px] text-bn-ink-muted flex items-center gap-2 min-h-[20px] pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-bn-ink-muted animate-pulse" />
        Checking on Bitcoin...
      </p>
    );
  }

  if (state.kind === "available") {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 min-h-[20px] pl-1">
        <span className="text-[13px] text-bn-ink flex items-center gap-2">
          <span className="relative inline-flex">
            <span className="w-2 h-2 rounded-full bg-bn-accent bn-pulse-ring" />
          </span>
          <span className="font-mono-bn text-bn-accent">{fullName}</span>
          <span className="text-bn-ink-muted">is available</span>
        </span>
        <Link
          href={`/register/${fullName}`}
          className="text-[13px] font-medium text-bn-accent hover:text-bn-accent-hover inline-flex items-center gap-1"
        >
          Claim it
          <ArrowRight weight="bold" size={12} />
        </Link>
      </div>
    );
  }

  const listingHref = state.marketplaceContractId
    ? `/marketplace/${state.marketplaceContractId}`
    : null;

  return (
    <div className="mt-3 flex items-center justify-between gap-3 min-h-[20px] pl-1">
      <span className="text-[13px] text-bn-ink-muted flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-bn-ink-dim" />
        <span className="font-mono-bn text-bn-ink-2">{fullName}</span>
        <span>is taken</span>
      </span>
      {listingHref ? (
        <Link
          href={listingHref}
          className="text-[13px] font-medium text-bn-ink hover:text-bn-accent inline-flex items-center gap-1"
        >
          View on marketplace
          <ArrowRight weight="bold" size={12} />
        </Link>
      ) : null}
    </div>
  );
};
