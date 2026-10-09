# Thiết kế lại UI của WP5, kiểm lại độc lập vùng B trên snapshot cuối — bám yêu cầu của chủ, độ mạnh test, trợ năng, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B4.md](WP5_UX_REVIEW_B4.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/người review và model/effort quan sát được:** vòng thay đổi UI theo yêu cầu của chủ thuộc WP5, task
  WP5-UX-AUDIT-B4, lần 1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T11:07Z đến khoảng 11:50Z). Model tự báo của người
  review `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Vùng A được
  kiểm lại riêng (WP5-UX-AUDIT-A4) và không nằm trong review này. Các review vùng B trước
  [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md), [WP5_UX_REVIEW_B2.md](WP5_UX_REVIEW_B2.md) và
  [WP5_UX_REVIEW_B3.md](WP5_UX_REVIEW_B3.md) được giữ nguyên.
- **Commit SHA và digest nguồn được review; commit chưa push; độ đầy đủ của nguồn:** commit
  `edaaa852370128ca9bdf206d730f3849346ba994` (bản freeze của WP5-UX-REGATE3; HEAD = origin/main); digest
  `b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873`, 789 file, không tính `handoff/`, ghi đầu tiên (sau
  `node --version`, 11:07:42Z) và ghi lại sau mọi kiểm tra (11:39:17Z), bằng nhau ở ba dạng (dạng `git ls-tree`,
  `scripts/source-digest.mjs` trong repository làm việc, và trong một scratch clone tại edaaa85 với `git status --short`
  rỗng). 0 đường dẫn ngoài `handoff/` khác edaaa85; không có commit chưa push. Nguồn đầy đủ: scratch clone sạch, `npm ci`
  exit 0.
- **Quyết định: FIX REQUIRED.** Bốn mục của vòng sửa đã đóng: **B3-01** (hộp review giữ lớp trên cùng, tiêu điểm và Escape
  khi qua mốc 1200px ở mọi đường tôi thử, không gì được lưu, tiêu điểm không bao giờ rơi về BODY, và test mới fail trên hành
  vi của a2ea7a4), **B3-02** (docs/04 dòng 55 EN và VI), **O-5** (assertion thay thế fail khi ngày bị cắt) và **R-7** (đủ
  ngày ở 390, 375, 360 và 320px; 390x844 không đổi). Mọi kiểm tra bắt buộc đều pass (typecheck, lint, `npm test` 82 file /
  1820 test, e2e đầy đủ 186 test: 170 pass, 16 skip, 0 fail). Không assertion nào bị bỏ hay làm yếu từ 014bd47. Hai phát
  hiện chặn theo quy tắc mức độ của brief: **WP5-UX-B4-01 (Medium)**, đánh giá lại R-1: vòng focus dùng chung đo được 1.72:1
  (sáng) và 2.46:1 (tối) so với nền kề bên trên nút, liên kết, tab và các nút "Edit {date}" của bảng, dưới mức 3:1 mà WCAG 2.2
  SC 1.4.11 yêu cầu cho chỉ báo focus do tác giả tạo kiểu; và **WP5-UX-B4-02 (Low)**: ghi chú múi giờ của thanh kỳ in hạn
  theo múi giờ hiển thị ở dạng ISO ("2026-10-14 07:00"), trong khi docs/04 dòng 45 (EN và VI) nói thanh kỳ dùng MM/DD/YYYY.

## Phạm vi đã kiểm tra và chạy thực tế

1. B3-01, B3-02, O-5, R-7: diff FIX5 `a2ea7a4..edaaa85` (6 file ngoài `handoff/`; `10-…`, `10a-…`); probe Playwright riêng
   của tôi `ux4.probe.ts` trên server tự build (Q1 hộp thoại lồng qua mốc 1200px theo bảy đường, Q2 trình sửa đứng một mình
   và khi có cảnh báo nghỉ, Q3/Q3b ô "Open a day" và ngân sách màn hình đầu); các test e2e mới chạy trên DayEditor của
   a2ea7a4 và assertion thay thế của O-5 chạy với soft assertion trên quy tắc open-day của 589bcff, chỉ trong scratch copy
   (`30-…`, `31-…`, `32-…`); cùng probe Q1/Q2 trên DayEditor của a2ea7a4 làm đối chứng (`45b-…`).
2. Vùng B trên toàn snapshot (mục 1-6 của `WP5-UX-AUDIT-B.md`): yêu cầu của chủ và E-1..E-7 so với màn hình đã giao (ảnh e2e
   của lần chạy của tôi, probe), độ mạnh test trên mọi file test đổi từ 014bd47 (`11-…` đến `14-…`), trợ năng (Q4-Q7: 44px,
   reflow ở 320px, bottom sheet, thứ tự Tab, tên, chữ trạng thái, tương phản và vòng focus), chuẩn UI (`css-scan.mjs`, font
   và CSP, truy vết deprecation của Node, console trình duyệt), độ chính xác và tương đương EN/VI của docs/04, docs/10 và
   docs/12 (`parity.mjs`).
3. R-1..R-6, O-4 và A2 R5 được đánh giá lại theo quy tắc mức độ của brief, với số đo mới (Q6, Q7, Q8, Q9).
4. Các kiểm tra bắt buộc, tự chạy trong scratch clone với Node v24.21.0.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B4/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước) | `b7bbcbc0…a873`, 789 file | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone tại edaaa85) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 file, 1820 test pass | `04-npm-test.txt` |
| `npm run test:e2e` (build + toàn bộ Playwright, Edge, hai project) | exit 0; 186 test: 170 pass, 16 skip, 0 fail; desktop 84 pass + 9 skip, mobile 86 pass + 7 skip (mọi skip theo project); 5.8 phút | `05-e2e-full.txt`, `05a-e2e-counts.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build với `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; server đã build có truy vết trên 48134 | exit 0 mỗi lệnh; 0 dòng deprecation; server đã dừng (SIGTERM); console trình duyệt của mọi probe: chỉ 401 trước khi đăng nhập | `07-…` đến `07d-…`, `49m-…`, `49n-…` |
| Hai test e2e mới của B3-01 trên DayEditor của a2ea7a4 (clone-old), desktop, không retry | 2 fail: ở 1024px hộp review `modal: true` nhưng `focus: false`, `onTop: false` | `30a-…`, `31-…` |
| Test ô ngày với soft assertion trên quy tắc open-day của 589bcff (clone-o5), mobile, không retry | 390 và 375 pass; 360 và 320 fail, mỗi chỗ với "the date value is not clipped (its measured need)" (116.23 và 76.23 < 117.89), "the empty field shows mm/dd/yyyy whole" và "at least a full date wide" | `30b-…`, `32-…` |
| Q1 S1-S6: hộp review nhãn, hộp review nhiều ngày và Clock out trên trình sửa; 1280→1024, 1280→1024→1280, 1280→1024→768→1280→1024, bấm Cancel, 1199↔1200, hộp nhiều ngày, hộp Clock out | ở mọi bước hộp kia là modal, giữ tiêu điểm và nằm trên cùng (hit test của Cancel rơi vào nó); Escape đầu (hoặc Cancel) chỉ đóng hộp đó; dưới 1200px trình sửa khi đó thành modal với tiêu điểm ở tiêu đề, ở 1280 tiêu điểm về lại bộ chọn nhãn; Escape thứ hai đóng trình sửa và tiêu điểm ở "Edit {date}"; chỉ có POST preview, ngày vẫn là Worked, ca đang chạy vẫn chạy; tiêu điểm không bao giờ ở BODY | `45-…`, `46a-…` đến `46g-…`, ảnh `q1-…` |
| Cùng probe Q1/Q2 trên DayEditor của a2ea7a4 (đối chứng) | Q1 fail 7 trên 7 (Escape đầu để hộp review còn mở; cú bấm Cancel bị trình sửa chặn); Q2 pass 3 trên 3 | `40c-…`, `45b-…` |
| Q2 trình sửa đứng một mình 1280→1024→768→1280→1200→1199→1280; cảnh báo nghỉ ("2-" giờ, 30 phút) từ 1280 và từ 1024 | modal ở 1024/768/1199, không modal ở 1280/1200; đi Tab 40 lần dưới 1200px: 0 điểm dừng ngoài trình sửa (điểm dừng BODY chỉ khi tài liệu mất tiêu điểm, tức vòng qua giao diện trình duyệt); cảnh báo và `aria-invalid` giữ qua mọi lần chuyển; tiêu điểm chuyển từ ô sang tiêu đề khi chuyển (có từ trước); Escape đóng, tiêu điểm ở "Edit {date}", 0 lần ghi, nghỉ 0 | `45-…`, `47a-…` đến `47c-…` |
| Q3/Q3b điện thoại 390/375/360/320, múi trùng và có ghi chú múi giờ, "Open a day" rỗng và có giá trị; ô bị ép 115-128px | ô 146.23 / 131.23 / 219.95 / 179.95px, token 127.5px, nút bên cạnh ở 390/375 và bên dưới ở 360/320, không cuộn ngang; đáy hàng đầu so với đỉnh thanh tab 788: múi trùng 659.02 / 676.41 / 728.41 / 791.19, có ghi chú 757.97 / 775.36 / 827.36 / 924.92; ép độ rộng: chữ số cuối bị cắt ở 115.0px, trọn ở 115.97px (nhu cầu của test 117.89, thận trọng); chữ gợi ý trọn ở 125.48px (nhu cầu 125.73) | `41-…`, `48a-…` đến `48c-…`, ảnh `q3-…`, `q3b-…` |
| Q4 điện thoại 390/375/360/320: mặc định, ô có giá trị, nhiều ngày, trình sửa, Review; bottom sheet | 0 cuộn ngang, 0 phần tử tràn, 0 điều khiển hiển thị dưới 44x44 trong 20 trạng thái (41 / 41 / 46 / 9 / 8 điều khiển); bottom sheet `:modal`, cao 86%, đi 100 phím 0 điểm dừng ngoài, Escape trả tiêu điểm về ngày | `49-…` |
| Q5 thứ tự Tab | desktop 43 điểm dừng: thanh trên, kỳ (Previous, Next, Review), Clock in, công cụ, rồi Edit/Label mỗi ngày Mon..Sun tuần 1 rồi tuần 2, 14 ngày theo thứ tự ngày; điện thoại 41 điểm dừng ở 390 và 320, cùng thứ tự ngày | `44-…`, `49a-…`, `49b-…` |
| Q6 tương phản khi render | chữ: 128 / 123 nút, nhỏ nhất 5.00 sáng, 5.74 tối, 0 dưới 4.5; vòng focus so với nền kề bên: 1.72 sáng, 2.46 tối trên liên kết thanh trên, nút kỳ, liên kết Review, Clock in, "Edit {date}" của bảng, tab điện thoại; bộ chọn nhãn 6.09 / 6.79 | `44-…`, `49c-…`, `49d-…`, ảnh `q6-…` (WP5-UX-B4-01) |
| Q7 các mục mang theo | 10 ngày có trạng thái Check, mỗi ngày có chữ và hình; chú giải luôn có "Today"; dòng đầu Review dùng ngày ISO; trình sửa chỉ đọc in "none"; người được chia sẻ ở 390x844, hàng đầu: xem 750.73 (vừa), sửa 802.73, có ghi chú 849.69 / 901.69 | `44-…`, `49e-…` đến `49h-…` |
| Q8 / Q9 màn hình đầu ở 390x844 | người mới (tên 26 ký tự): múi trùng lúc tải 676.41, đang vào ca 676.41, sau Clock out 706.16, nhiều ngày 949.66; có ghi chú 775.36 / 775.36 / 805.11 / 1048.61; tên 16 đến 42 ký tự: lúc tải vừa ở cả hai trường hợp múi (phần đầu cao thêm một dòng từ 23 ký tự, lớn nhất 775.36) | `49i-…` đến `49l-…`, ảnh `q9-…` |
| Quét token CSS của `styles.css` (cả vòng và FIX5) | 0 giá trị cứng màu, bo góc, bóng, thời lượng, animation, font hay url ngoài khối token; `--radius: 4px`; 7 trên 7 transition là `var(--transition)` = `all 300ms ease-out`; có khối reduced-motion; 0 `var()` chưa định nghĩa; FIX5 chỉ đổi `--date-field-min` (8.5rem) và `--open-day-label-min` (14.25rem); font hệ thống, CSP `default-src 'self'`, không có style inline | `20-…`, `21-…`, `22-…` |
| Tương đương EN/VI và các dòng tài liệu | docs/04: chỉ khác tên mục đã dịch và dòng ghi chú dịch của bản VI (như ở a2ea7a4); các mục của vòng trong docs/10 và docs/12: 0 khác biệt; docs/04 dòng 55 EN và VI đúng yêu cầu; docs/12 không thêm định danh bản phát hành | `60-…`, `61-…`, `62-…` |
| digest, ba dạng (sau) | `b7bbcbc0…a873`, 789 file, đều bằng nhau | `90-digest-after.txt` |

## WP5-UX-B3-01, B3-02, O-5 và R-7

| Mục | Xử lý | Quan sát |
|---|---|---|
| WP5-UX-B3-01 | **Đã đóng** | `DayEditor.tsx:18-21, 93-116`: khi một hộp thoại modal khác đang mở, việc chuyển chế độ được hoãn bằng một `MutationObserver` và áp dụng khi không còn hộp nào; phần dọn dẹp ngắt nó. Ở cả bảy đường Q1, hộp đang mở (review nhãn, review nhiều ngày, Clock out) giữ lớp trên cùng, tiêu điểm và Escape ở 1024, 768, 1199, 1200 và khi về 1280; Escape đầu hoặc Cancel chỉ đóng hộp đó; dưới 1200px trình sửa khi đó thành modal với tiêu điểm ở tiêu đề (bộ chọn nhãn phía sau bị vô hiệu), từ 1200px tiêu điểm về bộ chọn nhãn; Escape thứ hai đóng trình sửa và tiêu điểm về "Edit {date}". Chỉ có request preview, ngày vẫn là Worked, ca đang chạy vẫn chạy, và tiêu điểm không bao giờ ở BODY. Trình sửa đứng một mình giữ các chế độ (modal dưới 1200px với 0 điểm dừng Tab bên ngoài, bảng bên từ 1200px), và cảnh báo nghỉ còn qua mọi lần chuyển mà không lưu gì. Hai test e2e mới fail trên DayEditor của a2ea7a4 (2 trên 2), và probe của tôi fail ở đó 7 trên 7 đường. |
| WP5-UX-B3-02 | **Đã đóng** | docs/04 dòng 55: EN "(any date, also outside the displayed period)", VI "(mọi ngày, kể cả ngoài kỳ đang hiển thị)"; điều khiển không có `min`/`max` (`OpenDay.tsx:16`). |
| O-5 | **Đã làm** | `timesheet.spec.ts:141-179`: phép kiểm vô nghĩa `scrollWidth <= clientWidth` được thay bằng `box.width >= valueNeed` (độ rộng chữ theo font của ô + padding + viền + 23.5px phần khung ngày). Nó fail trên quy tắc của 589bcff ở 360 và 320px (116.23 và 76.23 < 117.89) và pass ở edaaa85. Kiểm khi render: chữ số cuối bị cắt ở 115.0px và trọn ở 115.97px, nên nhu cầu cho giá trị thận trọng khoảng 2px; nhu cầu cho chữ gợi ý (125.73) khớp ngưỡng quan sát (trọn ở 125.48px). |
| R-7 | **Đã làm** | `--date-field-min` 9.5rem → 8.5rem (127.5px) và `--open-day-label-min` 15.25rem → 14.25rem. Đủ ngày ở 390, 375, 360 và 320px (ảnh chụp); 390x844 không đổi (659.02 / 757.97); 375 nay vừa khi có ghi chú múi giờ (775.36); 360 có ghi chú và 320 vẫn dưới thanh tab, ngoài quy tắc 390x844. |

## Yêu cầu của chủ, E-1..E-7 và điều hướng (phạm vi 1)

- **Bảng desktop (E-1, E-2, E-4, E-6):** phần đầu biểu mẫu (công ty, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES", Employee,
  Payroll Date, Period), "WEEK 1" và "WEEK 2" từ thứ Hai đến Chủ nhật với Day, Date, Label, Time, OT (h:mm), Check và các
  dòng chi tiết, chú giải, "Overtime Total :" dạng h:mm, các dòng chữ ký với "Not used yet" cho quản lý, ngày nghỉ được tô
  và gạch chéo, ngày kiểu Mỹ, h:mm, giờ 24 tiếng (ảnh e2e của lần chạy của tôi, `timesheet.spec.ts`). **Đạt.**
- **E-3 (a):** bảng bên cạnh bảng timesheet từ 1200px, bảng bên dạng modal ở 768-1199px, bottom sheet trên điện thoại, chọn
  nhãn trong ô; hộp thoại lồng nay giữ Escape và tiêu điểm khi qua mốc 1200px (Q1, Q2, Q4). **Đạt.**
- **E-5 (a), E-7 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); điện thoại ba tab và More (spec shell,
  admin, import pass); Overtime, History và Settings chưa được tạo kiểu lại. **Đạt.**
- **Bố cục điện thoại:** thẻ kỳ, thẻ đồng hồ, công cụ gọn, rồi bảng; hàng ngày đầu nằm trên thanh tab ở 390x844 trong cả hai
  trường hợp múi giờ và với tên từ 16 đến 42 ký tự (Q3, Q9). **Đạt.**
- **docs/04 dòng 16 (múi giờ đang xem):** thanh luôn hiện "Times in {zone}"; mỗi ngày giữ ngày ghi sổ. **Đạt.**

## Độ mạnh test (phạm vi 2)

Cả 20 file test đổi từ 014bd47 (`11-…`) được đọc lại; mọi dòng bị bỏ (`12-…`) được so với phần thay thế trong các diff có
ngữ cảnh (`13a-…` đến `13d-…`):

| # | File | Thay đổi | Đánh giá |
|---|---|---|---|
| 1 | dayModel.test | các ca `weekGroups` bỏ cùng hàm | tương đương: `sheetModel.test.ts` (mới) phủ băng thứ Hai-Chủ nhật, kỳ bắt đầu giữa tuần, đầu vào rỗng và độ ổn định khi đổi múi giờ thiết bị |
| 2 | sessionModel.test | nghỉ dạng giờ + phút; danh sách đầu vào sai | mạnh hơn: 7 cặp sai thay vì 4, một ca 90 phút, các ca gợi ý |
| 3 | engine.test | chỉ import | thêm các ca h:mm |
| 4 | spec admin, import, isolation, setup, shell, sharing, ot-leave | danh sách điều hướng chính xác theo bố cục, Sign out trong More, Import từ Settings, `complete` → `Complete` kèm `[data-check]`, "OT" → "Overtime" | tương đương hoặc mạnh hơn; phép kiểm vắng mặt của B-03 nay chạy trên màn Admin ở cả hai project |
| 5 | history-settings | trạng thái chuyển lên thanh kỳ | mạnh hơn (trên thanh, không trong bảng, bố cục, dòng chữ ký) |
| 6 | review.spec | Regular/Off-calendar/Credit từng ngày → các dòng chi tiết cùng ô OT theo quy tắc PDF | tương đương (mọi ngày vẫn được so với payload của server) |
| 7 | spec review, shell, timesheet | vòng lặp 44px thêm `.filter({ visible: true })` | tương đương: giữ chặn số lượng; Q4 thấy 0 điều khiển hiển thị dưới 44px |
| 8 | day-editor.spec | đổi tên tiêu đề; nghỉ dạng giờ + phút có từ chối; "missing record" → "No times" + `[data-check]`; một lần chờ trước mỗi bước kỳ | tương đương hoặc mạnh hơn |
| 9 | timesheet.spec (cả vòng) | hook grid/list → `[data-sheet]`; hạn ngày kiểu Mỹ + múi; ngày đặt tên theo ngày ISO; Complete với OT của server | mạnh hơn |
| 10 | timesheet.spec (FIX5) | thêm độ rộng 375; `>= 135` → `>= max(placeholderNeed, valueNeed)`; phép kiểm cắt vô nghĩa → `box.width >= valueNeed`; thêm `valueNeed > 100` và kiểm ô rỗng | không yếu hơn: con số cố định 135 được thay bằng nhu cầu đo được, fail mỗi khi token hoặc ô dưới ngưỡng cắt quan sát (`32-…`, Q3b); phép kiểm độ rộng còn lại giữ nguyên |
| 11 | day-editor.spec (FIX5) | thêm 2 test, bỏ 0 dòng | thêm; fail trên hành vi của a2ea7a4 (`31-…`) |

Kết quả: **không assertion nào bị bỏ hay làm yếu từ 014bd47, kể cả FIX5.** Không có `only` hay `fixme`; mọi `test.skip`
theo project (`14-…`); `playwright.config.ts`, `tests/e2e/fixtures.ts` và `vitest.config.ts` không đổi từ 014bd47.

## Trợ năng (phạm vi 3)

- Thứ tự bàn phím bằng thứ tự đọc ở cả hai bố cục, Mon..Sun tuần 1 rồi tuần 2 (Q5). **Đạt.**
- Tên: "Edit {date}", "Label for {date}: {label}", hộp thoại đặt tên theo tiêu đề, hàng điện thoại theo thứ và ngày. **Đạt.**
- Modal và tiêu điểm: các chế độ trình sửa, bẫy tiêu điểm dưới 1200px, Escape, Close và trả tiêu điểm ở mọi độ rộng; hộp
  thoại lồng khi qua mốc 1200px (Q1, Q2, Q4). **Đạt.**
- Trạng thái không bao giờ chỉ bằng màu: chữ và hình trên mọi Check (Q7). **Đạt.**
- 44px và reflow ở 320px: 0 điều khiển nhỏ, 0 cuộn ngang, 0 phần tử tràn trong 20 trạng thái (Q4). **Đạt.**
- Tương phản: chữ nhỏ nhất 5.00 / 5.74 (Q6). Đánh giá về `--sheet-rule-strong` của các review trước vẫn giữ (đường kẻ cấu
  trúc, không cần để hiểu bảng). **Chỉ báo focus: không đạt (WP5-UX-B4-01).**

## Chuẩn UI và API deprecated (phạm vi 4)

Chỉ dùng token ngoài khối token, `--radius: 4px`, một `--transition` dùng chung (`all 300ms ease-out`) trên cả 7 transition,
bóng nhiều lớp, reduced motion, chỉ font hệ thống (CSP `default-src 'self'`, không nguồn font), không có style inline; hai giá
trị của FIX5 là token. Lint `no-deprecated` exit 0; 0 dòng deprecation của Node trong lint, test, build và server đang chạy;
0 thông báo deprecation của trình duyệt. **Đạt.** (Giá trị của token vòng focus là WP5-UX-B4-01.)

## Tài liệu (phạm vi 5)

docs/04 các dòng 9, 41, 48, 55 và 59 mô tả đúng UI đã giao (Q1-Q9); docs/10 ghi E-1..E-7 và các công thức không tái tạo;
docs/12 tóm tắt vòng này và không thêm định danh bản phát hành. Tương đương EN/VI giữ (`60-…`). **Một chỗ không chính xác:**
ghi chú múi giờ của thanh kỳ in hạn theo múi giờ hiển thị ở dạng ISO trong khi docs/04 dòng 45 hứa MM/DD/YYYY trên thanh kỳ
(WP5-UX-B4-02).

## Phát hiện

| ID | Mức độ | File / hàm | Tái hiện | Mong đợi / thực tế | Quy tắc / AC | Sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP5-UX-B4-01 | Medium | `src/client/styles.css:37` (`--focus-ring: 0 0 0 3px rgb(31 95 191 / 0.35)`) và `:178` (tối `rgb(110 168 255 / 0.45)`), dùng ở `:215-219` (`:focus-visible`, outline trong suốt), `:328-330` (tab điện thoại, inset), `:501-503` (nút), `:1331-1333` ("Edit {date}" của bảng) | Desktop và điện thoại, sáng và tối: nhấn Tab một lần rồi focus từng loại điều khiển (Q6, `44-…`, `49c-…`, `49d-…`; ảnh `q6-focus-ring-clock-light`, `q6-focus-ring-sheet-date-light`). Đánh giá lại R-1 của các review B, B2 và B3 | Mong đợi: chỉ báo focus do tác giả tạo kiểu đạt ít nhất 3:1 so với các màu kề bên. Thực tế: vòng focus, trộn trên nền kề bên, đo 1.72:1 (sáng) và 2.46:1 (tối) trên liên kết thanh trên, nút kỳ, liên kết Review, Clock in, các nút "Edit {date}" của bảng và tab điện thoại; outline trong suốt nên vòng là dấu hiệu focus duy nhất. Bộ chọn nhãn (inset 2px màu nhấn, 6.09 / 6.79) đạt; ô nhập chữ có con trỏ | WCAG 2.2 SC 1.4.11 Non-text Contrast cùng 2.4.7 Focus Visible: W3C Understanding 1.4.11, "the visual focus indicator for a component must have sufficient contrast against the adjacent background" và Figure 43 (một viền focus 2.3:1 do tác giả đặt là fail) (`50-…`); quy tắc mức độ của brief (WCAG 2.2 AA) | Chỉ đổi token: cho `--focus-ring` (sáng và tối) một màu đạt ít nhất 3:1 so với mọi bề mặt nó nằm trên (thẻ, trang, đầu bảng, nền ngày nghỉ, thanh tab), ví dụ vòng màu nhấn đặc hoặc vòng hai màu (kỹ thuật WCAG C40: một khe màu thẻ bên trong vòng màu nhấn); giữ transition dùng chung. Thêm một kiểm tra tự động (e2e hoặc probe tương phản) rằng màu vòng sau khi trộn đạt 3:1 so với nền kề bên cho một nút, một liên kết, một tab và một ngày của bảng ở cả hai theme |
| WP5-UX-B4-02 | Low | `src/client/components/PeriodBar.tsx:71-74` (`instantText(period.due_at_utc, zone)`, `format.ts:38-40`); docs/04 dòng 45 EN và VI | Múi giờ xem bất kỳ khác múi giờ báo cáo, ví dụ Asia/Ho_Chi_Minh, 390x844 hoặc desktop: ghi chú múi giờ hiện "Due, your time (Asia/Saigon) 2026-10-14 07:00" dưới "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)" (ảnh e2e `period-mobile-zone-note`, ảnh Q9) | Mong đợi (docs/04 dòng 45, cùng dòng 53 đặt ghi chú trong thanh kỳ): ngày kiểu Mỹ, MM/DD/YYYY ở phần đầu và thanh kỳ. Thực tế: ngày ISO trong ghi chú | docs/04 như đã giao (dòng 45 và 53, EN và VI); quy tắc 1 của AGENTS.md | Định dạng hạn theo múi giờ hiển thị giống thanh ("Wed 10/14/2026, 07:00") và kiểm nó trong `timesheet.spec.ts` (test ghi chú múi giờ); hoặc, nếu muốn giữ ISO ở đó, thu hẹp docs/04 dòng 45 ở EN và VI. Có thể dùng cùng hàm định dạng cho dòng đầu của Review (R-2) |

## Rủi ro và cải tiến tùy chọn (không phải lỗi)

- **R-2 Ngày ISO ở dòng đầu Review (không đổi):** `ReviewScreen.tsx:170`; phần đầu biểu mẫu của Review dùng ngày kiểu Mỹ.
  Không phải phần đầu bảng của docs/04 dòng 41; tùy chọn, nên sửa cùng WP5-UX-B4-02.
- **R-3 Không có nút tài khoản trên điện thoại (không đổi):** tên và Sign out nằm trong More (docs/04 dòng 7); phần đầu biểu
  mẫu nêu tên nhân viên. Không phải lỗi.
- **R-4 Chú giải luôn có "Today" (không đổi):** `TimesheetSheet.tsx:152`. Tùy chọn.
- **R-5 Trình sửa chỉ đọc in "none" (không đổi):** `DayEditor.tsx:428, 434, 444`; docs/04 dòng 43 nói về ô của bảng, nơi không
  có "none" (e2e). Tùy chọn.
- **R-6 Cổng (không đổi):** fixture e2e chọn cổng loopback trống của hệ điều hành; server riêng của tôi dùng 48130-48134.
  Không phải lỗi.
- **O-4 Ngân sách màn hình đầu sát:** trạng thái lúc tải mà docs/04 dòng 48 nêu đạt ở cả hai trường hợp múi giờ (659.02 /
  757.97 với tên mẫu; 676.41 / 775.36 với tên từ 23 đến 42 ký tự). Sau Clock out, có ghi chú múi giờ và tên từ 23 ký tự trở
  lên, hàng đầu kết thúc ở 805.11 (dưới 788); chế độ nhiều ngày luôn đẩy nó xuống. Ngoài quy tắc; tùy chọn.
- **A2 R5 Người được chia sẻ trên điện thoại (không phải lỗi):** chỉ xem 750.73 (vừa), sửa 802.73, có ghi chú 849.69 /
  901.69. docs/04 dòng 48 mô tả trang của chủ có thẻ đồng hồ; chủ có thể mở rộng lời hứa cho chế độ chia sẻ.
- **R-8 (mới) Tiêu điểm khi chuyển chế độ:** qua mốc 1200px làm tiêu điểm chuyển tới tiêu đề trình sửa kể cả từ một ô bên
  trong trình sửa (ô nghỉ trong Q2); có từ T04 và khớp "focus moves to the panel heading on open". Tùy chọn: giữ phần tử
  đang có tiêu điểm khi nó nằm trong trình sửa.
- **R-9 (mới) Đường viền ô nhập:** ô nhập dùng viền `--line` (khoảng 1.35:1 trên thẻ). Mỗi ô đều có nhãn hiển thị nên sự hiện
  diện của nó được nhận ra mà không cần viền (W3C Understanding 1.4.11, "Boundaries"); tùy chọn tăng cùng lúc sửa vòng focus.
- **Thông tin ngoài vùng B:** `npm audit` báo 1 cảnh báo mức high ở một phụ thuộc phát triển (source-map-js);
  `npm audit --omit=dev` báo 0 (`08a-…`, `08b-…`).

## Cổng bắt buộc chưa chạy hoặc bị chặn, và lý do

Không có trong vùng B. Typecheck, lint, `npm test` và toàn bộ e2e trên cả hai project đã chạy ở đây và pass. Các mục vùng A
nằm ngoài review này.

## Xử lý các phát hiện trước

WP5-UX-B3-01: **đã đóng**. WP5-UX-B3-02: **đã đóng**. O-5 và R-7: **đã làm**. R-1: **đánh giá lại là lỗi** theo quy tắc mức
độ của brief (WCAG 2.2 AA), ghi thành WP5-UX-B4-01 (Medium). R-2..R-6, O-4 và A2 R5: đã đánh giá lại, không mục nào là lỗi
theo quy tắc đó. Mới: WP5-UX-B4-01 (Medium) và WP5-UX-B4-02 (Low), còn mở; R-8 và R-9 tùy chọn.

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, vùng B:** chưa; WP5-UX-B4-01 cần đổi token kèm một kiểm tra tương phản tự động và WP5-UX-B4-02 một
  thay đổi định dạng một dòng (hoặc đổi câu chữ docs/04 ở EN và VI), sau đó freeze, cổng kiểm và kiểm lại vùng B.
- **Phép của chủ:** không yêu cầu và không được cho; không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một việc tiếp theo

Coordinator: mở một task sửa có giới hạn cho WP5-UX-B4-01 (`--focus-ring` sáng và tối đạt ít nhất 3:1 so với các bề mặt kề
bên, kèm một kiểm tra tương phản tự động) và WP5-UX-B4-02 (hạn trong ghi chú múi giờ ở dạng ngày kiểu Mỹ, kèm một assertion);
sau đó freeze, cổng kiểm và một lần kiểm lại vùng B mới trên digest mới.

## Nguồn gốc subagent độc lập

- **Task/lần review, ID người review và ID tác giả được review:** WP5-UX-AUDIT-B4, lần 1; người review tự báo
  `claude-opus-5-5` (subagent mới; ID agent không thấy được từ bên trong). Tác giả được review: WP5-UX-PLAN,
  WP5-UX-T01..T06, WP5-UX-FIX1..FIX5 và các bản freeze, cùng các verifier của cổng kiểm (theo ghi chép trong task; model tác
  giả mạnh nhất được ghi là opus, FIX5 `claude-opus-5-5`, giống của tôi).
- **Ngữ cảnh mới; người review không tác giả thay đổi:** xác nhận. Tôi không tác giả thay đổi nào được review và không chạy
  cổng kiểm hay audit nào trước đó của vòng này. Tôi không sửa file nguồn, test, tài liệu, board hay STATE. Probe chạy trong
  scratch clone trong thư mục task, được giữ ngoài git bằng `.git/info/exclude`; hai đột biến chỉ làm trong scratch clone
  riêng của chúng. Sơ suất quy trình, không cái nào ghi ra ngoài thư mục task và bằng chứng hay đổi kết quả: hai lệnh chỉ đọc
  được nối ống vào `head`/`tail` (`grep … | head -n 20` trên ClockOutDialog.tsx và `grep -n "^## " … | tail -n 3` trên
  docs/10), trái với quy tắc shell của brief.
- **Digest nguồn trước/sau; bằng chứng cổng kiểm cho snapshot đó:** `b7bbcbc0…a873` trước và sau, ba dạng
  (`00-digest-before.txt`, `90-digest-after.txt`); bằng digest ghi nhận của WP5-UX-REGATE3.
- **Đường dẫn báo cáo mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B4.md` và `.vi.md`, file mới; mọi
  review trước giữ nguyên.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** B3-01 và B3-02 đã đóng, O-5 và R-7 đã làm;
  WP5-UX-B4-01 và WP5-UX-B4-02 còn mở; tiếp theo: một task sửa cho cả hai, freeze, cổng kiểm và kiểm lại vùng B.
