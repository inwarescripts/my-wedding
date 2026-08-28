import type { ReactNode } from "react";

// JSX bodies, not plain strings — a checklist needs real <ul>/<li>
// structure to read well and to mark up cleanly for search (list rich
// results), which a markdown-in-a-data-file approach would need a parser
// for. Keyed by slug so [slug]/page.tsx can look one up without a switch.
export const guideArticles: Record<string, () => ReactNode> = {
  "chuan-bi-dam-cuoi-can-nhung-gi": ChuanBiDamCuoi,
  "le-an-hoi-can-chuan-bi-gi": LeAnHoi,
  "nha-trai-can-chuan-bi-gi": NhaTrai,
  "nha-gai-can-chuan-bi-gi": NhaGai,
  "thu-tu-nghi-le-dam-cuoi-truyen-thong": ThuTuNghiLe,
};

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-2xl italic text-ink mt-10 mb-4">{children}</h2>;
}
function P({ children }: { children: ReactNode }) {
  return <p className="text-ink-soft leading-relaxed mb-4">{children}</p>;
}
function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 text-ink-soft mb-4">{children}</ul>;
}

function ChuanBiDamCuoi() {
  return (
    <>
      <P>
        Một đám cưới trọn vẹn không phải chuyện chuẩn bị trong vài tuần. Đa số các cặp đôi bắt đầu
        lên kế hoạch từ <strong className="text-ink">6-12 tháng trước ngày cưới</strong> để có đủ
        thời gian đặt được địa điểm, ekip và trang phục ưng ý mà không bị vội. Dưới đây là danh
        sách những việc cần làm, sắp xếp theo mốc thời gian.
      </P>

      <H2>6 tháng trước ngày cưới</H2>
      <UL>
        <li>Chốt ngân sách tổng cho đám cưới và phân bổ cho từng khoản (tiệc, trang phục, ảnh cưới, thiệp mời...).</li>
        <li>Xem ngày cưới hợp tuổi hai bên, thống nhất giữa hai gia đình.</li>
        <li>Đặt địa điểm tổ chức tiệc (nhà hàng, trung tâm sự kiện) — mùa cưới cao điểm thường phải đặt trước 4-6 tháng.</li>
        <li>Lên danh sách khách mời sơ bộ để ước tính số bàn tiệc.</li>
        <li>Đặt ekip chụp ảnh cưới và quay phim.</li>
      </UL>

      <H2>3-4 tháng trước ngày cưới</H2>
      <UL>
        <li>Chụp ảnh cưới, chọn váy cưới/vest chú rể.</li>
        <li>Thiết kế và đặt in thiệp cưới (hoặc tạo thiệp mời online để tiết kiệm chi phí in ấn).</li>
        <li>Chốt thực đơn tiệc cưới với nhà hàng, đặt cọc.</li>
        <li>Chuẩn bị sính lễ, tráp ăn hỏi nếu tổ chức lễ ăn hỏi riêng trước lễ cưới.</li>
        <li>Đặt xe hoa, xe đón đưa họ hàng.</li>
      </UL>

      <H2>1-2 tháng trước ngày cưới</H2>
      <UL>
        <li>Gửi thiệp mời — nên gửi trước tối thiểu 3-4 tuần để khách sắp xếp lịch.</li>
        <li>Đặt nhẫn cưới, trang sức, phụ kiện cô dâu.</li>
        <li>Đặt hoa cưới, trang trí gia tiên và trang trí tiệc.</li>
        <li>Thử váy/vest lần cuối, chỉnh sửa nếu cần.</li>
        <li>Xác nhận lại số bàn tiệc chính thức với nhà hàng.</li>
      </UL>

      <H2>Tuần cuối và ngày cưới</H2>
      <UL>
        <li>Chuẩn bị phong bao mừng cưới, sổ ký tên/lưu bút cho khách mời.</li>
        <li>Phân công người phụ trách đón khách, quản lý quà mừng.</li>
        <li>Kiểm tra lại toàn bộ timeline trong ngày với MC/ekip.</li>
        <li>Chuẩn bị bài phát biểu của đại diện hai gia đình.</li>
      </UL>

      <H2>Mẹo nhỏ giúp việc chuẩn bị nhẹ nhàng hơn</H2>
      <P>
        Nhiều cặp đôi hiện nay chọn tạo một <strong className="text-ink">website cưới hoặc thiệp mời
        online</strong> song song với thiệp giấy — vừa giúp khách mời dễ dàng xem thông tin lễ cưới,
        bản đồ đường đi, vừa có thể xác nhận tham dự (RSVP) trực tuyến để cô dâu chú rể chốt số bàn
        chính xác hơn, tránh dư hoặc thiếu bàn tiệc vào phút chót.
      </P>
    </>
  );
}

