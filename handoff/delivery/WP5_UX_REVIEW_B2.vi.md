# Thiết kế lại UI của WP5, review lại độc lập khu vực B sau vòng sửa — đúng yêu cầu của chủ, độ mạnh của test, khả năng tiếp cận, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B2.md](WP5_UX_REVIEW_B2.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI của WP5 theo yêu cầu của chủ, task
  WP5-UX-AUDIT-B2, attempt 1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T08:30Z đến 09:05Z). Reviewer tự báo model
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Khu vực A được
  review lại riêng (WP5-UX-AUDIT-A2) và không nằm trong review này. Review khu vực B trước trên 831f760 là
  [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md) và được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `589bcff5541a603abad696a3303dbea11cccb4a7` (freeze của WP5-UX-REGATE; HEAD = origin/main); digest
  `8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e`, 789 file, không tính `handoff/`, ghi đầu tiên và ghi lại
  sau mọi kiểm tra, giống nhau theo ba dạng (dạng `git ls-tree`, `scripts/source-digest.mjs` trong repository đang làm việc,
  và trong bản clone tạm ở 589bcff với `git status --short` rỗng). 0 đường dẫn ngoài `handoff/` khác 589bcff; không có commit
  chưa push. Source đủ: bản clone tạm sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.** B-01, B-02, B-03 và B-04 của review đầu **đã đóng**, mỗi lỗi được kiểm trong app đã build
  hoặc trong test, và mọi assertion e2e mới của vòng sửa đều fail trên hành vi của 831f760. Một lỗi mới mức Low:
  **WP5-UX-B2-01**, một hồi quy do việc thu gọn của B-01: dưới khoảng 375px ô ngày "Open a day" co lại tới mức giá trị bị cắt
  ("10/09/202" ở 360px, "10/0" ở 320px; ở 831f760 ngày hiện đầy đủ). Mọi phần khác của khu vực B đạt, gồm mọi kiểm tra bắt
  buộc (typecheck, lint, `npm test` 1820 đạt, e2e đầy đủ 164 đạt, 10 bỏ qua, 0 fail trên cả hai project).

## Phạm vi thật đã xem và chạy

1. Đóng B-01..B-04: diff của vòng sửa `831f760..589bcff` (12 file; `10-…`, `14-…`), app đã build (probe của auditor PB1 tới
   PB8), và các assertion e2e mới chạy trên bản clone tạm ở 831f760 với các file spec của 589bcff chép đè (`30-…`), cùng một
   đột biến màn Admin cho B-03 (`31-…`).
2. Toàn bộ phạm vi khu vực B một lần nữa trên 589bcff: yêu cầu của chủ và E-1..E-7 (`owner_decisions` của board, docs/10
   EN và VI, WP5-UX-PLAN mục C và E, chú thích và ảnh mockup A1/A2) so với các component đã giao và ảnh tôi tự chụp; độ mạnh
   của test trên mọi file test đổi từ 014bd47 (`11-…`, `13-…`) và vòng sửa (`12-…`); khả năng tiếp cận bằng probe
   Playwright tôi tự viết (`ux2.probe.ts.txt`) trên server đã build của chính tôi (cổng 48001 và 48002); chuẩn UI (quét token
   `css-scan.mjs.txt`, tương phản khi render, lint `no-deprecated`, theo dõi deprecation của Node, console trình duyệt);
   độ chính xác và tương đương EN/VI của docs/04, docs/10, docs/12 (`parity.mjs.txt`).
