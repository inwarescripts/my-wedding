import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUser } from "./actions";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-3xl italic text-ink">Người dùng</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Quản lý tài khoản truy cập trang quản trị.
      </p>

      <form
        action={createUser}
        className="card-flat mt-8 flex flex-wrap items-end gap-4 px-6 py-5"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Tài khoản</span>
          <input
            name="username"
            required
            className="border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Mật khẩu</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Tên hiển thị</span>
          <input
            name="name"
            required
            className="border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Vai trò</span>
          <select
            name="role"
            defaultValue="editor"
            className="border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink focus:border-accent focus:outline-none"
          >
            <option value="editor">Người dùng</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="border border-ink bg-ink px-6 py-2.5 text-xs uppercase tracking-widest text-ivory transition-opacity hover:opacity-85"
        >
          + Tạo tài khoản
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="card-flat flex items-center justify-between gap-4 px-6 py-4"
          >
            <div>
              <p className="font-heading text-lg text-ink">
                {u.name}{" "}
                <span className="text-xs uppercase tracking-widest text-accent">
                  ({u.role === "admin" ? "admin" : "người dùng"})
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                @{u.username} · {u._count.projects} dự án
              </p>
            </div>
            <DeleteUserButton userId={u.id} disabled={u.id === session.user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
