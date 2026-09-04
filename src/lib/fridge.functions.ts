import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  image: z.string().min(32).max(8_000_000),
});

export const identifyIngredients = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ ingredients: string[] }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You identify food ingredients in photos of fridges, cupboards or groceries. " +
              "Reply with ONLY a JSON array of lowercase ingredient names, e.g. [\"eggs\",\"cheddar\",\"spinach\"]. " +
              "Max 20 items. No prose, no markdown.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What food ingredients can you see?" },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up to keep scanning.");
    if (!res.ok) throw new Error("Could not read that photo. Try another one.");

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content ?? "[]";
    const match = text.match(/\[[\s\S]*\]/);

    let parsed: unknown = [];
    try {
      parsed = JSON.parse(match ? match[0] : text);
    } catch {
      parsed = [];
    }

    const ingredients = Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 20)
      : [];

    return { ingredients };
  });

const ideaSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1).max(30),
});

export type AiMealIdea = {
  title: string;
  description: string;
  minutes: number;
  price: number;
  uses: string[];
  missing: string[];
  steps: string[];
};

export const inventMeals = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ideaSchema.parse(data))
  .handler(async ({ data }): Promise<{ ideas: AiMealIdea[] }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a thrifty UK student cook. Invent 3 simple, realistic meals from the ingredients given. " +
              "Costs are per portion in GBP using UK supermarket prices. " +
              "Reply with ONLY a JSON array, no markdown, of objects: " +
              '{"title":string,"description":string,"minutes":number,"price":number,' +
              '"uses":string[],"missing":string[],"steps":string[]}. ' +
              "'uses' are ingredients from the list, 'missing' are cheap staples they may need to buy (max 4), " +
              "'steps' are 3-6 short method steps.",
          },
          {
            role: "user",
            content: `Ingredients I have: ${data.ingredients.join(", ")}`,
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up to keep cooking.");
    if (!res.ok) throw new Error("Couldn't come up with ideas right now. Try again.");

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content ?? "[]";
    const match = text.match(/\[[\s\S]*\]/);

    let parsed: unknown = [];
    try {
      parsed = JSON.parse(match ? match[0] : text);
    } catch {
      parsed = [];
    }

    const strings = (v: unknown, max: number): string[] =>
      Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, max)
        : [];

    const ideas: AiMealIdea[] = Array.isArray(parsed)
      ? parsed
          .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
          .map((v) => ({
            title: typeof v["title"] === "string" ? v["title"] : "",
            description: typeof v["description"] === "string" ? v["description"] : "",
            minutes: Number(v["minutes"]) || 20,
            price: Number(v["price"]) || 0,
            uses: strings(v["uses"], 12),
            missing: strings(v["missing"], 4),
            steps: strings(v["steps"], 8),
          }))
          .filter((v) => v.title.length > 0)
          .slice(0, 3)
      : [];

    return { ideas };
  });