3. R-1..R-6 của review đầu, đánh giá lại trên 589bcff.
4. Kiểm tra bắt buộc, tôi tự chạy trong bản clone tạm với Node v24.21.0.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B2/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước) | `8c07aac5…0a2e`, 789 file | `01-digest-before.txt` |
| `npm ci` (bản clone tạm) | exit 0 | `07-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 file, 1820 test đạt | `04-npm-test.txt` |
| `npm run test:e2e` (build + toàn bộ bộ Playwright, Edge, cả hai project) | exit 0; 174 test: 164 đạt, 10 bỏ qua, 0 fail; desktop 82 đạt + 5 bỏ qua, mobile 82 đạt + 5 bỏ qua (mọi test bỏ qua là theo project, đúng thiết kế); 5.6 phút | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build với `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; server đã build có theo dõi trên 48003 (6 request) | exit 0 mỗi lệnh; 0 dòng deprecation; server dừng (SIGTERM); console trình duyệt chỉ có 401 trước khi đăng nhập | `08-…`, `08a`..`08d`, `49-…` |
| file spec của 589bcff trên client 831f760, chỉ các test của vòng sửa | 7 fail (B-01 x2: 910.2 và 1046.6 > 788.5; B-02 768 và 1024: "Clock in" nhận tiêu điểm khi bị che hoàn toàn dưới bảng sau 19 lần Tab; B-02 1280: Escape từ bảng timesheet không đóng trình sửa; thứ tự tab của thẻ kỳ x2), 2 đạt (B-03, hành vi không đổi), 5 bỏ qua theo project | `30-…`, `30a-…` |
| Đột biến cho B-03: màn Admin hiện tiêu đề "Import a workbook" (chỉ bản tạm, đã khôi phục) | test của 589bcff fail trên desktop và mobile ở dòng 389; test của 831f760 đạt trên desktop, chỉ fail trên mobile | `31-…`, `31a`, `31b` |
| PB1 điện thoại 390x844, 6 trạng thái x 2 tình huống múi giờ | đáy hàng ngày đầu 659.0 (múi giờ trùng) / 758.0 (có ghi chú múi giờ) so với đỉnh thanh tab 788 khi tải trang, lúc chưa vào ca và đang vào ca; thứ tự thẻ kỳ, thẻ đồng hồ, bảng ở mọi trạng thái; scrollY 0; không cuộn ngang (831f760: 910.2 / 1046.6) | `41-…`, `41b-…`, `49c`, `49d` |
| PB2 toàn bộ chuỗi Tab | điện thoại: Previous, Next, Review, Clock, Open a day, Show details, Change several days, rồi Edit/Label cho 09/28..10/11 theo thứ tự ngày, liên kết Review ở dòng chữ ký, rồi thanh tab; 0 chỗ ngược thứ tự đọc. Desktop: thanh trên, kỳ, đồng hồ, công cụ, các ngày Mon..Sun tuần 1 rồi tuần 2 (thứ tự cột) | `42-…`, `42b-…` |
| PB3 rộng 390/360/320, mặc định và chế độ nhiều ngày | scrollWidth = clientWidth; 0 phần tử vượt viewport; 0 điều khiển hiện ra nhỏ hơn 44x44; ô "Open a day" 146.2 / 116.2 / 76.2px (831f760: 153px ở mọi độ rộng) | `43-…`, `49e` |
| PB3b "Open a day" có nhập ngày | giá trị 2026-10-09 hiện đủ ở 390 và 375; bị cắt thành "10/09/202" ở 360 và "10/0" ở 320 (831f760: đủ ở 320) | `43b-…`, `49f`, ảnh chụp |
| PB4 trình sửa ở 768/1024/1199/1200/1280 | dưới 1200: `:modal`, kiểm tra điểm chạm trên một ngày của bảng rơi vào dialog (trang bị vô hiệu), 160 lần Tab/Shift+Tab: 0 ra ngoài, 0 bị che; `focus()` lên một điều khiển của bảng hoặc "Open a day" không chuyển tiêu điểm; Escape và Close đóng bảng, tiêu điểm trở về nút ngày. Từ 1200: không modal, bảng nằm cạnh thẻ bảng timesheet (không chồng), 0 điều khiển nhận tiêu điểm bị che, Escape từ một nút của bảng và từ "Open a day" đóng bảng, tiêu điểm trở về. Đổi kích thước 1280 sang 1024 khi đang mở: thành modal với tiêu điểm bên trong; về 1280: không modal | `44-…` |
| PB5 Escape lồng nhau ở 1280 | Escape trong bộ chọn nhãn đang mở chỉ đóng bộ chọn (tiêu điểm ở nó); khi có hộp thoại review trên trình sửa đang mở, Escape chỉ đóng hộp thoại (không lưu gì); Escape tiếp theo đóng trình sửa | `45-…` |
| PB6 thanh kỳ | thứ tự Tab Previous, Next, Review trên cả hai project; điện thoại: `<` (28,84) và `>` (318,84) cạnh tiêu đề, Review ở hàng riêng (28,192); desktop một hàng x 72, 612, 660 | `46-…`, `46b-…` |
| PB7 tương phản khi render của chữ gọn trên điện thoại (thẻ kỳ, đồng hồ, công cụ, đầu biểu mẫu, thanh tuần) | 43 nút chữ mỗi theme; thấp nhất 5.00 sáng, 5.80 tối; 0 dưới 4.5 | `47-…` |
| PB8 Review trên điện thoại | tiêu đề biểu mẫu ẩn khỏi mắt (cùng quy tắc với bảng Timesheet), h1 của trang hiện, không cuộn ngang | `48-…` |
| Quét token của `styles.css` | 0 giá trị màu, bo góc, bóng, thời lượng, animation, font hay url viết cứng ngoài các khối token; `--radius: 4px`; 7 trên 7 transition là `var(--transition)` = `all 300ms ease-out`; 0 `var()` chưa định nghĩa; vòng sửa chỉ thêm số cấu trúc (vị trí lưới, 0, 100%, flex 1, min-width 0); `::backdrop` mới dùng `--scrim` | `20-…`, `21-…` |
| Tương đương EN/VI của docs 04, 10, 12 | docs/04: bốn dòng của vòng sửa (41, 48, 55, 59) khớp code span, chuỗi trong ngoặc kép và số; khác biệt còn lại là tên mục được dịch và dòng ghi chú bản dịch của bản VI; docs/10 và docs/12 không đổi từ 831f760 | `50-…`, `51-…` |
| digest, ba dạng (sau) | `8c07aac5…0a2e`, 789 file, đều bằng nhau | `90-digest-after.txt` |

