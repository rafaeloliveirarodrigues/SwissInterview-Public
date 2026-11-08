import { LanguageMenu } from "@/components/LanguageMenu";
import { LocalInterviewVideo } from "@/components/LocalInterviewVideo";
import { useAppTranslations } from "@/lib/app-i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Mic, Square, Volume2, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { getSession, submitAnswer, finishSession } from "@/lib/interview.functions";
import { speakQuestion, transcribeAnswer } from "@/lib/voice.functions";
import interviewer from "@/assets/interviewer.jpg";
import { MediaConsent } from "@/components/MediaConsent";

export const Route = createFileRoute("/_authenticated/interview/$sessionId")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Mock interview — Offer Ready" },
      {
        name: "description",
        content: "Answer interview questions out loud and get scored on your performance.",
      },
      { property: "og:title", content: "Mock interview — Offer Ready" },
      { property: "og:description", content: "Answer interview questions out loud." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InterviewGate,
});

interface Turn {
  id: string;
  idx: number;
  question: string;
  question_kind: string;
  answer: string | null;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the recording."));
    reader.readAsDataURL(blob);
  });
}

function InterviewGate() {
  const { sessionId } = Route.useParams();
  return (
    <MediaConsent sessionId={sessionId}>
      <InterviewPage />
    </MediaConsent>
  );
}

