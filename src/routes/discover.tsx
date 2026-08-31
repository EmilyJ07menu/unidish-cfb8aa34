import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Heart, Clock, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { recipes } from "@/lib/recipes";
import { useSaved } from "@/lib/useSaved";

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

const THRESHOLD = 110;

function Discover() {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [flying, setFlying] = useState<null | "left" | "right">(null);
  const startX = useRef<number | null>(null);
  const { save } = useSaved();

  const deck = recipes;
  const dish = deck[index];

  const decide = useCallback(
    (dir: "left" | "right") => {
      if (!dish || flying) return;
      if (dir === "right") save(dish.id);
      setFlying(dir);
      setDrag(dir === "right" ? 600 : -600);
      window.setTimeout(() => {
        setFlying(null);
        setDrag(0);
        setIndex((i) => i + 1);
      }, 260);
    },
    [dish, flying, save],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") decide("right");
      if (e.key === "ArrowLeft") decide("left");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide]);

  function onPointerDown(e: React.PointerEvent) {
    if (flying) return;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (startX.current === null) return;
    const dx = drag;
    startX.current = null;
    if (dx > THRESHOLD) decide("right");
    else if (dx < -THRESHOLD) decide("left");
    else setDrag(0);
  }

  const dragging = startX.current !== null;
  const intent = drag > 40 ? "save" : drag < -40 ? "skip" : null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">Discover dishes</h1>
        <p className="mt-2 text-muted-foreground">
          Swipe right to save dishes you like, left if you don't — the app learns your taste and
          tailors your budget &amp; fridge suggestions. You can also use the arrow keys.
        </p>

        {dish ? (
          <>
            <div className="mt-8 select-none">
              <article
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                  transform: `translateX(${drag}px) rotate(${drag * 0.04}deg)`,
                  transition: dragging ? "none" : "transform 0.26s ease",
                  opacity: flying ? 0 : 1,
                  touchAction: "pan-y",
                }}
                className="relative cursor-grab overflow-hidden rounded-3xl border border-border bg-card shadow-sm active:cursor-grabbing"
              >
                <img
                  src={dish.image}
                  alt={dish.title}
                  width={800}
                  height={600}
                  draggable={false}
                  className="pointer-events-none h-96 w-full object-cover"
                />

                {intent && (
                  <span
                    className={`absolute left-6 top-6 rounded-xl border-4 px-4 py-1.5 text-xl font-bold uppercase tracking-wide ${
                      intent === "save"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-destructive text-destructive"
                    }`}
                  >
                    {intent === "save" ? "Save" : "Skip"}
                  </span>
                )}

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
                  <Link
                    to="/recipe/$id"
                    params={{ id: dish.id }}
                    className="mt-4 inline-block font-semibold text-primary underline"
                  >
                    View full recipe
                  </Link>
                </div>
              </article>
            </div>

            <div className="mt-8 flex justify-center gap-8">
              <button
                onClick={() => decide("left")}
                aria-label="Skip dish"
                className="flex size-16 items-center justify-center rounded-full border-2 border-destructive text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="size-7" />
              </button>
              <button
                onClick={() => decide("right")}
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
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setIndex(0)}
                className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
              >
                Start again
              </button>
              <Link
                to="/saved"
                className="rounded-full border border-border px-6 py-2.5 font-semibold"
              >
                See saved dishes
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
