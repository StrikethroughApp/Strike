import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/", "Unsupported image")
    .max(8_000_000, "Image too large"),
  goal: z.string().trim().min(2).max(400),
  clarification: z.string().trim().max(400).optional(),
});

export const analyzeScene = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { analyzeWithGroq, FriendlyError } = await import("./ai/groq.server");
    try {
      const result = await analyzeWithGroq(data);
      return { ok: true as const, result };
    } catch (error) {
      const message =
        error instanceof FriendlyError
          ? error.message
          : "Something went sideways on our end. Please try again.";
      return { ok: false as const, error: message };
    }
  });
