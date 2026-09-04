import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Plus, Sparkles, Refrigerator, Loader2, X, Clock, PoundSterling } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { recipes as baseRecipes, type Recipe } from "@/lib/recipes";
import { useUserRecipes } from "@/lib/useUserRecipes";
import { identifyIngredients, inventMeals, type AiMealIdea } from "@/lib/fridge.functions";

export const Route = createFileRoute("/fridge")({
  head: () => ({
    meta: [
      { title: "What's in your fridge? — UniDISH" },
      {
        name: "description",
        content: "Snap your fridge and we'll identify the ingredients, then suggest meals you can cook tonight.",
      },
      { property: "og:title", content: "What's in your fridge? — UniDISH" },
      { property: "og:description", content: "Turn the ingredients you have into dinner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fridge,
});

const STOP_WORDS = new Set([
  "fresh", "large", "small", "chopped", "sliced", "diced", "tin", "tinned", "can", "of",
  "tbsp", "tsp", "g", "kg", "ml", "and", "or", "a", "the", "to", "taste", "optional",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .map((w) => (w.endsWith("es") ? w.slice(0, -2) : w.endsWith("s") ? w.slice(0, -1) : w))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

type Match = { recipe: Recipe; matched: string[]; missing: number };

function matchRecipes(list: Recipe[], have: string[]): Match[] {
  const haveTokens = have.flatMap(tokens);
  if (haveTokens.length === 0) return [];

  return list
    .map((recipe) => {
      const matched: string[] = [];
      let missing = 0;
      for (const line of recipe.ingredients) {
        const lineTokens = tokens(line);
        if (lineTokens.some((t) => haveTokens.includes(t))) matched.push(line);
        else missing += 1;
      }
      return { recipe, matched, missing };
    })
    .filter((m) => m.matched.length > 0)
    .sort((a, b) => b.matched.length - a.matched.length || a.missing - b.missing);
}

function Fridge() {
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [ideas, setIdeas] = useState<AiMealIdea[] | null>(null);
  const [thinking, setThinking] = useState(false);
  const { list: userRecipes } = useUserRecipes();
  const identify = useServerFn(identifyIngredients);
  const invent = useServerFn(inventMeals);

  const all = [...userRecipes, ...baseRecipes];

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error("That photo is a bit big — try one under 5MB.");
      return;
    }

    setScanning(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file"));
        reader.readAsDataURL(file);
      });

      const result = await identify({ data: { image: dataUrl } });
      if (result.ingredients.length === 0) {
        toast.error("Couldn't spot any ingredients — try a clearer photo.");
        return;
      }
      setIngredients((prev) => {
        const kept = prev.map((v) => v.trim()).filter(Boolean);
        const merged = [...kept];
        for (const item of result.ingredients) {
          if (!merged.some((v) => v.toLowerCase() === item)) merged.push(item);
        }
        return [...merged, ""];
      });
      toast.success(`Found ${result.ingredients.length} ingredients in your photo.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed. Try again.");
    } finally {
      setScanning(false);
    }
  }

  async function suggest(): Promise<void> {
    const have = ingredients.map((v) => v.trim()).filter(Boolean);
    if (have.length === 0) {
      toast.error("Add at least one ingredient first.");
      return;
    }
    const found = matchRecipes(all, have);
    setMatches(found);

    setThinking(true);
    setIdeas(null);
    try {
      const result = await invent({ data: { ingredients: have.slice(0, 30) } });
      setIdeas(result.ideas);
      if (result.ideas.length === 0 && found.length === 0) {
        toast.error("Couldn't think of anything — try adding a couple more ingredients.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI ideas failed. Try again.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">What's in your fridge?</h1>
        <p className="mt-2 text-muted-foreground">
          Snap a photo of your fridge and we'll identify what's inside, or list what you've got.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Fridge photo</h2>
          <label
            className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted ${
              scanning ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {scanning ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {scanning ? "Identifying ingredients…" : "Scan fridge photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>

          <h2 className="mt-6 text-lg font-semibold">Your ingredients</h2>
          <div className="mt-3 space-y-3">
            {ingredients.map((value, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={value}
                  onChange={(e) =>
                    setIngredients((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                  }
                  placeholder={`Ingredient ${i + 1}`}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
                {ingredients.length > 1 && (
                  <button
                    onClick={() => setIngredients((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove ingredient ${i + 1}`}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setIngredients((prev) => [...prev, ""])}
            className="mt-3 inline-flex items-center gap-2 font-medium text-primary"
          >
            <Plus className="size-4" /> Add ingredient
          </button>

          <button
            onClick={suggest}
            disabled={thinking}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {thinking ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {thinking ? "Thinking up meals…" : "Suggest recipes"}
          </button>
        </section>

        {(thinking || (ideas && ideas.length > 0)) && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="size-5 text-accent" /> AI meal ideas
            </h2>
            <p className="mt-1 text-muted-foreground">
              Invented for exactly what you have — not from our recipe library.
            </p>

            {thinking ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-muted" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {ideas?.map((idea) => (
                  <article
                    key={idea.title}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <h3 className="font-semibold">{idea.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <PoundSterling className="size-4" />
                        {idea.price.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-4" />
                        {idea.minutes} min
                      </span>
                    </div>
                    {idea.uses.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {idea.uses.map((u) => (
                          <span key={u} className="tag-chip">
                            {u}
                          </span>
                        ))}
                      </div>
                    )}
                    {idea.missing.length > 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        You'll need: {idea.missing.join(", ")}
                      </p>
                    )}
                    {idea.steps.length > 0 && (
                      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                        {idea.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {matches === null ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <Refrigerator className="size-12 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-5 text-lg text-muted-foreground">
              Add what you've got and we'll find recipes to match.
            </p>
          </div>
        ) : (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">
              {matches.length > 0 ? `${matches.length} meals you can make` : "No matches yet"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {matches.map(({ recipe, matched, missing }) => (
                <Link
                  key={recipe.id}
                  to="/recipe/$id"
                  params={{ id: recipe.id }}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold">{recipe.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Uses {matched.length} of your ingredients
                      {missing > 0 ? ` · ${missing} to buy` : " · nothing else needed"}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <PoundSterling className="size-4" />
                        {recipe.price.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-4" />
                        {recipe.minutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
