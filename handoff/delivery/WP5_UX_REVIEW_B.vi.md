# Thiết kế lại UI của WP5, review độc lập khu vực B — đúng yêu cầu của chủ, độ mạnh của test, khả năng tiếp cận, chuẩn UI và tài liệu

Bản dịch của [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI của WP5 theo yêu cầu của chủ, task
  WP5-UX-AUDIT-B, attempt 1, 2026-10-08 (America/Los_Angeles; UTC 2026-10-09T06:36Z đến 07:05Z). Reviewer tự báo model
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Khu vực A (tính
  đúng nghiệp vụ, múi giờ, đường sửa, chia sẻ, riêng tư, PDF) được review riêng và không nằm trong review này.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `831f760838950a59f0e5c880f0bbefda15fe0c61` (freeze của WP5-UX-GATE); digest
  `3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9`, 789 file, không tính `handoff/`, giống nhau trước và sau
  review theo ba dạng (dạng `git ls-tree`, `scripts/source-digest.mjs` trong bản clone tạm ở 831f760, và trong repository
  đang làm việc). HEAD = origin/main = `5beae2f668d15fc77a39b91a91e2c8bb6195d65a`; `git diff --name-only 831f760 5beae2f` ngoài
  `handoff/` có 0 đường dẫn. Không có commit chưa push. Source đủ: bản clone tạm sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.** Hai lỗi mức Medium (B-01 trang trên điện thoại không hiện ngày đầu tiên ngay màn hình đầu
  như bản mockup đã được duyệt hứa; B-02 trong khoảng 768 đến 1199px bảng bên cố định che các điều khiển của bảng timesheet
  đang nhận tiêu điểm bàn phím) và hai lỗi mức Low (B-03 một assertion e2e bị làm yếu; B-04 hai dòng không chính xác trong
  docs/04, EN và VI). Mọi phần khác của khu vực B đạt: bố cục Excel trên desktop, E-1..E-7, điều hướng, thứ tự bàn phím và
  tên, tiêu điểm khi mở/Escape/trả về, bẫy tiêu điểm của bottom sheet, trạng thái không bao giờ chỉ bằng màu, điều khiển
  44px, không cuộn ngang, tương phản chữ, token, bo góc, transition, bóng đổ, giảm chuyển động, font hệ thống, không API
  lỗi thời, docs/10 và docs/12, tương đương EN/VI, và mọi kiểm tra bắt buộc.

## Phạm vi thật đã xem và chạy

1. Yêu cầu của chủ và E-1..E-7: `owner_decisions` của board ngày 2026-10-08 (yêu cầu nguyên văn và "OK theo khuyến
   nghị"), docs/10 (EN và VI), WP5-UX-PLAN mục B, C, E, F, G và mockup (chú thích trong `mockup.html` và ảnh A1/A2), so với
   các component đã giao (`TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `sheetModel.ts`, `DayStatus.tsx`, `PeriodBar.tsx`,
   `ClockPanel.tsx`, `AppShell.tsx`, `TimesheetScreen.tsx`, `DayEditor.tsx`, `SettingsScreen.tsx`) và với ảnh tôi tự chụp.
2. Độ mạnh của test: mọi file test đổi từ 014bd47 (20 file, `11-tests-numstat.txt`, diff đầy đủ `12-tests-diff.txt`); mỗi
   assertion bị bỏ, nới hoặc thay được đánh giá trong bảng dưới. Tôi đã probe xem `filter({ visible: true })` mới loại những gì.
3. Khả năng tiếp cận, do tôi tự probe bằng một spec Playwright do auditor viết (`ux.probe.ts.txt`, chạy ngoài git trên
   server đã build của fixture e2e, cả hai project) và một runtime probe tự đóng (`runtime-probe.mjs.txt`, cổng 47930).
4. Chuẩn UI: quét token của `styles.css` ngoài các khối token (`css-scan.mjs.txt`, `css-literals.mjs.txt`), transition, bo
   góc, font và animation khi render, CSP trong `src/server/app.ts`, grep code client mới tìm API DOM hoặc React lỗi thời,
   lint `no-deprecated`, và theo dõi deprecation của Node khi chạy lint, unit test, build và server.
5. Tài liệu: diff của docs/04, docs/10, docs/12 (EN và VI) so với UI đã giao; script kiểm cấu trúc EN/VI; docs/04 dòng 16
   (múi giờ đang xem); mục định danh bản phát hành của docs/12.
6. Kiểm tra bắt buộc, tôi tự chạy trong bản clone sạch với Node v24.21.0: typecheck, lint, `npm test`, và toàn bộ bộ e2e
   trên cả hai project.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git ls-tree -r --format='%(path) %(objectname)' 831f760 \| grep -v '^handoff/' \| LC_ALL=C sort \| sha256sum` (trước) | `3d274c9e…c7ea9`, 789 dòng | `01-digest-before.txt` |
| `node scripts/source-digest.mjs` trong bản clone tạm ở 831f760 (trước) | exit 0, `3d274c9e…c7ea9` (789 file) | `01-digest-before.txt` |
| `npm ci` (clone, Node 24) | exit 0, 161 gói | `07-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 file, 1817 test đạt | `04-npm-test.txt` |
| `npm run test:e2e` (build + toàn bộ Playwright, Edge, cả hai project) | exit 0; 160 test: 155 đạt, 5 bỏ qua, 0 lỗi; desktop 77 đạt + 3 bỏ qua, mobile 78 đạt + 2 bỏ qua; 6,3 phút | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build với `NODE_OPTIONS=--trace-deprecation --pending-deprecation` | lint exit 0 (chạy lại với `--ignore-pattern audit-probe/`; lần đầu chỉ lỗi vì các file probe của chính tôi, `08a`), test exit 0 (1817 đạt), build exit 0; mỗi lần 0 dòng deprecation | `08-deprecation-summary.txt`, `08a`..`08d` |
| runtime probe: server đã build có theo dõi deprecation ở cổng 47930, Edge desktop/1024px/điện thoại qua Timesheet, trình sửa, Overtime, History, Settings, Import, Review | exit 0; 0 dòng deprecation của server, 0 thông báo deprecation của trình duyệt, 0 lỗi trang; server đã dừng (SIGTERM) | `09-runtime-probe.txt` |
| `git diff --stat 014bd47 831f760` ngoài handoff/ | 67 đường dẫn | `10-diffstat-014bd47-831f760.txt` |
| quét token CSS ngoài các khối `:root`, tối và giảm chuyển động | 0 giá trị cứng về màu, bo góc, bóng, thời lượng, animation, font hay `@font-face`; chỉ có từ khóa `transparent`/`currentColor`; 7/7 transition là `var(--transition)`; 0 `var()` chưa định nghĩa; 3 khai báo literal mới, đều là `100vw`/`100dvh` trong `calc()` | `20-css-scan.txt`, `21-css-literals.txt` |
| probe P1 thứ tự bàn phím và tên (cả hai project) | thứ tự Tab: điều hướng, thanh kỳ, đồng hồ, công cụ, rồi `Edit {date}` và `Label for {date}` từ 09/28 đến 10/11 theo ngày (tuần 1 Thứ Hai..Chủ nhật, rồi tuần 2), rồi liên kết review; 14 phần tử ngày có tên (`group "Mon 2026-09-28"` trên desktop, `row` trên điện thoại); cột nhãn dòng có `aria-hidden`; tên dòng ẩn `Time:`, `OT:`, `Check:` | `31-P1-*.txt` |
| probe P2 tiêu điểm của trình sửa | desktop: tiêu điểm vào tiêu đề khi mở, không modal; Escape từ bên trong đóng và tiêu điểm về `Edit {date}`; điện thoại: `:modal`, 60 lần Tab + 40 lần Shift+Tab không bao giờ đặt tiêu điểm vào phần tử ngoài sheet (chỉ có bước của trình duyệt, BODY); Escape và Close trả tiêu điểm | `32-P2-*.txt` |
| probe P3 điện thoại 390x844, 8 trạng thái (mặc định, chi tiết, chế độ nhiều ngày, bộ chọn mở, More, trình sửa, trình sửa có Add session, Review) | 0 điều khiển dưới 44x44; scrollWidth 390 = clientWidth ở mọi trạng thái; tràn của trình sửa 0; hàng ngày đầu tiên bắt đầu ở 836,6px, thanh tab bắt đầu ở 788px | `33-P3-*.txt` |
| probe P4 tương phản khi render, sáng và tối | 151/171 nút chữ, thấp nhất 5,00 (sáng) và 5,74 (tối), 0 dưới 4,5; phi văn bản `--sheet-rule-strong` 2,86/2,97, `--sheet-rule` 1,48/1,56; 0 phần tử có animation; transition 0.3s ease-out (1e-05s khi giảm chuyển động); font: chỉ bộ hệ thống và mono; bo góc 4px (0 ở các mục thanh tab) | `34-P4-*.txt` |
| probe P5 chỉ bằng màu | mọi ô màu hổ phách có chữ và hình trong Check; mọi ngày không làm việc có sọc và nhãn; hôm nay có nhãn "Today" | `35-P5-*.txt` |
| probe P6 desktop 768 và 1024px khi mở bảng bên | không cuộn ngang; 12 điều khiển của bảng timesheet nằm hoàn toàn dưới bảng bên cố định khi nhận tiêu điểm, ở cả hai độ rộng | `36-P6-panel-768-1199.txt`, `editor-w1024-synthetic.png` |
| probe P7 `filter({ visible: true })` loại gì trên điện thoại | chỉ 5 điều khiển của thanh desktop (4 liên kết điều hướng và Sign out, phần tử cha `display: none`) trên trang timesheet, shell và review | `37-P7-visible-filter-exclusions.txt` |
| probe P8 hàng trên điện thoại và 360px | mọi hàng ngày cao ít nhất 54px; không cuộn ngang ở 360px | `38-P8-phone-rows-360.txt` |
| cấu trúc EN/VI của docs 04, 08, 10, 12 | cùng mục, gạch đầu dòng và code span; khác số chỉ ở cách viết thập phân (8.5 / 8,5) và ở các mục vòng này không đổi | `40-docs-parity.txt` |
| digest sau (ba dạng) | `3d274c9e…c7ea9`, 789 file, đều bằng nhau | `90-digest-after.txt` |

## Yêu cầu của chủ, E-1..E-7 và điều hướng (phạm vi 1)

- **Bảng timesheet trên desktop: đạt.** Khối đầu biểu mẫu (công ty, tiêu đề, "Employee:", "Payroll Date:", "Period:"), hai
  dải "WEEK n" từ Thứ Hai đến Chủ nhật với các dòng Day, Date, Label, Time, OT (h:mm), Check, các dòng "Show details", chú
  giải, "Overtime Total :" ở góc phải dưới với `provisional_credited_minutes` của server dạng h:mm, và các dòng chữ ký
  (Employee Signature, Date, Manager Signature "Not used yet", Date), khớp mockup A1 (`TimesheetSheet.tsx:219-297`,
  `timesheet-desktop-first-screen-synthetic.png`).
- **E-1 (a)** đạt: dòng Check; chi tiết sau "Show details" trên Timesheet (`aria-pressed`), luôn bật trong Review
  (`ReviewSheet` truyền `details`). **E-2 (a)** đạt: nền nhạt cộng sọc từ `classification.day_class === 'nonworking'`, tên ngày
  lễ trong ô nhãn, chỉ dùng loại của app. **E-3 (a)** đạt trên desktop từ 1200px và trên điện thoại (bottom sheet; bộ chọn
  ngay trong ô qua preview batch một mục); khoảng 768 đến 1199px xem B-02. **E-4** đạt: MM/DD trong ô, MM/DD/YYYY ở phần
  đầu và thanh kỳ, h:mm, khoảng giờ 24 giờ theo múi giờ hiển thị. **E-5 (a)** đạt: desktop Timesheet, Overtime, History,
  Settings (+ Admin); tab điện thoại Timesheet, Overtime, History, More (Settings, Import, Admin, Sign out); Import từ một
  liên kết trong Settings; "OT" đã đổi tên. **E-6 (a)** đạt. **E-7 (a)** đạt: Overtime, History, Settings giữ bố cục.
- **Bố cục điện thoại: lệch hướng (B-01).** Các dòng đúng (Day | Label | Time | OT, Check gộp vào ô Day, hàng ít nhất 54px,
  không cuộn ngang), nhưng hướng đã duyệt đặt ngày đầu tiên ngay màn hình đầu và trang hiện không làm vậy.
- **docs/04 dòng 16 (múi giờ đang xem):** đạt; thanh kỳ luôn hiện "Times in {zone}" (e2e `timesheet.spec.ts:40-58`) và
  mỗi ngày giữ ngày ghi sổ làm tên tiếp cận.

## Độ mạnh của test (phạm vi 2): mọi assertion bị bỏ, nới hoặc thay kể từ 014bd47

| # | File | Assertion cũ | Assertion mới | Đánh giá |
|---|---|---|---|---|
| 1 | timesheet.spec | đếm `table.grid` / `.day-list` | đếm `[data-sheet="desktop"\|"phone"]` | tương đương (đổi tên bố cục) |
| 2 | timesheet.spec | `.facts` chứa `due_local_date` dạng ISO | `[data-period-due]` chứa ngày kiểu Mỹ và múi giờ báo cáo | tương đương (E-4), thêm múi giờ |
| 3 | timesheet.spec | hàng đầu chứa ngày bắt đầu ISO | tên tiếp cận kết thúc bằng ngày đó, ô hiện MM/DD, có nút `Edit {date}` | mạnh hơn |
| 4 | timesheet.spec | ngày đầy đủ chứa `complete` và `8h 00m` | `Complete`; `[data-ot]` bằng h:mm của số ghi của server; dòng chi tiết `regular` đúng `8:00`, 14 ô chi tiết | mạnh hơn |
| 5 | timesheet.spec | ngày đầy đủ không có `pending OT`; ngày chờ có `confirm breaks`, `pending OT` | ô OT không có `pending`; `Confirm breaks`; `[data-ot="pending"]` có chữ `pending` | tương đương (ô OT là nơi in pending) |
| 6 | timesheet, shell, review spec | vòng 44px trên mọi phần tử khớp | cùng vòng với `.filter({ visible: true })` | tương đương: trên điện thoại bộ lọc chỉ bỏ 5 điều khiển ẩn của thanh desktop (P7); các chặn số lượng vẫn giữ; P3 của tôi thấy 0 điều khiển nhỏ trong 8 trạng thái |
| 7 | review.spec | mỗi ngày `td[data-label]` Regular, Off-calendar, Credit = `formatDuration` hoặc `none` | ô chi tiết `regular`, `off-calendar` = h:mm hoặc rỗng; ô OT theo quy tắc PDF (số ghi của ngày đầy đủ, `pending` cho ngày chưa đủ, không có trong trường hợp khác) cho cả 14 ngày | tương đương: giá trị hiển thị của mọi ngày vẫn được kiểm chính xác; số ghi của ngày chưa đủ không còn được hiển thị theo thiết kế (docs/04, `otCellText` của PDF) |
| 8 | review.spec | `complete`, `breaks unconfirmed` | `Complete`, `breaks not confirmed` | chỉ đổi chữ |
| 9 | day-editor.spec | tiêu đề `Figures from the server` | `Figures (computed by the server)` | đổi tên |
| 10 | day-editor.spec | nhập `Partial leave minutes` 240 | `Leave hours` 4 + `Leave minutes` 0, vẫn lưu 240, thêm kiểm từ chối giá trị ngoài khoảng và không lưu gì | mạnh hơn |
| 11 | day-editor.spec | ngày đã qua chứa `missing record` | `No times` và đúng một `[data-check="missing"]` | tương đương, thêm khóa trạng thái |
| 12 | day-editor.spec | ngày tương lai `upcoming`, không `missing record`, không `pending OT` | `Upcoming`, `[data-check="upcoming"]`, không `No times`/`Missing record`, không khóa missing, không `[data-ot="pending"]`, không `pending` | mạnh hơn |
| 13 | shell.spec | 5 liên kết điều hướng; Sign out trên banner | danh sách liên kết chính xác theo bố cục, More mở/đóng, Escape trả tiêu điểm, tab 56x44; desktop Sign out trên banner | mạnh hơn |
| 14 | shell.spec | hàng `complete`, `8h 00m` | `Complete`, `[data-check="complete"]`, chi tiết `8:00` | tương đương trở lên |
| 15 | admin.spec | danh sách điều hướng có `OT` và `Import` | danh sách chính xác theo bố cục (E-5) | tương đương |
| 16 | import.spec | liên kết `Import` có `aria-current` ở `#/import` | điện thoại `Import`, desktop `Settings` là mục hiện tại | tương đương (ánh xạ E-5) |
| 17 | import.spec:382-396 | ở `#/admin`: liên kết Import hiện, rồi không có tiêu đề `Import a workbook` và không có `Opening OT balance` trong main | desktop bấm Settings trước, nên cả hai kiểm "không có" chạy trên trang Settings | **bị làm yếu ở project desktop (B-03)**; project điện thoại vẫn kiểm trang Admin |
| 18 | history-settings.spec | dòng trạng thái trong caption của lưới desktop; không có lưới trên điện thoại | một dòng trạng thái trong thanh kỳ, không có trong bảng, đúng bố cục, chữ của dòng chữ ký, không ảnh | tương đương (trạng thái được dời theo thiết kế) |
| 19 | isolation.spec | hàng không có `complete` (x2) | không có `Complete` và `[data-check="complete"]` | mạnh hơn |
| 20 | setup, sharing, isolation, admin spec | Sign out trên banner / liên kết điều hướng trực tiếp | mở More trên điện thoại trước | tương đương |
| 21 | ot-leave.spec | liên kết `OT` | liên kết `Overtime` | đổi tên |
| 22 | dayModel.test | 3 ca `weekGroups` (hàm đã bỏ) | các ca `sheetWeeks`: dải Thứ Hai..Chủ nhật với Mon đầu và Sun cuối, tuần lẻ khi bắt đầu giữa tuần [2,1], rỗng, thêm bất biến theo múi giờ | tương đương trở lên (phép chia [2,1] vẫn chứng minh ranh giới Thứ Hai) |
| 23 | sessionModel.test | trường phút; giá trị sai `1.5`, `-1`, `1441`, `abc`; gợi ý | giờ+phút; giá trị sai `1.5`, `-1`, 24h1m (=1441), 25h, 60m, `abc`, `1e1`; gợi ý có `45m`; ca 90 phút | mạnh hơn |
| 24 | engine.test | không bỏ gì | các ca formatter và kiểm app bằng PDF cho 0..3000 | thêm mới |

Kết quả: một assertion bị làm yếu (#17, B-03); mọi thay đổi khác tương đương hoặc mạnh hơn. Không thêm skip, `only` hay
`fixme`; không đổi cấu hình; `fixtures.ts` không đổi.

## Khả năng tiếp cận (phạm vi 3)

- Thứ tự bàn phím Thứ Hai..Chủ nhật tuần 1 rồi tuần 2: **đạt** trên cả hai project (P1). Tên: `group`/`row` của ngày "Mon
  2026-09-28", `Edit {date}` / `View {date}`, `Label for {date}: {label}`, hộp thoại "Day editor {weekday date}", chữ trạng
  thái: **đạt**. Tên dòng ẩn và cột nhãn dòng `aria-hidden`: **đạt**.
- Tiêu điểm của bảng bên khi mở, Escape, trả tiêu điểm: **đạt** ở 1280px (P2, e2e). Bẫy tiêu điểm của bottom sheet: **đạt**
  (P2: tiêu điểm không bao giờ tới trang phía sau; `:modal`). Escape của bảng More trả tiêu điểm về More (e2e).
- Trạng thái không bao giờ chỉ bằng màu: **đạt** (P5). 44px trên điện thoại và không cuộn ngang ở 390px (và 360px): **đạt**
  (P3, P8). Tương phản chữ: **đạt** (thấp nhất khi render 5,00 sáng, 5,74 tối; các cặp token của gate ít nhất 4,65).
- **Đánh giá WCAG 1.4.11 cho `--sheet-rule-strong` (2,86 sáng / 2,97 tối so với card):** không cần để hiểu bảng timesheet,
  nên không phải lỗi. Token này vẽ đường kẻ dưới khối đầu biểu mẫu, khung ô "Overtime Total :", các dòng chữ ký và viền
  nét đứt của chip giờ nghỉ. Không cái nào xác định một điều khiển hay một trạng thái: mỗi cái có chữ riêng (chữ của khối
  đầu, "Overtime Total :" kèm giá trị trên nền `--sheet-head`, nhãn "Employee Signature" / "Manager Signature" / "Date" với
  trạng thái phía trên đường kẻ, các giờ nghỉ). Đường kẻ ô nhạt hơn `--sheet-rule` (1,48 / 1,56) cũng chỉ là cấu trúc: các
  ngày được xác định bằng tiêu đề thứ và việc thẳng cột trên desktop (cùng tên group), và bằng tiêu đề cột trong bảng
  trên điện thoại. Đường kẻ đậm hơn sẽ là cải thiện thị giác tùy chọn, không phải sửa để tuân thủ.
- **Chưa đạt:** trong khoảng 768 đến 1199px bảng bên cố định che các điều khiển đang nhận tiêu điểm (B-02).

## Chuẩn UI (phạm vi 4)

Chỉ dùng token ngoài các khối token (không giá trị cứng về màu, bo góc, bóng hay thời lượng), `--radius: 4px`, một
`--transition: all 300ms ease-out` dùng chung ở mọi khai báo transition, bóng đổ nhiều lớp có sắc độ (`--shadow-panel` 4
lớp, `--shadow-overlay`), giảm chuyển động (`--duration` 0.01ms, không `animation` hay `@keyframes`, chấm đang chạy là
tĩnh), chỉ bộ font hệ thống và mono (CSP `default-src 'self'`, không `@font-face`, không style inline), lint
`no-deprecated` exit 0, 0 thông báo deprecation của Node và trình duyệt: **đạt**. Chín custom property về bố cục được khai
báo trong các rule (styles.css 1028-1032 và 1324-1327) thay vì khối `:root`; đó là hình học, không phải màu/bo góc/bóng/thời
lượng, nên chấp nhận được.

## Tài liệu (phạm vi 5)

docs/10 và docs/12 (EN và VI) mô tả đúng vòng này; docs/12 không thêm định danh bản phát hành (commit và digest duy nhất
trong đó là nguồn trước khi có ghi chú của WP5, đã có từ trước, và đoạn mới nói định danh sẽ được làm mới sau cổng kiểm và
audit). Tương đương EN/VI giữ ở mọi mục đã đổi. docs/04 đúng, trừ hai dòng trong B-04 và câu về 768-1199px trong B-02.

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-B-01 | Medium | `src/client/TimesheetScreen.tsx:352-391` (khối tiêu đề trang, workbar và card công cụ phía trên bảng); `src/client/components/PeriodBar.tsx:82-94` với `styles.css:979-993` (card kỳ trên điện thoại xuống dòng thành một hàng nút riêng); `src/client/components/TimesheetSheet.tsx:249-270` với `styles.css:1568-1576` (khối đầu biểu mẫu ba dòng trên điện thoại) | Điện thoại 390x844 (project mobile của e2e hoặc `runtime-probe.mjs.txt`): đăng nhập, đo `[data-day]` đầu tiên (`33-P3-phone-targets-overflow-position.txt`; `timesheet-phone-first-screen-synthetic.png`) | Kỳ vọng (hướng đã duyệt): "The first day row appears within the first screen" (WP5-UX-PLAN mục C, hành vi ưu tiên mobile; chú thích cho chủ của mockup A2: "Ngày đầu tiên hiện ngay trong màn hình đầu"), theo thứ tự card kỳ, card đồng hồ, bảng. Thực tế: hàng ngày đầu tiên bắt đầu ở 836,6px, dưới thanh tab (788px) và dưới khung nhìn (844px); trước nó là khối "Timesheet"/tên (dưới thanh 52px), card kỳ (từ 162px, có một hàng `<` / "Review & sign off" / `>` riêng), card đồng hồ (từ 361px), card công cụ ("Open a day", "Show details", "Change several days", từ 499px) và khối đầu biểu mẫu ba dòng (từ 636px). Không ngày nào hiện mà không phải cuộn, như UI cũ (1149px) | Yêu cầu của chủ 2026-10-08 (trang thân thiện hơn, giống Excel, cho việc dùng điện thoại hằng ngày), E-1/E-3 được duyệt cùng mockup A2, kế hoạch mục C | Làm gọn bố cục điện thoại để ít nhất hàng ngày đầu tiên hiện đủ phía trên thanh tab ở 390x844 (ví dụ ẩn khối tiêu đề trang dưới 768px, đưa `<` `>` và các nhãn vào hàng tiêu đề kỳ và liên kết "Review & sign off" vào card chữ ký như A2, gộp công cụ thành một hàng gọn hoặc đặt dưới bảng, khối đầu biểu mẫu một dòng như A2), và thêm một assertion e2e cho mobile rằng đáy `[data-day]` đầu tiên không thấp hơn đỉnh thanh tab |
| WP5-UX-B-02 | Medium | `src/client/styles.css:1768-1774` (`.day-panel-side` cố định ở mép phải dưới 1200px) và `:1776-1794`; `src/client/DayEditor.tsx:79-89` (`show()`, không modal) và `:184-189` (Escape chỉ xử lý bên trong hộp thoại); docs/04 dòng 59 (EN và VI) | Project desktop ở 768x800 và 1024x800: mở một ngày, đặt tiêu điểm vào từng nút ngày và bộ chọn nhãn của bảng (`36-P6-panel-768-1199.txt`; `editor-w1024-synthetic.png`); bấm Escape khi tiêu điểm đang ở bảng (`32-P2-editor-focus-desktop.txt`, `panelOpenAfterEscapeFromSheet: true`) | Kỳ vọng: bảng timesheet vẫn thấy và dùng được cạnh bảng bên (E-3 a, docs/04 "so the sheet stays visible"), và điều khiển đang nhận tiêu điểm không bao giờ bị che hoàn toàn. Thực tế: 12 điều khiển của bảng (cột Thu/Fri..Sun của cả hai tuần) nhận tiêu điểm trong khi bị bảng bên che hoàn toàn ở cả hai độ rộng; phía phải thanh công cụ và card đồng hồ cũng bị che; Escape từ bảng không đóng bảng bên, nên người dùng bàn phím không thể làm lộ điều khiển đang có tiêu điểm mà không dời tiêu điểm | WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum); kế hoạch mục C về tiếp cận; E-3 (a) | Dưới 1200px hoặc cho bảng bên một cột riêng để không đè lên bảng timesheet, hoặc mở nó dạng modal (trang phía sau inert) như sheet trên điện thoại; giữ việc trả tiêu điểm; sửa docs/04 dòng 59 (EN và VI) cho khớp; thêm kiểm e2e ở 1024px rằng không điều khiển nào của bảng đang có tiêu điểm bị bảng bên đang mở che hoàn toàn |
| WP5-UX-B-03 | Low | `tests/e2e/import.spec.ts:382-396` | Đọc test; ở project desktop nhánh `else` bấm Settings (dòng 391) trước các dòng 394-395 | Kỳ vọng: như trước vòng này, việc không có "Import a workbook" và "Opening OT balance" được kiểm trên màn Admin ở cả hai project. Thực tế: ở project desktop cả hai kiểm "không có" chạy trên trang Settings, nên lần chạy desktop không còn kiểm màn Admin (lần chạy điện thoại vẫn kiểm) | Phạm vi 2 của brief (assertion bị làm yếu là một lỗi); ý định AC-01 trong tên test | Kiểm hai điều "không có" trên `#/admin` trước khi nhánh desktop sang Settings (hoặc quay lại Admin), giữ kiểm liên kết "Import from Excel" |
| WP5-UX-B-04 | Low | `docs/04_UX_AND_SETTINGS.md:55` và `.vi.md:55`; `docs/04_UX_AND_SETTINGS.md:41` và `.vi.md:41` | So với `TimesheetScreen.tsx:407-422`, `SheetWeekTable.tsx:50-52`, `BatchBar.tsx:36-45`, `sheetModel.ts:189` | Dòng 55 nói "the label picker" chỉ hiện sau "Change several days"; bộ chọn nhãn trong ô hiện mặc định và vắng trong chế độ nhiều ngày (dòng 63 nói vậy); điều khiển của chế độ nhiều ngày là "Category for selected days". Dòng 41 liệt kê các chữ của Check nhưng thiếu "Missing record" (hiện cho ngày dự kiến có ca nhưng không có phép tính) | Phạm vi 5 của brief (tài liệu mô tả UI đã giao); AGENTS quy tắc 1 (cặp EN/VI) | Thay "the label picker" bằng "the category choice ("Category for selected days")" và thêm "Missing record" vào danh sách Check, ở cả EN và VI |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-1 Vòng focus (đã có từ trước).** `--focus-ring` (không đổi từ trước 014bd47) là vòng màu nhấn 3px với alpha 35% / 45%,
  khoảng 1,7:1 so với card sáng và 2,4:1 so với card tối (tính từ token). Bộ chọn nhãn mới dùng vòng màu nhấn đặc 2px; các
  nút ngày và điều khiển khác dùng vòng chung. Một vòng chung đậm hơn sẽ giúp bảng timesheet vốn dùng nhiều bàn phím; tùy
  chọn cho vòng sau.
- **R-2 Kiểu ngày ngoài bảng.** Phần đầu Review ("2026-09-28 to 2026-10-11, payroll date 2026-10-16") và checklist dùng
  ngày ISO trong khi bảng dùng ngày kiểu Mỹ (E-4 chỉ nói về bảng). Tùy chọn cho nhất quán.
- **R-3 Nút tài khoản trên điện thoại.** Kế hoạch mục C nhắc một nút tài khoản trên thanh trên của điện thoại; tên và Sign
  out nằm dưới More thay vào đó. Tương đương về chức năng.
- **R-4 Chú giải.** Chú giải của Timesheet luôn có "Today" (`TimesheetSheet.tsx:284`), kể cả với kỳ không chứa hôm nay.
- **R-5 Chữ của trình sửa chỉ đọc.** Các thông tin ngày chỉ đọc vẫn in "none" (`DayEditor.tsx:387, 393, 403`); bảng
  timesheet thì không bao giờ.
- **R-6 Ghi chú cổng.** Fixture e2e chọn cổng loopback trống do hệ điều hành cấp (như mọi cổng kiểm trước); server của tôi
  dùng 47930.

## Gate chưa chạy hoặc bị chặn và lý do

Không có trong khu vực B. Typecheck, lint, `npm test` và toàn bộ bộ e2e trên cả hai project đã chạy ở đây và đạt. Các mục
của khu vực A (tính đúng nghiệp vụ, R-07 cho mọi giá trị, AC-04/AC-16/AC-01 trên mọi đường sửa mới, riêng tư, PDF) nằm ngoài
review này.

## Xử lý phát hiện trước

Chưa có phát hiện khu vực B nào trước đó cho vòng này. Ghi chú của gate về `--sheet-rule-strong` đã được đánh giá ở trên
(không phải lỗi). Kết luận của gate về thanh cố định (thanh trên sticky, thanh tab fixed, không che) khớp với ảnh điện
thoại tôi chụp.

## Tách sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, khu vực B:** chưa; B-01 và B-02 cần một vòng sửa client có phạm vi (sửa, freeze, cổng kiểm, audit
  lại khu vực B; khu vực A chỉ khi phát hiện của nó hoặc bản sửa chạm phạm vi của nó). B-03 và B-04 có thể đi cùng vòng đó.
- **Phép của chủ:** không xin và không được cấp; không triển khai, không gửi mail thật, chỉ dữ liệu giả.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một bước tiếp

Coordinator: mở một task sửa có phạm vi cho WP5-UX-B-01..B-04 (bố cục client dưới 768px và trong khoảng 768 đến 1199px, mỗi
cái một assertion e2e, thứ tự trong import.spec, docs/04 EN+VI), rồi freeze, cổng kiểm và audit lại khu vực B trên digest mới.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-B, attempt 1; reviewer tự báo
  `claude-opus-5-5` (subagent mới; không thấy agent ID từ bên trong). Tác giả được review: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1 và các freeze của chúng, và verifier của WP5-UX-GATE (như ghi trong các file task).
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được review và không chạy
  cổng kiểm hay audit nào trước đó của vòng này. Tôi không sửa file source, test, tài liệu, board hay STATE nào; các probe
  của tôi chạy trong bản clone tạm, ngoài theo dõi của git (`.git/info/exclude`), và được chép vào đây dưới dạng `.txt`.
- **Digest trước/sau; bằng chứng gate cho snapshot đó:** `3d274c9e…c7ea9` trước và sau, ba dạng (`01-digest-before.txt`,
  `90-digest-after.txt`); bằng digest ghi nhận của WP5-UX-GATE.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B.md` và `.vi.md`, file mới; các review WP5
  trước đó không bị đụng tới.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** WP5-UX-B-01..B-04 đang mở; tiếp theo: một task sửa WP5-UX,
  freeze của nó, một cổng kiểm và một lần audit lại khu vực B mới trên digest mới.
