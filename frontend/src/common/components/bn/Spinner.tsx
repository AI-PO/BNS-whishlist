import { CircleNotch } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
  color?: string;
};

export const Spinner = ({ size = 20, className, color }: Props) => (
  <CircleNotch
    size={size}
    weight="bold"
    className={cn("animate-spin", className)}
    style={color ? { color } : undefined}
  />
);
