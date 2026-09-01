import { useCallback, useEffect, useState } from "react";
import type { Recipe } from "@/lib/recipes";

const KEY = "unidish:my-recipes";

export function readUserRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<(list: Recipe[]) => void>();

function write(list: Recipe[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l(list));
}

export function slugify(title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "recipe";
  const existing = readUserRecipes().map((r) => r.id);
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function addUserRecipe(recipe: Recipe) {
  write([recipe, ...readUserRecipes()]);
}

export function useUserRecipes() {
  const [list, setList] = useState<Recipe[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setList(readUserRecipes());
    setLoaded(true);
    const listener = (next: Recipe[]) => setList(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const add = useCallback((recipe: Recipe) => addUserRecipe(recipe), []);
  const remove = useCallback((id: string) => {
    write(readUserRecipes().filter((r) => r.id !== id));
  }, []);

  return { list, loaded, add, remove };
}
