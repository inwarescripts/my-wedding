"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { getRsvpEntriesPage } from "./actions";
import { RSVP_PAGE_SIZE, type RsvpEntryItem } from "./rsvp-types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function RsvpDrawerButton({
  projectId,
  projectLabel,
}: {
  projectId: string;
  projectLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<RsvpEntryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  function load(nextPage: number) {
    startTransition(async () => {
      const res = await getRsvpEntriesPage(projectId, nextPage);
      setEntries(res.entries);
      setTotal(res.total);
      setPage(nextPage);
      setLoaded(true);
    });
  }

  function handleOpen(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    if (!loaded) load(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / RSVP_PAGE_SIZE));

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="whitespace-nowrap border border-line px-3 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        RSVP{loaded ? ` (${total})` : ""}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title={`RSVP — ${projectLabel}`}>
        {isPending && entries.length === 0 && (
          <p className="text-sm text-ink-soft">Đang tải...</p>
        )}
        {!isPending && loaded && entries.length === 0 && (
          <p className="text-sm text-ink-soft">Chưa có phản hồi RSVP nào.</p>
        )}

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="card-flat px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-base text-ink">{entry.name}</p>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs uppercase tracking-widest ${
                    entry.attending === "yes"
                      ? "bg-accent/15 text-accent"
                      : "bg-line text-ink-soft"
                  }`}
                >
                  {entry.attending === "yes" ? "Tham dự" : "Không tham dự"}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {entry.phone && <>{entry.phone} · </>}
                {entry.guestCount} khách · {formatDate(entry.createdAt)}
              </p>
              {entry.message && (
                <p className="mt-1.5 text-sm text-ink-soft">&ldquo;{entry.message}&rdquo;</p>
              )}
            </div>
          ))}
        </div>

        {total > RSVP_PAGE_SIZE && (
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => load(page - 1)}
              className="text-xs uppercase tracking-widest text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
            >
              ← Trước
            </button>
            <span className="text-xs text-ink-soft">
              Trang {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || isPending}
              onClick={() => load(page + 1)}
              className="text-xs uppercase tracking-widest text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
            >
              Sau →
            </button>
          </div>
        )}
      </Drawer>
    </>
  );
}
