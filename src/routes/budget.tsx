import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wallet } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

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

function Budget() {
  const [budget, setBudget] = useState(30);

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
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <Sparkles className="size-4" /> Suggest meals
            </button>
          </div>
        </section>

        <div className="mt-20 flex flex-col items-center text-center">
          <Wallet className="size-12 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-5 text-lg text-muted-foreground">
            Enter your budget and tap suggest to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
