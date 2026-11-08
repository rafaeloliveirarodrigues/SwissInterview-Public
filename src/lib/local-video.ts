// In-memory only: this module has no network or persistent-storage path.
export class LocalVideoRecording {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private url: string | null = null;

  start(stream: MediaStream, ready: (url: string) => void, failed: () => void) {
    this.clear();
    const mimeType = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
      .find(type => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    this.recorder = recorder;
    recorder.ondataavailable = event => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: recorder.mimeType });
      this.chunks = [];
      this.recorder = null;
      if (!blob.size) { failed(); return; }
      this.url = URL.createObjectURL(blob);
      ready(this.url);
    };
    recorder.onerror = () => { this.clear(); failed(); };
    try { recorder.start(1000); }
    catch (error) { this.clear(); throw error; }
  }

  stop() {
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  clear() {
    const recorder = this.recorder;
    if (recorder) {
      // Detach before stopping: late events must never recreate discarded video.
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    this.recorder = null;
    this.chunks = [];
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null;
  }
}