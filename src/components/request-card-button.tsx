"use client";

import { useActionState, useState } from "react";
import {
  sendAllianceRequestAction,
  type RequestFormState,
} from "@/actions/alliance";
import { ImeSafeForm } from "@/components/ime-safe-form";

const initialState: RequestFormState = {};

export function RequestCardButton({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    sendAllianceRequestAction,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-acid px-5 py-3 text-sm font-bold text-ink transition-opacity hover:opacity-90"
      >
        发送结盟申请
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="发送结盟申请"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-5 pb-5 backdrop-blur-sm"
          onClick={() => {
            if (!pending) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">发送结盟申请</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                aria-label="关闭"
                className="text-lg leading-none text-muted hover:text-paper disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {state.success ? (
              <div className="mt-4">
                <p className="rounded-xl bg-acid/10 px-4 py-3 text-xs leading-6 text-acid">
                  申请已发送，等待对方同意。结盟成功后即可看到对方的微信号。
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full rounded-full border border-gray-200 px-5 py-2.5 text-xs text-muted hover:text-paper"
                >
                  知道了
                </button>
              </div>
            ) : (
              <ImeSafeForm action={formAction} className="mt-4">
                <input type="hidden" name="cardId" value={cardId} />
                <textarea
                  name="message"
                  required
                  minLength={2}
                  maxLength={200}
                  rows={4}
                  placeholder="简单介绍下你想怎么合作，比如：我有一个小程序项目，想找设计合伙人长期配合。"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-xs leading-6 text-slate-800 outline-none placeholder:text-muted/70 focus:border-blue-500"
                />
                <p className="mt-1.5 text-[10px] text-muted">
                  2-200 字，对方同意后双方才能看到微信号
                </p>

                {state.error ? (
                  <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {state.error}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs text-muted hover:text-paper disabled:opacity-40"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-full bg-acid py-2.5 text-xs font-bold text-ink disabled:opacity-60"
                  >
                    {pending ? "发送中…" : "发送申请"}
                  </button>
                </div>
              </ImeSafeForm>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
