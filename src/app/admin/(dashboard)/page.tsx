import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProject } from "./actions";
import { DeleteProjectButton } from "./DeleteProjectButton";
import Link from "next/link";

export default async function AdminHomePage() {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  const projects = await prisma.project.findMany({
    where: isAdmin ? {} : { userId: session?.user.id },
    include: { couple: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl italic text-ink">Dự án</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isAdmin
              ? "Quản lý toàn bộ website cưới trong hệ thống."
              : "Quản lý website cưới của bạn."}
          </p>
        </div>

        <form action={createProject} className="flex items-center gap-2">
          <input
            name="name"
            required
            placeholder="Tên dự án (VD: Minh & Linh)"
            className="border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-sm text-ink focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="whitespace-nowrap border border-ink bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-ivory transition-opacity hover:opacity-85"
          >
            + Tạo dự án
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="card-flat flex items-center justify-between gap-4 px-6 py-5"
          >
            <Link
              href={`/admin/projects/${p.id}/editor`}
              className="flex-1 transition-colors hover:text-accent"
            >
              <p className="font-heading text-xl text-ink">
                {p.couple?.displayName ?? p.name}
              </p>
              <p className="mt-1 text-sm text-ink-soft">/{p.slug}</p>
            </Link>
            <span
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${
                p.status === "published"
                  ? "bg-accent/15 text-accent"
                  : "bg-line text-ink-soft"
              }`}
            >
              {p.status === "published" ? "Đã xuất bản" : "Bản nháp"}
            </span>
            <DeleteProjectButton projectId={p.id} />
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-ink-soft">Chưa có dự án nào.</p>
        )}
      </div>
    </div>
  );
}
