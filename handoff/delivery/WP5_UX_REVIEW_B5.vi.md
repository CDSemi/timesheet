# Thiết kế lại UI của WP5, kiểm lại độc lập vùng B trên snapshot cuối (B5) — đúng yêu cầu của chủ, độ mạnh của test, trợ năng, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B5.md](WP5_UX_REVIEW_B5.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI theo yêu cầu của chủ trong WP5, task
  WP5-UX-AUDIT-B5, attempt 1, 2026-10-09 (UTC 22:35Z đến khoảng 23:45Z). Reviewer tự báo model `claude-opus-5-5`, profile
  timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Vùng A được kiểm lại riêng (WP5-UX-AUDIT-A5) và
  không nằm trong báo cáo này. Các review vùng B trước [B](WP5_UX_REVIEW_B.vi.md), [B2](WP5_UX_REVIEW_B2.vi.md),
  [B3](WP5_UX_REVIEW_B3.vi.md) và [B4](WP5_UX_REVIEW_B4.vi.md) được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `5e104e14dad71268a9185920c04ed0ee2a4b31c2` (bản freeze của WP5-UX-REGATE4; HEAD = origin/main); digest
  `07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635`, 790 file, không tính `handoff/`, ghi đầu tiên (sau
  `node --version`, 22:35:57Z) và ghi lại sau mọi kiểm tra, bằng nhau ở ba dạng (dạng `git ls-tree`, `scripts/source-digest.mjs`
  trong repository làm việc, và trong một scratch clone ở 5e104e1 với `git status --short` rỗng). Không path nào ngoài
  `handoff/` khác 5e104e1; không có commit chưa push. Source đủ: scratch clone sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.** **WP5-UX-B4-01 đã đóng** ở đúng điều nó nêu: render thật với phím Tab thật, vòng focus dùng
  chung đạt ít nhất 3:1 so với nền liền kề trên mọi loại điều khiển brief liệt kê, ở cả hai giao diện (thấp nhất 4,11 sáng /
  4,36 tối, nút mở bộ chọn nhãn so với đường kẻ ô; mọi nhóm khác 4,50 đến 6,09 sáng, 4,93 đến 7,52 tối), và check e2e mới
  fail trên token của edaaa85. **WP5-UX-B4-02 đã đóng** (ghi chú múi giờ hiện "Wed 10/14/2026, 07:00"; docs/04 dòng 45 khớp;
  có assertion unit và e2e). Mọi kiểm tra bắt buộc đạt (typecheck, lint, `npm test` 82 file / 1821 test, e2e đầy đủ 190 test:
  174 đạt, 16 bỏ qua, 0 lỗi) và không assertion nào bị bỏ hay làm yếu kể từ 014bd47. Nhưng các điều kiện của chính brief cho
  chỉ báo focus ("không bị thanh dính che", "bộ chọn nhãn") chưa đạt, và ba lỗi WCAG 2.2 AA chặn theo quy tắc mức độ của brief:
  **WP5-UX-B5-01 (Medium)** thanh trên cùng dạng sticky (desktop và điện thoại) và phần đầu sticky của trình sửa ngày trên điện
  thoại che hoàn toàn điều khiển đang focus khi bấm Shift+Tab (SC 2.4.11, failure F110); **WP5-UX-B5-02 (Medium)** trong bộ
  chọn nhãn đang mở, vị trí bàn phím (option đang active) chỉ được báo bằng một lớp màu 1,14:1 (sáng) / 1,28:1 (tối) và danh
  sách đang focus không có vòng (SC 1.4.11 cùng 2.4.7); **WP5-UX-B5-03 (Low)** chính `<dialog>` của trình sửa ngày là một
  điểm dừng bàn phím (panel cuộn được) mà không có chỉ báo focus nhìn thấy (SC 2.4.7).

## Phạm vi thật đã xem/chạy

