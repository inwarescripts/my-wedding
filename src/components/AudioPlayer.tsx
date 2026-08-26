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
    <div className="fixed bottom-6 right-6 z-40">
      <audio
        ref={audioRef}
        src={settings.assetUrl}
        loop={settings.loop}
        preload="none"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Tạm dừng nhạc" : "Phát nhạc"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 bg-ivory/90 text-ink shadow-flat backdrop-blur transition-transform hover:scale-105"
      >
        <span className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-ink"
              style={{
                height: playing ? undefined : "4px",
                animation: playing
                  ? `audio-bar 0.9s ease-in-out ${i * 0.15}s infinite`
                  : "none",
              }}
            />
          ))}
        </span>
      </button>
      <style>{`
        @keyframes audio-bar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>
    </div>
  );
}
