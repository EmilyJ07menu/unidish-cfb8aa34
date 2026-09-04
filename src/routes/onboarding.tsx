import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Salad, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Your dietary requirements — UniDISH" },
      {
        name: "description",
        content:
          "Tell UniDISH about your diet, allergies and intolerances so recipe suggestions always fit.",
      },
      { property: "og:title", content: "Your dietary requirements — UniDISH" },
      { property: "og:description", content: "Personalise your UniDISH recipe suggestions." },
    ],
  }),
  component: Onboarding,
});

const DIETS = [
  { id: "carnivore", label: "Carnivore", hint: "Meat eater" },
  { id: "vegan", label: "Vegan", hint: "No animal products" },
  { id: "vegetarian", label: "Vegetarian", hint: "No meat or fish" },
  { id: "halal", label: "Halal", hint: "Halal-certified only" },
  { id: "pescatarian", label: "Pescatarian", hint: "Fish, no meat" },
];

const MEATS = ["Chicken", "Beef", "Pork", "Lamb", "Turkey", "Fish", "Seafood"];
const ALLERGIES = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Fish", "Shellfish", "Soy", "Wheat", "Sesame"];
const INTOLERANCES = ["Lactose", "Gluten", "Fructose", "Caffeine", "Histamine"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      <span className="flex items-center gap-2 font-semibold">
        {selected && <Check className="size-4" />}
        {label}
      </span>
      {hint && <span className="block text-sm opacity-80">{hint}</span>}
    </button>
  );
}

function Onboarding() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [diet, setDiet] = useState<string | null>(null);
  const [meats, setMeats] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("diet, meats, allergies, intolerances")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setDiet(data.diet);
        setMeats(data.meats ?? []);
        setAllergies(data.allergies ?? []);
        setIntolerances(data.intolerances ?? []);
      });
  }, [session]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!diet) {
      toast.error("Pick a dietary requirement to continue.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      diet,
      meats: diet === "carnivore" ? meats : [],
      allergies,
      intolerances,
      onboarded: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Preferences saved — recipes will match your diet.");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Salad className="size-8" />
          </div>
          <h1 className="mt-6 text-4xl">Your dietary requirements</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            We'll strictly avoid your allergens and only suggest recipes that fit your diet.
          </p>
        </div>

        <form onSubmit={save} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl">Dietary requirement</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DIETS.map((d) => (
                <Chip
                  key={d.id}
                  label={d.label}
                  hint={d.hint}
                  selected={diet === d.id}
                  onClick={() => setDiet(d.id)}
                />
              ))}
            </div>
          </section>

          {diet === "carnivore" && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl">Which meats do you prefer?</h2>
              <p className="mt-1 text-muted-foreground">Pick as many as you like.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {MEATS.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    selected={meats.includes(m)}
                    onClick={() => setMeats((prev) => toggle(prev, m))}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl">Allergies</h2>
            <p className="mt-1 text-muted-foreground">These ingredients will never be suggested.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ALLERGIES.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  selected={allergies.includes(a)}
                  onClick={() => setAllergies((prev) => toggle(prev, a))}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl">Intolerances</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {INTOLERANCES.map((i) => (
                <Chip
                  key={i}
                  label={i}
                  selected={intolerances.includes(i)}
                  onClick={() => setIntolerances((prev) => toggle(prev, i))}
                />
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save and start cooking"}
          </button>
        </form>
      </main>
    </div>
  );
}
