"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="font-script text-4xl text-accent">Wedding Studio</p>
        <p className="mt-1 text-xs tracking-[0.3em] uppercase text-ink-soft">
          Admin
        </p>
      </div>

      <form action={formAction} className="card-flat space-y-5 px-8 py-10">
        <div>
          <label className="mb-1.5 block text-xs tracking-[0.2em] uppercase text-ink-soft">
            Tài khoản
          </label>
          <input
            name="username"
            required
            autoFocus
            autoComplete="username"
            className="w-full border-0 border-b border-line bg-transparent px-1 py-2.5 font-serif text-lg text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs tracking-[0.2em] uppercase text-ink-soft">
            Mật khẩu
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border-0 border-b border-line bg-transparent px-1 py-2.5 font-serif text-lg text-ink focus:border-accent focus:outline-none"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-ink bg-ink py-3.5 text-sm tracking-[0.2em] uppercase text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