1. B4-01 và B4-02: diff FIX6 `edaaa85..5e104e1` (8 file ngoài `handoff/`, `10-…`); probe Playwright của tôi `b5.probe.ts`
   trên server build của tôi (cổng 48200-48205), với Tab và Shift+Tab thật trên trang Timesheet (xuôi, ngược, chế độ nhiều
   ngày), trình sửa ngày (panel bên 1280, modal 1024, bottom sheet 390), hộp thoại Clock out và xem lại nhãn, bộ chọn nhãn
   đang mở, và các màn hình Review, Overtime, History, Settings, sáng và tối, desktop và điện thoại. Ở mỗi điểm dừng probe
   chụp viewport khi điều khiển đang focus và khi đã blur (transition được chạy tới cuối), giải mã cả hai PNG và đọc, trên các
   đường cắt qua từng cạnh, pixel vòng thay đổi nhiều nhất, pixel render ngay bên ngoài (nền liền kề), pixel ngay bên trong và
   màu có ở đó trước khi focus; probe cũng thử xem điều khiển có bị che không (lưới `elementFromPoint` 5x5). `focus-ring.spec.ts`
   mới được chạy trên token của edaaa85 và trên một đột biến một quy tắc, chỉ trong bản sao scratch (`30-…` đến `33-…`).
2. Vùng B trên toàn snapshot (mục 1-6 của `WP5-UX-AUDIT-B.md`): yêu cầu của chủ và E-1..E-7 so với màn hình thật (ảnh e2e và
   ảnh probe của tôi), độ mạnh test trên mọi file test đổi từ 014bd47 (`11-…` đến `14-…`), trợ năng (thứ tự Tab, tên, hành vi
   focus và modal, chữ và hình của trạng thái, 44px và reflow ở 390/375/360/320, tương phản chữ render), chuẩn UI
   (`css-scan.mjs`, truy vết deprecation của Node, console trình duyệt), độ chính xác và tương đương EN/VI của docs/04, docs/10
   và docs/12 (`parity.mjs`).
3. Các rủi ro của `WP5_UX_REVIEW_B4.md` được đánh giá lại theo quy tắc mức độ của brief.
4. Các kiểm tra bắt buộc, tự chạy trong scratch clone với Node v24.21.0.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B5/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước) | `07c3ca00…e635`, 790 file | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone ở 5e104e1) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 file, 1821 test đạt | `04-npm-test.txt` |
| `npm run test:e2e` (build + toàn bộ Playwright, Edge, cả hai project) | exit 0; 190 test: 174 đạt, 16 bỏ qua, 0 lỗi; desktop 86 đạt + 9 bỏ qua, mobile 88 đạt + 7 bỏ qua (mọi skip theo project); 5,0 phút | `05-e2e-full.txt`, `05a-e2e-counts.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build với `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; server của probe có truy vết | exit 0 mỗi lệnh; 0 dòng deprecation; console trình duyệt: 0 thông báo deprecation | `07-…` |
| `focus-ring.spec.ts` trên `styles.css` của edaaa85 (bản sao scratch) | exit 1: 4/4 fail, "--focus-ring rgba(31, 95, 191, 0.35) … against --card" 1,72 (sáng), "rgba(110, 168, 255, 0.45)" 2,46 (tối) | `30-…`, `31-…` |
| `focus-ring.spec.ts` khi chỉ `.sheet .sheet-date:focus-visible` dùng lại vòng cũ (bản sao scratch) | exit 1: desktop sáng và tối fail ở "sheet date ring … against its backdrop" (1,72 / 1,35); điện thoại đạt (nút ngày ở đó là phần tử khác) | `32-…`, `33-…` |
| P1-P4 vòng render theo nhóm điều khiển, hai giao diện, hai project (probe chạy `5e104e1r2`, `5e104e1r3`, exit 0) | xem "B4-01" bên dưới | `40-…`, `41-…` đến `44-…`, `41a-aggregate.txt` |
| P8 Shift+Tab từ cuối bảng (desktop 1280x800) | "Edit 2026-10-04" … "Edit 2026-09-28" mỗi nút ở y = 0,17 dưới thanh sticky 56px, 0/25 điểm nhìn thấy, không có chỉ báo nào trên màn hình | `48a-…`, ảnh `b5-sticky-hidden-desktop-…` |
| P1 đi ngược (điện thoại 390x844) | "Edit 2026-10-09", "Edit 2026-10-08", "Edit 2026-10-02", "Next period", "Previous period": 0/25 nhìn thấy dưới thanh gọn | `41-…`, ảnh `b5-sticky-hidden-phone-…` |
| P2 đi ngược trong bottom sheet (390x844) | "Worked from home (WFH)" và "Confirm suggested breaks": 0/25 nhìn thấy dưới phần đầu sticky của trình sửa | `42-…`, ảnh `b5-editor-head-hidden-phone-…` |
| P3 bộ chọn nhãn đang mở, ba vị trí mũi tên, hai giao diện, hai project | listbox đang focus, `:focus-visible` true, box-shadow = bóng overlay (không có vòng); option active render #ebf1f9 trên #ffffff = 1,14:1 (sáng), #263347 trên #1a2029 = 1,28:1 (tối); không có dấu hiệu nào khác | `43-…`, ảnh `b5-label-list-…` |
| P8 Shift+Tab từ "Close" trong trình sửa ngày (1280, 1024, 390) | focus nằm trên chính `<dialog>` (tabIndex -1, không có thuộc tính, scrollHeight 1465 > clientHeight 720); box-shadow = bóng panel, outline trong suốt; 0 pixel đổi; ArrowDown cuộn nó 40px | `48a-…`, ảnh `b5-editor-dialog-focused-…` |
| P5 điện thoại 390/375/360/320: mặc định, nhiều ngày, trình sửa, danh sách nhãn, More, Review | 0 cuộn ngang, 0 phần tử tràn, 0 điều khiển nhìn thấy dưới 44x44 trong 24 trạng thái (41 / 60 / 42 / 48 / 44 / 9 điều khiển) | `45-…` |
| P6 ghi chú múi giờ, tên, chữ Check, tương phản chữ render | ghi chú "Due, your time (Asia/Saigon) Wed 10/14/2026, 07:00" = giá trị Intl tính lúc chạy cho 2026-10-14T00:00:00Z, cả hai project; 14 tên ngày "Mon 2026-09-28" … "Sun 2026-10-11"; mọi Check có chữ và hình; chữ tối thiểu 5,00 sáng / 5,74 tối, 0 dưới 4,5 | `46-…`, ảnh `b5-zone-note-…` |
| Quét token CSS của `styles.css` | 0 literal màu, bóng, thời lượng, font hay url ngoài các khối token; `--radius: 4px`; 7/7 transition `var(--transition)` = `all 300ms ease-out`; 0 `var()` chưa định nghĩa; có khối reduced-motion | `20-css-scan.txt` |
| Tương đương EN/VI (docs/04, mục của vòng trong docs/10, docs/12) | cấu trúc, code span, con số bằng nhau; chỉ tên mục được dịch khác | `60-docs-parity.txt` |
| digest, ba dạng (sau) | `07c3ca00…e635`, 790 file, đều bằng nhau | `90-digest-after.txt` |

