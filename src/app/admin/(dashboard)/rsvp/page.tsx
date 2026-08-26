import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RsvpPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  const entries = await prisma.rsvpEntry.findMany({
    where: isAdmin ? {} : { project: { userId: session?.user.id } },
    include: { project: { select: { slug: true, name: true, couple: { select: { displayName: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-3xl italic text-ink">RSVP</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {isAdmin
          ? "Danh sách xác nhận tham dự từ tất cả dự án."
          : "Danh sách xác nhận tham dự cho dự án của bạn."}
      </p>

      <div className="mt-8 grid gap-3">
        {entries.map((e) => (
          <div key={e.id} className="card-flat flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="font-heading text-lg text-ink">{e.name}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {isAdmin && (
                  <>
                    {e.project.couple?.displayName ?? e.project.name} (/{e.project.slug}) ·{" "}
                  </>
                )}
                {e.phone && <>{e.phone} · </>}
                {e.guestCount} khách
                {e.message && <> · &ldquo;{e.message}&rdquo;</>}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${
                e.attending === "yes"
                  ? "bg-accent/15 text-accent"
                  : "bg-line text-ink-soft"
              }`}
            >
              {e.attending === "yes" ? "Sẽ tham dự" : "Không tham dự"}
            </span>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-ink-soft">Chưa có phản hồi RSVP nào.</p>
        )}
      </div>
    </div>
  );
}
