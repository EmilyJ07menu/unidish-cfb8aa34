import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wallet, Clock, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/lib/recipes";
import { RecipeImage } from "@/components/RecipeImage";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Plan your week by budget — UniDISH" },
      {
        name: "description",
        content: "Tell us your weekly food budget and we'll suggest student meals that fit.",
      },
      { property: "og:title", content: "Plan your week by budget — UniDISH" },
      { property: "og:description", content: "Weekly meal suggestions that fit your food budget." },
    ],
  }),
  component: Budget,
});

interface MealPlan {
  recipes: (typeof recipes)[number][];
  totalCost: number;
  totalMeals: number;
}

function suggestMeals(budgetPerWeek: number): MealPlan {
  // Sort recipes by cost per meal (price / serves)
  const recipesByEfficiency = [...recipes].sort(
    (a, b) => a.price / a.serves - b.price / b.serves
  );

  let selectedRecipes: (typeof recipes)[number][] = [];
  let totalCost = 0;
  let totalMeals = 0;

  // Try to fit 7 days of meals (assuming 1 meal per day, but recipes serve multiple)
  const targetMeals = 7;

  for (const recipe of recipesByEfficiency) {
    const costPerServing = recipe.price / recipe.serves;
    const servings = Math.ceil((targetMeals - totalMeals) / recipe.serves);

    if (totalCost + recipe.price * servings <= budgetPerWeek && totalMeals < targetMeals) {
      selectedRecipes.push(recipe);
      totalCost += recipe.price;
      totalMeals += recipe.serves;
    }
  }

  // If we don't have enough meals, just add the cheapest ones
  if (totalMeals < targetMeals) {
    for (const recipe of recipesByEfficiency) {
      if (!selectedRecipes.includes(recipe) && totalCost + recipe.price <= budgetPerWeek) {
        selectedRecipes.push(recipe);
        totalCost += recipe.price;
        totalMeals += recipe.serves;
      }
    }
  }

  return {
    recipes: selectedRecipes,
    totalCost,
    totalMeals,
  };
}

function Budget() {
  const [budget, setBudget] = useState(30);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  function handleSuggest() {
    if (budget <= 0) return;
    const plan = suggestMeals(budget);
    setMealPlan(plan);
    setShowPlan(true);
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">Plan your week by budget</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us your weekly food budget and we'll suggest meals that fit.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <label htmlFor="budget" className="text-lg font-semibold">
            Weekly food budget (£)
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                £
              </span>
              <input
                id="budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSuggest}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-4" /> Suggest meals
            </button>
          </div>
        </section>

        {showPlan && mealPlan && (
          <section className="mt-10">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your meal plan</h2>
                  <p className="mt-1 text-muted-foreground">
                    {mealPlan.recipes.length} recipes • {mealPlan.totalMeals} total servings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total cost</p>
                  <p className="text-3xl font-bold">£{mealPlan.totalCost.toFixed(2)}</p>
                  <p className="text-sm text-emerald-600">
                    {budget > mealPlan.totalCost
                      ? `£${(budget - mealPlan.totalCost).toFixed(2)} left`
                      : "Within budget"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mealPlan.recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to="/recipe/$id"
                  params={{ id: recipe.id }}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <RecipeImage
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{recipe.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">£{recipe.price.toFixed(2)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" /> {recipe.minutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-4" /> {recipe.serves}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!showPlan && (
          <div className="mt-20 flex flex-col items-center text-center">
            <Wallet className="size-12 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-5 text-lg text-muted-foreground">
              Enter your budget and tap suggest to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
