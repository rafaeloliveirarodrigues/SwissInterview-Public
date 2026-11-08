import { useEffect, useRef, useState } from 'react';
import { Circle, Play, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppTranslations } from '@/lib/app-i18n';
import { LocalVideoRecording } from '@/lib/local-video';

// Video follows the single "Record answer" button; only the separate audio-only recorder reaches transcription.
export function LocalInterviewVideo({ stream, sessionEnding, answerRecording }: { stream: MediaStream | null; sessionEnding: boolean; answerRecording: boolean }) {
  const { t } = useAppTranslations();
  const [controller] = useState(() => new LocalVideoRecording());
  const [enabled, setEnabled] = useState(true);
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [replay, setReplay] = useState(false);
  const [error, setError] = useState(false);
  const player = useRef<HTMLVideoElement>(null);

  function discard() {
    player.current?.pause();
    controller.clear();
    setUrl(null);
    setReplay(false);
    setRecording(false);
  }

  useEffect(() => {
    window.addEventListener('pagehide', discard);
    return () => { window.removeEventListener('pagehide', discard); controller.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, stream]);

  useEffect(() => { if (sessionEnding) discard(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sessionEnding]);

  useEffect(() => {
    if (answerRecording) {
      if (!enabled || !stream || sessionEnding) return;
      discard();
      setError(false);
      try {
        controller.start(stream, nextUrl => { setUrl(nextUrl); setRecording(false); },
          () => { setError(true); setRecording(false); });
        setRecording(true);
      } catch { setError(true); }
    } else {
      controller.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerRecording]);

  return <div className="mt-4 space-y-3">
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={enabled} disabled={answerRecording} onCheckedChange={v => setEnabled(v === true)} />
      {t('Also keep a local video of my answer for replay')}
    </label>
    {url && <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => { player.current?.pause(); setReplay(value => !value); }}>
        {replay ? <Video className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{t(replay ? 'Close replay' : 'Replay video')}
      </Button>
      <Button variant="ghost" size="icon" onClick={discard} aria-label={t('Discard video')} title={t('Discard video')}><Trash2 className="h-4 w-4" /></Button>
    </div>}
    {recording && <p role="status" className="flex items-center gap-2 text-sm text-destructive"><Circle className="h-3 w-3 animate-pulse fill-current" />{t('Recording video locally')}</p>}
    {error && <p role="alert" className="text-sm text-warning">{t('Video recording unavailable. Try another browser or check your camera.')}</p>}
    {url && replay && <video ref={player} src={url} aria-label={t('Local video replay')} controls controlsList="nodownload" disablePictureInPicture playsInline onContextMenu={event => event.preventDefault()} className="aspect-video w-full rounded-lg bg-secondary object-contain" />}
    <p className="text-xs leading-relaxed text-muted-foreground">{t('Video and sound in this replay stay in browser memory only. Leaving or ending the interview deletes them.')}</p>
  </div>;
}
