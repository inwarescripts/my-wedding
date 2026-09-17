"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { getAllRsvpEntries, getRsvpEntriesPage } from "./actions";
import { RSVP_PAGE_SIZE, type RsvpEntryItem } from "./rsvp-types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Quotes any field containing a comma, quote, or newline, doubling internal
// quotes — standard CSV escaping (RFC 4180).
function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function entriesToCsv(entries: RsvpEntryItem[]): string {
  const header = ["Họ và tên", "Số điện thoại", "Tham dự", "Số khách", "Lời nhắn", "Thời gian gửi"];
  const rows = entries.map((e) => [
    csvField(e.name),
    csvField(e.phone ?? ""),
    csvField(e.attending === "yes" ? "Tham dự" : "Không tham dự"),
    csvField(e.guestCount),
    csvField(e.message ?? ""),
    csvField(formatDate(e.createdAt)),
  ]);
  // Leading BOM so Excel (which guesses encoding from raw bytes, not the
  // Blob's declared charset) renders Vietnamese diacritics correctly
  // instead of mojibake.
  return "﻿" + [header, ...rows].map((r) => r.join(",")).join("\r\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
  const [exporting, setExporting] = useState(false);

  function load(nextPage: number) {
    startTransition(async () => {
      const res = await getRsvpEntriesPage(projectId, nextPage);
      setEntries(res.entries);
      setTotal(res.total);
      setPage(nextPage);
      setLoaded(true);
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const all = await getAllRsvpEntries(projectId);
      downloadCsv(`rsvp-${projectLabel}-${new Date().toISOString().slice(0, 10)}.csv`, entriesToCsv(all));
    } finally {
      setExporting(false);
    }
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
        {loaded && total > 0 && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="mb-4 w-full border border-line bg-line/40 px-3 py-2 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:bg-line/60 hover:text-ink disabled:opacity-50"
          >
            {exporting ? "Đang tải xuống..." : "Tải xuống CSV"}
          </button>
        )}

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
