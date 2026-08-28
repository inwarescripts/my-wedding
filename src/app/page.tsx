import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedProjectsGallery } from "@/lib/wedding-config";
import { openingRegistry, type OpeningVariant } from "@/motion/registry/opening-labels";
import { Reveal, Stagger, StaggerItem } from "@/motion/Reveal";
import { AnimatedHeading } from "@/motion/registry/typography";
import { AmbientEffect } from "@/motion/registry/ambient";
import { LandingHeroBackground } from "@/components/LandingHeroBackground";
import { ContactButton } from "@/components/ContactButton";
import { getDemoUrl } from "@/lib/site";

const TITLE =
  "Thiệp mời có tên cô dâu chú rể — Thiệp cưới online đẹp như phim";
const DESCRIPTION =
  "Wedding Studio Một Đời giúp bạn tạo thiệp mời cưới online có tên cô dâu chú rể, mang địa chỉ web và tiêu đề riêng của hai bạn, đẹp như phim trong vài phút — không cần biết code. Miễn phí dùng thử, có RSVP, sổ lưu bút, mừng cưới online, nhạc nền, hiệu ứng 3D.";
const KEYWORDS =
  "thiệp mời có tên cô dâu chú rể, thiệp cưới có tên cô dâu chú rể, thiệp mời tên cô dâu chú rể, thiệp cưới in tên, thiệp mời in tên cô dâu chú rể, thiệp cưới ghi tên cô dâu chú rể, mẫu thiệp mời có tên riêng, thiệp mời online, thiệp mời online đẹp, thiệp mời online đẹp nhất, thiệp cưới online, thước phim online, thiệp online, tạo website cưới, thiệp cưới điện tử, mẫu thiệp cưới 3d, thiệp cưới digital, thiệp cưới cá nhân hóa tên";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: baseUrl },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: baseUrl,
    siteName: "Wedding Studio Một Đời",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Wedding Studio Một Đời" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildJsonLdGraph(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Wedding Studio Một Đời",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/icon.png`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Wedding Studio Một Đời",
        description: DESCRIPTION,
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "vi-VN",
      },
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: {
          "@type": "Thing",
          name: "Thiệp cưới online và Website đám cưới",
        },
        inLanguage: "vi-VN",
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Thiệp cưới online là gì?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Thiệp cưới online (hay thiệp mời điện tử) là phiên bản kỹ thuật số của thiệp cưới truyền thống, thường dưới dạng một trang web (website cưới). Khách mời có thể xem thông tin lễ cưới, hình ảnh cô dâu chú rể, bản đồ địa điểm, nhạc nền và thực hiện RSVP (xác nhận tham dự) trực tiếp trên điện thoại hoặc máy tính.",
            },
          },
          {
            "@type": "Question",
            name: "Làm sao để tạo thiệp mời online đẹp nhất?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Để tạo thiệp mời online đẹp nhất tại Wedding Studio Một Đời, bạn chỉ cần 3 bước: 1. Chọn mẫu thiệp cưới 3D hoặc giao diện thước phim trực quan. 2. Tải lên album ảnh cưới của bạn và chỉnh sửa thông tin (ngày giờ, địa điểm). 3. Tùy chỉnh nhạc nền, hiệu ứng và xuất bản website cưới để gửi link cho bạn bè.",
            },
          },
          {
            "@type": "Question",
            name: "Thiệp online có những tính năng gì nổi bật?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Các mẫu thiệp mời online tại Wedding Studio Một Đời tích hợp sẵn nhiều tính năng thông minh bao gồm: form RSVP xác nhận tham dự tự động, sổ lưu bút kỹ thuật số, mã QR mừng cưới online, tích hợp Google Maps chỉ đường, và hiệu ứng cuộn trang sống động như một thước phim điện ảnh.",
            },
          },
          {
            "@type": "Question",
            name: "Website cưới có địa chỉ riêng mang tên cô dâu chú rể không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Có. Mỗi thiệp cưới online tại Wedding Studio Một Đời được cấp một địa chỉ web (subdomain) riêng đặt theo tên cô dâu chú rể, ví dụ tien-minh.motdoi.click, giúp khách mời dễ nhớ và bạn chỉ cần copy link để gửi qua Zalo, Messenger hay in lên thiệp giấy.",
            },
          },
          {
            "@type": "Question",
            name: "Thiệp mời có tên cô dâu chú rể không?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Có. Toàn bộ thiệp mời tại Wedding Studio Một Đời đều tự động in tên cô dâu chú rể ở tiêu đề, màn hình mở đầu, phần đếm ngược và lời cảm ơn — không phải mẫu thiệp chung chung. Bạn chỉ cần điền tên một lần, hệ thống tự động hiển thị xuyên suốt toàn bộ thiệp mời.",
            },
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${baseUrl}/#howto`,
        name: "Làm sao để tạo thiệp mời online đẹp nhất",
        description: "Hướng dẫn chi tiết 3 bước tạo website cưới và thiệp mời online chuyên nghiệp tại Wedding Studio Một Đời.",
        step: [
          {
            "@type": "HowToStep",
            name: "Bước 1: Chọn mẫu giao diện",
            text: "Chọn mẫu thiệp cưới 3D hoặc giao diện thước phim trực quan phù hợp với phong cách của bạn."
          },
          {
            "@type": "HowToStep",
            name: "Bước 2: Tải lên ảnh và chỉnh sửa nội dung",
            text: "Tải lên album ảnh cưới của bạn và chỉnh sửa các thông tin quan trọng như ngày giờ, địa điểm tổ chức."
          },
          {
            "@type": "HowToStep",
            name: "Bước 3: Tùy chỉnh và xuất bản",
            text: "Tùy chỉnh nhạc nền, hiệu ứng đặc biệt và xuất bản website cưới để lấy link gửi cho khách mời."
          }
        ]
      }
    ],
  };
}

