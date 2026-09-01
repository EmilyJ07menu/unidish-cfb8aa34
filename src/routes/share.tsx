import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { addUserRecipe, slugify } from "@/lib/useUserRecipes";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share a recipe — UniDISH" },
      {
        name: "description",
        content: "Add your own budget student recipe to the UniDISH community feed.",
      },
      { property: "og:title", content: "Share a recipe — UniDISH" },
      {
        property: "og:description",
        content: "Post your ingredients, method and cost per serving to the feed.",
      },
    ],
  }),
  component: SharePage,
});

const field =
  "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

async function toDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function SharePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1.00");
  const [minutes, setMinutes] = useState("20");
  const [serves, setServes] = useState("2");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      setImage(await toDataUrl(file));
    } catch {
      toast.error("Couldn't read that image.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = (s: string) =>
      s
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    if (!title.trim()) return toast.error("Give your recipe a title.");
    if (lines(ingredients).length === 0) return toast.error("Add at least one ingredient.");
    if (lines(steps).length === 0) return toast.error("Add at least one method step.");

    setSaving(true);
    const id = slugify(title);
    addUserRecipe({
      id,
      title: title.trim(),
      description: description.trim() || "A recipe shared by the UniDISH community.",
      price: Number(price) || 0,
      minutes: Number(minutes) || 0,
      serves: Number(serves) || 1,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      author:
        (user?.user_metadata?.["username"] as string | undefined) ??
        user?.email?.split("@")[0] ??
        "You",
      likes: 0,
      image,
      ingredients: lines(ingredients),
      steps: lines(steps),
    });
    toast.success("Recipe shared to the feed.");
    navigate({ to: "/recipe/$id", params: { id } });
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-3xl">Share your recipe</h1>
        <p className="mt-2 text-muted-foreground">
          Post one of your own dishes — it appears in the feed and you can plan it into your week.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="title" className="font-semibold">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cheesy tuna pasta bake"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="description" className="font-semibold">
              Short description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Creamy, filling and made from cupboard staples."
              className={field}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="font-semibold">
                £ per serving
              </label>
              <input
                id="price"
                type="number"
                step="0.05"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="minutes" className="font-semibold">
                Minutes
              </label>
              <input
                id="minutes"
                type="number"
                min="1"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="serves" className="font-semibold">
                Serves
              </label>
              <input
                id="serves"
                type="number"
                min="1"
                value={serves}
                onChange={(e) => setServes(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="font-semibold">
              Tags <span className="font-normal text-muted-foreground">(comma separated)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="quick, budget, pasta"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="ingredients" className="font-semibold">
              Ingredients <span className="font-normal text-muted-foreground">(one per line)</span>
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={6}
              placeholder={"250g pasta\n1 tin tuna\n80g cheddar, grated"}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="steps" className="font-semibold">
              Method <span className="font-normal text-muted-foreground">(one step per line)</span>
            </label>
            <textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={6}
              placeholder={"Boil the pasta for 10 minutes.\nStir through the tuna and cheese."}
              className={field}
            />
          </div>

          <div>
            <span className="font-semibold">Photo</span>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
                <ImagePlus className="size-4" />
                {image ? "Change photo" : "Add a photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
              </label>
              {image ? (
                <img
                  src={image}
                  alt="Recipe preview"
                  className="size-20 rounded-xl object-cover"
                />
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            Share to the feed
          </button>
        </form>
      </main>
    </div>
  );
}
