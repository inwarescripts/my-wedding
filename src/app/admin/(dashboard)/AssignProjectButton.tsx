"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { assignProjectOwner, getAssignableUsers, type AssignableUser } from "./actions";

export function AssignProjectButton({
  projectId,
  currentUserId,
}: {
  projectId: string;
  currentUserId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [selected, setSelected] = useState<string | null>(currentUserId);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setSelected(currentUserId);
    setOpen(true);
    if (!loaded) {
      startTransition(async () => {
        setUsers(await getAssignableUsers());
        setLoaded(true);
      });
    }
  }

  function handleSave() {
    startTransition(async () => {
      await assignProjectOwner(projectId, selected);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Gán quyền sử dụng"
        className="whitespace-nowrap border border-line px-3 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Assign
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Gán quyền sử dụng">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Chọn user được toàn quyền xem &amp; chỉnh sửa dự án này. Chỉ 1 user sở
            hữu tại một thời điểm — gán cho user khác sẽ thay thế người hiện tại.
          </p>

          {isPending && !loaded && (
            <p className="text-sm text-ink-soft">Đang tải danh sách người dùng...</p>
          )}

          {loaded && (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              <label className="flex cursor-pointer items-center gap-3 border border-line px-3 py-2.5 transition-colors hover:border-ink">
                <input
                  type="radio"
                  name="assign-user"
                  checked={selected === null}
                  onChange={() => setSelected(null)}
                />
                <span className="text-sm text-ink-soft">Không gán (chỉ admin dùng được)</span>
              </label>
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-3 border border-line px-3 py-2.5 transition-colors hover:border-ink"
                >
                  <input
                    type="radio"
                    name="assign-user"
                    checked={selected === u.id}
                    onChange={() => setSelected(u.id)}
                  />
                  <span>
                    <span className="text-sm text-ink">{u.name}</span>{" "}
                    <span className="text-xs text-ink-soft">
                      @{u.username} · {u.role === "admin" ? "admin" : "người dùng"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border border-line px-4 py-2 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !loaded}
              className="border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-widest text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
