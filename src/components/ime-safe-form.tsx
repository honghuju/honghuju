"use client";

import type { ComponentProps, KeyboardEvent } from "react";

/**
 * 输入法（IME）兼容表单。
 *
 * 中文输入法用 Enter 确认候选词时，浏览器会把这次按键当作「提交表单」，
 * 导致候选词还没上屏页面就跳走，表现为「只能打拼音、打不出汉字」。
 * 这里在组合输入（isComposing / keyCode 229）期间拦截 Enter，
 * 让确认候选词的按键只交给输入法处理。
 */
export function ImeSafeForm({
  onKeyDown,
  ...props
}: ComponentProps<"form">) {
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const nativeEvent = event.nativeEvent;
    if (
      event.key === "Enter" &&
      (nativeEvent.isComposing || nativeEvent.keyCode === 229)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return <form {...props} onKeyDown={handleKeyDown} />;
}
