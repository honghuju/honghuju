/** 名片上展示的信任标识：仅表示已绑定手机，不暴露号码 */
export function PhoneVerifiedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
      已绑定手机
    </span>
  );
}