## WP5-UX-B4-01 và WP5-UX-B4-02

| Mục | Xử lý | Quan sát |
|---|---|---|
| WP5-UX-B4-01 | **Đã đóng** (tương phản token mà nó nêu); xem B5-01..B5-03 cho các điều kiện thêm của brief | `styles.css:42-43`: `--focus-ring: 0 0 0 1px var(--card), 0 0 0 3px var(--accent)` và `--focus-ring-inset` cho tab điện thoại; ghi đè cho giao diện tối đã bỏ vì `--card` và `--accent` tự đổi. Render, phím Tab thật, vòng ngoài so với pixel liền kề (sáng / tối, desktop và điện thoại): liên kết thanh trên và Sign out 6,09 / 6,79; tab điện thoại 4,50-6,09 / 5,21-6,79; nút kỳ 6,06-6,09 / 6,48-6,79; Clock in 6,09 / 6,70-6,79; liên kết Review 5,87-6,09 / 5,15-6,79; "Edit {date}" của bảng 5,23-6,09 / 4,93-6,79 (ngày không làm việc thấp nhất; một lần đo 2,11 ở chế độ nhiều ngày trên điện thoại là nét chữ của nhãn bên cạnh, vòng so với ô là 6,09, R-15); nút mở bộ chọn nhãn (vòng inset 2px màu nhấn riêng) 4,11-6,09 / 4,36-6,79; thanh công cụ 6,09 / 6,79; điều khiển nhiều ngày 4,86-6,09 / 5,43-6,79; trường và nút của trình sửa 5,38-6,09 / 6,11-6,79; nút hộp thoại 6,09 / 6,79; Review, Overtime, History, Settings 4,50-6,09 / 5,09-7,52 (`41a-aggregate.txt`). Vòng không bị `overflow` cắt, trừ một cạnh khi trình duyệt căn điều khiển sát mép vùng cuộn (R-11). Check mới fail trên token của edaaa85 (4/4) và trên một hồi quy một quy tắc của ngày trong bảng (desktop). |
| WP5-UX-B4-02 | **Đã đóng** | `periodBarModel.ts:28-32` `dueInZoneText` dùng bởi `PeriodBar.tsx:73`: ghi chú múi giờ hiện "Wed 10/14/2026, 07:00" dưới "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)", bằng giá trị Intl mà probe của tôi tính cho `due_at_utc` 2026-10-14T00:00:00Z ở Asia/Saigon (cả hai project). docs/04 dòng 45 (MM/DD/YYYY trên thanh kỳ) đúng ở EN và VI. `periodBarModel.test.ts` (2 múi giờ) và `timesheet.spec.ts:232-239` (giá trị mong đợi tính lúc chạy test) kiểm nó. Chỉ hiển thị: không request hay giá trị nào đổi (`10a-…`). |

