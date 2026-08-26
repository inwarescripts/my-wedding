"use client";

import { useState } from "react";
import type { OpeningContent, WeddingConfig } from "@/types/wedding-config";
import { Opening } from "@/motion/home/opening";
import { SectionTransition } from "@/motion/registry/transition";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AmbientEffect, AmbientBurst, AMBIENT_BURST_DURATION_MS, type AmbientVariant } from "@/motion/registry/ambient";
import { backgroundStyle } from "@/motion/registry/background";
import { getColorThemePalette, themeCssVars } from "@/motion/registry/theme";
import { startAutoScrollTour } from "@/lib/autoScrollTour";
import { renderFrame } from "@/lib/frame-registry";

// Short beat between the burst finishing and the guided scroll starting.
const PAUSE_BEFORE_SCROLL_MS = 800;

export function WeddingRenderer({
  config,
  initialEntered = false,
}: {
  config: WeddingConfig;
  initialEntered?: boolean;
}) {
  const [entered, setEntered] = useState(initialEntered);
  const [burstKey, setBurstKey] = useState<number | null>(null);

  function handleEnter() {
    setEntered(true);

    // Wait for Opening's own fade-out (1300ms, see motion/home/opening.tsx) so
    // the burst plays over the now-visible Hero, not the closing curtain.
    // The petal burst always plays on entry — it's the "strong effect right
    // at the start" — independent of the auto-scroll tour below, which stays
    // opt-in via its own setting.
    window.setTimeout(() => {
      setBurstKey(Date.now());
      if (config.settings.introSequence.enabled) {
        const burstDuration =
          AMBIENT_BURST_DURATION_MS[config.settings.ambientEffect as AmbientVariant] ?? 0;
        window.setTimeout(() => {
          startAutoScrollTour(config.settings.introSequence.scrollSpeed);
        }, burstDuration + PAUSE_BEFORE_SCROLL_MS);
      }
    }, 1300);
  }

  const openingFrame = config.frames.find((f) => f.type === "opening" && f.enabled);
  // Array position is the single source of truth for display order — both
  // the DB fetch (orderBy) and the editor's reordering produce an
  // already-ordered array. Re-sorting by the `order` field here would fight
  // the editor: moving a frame only changes array position, not that field.
  const orderedFrames = config.frames.filter((f) => f.enabled && f.type !== "opening");

  const ctx = {
    projectId: config.projectId,
    couple: config.couple,
    events: config.events,
    gifts: config.gifts,
    guestbook: config.guestbook,
    typographyVariant: config.settings.typographyVariant,
    bowStyle: config.settings.bowStyle,
  };

  return (
    <>
      {openingFrame && !initialEntered && (
        <Opening
          couple={config.couple}
          variant={openingFrame.variant}
          colorTheme={config.settings.colorTheme}
          showCountdown={(openingFrame.content as Partial<OpeningContent>)?.showCountdown ?? false}
          onEnter={handleEnter}
        />
      )}
      <ScrollProgress />
      <AudioPlayer active={entered} settings={config.settings.music} />
      <AmbientEffect variant={config.settings.ambientEffect} />
      <AmbientBurst variant={config.settings.ambientEffect} triggerKey={burstKey} />

      <main
        style={{
          ...themeCssVars(config.settings.colorTheme),
          ...backgroundStyle(
            getColorThemePalette(config.settings.colorTheme),
            config.settings.background
          ),
        }}
      >
        {orderedFrames.map((frame) => (
          // Anchor the admin editor's "focus preview" scroll-to on this id —
          // see focusPreview() in ProjectEditor.tsx.
          <div key={frame.id} id={`frame-${frame.id}`}>
            <SectionTransition variant={config.settings.transitionVariant}>
              {renderFrame(frame, ctx)}
            </SectionTransition>
          </div>
        ))}
      </main>
    </>
  );
}
