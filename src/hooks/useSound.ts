import { useCallback } from "react";

/** Shared HTMLAudioElement instances keyed by src (cached, never autoplay). */
const audioCache = new Map<string, HTMLAudioElement>();

function getCachedAudio(src: string): HTMLAudioElement {
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }
  return audio;
}

/**
 * Returns a play function for arcade/UI sounds.
 * - Loads via HTMLAudioElement, cached per `src`
 * - Restarts from 0 on each call (avoids overlap stacking)
 * - Volume applied each play (safe when same file used at different volumes)
 * - Never autoplays; call only from user gestures (drag/click)
 */
export function useSound(src: string, volume = 0.62): () => void {
  return useCallback(() => {
    const audio = getCachedAudio(src);
    audio.volume = volume;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, [src, volume]);
}

/** Separate cache so looping ticket SFX never shares elements with one-shot useSound clips */
const loopAudioBySrc = new Map<string, HTMLAudioElement>();

function getLoopingAudio(src: string): HTMLAudioElement {
  let audio = loopAudioBySrc.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.loop = true;
    loopAudioBySrc.set(src, audio);
  }
  return audio;
}

/** Start a looping clip (e.g. ticket machine motor). Call only from user gestures. */
export function startLoopingSound(src: string, volume = 0.45): void {
  const audio = getLoopingAudio(src);
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

/** Stop and rewind — call when burst ends or on reset */
export function stopLoopingSound(src: string): void {
  const audio = loopAudioBySrc.get(src);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}
