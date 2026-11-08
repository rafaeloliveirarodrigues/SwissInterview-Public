import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalVideoRecording } from './local-video';

class FakeRecorder {
  static isTypeSupported = () => true;
  static latest: FakeRecorder;
  state = 'inactive';
  mimeType = 'video/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() { FakeRecorder.latest = this; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; }
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('session-only local video', () => {
  it('creates only a browser blob for replay and revokes it on session cleanup', () => {
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-video');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const video = new LocalVideoRecording();
    const ready = vi.fn();
    video.start({} as MediaStream, ready, vi.fn());
    FakeRecorder.latest.ondataavailable?.({ data: new Blob(['video']) });
    video.stop();
    FakeRecorder.latest.onstop?.();
    const blob = create.mock.calls[0]?.[0];
    expect(blob instanceof Blob ? blob.size : null).toBe(5);
    expect(ready).toHaveBeenCalledWith('blob:local-video');
    video.clear();
    expect(revoke).toHaveBeenCalledWith('blob:local-video');
  });
  it('discards unfinished video without allowing late events to recreate it', () => {
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    const create = vi.spyOn(URL, 'createObjectURL');
    const ready = vi.fn();
    const video = new LocalVideoRecording();
    video.start({} as MediaStream, ready, vi.fn());
    FakeRecorder.latest.ondataavailable?.({ data: new Blob(['private']) });
    video.clear();
    expect(FakeRecorder.latest.state).toBe('inactive');
    expect(FakeRecorder.latest.onstop).toBeNull();
    expect(FakeRecorder.latest.ondataavailable).toBeNull();
    expect(create).not.toHaveBeenCalled();
    expect(ready).not.toHaveBeenCalled();
  });
});