# Thiết kế lại UI của WP5, kiểm lại độc lập vùng B trên snapshot cuối (B6) — vòng sửa trợ năng, đúng yêu cầu của chủ, độ mạnh của test, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B6.md](WP5_UX_REVIEW_B6.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI theo yêu cầu của chủ trong WP5, task
  WP5-UX-AUDIT-B6, attempt 1, 2026-10-10 (UTC 03:05Z đến khoảng 04:10Z). Reviewer tự báo model `claude-opus-5-5`, profile
  timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Vùng A được kiểm lại riêng (WP5-UX-AUDIT-A6) và
  không nằm trong báo cáo này. Các review vùng B trước, từ [B](WP5_UX_REVIEW_B.vi.md) đến [B5](WP5_UX_REVIEW_B5.vi.md), được
  giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `bf954c0b371ad9a5fe461a603c5d476ea210e66c` (bản freeze của WP5-UX-REGATE5; HEAD = origin/main); digest
  `b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563`, 793 file, không tính `handoff/`, ghi đầu tiên (sau
  `node --version`, 03:05:43Z) và ghi lại sau mọi kiểm tra, bằng nhau ở ba dạng (dạng `git ls-tree`, `scripts/source-digest.mjs`
  trong một scratch clone ở bf954c0 và trong repository làm việc). Không path nào ngoài `handoff/` khác bf954c0; không có
  commit chưa push; 5b349f8 chỉ chạm `handoff/`. Source đủ: scratch clone sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.** Mọi mục của vòng sửa đã đóng khi kiểm bằng phím thật trên cả hai project, giao diện sáng và tối,
  ở 1280, 768, 390 và 320: B5-01..B5-03 (AX-01..AX-03), AX-04..AX-10 và R-12. Các check mới fail trên 5e104e1 đúng vì lỗi của
  chúng. Không assertion nào bị bỏ hay làm yếu kể từ 014bd47. Typecheck, lint, `npm test` (82 file, 1823 test) và e2e đầy đủ
  trên cả hai project đều đạt (lần chạy 2: 208 đạt, 24 bỏ qua, 0 lỗi). Nhưng một lỗi Low trái với docs/04 dòng 48 như đã
  phát hành chặn theo quy tắc mức độ của brief: **WP5-UX-B6-01**. Khi một người có chia sẻ nhận được (nên bộ chuyển "Shared
  with me" nằm trong thanh gọn) và ghi chú múi giờ hiện (múi giờ đang xem khác múi giờ báo cáo), hàng ngày đầu tiên không hiện
  đầy đủ phía trên thanh tab ở 390x844. Đáy hàng ở 830,2px; đỉnh thanh tab ở 788px. Số đo giống hệt ở 5e104e1, nên FIX7 không
  gây ra lỗi này. Các test e2e màn hình đầu đăng nhập bằng tài khoản không có chia sẻ nhận được. Không thấy lỗi chặn nào khác.

## Phạm vi thật đã xem/chạy

1. Xử lý các mục: diff FIX7 `5e104e1..bf954c0` (29 path, `10-…`) và cả vòng `014bd47..bf954c0`. Các probe Playwright của chính
   tôi chạy trên server tôi tự build (cổng 48300-48319), với tài khoản, chia sẻ và ngày tổng hợp do probe tạo:
   - P1: đi Tab và Shift+Tab, kiểm bị che (lưới 5x5 `elementFromPoint`) và vòng focus render ở mọi điểm dừng (ảnh có focus so
     với ảnh không focus, đọc ngang qua từng cạnh).
   - P2: bộ chọn nhãn bằng Enter/mũi tên/Home/End/Escape, dialog trình sửa ngày làm điểm dừng, nút bật tắt đang nhấn, và ô
     ngày/giờ bằng Tab và Shift+Tab, đo so với ảnh chụp trước khi bấm phím.
   - P3: nhãn trong tên trên mọi nút và liên kết.
   - P4: phím trên bộ chuyển, vai trò trạng thái và trả focus.
   - P5: tương phản chữ khi render.
   - P6: reflow và vùng chạm.
   - P7: hành vi modal và thứ tự bàn phím.
   - P8: đi Tab màn Admin.
   - P9: SC 2.5.8 trên desktop và hai thông báo AX-07 mà gate chưa tới được.
   - P10: vùng chạm của nhãn trên điện thoại.
   - P11: màn hình đầu trên điện thoại khi có và không có chia sẻ nhận được, trên bf954c0 và trên 5e104e1.
   - P12: dialog cuộn được (Clock out, xem lại batch) làm điểm dừng bàn phím riêng.
   Tôi chép bản bf954c0 của `keyboard-access.spec.ts`, `dayButton.ts` và `focus-ring.spec.ts` vào một bản gốc ở 5e104e1 và
   chạy chúng ở đó (`30-…`).
2. Vùng B trên toàn snapshot (mục 1-6 của `WP5-UX-AUDIT-B.md`): yêu cầu của chủ và E-1..E-7; độ mạnh test trên mọi file test
   đổi kể từ 014bd47 (`11-…` đến `14-…`); trợ năng; chuẩn UI và deprecation; docs/04, docs/10 và docs/12 cùng sự tương đương
   EN/VI; các kiểm tra bắt buộc.
3. Các rủi ro trong `WP5_UX_REVIEW_B5.md` và các mục FIX7 cố ý để lại, đánh giá lại theo quy tắc mức độ.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che, trong `handoff/delivery/evidence/WP5-UX-AUDIT-B6/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước / sau) | `b7c011d2…a563`, 793 file, bằng nhau | `00-…`, `90-…` |
| `npm ci` / `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / 0 / 0 | `02a-…` đến `02c-…` |
| `npm test` với `--trace-deprecation --pending-deprecation` | exit 0; 82 file, 1823 test; 0 dòng deprecation | `03-…` |
| `npm run test:e2e` lần 1 (build + toàn bộ suite, Edge, hai project, theo dõi deprecation) | exit 1: 207 đạt, 24 bỏ qua, 1 lỗi. Lỗi là desktop `automation.spec.ts:118`, "fetch failed … read ECONNRESET" từ tiến trình test tới server riêng của nó ở yêu cầu đầu tiên sau 9,4 s chạy job (vùng A). Chạy riêng test đó với `--repeat-each=3`: 3 đạt, exit 0 | `04-…`, `04b-…`, `04c-…` |
| `npm run test:e2e` lần 2 (không chạy gì khác) | **exit 0; 232 test: 208 đạt, 24 bỏ qua, 0 lỗi, 0 flaky**; desktop 103 + 13 bỏ qua, mobile 105 + 11 bỏ qua (mọi lần bỏ qua là điều kiện project); 0 dòng deprecation | `05-…`, `05b-…` |
| Check mới của bf954c0 trên bản build 5e104e1 (bản gốc) | exit 1: 36 lỗi, 8 bỏ qua, 2 đạt (AX-09 tối: token tối không đổi). Mỗi lỗi đúng là lỗi của nó: điểm dừng bị che 11/3/25/31 (1280/768/390/320); vòng danh sách 1,21 / 1,15; dialog không có vòng inset; vòng ô ngày "none"; có focus = chỉ đang nhấn; không có nút ngày mang tên mới; ArrowDown chuyển màn; không có `role=alert`; focus không trả về; "Complete" 4,41; nút ngày tràn khỏi ô | `30-…`, `30a-…` |
| P1 đi Tab, desktop 1280/768 và mobile 390/320, sáng và tối | desktop 100 lượt / 3628 điểm dừng, mobile 100 / 3692; **0 bị che hoàn toàn, 0 không có vòng, 0 vòng dưới 3:1** (thấp nhất 4,32); 18 điểm dừng ô ngày/giờ trên điện thoại được đo ở P2 (vòng tính toán của chúng là token, `:focus-visible` true); 14 nút ngày theo thứ tự ngày ở cả 56 lượt đi bảng | `41-…`, `41b-…` đến `41d-…` |
| P2 vòng focus | bộ chọn: vòng danh sách 4,54-7,01 so với trang, vòng inset của option active đủ 4 cạnh 5,86-6,79, option active hiện đầy đủ (25/25) ở mọi vị trí mũi tên, Escape trả về nút mở. Dialog trình sửa: Shift+Tab từ Close tới chính dialog, `:focus-visible`, vòng inset 6,09/6,79 trên 3-4 cạnh. Nút bật tắt đang nhấn: vòng 6,09/6,79 đủ 4 cạnh. Ô ngày/giờ bằng Tab và Shift+Tab: vòng 4 cạnh 5,15-6,79 | `42-…`, `42b-…`, `raw-…p2…` |
| P12 dialog cuộn được (Clock out, xem lại batch; 1280x600 và 320x640; sáng và tối) | Clock out cuộn ở 320x640; Shift+Tab từ điều khiển đầu tới chính dialog, `:focus-visible`, vòng inset 4 cạnh 6,09 / 6,79 | `45-…` |
| P3 tên | 56 + 56 nút ngày tên đúng "{verb} {chữ hiển thị} ({ngày ISO})"; "End share with {tên}" | `43-…`, `43b-…` |
| P4 hành vi (4 độ rộng x 2 giao diện) | bộ chuyển: mũi tên, Home, End, PageDown, gõ chữ đầu và Enter trên ô chọn đều giữ `#/timesheet`, 0 yêu cầu khác GET; Open (Enter hoặc Space) mới chuyển màn. `role=alert` cho lỗi đăng nhập và lỗi Timesheet, `role=status` cho lỗi biểu mẫu chia sẻ. Trả focus: xem lại batch, xem lại nhãn, End share, Leave, Change | `42-…`, `42b-…` |
| P5 tương phản chữ (8 trạng thái x 2 giao diện x 2 project) | 0 dưới 4,5:1; thấp nhất 4,54 (sáng) / 4,67 (tối); "Complete" 6,63 / 5,82 / 5,17 sáng; ô Check 10/10 có chữ và hình | `42-…`, `42b-…`, `46-…` |
| P6 điện thoại 390/375/360/320, 12 trạng thái | 0 cuộn ngang, 0 tràn; AX-10 14 hàng batch, 0 vấn đề, vùng chọn 44x44 | `42b-…`, `raw-…p6…` |
| P7 modal | 768/1024/390/320 `:modal`, 0 điểm dừng Tab ra ngoài; 1280 không modal; focus vào tiêu đề khi mở, Escape trả focus về nút ngày | `42-…`, `42c-…` |
| P9 / P10 | desktop 2.5.8: chỉ có radio nhỏ, đều đạt ngoại lệ khoảng cách. Thông báo chính sách và thông báo quản trị là `role=status`. Checkbox và radio trên điện thoại: 0 trong 18 có vùng nhãn dưới 44x44 | `42c-…` |
| P11 màn hình đầu, 390x844 (bf954c0, rồi 5e104e1) | không có chia sẻ: 676,4 (cùng múi giờ) / 775,4 (có ghi chú múi giờ) ≤ 788. Có chia sẻ nhận được: 731,2 ≤ 788, nhưng **830,2 > 788 khi có ghi chú múi giờ**. Giống hệt trên cả hai snapshot | `44-…`, `44b-…`, ảnh chụp |
| Quét token CSS | 0 literal màu, thời lượng, bo góc hay url ngoài các khối token; `--radius: 4px`; 7/7 transition `var(--transition)`; 0 `var()` không định nghĩa | `20-…` |
| Tương đương EN/VI | docs/04 dòng 48 có cùng các tên trong ngoặc kép ở cả hai; khác biệt còn lại là thứ tự ngày trong câu văn và một ghi chú bản dịch có từ trước trong docs/10 | `60-…` |

## Xử lý B5-01..B5-03, AX-04..AX-10 và R-12

| Mục | Xử lý | Quan sát (bf954c0) |
|---|---|---|
| B5-01 / AX-01 (SC 2.4.11) | **Đã đóng** | 0 điểm dừng bị che hoàn toàn trong 200 lượt đi gồm 7320 điểm dừng. Các lượt đi gồm Tab và Shift+Tab, mọi màn, trình sửa, chia sẻ có quyền sửa và Admin, ở 1280/768/390/320, sáng và tối. `--shell-bar-size` theo đúng thanh (56 / 100 / 106,8px). Scroll padding của `html` là 205,4px (1280, chia sẻ) và 249,4px (768, chia sẻ). Thanh chia sẻ nằm dưới thanh shell từ 768px. Check e2e AX-01 fail trên 5e104e1 (11/3/25/31 bị che) |
| B5-02 / AX-02 (SC 1.4.11, 2.4.7) | **Đã đóng** | Danh sách đang focus có vòng ngoài (4,54-7,01 so với trang). Option active có vòng inset màu nhấn 2px đủ 4 cạnh (5,86-6,79), hiện đầy đủ ở mọi vị trí mũi tên, cả gần đầu và gần cuối trang. Escape trả về nút mở |
| B5-03 / AX-03 (SC 2.4.7) | **Đã đóng** | Dialog trình sửa khi là điểm dừng bàn phím hiện vòng inset (6,09 / 6,79) ở mọi độ rộng. Cạnh trên nằm dưới phần đầu dính của chính nó khi là panel bên; hiện 3 hoặc 4 cạnh. Dialog Clock out cuộn ở 320x640 (P12). Shift+Tab từ điều khiển đầu tới chính dialog với `:focus-visible` và vòng inset render đủ 4 cạnh: 6,09 sáng / 6,79 tối so với nền thẻ, cùng khe trắng so với lớp phủ. Ở 1280x600, và với xem lại batch ở cả hai kích thước, dialog không cuộn và không là điểm dừng (`45-…`) |
| AX-04 (SC 2.4.7) | **Đã đóng** | "Show details" hoặc "Change several days" đang nhấn khi có focus hiện vòng ngoài cùng viền nhấn (6,09 / 6,79). Khi không focus chỉ có viền nhấn |
| AX-05 (SC 2.5.3) | **Đã đóng** | 112 nút ngày tên "Edit 09/28 (2026-09-28)", trên điện thoại "Edit Mon 09/28 (2026-09-28)", "View …" khi chỉ đọc. Nút "End share" tên "End share with {tên}". docs/04 dòng 48 EN và VI khớp. Code chọn ngày bằng `data-day` (`focusDay`) |
| AX-06 (SC 3.2.2) | **Đã đóng** | Không phím nào trên ô chọn đổi màn hình hay gửi yêu cầu; Open mới chuyển màn; các điều khiển chỉ của chủ sở hữu vẫn vắng mặt |
| AX-07 (SC 4.1.3) | **Đã đóng** | Lỗi đăng nhập `role=alert`, là phần tử mới ở mỗi lần sai. Lỗi thao tác Timesheet `role=alert`. Lỗi biểu mẫu chia sẻ, bước đổi chia sẻ, thông báo chính sách trong Settings và thông báo mật khẩu của quản trị là `role=status` (hai mục cuối quan sát được ở đây; gate chưa tới được) |
| AX-08 (SC 2.4.3) | **Đã đóng** | Xem lại batch: Escape/Cancel trả về "Preview changes"; đổi bước đưa focus tới tiêu đề bước; Escape ở xem lại nhãn trả về bộ chọn; End share, Leave và Change trả về nút đã mở. Chỉ gửi yêu cầu xem trước; ngày vẫn là Worked. Import và số dư đầu kỳ: e2e `import.spec.ts` đạt trên cả hai project |
| AX-09 (SC 1.4.3) | **Đã đóng** | `--ok` sáng #136a42 trên mọi token nền sáng đạt ít nhất 5,29 khi không tô và 4,69 dưới lớp tô chọn. "Complete" khi render: 6,63 bình thường, 5,82 đang chọn trên desktop, 5,17 đang chọn trên điện thoại. Giao diện tối không đổi (ít nhất 5,43) |
| AX-10 (SC 1.4.10) | **Đã đóng** | Ở 390/375/360/320 trong chế độ batch: 14 hàng, nút ngày nằm trong ô và không đè nhãn, vùng chọn 44x44, không cuộn ngang |
| R-12 (SC 2.4.7) | **Đã đóng** | Shift+Tab vào "Open a day" và các ô giờ của biểu mẫu phiên: ô chỉ khớp `:focus-within` và hiện vòng (6,09 / 6,79). Phương pháp riêng của tôi xác nhận điều FIX7 nói: sau Shift+Tab, `blur()` để ô vẫn active trên desktop (cả hai chiều trên điện thoại), nên tôi đo so với ảnh chụp trước khi bấm phím |

## Yêu cầu của chủ, E-1..E-7 và điều hướng

- **Bảng desktop (E-1, E-2, E-4, E-6), bố cục điện thoại (E-1, E-3), điều hướng (E-5), phạm vi (E-7):** đạt như ở B5; đã kiểm
  lại trên ảnh chụp probe và assertion e2e (phần đầu biểu mẫu, hai dải thứ Hai-Chủ nhật, các hàng Day/Date/Label/Time/OT/Check,
  ngày nghỉ có gạch chéo, ngày kiểu Mỹ, h:mm, dòng quản lý "Not used yet", ba tab cùng More, Overtime/History/Settings chưa
  đổi kiểu).
- **Màn hình đầu trên điện thoại (docs/04 dòng 48, hướng đã duyệt B-01):** đạt với người không có chia sẻ nhận được, trong cả
  hai trường hợp múi giờ. **Không đạt khi người đó có chia sẻ nhận được và ghi chú múi giờ hiện: WP5-UX-B6-01.**

## Độ mạnh của test

Mọi dòng test bị bỏ kể từ 014bd47 được đánh giá so với dòng thay thế trong `13-test-strength.txt`. FIX7 thay mỗi tên nút ngày
đã đổi bằng `namedDayButton` hoặc `dayButtonName`: cùng ngày, tên neo hai đầu gồm chữ hiển thị và ngày ISO. Không cái nào bị
bỏ. FIX7 thêm 105 dòng expect và không đổi fixture hay config nào. **Kết quả: không assertion nào bị bỏ hay làm yếu kể từ
014bd47.** Không có `.only`, `fixme` hay skip không theo project.

## Trợ năng, chuẩn UI và tài liệu

- Thứ tự bàn phím thứ Hai..Chủ nhật tuần 1 rồi tuần 2: **đạt** (56 lượt đi; P7 điện thoại). Tên, hành vi modal, trả focus, bẫy
  focus của bottom sheet: **đạt**. Focus không bị che: **đạt**. Trạng thái không bao giờ chỉ bằng màu: **đạt**. 44px trên điện
  thoại: **đạt** (checkbox và radio qua nhãn 44px của chúng). Reflow ở 320: **đạt**. Tương phản: **đạt**. Thông báo trạng thái:
  **đạt**.
- Chỉ dùng token, `--radius: 4px`, transition dùng chung, bóng nhiều lớp, giảm chuyển động, phông hệ thống: **đạt**.
  `useBlockSize.ts` dùng `ResizeObserver`, `getBoundingClientRect` và CSSOM `setProperty`/`removeProperty` (không cái nào
  deprecated; CSP cho phép CSSOM). FIX7 dùng `SubmitEvent` và `RefObject`, các kiểu React không deprecated. Không có dòng
  deprecation nào trong lint, `npm test`, build, e2e hay console trình duyệt.
- docs/04 (dòng 14, 41-63, 78-80), docs/10 và docs/12 mô tả đúng UI đã phát hành, tương đương EN/VI. Ngoại lệ là câu về màn
  hình đầu ở dòng 48 trong trạng thái của B6-01.

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-B6-01 | Low | `src/client/components/SharingSwitcher.tsx:26-45` (nhãn "Shared with me", ô chọn, Open) được `AppShell.tsx:165` đặt trong thanh gọn. Thanh xuống dòng (`styles.css:250-262`), và quy tắc cảm ứng làm hàng bộ chuyển cao 60px (`styles.css:578-597`: `label.inline` cao tối thiểu 44 cộng đệm 8px). Cộng ghi chú múi giờ (`PeriodBar.tsx:61`, `styles.css:744-790`), màn hình đầu trên điện thoại vượt 788px. Không do FIX7 gây ra: giống hệt ở 5e104e1 | Project mobile, 390x844, múi giờ thiết bị Asia/Ho_Chi_Minh (múi giờ báo cáo America/Los_Angeles, nên ghi chú múi giờ hiện). Đăng nhập bằng một người được người khác chia sẻ timesheet, rồi mở `#/timesheet` ở đầu trang (`b6c.probe.ts.txt`, `44b-…`, ảnh `b6-first-screen-received-share-zone-note-390-bf954c0-synthetic.png`) | Kỳ vọng (docs/04 dòng 48 EN/VI; plan C; B-01): "hàng ngày đầu tiên hiện đầy đủ phía trên thanh tab ở 390x844". Thực tế: thanh shell cao 106,8px thay vì 52px. Đáy hàng ngày đầu ở 830,2px so với đỉnh thanh tab 788px; chỉ dòng đầu ("Mon") hiện. Không có chia sẻ nhận được: 775,4px. Có chia sẻ nhưng không có ghi chú múi giờ: 731,2px | docs/04 như đã phát hành, dòng 48; hướng đã duyệt (plan C, mockup A2) | Giữ màn hình đầu trên điện thoại trong ngân sách khi bộ chuyển hiện. Ví dụ: chuyển "Shared with me" vào panel More dưới 768px, hoặc làm thanh gọn thành một hàng với nhãn vẫn hiện nhưng gọn (giữ SC 3.3.2 và 2.5.3). Thêm một e2e mobile cho người có chia sẻ nhận được và ghi chú múi giờ ở 390x844: đáy `[data-day]` đầu tiên bằng hoặc trên đỉnh thanh tab. Nếu chủ muốn thu hẹp quy tắc thay vào đó, docs/04 dòng 48 EN/VI cần quyết định của chủ/coordinator (quy tắc 8 của AGENTS) |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-10 hover che vòng (không đổi):** con trỏ nằm trên điều khiển đang focus hiện kiểu hover (Clock in: `--shadow-panel`,
  `:focus-visible` true). Dùng chỉ bằng bàn phím luôn thấy vòng, nên SC 2.4.7 vẫn đạt. Tùy chọn.
- **R-11 vòng bị cắt (hẹp hơn):** 102 trong 7302 điểm dừng đo được hiện 3 cạnh trở xuống. Đó là điều khiển ở mép cuộn, nút ngày
  hôm nay cạnh vạch màu nhấn của nó, vùng cuộn diff của History và các textarea cao. Mọi điểm đều có vòng nhìn thấy. Tùy chọn.
- **R-13 phạm vi của test (đã xử lý một phần):** các spec mới phủ bộ chọn, điểm dừng dialog, nút bật tắt, ô ngày, kiểm bị che và
  trả focus. `parseColour` trong `keyboard-access.spec.ts` vẫn đọc màu không phải `rgb()` thành đen. Tùy chọn.
- **R-14 câu chữ docs/04 (không đổi):** dòng 43 "không có chữ giữ chỗ" so với "no times yet"; dòng 79 "một token dùng chung"
  trong khi có biến thể inset. Tùy chọn.
- **R-15 hàng batch chật trên điện thoại: đóng nhờ AX-10.**
- **R-16 phần thêm của bộ chọn nhãn (đánh giá lại; mục "WFH Note"):** nút mở tên "Label for {date}: {label}" trong khi còn hiện
  dòng thứ hai ("Vacation leave 2:00", "Holiday", "Work from home" trên loại khác) và dấu "Note". Theo SC 2.5.3, nhãn của điều
  khiển là giá trị của nó cùng tiêu đề hàng "Label". Phần thêm là trạng thái bổ sung, và có dạng chữ trong trình sửa ngày và
  trên bảng Review. Vì vậy tôi đánh giá đây không phải lỗi 2.5.3 hay 1.3.1. Khuyến nghị: thêm chúng vào tên hoặc
  `aria-describedby`, để người dùng trình đọc màn hình nghe được ngay trên bảng.
- **R-17 tên của "<" và ">":** "Previous period" / "Next period". Ký tự ký hiệu nằm ngoài SC 2.5.3. Không phải lỗi.
- **R-18 liên kết "Import" trong câu trên màn Overtime (có từ WP4, chưa đổi kiểu theo E-7):** 35,9x16px. Nó nằm trong một câu,
  nên SC 2.5.8 miễn trừ. Nó không thuộc các điều khiển của docs/04 dòng 80 (nút, ô nhập, liên kết điều hướng và liên kết dạng
  nút). Tùy chọn.
- **R-19 lựa chọn của bộ chuyển được giữ:** lựa chọn chưa bấm Open vẫn hiện trên các màn khác của chính người đó. Chú thích trong
  code nói nó đặt lại theo màn; thực tế đặt lại theo chủ chia sẻ. Không đổi ngữ cảnh. Tùy chọn.
- **R-20 Escape ở bước đổi chia sẻ:** bước nằm trong trang này bỏ qua Escape (không phải dialog; Cancel trả focus). Tùy chọn.
- **Thông tin ngoài vùng B:** e2e lần 1 có một ECONNRESET thoáng qua ở `automation.spec.ts:118` (vùng A). Test đó đạt 3/3 khi
  chạy riêng và đạt ở lần 2. `npm ci` báo 1 cảnh báo mức high (không kiểm lại; các review trước đã truy ra một dependency dev).

## Gate chưa chạy/bị chặn và lý do

Không có trong vùng B. Typecheck, lint, `npm test` và toàn bộ e2e trên cả hai project đều chạy ở đây; lần chạy 2 đạt. Vùng A nằm
ngoài review này.

## Xử lý phát hiện trước

WP5-UX-B5-01, B5-02 và B5-03 **đã đóng**. Các mục sweep AX-04..AX-10 **đã đóng**, và rủi ro R-12 của B5 **đã đóng**. R-15 của B5
đóng nhờ AX-10. R-2..R-6, O-4, R-8..R-11, R-13 và R-14 đã được đánh giá lại; không mục nào chặn. O-4 của B5 ("các trạng thái
khác nằm ngoài quy tắc") chưa xét màn hình của chính một người có chia sẻ nhận được. Trạng thái đó nay là WP5-UX-B6-01 (Low,
còn mở). R-16..R-20 là mục mới và tùy chọn.

## Tách sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, vùng B:** chưa. Còn một mục bố cục Low (B6-01); mọi mục trợ năng của vòng sửa đã đóng.
- **Phép của chủ:** không xin, không được cấp; không triển khai, không gửi thư thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** chưa có; chưa chạy pilot.

## Một bước tiếp

Coordinator: quyết định về B6-01. Hoặc mở một task sửa nhỏ (vị trí thanh shell hoặc bộ chuyển trên điện thoại, cùng một e2e ở
390x844 cho người có chia sẻ nhận được và ghi chú múi giờ), rồi freeze, gate và kiểm lại vùng B chỉ cho mục đó cùng một lần
chạy hồi quy. Hoặc hỏi chủ xem có nên thu hẹp docs/04 dòng 48 thay vào đó.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-B6, attempt 1; reviewer tự báo `claude-opus-5-5`
  (subagent mới; agent ID không thấy được từ bên trong). Tác giả được kiểm: WP5-UX-A11Y-SWEEP và WP5-UX-FIX7
  (`claude-opus-5-5`), bản freeze FIX7 và WP5-UX-REGATE5 (`claude-sonnet-5-5`), cùng các tác giả trước của vòng. Model của tôi
  không yếu hơn tác giả mạnh nhất.
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm và không chạy gate,
  sweep hay audit trước nào của vòng này. Tôi không sửa file source, test, doc, board hay STATE nào.
  - Probe của tôi chạy trong một scratch clone ở thư mục task, được loại khỏi git bằng `.git/info/exclude`. Các check trên
    5e104e1 chỉ chạy trong một bản gốc riêng.
  - Các sơ suất quy trình, không cái nào đổi file được theo dõi hay kết quả: bốn output grep bị ghi bằng đường dẫn tương đối vào
    gốc của clone rồi được chuyển ra (`90-…`).
  - Bộ đếm thứ tự desktop của P7 dừng ở các đoạn của ô "Open a day" (lỗi của probe, ở mọi lần chạy); thứ tự desktop lấy từ các
    lượt đi P1.
  - Các lần chạy P4 giao diện tối gặp giới hạn đăng nhập của server sau các lần chạy sáng. Khi đó thông báo nói "Too many failed
    sign-in attempts" và vẫn là `role=alert`.
- **Digest trước/sau; bằng chứng gate của snapshot đó:** `b7c011d2…a563` trước và sau, ba dạng (`00-…`, `90-…`); bằng digest đã
  ghi của WP5-UX-REGATE5.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B6.md` và `.vi.md`, file mới; mọi review trước
  giữ nguyên.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp của coordinator:** B5-01..B5-03, AX-04..AX-10 và R-12 đã đóng. WP5-UX-B6-01 còn
  mở. Tiếp theo: quyết định nêu trên.
