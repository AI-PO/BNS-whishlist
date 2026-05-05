export const SkeletonBox: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-200 rounded-[5px] ${className}`}
    />
  );
};
