export const BONUS_DEADLINE = new Date('2026-06-11T21:00:00');

export function isBonusLocked() {
  return new Date() >= BONUS_DEADLINE;
}
