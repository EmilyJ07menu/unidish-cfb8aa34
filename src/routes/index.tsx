import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Heart, Clock, Users, Sparkles, Refrigerator } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/lib/recipes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniDISH — Community recipes for students" },
      {
        name: "description",
        content:
          "Discover budget-friendly recipes shared by students, plan your week and turn your fridge into dinner.",
      },
      { property: "og:title", content: "UniDISH — Community recipes for students" },
      {
        property: "og:description",
        content: "Budget-friendly student recipes, shared by the community.",
      },
    ],
  }),
  component: Feed,
});

function Feed() {
  const [query, setQuery] = useState("");
  const list = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some((t) => t.includes(query.toLowerCase())),
  );

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl bg-primary px-8 py-10 text-primary-foreground">
          <h1 className="text-4xl">Cook smart, spend less</h1>
          <p className="mt-3 max-w-3xl text-lg opacity-95">
            Discover budget-friendly recipes shared by students, plan your week, and turn your
            fridge into dinner.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/budget"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 font-semibold transition-colors hover:bg-white/30"
            >
              <Sparkles className="size-4" /> Plan by budget
            </Link>
            <Link
              to="/fridge"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 font-semibold transition-colors hover:bg-white/30"
            >
              <Refrigerator className="size-4" /> Scan my fridge
            </Link>
          </div>
        </section>

        <h2 className="mt-10 text-3xl">Community Recipes</h2>

        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes or tags..."
            className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <article
              key={r.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img
                src={r.image}
                alt={r.title}
                width={800}
                height={600}
                loading="lazy"
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl">{r.title}</h3>
                  <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="size-4" /> {r.likes}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{r.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>£ {r.price.toFixed(2)}/serve</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" /> {r.minutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" /> {r.serves}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">by {r.author}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
