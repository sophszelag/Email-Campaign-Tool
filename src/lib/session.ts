import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/** Server Component / Server Action helper: get the signed-in user or bounce to /signin. */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/signin");
  }
  return session;
}
