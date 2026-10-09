# Thiết kế lại UI của WP5, review độc lập lại vùng B trên snapshot cuối — bám yêu cầu của chủ, độ mạnh test, trợ năng, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B3.md](WP5_UX_REVIEW_B3.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/người review và model/effort quan sát được:** vòng thay đổi UI theo yêu cầu của chủ thuộc WP5, task WP5-UX-AUDIT-B3,
  lần 1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T09:46Z đến 10:15Z). Model tự báo của người review `claude-opus-5-5`,
  profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Vùng A được kiểm lại riêng
  (WP5-UX-AUDIT-A3) và không nằm trong review này. Các review vùng B trước [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md) (831f760)
  và [WP5_UX_REVIEW_B2.md](WP5_UX_REVIEW_B2.md) (589bcff) được giữ nguyên.
- **Commit SHA và digest nguồn được review; commit chưa push; độ đầy đủ của nguồn:** commit
  `a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb` (bản freeze của WP5-UX-REGATE2; HEAD = origin/main); digest
  `0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d`, 789 file, không tính `handoff/`, ghi đầu tiên (sau
  `node --version`) và ghi lại sau mọi kiểm tra, bằng nhau ở ba dạng (dạng `git ls-tree`, `scripts/source-digest.mjs` trong
  repository làm việc, và trong một scratch clone tại a2ea7a4 với `git status --short` rỗng). 0 đường dẫn ngoài `handoff/` khác
  a2ea7a4; không có commit chưa push. Nguồn đầy đủ: scratch clone sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.** **WP5-UX-B2-01 đã đóng**: ở 390, 375, 360, 344 và 320px ô "Open a day" giữ đủ một ngày
  (146.2 / 235 / 220 / 204 / 180px; ảnh chụp hiện "10/09/2026" trọn vẹn), hàng xuống dòng khi hẹp hơn khoảng 388px, ngân sách
  màn hình đầu 390x844 vẫn giữ (đáy hàng ngày đầu 659.0 khi không có và 758.0 khi có ghi chú múi giờ, đỉnh thanh tab 788),
  và assertion mới fail trên hành vi của 589bcff. O-1..O-3 đã làm. Mọi kiểm tra bắt buộc đều pass (typecheck, lint,
  `npm test` 82 file / 1820 test, e2e đầy đủ 180 test: 167 pass, 13 skip, 0 fail). Còn hai phát hiện mức **Low** ở
  vùng B: **WP5-UX-B3-01** (đánh giá lại A2 R2: sau khi cửa sổ thu hẹp dưới 1200px khi một hộp thoại review đang mở trên
  trình sửa, trình sửa che hộp review, lần Escape đầu đóng trình sửa thay vì hộp thoại lồng và tiêu điểm rơi về trang,
  trái với docs/04 dòng 59) và **WP5-UX-B3-02** (docs/04 dòng 55 EN và VI nói "Open a day" mở "any date of the period";
  thực tế nó mở mọi ngày).

## Phạm vi đã kiểm tra và chạy thực tế

1. Đóng B2-01: diff FIX4 `589bcff..a2ea7a4` (5 file ngoài `handoff/`; `10-…`, `10a-…`), probe của tôi đo ô ở năm độ rộng
   với ba giá trị trên a2ea7a4, trên 589bcff và trên một biến thể (PC1, `41-…`), ngân sách B-01 trong bảy trạng thái và
   ba độ rộng hẹp hơn trên a2ea7a4 và 589bcff (PC2, `42a-…`..`42d-…`), và các assertion của FIX4 chạy trên hành vi
   589bcff trong hai biến thể scratch (`30-…`).
2. Toàn bộ phạm vi vùng B trên a2ea7a4 (mục 1-6 của `WP5-UX-AUDIT-B.md`): yêu cầu của chủ và E-1..E-7 so với màn hình đã
   giao (ảnh e2e, probe của tôi), độ mạnh test trên mọi file test đổi từ 014bd47 (`11-…`, `12-…`, `13a-…`
   đến `13c-…`), trợ năng bằng probe Playwright riêng `ux3.probe.ts` (PC1-PC13) trên server tự build của tôi, chuẩn UI
   (quét token `css-scan.mjs`, tương phản khi render, lint `no-deprecated`, truy vết deprecation của Node, console trình duyệt),
   và độ chính xác cùng tương đương EN/VI của docs/04, docs/10, docs/12 (`parity.mjs`).