function LeAnHoi() {
  return (
    <>
      <P>
        Lễ ăn hỏi (còn gọi là đám hỏi) là nghi lễ nhà trai mang sính lễ sang nhà gái để chính thức
        xin phép được kết thông gia, diễn ra trước lễ cưới chính thức thường vài tuần đến vài tháng.
      </P>

      <H2>Sính lễ ăn hỏi gồm những gì?</H2>
      <P>
        Sính lễ được đựng trong các tráp (quả) sơn son hoặc phủ vải đỏ, số lượng tráp phải là số lẻ
        (theo quan niệm miền Bắc) hoặc số chẵn (một số vùng miền Nam), phổ biến nhất là 5, 7, 9 hoặc
        11 tráp. Các lễ vật thường gồm:
      </P>
      <UL>
        <li><strong className="text-ink">Trầu cau</strong> — lễ vật bắt buộc, tượng trưng cho lời thề nguyện thủy chung.</li>
        <li><strong className="text-ink">Rượu và thuốc lá</strong> — để nhà gái thắp hương gia tiên.</li>
        <li><strong className="text-ink">Bánh cưới</strong> — bánh cốm, bánh phu thê, bánh đậu xanh tùy vùng miền.</li>
        <li><strong className="text-ink">Hoa quả</strong> — mâm ngũ quả tươi, được chọn kỹ về hình thức.</li>
        <li><strong className="text-ink">Trà, mứt sen</strong> — lễ vật truyền thống ở nhiều vùng.</li>
        <li><strong className="text-ink">Lễ đen (tiền nạp tài)</strong> — phong bì tiền mặt, số tiền do hai gia đình thống nhất trước.</li>
        <li><strong className="text-ink">Tráp trang sức</strong> — nếu nhà trai muốn trao nhẫn/vòng cho cô dâu ngay trong lễ ăn hỏi.</li>
      </UL>

      <H2>Đội bê tráp cần chuẩn bị gì?</H2>
      <P>
        Mỗi tráp cần một nam thanh niên bên nhà trai bê sang và một nữ thanh niên bên nhà gái đỡ
        tráp lại — số lượng người bê tráp hai bên phải bằng nhau, thường là người chưa lập gia đình.
        Đội bê tráp nên mặc trang phục đồng bộ (áo dài hoặc vest), và hai bên có thể trao phong bao
        lì xì nhỏ cho nhau như một nghi thức “trả duyên”.
      </P>

      <H2>Trình tự một lễ ăn hỏi cơ bản</H2>
      <UL>
        <li>Đoàn nhà trai mang tráp đến nhà gái đúng giờ đã hẹn (giờ lành đã xem trước).</li>
        <li>Trao tráp, đại diện hai gia đình phát biểu, giới thiệu thành phần tham dự.</li>
        <li>Nhà gái nhận lễ, mở tráp, đặt một phần lễ vật lên bàn thờ gia tiên.</li>
        <li>Cô dâu ra mắt hai họ, nhà trai có thể trao trang sức cho cô dâu.</li>
        <li>Thắp hương gia tiên nhà gái, hai gia đình bàn bạc thống nhất ngày giờ đón dâu.</li>
        <li>Nhà gái “lại quả” — chia lại một phần lễ vật cho nhà trai mang về (theo số lẻ, tránh dùng kéo cắt mà xé hoặc bẻ bằng tay).</li>
        <li>Dùng cơm thân mật giữa hai gia đình (tùy điều kiện, không bắt buộc).</li>
      </UL>
    </>
  );
}

