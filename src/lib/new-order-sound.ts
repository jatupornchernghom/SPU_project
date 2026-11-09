"use client";

let ctx: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/**
 * Browsers keep audio muted until the page has had a user gesture, so call
 * this from the first click/tap on the dashboard to make later chimes audible.
 */
export function unlockNewOrderSound() {
  const audio = getContext();
  if (audio?.state === "suspended") void audio.resume();
}

/** Two-tone "ding-dong" synthesized in-browser — no audio file to host. */
export function playNewOrderSound() {
  const audio = getContext();
  if (!audio || audio.state !== "running") return;

  const start = audio.currentTime;
  [
    { freq: 988, at: 0 },
    { freq: 784, at: 0.22 },
  ].forEach(({ freq, at }) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start + at);
    gain.gain.exponentialRampToValueAtTime(0.4, start + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + at + 0.6);
    osc.connect(gain).connect(audio.destination);
    osc.start(start + at);
    osc.stop(start + at + 0.65);
  });
}
