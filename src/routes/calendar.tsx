import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Bookmark } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RecipeImage } from "@/components/RecipeImage";
import { recipes } from "@/lib/recipes";
import { useUserRecipes } from "@/lib/useUserRecipes";
import { useSaved } from "@/lib/useSaved";
import { usePlan, dateKey } from "@/lib/usePlan";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Meal calendar — UniDISH" },
      {
        name: "description",
        content: "Plan what you're cooking each day and add recipes from the feed or your own.",
      },
      { property: "og:title", content: "Meal calendar — UniDISH" },
      { property: "og:description", content: "Your weekly student meal plan." },
    ],
  }),
  component: CalendarPage,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function startOfWeek(offset: number) {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function CalendarPage() {
  const [offset, setOffset] = useState(0);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "saved">("saved");
  const { list: mine } = useUserRecipes();
  const { ids: savedIds } = useSaved();
  const { plan, addMeal, removeMeal } = usePlan();

  const all = [...mine, ...recipes];
  const savedRecipes = all.filter((r) => savedIds.includes(r.id));
  const displayRecipes = filter === "saved" ? savedRecipes : all;

  const start = startOfWeek(offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Meal calendar</h1>
            <p className="mt-2 text-muted-foreground">
              Plan what you're cooking each day — add dishes from the feed or your own recipes.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Previous week"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-6" />
            </button>
            <span className="font-display text-lg font-semibold">
              {fmt(start)} – {fmt(end)}
            </span>
            <button
              onClick={() => setOffset((o) => o + 1)}
              aria-label="Next week"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {DAYS.map((day, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const key = dateKey(date);
            const meals = plan[key] ?? [];

            return (
              <section key={day} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl">
                    {day} <span className="text-base font-normal">{fmt(date)}</span>
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {meals.length} meal{meals.length === 1 ? "" : "s"}
                    </span>
                    <button
                      onClick={() => setOpenDay(openDay === key ? null : key)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                    >
                      <Plus className="size-4" /> Add meal
                    </button>
                  </div>
                </div>

                {meals.length === 0 ? (
                  <p className="mt-4 text-muted-foreground">No meals planned.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {meals.map((id, index) => {
                      const recipe = all.find((r) => r.id === id);
                      return (
                        <li
                          key={`${id}-${index}`}
                          className="flex items-center gap-4 rounded-xl border border-border p-3"
                        >
                          <RecipeImage
                            src={recipe?.image ?? ""}
                            alt={recipe?.title ?? "Recipe"}
                            className="size-14 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            {recipe ? (
                              <Link
                                to="/recipe/$id"
                                params={{ id }}
                                className="font-semibold hover:underline"
                              >
                                {recipe.title}
                              </Link>
                            ) : (
                              <span className="font-semibold">{id}</span>
                            )}
                            {recipe ? (
                              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>£ {recipe.price.toFixed(2)}/serve</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-4" /> {recipe.minutes}m
                                </span>
                              </p>
                            ) : null}
                          </div>
                          <button
                            onClick={() => removeMeal(key, index)}
                            aria-label={`Remove ${recipe?.title ?? id} from ${day}`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="size-5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {openDay === key ? (
                  <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Pick a recipe for {day}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilter("saved")}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filter === "saved"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          <Bookmark className="size-4" /> Saved
                        </button>
                        <button
                          onClick={() => setFilter("all")}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filter === "all"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          All recipes
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                      {displayRecipes.length > 0 ? (
                        displayRecipes.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              addMeal(key, r.id);
                              setOpenDay(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg bg-card p-2 text-left transition-colors hover:bg-secondary"
                          >
                            <RecipeImage
                              src={r.image}
                              alt={r.title}
                              className="size-10 shrink-0 rounded-md object-cover"
                            />
                            <span className="min-w-0 flex-1 truncate font-medium">{r.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {savedIds.includes(r.id) && (
                                <Bookmark className="size-4 fill-primary text-primary" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {mine.some((m) => m.id === r.id) ? "Yours" : `${r.minutes}m`}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          {filter === "saved"
                            ? "No saved recipes yet. Browse all recipes or save some first!"
                            : "No recipes found."}
                        </p>
                      )}
                    </div>
                    <Link
                      to="/share"
                      className="mt-3 inline-block text-sm font-semibold text-primary underline"
                    >
                      Or create a new recipe
                    </Link>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
