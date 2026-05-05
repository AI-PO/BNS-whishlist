import { Size } from "@/common/types/generic";
import { cn } from "@/lib/utils";

type ButtonProps = {
  size: Size.S | Size.M;
  variant: "primary" | "secondary" | "cta";
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  size,
  variant,
  children,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={cn(
        "button",
        {
          "button-primary bg-[#000]": variant === "primary",
          "button-secondary": variant === "secondary",
          "button-cta": variant === "cta",
          "button-size-m": size === "M",
        },
        className
      )}
    >
      {children}
    </button>
  );
};