## B-01..B-04 của review đầu

| ID | Xử lý | Quan sát |
|---|---|---|
| WP5-UX-B-01 | **Đã đóng** | Ở 390x844 hàng `[data-day]` đầu tiên nằm trọn phía trên thanh tab khi tải trang: đáy 659.0 (múi giờ đang xem = múi giờ báo cáo) và 758.0 (có ghi chú múi giờ) so với 788, cả khi đang vào ca và ở kỳ cũ (682.6 / 781.5). Bố cục gọn giữ đúng thứ tự đã duyệt thẻ kỳ, thẻ đồng hồ, bảng (mockup A2) ở mọi trạng thái đã đo (`41-…`). Các test e2e trên mobile kiểm điều này và fail trên 831f760 (910.2 / 1046.6). docs/04 dòng 48 (EN, VI) mô tả đúng. Những điểm khác A2 mà tôi đánh giá là phù hợp hướng đã duyệt: hàng công cụ ("Open a day", "Show details", "Change several days") nằm giữa đồng hồ và bảng; "Review & sign off" là hàng cuối của thẻ kỳ (và vẫn có ở dòng chữ ký); nút đồng hồ to nhưng không rộng hết thẻ; hiện một hoặc hai hàng ngày thay vì cả tuần. |
| WP5-UX-B-02 | **Đã đóng** | Dưới 1200px trình sửa là modal (trang bị vô hiệu, có lớp phủ), nên không điều khiển nào của bảng nhận tiêu điểm khi bị che; bẫy tiêu điểm, trả tiêu điểm, Escape và Close đã kiểm ở 768, 1024 và 1199; từ 1200px nó không modal, ở cột riêng cạnh bảng và Escape đóng nó từ mọi chỗ, còn bộ chọn hoặc hộp thoại lồng bên trong nhận Escape trước (`44-…`, `45-…`). docs/04 dòng 59 (EN, VI) nêu đúng điều này. Các test e2e fail trên 831f760. |
| WP5-UX-B-03 | **Đã đóng** | `tests/e2e/import.spec.ts:388-390` kiểm tiêu đề "Administration", không có tiêu đề "Import a workbook" và không có "Opening OT balance" trên `#/admin` ở cả hai project trước khi nhánh desktop sang Settings; các kiểm tra sau đó vẫn giữ. Đột biến cho thấy lượt desktop nay bắt được một điều khiển import trên màn Admin; test của 831f760 thì không (`31-…`). |
| WP5-UX-B-04 | **Đã đóng** | docs/04 dòng 41 liệt kê Complete, Running, Open session, Confirm breaks, No times, Missing record, Upcoming, Calculation problem, bằng đúng các giá trị `text` trong `sheetModel.ts:180-193`; dòng 55 nêu "ô chọn loại ngày ("Category for selected days")"; cả EN và VI. |
| Addendum 1 (thứ tự tab trên điện thoại) | **Đã đóng** | Thứ tự DOM Previous, Next, Review (`PeriodBar.tsx:37-95`); thứ tự Tab bằng thứ tự đọc trên cả hai bố cục (PB2, PB6); assertion e2e fail trên 831f760. |

