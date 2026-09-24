import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER",
    companyId: user.companyId,
    companyName: user.company?.name || null,
    phone: user.phone,
    department: user.department,
  };

  return <AppShell user={sessionUser}>{children}</AppShell>;
}