## Yêu cầu của chủ, E-1..E-7 và điều hướng (phạm vi 2)

- **Bảng trên desktop (E-1, E-2, E-4, E-6):** phần đầu biểu mẫu (công ty, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES", Employee,
  Payroll Date, Period), "WEEK 1" và "WEEK 2" từ thứ Hai đến Chủ nhật với Day, Date, Label, Time, OT (h:mm), Check và các dòng
  chi tiết, chú giải, "Overtime Total :" dạng h:mm, dòng chữ ký với "Not used yet" cho manager, ngày không làm việc có nền nhạt
  và sọc, ngày kiểu Mỹ, h:mm, giờ 24 giờ (ảnh từ lần chạy e2e của tôi). **Đạt.**
- **E-3 (a):** panel bên từ 1200px, panel bên dạng modal 768-1199px, bottom sheet trên điện thoại, bộ chọn nhãn trong ô; focus
  chuyển tới tiêu đề panel khi mở và trở về "Edit {date}" khi Escape ở 1280, 1024 và 390 (P2). **Đạt**, kèm các lỗi bàn phím
  B5-02 và B5-03.
- **E-5 (a), E-7 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); điện thoại ba tab và More (spec shell, admin,
  import đạt); Overtime, History và Settings chưa làm lại giao diện. **Đạt.**
- **Bố cục điện thoại:** thẻ kỳ, thẻ đồng hồ, công cụ gọn, rồi tới bảng; test e2e màn hình đầu ở 390x844 đạt. **Đạt.**
- **docs/04 dòng 16 (múi giờ đang xem):** thanh luôn hiện "Times in {zone}"; mỗi ngày giữ ngày ghi sổ. **Đạt.**

## Độ mạnh của test (phạm vi 2)

Mọi file test đổi từ 014bd47 (`11-…`) được đọc lại và mọi dòng bị bỏ (`12-…`) được đánh giá so với dòng thay thế trong ngữ
cảnh (`13a-…` đến `13d-…`); bảng nằm trong `13-test-strength.txt`. FIX6 không bỏ gì: nó thêm hai expectation cho
`dueInZoneText`, assertion của ghi chú múi giờ (do runtime của test tính, không phải app) và `focus-ring.spec.ts` mới. Kết quả:
**không assertion nào bị bỏ hay làm yếu từ 014bd47, kể cả FIX6.** Không có `only` hay `fixme`; mọi `test.skip` theo project
(`14-…`); `playwright.config.ts`, `vitest.config.ts` và `tests/e2e/fixtures.ts` không đổi từ 014bd47. `.filter({ visible: true })`
trong các vòng lặp kiểm cỡ chạm chỉ loại các điều khiển không được render trên điện thoại (`49-…`); P5 của tôi thấy 0 điều
khiển nhìn thấy dưới 44px.

## Trợ năng (phạm vi 2)

- Thứ tự bàn phím bằng thứ tự đọc ở cả hai bố cục, thứ Hai..Chủ nhật tuần 1 rồi tuần 2 (14 điểm dừng "Edit {date}" theo thứ tự
  ngày, P1, cả hai project và giao diện). **Đạt.**
