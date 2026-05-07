import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AppChrome from "@/components/app-chrome";
import { isAuthenticated } from "@/lib/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <>
      <AppChrome />
      {children}
    </>
  );
}
