"use client";

import { useState } from "react";
import type { OpeningContent, WeddingConfig } from "@/types/wedding-config";
import { Opening } from "@/motion/home/opening";
import { SectionTransition } from "@/motion/registry/transition";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { LiveWishesOverlay } from "@/components/LiveWishesOverlay";
import {
  AmbientEffect,
  AmbientBurst,
  AMBIENT_BURST_DURATION_MS,
  type AmbientVariant,
  ConfettiCannon,
  ConfettiCannonBurst,
  CONFETTI_CANNON_BURST_DURATION_MS,
} from "@/motion/registry/ambient";
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
        const ambientBurstDuration =
          AMBIENT_BURST_DURATION_MS[config.settings.ambientEffect as AmbientVariant] ?? 0;
        // confettiCannon is a standalone layer stacked on top of whichever
        // ambientEffect is chosen (see the setting's doc comment), so its
        // own entry burst can outlast the ambientEffect one — wait for
        // whichever finishes last before starting the auto-scroll.
        const confettiBurstDuration = config.settings.confettiCannon
          ? CONFETTI_CANNON_BURST_DURATION_MS
          : 0;
        const burstDuration = Math.max(ambientBurstDuration, confettiBurstDuration);
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
    chatPosition: config.settings.chatPosition,
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
      {config.settings.confettiCannon && (
        <>
          <ConfettiCannon />
          <ConfettiCannonBurst triggerKey={burstKey} />
        </>
      )}

      <main
        className="relative mx-auto max-w-[768px] md:shadow-[0_0_60px_rgba(0,0,0,0.12)]"
        style={{
          ...themeCssVars(config.settings.colorTheme),
          ...backgroundStyle(
            getColorThemePalette(config.settings.colorTheme),
            config.settings.background
          ),
        }}
      >
        {/* Rendered inside `main` structurally (not as a
            WeddingRenderer-level sibling), even though `position: fixed`
            still resolves against the real viewport either way (`main`
            gets no transform/filter here, so it never becomes a
            containing block for this — that WOULD keep it visually
            aligned with the card, but at the cost of pinning it to
            `main`'s own bottom edge instead of the viewport's, breaking
            "stays visible the whole time the guest scrolls"). Horizontal
            alignment with the card's actual edge on wide desktop screens
            (where `main` sits centred with empty margin on both sides,
            see its own max-w-[768px] above) comes from
            LiveWishesOverlay's own calc()-based left/right instead — see
            POSITION_CLASS there. */}
        {config.settings.chatPosition !== "default" && (
          <LiveWishesOverlay projectId={config.projectId} position={config.settings.chatPosition} />
        )}
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