function SemanticSEOContent() {
  return (
    <div className="bg-ivory-deep border-t border-line/50 py-12 relative overflow-hidden" suppressHydrationWarning>
      <div className="mx-auto max-w-6xl px-6 md:px-10 relative z-10">
        <div className="max-w-4xl mx-auto space-y-10 text-sm text-ink-soft leading-relaxed">
          
          <header className="text-center space-y-4">
            <h2 className="font-heading text-2xl italic text-ink md:text-3xl">
              Nền tảng tạo <span className="text-accent">thiệp mời có tên cô dâu chú rể</span> đẹp nhất
            </h2>
            <p className="text-base text-ink-soft font-serif">
              Wedding Studio Một Đời tự hào là công cụ thiết kế website cưới chuyên nghiệp, mang đến trải nghiệm
              tạo <strong>thiệp cưới online</strong> sống động như một <strong>thước phim online</strong>,
              in đúng <strong>tên cô dâu chú rể</strong> xuyên suốt từ tiêu đề, trang bìa đến lời cảm ơn.
              Gửi gắm tình yêu qua từng điểm chạm kỹ thuật số tinh tế, tối ưu hiển thị hoàn hảo trên mọi thiết bị di động.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-line/30">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-ink">Vì sao nên chọn thiệp cưới online?</h3>
              <p>Khác biệt với thiệp giấy truyền thống, <strong>thiệp online</strong> mang lại những ưu điểm vượt trội:</p>
              <ul className="list-disc pl-5 space-y-2 text-ink-soft">
                <li><strong>Tiết kiệm chi phí và thời gian:</strong> Khởi tạo nhanh chóng, gửi đến hàng trăm khách mời chỉ bằng một cú click chuột qua link hoặc mã QR.</li>
                <li><strong>Trải nghiệm tương tác đa chiều:</strong> Tích hợp âm thanh, hiệu ứng 3D, thư viện ảnh cưới sắc nét và các hiệu ứng chuyển cảnh điện ảnh.</li>
                <li><strong>Quản lý khách mời dễ dàng:</strong> Tính năng RSVP giúp theo dõi chính xác số lượng khách tham dự để chuẩn bị cỗ cưới chu đáo.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-ink">Tính năng thông minh cho website cưới</h3>
              <p>Hệ thống mẫu <strong>thiệp mời online đẹp</strong> của chúng tôi được trang bị các tính năng cao cấp:</p>
              <ul className="list-disc pl-5 space-y-2 text-ink-soft">
                <li><strong>Sổ lưu bút kỹ thuật số:</strong> Khách mời để lại lời chúc trực tiếp trên website.</li>
                <li><strong>Mừng cưới online an toàn:</strong> Tích hợp mã QR chuyển khoản ngân hàng tinh tế và bảo mật.</li>
                <li><strong>Chỉ đường Google Maps:</strong> Bản đồ định vị chính xác địa điểm tổ chức hôn lễ và tiệc cưới.</li>
              </ul>
            </section>
          </div>

          <section className="pt-8 border-t border-line/30 space-y-6">
            <h2 className="font-heading text-xl italic text-ink text-center">
              Giải đáp thắc mắc về thiệp mời online
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Thiệp cưới online là gì?</h4>
                <p>Thiệp cưới online (thiệp mời điện tử) là phiên bản kỹ thuật số của thiệp truyền thống dưới dạng website. Khách mời có thể xem hình ảnh, thông tin và thực hiện RSVP trực tiếp trên điện thoại.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Làm sao để tạo thiệp mời online đẹp nhất?</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>Bước 1:</strong> Chọn mẫu thiệp cưới 3D hoặc giao diện thước phim trực quan.</li>
                  <li><strong>Bước 2:</strong> Tải lên album ảnh cưới và chỉnh sửa thông tin (ngày giờ, địa điểm).</li>
                  <li><strong>Bước 3:</strong> Tùy chỉnh nhạc nền, hiệu ứng và xuất bản website cưới để gửi link.</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Có thể dùng thử miễn phí không?</h4>
                <p>Hoàn toàn có thể. Wedding Studio Một Đời cho phép bạn tạo, chỉnh sửa và xem trước toàn bộ website cưới hoàn toàn miễn phí trước khi quyết định nâng cấp gói dịch vụ.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Mất bao lâu để hoàn thiện thiệp?</h4>
                <p>Với trình kiến tạo trực quan (Kéo & Thả), bạn không cần biết lập trình. Quá trình thay ảnh và điền thông tin chỉ mất từ 10 đến 15 phút để có một website cưới hoàn chỉnh.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Website cưới có địa chỉ riêng mang tên cô dâu chú rể không?</h4>
                <p>
                  Có. Mỗi thiệp được cấp riêng 1 địa chỉ dạng{" "}
                  <strong className="text-ink">tên-cô-dâu-chú-rể.motdoi.click</strong>, dễ nhớ,
                  dễ đọc — chỉ cần copy và gửi cho bạn bè, khách mời qua Zalo, Messenger hoặc in lên thiệp giấy.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-ink text-base">Thiệp mời có tên cô dâu chú rể không?</h4>
                <p>
                  Có. Mọi <strong className="text-ink">thiệp mời tại Wedding Studio Một Đời đều có tên cô dâu chú rể</strong>{" "}
                  tự động hiển thị ở tiêu đề, màn hình mở đầu, đếm ngược ngày cưới và lời cảm ơn — bạn chỉ
                  điền tên một lần duy nhất, không phải mẫu thiệp chung chung như thiệp giấy in sẵn.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const projects = await getPublishedProjectsGallery();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";
  const jsonLd = buildJsonLdGraph(baseUrl);

  return (
    <div className="bg-ivory">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line/0 bg-ivory/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <span className="font-script text-2xl text-accent">Wedding Studio Một Đời</span>
          <div className="flex items-center gap-2">
            <Link
              href="/cam-nang-cuoi"
              className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
            >
              Cẩm nang cưới
            </Link>
            <ContactButton
              className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
            />
            <Link
              href="/admin/login"
              className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-10 text-center md:pb-32 md:pt-16">
        <LandingHeroBackground />
        <AmbientEffect variant="sparkle" />
        <div className="relative z-10">
          <Reveal preset="fade">
            <p className="font-script text-3xl text-accent md:text-4xl">
              Câu chuyện của bạn, kể bằng hình ảnh
            </p>
          </Reveal>
          <Reveal preset="fade" delay={0.05}>
            <span className="mx-auto mt-3 block h-px w-14 bg-accent-soft" />
          </Reveal>
          <AnimatedHeading
            as="h1"
            variant="wordReveal"
            className="mx-auto mt-4 max-w-3xl font-heading text-4xl italic leading-[1.15] text-ink md:text-6xl"
          >
            Thiệp mời có tên cô dâu chú rể, đẹp như phim trong vài phút
          </AnimatedHeading>
          <Reveal preset="fadeUp" delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg text-ink-soft md:text-xl">
              Chọn một mẫu thiệp, đổi ảnh và nội dung của riêng bạn, rồi gửi cho
              khách mời một trải nghiệm mời cưới trực tuyến mượt mà, tinh tế —
              không cần biết code.
            </p>
          </Reveal>
          <Reveal preset="fadeUp" delay={0.22}>
            <p className="mx-auto mt-4 max-w-lg font-serif text-ink-soft">
              Sở hữu ngay địa chỉ web mang tên riêng của hai bạn — ví dụ{" "}
              <strong className="font-heading text-ink">tiến-minh.motdoi.click</strong>{" "}
              — chỉ cần copy và gửi cho bạn bè.
            </p>
          </Reveal>
          <Reveal preset="fade" delay={0.3}>
            <a
              href="#templates"
              className="mt-10 inline-flex items-center gap-3 border border-ink px-8 py-4 text-sm uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              Xem các mẫu thiệp
              <span aria-hidden>↓</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* Template gallery */}
      <section id="templates" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-script text-3xl text-accent md:text-4xl">
              Chọn mẫu & Tạo thiệp mời của bạn
            </p>
            <p className="mx-auto mt-3 max-w-md font-serif text-ink-soft">
              Mỗi mẫu là một website cưới thật, xem demo trực tiếp trước khi
              quyết định.
            </p>
          </div>

          <Stagger className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            <StaggerItem preset="fadeUp">
              <Link
                href="/admin/login"
                className="group flex h-full flex-col overflow-hidden border border-dashed border-accent-soft bg-ivory-deep/60 transition-colors hover:border-accent"
              >
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 px-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-soft via-accent to-accent-soft text-2xl text-ivory shadow-sm">
                    ✨
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-accent">
                      Chưa có mẫu
                    </p>
                    <p className="mt-2 font-heading text-2xl italic text-ink">
                      Tạo thiệp mới
                    </p>
                    <p className="mt-2 font-serif text-sm text-ink-soft">
                      Bắt đầu nhanh với trình thiết kế.
                    </p>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-2 border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors group-hover:bg-ink group-hover:text-ivory">
                    Thiết kế ngay
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </StaggerItem>
            {projects.map((project) => {
              const demoUrl = getDemoUrl(project.slug);
              const openingLabel = project.openingVariant
                ? openingRegistry[project.openingVariant as OpeningVariant]?.label
                : undefined;
              return (
              <StaggerItem key={project.slug} preset="fadeUp">
                <div className="group">
                  <Link href={demoUrl} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep shadow-flat transition-shadow duration-500 group-hover:shadow-[0_20px_40px_-16px_rgb(43_38_33_/_0.25)]">
                      {project.coverImage && (
                        <Image
                          src={project.coverImage}
                          alt={project.displayName}
                          fill
                          // Deliberately larger than the card's real ~362px
                          // render width — leaves headroom for the hover
                          // scale-[1.04] transform and fractional desktop DPR
                          // (125%/150% Windows scaling) so the image is never
                          // upsampled past its own source resolution.
                          sizes="(min-width: 1024px) 500px, (min-width: 640px) 60vw, 100vw"
                          quality={100}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      )}
                      {/* Darken only the lower third so the photo itself stays
                          bright and crisp instead of muddied edge-to-edge. */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                      <span className="absolute right-4 top-4 border border-ivory/40 bg-ink/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm">
                        Live
                      </span>
                      <span className="absolute left-4 top-4 flex flex-col items-start gap-0 rounded-lg bg-gradient-to-br from-accent to-[#8a5f47] px-3 py-1.5 shadow-md ring-1 ring-ivory/30">
                        <span className="text-[9px] uppercase leading-none tracking-[0.15em] text-ivory/75">
                          Chỉ từ
                        </span>
                        <span className="flex items-baseline gap-0.5 font-heading text-base italic leading-tight text-ivory">
                          199K
                        </span>
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-ivory">
                        <div>
                          <p className="font-heading text-2xl italic drop-shadow-sm">
                            {project.displayName}
                          </p>
                          <p className="mt-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/85">
                            <span className="h-px w-4 bg-ivory/50" />
                            {formatDate(project.weddingDate)}
                          </p>
                        </div>
                        {openingLabel && (
                          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-ivory/30 bg-ink/40 px-3 py-1 text-right text-[10px] text-ivory/90 backdrop-blur-sm">
                            <span aria-hidden>✨</span>
                            {openingLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between pt-5">
                    <Link
                      href={demoUrl}
                      className="group/cta inline-flex items-center gap-2 border border-ink px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ivory"
                    >
                      Xem demo
                      <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5">
                        →
                      </span>
                    </Link>
                    <ContactButton
                      demoUrl={demoUrl}
                      label="Chi tiết"
                      className="text-xs uppercase tracking-[0.2em] text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
                    />
                  </div>
                </div>
              </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Pricing note */}
      <section className="border-t border-line bg-ivory px-6 py-12 text-center md:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="font-serif text-base leading-relaxed text-ink-soft md:text-lg">
            Giá đã bao gồm <strong className="font-heading text-ink">toàn bộ mẫu thiệp</strong> — bạn có thể
            tuỳ ý đổi mẫu, chỉnh sửa nội dung, hình ảnh và hiệu ứng theo sở thích riêng. Hãy{" "}
            <strong className="font-heading text-ink">liên hệ qua Zalo</strong> để admin tạo tài khoản cho bạn
            chỉnh sửa nhanh chóng.
          </p>
          <div className="mt-6 flex justify-center">
            <ContactButton
              label="Liên hệ Zalo"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-line bg-ivory-deep px-6 py-20 text-center md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-accent-soft"
        />
        <Reveal preset="fadeUp">
          <span className="font-script text-2xl text-accent">Mỗi câu chuyện đều đáng kể</span>
          <p className="mx-auto mt-3 max-w-lg font-heading text-3xl italic text-ink md:text-4xl">
            Sẵn sàng kể câu chuyện của riêng bạn?
          </p>
          <p className="mx-auto mt-4 max-w-md font-serif text-ink-soft">
            Tạo website cưới của bạn ngay hôm nay — đẹp, mượt, và mang đúng
            dấu ấn của hai bạn.
          </p>
          <Link
            href="/admin/login"
            className="mt-8 inline-block border border-ink bg-ink px-10 py-4 text-sm uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
          >
            Bắt đầu tạo thiệp
          </Link>
        </Reveal>
      </section>

      <SemanticSEOContent />

      <footer className="flex items-center justify-center gap-3 border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        <span className="font-script text-base text-accent">W</span>
        © {new Date().getFullYear()} Wedding Studio Một Đời.
      </footer>
    </div>
  );
}