- Tên: "Edit {date}", "Label for {date}: {label}", phần tử ngày "Mon 2026-09-28" …, hộp thoại mang tên theo tiêu đề. **Đạt.**
- Modal và focus: focus tới tiêu đề panel khi mở, Escape và Close trả focus về nút của ngày (1280, 1024, 390); hộp thoại xem lại
  lồng bên trong nhận Escape trước và nhãn vẫn là Worked (P3); trình sửa modal và các hộp thoại: 0 điểm dừng Tab ở ngoài. **Đạt.**
- Trạng thái không bao giờ chỉ bằng màu: 10 ô Check, mỗi ô có chữ và hình (P6). **Đạt.**
- 44px và reflow ở 390, 375, 360 và 320: 0 điều khiển nhỏ, 0 cuộn ngang, 0 phần tử tràn trong 24 trạng thái (P5). **Đạt.**
- Tương phản: chữ tối thiểu 5,00 sáng / 5,74 tối (P6); vòng focus xem B4-01. **Đạt.**
- Focus không bị che (SC 2.4.11): **không đạt, WP5-UX-B5-01.** Chỉ báo focus của bộ chọn nhãn đang mở (SC 1.4.11, 2.4.7):
  **không đạt, WP5-UX-B5-02.** Focus nhìn thấy ở mọi điểm dừng bàn phím (SC 2.4.7): **không đạt ở một điểm dừng,
  WP5-UX-B5-03.**

## Chuẩn UI và API deprecated (phạm vi 2)

Chỉ dùng token ngoài các khối token, `--radius: 4px`, một `--transition` dùng chung (`all 300ms ease-out`) cho cả 7 transition,
bóng nhiều lớp, giảm chuyển động, chỉ font hệ thống, không style inline; các giá trị của FIX6 là token (`20-…`). Lint
`no-deprecated` exit 0; 0 dòng deprecation của Node trong lint, `npm test`, build và các server đang chạy; 0 thông báo
deprecation của trình duyệt (`07-…`). **Đạt.**

## Tài liệu (phạm vi 2)

