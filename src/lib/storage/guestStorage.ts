const isBrowser = typeof window !== "undefined";

export function getGuestItem<T>(key: string): T | null {
  if (!isBrowser) {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setGuestItem<T>(key: string, value: T) {
  if (!isBrowser) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeGuestItem(key: string) {
  if (!isBrowser) {
    return;
  }
  window.localStorage.removeItem(key);
}