## Yêu cầu của chủ, E-1..E-7 và điều hướng (phạm vi 1)

- **Bảng trên desktop:** vòng sửa không đổi và vẫn đạt (đầu biểu mẫu Excel, hai dải thứ Hai đến Chủ nhật với Day, Date,
  Label, Time, OT, Check, "Overtime Total :", các dòng chữ ký); e2e `timesheet.spec.ts` kiểm cấu trúc này.
- **E-1 (a), E-2 (a), E-4, E-6 (a), E-7 (a):** đạt như trước (vòng sửa không đổi). **E-3 (a):** đạt: bảng bên trên desktop
  (modal ở 768-1199, cạnh bảng từ 1200), bottom sheet trên điện thoại, bộ chọn nhãn trong ô. **E-5 (a):** đạt (spec e2e
  shell, admin, import).
- **Bố cục điện thoại:** đạt lời hứa màn hình đầu đã duyệt (B-01 ở trên). Hồi quy duy nhất là WP5-UX-B2-01.
- **Thanh kỳ trên desktop:** nay là `<` kỳ `>` "Review & sign off" (mockup A1 đặt liên kết review trước `>`); đây là hệ quả
  của việc cho thứ tự DOM bằng thứ tự đọc và không phải lỗi.
- **docs/04 dòng 16 (múi giờ đang xem):** vẫn đạt; thẻ kỳ gọn vẫn giữ "Times in {zone}" (ảnh chụp).

## Độ mạnh của test (phạm vi 2)

Mọi file test đổi từ 014bd47 (20 file) được đọc lại trong diff `014bd47..589bcff` (`13-…` liệt kê mọi dòng bị bỏ). Tôi tự
đánh giá lại từng assertion bị bỏ, nới hoặc thay:

| # | File | Thay đổi | Đánh giá |
|---|---|---|---|
| 1-5 | timesheet.spec | đổi tên móc bố cục (`[data-sheet]`); hạn nộp kiểu Mỹ kèm múi giờ báo cáo; ngày đặt tên theo ngày ISO cùng ô MM/DD và `Edit {date}`; Complete với OT của server dạng h:mm và dòng chi tiết `8:00`; pending OT trong ô OT | tương đương hoặc mạnh hơn |
| 6 | spec timesheet, shell, review | vòng lặp 44px với `.filter({ visible: true })` | tương đương: vẫn giữ kiểm số lượng; PB3 của tôi thấy 0 điều khiển hiện ra bị nhỏ ở 390/360/320 |
| 7-8 | review.spec | ô chi tiết từng ngày và ô OT theo quy tắc PDF cho cả 14 ngày; câu chữ | tương đương |
| 9-12 | day-editor.spec | đổi tên tiêu đề; nghỉ nhập giờ + phút kèm từ chối; khóa "No times" / Missing record; kiểm Upcoming | tương đương hoặc mạnh hơn |
| 13-16 | spec shell, admin, import | danh sách điều hướng chính xác theo bố cục (E-5) | tương đương hoặc mạnh hơn |
| 17 | import.spec:382-400 | bị làm yếu ở 831f760 (B-03) | **đã khôi phục** ở 589bcff (hàng B-03 ở trên) |
| 18-21 | spec history-settings, isolation, setup, sharing, ot-leave | trạng thái chuyển lên thanh kỳ; khóa Complete; More trên điện thoại; đổi tên | tương đương hoặc mạnh hơn |
| 22-24 | test dayModel, sessionModel, engine | các ca `weekGroups` chuyển sang `sheetModel.test.ts`; ca giờ + phút; ca định dạng | tương đương hoặc mạnh hơn |
| 25 | leaveInputModel.test (FIX2) | định dạng lại danh sách import (dòng duy nhất bị bỏ); 3 ca mới ("2-", "3-", "e", "1.5", "-1", cờ bad-input, `invalidLeaveParts`) | thêm |
| 26 | day-editor.spec (FIX2) | nhập nghỉ sai dạng: một alert, `aria-invalid` / `aria-describedby` đúng ô, không PUT, không lưu gì; 150 và 0 vẫn lưu | thêm |
| 27 | day-editor.spec:833-839 (chờ bị race của FIX2) | trước mỗi lần bấm "Next period" đọc chữ của vùng Pay period; sau đó test chờ chữ đó đổi, rồi chờ 14 hàng | mạnh hơn: thêm một lần chờ, không assertion nào bị bỏ hay nới |
| 28 | timesheet.spec (FIX3) | màn hình đầu điện thoại, múi giờ trùng và có ghi chú: đáy hàng đầu ở trên hoặc bằng đỉnh thanh tab, thanh tab ở nửa dưới, scrollY 0 | thêm; fail trên 831f760 |
| 29 | timesheet.spec (Addendum 1) | thứ tự Tab của thẻ kỳ Previous, Next, Review cùng thứ tự nhìn, cả hai project | thêm; fail trên 831f760 |
| 30 | day-editor.spec (FIX3) | 768 và 1024: duyệt 140 lần nhấn, không điều khiển nào nhận tiêu điểm khi bị che hoàn toàn dưới bảng, Escape khi tiêu điểm được đặt trên bảng timesheet; 1280: không modal, Escape từ một nút của bảng và từ thanh công cụ, trả tiêu điểm | thêm; fail trên 831f760 |
| 31 | import.spec (FIX3) | khôi phục B-03 | thêm; bắt được lỗi khi đột biến |

