import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import type { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const CHAT_MODEL = "openai/gpt-6-astra";
export const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
export const STT_MODEL = "google/gemini-3.5-transcribe";

export function lovableApiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");
  return key;
}

function provider(key: string) {
  return createOpenAI({
    baseURL: GATEWAY,
    apiKey: key,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Structured generation on the gateway Responses API (always streamed server-side). */
export async function generateStructured<T>(args: {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  effort?: "low" | "medium" | "high";
}): Promise<T> {
  const key = lovableApiKey();
  const lovable = provider(key);

  const result = streamText({
    model: lovable.responses(CHAT_MODEL),
    system: args.system,
    prompt: args.prompt,
    output: Output.object({ schema: args.schema }),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: args.effort ?? "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const match = error.text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          /* fall through */
        }
      }
    }
    throw error;
  }
}

/** Text to speech — returns a complete WAV buffer. */
const VOICE_STYLE: Record<string, string> = {
  en: "Say this in a warm, calm, professional interviewer voice at a natural pace",
  de: "Sprich dies auf Hochdeutsch mit leichtem Schweizer Akzent, warm, ruhig und professionell",
  fr: "Dis ceci en français de Suisse romande, d'une voix chaleureuse, calme et professionnelle",
  it: "Di' questo in italiano ticinese, con voce calda, calma e professionale",
};

export async function synthesizeSpeech(text: string, language: string = "en"): Promise<ArrayBuffer> {
  const key = lovableApiKey();
  const res = await fetch(`${GATEWAY}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: TTS_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${VOICE_STYLE[language] ?? VOICE_STYLE["en"]}: ${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Voice generation failed (${res.status}): ${await res.text()}`);
  }
  return await res.arrayBuffer();
}

/** Speech to text from a recorded audio blob. */
export async function transcribeAudio(bytes: Uint8Array, mimeType: string): Promise<string> {
  const key = lovableApiKey();
  const form = new FormData();
  const safeType = mimeType.startsWith("audio/") ? mimeType : "audio/webm";
  form.append("file", new Blob([bytes as BlobPart], { type: safeType }), "answer.webm");
  form.append("model", STT_MODEL);

  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { "Lovable-API-Key": key },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Transcription failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
