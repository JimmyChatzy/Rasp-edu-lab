import { requireUser } from "@/lib/strapi/guard";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";


export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/login");
  await requireUser();
  return <>{children}</>;
}