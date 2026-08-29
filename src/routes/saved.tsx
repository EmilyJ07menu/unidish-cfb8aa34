import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved dishes — UniDISH" },
      {
        name: "description",
        content: "Your personal collection of recipes saved from the feed and Discover.",
      },
      { property: "og:title", content: "Saved dishes — UniDISH" },
      { property: "og:description", content: "Recipes you've saved on UniDISH." },
    ],
  }),
  component: Saved,
});

function Saved() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl">Saved dishes</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal collection — recipes you've saved from the feed and Discover.
        </p>

        <div className="mt-24 flex flex-col items-center text-center">
          <Bookmark className="size-12 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-6 text-lg text-muted-foreground">No saved dishes yet.</p>
          <Link to="/discover" className="mt-3 text-lg font-medium text-primary underline">
            Discover dishes to save
          </Link>
        </div>
      </main>
    </div>
  );
}
