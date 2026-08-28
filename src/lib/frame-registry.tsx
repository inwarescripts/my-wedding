import type {
  CoupleInfo,
  EventItem,
  FamilyContent,
  FrameConfig,
  GalleryContent,
  GiftAccountItem,
  GuestbookItem,
  MapContent,
  PhotoStackContent,
  RsvpContent,
  ScheduleContent,
  StoryContent,
  TimelineContent,
} from "@/types/wedding-config";
import { Hero } from "@/components/frames/Hero";
import { Story } from "@/components/frames/Story";
import { Family } from "@/components/frames/Family";
import { Events } from "@/components/frames/Events";
import { Schedule } from "@/components/frames/Schedule";
import { CountdownVariant } from "@/motion/registry/countdown";
import { MapFrame } from "@/components/frames/MapFrame";
import { RSVP } from "@/components/frames/RSVP";
import { Guestbook } from "@/components/frames/Guestbook";
import { GiftFrame } from "@/components/frames/GiftFrame";
import { Final } from "@/components/frames/Final";
import { GalleryVariant } from "@/motion/registry/gallery";
import { Gallery3dVariant } from "@/motion/registry/gallery3d";
import { TimelineVariant } from "@/motion/registry/timeline";

export interface RenderFrameContext {
  projectId: string;
  couple: CoupleInfo;
  events: EventItem[];
  gifts: GiftAccountItem[];
  guestbook: GuestbookItem[];
  typographyVariant: string;
  bowStyle: string;
}

export function renderFrame(frame: FrameConfig, ctx: RenderFrameContext) {
  switch (frame.type) {
    case "hero":
      return (
        <Hero
          couple={ctx.couple}
          typographyVariant={ctx.typographyVariant}
          bowStyle={ctx.bowStyle}
          projectId={ctx.projectId}
        />
      );
    case "story":
      return (
        <Story
          content={frame.content as StoryContent}
          quote={ctx.couple.quote}
          typographyVariant={ctx.typographyVariant}
          bowStyle={ctx.bowStyle}
        />
      );
    case "photoStack":
      return (
        <Gallery3dVariant content={frame.content as PhotoStackContent} variant={frame.variant} />
      );
    case "gallery":
      return <GalleryVariant content={frame.content as GalleryContent} variant={frame.variant} />;
    case "timeline":
      return <TimelineVariant content={frame.content as TimelineContent} variant={frame.variant} />;
    case "family":
      return (
        <Family
          content={frame.content as FamilyContent}
          variant={frame.variant}
          couple={ctx.couple}
          event={ctx.events[0]}
        />
      );
    case "events":
      return <Events events={ctx.events} />;
    case "schedule":
      return <Schedule content={frame.content as ScheduleContent} bowStyle={ctx.bowStyle} />;
    case "countdown":
      return (
        <CountdownVariant
          weddingDate={ctx.couple.weddingDate}
          weddingDateLunar={ctx.couple.weddingDateLunar}
          bowStyle={ctx.bowStyle}
          variant={frame.variant}
        />
      );
    case "map":
      return <MapFrame content={frame.content as MapContent} />;
    case "rsvp":
      return (
        <RSVP projectId={ctx.projectId} content={frame.content as RsvpContent} bowStyle={ctx.bowStyle} />
      );
    case "guestbook":
      return <Guestbook projectId={ctx.projectId} seed={ctx.guestbook} />;
    case "gift":
      return <GiftFrame gifts={ctx.gifts} bowStyle={ctx.bowStyle} />;
    case "final":
      return <Final couple={ctx.couple} />;
    default:
      return null;
  }
}
