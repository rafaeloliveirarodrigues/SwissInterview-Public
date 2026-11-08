import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function bytesToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Speak an interview question aloud. Returns a base64 WAV. */
export const speakQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; language?: string }) => input)
  .handler(async ({ data }) => {
    const { synthesizeSpeech } = await import("./ai.server");
    const { toLanguage } = await import("./swiss-cv");
    const audio = await synthesizeSpeech(data.text.slice(0, 1200), toLanguage(data.language));
    return { audioBase64: bytesToBase64(audio), mimeType: "audio/wav" };
  });

/** Transcribe a recorded spoken answer. */
export const transcribeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { audioBase64: string; mimeType: string }) => {
    if (typeof input?.audioBase64 !== "string" || input.audioBase64.length > 19_000_000) {
      throw new Error("That recording is too long. Keep answers under about 10 minutes.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { transcribeAudio } = await import("./ai.server");
    const bytes = base64ToBytes(data.audioBase64);
    if (bytes.length > 14 * 1024 * 1024) {
      throw new Error("That recording is too long. Keep answers under about 10 minutes.");
    }
    const text = await transcribeAudio(bytes, data.mimeType);
    return { text };
  });
