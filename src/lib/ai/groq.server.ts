/**
 * Groq integration. Isolated so the model/provider can be swapped later.
 */

export const VISION_MODEL = "qwen/qwen3.6-27b";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class FriendlyError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const SYSTEM_PROMPT = `You are Strikethrough, a calm assistant that helps people finish real, physical tasks in the space shown in a photo.

You receive a photo of a physical space and a goal written by the person.

Decide between two responses:

1. ASK — only if the goal is genuinely ambiguous and different reasonable readings would produce completely different work (e.g. "tidy" could mean a full deep clean or just clearing one surface). Ask at most ONE short, friendly question and offer 2-3 concrete answer options. Never ask if the goal and photo are already clear.

2. TASKS — a logically ordered list of 3 to 10 specific physical actions grounded in objects that are actually visible in the photo. Reference the real objects ("the blue shirt on the floor", "the stack of books by the lamp"). Each task is one meaningful action a person can do in under a few minutes. Never micro-steps like "reach toward the shirt". Never vague steps like "tidy up". Sentence case, imperative, no numbering, under 90 characters.

Respond with JSON only, matching exactly one of:
{"type":"question","question":"...","options":["...","..."]}
{"type":"tasks","title":"short 2-5 word title for this session","tasks":["...","..."]}

If the photo does not show a physical space you can act on, or you cannot determine reasonable steps, respond:
{"type":"unable","reason":"one friendly sentence explaining what would help"}`;

type GroqResult =
  | { type: "question"; question: string; options: string[] }
  | { type: "tasks"; title: string; tasks: string[] }
  | { type: "unable"; reason: string };

export async function analyzeWithGroq(params: {
  imageDataUrl: string;
  goal: string;
  clarification?: string | undefined;
}): Promise<GroqResult> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new FriendlyError(
      "missing_key",
      "Strikethrough isn't connected to its AI service yet. Add the key and try again.",
    );
  }

  const userText = [
    `Goal: ${params.goal}`,
    params.clarification ? `Clarification from the person: ${params.clarification}` : null,
    params.clarification
      ? "The goal is now clear. Return tasks, not another question."
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.4,
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
        reasoning_format: "hidden",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: params.imageDataUrl } },
            ],
          },
        ],
      }),
    });
  } catch {
    throw new FriendlyError(
      "network",
      "We couldn't reach the network. Check your connection and try again.",
    );
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new FriendlyError(
        "auth",
        "Strikethrough couldn't sign in to its AI service. Please check the setup and try again.",
      );
    }
    if (res.status === 429) {
      throw new FriendlyError(
        "rate_limit",
        "Things are a little busy right now. Give it a few seconds and try again.",
      );
    }
    if (res.status === 413) {
      throw new FriendlyError(
        "too_large",
        "That photo is a bit too large. Try a smaller or lower-resolution image.",
      );
    }
    throw new FriendlyError(
      "upstream",
      "Strikethrough couldn't finish looking at your photo. Please try again.",
    );
  }

  let content: string | undefined;
  try {
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    content = json.choices?.[0]?.message?.content ?? undefined;
  } catch {
    content = undefined;
  }
  if (!content) {
    throw new FriendlyError(
      "invalid_response",
      "Strikethrough got a confusing answer back. Please try again.",
    );
  }

  return parseResult(content);
}

export function parseResult(content: string): GroqResult {
  let raw: unknown;
  try {
    raw = JSON.parse(stripFences(content));
  } catch {
    throw new FriendlyError(
      "invalid_response",
      "Strikethrough couldn't make sense of that. Try rephrasing your goal.",
    );
  }

  const obj = raw as Record<string, unknown>;

  if (obj["type"] === "question" && typeof obj["question"] === "string") {
    const options = Array.isArray(obj["options"])
      ? (obj["options"] as unknown[]).filter((o): o is string => typeof o === "string").slice(0, 3)
      : [];
    return { type: "question", question: obj["question"], options };
  }

  if (obj["type"] === "unable") {
    return {
      type: "unable",
      reason:
        typeof obj["reason"] === "string" && obj["reason"].trim()
          ? obj["reason"]
          : "Try a clearer photo of the space, or a more specific goal.",
    };
  }

  const tasks = Array.isArray(obj["tasks"])
    ? (obj["tasks"] as unknown[])
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0)
        .slice(0, 12)
    : [];

  if (tasks.length === 0) {
    throw new FriendlyError(
      "invalid_response",
      "Strikethrough couldn't find clear steps here. Try a different angle or a more specific goal.",
    );
  }

  return {
    type: "tasks",
    title: typeof obj["title"] === "string" && obj["title"].trim() ? obj["title"].trim() : "Your steps",
    tasks,
  };
}

function stripFences(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
  }
  return trimmed;
}
