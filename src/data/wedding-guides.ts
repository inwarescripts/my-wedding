export interface WeddingGuideMeta {
  slug: string;
  title: string;
  excerpt: string;
  keywords: string[];
  publishedAt: string;
  readMinutes: number;
}

// Content-marketing pages for organic search — people planning a wedding
// search these exact phrases ("chuẩn bị đám cưới cần những gì", "nhà trai
// chuẩn bị đám cưới"...) long before they search "thiệp cưới online", so
// this is how the site reaches them earlier in that journey. Article
// bodies live in ./guide-articles.tsx (JSX, not plain data — see that
// file's note on why).
export const weddingGuides: WeddingGuideMeta[] = [
  {
    slug: "chuan-bi-dam-cuoi-can-nhung-gi",
    title: "Chuẩn bị đám cưới cần những gì? Checklist chi tiết từ A-Z",
    excerpt:
      "Danh sách đầy đủ những việc cần chuẩn bị cho đám cưới theo từng mốc thời gian — từ 6 tháng trước đến ngày cưới, để hai bạn không bỏ sót điều gì.",
    keywords: [
      "chuẩn bị đám cưới cần những gì",
      "checklist đám cưới",
      "kế hoạch chuẩn bị đám cưới",
      "các bước chuẩn bị đám cưới",
    ],
    publishedAt: "2026-06-01",
    readMinutes: 8,
  },
  {
    slug: "le-an-hoi-can-chuan-bi-gi",
    title: "Lễ ăn hỏi cần chuẩn bị những gì? Sính lễ, tráp, đội bê tráp",
    excerpt:
      "Lễ ăn hỏi (đám hỏi) cần bao nhiêu tráp, sính lễ gồm những gì, nhà trai và nhà gái mỗi bên chuẩn bị ra sao — hướng dẫn chi tiết theo phong tục ba miền.",
    keywords: [
      "lễ ăn hỏi cần chuẩn bị những gì",
      "sính lễ ăn hỏi gồm những gì",
      "tráp ăn hỏi",
      "đội bê tráp",
    ],
    publishedAt: "2026-06-03",
    readMinutes: 7,
  },
  {
    slug: "nha-trai-can-chuan-bi-gi",
    title: "Nhà trai cần chuẩn bị gì cho đám cưới? Từ dạm ngõ đến đón dâu",
    excerpt:
      "Vai trò và trách nhiệm của nhà trai qua từng nghi lễ: dạm ngõ, ăn hỏi, xin dâu, đón dâu — kèm danh sách vật phẩm và nhân sự cần chuẩn bị.",
    keywords: [
      "nhà trai cần chuẩn bị gì cho đám cưới",
      "nhà trai chuẩn bị đám cưới",
      "lễ đón dâu nhà trai",
      "phát biểu nhà trai đám cưới",
    ],
    publishedAt: "2026-06-05",
    readMinutes: 7,
  },
  {
    slug: "nha-gai-can-chuan-bi-gi",
    title: "Nhà gái cần chuẩn bị gì cho đám cưới? Từ ăn hỏi đến lễ vu quy",
    excerpt:
      "Nhà gái cần chuẩn bị gì để đón lễ ăn hỏi, lễ vu quy và tiệc cưới chu đáo — danh sách công việc, của hồi môn và những điều cần lưu ý.",
    keywords: [
      "nhà gái cần chuẩn bị gì cho đám cưới",
      "lễ vu quy cần chuẩn bị gì",
      "của hồi môn",
      "nhà gái chuẩn bị đám cưới",
    ],
    publishedAt: "2026-06-07",
    readMinutes: 6,
  },
  {
    slug: "thu-tu-nghi-le-dam-cuoi-truyen-thong",
    title: "Thứ tự các nghi lễ trong đám cưới truyền thống Việt Nam",
    excerpt:
      "Một đám cưới Việt truyền thống thường trải qua những nghi lễ nào, theo thứ tự ra sao — từ dạm ngõ, ăn hỏi, xin dâu, đón dâu đến lễ lại mặt.",
    keywords: [
      "thứ tự nghi lễ đám cưới",
      "các nghi lễ đám cưới việt nam",
      "trình tự đám cưới truyền thống",
      "lễ lại mặt",
    ],
    publishedAt: "2026-06-09",
    readMinutes: 6,
  },
];

export function getWeddingGuide(slug: string): WeddingGuideMeta | undefined {
  return weddingGuides.find((g) => g.slug === slug);
}
