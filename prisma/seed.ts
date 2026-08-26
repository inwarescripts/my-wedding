import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { wedding, frames } from "../src/data/wedding";

const prisma = new PrismaClient();

async function seedAdminUser() {
  const username = "admin";
  const passwordHash = await bcrypt.hash("Huongpm123", 10);

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: "admin" },
    create: {
      username,
      passwordHash,
      name: "Quản trị viên",
      role: "admin",
    },
  });

  console.log(`Seeded admin user "${username}".`);
}

function frameContent(type: string): object {
  switch (type) {
    case "opening":
    case "hero":
      return {
        coverImage: wedding.couple.coverImage,
        displayName: wedding.couple.displayName,
        weddingDate: wedding.couple.weddingDate,
      };
    case "story":
      return wedding.story;
    case "photoStack":
      return wedding.photoStack;
    case "gallery":
      return wedding.gallery;
    case "timeline":
      return { items: wedding.timeline };
    case "family":
      return wedding.family;
    case "events":
      return { title: "Lễ cưới" };
    case "countdown":
      return {
        weddingDate: wedding.couple.weddingDate,
        weddingDateLunar: wedding.couple.weddingDateLunar,
      };
    case "map":
      return wedding.map;
    case "rsvp":
      return { showGuestCount: true, showMessage: true };
    case "guestbook":
    case "gift":
      return {};
    case "final":
      return { displayName: wedding.couple.displayName };
    default:
      return {};
  }
}

function frameAnimation(type: string): object | undefined {
  switch (type) {
    case "opening":
      return { variant: "particleBloom" };
    case "gallery":
      return { variant: "masonry" };
    case "photoStack":
      return { variant: "floatingPhotos" };
    case "timeline":
      return { variant: "alternating" };
    default:
      return undefined;
  }
}

async function main() {
  await seedAdminUser();

  const slug = "minh-linh";

  const coupleData = {
    groomName: wedding.couple.groomName,
    brideName: wedding.couple.brideName,
    displayName: wedding.couple.displayName,
    weddingDate: new Date(wedding.couple.weddingDate),
    weddingDateLunar: wedding.couple.weddingDateLunar,
    coverImage: wedding.couple.coverImage,
    quote: wedding.couple.quote,
  };
  const frameCreates = frames.map((f) => ({
    type: f.type,
    order: f.order,
    enabled: f.enabled,
    content: frameContent(f.type),
    animation: frameAnimation(f.type),
  }));
  const eventCreates = wedding.events.map((e, i) => ({
    name: e.name,
    date: new Date(`${e.date.split(".").reverse().join("-")}T${e.time}:00+07:00`),
    time: e.time,
    venue: e.venue,
    address: e.address,
    order: i,
  }));
  const giftCreates = [
    { label: "Chú rể", ...wedding.gift.groom },
    { label: "Cô dâu", ...wedding.gift.bride },
  ];
  const guestbookCreates = wedding.guestbookSeed.map((g) => ({
    name: g.name,
    message: g.message,
    status: "approved" as const,
  }));

  const existing = await prisma.project.findUnique({ where: { slug } });

  // Update-in-place (not delete+recreate) when the seed project already
  // exists — recreating it would assign a new id every run, silently
  // invalidating any admin editor tab left open with the old one (its next
  // Save fails with "Record to update not found").
  const project = existing
    ? await prisma.project.update({
        where: { id: existing.id },
        data: {
          name: wedding.couple.displayName,
          status: "published",
          publishedAt: new Date(),
          couple: { upsert: { create: coupleData, update: coupleData } },
          frames: { deleteMany: {}, create: frameCreates },
          events: { deleteMany: {}, create: eventCreates },
          gifts: { deleteMany: {}, create: giftCreates },
          guestbook: { deleteMany: {}, create: guestbookCreates },
        },
        include: { couple: true, frames: true, events: true, gifts: true, guestbook: true },
      })
    : await prisma.project.create({
        data: {
          slug,
          name: wedding.couple.displayName,
          status: "published",
          publishedAt: new Date(),
          settings: {
            typographyVariant: "wordReveal",
            music: {
              enabled: true,
              assetUrl: "/audio/wedding-theme.mp3",
              autoplay: true,
              loop: true,
              volume: 0.6,
            },
          },
          couple: { create: coupleData },
          frames: { create: frameCreates },
          events: { create: eventCreates },
          gifts: { create: giftCreates },
          guestbook: { create: guestbookCreates },
        },
        include: { couple: true, frames: true, events: true, gifts: true, guestbook: true },
      });

  console.log(`Seeded project "${project.slug}" with ${project.frames.length} frames.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
