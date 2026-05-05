import {
  TooltipProvider,
  Tooltip as RTooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

type Props = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  arrow?: boolean;
  delayDuration?: number;
  disabled?: boolean;
  triggerAsChild?: boolean;
};

export const Tooltip: React.FC<Props> = ({
  trigger,
  content,
  arrow = false,
  delayDuration = 300,
  disabled = false,
  triggerAsChild = false,
}) => {
  return (
    <TooltipProvider
      delayDuration={delayDuration}
      disableHoverableContent={disabled}
    >
      <RTooltip>
        <TooltipTrigger asChild={triggerAsChild}>{trigger}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          arrow={arrow}
          sideOffset={10}
          className="shadow-main rounded-[10px] border border-border bg-popover text-popover-primary p-4 text-16"
        >
          {content}
        </TooltipContent>
      </RTooltip>
    </TooltipProvider>
  );
};