function InterviewPage() {
  const { t } = useAppTranslations();

  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  const load = useServerFn(getSession);
  const submit = useServerFn(submitAnswer);
  const finish = useServerFn(finishSession);
  const speak = useServerFn(speakQuestion);
  const transcribe = useServerFn(transcribeAnswer);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spokenRef = useRef<string | null>(null);
  const recordingStarted = useRef(0);
  const recordedSpeech = useRef({ transcript: "", durationSeconds: 0 });

  const [turn, setTurn] = useState<Turn | null>(null);
  const [total, setTotal] = useState(8);
  const [role, setRole] = useState("");
  const [answer, setAnswer] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [working, setWorking] = useState<string | null>("Getting ready");
  const [cameraOn, setCameraOn] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaAttempt, setMediaAttempt] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(true);

  const langRef = useRef("en");
  /* ---- load the session ---- */
  useEffect(() => {
    let cancelled = false;
    load({ data: { sessionId } })
      .then((data) => {
        if (cancelled) return;
        const prep = data.session.preps as unknown as {
          role_title: string;
          company_name: string;
          language?: string;
        } | null;
        langRef.current = prep?.language ?? "en";
        setRole(prep ? `${prep.role_title} · ${prep.company_name}` : "");
        setTotal(data.total);
        const current = data.turns.find((t) => !t.answer) ?? data.turns[data.turns.length - 1];
        setTurn((current as Turn) ?? null);
        setWorking(null);
      })
      .catch(() => {
        toast.error(t("We couldn't open that interview."));
        navigate({ to: "/dashboard" });
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, load, navigate]);

  /* ---- camera + mic ---- */
  useEffect(() => {
    let active = true;
    setMediaLoading(true);
    setMediaError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Camera access requires a secure browser connection.");
      setMediaLoading(false);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setMediaStream(stream);
        setCameraOn(true);
        setMediaLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setCameraOn(false);
        setMediaStream(null);
        setMediaLoading(false);
        const name = error instanceof DOMException ? error.name : "";
        setMediaError(name === "NotAllowedError"
          ? "Allow camera and microphone access in your browser’s site settings, then try again."
          : name === "NotReadableError"
            ? "Camera unavailable. Close other apps using it, then try again."
            : "Camera or microphone unavailable. Check your devices, then try again.");
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioRef.current?.pause();
    };
  }, [mediaAttempt]);

  // Attach after React mounts the video element, not before setCameraOn commits.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaStream) return;
    video.srcObject = mediaStream;
    video.muted = true;
    void video.play().catch(() => setMediaError("Press Start camera preview to display your video."));
    return () => { video.srcObject = null; };
  }, [mediaStream]);

  /* ---- speak each new question ---- */
  const speakText = useCallback(
    async (text: string) => {
      try {
        setSpeaking(true);
        const { audioBase64, mimeType } = await speak({
          data: { text, language: langRef.current },
        });
        const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
        audioRef.current?.pause();
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        await audio.play();
      } catch {
        setSpeaking(false);
      }
    },
    [speak],
  );

  useEffect(() => {
    if (!turn || turn.answer) return;
    if (spokenRef.current === turn.id) return;
    spokenRef.current = turn.id;
    void speakText(turn.question);
  }, [turn, speakText]);

  /* ---- recording ---- */
  function startRecording() {
    const stream = streamRef.current;
    if (!stream) {
      toast.error(t("No microphone available — type your answer instead."));
      return;
    }
    const audioStream = new MediaStream(stream.getAudioTracks());
    const recorder = new MediaRecorder(audioStream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const durationSeconds = (performance.now() - recordingStarted.current) / 1000;
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecording(false);
      if (blob.size < 2000) {
        toast.error(t("That recording was too short."));
        return;
      }
      setWorking("Transcribing your answer");
      try {
        const base64 = await blobToBase64(blob);
        const { text } = await transcribe({ data: { audioBase64: base64, mimeType } });
        recordedSpeech.current = {
          transcript: `${recordedSpeech.current.transcript} ${text}`.trim(),
          durationSeconds: recordedSpeech.current.durationSeconds + durationSeconds,
        };
        setAnswer((prev) => (prev ? `${prev} ${text}` : text));
      } catch {
        toast.error(t("We couldn't transcribe that. You can type your answer instead."));
      } finally {
        setWorking(null);
      }
    };
    audioRef.current?.pause();
    setSpeaking(false);
    recordingStarted.current = performance.now();
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  /* ---- submit ---- */
  async function handleSubmit() {
    if (!turn || answer.trim().length < 2) {
      toast.error(t("Give an answer first."));
      return;
    }
    audioRef.current?.pause();
    setSpeaking(false);
    setWorking("Thinking about your answer");
    try {
      const result = await submit({
        data: {
          sessionId,
          turnId: turn.id,
          answer: answer.trim(),
          speech:
            recordedSpeech.current.durationSeconds > 0
              ? { ...recordedSpeech.current, language: langRef.current }
              : undefined,
        },
      });
      recordedSpeech.current = { transcript: "", durationSeconds: 0 };
      setAnswer("");
      if (result.done || !result.nextTurn) {
        setWorking("Scoring your interview");
        await finish({ data: { sessionId } });
        navigate({ to: "/results/$sessionId", params: { sessionId } });
        return;
      }
      setTurn(result.nextTurn as Turn);
    } catch {
      toast.error(t("Something went wrong saving that answer."));
    } finally {
      setWorking(null);
    }
  }

  async function handleEndEarly() {
    setWorking("Scoring your interview");
    try {
      await finish({ data: { sessionId } });
      navigate({ to: "/results/$sessionId", params: { sessionId } });
    } catch {
      toast.error(t("We couldn't score that interview."));
      setWorking(null);
    }
  }

  const progress = turn ? ((turn.idx + 1) / total) * 100 : 0;

  return (
    <div className="min-h-screen surface-grid">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold">{t("Mock interview")}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LanguageMenu />
            <span className="text-xs text-muted-foreground">
              {t("Question {current} of {total}", { current: (turn?.idx ?? 0) + 1, total })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleEndEarly}>
              {t("End & score")}
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* interviewer */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                {speaking && (
                  <span className="speaking-ring absolute -inset-2 rounded-full bg-primary/40" />
                )}
                <img
                  src={interviewer}
                  alt={t("Your interviewer")}
                  width={816}
                  height={816}
                  className="relative h-24 w-24 rounded-full border border-border object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("Interviewer")}
                  {speaking && <Volume2 className="h-3.5 w-3.5 animate-pulse text-primary" />}
                </p>
                <p className="mt-3 font-display text-lg leading-relaxed">
                  {turn?.question ?? t("Preparing your first question…")}
                </p>
                {turn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 -ml-2"
                    onClick={() => void speakText(turn.question)}
                  >
                    <Volume2 className="mr-1 h-4 w-4" /> {t("Repeat question")}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Textarea
                rows={7}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t(
                  "Speak your answer, or type it here. You can edit the transcript before sending.",
                )}
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {recording ? (
                  <Button variant="destructive" onClick={stopRecording}>
                    <Square className="mr-2 h-4 w-4" /> {t("Stop recording")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={startRecording}
                    disabled={!cameraOn || !!working}
                  >
                    <Mic className="mr-2 h-4 w-4" /> {t("Record answer")}
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={!!working || recording}>
                  {working ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {turn && turn.idx + 1 >= total ? t("Finish interview") : t("Send answer")}
                </Button>
                {working && <span className="text-xs text-muted-foreground">{t(working)}…</span>}
              </div>
            </div>
          </div>

          {/* candidate */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("You")}
            </p>
            <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-secondary">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full scale-x-[-1] object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
                  <VideoOff className="h-6 w-6" />
                  {mediaLoading ? t("Connecting camera…") : t(mediaError ?? "Camera and microphone are off.")}
                  <span className="text-xs">{t("You can still type your answers.")}</span>
                  {!mediaLoading && <Button variant="outline" size="sm" onClick={() => setMediaAttempt(n => n + 1)}>{t("Retry camera")}</Button>}
                </div>
              )}
            </div>
            {cameraOn && mediaError && <div className="mt-3 space-y-2"><p className="text-sm text-warning">{t(mediaError)}</p><Button variant="outline" size="sm" onClick={() => {void videoRef.current?.play().then(() => setMediaError(null)).catch(() => setMediaError("Camera unavailable. Close other apps using it, then try again."));}}>{t("Start camera preview")}</Button></div>}
            <LocalInterviewVideo key={sessionId} stream={mediaStream} sessionEnding={working === "Scoring your interview"} answerRecording={recording} />
            {recording && (
              <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />{" "}
                {t("Recording")}
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t(
                "Your video stays on this device and is never uploaded. Audio is sent for transcription; the transcript and recording duration are saved for feedback and approximate speech delivery metrics.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
