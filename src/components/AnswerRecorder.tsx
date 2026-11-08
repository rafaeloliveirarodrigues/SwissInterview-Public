import { useAppTranslations } from "@/lib/app-i18n";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transcribeAnswer } from "@/lib/voice.functions";
export function AnswerRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (text: string, durationSeconds: number) => void;
  disabled?: boolean;
}) {
  const { t } = useAppTranslations();

  const [recording, setRecording] = useState(false),
    [working, setWorking] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    active = useRef(true);
  const transcribe = useServerFn(transcribeAnswer);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      recorder.current?.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  async function start() {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream.current),
        chunks: Blob[] = [];
      recorder.current = r;
      const start = performance.now();
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = async () => {
        const duration = (performance.now() - start) / 1000;
        stream.current?.getTracks().forEach((t) => t.stop());
        if (!active.current) return;
        setRecording(false);
        setWorking(true);
        try {
          const blob = new Blob(chunks, { type: r.mimeType });
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              typeof reader.result === "string"
                ? resolve(reader.result.split(",")[1] ?? "")
                : reject(new Error(t("Could not read audio.")));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const { text } = await transcribe({ data: { audioBase64: base64, mimeType: blob.type } });
          if (active.current) onRecorded(text, duration);
        } catch {
          toast.error(t("Could not transcribe audio. Please type your answer."));
        } finally {
          if (active.current) setWorking(false);
        }
      };
      r.start();
      setRecording(true);
    } catch {
      toast.error(t("Microphone unavailable. You can type your answer."));
    }
  }
  return (
    <Button
      variant={recording ? "destructive" : "outline"}
      size="sm"
      disabled={working || disabled}
      onClick={() => (recording ? recorder.current?.stop() : void start())}
    >
      {working ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : recording ? (
        <Square className="mr-2 h-4 w-4" />
      ) : (
        <Mic className="mr-2 h-4 w-4" />
      )}
      {working
        ? t("Transcribing…")
        : recording
          ? t("Stop practice recording")
          : t("Record practice answer")}
    </Button>
  );
}
