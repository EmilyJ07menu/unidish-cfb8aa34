import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Users, Heart, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RecipeImage } from "@/components/RecipeImage";
import { getRecipe } from "@/lib/recipes";
import { useSaved } from "@/lib/useSaved";
import { useUserRecipes } from "@/lib/useUserRecipes";

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }) => ({ recipe: getRecipe(params.id) ?? null }),
  head: ({ loaderData }) => {
    if (!loaderData?.recipe) {
      return {
        meta: [{ title: "Recipe — UniDISH" }, { name: "robots", content: "noindex" }],
      };
    }
    const { recipe } = loaderData;
    const title = `${recipe.title} — UniDISH`;
    return {
      meta: [
        { title },
        { name: "description", content: recipe.description },
        { property: "og:title", content: title },
        { property: "og:description", content: recipe.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: RecipeNotFound,
  component: RecipeDetail,
});

function RecipeNotFound() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl">Recipe not found</h1>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary underline">
          Back to the feed
        </Link>
      </main>
    </div>
  );
}

function RecipeDetail() {
  const { recipe } = Route.useLoaderData();
  const { ids, toggle } = useSaved();
  const saved = ids.includes(recipe.id);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to feed
        </Link>

        <img
          src={recipe.image}
          alt={recipe.title}
          width={800}
          height={600}
          className="mt-5 h-80 w-full rounded-3xl object-cover"
        />

        <h1 className="mt-6 text-3xl">{recipe.title}</h1>
        <p className="mt-2 text-muted-foreground">{recipe.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>£ {recipe.price.toFixed(2)}/serve</span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" /> {recipe.minutes}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-4" /> serves {recipe.serves}
          </span>
          <span>by {recipe.author}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.tags.map((t) => (
            <span key={t} className="tag-chip">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={() => toggle(recipe.id)}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors ${
            saved
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          <Heart className="size-4" /> {saved ? "Saved" : "Save recipe"}
        </button>

        <section className="mt-10">
          <h2 className="text-2xl">Ingredients</h2>
          <ul className="mt-4 space-y-2">
            {recipe.ingredients.map((i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {i}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl">Method</h2>
          <ol className="mt-4 space-y-4">
            {recipe.steps.map((s, n) => (
              <li key={s} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {n + 1}
                </span>
                <p className="text-muted-foreground">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