docs/04 các dòng 7, 41, 45, 48, 53, 55, 59 và 79 mô tả đúng UI đã giao; docs/10 ghi E-1..E-7 và các công thức Excel không tái
tạo; docs/12 tóm tắt vòng và giữ nguyên định danh bản phát hành tới khi vòng được chấp nhận. Tương đương EN/VI giữ được
(`60-…`). **Đạt** (rủi ro về câu chữ R-14).

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-B5-01 | Medium | `src/client/styles.css:238-250` (`.shell-bar { position: sticky; top: 0 }`), `:382-386` (chỉ `scroll-padding-bottom`, điện thoại), `:1975-1983` (`.day-panel .editor-head { position: sticky; top: 0 }`; `.day-panel` ở `:1909-1920` không có scroll padding) | Desktop 1280x800: focus liên kết "Review & sign off" của bảng (cuối trang), bấm Shift+Tab: các bộ chọn nhãn và ngày của tuần 2 vẫn nhìn thấy, rồi "Edit 2026-10-04" … "Edit 2026-09-28" mỗi nút nằm ở y = 0,17 dưới thanh 56px, 0/25 điểm nhìn thấy, không có chỉ báo focus nào trên màn hình (sáng và tối). Điện thoại 390x844: Shift+Tab từ cuối: "Edit 2026-10-09", "Edit 2026-10-08", "Edit 2026-10-02", "Next period", "Previous period" bị thanh gọn che hoàn toàn. Bottom sheet: Shift+Tab từ cuối trình sửa: "Worked from home (WFH)" và "Confirm suggested breaks" bị phần đầu sticky của trình sửa che hoàn toàn (ở 1280 và 1024 cũng bị che phần lớn, 5/25 nhìn thấy). Thanh sticky là mới trong vòng này (ở 014bd47 không sticky) | Kỳ vọng: điều khiển đang focus không bao giờ bị nội dung của tác giả che hoàn toàn. Thực tế: 7 điểm dừng trên bảng desktop, 5 trên bảng điện thoại và 2 trong bottom sheet bị che hoàn toàn khi tới bằng Shift+Tab (`html` scroll-padding-top là `auto` ở cả hai bố cục) | WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), failure F110 (header sticky), technique C43 (`scroll-padding`); brief: "the ring must not be … hidden behind sticky bars" | Scroll padding theo token: `html { scroll-padding-top: calc(var(--bar-height-compact) + var(--space-2)) }` dưới 768px và `calc(var(--bar-height) + var(--space-2))` từ 768px (giữ padding dưới), và một `scroll-padding-top` trên `.day-panel` vượt qua phần đầu sticky của trình sửa (hoặc phần đầu không sticky); thêm e2e bấm Shift+Tab từ cuối bảng và cuối trình sửa và kiểm mỗi điều khiển đang focus không bị che (`elementFromPoint`), desktop và điện thoại |
| WP5-UX-B5-02 | Medium | `src/client/styles.css:2243-2259` (`.label-list { box-shadow: var(--shadow-overlay) }` thay vòng `:focus-visible` dùng chung của `:220-224` trên danh sách đang focus), `:2275-2277` (`.label-option.active { background: var(--day-selected) }`, `--day-selected` `:103` sáng 9%, `:192` tối 14%); `SheetWeekTable.tsx:137-160` (focus trên listbox, `aria-activedescendant`) | Mọi project và giao diện: Tab tới "Label for {date}", bấm Enter, rồi ArrowDown: danh sách giữ focus DOM (`:focus-visible` true) và không có vòng; option mà Enter sẽ chọn chỉ được đánh dấu bằng lớp màu: render #ebf1f9 so với #ffffff = 1,14:1 (sáng), #263347 so với #1a2029 = 1,28:1 (tối); không có outline, viền, hình hay thay đổi chữ (P3, ảnh). Một lựa chọn không cần xem lại sẽ lưu ngay | Kỳ vọng: vị trí bàn phím trong bộ chọn có chỉ báo ít nhất 3:1 so với màu liền kề. Thực tế: 1,14:1 / 1,28:1 và danh sách không có vòng | WCAG 2.2 SC 1.4.11 Non-text Contrast (chỉ báo focus) cùng SC 2.4.7 Focus Visible; docs/04 dòng 63 ("dùng được bằng chuột hoặc bàn phím"); brief có liệt kê bộ chọn nhãn | Chỉ dùng token: cho `.label-option.active` một chỉ báo ít nhất 3:1 (ví dụ `box-shadow: var(--focus-ring-inset)` hoặc vạch màu nhấn/nền màu nhấn đặc với chữ `--on-accent`) và giữ hoặc trả lại vòng cho `.label-list:focus-visible` (ví dụ `box-shadow: var(--focus-ring), var(--shadow-overlay)`); mở rộng `focus-ring.spec.ts` để mở bộ chọn, di chuyển bằng mũi tên và đo option active ở cả hai giao diện |
| WP5-UX-B5-03 | Low | `src/client/DayEditor.tsx:238-247` (`<dialog className="day-panel …">`), `src/client/styles.css:1909-1920` (`.day-panel { box-shadow: var(--shadow-overlay); overflow: auto }` thay vòng `:focus-visible` của `:220-224`; outline trong suốt) | 1280, 1024 và 390: mở trình sửa của một ngày, Tab một lần tới "Close", bấm Shift+Tab: focus nằm trên chính `<dialog>` (một vùng cuộn nhận focus bàn phím: scrollHeight 1465 > clientHeight 720; ArrowDown cuộn nó), `:focus-visible` true, không gì trên màn hình thay đổi (0 pixel đổi; ảnh). Ở 1280 lượt đi ngược là Close → dialog → liên kết "Review & sign off" của bảng, nên điểm dừng trống này cũng nằm giữa bảng và điều khiển đầu tiên của panel | Kỳ vọng: mọi điểm dừng bàn phím có chỉ báo focus nhìn thấy. Thực tế: một điểm dừng không có | WCAG 2.2 SC 2.4.7 Focus Visible (dạng failure F78: style của tác giả xóa chỉ báo nhìn thấy); brief: "editor fields and dialog buttons" | Chỉ dùng token: `.day-panel:focus-visible { box-shadow: var(--focus-ring), var(--shadow-overlay) }` (hoặc một vòng inset không bị cắt), tương tự cho mọi `.dialog` cuộn được; thêm điểm dừng này vào check vòng của e2e |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-2 Ngày ISO trong phần đầu Review (không đổi):** `ReviewScreen.tsx:170`; không phải phần đầu bảng của docs/04 dòng 41.
  Tùy chọn.
