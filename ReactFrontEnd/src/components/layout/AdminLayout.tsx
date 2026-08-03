import { AdminHeader } from "./AdminHeader";
import { AdminFooter } from "./AdminFooter";
import { BackButton } from "@/components/ui/back-button";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-grow">
        {children}
      </main>
      <BackButton />
      <AdminFooter />
    </div>
  );
} 