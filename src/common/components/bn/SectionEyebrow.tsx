import { cn } from "@/lib/utils";

type Props = {
  chapter: string;
  label: string;
  className?: string;
  tone?: "light" | "dark";
};

export const SectionEyebrow = ({
  chapter,
  label,
  className,
  tone = "light",
}: Props) => {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "bn-eyebrow inline-flex items-center gap-3",
        isDark ? "text-bn-text-muted" : "text-bn-ink-muted",
        className,
      )}
    >
      <span className="text-bn-accent">{chapter}</span>
      <span
        aria-hidden
        className={cn(
          "h-px w-8",
          isDark ? "bg-bn-border-mid" : "bg-bn-line-2",
        )}
      />
      <span>{label}</span>
    </div>
  );
};
