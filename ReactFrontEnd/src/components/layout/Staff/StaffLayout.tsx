import { StaffHeader } from "./StaffHeader";
import { StaffFooter } from "./StaffFooter";
import { BackButton } from "@/components/ui/back-button";
import type { ReactNode } from "react";

interface StaffLayoutProps {
  children: ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  console.log("StaffLayout - Rendering");
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StaffHeader />
      <main className="flex-grow">
        {children}
      </main>
      <BackButton />
      <StaffFooter />
    </div>
  );
}