- **R-3 Không có nút tài khoản trên điện thoại (không đổi):** tên và Sign out nằm trong More (docs/04 dòng 7). Không phải lỗi.
- **R-4 Chú giải luôn có "Today" (không đổi):** `TimesheetSheet.tsx:284` (`<Legend today />`). Tùy chọn.
- **R-5 Trình sửa chỉ đọc và các số của trình sửa in "none" (không đổi):** `DayEditor.tsx:428, 434, 444`; docs/04 dòng 43 nói
  về ô của bảng, nơi không có "none" (e2e). Tùy chọn.
- **R-6 Cổng (không đổi):** fixture e2e chọn cổng loopback trống do OS cấp; server của tôi dùng 48200-48205. Không phải lỗi.
- **O-4 Ngân sách màn hình đầu và A2 R5 người được chia sẻ (không đổi):** test màn hình đầu 390x844 đạt; trạng thái khác nằm
  ngoài quy tắc. Không phải lỗi.
- **R-8 Focus khi đổi chế độ (không đổi):** vượt ngưỡng 1200px chuyển focus về tiêu đề trình sửa. Tùy chọn.
- **R-9 Viền ô nhập (không đổi):** viền `--line` khoảng 1,35:1; mọi ô nhập có nhãn nhìn thấy, và vòng focus nay đạt ít nhất
  3:1. Tùy chọn.
- **R-10 (mới) Hover che vòng:** con trỏ dừng trên điều khiển đang focus bằng bàn phím sẽ thay vòng của nó, vì
  `button:hover:not(:disabled)` (`styles.css:496`), `.sheet .sheet-date:hover:not(:disabled)` (`:1328`),
  `.sheet .label-trigger:hover:not(:disabled)` (`:2216`) và `.shell-tabs .tab:hover:not(:disabled)` (`:327`) thắng các quy tắc
  `:focus-visible` (P7: Clock in hiện bóng panel, ngày trong bảng không có gì, nút nhãn một đường màu nhấn 1px). Vòng hiện khi
  con trỏ ở chỗ khác, nên SC 2.4.7 vẫn đạt. Tùy chọn: để vòng focus thắng hover.
- **R-11 (mới) Vòng bị cắt ở mép vùng cuộn:** khi trình duyệt căn một điều khiển sát mép dưới viewport (desktop) hoặc mép
  dưới panel trình sửa ("Save day fields" ở 1280/1024), một cạnh của vòng ngoài nằm ngoài vùng cuộn (3/4 cạnh nhìn thấy).
  Tùy chọn; scroll padding của bản sửa B5-01 cũng xử lý được.
- **R-12 (mới) Ô ngày khi tới bằng Shift+Tab:** Tab vào "Open a day" hiện vòng dùng chung (6,09 / 6,79, desktop; ảnh cắt trên
  điện thoại thấy vòng). Shift+Tab rơi vào nút lịch riêng của trình duyệt bên trong ô: phần tử chủ không khớp
  `:focus-visible`, nên không có vòng của tác giả, nhưng trình duyệt vẽ outline của nó quanh biểu tượng lịch (chỉ báo của
  UA, nhìn thấy; ảnh cắt P9). Không phải lỗi; tùy chọn style `::-webkit-calendar-picker-indicator:focus-visible` bằng token.
  Trên project điện thoại, cách đo dựa vào blur không tách được vòng của ô ngày và giờ (ảnh sau blur vẫn có vòng); ảnh cắt khi
  focus có vòng, nên các dòng "không có vòng" của những ô đó trong `41a-aggregate.txt` là giới hạn đo, không phải phát hiện.
- **R-13 (mới) Phạm vi của check mới:** `focus-ring.spec.ts` kiểm token dùng chung trên 7 token bề mặt và bốn điều khiển thật;
  nó không kiểm bộ chọn nhãn đang mở, điểm dừng dialog của trình sửa hay việc bị thanh sticky che, và `parseColour` trả về màu
  đen với cú pháp màu khác `rgb()`/`rgba()` (một token `oklch()` sau này có thể đạt một cách rỗng trên bề mặt sáng). Tùy
  chọn, nên sửa cùng B5-01..B5-03.
- **R-14 (mới) Câu chữ docs/04:** dòng 43 nói ngày không có bản ghi không hiện chữ giữ chỗ, trong khi ô Time của ngày làm việc
  đã qua mà chưa có giờ hiện ghi chú "no times yet" (như mockup đã duyệt); dòng 79 nói "một token dùng chung" trong khi tab
  điện thoại dùng biến thể inset của nó và nút nhãn dùng vòng màu nhấn 2px riêng (cả hai ít nhất 3:1). Tùy chọn cho chính xác.
