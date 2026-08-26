"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function createUser(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = formData.get("role") === "admin" ? "admin" : "editor";

  if (!username || !password || !name) {
    throw new Error("Vui lòng nhập đủ tài khoản, mật khẩu và tên hiển thị");
  }
  if (password.length < 6) {
    throw new Error("Mật khẩu cần ít nhất 6 ký tự");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, name, role, passwordHash },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();
  if (session.user.id === userId) {
    throw new Error("Không thể tự xoá tài khoản đang đăng nhập");
  }
  // Their projects aren't deleted — Project.userId just goes back to null
  // (onDelete: SetNull), so the sites keep existing as unowned/admin-visible.
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
