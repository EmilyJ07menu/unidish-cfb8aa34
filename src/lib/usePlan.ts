import { useCallback, useEffect, useState } from "react";

const KEY = "unidish:plan";

export type Plan = Record<string, string[]>;

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function read(): Plan {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Plan) : {};
  } catch {
    return {};
  }
}

const listeners = new Set<(plan: Plan) => void>();

function write(plan: Plan) {
  window.localStorage.setItem(KEY, JSON.stringify(plan));
  listeners.forEach((l) => l(plan));
}

export function usePlan() {
  const [plan, setPlan] = useState<Plan>({});

  useEffect(() => {
    setPlan(read());
    const listener = (next: Plan) => setPlan(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addMeal = useCallback((key: string, recipeId: string) => {
    const current = read();
    write({ ...current, [key]: [...(current[key] ?? []), recipeId] });
  }, []);

  const removeMeal = useCallback((key: string, index: number) => {
    const current = read();
    const day = [...(current[key] ?? [])];
    day.splice(index, 1);
    write({ ...current, [key]: day });
  }, []);

  return { plan, addMeal, removeMeal };
}
