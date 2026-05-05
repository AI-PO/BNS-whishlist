import { cn } from "@/lib/utils";

type Props = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export const Section: React.FC<Props> = ({
  label,
  children,
  className,
  contentClassName,
}) => {
  return (
    <section className={cn("flex flex-col gap-y-4", className)}>
      <h2 className="text-24 font-bold tracking-tight text-bn-ink">{label}</h2>
      <div
        className={cn(
          "relative w-full h-min overflow-hidden rounded-[24px] border border-white/75 bg-white/10 backdrop-blur-[2px]",
          "shadow-[0_14px_34px_rgba(10,10,10,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]",
          "transition-colors duration-300",
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/40 via-white/18 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90" />
        <div className="pointer-events-none absolute -top-12 -right-14 h-36 w-36 rounded-full bn-orange-glow-soft opacity-70" />
        <div
          className={cn(
            "relative rounded-[24px] p-5 sm:p-[30px]",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
};
