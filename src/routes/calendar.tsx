import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Meal calendar — UniDISH" },
      { name: "description", content: "Plan what you're cooking each day of the week." },
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
            <p className="mt-2 text-muted-foreground">Plan what you're cooking each day.</p>
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
            return (
              <section key={day} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl">
                    {day} <span className="text-base font-normal">{fmt(date)}</span>
                  </h2>
                  <span className="text-sm text-muted-foreground">0 meals</span>
                </div>
                <p className="mt-4 text-muted-foreground">No meals planned.</p>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
