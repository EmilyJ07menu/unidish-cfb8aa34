import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Heart, Clock, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/lib/recipes";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover dishes — UniDISH" },
      {
        name: "description",
        content: "Swipe through student recipes to build a taste profile that tailors suggestions.",
      },
      { property: "og:title", content: "Discover dishes — UniDISH" },
      {
        property: "og:description",
        content: "Swipe right to save dishes you like, left if you don't.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [index, setIndex] = useState(0);
  const deck = [recipes[3], recipes[0], recipes[2], recipes[1]];
  const dish = deck[index];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">Discover dishes</h1>
        <p className="mt-2 text-muted-foreground">
          Swipe right to save dishes you like, left if you don't — the app learns your taste and
          tailors your budget &amp; fridge suggestions.
        </p>

        {dish ? (
          <>
            <article className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <img
                src={dish.image}
                alt={dish.title}
                width={800}
                height={600}
                className="h-96 w-full object-cover"
              />
              <div className="p-8">
                <h2 className="text-2xl">{dish.title}</h2>
                <p className="mt-2 text-muted-foreground">{dish.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>£ {dish.price.toFixed(2)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" /> {dish.minutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" /> {dish.serves}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {dish.tags.map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <div className="mt-8 flex justify-center gap-8">
              <button
                onClick={() => setIndex((i) => i + 1)}
                aria-label="Skip dish"
                className="flex size-16 items-center justify-center rounded-full border-2 border-destructive text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="size-7" />
              </button>
              <button
                onClick={() => setIndex((i) => i + 1)}
                aria-label="Save dish"
                className="flex size-16 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-600 transition-colors hover:bg-emerald-600/10"
              >
                <Heart className="size-7" />
              </button>
            </div>
          </>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">That's every dish for now.</p>
            <button
              onClick={() => setIndex(0)}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
            >
              Start again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