- **R-15 (mới) Chật ở chế độ nhiều ngày trên điện thoại:** vòng của nút ngày chạm chữ nhãn bên cạnh ("Worked"); vòng vẫn nhìn
  thấy đầy đủ (6,09 so với ô). Tùy chọn giãn khoảng.
- **Thông tin ngoài vùng B:** `npm ci` báo 1 advisory mức high; các review trước truy ra là dependency phát triển. Ở đây
  không kiểm lại.

## Gate chưa chạy/bị chặn và lý do

Không có ở vùng B. Typecheck, lint, `npm test` và toàn bộ e2e trên cả hai project đã chạy ở đây và đạt. Các mục của vùng A nằm
ngoài review này.

## Xử lý phát hiện trước

WP5-UX-B4-01: **đã đóng** (tương phản vòng dùng chung). WP5-UX-B4-02: **đã đóng**. R-2..R-6, O-4, A2 R5, R-8 và R-9: đánh giá
lại, không cái nào là lỗi theo quy tắc mức độ của brief. Mới: WP5-UX-B5-01 (Medium), WP5-UX-B5-02 (Medium) và WP5-UX-B5-03
(Low), còn mở; R-10..R-15 tùy chọn.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

- **Sẵn sàng phần mềm, vùng B:** chưa; B5-01 cần scroll padding theo token, B5-02 một chỉ báo option active mạnh hơn và vòng
  cho danh sách, B5-03 một vòng cho panel trình sửa khi focus, mỗi cái kèm một check tự động; sau đó freeze, gate và kiểm lại
  vùng B.
- **Phép của chủ:** không xin và không được cấp; không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một bước tiếp

Coordinator: mở một task sửa có phạm vi cho WP5-UX-B5-01..B5-03 (scroll padding cho thanh trên cùng sticky và phần đầu trình
sửa, chỉ báo option active 3:1 cùng vòng cho danh sách trong bộ chọn nhãn, vòng cho panel trình sửa khi focus; chỉ dùng token;
các check e2e fail trên 5e104e1), rồi freeze, gate và một lần kiểm lại vùng B mới trên digest mới.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-B5, attempt 1; reviewer tự báo `claude-opus-5-5`
  (subagent mới; agent ID không thấy được từ bên trong). Tác giả được kiểm: WP5-UX-PLAN, WP5-UX-T01..T06, WP5-UX-FIX1..FIX6 và
  các freeze của chúng, và các verifier của gate (theo file task; model tác giả mạnh nhất được ghi là opus `claude-opus-5-5`,
  FIX6 và REGATE4 `claude-sonnet-5-5`), nên model của tôi không yếu hơn tác giả nào.
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm và không chạy gate hay
  audit trước nào của vòng này. Tôi không sửa file source, test, doc, bảng hay STATE nào. Probe của tôi chạy trong một scratch
  clone ở thư mục task, được giữ ngoài git bằng `.git/info/exclude`; hai đột biến chỉ làm trong bản sao scratch thứ hai. Các
  sơ suất quy trình, không cái nào ghi ra ngoài thư mục task và evidence hay đổi kết quả nào: một lệnh chỉ đọc
  `grep … styles.css | head -n 40` (pipe vào `head`, trái quy tắc shell của brief); một `sleep 60` bị harness từ chối (không
  có tác dụng). Lần chạy probe đầu (tag `5e104e1`) dừng các lượt Tab sớm ở ô ngày (các phần của ô giữ focus); tôi sửa bộ đi
  Tab và chạy lại toàn bộ (tag `5e104e1r2`, bổ sung `5e104e1r3`); kết luận dựa trên các lần chạy lại, lần đầu được giữ để
  lưu vết.
- **Digest trước/sau; bằng chứng gate snapshot đó:** `07c3ca00…e635` trước và sau, ba dạng (`00-digest-before.txt`,
  `90-digest-after.txt`); bằng digest ghi nhận của WP5-UX-REGATE4.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B5.md` và `.vi.md`, file mới; mọi review trước
  không bị chạm.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** B4-01 và B4-02 đã đóng; WP5-UX-B5-01..B5-03 còn mở; tiếp theo:
  một task sửa cho chúng, freeze, gate và kiểm lại vùng B.
