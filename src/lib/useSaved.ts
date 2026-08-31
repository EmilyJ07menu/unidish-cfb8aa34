import { useCallback, useEffect, useState } from "react";

const KEY = "unidish:saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<(ids: string[]) => void>();

function write(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  listeners.forEach((l) => l(ids));
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const listener = (next: string[]) => setIds(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const save = useCallback((id: string) => {
    const next = read();
    if (!next.includes(id)) write([...next, id]);
    else write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  return { ids, save, remove, toggle };
}
