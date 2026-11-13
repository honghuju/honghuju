"use client";

import { useActionState, useRef, useState } from "react";
import { saveCardAction, type CardFormState } from "@/actions/cards";
import { ImeSafeForm } from "@/components/ime-safe-form";
import { CARD_TAG_OPTIONS, MAX_CARD_TAGS } from "@/lib/tags";

type CardFormValues = {
  tags: string[];
  canProvide: string;
  needHelp: string;
  wechat: string;
};

type CardFormProps = {
  defaultValues?: CardFormValues;
  isUpdate: boolean;
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-muted/70 focus:border-blue-500";

export function CardForm({ defaultValues, isUpdate }: CardFormProps) {
  const [state, formAction, isPending] = useActionState<CardFormState, FormData>(
    saveCardAction,
    {}
  );
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const customTagRef = useRef<HTMLInputElement>(null);

  const atLimit = tags.length >= MAX_CARD_TAGS;

  function toggleTag(tag: string) {
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((item) => item !== tag);
      if (prev.length >= MAX_CARD_TAGS) return prev;
      return [...prev, tag];
    });
  }

  function addCustomTag() {
    // 自定义标签输入框保持非受控，避免输入法组合期间被 React 重渲染打断
    const input = customTagRef.current;
    const tag = (input?.value ?? "").trim().slice(0, 12);
    if (!tag) return;
    if (!tags.includes(tag) && tags.length < MAX_CARD_TAGS) {
      setTags((prev) => [...prev, tag]);
    }
    if (input) input.value = "";
  }

  return (
    <ImeSafeForm action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-semibold">技能标签</label>
          <span className="text-[11px] text-muted">
            {tags.length} / {MAX_CARD_TAGS}
          </span>
        </div>
        <p className="-mt-1 text-xs text-muted">选择你最擅长的方向，方便别人搜到你。</p>

        <div className="flex flex-wrap gap-2">
          {CARD_TAG_OPTIONS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={selected}
                disabled={!selected && atLimit}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  selected
                    ? "border-acid bg-acid font-semibold text-ink"
                    : "border-gray-200 bg-white text-slate-500 disabled:opacity-40"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => !CARD_TAG_OPTIONS.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full border border-acid bg-acid px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {tag} ×
                </button>
              ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <input
            ref={customTagRef}
            onKeyDown={(event) => {
              // 输入法组合期间的回车只用于确认候选词，不添加标签
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTag();
              }
            }}
            maxLength={12}
            placeholder="自定义标签，回车添加"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustomTag}
            disabled={atLimit}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 text-xs text-muted disabled:opacity-40"
          >
            添加
          </button>
        </div>
      </section>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">我能提供什么</span>
        <textarea
          name="canProvide"
          required
          minLength={5}
          maxLength={500}
          rows={4}
          defaultValue={defaultValues?.canProvide}
          placeholder="例如：5 年前端，能独立做 React / 小程序，也可以帮忙看技术方案。"
          className={`${inputClass} resize-none leading-6`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">我正在寻找什么合伙人</span>
        <textarea
          name="needHelp"
          required
          minLength={5}
          maxLength={500}
          rows={4}
          defaultValue={defaultValues?.needHelp}
          placeholder="例如：想找一个懂后端或运营的合伙人，一起做独立产品。"
          className={`${inputClass} resize-none leading-6`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">微信号</span>
        <input
          name="wechat"
          type="text"
          required
          minLength={2}
          maxLength={50}
          defaultValue={defaultValues?.wechat}
          placeholder="填写你的微信号"
          className={inputClass}
        />
        <span className="text-[11px] text-muted">
          不会公开展示，只有双方结盟成功后才会互相可见。
        </span>
      </label>

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-500">
          {state.error}
        </p>
      ) : null}

      {state.submittedAt && !state.error ? (
        <p className="rounded-xl border border-acid/30 bg-acid/10 px-4 py-3 text-xs text-acid">
          已提交，等待管理员审核。
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-acid py-3 text-sm font-bold text-ink transition-opacity disabled:opacity-60"
      >
        {isPending ? "提交中…" : isUpdate ? "保存并重新提交审核" : "提交名片审核"}
      </button>
    </ImeSafeForm>
  );
}
