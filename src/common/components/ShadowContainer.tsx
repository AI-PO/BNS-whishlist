import { cn } from "@/lib/utils";

export const ShadowContainer: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[20px] transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};
