"use client";
import { useSyncExternalStore } from "react";

// Per-browser switch for demo conveniences. The server flag (DEMO_MODE) decides
// whether they exist at all; this only lets a visitor hide them for themselves.
const KEY = "demo-off";
const EVENT = "demo-local-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function read() {
  try {
    return localStorage.getItem(KEY) !== "1";
  } catch {
    return true;
  }
}

export function useLocalDemo(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, read, () => true);
  const set = (value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "0" : "1");
    } catch {
      // storage unavailable: ignore
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [on, set];
}
