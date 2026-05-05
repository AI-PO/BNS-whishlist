export const Subsection: React.FC<{
  label: string | React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="flex flex-col gap-y-3">
      <h3 className="text-16 font-medium text-neutral-400">{label}</h3>
      <div>{children}</div>
    </div>
  );
};
