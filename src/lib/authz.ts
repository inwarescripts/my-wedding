import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") throw new Error("Forbidden");
  return session;
}

/** Admins can touch any project; everyone else must own it. Throws if
 * neither holds — use at the top of every project-scoped server action. */
export async function requireProjectAccess(projectId: string) {
  const session = await requireSession();
  if (session.user.role === "admin") return session;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!project || project.userId !== session.user.id) {
    throw new Error("Forbidden");
  }
  return session;
}
