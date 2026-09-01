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
