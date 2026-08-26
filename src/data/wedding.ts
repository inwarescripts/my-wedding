export type FrameType =
  | "opening"
  | "hero"
  | "story"
  | "photoStack"
  | "gallery"
  | "timeline"
  | "family"
  | "events"
  | "countdown"
  | "map"
  | "rsvp"
  | "guestbook"
  | "gift"
  | "final";

export interface Frame {
  id: string;
  type: FrameType;
  order: number;
  enabled: boolean;
}

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const wedding = {
  couple: {
    groomName: "Minh Anh",
    brideName: "Thuỳ Linh",
    displayName: "Minh & Linh",
    weddingDate: "2026-10-18T09:00:00+07:00",
    weddingDateLunar: "Ngày 09 tháng 09 năm Bính Ngọ",
    quote:
      "Yêu nhau là cùng nhìn về một hướng — và hướng đó, từ hôm nay, là mãi mãi.",
    coverImage: img("photo-1519741497674-611481863552"),
  },
  story: {
    eyebrow: "Câu chuyện của chúng tôi",
    title: "Từ một ánh nhìn, đến một đời thương",
    paragraphs: [
      "Sài Gòn, một buổi chiều mưa tháng Bảy, hai người xa lạ tình cờ trú mưa dưới cùng một mái hiên nhỏ.",
      "Từ đó, những cuộc hẹn cà phê trở thành thói quen, những chuyến đi xa trở thành kỷ niệm, và một người xa lạ trở thành người thương đi cùng nhau đến cuối con đường.",
    ],
    image: img("photo-1522673607200-164d1b6ce486"),
  },
  photoStack: {
    title: "Những khoảnh khắc",
    images: [
      img("photo-1583939003579-730e3918a45a", 1200),
      img("photo-1509927083803-4bd519298ac4", 1200),
      img("photo-1465495976277-4387d4b0b4c6", 1200),
    ],
  },
  gallery: {
    title: "Album cưới",
    subtitle: "Mỗi bức ảnh là một câu chuyện nhỏ trong hành trình của chúng tôi",
    items: [
      img("photo-1519225421980-715cb0215aed", 1000),
      img("photo-1606216794074-735e91aa2c92", 1000),
      img("photo-1529636798458-92182e662485", 1000),
      img("photo-1511285560929-80b456fea0bc", 1000),
      img("photo-1522673607200-164d1b6ce486", 1000),
      img("photo-1583939003579-730e3918a45a", 1000),
    ],
  },
  timeline: [
    { date: "07.2019", title: "Gặp gỡ", desc: "Một buổi chiều mưa định mệnh ở Sài Gòn." },
    { date: "12.2020", title: "Hẹn hò", desc: "Lời tỏ tình dưới ánh đèn Giáng Sinh." },
    { date: "03.2024", title: "Cầu hôn", desc: "Đà Lạt, sương sớm và một chiếc nhẫn." },
    { date: "10.2026", title: "Đám cưới", desc: "Ngày chúng tôi chính thức là gia đình." },
  ],
  family: {
    groom: {
      title: "Nhà trai",
      father: "Ông Nguyễn Văn An",
      mother: "Bà Trần Thị Bình",
    },
    bride: {
      title: "Nhà gái",
      father: "Ông Lê Văn Cường",
      mother: "Bà Phạm Thị Dung",
    },
  },
  events: [
    {
      name: "Lễ Vu Quy",
      date: "17.10.2026",
      time: "17:00",
      venue: "Tư gia nhà gái",
      address: "12 Đường Hoa Sữa, Q. Phú Nhuận, TP. Hồ Chí Minh",
    },
    {
      name: "Lễ Thành Hôn",
      date: "18.10.2026",
      time: "11:00",
      venue: "The Grand Palace",
      address: "88 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh",
    },
  ],
  map: {
    venue: "The Grand Palace",
    address: "88 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    lat: 10.7769,
    lng: 106.7009,
    directionsUrl: "https://maps.google.com/?q=10.7769,106.7009",
  },
  gift: {
    groom: {
      bank: "Vietcombank",
      accountName: "NGUYEN MINH ANH",
      accountNumber: "0071000123456",
    },
    bride: {
      bank: "Techcombank",
      accountName: "LE THUY LINH",
      accountNumber: "19031234567890",
    },
  },
  rsvpFields: ["name", "phone", "attending", "guestCount", "message"] as const,
  guestbookSeed: [
    { name: "Hải Anh", message: "Chúc hai bạn trăm năm hạnh phúc, bạc đầu răng long!" },
    { name: "Ngọc Mai", message: "Đám cưới đẹp quá, chúc mừng Minh & Linh nhé!" },
  ],
};

export const frames: Frame[] = [
  { id: "f1", type: "opening", order: 1, enabled: true },
  { id: "f2", type: "hero", order: 2, enabled: true },
  { id: "f3", type: "story", order: 3, enabled: true },
  { id: "f4", type: "photoStack", order: 4, enabled: true },
  { id: "f5", type: "gallery", order: 5, enabled: true },
  { id: "f6", type: "timeline", order: 6, enabled: true },
  { id: "f7", type: "family", order: 7, enabled: true },
  { id: "f8", type: "events", order: 8, enabled: true },
  { id: "f9", type: "countdown", order: 9, enabled: true },
  { id: "f10", type: "map", order: 10, enabled: true },
  { id: "f11", type: "rsvp", order: 11, enabled: true },
  { id: "f12", type: "guestbook", order: 12, enabled: true },
  { id: "f13", type: "gift", order: 13, enabled: true },
  { id: "f14", type: "final", order: 14, enabled: true },
];
