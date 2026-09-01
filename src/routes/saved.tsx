import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Clock, Users, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/lib/recipes";
import { useSaved } from "@/lib/useSaved";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved dishes — UniDISH" },
      {
        name: "description",
        content: "Your personal collection of recipes saved from the feed and Discover.",
      },
      { property: "og:title", content: "Saved dishes — UniDISH" },
      { property: "og:description", content: "Recipes you've saved on UniDISH." },
    ],
  }),
  component: Saved,
});

function Saved() {
  const { ids, remove } = useSaved();
  const list = recipes.filter((r) => ids.includes(r.id));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">Saved dishes</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal collection — recipes you've saved from the feed and Discover.
        </p>

        {list.length === 0 ? (
          <div className="mt-24 flex flex-col items-center text-center">
            <Bookmark className="size-12 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-6 text-lg text-muted-foreground">No saved dishes yet.</p>
            <Link to="/discover" className="mt-3 text-lg font-medium text-primary underline">
              Discover dishes to save
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {list.map((r) => (
              <article
                key={r.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  onClick={() => remove(r.id)}
                  aria-label={`Remove ${r.title}`}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
                <Link to="/recipe/$id" params={{ id: r.id }}>
                  <img
                    src={r.image}
                    alt={r.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h2 className="text-xl">{r.title}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>£ {r.price.toFixed(2)}/serve</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" /> {r.minutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-4" /> {r.serves}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
