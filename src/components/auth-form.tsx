"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/actions/auth";
import { ImeSafeForm } from "@/components/ime-safe-form";

type AuthFormProps = {
  mode: "login" | "register";
  next?: string;
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-muted/70 focus:border-blue-500";

export function AuthForm({ mode, next = "/" }: AuthFormProps) {
  const isRegister = mode === "register";
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    isRegister ? registerAction : loginAction,
    {}
  );

  return (
    <ImeSafeForm action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted">昵称</span>
        <input
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={20}
          autoComplete="username"
          placeholder="给自己起个花名"
          className={inputClass}
        />
      </label>

      {isRegister ? (
        <label className="flex flex-col gap-2">
          <span className="text-xs text-muted">手机号</span>
          <input
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            pattern="1[3-9][0-9]{9}"
            maxLength={11}
            autoComplete="tel"
            placeholder="用于绑定账号，11 位手机号"
            className={inputClass}
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted">密码</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder={isRegister ? "至少 6 位" : "输入密码"}
          className={inputClass}
        />
      </label>

      {isRegister ? (
        <label className="flex flex-col gap-2">
          <span className="text-xs text-muted">确认密码</span>
          <input
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="再输入一次"
            className={inputClass}
          />
        </label>
      ) : null}

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-500">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-xl bg-acid py-3 text-sm font-bold text-ink transition-opacity disabled:opacity-60"
      >
        {isPending ? "处理中…" : isRegister ? "注册并登录" : "登录"}
      </button>

      <p className="text-center text-xs text-muted">
        {isRegister ? (
          <>
            已有账号？
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="ml-1 text-acid"
            >
              去登录
            </Link>
          </>
        ) : (
          <>
            还没有账号？
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="ml-1 text-acid"
            >
              注册一个
            </Link>
          </>
        )}
      </p>
    </ImeSafeForm>
  );
}