function NhaTrai() {
  return (
    <>
      <P>
        Nhà trai giữ vai trò chủ động trong hầu hết các nghi lễ truyền thống — từ dạm ngõ, ăn hỏi
        đến đón dâu. Dưới đây là những việc nhà trai cần chuẩn bị qua từng giai đoạn.
      </P>

      <H2>Lễ dạm ngõ</H2>
      <UL>
        <li>Chuẩn bị một cơi trầu, chai rượu và ít bánh kẹo mang sang nhà gái ra mắt, đặt vấn đề hôn sự.</li>
        <li>Thành phần tham dự thường gọn nhẹ: bố mẹ chú rể, chú rể và một vài người thân thiết.</li>
        <li>Bàn bạc sơ bộ với nhà gái về ngày ăn hỏi, ngày cưới dự kiến.</li>
      </UL>

      <H2>Lễ ăn hỏi</H2>
      <UL>
        <li>Chuẩn bị đầy đủ sính lễ (tráp ăn hỏi) theo thống nhất với nhà gái — xem chi tiết ở bài “Lễ ăn hỏi cần chuẩn bị những gì”.</li>
        <li>Chọn đội bê tráp là nam thanh niên chưa lập gia đình, số lượng tương ứng số tráp.</li>
        <li>Chuẩn bị bài phát biểu ngắn gọn của đại diện nhà trai (thường là bác/chú lớn tuổi có vai vế).</li>
        <li>Sắp xếp phương tiện di chuyển đúng giờ lành đã xem.</li>
      </UL>

      <H2>Lễ xin dâu và đón dâu</H2>
      <UL>
        <li>Chuẩn bị một tráp trầu cau nhỏ cho lễ xin dâu (đại diện nhà trai đến trước để “xin phép” trước khi đoàn đón dâu chính thức vào nhà).</li>
        <li>Chuẩn bị hoa cưới, xe hoa và đoàn xe đưa đón đúng số lượng khách mời đi cùng.</li>
        <li>Chuẩn bị phong bao mừng để bố mẹ chú rể trao cho cô dâu, thể hiện sự chào đón thành viên mới.</li>
        <li>Trang trí phòng cưới, bàn thờ gia tiên tại nhà trai để làm lễ ra mắt tổ tiên khi đón dâu về.</li>
      </UL>

      <H2>Tiệc cưới và ngày cưới</H2>
      <UL>
        <li>Phối hợp với nhà hàng/đơn vị tổ chức để chốt timeline chương trình.</li>
        <li>Chuẩn bị bài phát biểu cảm ơn quan khách của đại diện nhà trai.</li>
        <li>Bố trí người đón tiếp, ghi nhận mừng cưới từ phía khách mời của nhà trai.</li>
        <li>Sau lễ cưới vài ngày, sắp xếp lễ lại mặt — đôi vợ chồng mới cùng về thăm và cảm ơn nhà gái.</li>
      </UL>
    </>
  );
}

