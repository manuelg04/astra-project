import { ReactNode } from "react";

export default function SpaceGroupLayout({
  params,
  children,
}: {
  params: { brandId: string; groupId: string };
  children: ReactNode;
}) {
  return (
    <div className="flex-1">{children}</div>
  );
}