import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dự án" },
  { href: "/admin/rsvp", label: "RSVP" },
  { href: "/admin/users", label: "Người dùng", adminOnly: true },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Any authenticated account (admin or regular user) may enter the
  // dashboard now — what they see inside is scoped by role, not gated at
  // the door like it was when this admin area only supported one role.
  if (!session) {
    redirect("/admin/login");
  }

  const isAdmin = session.user.role === "admin";
  const visibleNav = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-ivory-deep">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-line bg-ivory">
        <Link href="/admin" className="px-6 py-6 font-script text-2xl text-accent">
          Wedding Studio
        </Link>
        <nav className="flex flex-col gap-1 px-3">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ivory-deep hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-line bg-ivory px-6 py-4 md:px-10">
          <span className="text-sm text-ink-soft">
            {session.user.name}{" "}
            <span className="text-xs uppercase text-accent">
              ({session.user.role === "admin" ? "admin" : "người dùng"})
            </span>
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="border border-ink px-4 py-1.5 text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              Đăng xuất
            </button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 md:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
