"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleLikeAction } from "@/actions/posts";

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  returnPath: string;
};

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isLoggedIn,
  returnPath,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(returnPath)}`);
      return;
    }
    if (isPending) return;

    const nextLiked = !liked;
    const previousLiked = liked;
    const previousCount = count;

    // 先更新界面，请求失败再回滚
    setLiked(nextLiked);
    setCount(Math.max(0, count + (nextLiked ? 1 : -1)));

    startTransition(async () => {
      const result = await toggleLikeAction(postId);
      if (result.ok) {
        setLiked(result.liked);
        setCount(result.count);
      } else {
        setLiked(previousLiked);
        setCount(previousCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "取消点赞" : "点赞"}
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
        liked
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-600"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