function NhaGai() {
  return (
    <>
      <P>
        Nếu nhà trai chủ động về sính lễ và di chuyển, nhà gái lại là bên chuẩn bị không gian tiếp
        đón, của hồi môn và tâm lý cho cô dâu. Dưới đây là những việc nhà gái nên chuẩn bị.
      </P>

      <H2>Trước lễ ăn hỏi</H2>
      <UL>
        <li>Thống nhất với nhà trai số lượng tráp, thành phần sính lễ để tránh so bì, hiểu lầm giữa hai bên.</li>
        <li>Chuẩn bị đội đỡ tráp — nữ thanh niên chưa lập gia đình, số lượng tương ứng đội bê tráp nhà trai.</li>
        <li>Dọn dẹp, trang hoàng bàn thờ gia tiên để đặt lễ vật khi nhà trai mang sang.</li>
        <li>Chuẩn bị mâm “lại quả” để chia bớt lễ vật gửi nhà trai mang về sau lễ ăn hỏi.</li>
      </UL>

      <H2>Của hồi môn cho cô dâu</H2>
      <P>
        Của hồi môn là tài sản, vật phẩm cha mẹ cô dâu trao cho con gái trước khi về nhà chồng —
        có thể là trang sức, tiền mặt, hoặc vật dụng cần thiết cho cuộc sống mới. Đây không phải là
        điều bắt buộc, tuỳ vào điều kiện và truyền thống mỗi gia đình, thường được trao kín đáo
        trong ngày đón dâu.
      </P>

      <H2>Lễ vu quy (lễ đón dâu tại nhà gái)</H2>
      <UL>
        <li>Trang trí cổng nhà, phông nền chụp ảnh, bàn thờ gia tiên trang trọng.</li>
        <li>Chuẩn bị mâm quả đáp lễ nếu theo phong tục địa phương.</li>
        <li>Sắp xếp thời gian biểu đón tiếp nhà trai, tránh để đoàn chờ đợi lâu.</li>
        <li>Chuẩn bị lời dặn dò, tâm sự của cha mẹ dành cho cô dâu trước khi lên xe hoa.</li>
        <li>Bố trí người thân đưa cô dâu về nhà chồng (thường là người có gia đình hạnh phúc, theo quan niệm mang may mắn).</li>
      </UL>

      <H2>Ngày tiệc cưới</H2>
      <UL>
        <li>Chuẩn bị trang phục cho cha mẹ, người thân tham dự tiệc bên nhà trai (nếu tổ chức chung) hoặc tiệc riêng bên nhà gái.</li>
        <li>Ghi nhận danh sách khách mời và mừng cưới của nhà gái để tiện cảm ơn sau này.</li>
        <li>Giữ liên lạc với nhà trai để nắm timeline chương trình, tránh bị động.</li>
      </UL>
    </>
  );
}

function ThuTuNghiLe() {
  return (
    <>
      <P>
        Một đám cưới truyền thống Việt Nam đầy đủ thường trải qua các nghi lễ theo thứ tự dưới đây,
        dù không phải gia đình nào cũng thực hiện đủ tất cả — nhiều cặp đôi hiện đại gộp một số lễ
        lại để tinh giản.
      </P>

      <H2>1. Lễ dạm ngõ (chạm ngõ)</H2>
      <P>
        Buổi gặp mặt đầu tiên giữa hai gia đình để chính thức đặt vấn đề hôn nhân, thường diễn ra
        vài tháng trước lễ cưới, thành phần tham dự gọn nhẹ.
      </P>

      <H2>2. Lễ ăn hỏi (đám hỏi)</H2>
      <P>
        Nhà trai mang sính lễ sang nhà gái, chính thức xin phép kết thông gia và thống nhất ngày
        giờ cưới. Xem chi tiết ở bài “Lễ ăn hỏi cần chuẩn bị những gì”.
      </P>

      <H2>3. Lễ xin dâu</H2>
      <P>
        Diễn ra ngay trước giờ đón dâu — đại diện nhà trai mang một tráp trầu cau nhỏ đến trước để
        “xin phép” nhà gái, báo hiệu đoàn đón dâu chính thức sắp đến.
      </P>

      <H2>4. Lễ đón dâu (vu quy / rước dâu)</H2>
      <P>
        Đoàn nhà trai đến đón cô dâu về nhà chồng, làm lễ gia tiên tại nhà gái trước khi cô dâu lên
        xe hoa. Đây thường là nghi lễ được chụp ảnh, quay phim nhiều nhất trong ngày cưới.
      </P>

      <H2>5. Lễ thành hôn (tân hôn) tại nhà trai</H2>
      <P>
        Cô dâu về đến nhà chồng, làm lễ ra mắt gia tiên nhà trai — chính thức trở thành thành viên
        mới của gia đình.
      </P>

      <H2>6. Tiệc cưới (đãi khách)</H2>
      <P>
        Buổi tiệc chiêu đãi họ hàng, bạn bè hai bên — có thể tổ chức chung một tiệc hoặc riêng mỗi
        nhà một buổi tùy điều kiện và khoảng cách địa lý.
      </P>

      <H2>7. Lễ lại mặt</H2>
      <P>
        Vài ngày sau lễ cưới (thường 1-4 ngày), đôi vợ chồng mới cùng về thăm nhà gái, mang theo
        chút lễ vật nhỏ để cảm ơn — khép lại trọn vẹn chuỗi nghi lễ cưới hỏi truyền thống.
      </P>
    </>
  );
}
