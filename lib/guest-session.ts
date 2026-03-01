"use client";

const KEY = "guest-session-id";

export function getGuestSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(KEY);
  if (existing) {
    return existing;
  }

  const generated = crypto.randomUUID();
  localStorage.setItem(KEY, generated);
  document.cookie = `guest_session_id=${generated}; path=/; max-age=31536000; samesite=lax`;

  return generated;
}