Kết quả: **không có assertion nào bị làm yếu** ở 589bcff. Không có `only`, `fixme` hay skip vô điều kiện mới; các skip mới
theo project (`isMobile`). `playwright.config.ts` và `tests/e2e/fixtures.ts` không đổi từ 014bd47.

## Khả năng tiếp cận (phạm vi 3)

- Thứ tự bàn phím: điện thoại và desktop theo thứ tự đọc (PB2), Mon..Sun tuần 1 rồi tuần 2; thứ tự của thẻ kỳ là Previous,
  Next, Review (PB6). **Đạt.**
- Tên: `Edit {date}`, `Label for {date}: {label}`, dialog được đặt tên theo tiêu đề "Day editor {weekday date}", chữ trạng
  thái, ô "Open a day" được đặt tên theo nhãn của nó. **Đạt.**
- Trình sửa modal dưới 1200px: `:modal`, trang bị vô hiệu (điểm chạm rơi vào dialog), bẫy tiêu điểm qua 160 lần nhấn,
  Escape và Close, trả tiêu điểm về nút ngày, xử lý đổi kích thước (PB4). Không modal từ 1200px, Escape từ mọi chỗ và hộp
  thoại lồng nhận trước (PB4, PB5). **Đạt.**
- Trạng thái không bao giờ chỉ bằng màu: chữ và hình của Check không đổi trong vòng sửa (e2e kiểm hình; ảnh chụp hiện "No
  times" với hình vuông). **Đạt.**
- Điều khiển 44px và không cuộn ngang: 0 điều khiển hiện ra bị nhỏ và không cuộn ngang ở 390, 360 và 320px (PB3), và các
  vòng lặp e2e mobile đạt. **Đạt**, nhưng xem WP5-UX-B2-01 về nội dung bị cắt ở 360 và 320px.
- Tương phản: chữ gọn trên điện thoại thấp nhất 5.00 sáng / 5.80 tối (PB7); token màu không đổi từ gate (các cặp token của
  REGATE ít nhất 4.65). Tôi giữ đánh giá WCAG 1.4.11 của review đầu về `--sheet-rule-strong` (đường kẻ cấu trúc, không cần để
  hiểu bảng). **Đạt.**

## Chuẩn UI và API lỗi thời (phạm vi 4)

Chỉ dùng token ngoài các khối token, `--radius: 4px`, một `--transition` dùng chung (`all 300ms ease-out`) trên mọi
transition, bóng nhiều lớp (`--shadow-overlay`, `--shadow-panel` từ 1200px), backdrop mới dùng `--scrim`, không animation
hay `@keyframes`, khối giảm chuyển động không đổi, chỉ font hệ thống. Các API client mới (`useSyncExternalStore`,
`matchMedia().addEventListener`, `HTMLDialogElement.show/showModal`, `validity.badInput`) đều hiện hành. Lint
`no-deprecated` exit 0; 0 dòng deprecation của Node khi chạy lint, test, build và server; 0 thông báo deprecation của trình
duyệt. **Đạt.**

## Tài liệu (phạm vi 5)

docs/04 (EN và VI) mô tả chính xác màn hình đầu trên điện thoại đã giao (dòng 48), các chế độ của trình sửa và quy tắc
Escape (dòng 59), chữ của Check (dòng 41) và ô chọn loại ngày khi sửa nhiều ngày (dòng 55); EN/VI tương đương ở các dòng
đó. docs/10 và docs/12 không đổi từ 831f760, vẫn chính xác ở mức chi tiết của chúng, và docs/12 không thêm định danh bản
phát hành. **Đạt** (một điểm câu chữ tùy chọn, O-1).

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-B2-01 | Low | `src/client/styles.css:1081-1103` (khối điện thoại do WP5-UX-FIX3 thêm: `.tools .open-day { flex-wrap: nowrap }`, nhãn thành một hàng với `white-space: nowrap`, ô nhập `flex: 1; min-width: 0`) | Project mobile, trang Timesheet, nhập một ngày vào "Open a day", đặt độ rộng 360 và 320px (`43b-PB3b-open-day-field.txt`, `pb3b-open-day-w360-synthetic.png`, `pb3b-open-day-w320-synthetic.png`); so với 831f760 (`49f-…`, `831f760-pb3b-open-day-w320-synthetic.png`) | Kỳ vọng: ô hiện đủ ngày nó đang giữ ở mọi độ rộng điện thoại, như ở 831f760 (153px trên hàng riêng). Thực tế: ô co còn 116.2px ở 360 và 76.2px ở 320; "2026-10-09" hiện thành "10/09/202" và "10/0". Không cuộn ngang và bộ chọn ngày vẫn dùng được, nhưng giá trị bị cắt. 320 CSS px cũng là màn desktop 1280px phóng to 400% | WCAG 2.2 SC 1.4.10 Reflow (AA, không mất thông tin ở 320 CSS px); AGENTS.md "responsive mobile-first default"; hồi quy do vòng sửa đưa vào | Giữ ô ngày ít nhất bằng độ rộng của một ngày đầy đủ (một token mới, ví dụ `--date-field-min`) và cho hàng "Open a day" xuống dòng (nhãn trên ô hoặc nút xuống dưới) khi không đủ chỗ, ví dụ dưới 375px, mà không phá ngân sách màn hình đầu ở 390x844; thêm một assertion trên điện thoại ở 360 và 320px rằng ô ít nhất rộng như vậy, và giữ các test B-01 vẫn đạt |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-1 Vòng tiêu điểm (có từ trước, không đổi):** `--focus-ring` (`styles.css:37, 176`) tính ra khoảng 1.72:1 trên thẻ sáng
  và 2.45:1 trên thẻ tối; trình sửa modal cũng dựa vào nó. Vẫn có từ trước và ngoài vòng này; vẫn nên có một vòng tiêu điểm
  chung đậm hơn.
- **R-2 Ngày ISO ở đầu trang Review (không đổi):** `ReviewScreen.tsx:170`. Tùy chọn.
- **R-3 Không có nút tài khoản trên điện thoại (không đổi):** tên và Sign out vẫn ở trong More; trên trang Timesheet của điện
  thoại, tiêu đề trang có tên nay chỉ dành cho trình đọc màn hình, đầu biểu mẫu vẫn hiện "Employee: {name}". Tương đương về
  chức năng.
- **R-4 Chú giải luôn có "Today" (không đổi):** `TimesheetSheet.tsx:284`. Tùy chọn.
- **R-5 Trình sửa chỉ đọc in "none" (không đổi):** `DayEditor.tsx:407, 413, 423`. Tùy chọn.
- **R-6 Cổng (không đổi):** fixture e2e chọn cổng loopback trống do hệ điều hành cấp; server của tôi dùng 48001-48003. Không
  phải lỗi.
- **O-1** docs/04 dòng 9 (EN, VI) vẫn tóm tắt trình sửa là "a side panel beside the sheet on desktop"; từ 768 đến 1199px nó là
  bảng modal phủ lên bảng timesheet (dòng 59 thì chính xác). Có thể chỉnh câu chữ cho khớp.
- **O-2** Chú thích `DayEditor.tsx:83-84` vẫn nói việc đổi chế độ xảy ra khi "the window crossed 768px"; nay là 1200px.
- **O-3** `.tools .open-day` được khai báo hai lần trong cùng khối điện thoại (`styles.css:1081` và `:1101`); có thể gộp cùng
  lúc sửa WP5-UX-B2-01.
- **O-4** Ngân sách màn hình đầu trên điện thoại rất sát: khi có ghi chú múi giờ và một dòng thông báo ("Clocked out.") đáy
  hàng đầu là 787.7 so với 788 (`41b-…`, trạng thái `afterClockOut`); một thông báo tạm thời dài hơn sẽ đẩy nó xuống dưới thanh
  tab. Trạng thái khi tải trang mà yêu cầu nêu thì đạt.

## Gate chưa chạy hoặc bị chặn, và lý do

Không có trong khu vực B. Typecheck, lint, `npm test` và toàn bộ bộ e2e trên cả hai project đã chạy ở đây và đạt. Các mục
của khu vực A nằm ngoài review này.

## Xử lý các phát hiện trước

WP5-UX-B-01, B-02, B-03 và B-04: đã đóng (bảng ở trên). R-1..R-6: đã đánh giá lại, không mục nào thành lỗi; vòng sửa không
đổi mục nào. Mới: WP5-UX-B2-01 (Low), đang mở.

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, khu vực B:** chưa; WP5-UX-B2-01 cần một lần sửa client nhỏ (CSS của một hàng trên điện thoại và một
  assertion), freeze, gate và recheck khu vực B cho thay đổi đó.
- **Phép của chủ:** không xin và không được cấp; không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một bước tiếp theo

Coordinator: mở một task sửa có phạm vi cho WP5-UX-B2-01 (hàng "Open a day" trong khối điện thoại của `styles.css`, một
assertion trên điện thoại ở 360 và 320px; tùy chọn O-1..O-3), rồi freeze, gate và recheck khu vực B mới trên digest mới.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-B2, attempt 1; reviewer tự báo `claude-opus-5-5`
  (subagent mới; agent ID không thấy được từ bên trong). Tác giả được review: WP5-UX-PLAN, WP5-UX-T01..T06, WP5-UX-FIX1..FIX3
  và các freeze của chúng, verifier của WP5-UX-GATE và WP5-UX-REGATE (theo ghi trong file task của họ; model tác giả mạnh nhất
  được ghi là opus, giống model của tôi).
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được review và không chạy gate
  hay audit nào trước đó của vòng này. Tôi không sửa file source, test, tài liệu, board hay STATE nào. Probe của tôi chạy trong
  các bản clone tạm trong thư mục task, được loại khỏi git bằng `.git/info/exclude`; đột biến cho B-03 chỉ làm trong bản clone
  tạm 831f760 và đã khôi phục. Các sơ suất quy trình, không cái nào ghi file ra ngoài thư mục task và thư mục bằng chứng: một
  lệnh in chỉ đọc `node -e` đã chạy bằng Node v26 của hệ thống vì môi trường chưa được nạp (nó lỗi cú pháp); một lệnh kết thúc
  bằng pipe `| head -c 0` (không có đầu ra); một redirect với biến chưa đặt đã thử ghi vào gốc ổ đĩa và bị từ chối
  ("Permission denied"; không có file nào ở đó).
- **Digest trước/sau; bằng chứng gate cho snapshot đó:** `8c07aac5…0a2e` trước và sau, ba dạng (`01-digest-before.txt`,
  `90-digest-after.txt`); bằng digest ghi nhận của WP5-UX-REGATE.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B2.md` và `.vi.md`, file mới;
  `WP5_UX_REVIEW_B.md` và mọi review trước không bị đụng tới.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** B-01..B-04 đã đóng; WP5-UX-B2-01 đang mở; tiếp theo: một task
  sửa cho WP5-UX-B2-01, freeze, gate và recheck khu vực B.
