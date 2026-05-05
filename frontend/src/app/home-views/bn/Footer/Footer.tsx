import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Search a name", href: "#hero" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "How it works", href: "#how" },
      { label: "Premium names", href: "#premium" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Orobit protocol", href: "https://orobit.ai" },
      { label: "Contact", href: "mailto:hello@orobit.ai" },
      { label: "Privacy", href: "mailto:privacy@orobit.ai" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Quantum security", href: "#quantum" },
      { label: "Waitlist", href: "#waitlist" },
    ],
  },
];

export const Footer = () => (
  <footer className="bg-bn-bg text-bn-text border-t border-bn-border-subtle">
    <div className="mx-auto max-w-[1240px] px-5 lg:px-10 py-16 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center mb-4"
            aria-label="Bitcoin Names home"
          >
            <Image
              src="/navbar_logo_dark.svg"
              alt="Bitcoin Names"
              width={122}
              height={31}
              className="h-[38px] w-auto"
            />
          </Link>
          <p className="text-[13px] text-bn-text-muted max-w-[300px] leading-[1.55]">
            Bitcoin-native names, secured with hybrid Taproot and post-quantum
            cryptography. Built on the Orobit protocol.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-text-muted mb-4">
              {col.title}
            </h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-bn-text-2 hover:text-bn-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 pt-7 border-t border-bn-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-[12px] text-bn-text-muted">
          © {new Date().getFullYear()} Bitcoin Names · Operated by Dark Fusion
          Technologies Ltd.
        </p>
        <p className="inline-flex items-center gap-2 font-mono-bn text-[10px] uppercase tracking-[0.18em] text-bn-text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-bn-accent animate-ping opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-bn-accent" />
          </span>
          Live on Bitcoin mainnet
        </p>
      </div>
    </div>
  </footer>
);
