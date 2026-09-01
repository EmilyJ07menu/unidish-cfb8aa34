import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Heart, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { recipes } from "@/lib/recipes";
import { useSaved } from "@/lib/useSaved";
import { useFeedback } from "@/lib/useFeedback";
import { sortRecipesByPreferences } from "@/lib/preferenceAlgorithm";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover dishes — UniDISH" },
      {
        name: "description",
        content: "Swipe through student recipes to build a taste profile that tailors suggestions. Share why you skip recipes to help us learn your preferences better.",
      },
      { property: "og:title", content: "Discover dishes — UniDISH" },
      {
        property: "og:description",
        content: "Swipe right to save dishes you like, left if you don't. Tell us why you skip recipes to get better recommendations.",
      },
    ],
  }),
  component: Discover,
});

const THRESHOLD = 110;

function Discover() {
  const [sortedRecipes, setSortedRecipes] = useState<typeof recipes>([]);
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [flying, setFlying] = useState<null | "left" | "right">(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRecipeId, setFeedbackRecipeId] = useState<string | null>(null);
  const startX = useRef<number | null>(null);
  const { save } = useSaved();
  const { saveFeedback, feedback, loading: feedbackLoading } = useFeedback();

  // Sort recipes based on user preferences
  useEffect(() => {
    const sorted = sortRecipesByPreferences(recipes, feedback);
    setSortedRecipes(sorted);
  }, [feedback]);

  const deck = sortedRecipes;
  const dish = deck[index];

  const decide = useCallback(
    (dir: "left" | "right") => {
      if (!dish || flying) return;
      if (dir === "right") {
        save(dish.id);
        saveFeedback(dish.id, "like");
        toast.success(`"${dish.title}" saved! Check it in Saved dishes.`);
      } else {
        // Show feedback dialog for dislikes
        setFeedbackRecipeId(dish.id);
        setShowFeedbackDialog(true);
        return; // Don't advance yet, wait for feedback submission
      }
      setFlying(dir);
      setDrag(dir === "right" ? 600 : -600);
      window.setTimeout(() => {
        setFlying(null);
        setDrag(0);
        setIndex((i) => i + 1);
      }, 260);
    },
    [dish, flying, save, saveFeedback],
  );

  const handleFeedbackSubmit = (comment: string) => {
    if (!feedbackRecipeId || !dish) return;
    
    // Save the dislike feedback
    saveFeedback(feedbackRecipeId, "dislike", comment);
    setShowFeedbackDialog(false);
    setFeedbackRecipeId(null);

    // Now advance to next card
    setFlying("left");
    setDrag(-600);
    window.setTimeout(() => {
      setFlying(null);
      setDrag(0);
      setIndex((i) => i + 1);
    }, 260);
  };

  const handleFeedbackCancel = () => {
    setShowFeedbackDialog(false);
    setFeedbackRecipeId(null);

    // Still advance without comment
    if (feedbackRecipeId) {
      saveFeedback(feedbackRecipeId, "dislike");
    }
    setFlying("left");
    setDrag(-600);
    window.setTimeout(() => {
      setFlying(null);
      setDrag(0);
      setIndex((i) => i + 1);
    }, 260);
  };

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
          Swipe right to save dishes to your collection, left to skip. The app learns your taste based on what you like and dislike.
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

            <div className="mt-8 flex flex-col items-center gap-6">
              <p className="text-sm text-muted-foreground">
                Click buttons or swipe • Use arrow keys for keyboard
              </p>
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => decide("left")}
                  aria-label="Skip dish"
                  className="flex flex-col items-center gap-2 rounded-full border-2 border-destructive px-6 py-3 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <X className="size-6" />
                  <span className="text-sm font-semibold">Skip</span>
                </button>
                <button
                  onClick={() => decide("right")}
                  aria-label="Save dish"
                  className="flex flex-col items-center gap-2 rounded-full border-2 border-emerald-600 bg-emerald-600/5 px-6 py-3 text-emerald-600 transition-colors hover:bg-emerald-600/10"
                >
                  <Heart className="size-6 fill-current" />
                  <span className="text-sm font-semibold">Save</span>
                </button>
              </div>
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

      <FeedbackDialog
        open={showFeedbackDialog}
        recipeName={dish?.title || ""}
        onSubmit={handleFeedbackSubmit}
        onCancel={handleFeedbackCancel}
        isLoading={feedbackLoading}
      />
    </div>
  );
}