3. R-1..R-6 và O-4 của review B2 cùng R2 và R5 của `WP5_UX_REVIEW_A2.md`, đánh giá lại trên a2ea7a4 bằng probe mới (PC6,
   PC8, PC10, PC10b).
4. Các kiểm tra bắt buộc, tự chạy trong scratch clone với Node v24.21.0.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B3/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước) | `0b8428fd…b77d`, 789 file | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone tại a2ea7a4) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 file, 1820 test pass | `04-npm-test.txt` |
| `npm run test:e2e` (build + toàn bộ Playwright, Edge, cả hai project) | exit 0; 180 test: 167 pass, 13 skip, 0 fail; desktop 82 pass + 8 skip, mobile 85 pass + 5 skip (mọi skip đều theo project, có chủ đích); 6.1 phút | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build với `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; server đã build có truy vết trên 48066 (6 request) | exit 0 mỗi lệnh; 0 dòng deprecation; server dừng (SIGTERM); console trình duyệt chỉ có lỗi 401 trước khi đăng nhập | `07-…`, `07a`..`07d`, `40-…` |
| assertion FIX4 trên hành vi 589bcff, mobile, không retry | V1 (client 589bcff, spec a2ea7a4): 3 fail (390 chỉ vì ở đó không có token; 360: 116.2, 320: 76.2), các test B-01 pass. V2 (a2ea7a4 chỉ với rule open-day của 589bcff): 390 pass, 360 và 320 fail (116.2 và 76.2 < 142) | `30-…`, `30a-…`, `30b-…`, `30c-…` |
| PC1 ô "Open a day", giá trị trống / 2026-10-09 / 2026-12-28, độ rộng 390/375/360/344/320 | a2ea7a4: 146.2 / 235 / 220 / 204 / 180px, nút cạnh ô ở 390 và xuống dưới từ 375, scrollWidth của trang = độ rộng, hàng nằm trong thẻ; 589bcff: 146.2 / 131.2 / 116.2 / 100.2 / 76.2px (bị cắt từ 360 trở xuống) | `41-…`, `41a`..`41c`, ảnh chụp |
| PC2 màn hình đầu 390x844, múi giờ trùng / có ghi chú | đáy `[data-day]` đầu 659.0 / 758.0 khi tải, cả khi ô đã nhập và khi đang vào ca; 688.8 / 787.7 sau khi ra ca; 682.6 / 781.5 ở kỳ trước; đỉnh thanh tab 788; scrollY 0; không cuộn ngang. Bằng đúng giá trị của 589bcff | `41-…`, `42a`..`42d` |
| PC3 độ rộng 390/360/320: mặc định, ô đã nhập, batch, trình sửa mở (đã tải nội dung), Review | scrollWidth = clientWidth ở cả 15 trạng thái; 0 phần tử vượt viewport; 0 điều khiển hiển thị dưới 44x44 (41 / 41 / 46 / 9 / 8 điều khiển) | `43-…` |
| PC4 toàn bộ chuỗi Tab | desktop 43 điểm dừng: thanh trên, kỳ (Previous, Next, Review), đồng hồ, công cụ, rồi các ngày Mon..Sun tuần 1 rồi tuần 2 (theo cột), liên kết chữ ký; điện thoại ở 390 và 320 (ô đã nhập): 0 đảo thứ tự đọc, 14 ngày theo thứ tự ngày | `44a-…`, `44b-…` |
| PC5 trình sửa ở 768/1024/1199/1200/1280 | dưới 1200: `:modal`, hit test vào một ngày trên bảng rơi vào dialog, 160 lần nhấn 0 ra ngoài; từ 1200: không modal, cạnh bảng, 0 điều khiển có tiêu điểm bị che; Escape (bên trong, từ bảng) và Close trả tiêu điểm về nút ngày; resize 1280 sang 1024 rồi 1280 được xử lý | `45-…` |
| PC6 Escape lồng ở 1280 và A2 R2 (1280 sang 1024 khi hộp review đang mở) | ở 1280 picker và hộp review nhận Escape trước. Sau resize trình sửa modal nằm trên hộp review modal, lần Escape đầu đóng trình sửa và tiêu điểm ở BODY trong khi hộp review vẫn mở; một lần Tab vào hộp review; lần Escape thứ hai đóng nó; không có gì được lưu | `46-…`, ảnh chụp (WP5-UX-B3-01) |
| PC7 thanh kỳ | thứ tự Tab Previous, Next, Review ở cả hai project; điện thoại `<` (28,84) và `>` (318,84) cạnh tiêu đề, Review ở hàng riêng | `47a-…`, `47b-…` |
| PC8 tương phản chữ khi render (thẻ kỳ, đồng hồ, công cụ, đầu biểu mẫu, thanh tuần, bảng) và vòng tiêu điểm | chữ: 136 / 134 nút, thấp nhất 5.00 sáng, 5.74 tối, 0 dưới 4.5; vòng tiêu điểm so với nền kề 1.72 sáng, 2.46 tối (R-1) | `48a-…`, `48b-…` |
| PC9 Review trên điện thoại | tiêu đề biểu mẫu ẩn khỏi mắt, h1 của trang hiện, dòng đầu dùng ngày ISO (R-2), không cuộn ngang | `49-…` |
| PC10 / PC10b người được chia sẻ trên điện thoại 390x844 (A2 R5) | đáy hàng đầu: chỉ xem 750.7 (múi giờ trùng, trên 788), quyền sửa 802.7, chỉ xem 849.7 khi có ghi chú múi giờ, quyền sửa 901.7 khi có ghi chú | `50a`..`50c`, ảnh chụp |
| PC11 "Open a day" với 2026-04-06 (kỳ đang hiện 09/28 đến 10/11) | trình sửa mở "Day editor Mon 2026-04-06"; ô không có min hay max (WP5-UX-B3-02) | `51-…`, `61-…` |
| PC12 trạng thái trên điện thoại | 10 ngày có trạng thái Check; mỗi ngày có chữ nhìn thấy và một hình | `52-…` |
| PC13 bottom sheet trên điện thoại ở 390 và 320 | `:modal`, 86% chiều cao màn hình, 120 lần nhấn 0 ra ngoài, Escape và Close trả tiêu điểm về nút ngày | `53-…` |
| Quét token CSS của `styles.css` | 0 literal màu, bo góc, bóng, thời lượng, animation, font hay url ngoài khối token; `--radius: 4px`; 7 trên 7 transition `var(--transition)` = `all 300ms ease-out`; 0 `var()` chưa định nghĩa; FIX4 thêm `--date-field-min: 9.5rem` và `--open-day-label-min: 15.25rem` trong khối token và chỉ `flex: 1 1 var(…)` mang tính cấu trúc | `20-…`, `21-…`, `21a-…` |
| Tương đương EN/VI của docs 04 và các mục của vòng này trong docs 10 và 12 | docs/04: chỉ khác tên mục đã dịch và dòng ghi chú bản dịch của VI; mục của vòng này trong docs/10 và docs/12: 0 khác biệt | `60-…` |
| digest, ba dạng (sau) | `0b8428fd…b77d`, 789 file, đều bằng nhau | `90-digest-after.txt` |

## WP5-UX-B2-01 và O-1..O-3

| Mục | Xử lý | Quan sát |
|---|---|---|
| WP5-UX-B2-01 | **Đã đóng** | `styles.css:1083-1103` (khối điện thoại): hàng được xuống dòng; nhãn giữ `min-width: var(--open-day-label-min)` và ô nhập `min-width: var(--date-field-min)` (142.5px). Khi đã nhập ngày, ô rộng 146.2px ở 390 (nút ở cạnh) và 235 / 220 / 204 / 180px ở 375 / 360 / 344 / 320 (nút ở dưới); mọi ảnh chụp hiện "10/09/2026" trọn vẹn, chữ nhãn vẫn đứng trước ô, không cuộn ngang, hàng nằm trong thẻ, 0 điều khiển dưới 44px. Ngân sách B-01 ở 390x844 không đổi (659.0 / 758.0 so với 788). Test e2e mới pass ở a2ea7a4 và fail trên hành vi 589bcff ở 360 và 320 (V2), đồng thời pass ở 390 nơi 589bcff vẫn hiện đủ ngày. |
| O-1 | **Đã làm** | docs/04 dòng 9 EN và VI: bảng bên cạnh bảng timesheet từ 1200px và bảng modal (bottom sheet trên điện thoại) dưới 1200px; khớp PC5 và PC13. |
| O-2 | **Đã làm** | `DayEditor.tsx:84`: chỉ đổi chú thích ("crossed 768px" thành "crossed 1200px"); không token code nào đổi (`10a-…`). |
| O-3 | **Đã làm** | Một rule `.tools .open-day` trong khối điện thoại (`styles.css:1084`); rule gốc ở `:1737` nằm ngoài khối. |

## Yêu cầu của chủ, E-1..E-7 và điều hướng (phạm vi 1)

- **Bảng trên desktop (E-1, E-2, E-4, E-6):** phần đầu biểu mẫu Excel (công ty, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES",
  Employee, Payroll Date, Period), "WEEK 1" và "WEEK 2" từ thứ Hai đến Chủ nhật với Day, Date, Label, Time, OT (h:mm), Check và
  các dòng "Show details", chú giải, "Overtime Total :" dạng h:mm và các dòng chữ ký với "Not used yet" cho
  quản lý; ngày không làm việc có nền nhạt và sọc chéo; ngày kiểu Mỹ, h:mm, giờ 24 giờ (ảnh e2e, các assertion của
  `timesheet.spec.ts`). **Đạt.**
- **E-3 (a):** bảng bên trên desktop (modal ở 768-1199, cạnh bảng từ 1200), bottom sheet trên điện thoại, bộ chọn nhãn
  ngay trong ô (PC5, PC6, PC13). **Đạt**, kèm WP5-UX-B3-01 cho việc resize khi đang mở một hộp thoại lồng.
- **E-5 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); điện thoại ba tab và More (các spec e2e shell, admin,
  import pass). **E-7 (a):** Overtime, History và Settings chưa được làm lại giao diện (Settings chỉ thêm liên kết Import). **Đạt.**
- **Bố cục điện thoại:** thẻ kỳ, thẻ đồng hồ, công cụ gọn, rồi bảng; hàng ngày đầu nằm trên thanh tab ở
  390x844 trong cả hai tình huống múi giờ (PC2). **Đạt.**
- **docs/04 dòng 16 (múi giờ đang xem):** thanh kỳ luôn hiện "Times in {zone}" và mỗi ngày giữ ngày ghi sổ của nó
  (e2e, ảnh chụp). **Đạt.**

## Độ mạnh test (phạm vi 2)

Mọi file test đổi từ 014bd47 (20 file; `11-…`) được đọc lại trong diff `014bd47..a2ea7a4`; mọi dòng bị xóa
được liệt kê trong `12-…` kèm hunk và được so với phần thay thế trong các diff có ngữ cảnh `13a-…` đến `13c-…`:

| # | File | Thay đổi | Đánh giá |
|---|---|---|---|
| 1 | dayModel.test | các case `weekGroups` bị xóa cùng hàm | tương đương: việc chia tuần chuyển sang `sheetModel.ts`, các case nằm trong `sheetModel.test.ts` (mới, 357 dòng) |
| 2 | sessionModel.test | nghỉ nhập theo phút thành giờ + phút; danh sách đầu vào sai | mạnh hơn: 7 cặp sai thay vì 4, một case 90 phút, các case gợi ý |
| 3 | engine.test | chỉ import | thêm các case h:mm bằng bộ định dạng của PDF cho 0..3000 phút |
| 4 | các spec admin, import, isolation, setup, sharing, shell | danh sách điều hướng chính xác theo bố cục, Sign out trong More trên điện thoại, Import mở từ Settings trên desktop, `complete` thành `Complete` cộng `[data-check]` | tương đương hoặc mạnh hơn (danh sách chính xác thay cho đếm; thêm kiểm tra vắng mặt) |
| 5 | history-settings | trạng thái chuyển từ caption của lưới sang thanh kỳ | tương đương, thêm kiểm tra bố cục và chữ ký |
| 6 | review.spec | các ô Regular / Off-calendar / Credit theo ngày thành các dòng chi tiết cộng ô OT theo quy tắc PDF | tương đương (mọi ngày vẫn được so với payload của server) |
| 7 | các spec review, shell, timesheet | vòng lặp 44px thêm `.filter({ visible: true })` | tương đương: vẫn giữ chốt đếm; PC3 thấy 0 điều khiển hiển thị dưới 44px ở 390/360/320 |
| 8 | day-editor.spec | đổi tên heading; nghỉ theo giờ + phút kèm từ chối; "missing record" thành "No times" với `[data-check="missing"]`; kiểm tra Upcoming; thêm một lần chờ trước mỗi bước chuyển kỳ | tương đương hoặc mạnh hơn |
| 9 | timesheet.spec (cả vòng) | hook lưới/danh sách thành `[data-sheet]`; hạn nộp kiểu Mỹ cộng múi giờ; ngày đặt tên theo ngày ISO; Complete với OT của server và chi tiết `8:00` | mạnh hơn |
| 10 | timesheet.spec (FIX4) | thêm 3 test (390, 360, 320), xóa 0 dòng | thêm mới; bắt được hành vi 589bcff (V2). Assertion phụ "the date value is not clipped" của nó không thể fail (O-5) |

Kết quả: **không có assertion nào bị xóa hay làm yếu đi kể từ 014bd47, kể cả FIX4.** Không thêm `only`, `fixme` hay skip
vô điều kiện; hai lệnh `test.skip` mới đều theo project (`isMobile`). `playwright.config.ts` và `tests/e2e/fixtures.ts`
không đổi từ 014bd47.

## Trợ năng (phạm vi 3)

- Thứ tự bàn phím bằng thứ tự đọc ở cả hai bố cục, Mon..Sun tuần 1 rồi tuần 2, kể cả ở 320px khi ô
  đã nhập (PC4, PC7). **Đạt.**
- Tên: `Edit {date}`, `Label for {date}: {label}`, các dialog đặt tên theo heading ("Day editor Thu 2026-10-08",
  "Review label change for {date}"), ô tên "Open a day", hàng trên điện thoại đặt tên theo thứ và ngày ISO (e2e). **Đạt.**
- Modal và tiêu điểm: các chế độ của trình sửa, bẫy tiêu điểm, Escape, Close và trả tiêu điểm ở mọi độ rộng (PC5, PC13); Escape lồng ở
  1280px cố định (PC6). **Đạt, trừ WP5-UX-B3-01** (resize qua 1200px khi đang mở hộp thoại review).
- Trạng thái không bao giờ chỉ bằng màu: chữ và hình trong mọi ô Check trên điện thoại và desktop (PC12, ảnh chụp). **Đạt.**
- 44px và reflow: 0 điều khiển hiển thị dưới 44x44 và không cuộn ngang ở 390, 360 và 320px, gồm cả trình sửa và
  Review (PC3); ở 320px ngày vẫn trọn vẹn (PC1). **Đạt.**
- Tương phản: chữ thấp nhất 5.00 sáng / 5.74 tối (PC8). Tôi giữ đánh giá WCAG 1.4.11 trước đây về `--sheet-rule-strong`
  (đường kẻ cấu trúc, không cần để hiểu bảng). Vòng tiêu điểm là R-1 bên dưới. **Đạt.**

## Chuẩn UI và API deprecated (phạm vi 4)

Chỉ dùng token ngoài khối token, `--radius: 4px`, một `--transition` chung (`all 300ms ease-out`) trên cả 7
transition, bóng nhiều lớp (`--shadow-panel`, `--shadow-overlay`), khối reduced-motion, chỉ font hệ thống (CSP
`default-src 'self'`, không tham chiếu web font). Hai giá trị mới của FIX4 là token. Lint `no-deprecated` exit 0; 0 dòng
deprecation của Node trong lint, test, build và server đang chạy; 0 thông báo deprecation của trình duyệt. **Đạt.**

## Tài liệu (phạm vi 5)

docs/04 các dòng 9, 41, 48 và 59 mô tả đúng UI đã giao (PC1-PC13); docs/10 ghi E-1..E-7 và các công thức không
tái tạo; docs/12 tóm tắt vòng này và không thêm định danh bản phát hành ("refreshed only after them"). Tương đương EN/VI giữ
(`60-…`). **Một chỗ không chính xác:** docs/04 dòng 55 (EN và VI) nói "Open a day" nhận "any date of the period"; điều khiển này
mở mọi ngày (WP5-UX-B3-02).

## Phát hiện

| ID | Mức | File / hàm | Tái hiện | Mong đợi / thực tế | Quy tắc / AC | Sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP5-UX-B3-01 | Low | `src/client/DayEditor.tsx:83-95` (effect đổi chế độ: `element.close()` rồi `showModal()` và `heading.focus()`), cùng `:97-109` | Project desktop, 1280x800: mở một ngày trong trình sửa (không modal), chọn "Off" ở ô Label của một ngày đã làm để hộp modal "Review label change for {date}" mở, rồi resize về 1024x800 (PC6, `46-…`, `a2ea7a4-pc6-r2-shrink-review-open-w1024-synthetic.png`, `a2ea7a4-pc6-r2-after-first-escape-w1024-synthetic.png`). Tái hiện trong hai lần chạy | Mong đợi (docs/04 dòng 59): hộp thoại lồng vẫn nhận Escape trước và tiêu điểm trở về phần tử đã mở. Thực tế: trình sửa được mở lại dạng modal phía trên hộp review và lấy tiêu điểm (hộp review bị che phía sau; hit test vào nút của nó rơi vào trình sửa); lần Escape đầu đóng trình sửa, không phải hộp review; sau đó tiêu điểm nằm ở BODY trong khi hộp review modal vẫn mở; một lần Tab đi vào hộp review, lần Escape thứ hai đóng nó. Không có gì được lưu (loại ngày vẫn là Worked) | docs/04 dòng 59 ("a nested dialog takes Escape first", "focus returns to the day's date button"); WCAG 2.2 SC 2.4.3 Focus Order | Khi trình sửa phải đổi chế độ trong lúc một hộp thoại modal khác đang mở, giữ hộp thoại đó ở trên: hoãn việc đổi đến khi nó đóng, hoặc mở lại nó sau trình sửa để nó giữ tiêu điểm. Thêm một test e2e desktop: 1280 sang 1024 khi hộp review đang mở, hộp review vẫn ở trên và có tiêu điểm, lần Escape đầu chỉ đóng hộp review (không lưu gì) và trình sửa vẫn mở với tiêu điểm bên trong, lần Escape tiếp theo đóng trình sửa và tiêu điểm trở về nút của ngày |
| WP5-UX-B3-02 | Low | `docs/04_UX_AND_SETTINGS.md:55` và `docs/04_UX_AND_SETTINGS.vi.md:55` | Desktop, kỳ hiện tại 09/28 đến 10/11: nhập 2026-04-06 vào "Open a day" và bấm "Open day" (PC11, `51-…`); `src/client/components/OpenDay.tsx:3` và ô nhập không có `min`/`max` (`61-…`) | Mong đợi: tài liệu mô tả đúng điều khiển đã giao. Thực tế: tài liệu nói "(any date of the period)" / "(mọi ngày trong kỳ)"; điều khiển mở mọi ngày ghi sổ, kể cả ngoài kỳ đang hiện ("Day editor Mon 2026-04-06"), như từ WP2-T10 và như các test e2e của trình sửa ngày dựa vào | AGENTS.md quy tắc 1 (tiếng Anh là nguồn chuẩn, bản dịch khớp); `WP5-UX-AUDIT-B.md` mục 5 (tài liệu mô tả UI đã giao) | Sửa câu chữ ở cả hai file, ví dụ "Open a day" (any date, also outside the displayed period); giữ tương đương EN/VI |

## Rủi ro và cải tiến tùy chọn (không phải lỗi)

- **R-1 Vòng tiêu điểm (có từ trước, không đổi từ trước 014bd47):** `--focus-ring` (`styles.css:37`, `:178`, dùng ở
  `:218`) đo được 1.72:1 trên thẻ sáng và 2.46:1 trên thẻ tối so với nền kề (PC8). Yêu cầu
  đã ghi của dự án, "a visible focus ring" (docs/04 dòng 79), được đáp ứng, nhưng tài liệu Understanding của W3C
  cho WCAG 2.2 SC 1.4.11 mong đợi 3:1 cho chỉ báo tiêu điểm. Không tính là phát hiện của vòng này; khuyến nghị một vòng
  tiêu điểm chung đậm hơn như việc tiếp theo do chủ lên lịch.
- **R-2 Ngày ISO ở đầu trang Review (không đổi):** `ReviewScreen.tsx:170` ("2026-09-28 to 2026-10-11, payroll date
  2026-10-16"; PC9). Chính bảng dùng ngày kiểu Mỹ. Tùy chọn.
- **R-3 Không có nút tài khoản trên điện thoại (không đổi):** tên và Sign out nằm trong More; đầu biểu mẫu hiện "Employee: {name}".
- **R-4 Chú giải luôn ghi "Today" (không đổi):** `TimesheetSheet.tsx:152`. Tùy chọn.
- **R-5 Trình sửa chỉ đọc in "none" (không đổi):** `DayEditor.tsx:407, 413, 423`; bảng không hiện "none" (e2e).
  Tùy chọn.
- **R-6 Cổng (không đổi):** fixture e2e chọn cổng loopback rảnh do OS cấp; server riêng của tôi dùng 48060-48066. Không phải lỗi.
- **O-4 Ngân sách màn hình đầu sát (không đổi):** khi có ghi chú múi giờ và "Clocked out." đáy hàng đầu là 787.7
  so với 788; chế độ batch đẩy nó xuống dưới (932.3 / 1031.2), như ở 589bcff. Trạng thái khi tải mà quy tắc nêu
  vẫn đạt.
- **A2 R5 Người được chia sẻ trên điện thoại (không phải lỗi):** quy tắc B-01 (docs/04 dòng 48) mô tả trang của chủ với thẻ
  đồng hồ; người được chia sẻ có thanh chia sẻ và không có đồng hồ. Đáy hàng đầu đo được: chỉ xem 750.7 (trên 788) khi múi giờ
  trùng, quyền sửa 802.7, chỉ xem 849.7 và quyền sửa 901.7 khi có ghi chú múi giờ (PC10, PC10b). Chủ có thể quyết định có mở rộng
  cam kết này cho chế độ xem chia sẻ hay không.
- **O-5 (mới) Assertion phụ vô hiệu trong test FIX4:** `tests/e2e/timesheet.spec.ts:142` ("the date value is not
  clipped", `input.scrollWidth <= input.clientWidth`) không thể fail với ô ngày của Chromium: ở 589bcff, nơi giá trị
  bị cắt thấy rõ ở 360 và 320px, nó đọc 114/114 và 74/74 (`30-…`). Assertion về độ rộng mới là phần kiểm tra thật. Tùy chọn:
  bỏ nó hoặc thay bằng độ rộng cần thiết đo được.
- **R-7 (mới) Ngưỡng xuống dòng:** `--date-field-min` (9.5rem, 142.5px) rộng hơn khoảng 11px so với mức một ngày đầy đủ cần (589bcff
  hiện "10/09/2026" trọn vẹn ở 131.2px, rộng 375px), nên hàng xuống dòng khi hẹp hơn khoảng 388px. Ở 375x844 khi có ghi chú múi giờ
  đáy hàng ngày đầu nay là 827.4 (589bcff 775.4) và ở 320x844 khi múi giờ trùng là 791.2 (589bcff 739.2), so với
  788. Nằm ngoài quy tắc 390x844; tùy chọn chỉnh lại hai token.

## Cổng bắt buộc chưa chạy hoặc bị chặn, và lý do

Không có ở vùng B. Typecheck, lint, `npm test` và toàn bộ e2e trên cả hai project đã chạy ở đây và pass. Các mục vùng A
nằm ngoài review này.

## Xử lý các phát hiện trước

WP5-UX-B2-01: **đã đóng** (bảng trên). O-1, O-2, O-3: đã làm. R-1..R-6 và O-4 của review B2: đã đánh giá lại, không mục nào là
lỗi của vòng này (R-1 mang theo như việc tiếp theo nên làm). A2 R2: **là lỗi** theo quy tắc của brief, ghi thành
WP5-UX-B3-01 (Low). A2 R5: không phải lỗi. Mới: WP5-UX-B3-01 (Low) và WP5-UX-B3-02 (Low), đang mở; O-5 và R-7 tùy chọn.

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, vùng B:** chưa; WP5-UX-B3-01 cần một sửa nhỏ ở client kèm một test e2e và WP5-UX-B3-02 cần sửa
  một dòng chữ trong docs/04 EN và VI, sau đó freeze, gate và kiểm lại vùng B.
- **Phép của chủ:** không xin và không được cấp; không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một việc tiếp theo

Coordinator: mở một task sửa có giới hạn cho WP5-UX-B3-01 (đổi chế độ của `DayEditor.tsx` khi đang mở một hộp thoại modal lồng,
kèm một test e2e desktop) và WP5-UX-B3-02 (docs/04 dòng 55 EN và VI); tùy chọn O-5 và R-7; sau đó freeze, gate và một
lần kiểm lại vùng B mới trên digest mới.

## Nguồn gốc subagent độc lập

- **Task/lần review, ID người review và ID tác giả được review:** WP5-UX-AUDIT-B3, lần 1; người review tự báo
  `claude-opus-5-5` (subagent mới; ID agent không thấy được từ bên trong). Tác giả được review: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1..FIX4 và các bản freeze, các verifier WP5-UX-GATE, REGATE và REGATE2 (theo ghi chép trong file task; model
  tác giả mạnh nhất được ghi là opus, giống model của tôi).
- **Ngữ cảnh mới; người review không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được review và không chạy gate
  hay audit nào trước đó của vòng này. Tôi không sửa file nguồn, test, tài liệu, board hay STATE. Probe chạy trong các scratch clone ở
  thư mục task, được loại khỏi git bằng `.git/info/exclude`; đột biến V2 chỉ làm trong scratch clone riêng của nó. Các sơ suất
  quy trình, không cái nào ghi ra ngoài thư mục task và thư mục bằng chứng hay đổi kết quả nào: hai lệnh liệt kê chỉ đọc được pipe
  vào `head` (`ls -t … | head -n 1` và `grep … | head -n 8`) và một lệnh `grep` chuyển đầu ra vào `/dev/null`, đều trái
  quy tắc shell của brief.
- **Digest nguồn trước/sau; bằng chứng gate cho snapshot đó:** `0b8428fd…b77d` trước và sau, ba dạng
  (`00-digest-before.txt`, `90-digest-after.txt`); bằng digest ghi nhận của WP5-UX-REGATE2.
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B3.md` và `.vi.md`, file mới;
  `WP5_UX_REVIEW_B.md`, `WP5_UX_REVIEW_B2.md` và mọi review trước không bị đụng tới.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** B2-01 đã đóng; WP5-UX-B3-01 và WP5-UX-B3-02 đang mở; tiếp theo:
  một task sửa cho cả hai, bản freeze, một gate và một lần kiểm lại vùng B.
