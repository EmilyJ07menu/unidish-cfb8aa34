import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Plus, Sparkles, Refrigerator } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/fridge")({
  head: () => ({
    meta: [
      { title: "What's in your fridge? — UniDISH" },
      {
        name: "description",
        content: "List your ingredients or snap your fridge and get meals you can make tonight.",
      },
      { property: "og:title", content: "What's in your fridge? — UniDISH" },
      { property: "og:description", content: "Turn the ingredients you have into dinner." },
    ],
  }),
  component: Fridge,
});

function Fridge() {
  const [ingredients, setIngredients] = useState([""]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">What's in your fridge?</h1>
        <p className="mt-2 text-muted-foreground">
          Snap a photo of your fridge, or list what you've got — we'll suggest meals you can make.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Fridge photo (optional)</h2>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted">
            <Upload className="size-4" /> Upload fridge photo
            <input type="file" accept="image/*" className="hidden" />
          </label>

          <h2 className="mt-6 text-lg font-semibold">Or list your ingredients</h2>
          <div className="mt-3 space-y-3">
            {ingredients.map((value, i) => (
              <input
                key={i}
                value={value}
                onChange={(e) =>
                  setIngredients((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                }
                placeholder={`Ingredient ${i + 1}`}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
          </div>
          <button
            onClick={() => setIngredients((prev) => [...prev, ""])}
            className="mt-3 inline-flex items-center gap-2 font-medium text-primary"
          >
            <Plus className="size-4" /> Add ingredient
          </button>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Sparkles className="size-5" /> Suggest recipes
          </button>
        </section>

        <div className="mt-20 flex flex-col items-center text-center">
          <Refrigerator className="size-12 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-5 text-lg text-muted-foreground">
            Add what you've got and we'll find recipes to match.
          </p>
        </div>
      </main>
    </div>
  );
}
