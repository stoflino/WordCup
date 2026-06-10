const STORAGE_KEY = 'wordcup_user';

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isMatchLocked(match) {
  const now = new Date();

  if (!match?.start_time) return true;

  return match.is_finished === true || now >= new Date(match.start_time);
}
