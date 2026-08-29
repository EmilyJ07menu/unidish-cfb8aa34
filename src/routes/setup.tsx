import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserCircle2, Camera, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your profile — UniDISH" },
      { name: "description", content: "Pick a username and profile picture to join UniDISH." },
      { property: "og:title", content: "Set up your profile — UniDISH" },
      { property: "og:description", content: "Create your UniDISH student cooking profile." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { session } = useAuth();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (session) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: session.user.id, username });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    navigate({ to: "/onboarding" });
  }


  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserCircle2 className="size-9" />
        </div>
        <h1 className="mt-6 text-4xl">Set up your profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">Pick a username and a profile picture</p>

        <form onSubmit={save} className="mt-8 w-full rounded-2xl border border-border bg-card p-8">

          <div className="relative mx-auto w-fit">
            <div className="flex size-28 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserCircle2 className="size-14" strokeWidth={1.5} />
            </div>
            <label className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Camera className="size-4" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Tap to upload a photo</p>

          <label htmlFor="username" className="mt-6 block text-left font-semibold">
            Username
          </label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Continue <ChevronRight className="size-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
