"use client";

import { Box } from "lucide-react";

export const EmptyTableInfo: React.FC<{
  title: React.ReactNode;
}> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-5">
      <Box width={60} height={60} color="#E58200A0" />
      <p className="text-16 text-center font-medium text-[#E58200A0]">{title}</p>
    </div>
  );
};
