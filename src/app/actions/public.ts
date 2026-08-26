"use server";

import { prisma } from "@/lib/prisma";

export type SubmitState = { success?: boolean; error?: string } | undefined;

export async function submitRsvp(
  projectId: string,
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const attending = formData.get("attending") === "no" ? "no" : "yes";
  const guestCount = Number(formData.get("guestCount") ?? 1) || 1;
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Vui lòng nhập họ tên." };

  await prisma.rsvpEntry.create({
    data: {
      projectId,
      name,
      phone: phone || null,
      attending,
      guestCount,
      message: message || null,
    },
  });

  return { success: true };
}

export async function getApprovedGuestbookMessages(projectId: string) {
  const entries = await prisma.guestbookEntry.findMany({
    where: { projectId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, name: true, message: true },
  });
  return entries;
}

export async function submitGuestbookMessage(
  projectId: string,
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) return { error: "Vui lòng nhập tên và lời chúc." };

  await prisma.guestbookEntry.create({
    data: { projectId, name, message, status: "pending" },
  });

  return { success: true };
}
