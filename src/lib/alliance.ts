/** 无序用户对标识，保证一对用户只有一条结盟关系记录。 */
export function makePairKey(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(":");
}
