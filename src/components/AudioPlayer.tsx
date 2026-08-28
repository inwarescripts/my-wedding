"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicSettings } from "@/types/wedding-config";

export function AudioPlayer({
  active,
  settings,
}: {
  active: boolean;
  settings: MusicSettings;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active || !settings.enabled || !settings.autoplay || !audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        const fade = setInterval(() => {
          if (audio.volume < settings.volume - 0.05) {
            audio.volume = Math.min(settings.volume, audio.volume + 0.05);
          } else {
            audio.volume = settings.volume;
            clearInterval(fade);
          }
        }, 120);
      })
      .catch(() => setPlaying(false));
  }, [active, settings.enabled, settings.autoplay, settings.volume]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.volume = settings.volume;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  if (!settings.enabled || !settings.assetUrl) return null;

  return (
    // right offset tracks the same iPad-width column as the page content:
    // on a wide screen it hugs the card's right edge instead of the far
    // browser edge; max() falls back to a plain 1.5rem inset once the
    // viewport is narrower than the capped column (mobile).
    <div className="fixed bottom-6 right-[max(1.5rem,calc(50%-360px))] z-40">
      <audio
        ref={audioRef}
        src={settings.assetUrl}
        loop={settings.loop}
        preload="none"
      />
      <div className="relative">
        {/* A soft pulsing halo behind the button while music is playing —
            same "glowing, theme-tinted ring" vocabulary as DreamyMist/
            PetalMarks elsewhere, so this reads as "now playing" at a
            glance instead of just a static icon swap. */}
        {playing && <span className="audio-halo pointer-events-none absolute inset-0 rounded-full bg-accent-soft" />}

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Tạm dừng nhạc" : "Phát nhạc"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-soft bg-ivory/95 text-accent shadow-flat backdrop-blur transition-transform hover:scale-105"
        >
          <span className="pointer-events-none absolute inset-[3px] rounded-full border border-gold/40" />
          {playing ? (
            <span className="flex h-4 items-end gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-accent"
                  style={{ animation: `audio-bar 0.9s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-accent">
              <path d="M6 4.5v15l14-7.5-14-7.5Z" />
            </svg>
          )}
        </button>
      </div>
      <style>{`
        @keyframes audio-bar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes audio-halo {
          0% { transform: scale(0.85); opacity: 0.45; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .audio-halo {
          animation: audio-halo 1.8s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
