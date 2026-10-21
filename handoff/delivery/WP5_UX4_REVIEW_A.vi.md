# WP5 đợt đổi giao diện 4, audit vùng A trên 0ddfead (WP5-UX4-AUDIT-A)

Bản dịch của [WP5_UX4_REVIEW_A.md](WP5_UX4_REVIEW_A.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP5, đợt đổi giao diện 4 theo yêu cầu chủ (WP5-UX4), vùng A (giao
  diện, khung ứng dụng, Day editor, hộp thoại, trợ năng); task WP5-UX4-AUDIT-A, attempt 1, 2026-10-21 từ 15:01Z đến khoảng 17:05Z
  (08:01 đến khoảng 10:05 giờ America/Los_Angeles; kỳ hiển thị 10/12-10/25/2026, chứa hôm nay; không phải ngày cửa sổ). Model
  reviewer tự báo `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model
  tác giả mạnh nhất của snapshot trên board là `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04); các tác giả khác là
  `claude-sonnet-5-5`, nên reviewer không yếu hơn. Tôi không viết task WP5-UX4 nào. WP5-UX4-AUDIT-B chạy cùng lúc trên cùng máy.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `0ddfeada1b66c82b066b179e901184ca5d857793` (commit WP5-UX4-FIX1-FREEZE; `freeze_commit` của WP5-UX4-REGATE). HEAD = origin/main =
  commit đó trước và sau; không có dòng trạng thái nào ngoài `handoff/` trước và sau. Digest
  `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda`, 849 file, không tính `handoff/`, bằng nhau ở ba dạng lúc đầu
  (15:01Z) và lúc cuối (xem bảng bằng chứng): bản export sạch `git archive` băm bằng `git hash-object --no-filters`, dạng
  `git ls-tree` (danh sách đã sắp xếp giống từng byte với danh sách của export) và `npm run digest`. Source đủ: `npm ci` exit 0 ở
  bốn export (đích, bản probe, bản mutant, base 8e55710 để so sánh).
- **Quyết định: FIX REQUIRED.** Bốn lỗi (một Medium, ba Low), chi tiết ở mục "Lỗi":
  1. Medium: với thanh cuộn kiểu cổ điển (không phải overlay), bố cục Day editor nhảy qua lại giữa beside và floating khoảng 60
     lần một giây khi cửa sổ rộng 1330-1344 và chiều cao cửa sổ nằm giữa hai chiều cao trang (U4-07).
  2. Low: nhấn Escape khi focus đang ở một điều khiển trên bảng và drawer còn sửa đổi chưa lưu thì không có gì xảy ra; câu hỏi
     discard mở ra rồi bị chính phím đó đóng lại (guard U4-05, route "Escape" của T02 Addendum 1).
  3. Low: "Current period" rồi "Keep editing" đưa focus về "Today" thay vì nút vừa nhấn.
  4. Low (tài liệu): docs/04 khẳng định hai điều mà bản build không làm (nút link dạng quiet dùng chung màu hover; guard discard
     áp dụng cho mọi hành động đổi ngày đang mở).

  Mọi thứ khác trong phạm vi đều đạt theo đo đạc của chính tôi; xem từng mục bên dưới. Kiểm tra bắt buộc: typecheck, lint,
  `npm test` hai lần, build (không có cảnh báo chunk) và AC-13 exit 0; FULL e2e đồng hồ thật 773 passed, 96 skipped, 1 failed do
  `net::ERR_NO_BUFFER_SPACE` (chạy lại riêng: passed). axe-core 4.14.0: 0 vi phạm trong 102 lần quét. SC 2.4.11: 0 điều khiển có
  focus bị drawer che hoàn toàn trong 96 lượt đi (48 cấu hình, Tab và Shift+Tab). Mutant: 14 mutant của tôi, đều bị bắt (M4 chỉ bởi unit test); xem "Độ mạnh của test".

## Phạm vi thật đã xem và chạy

1. Đọc như lời khai: brief, AGENTS.md từ đĩa (mục UI "Frontend and UI/UX standards"), docs/08 "Gates and independent audit", lời
   chủ ngày 2026-10-20 trên board (yêu cầu đợt 4, F-1..F-5, các câu trả lời D) và quyết định coordinator ngày 2026-10-20,
   WP5-UX4-PLAN (A, D, E) cùng các ảnh mockup, các bản ghi T01, T02 (kèm Addendum 1), T03, T05, GATE, FIX1, REGATE, docs/04,
   docs/10 và docs/12 (EN và VI, đã kiểm cấu trúc song song: docs/04 10/10 heading, 47/47 gạch đầu dòng, 26/26 dòng bảng; docs/10
   30/114/31; docs/12 10/80).
2. Mã đã đọc cho vùng A: `styles.css` (token, ba bộ màu, transition, paper, drawer, select, switch, checkbox, link action, style
   transfer), `TimesheetScreen.tsx`, `DayEditor.tsx`, `DayFieldsForm.tsx`, `SheetWeekTable.tsx`, `PeriodBar.tsx`,
   `editorLayoutModel.ts`, `useEditorLayout.ts`, `ConfirmDialog.tsx`, `AlertDialog.tsx`, `LocalTimeField.tsx`,
   `SessionDialog.tsx`, `BreakRows.tsx`, `SettingsTransfer*.tsx`, `CompanyCalendarFile.tsx`, `ProfileScreen.tsx`,
   `SettingsScreen.tsx`, `ReviewScreen.tsx`, `ReviewDays.tsx`; diff style của đợt 4 `git diff 8e55710 0ddfead -- src/client/styles.css`.
3. Kiểm tra bắt buộc trong một export sạch (`export`).
4. Probe riêng trong export thứ hai (`export-probe`, các file `zz-a-*.spec.ts` chỉ nằm trong thư mục task, chạy qua harness của
   repository, Edge headless, không đưa gì vào repository): đo giao diện ở bốn tình huống theme, ảnh chụp computed style của
   toolbar, các tuần và footer trên bản build base 8e55710 và trên bản đích, Day editor (chế độ, góc, đẩy trang, chuyển ngày, bỏ
   chọn, thứ tự focus, Escape, mọi route của guard với Keep editing và Discard, bottom sheet trên điện thoại), quy tắc bố cục với
   thanh cuộn overlay và cổ điển, các lượt đi SC 2.4.11, hộp thoại session và Check out, Settings, Administration và Profile,
   probe dịch chuyển bố cục của card tải chậm, quét axe, probe "Current period" dưới đồng hồ giả lập FIX10 tại 2026-10-26T16:00Z
   (một ngày cửa sổ), và ảnh chụp màn hình.
5. Mười bốn mutant trong export thứ ba (`export-mut`), mỗi mutant áp dụng riêng, build lại client, chạy các test cần bắt nó,
   khôi phục file và so từng byte.

## Bảng bằng chứng

Toàn bộ bằng chứng là văn bản LF đã che thông tin trong `handoff/delivery/evidence/WP5-UX4-AUDIT-A/` cùng 13 ảnh
`-synthetic.png`; mã nguồn probe và script giữ dưới dạng `zz-src-*.txt`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest ba dạng, đầu và cuối; HEAD; trạng thái ngoài `handoff/` | `b3e9c962…a1fda`, 849 file lúc 15:01:20Z và lúc 16:51:39Z; danh sách export = danh sách `ls-tree`; HEAD 0ddfead = origin/main; không dòng nào | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (bốn export) | 0, 0, 0, 0 | `02-core-exits.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, không có dòng deprecation (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `02-typecheck.txt`, `02-lint.txt` |
| `npm test` hai lần | 0 và 0: 97 file, 2226 test mỗi lần; không có worker crash | `03-npmtest-1.txt`, `03-npmtest-2.txt` |
| `npm run build` | 0; main `index-DURkl3lw.js` 489.31 kB (gzip 143.24), CSS 83.20 kB, `AdminScreen` 38.29, `ImportScreen` 24.58, `SettingsTransfer` 7.68, `SettingsTransferFile` 26.78 kB; không có cảnh báo kích thước chunk | `04-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `05-ac13.txt` |
| FULL e2e, đồng hồ thật, hai project (15:06:07-15:30:10Z) | exit 1: 773 passed, 96 skipped, 1 failed: mobile `day-editor.spec.ts:4022`, console `net::ERR_NO_BUFFER_SPACE` khi đăng nhập (lỗi buffer). Desktop 402/33/0, mobile 371/63/1 | `log-e2e-full-real.txt`, `06-e2e-project-counts.txt` |
| test đó chạy riêng trên mobile (lần chạy lại duy nhất được phép) | exit 0, 1 passed | `log-e2e-rerun-4022-mobile.txt` |
| probe | xem "Kết luận từng mục"; lần chạy đầu của vài probe dừng vì lỗi locator của chính tôi và đã chạy lại (giữ dưới dạng `*-run*.txt`) | `obs-*.txt`, `log-probe-*.txt` |
| mutant | xem "Độ mạnh của test" | `60-mutants.txt`, `log-mut-*.txt` |

## Lỗi

1. **Medium. Với thanh cuộn cổ điển, Day editor nhảy qua lại giữa beside và floating khoảng 60 lần một giây.**
   - Vị trí: `src/client/components/useEditorLayout.ts:28` (độ rộng của quy tắc là `document.documentElement.clientWidth`) và
     `:38-43` (tính lại mỗi khi phần tử gốc đổi kích thước), cùng với việc đẩy trang (`src/client/styles.css:3753-3761`: trang giữ
     chỗ 416px và header của form xếp chồng) và `TimesheetScreen.tsx:104`.
   - Tái hiện (`obs-rule.txt`, `obs-flap.txt`): Edge headless khởi chạy không có `--hide-scrollbars` mặc định của Playwright, nên
     vẽ thanh cuộn cổ điển 15px như trình duyệt desktop trên Windows. Mở drawer cho một ngày; cửa sổ rộng 1335, 1340 hoặc 1344 và
     cao 1370: `data-editor-layout` đổi 180 đến 182 lần trong 1.5 s; ở 1340x1400 đổi 600 lần trong 10 s, luân phiên `beside` và
     `floating`. Trang cao 1369px khi floating và 1442px khi beside, nên thanh cuộn dọc xuất hiện rồi biến mất theo chế độ,
     `clientWidth` dao động qua mốc 1330 (1340 và 1325), và mỗi lần dao động lại đổi chế độ. Với cửa sổ cao (2185px) hoặc thấp
     (500px) thì không nhảy; điểm chuyển là cửa sổ rộng 1345 (client 1330) đúng thiết kế, và với thanh cuộn overlay chỉ đổi một
     lần mỗi lần vượt mốc (1329 floating, 1330 beside, quét 42 bước, 2 lần đổi).
   - Kỳ vọng: mỗi kích thước cửa sổ một bố cục. docs/04 dòng 66 nói quy tắc "chỉ phụ thuộc độ rộng cửa sổ ... nên không thể nhảy"
     và tiêu chí nghiệm thu U4-07 yêu cầu một lần đổi mỗi lần vượt mốc. Việc cả trang reflow luân phiên theo tốc độ khung hình cũng
     là rủi ro nhấp nháy (WCAG 2.3.1) và làm trang không dùng được trong lúc đó. Không test nào bao phủ thanh cuộn cổ điển (headless
     mặc định ẩn nó).
   - Cách sửa có phạm vi: làm độ rộng đo được không phụ thuộc việc trang có cuộn hay không, ví dụ `scrollbar-gutter: stable` trên
     phần tử gốc (luôn giữ chỗ cho thanh cuộn cổ điển, nên điểm chuyển giữ ở 1345px), hoặc một độ rộng đo một lần không tính thanh
     cuộn; thêm một e2e khởi chạy không có `--hide-scrollbars` và khẳng định không có lần đổi bố cục nào trong 1.5 s ở một cửa sổ
     nằm giữa hai chiều cao trang; sửa docs/04 dòng 66 và docs/12 (EN và VI) nếu cách diễn đạt đổi.
2. **Low. Escape trên một điều khiển của bảng khi còn sửa đổi chưa lưu thì không làm gì.**
   - Vị trí: `src/client/DayEditor.tsx:155-164` (`closeOnEscape` gọi `onClose()` mà không có `event.preventDefault()`).
   - Tái hiện (`obs-diag.txt`, `obs-editor.txt`): ở 1280 (floating) và 1440 (beside), mở một ngày, gõ vào Notes, đặt focus vào nút
     ngày của một ngày khác (bất kỳ điều khiển nào trên bảng), nhấn Escape. Câu hỏi "Discard your changes?" được thêm vào trang và
     lập tức nhận sự kiện `cancel` (yêu cầu đóng của trình duyệt cho chính phím Escape chưa bị chặn đi tới modal vừa mở), nên nó
     đóng như Keep editing: người dùng không thấy câu hỏi nào và drawer vẫn mở. Khi không có sửa đổi chưa lưu, cùng phím Escape
     đóng drawer. Escape bên trong drawer hỏi đúng (handler `DayEditor.tsx:284-291` của nó chặn mặc định).
   - Kỳ vọng: docs/04 dòng 67 và T02 Addendum 1: khi có sửa đổi chưa lưu, Escape (dù focus ở đâu) hỏi "Discard your changes?".
     Không mất dữ liệu (lỗi an toàn), nhưng route đã quy định không hoạt động.
   - Cách sửa có phạm vi: `event.preventDefault()` trong `closeOnEscape` trước `onClose()`, và một test cho Escape từ điều khiển
     trên bảng khi có sửa đổi chưa lưu (Keep editing và Discard).
3. **Low. "Current period" rồi "Keep editing" đưa focus về "Today".**
   - Vị trí: `src/client/components/PeriodBar.tsx:147-151` (focus chuyển sang Today trước `onCurrent`) cùng
     `TimesheetScreen.tsx:516-517` (câu hỏi trả focus về phần tử đang có focus lúc hỏi).
   - Tái hiện (`obs-current.txt`, đồng hồ giả lập 2026-10-26T16:00Z, server `today_local` 2026-10-26): Today, mở ngày hôm nay, gõ
     một ghi chú, đặt focus vào "Current period", Enter, Keep editing: kỳ và ghi chú được giữ, "Current period" vẫn hiện, nhưng focus
     ở "Today". T02 đã ghi nhận điều này (PeriodBar.tsx không thuộc quyền sở hữu khi đó).
   - Kỳ vọng: focus trở về điều khiển đã mở câu hỏi (quy tắc hộp thoại ở docs/04 dòng 73; mọi route khác đều làm vậy trong probe của
     tôi). Cách sửa có phạm vi: chỉ chuyển focus sang Today khi việc nhảy kỳ thực sự diễn ra (trong nhánh proceed).
4. **Low (tài liệu). docs/04 khẳng định hai điều mà bản build không làm.**
   - docs/04 dòng 108 (Visual standard, "Hover and pressed"): "secondary and quiet buttons ... share one hover tint
     (`--hover-fill`) with an accent boundary". Các nút link dạng quiet của đợt 4 là "Today", "Now" và "Set an end instead" có hover
     trong suốt theo thiết kế (`styles.css:3526-3549`: màu chuyển sang `--accent-strong`, 1.31:1 ở theme sáng và 1.23:1 ở theme tối
     so với lúc nghỉ, và gạch chân dày hơn).
   - docs/04 dòng 67: "every action that would change the open day, close the drawer or move the sheet to another period first
     asks". Hai route không hỏi, theo thiết kế: link rời khỏi trang, và việc tải lại sau khi một commit label hoặc batch đổi chính
     ngày đang mở (probe của tôi: ghi chú đã gõ bị thay bằng ghi chú đã lưu mà không hỏi, `obs-editor.txt`). docs/10 dòng 277 và
     docs/12 dòng 95 có nói điều này; docs/04 thì không.
   - Cách sửa có phạm vi: mỗi điểm một câu trong docs/04 và docs/04.vi.

## Kết luận từng mục (trung thành với chủ và mockup)

| Mục | Kết luận | Bằng chứng (của tôi) |
|---|---|---|
| U4-02 khoảng cách tiêu đề 32px | PASS | 32.00px ở 768, 1024, 1280, 1440, 1920 với theme sáng, tối và cả hai lựa chọn thủ công (Timesheet); Review 32px ở 768-1920 (`obs-visual.txt`, `obs-visual-run1-partial.txt`) |
| U4-03 tờ giấy, toolbar/tuần/footer giữ nguyên, chữ ký hai hàng, style tờ giấy tự do | PASS | một `[data-paper]`; chứa toolbar, header form, hai tuần, footer, chú giải, OT total và chữ ký, không chứa h1 hay thẻ kỳ; 4 ô chữ ký trên 2 hàng; giấy bo 12px, đệm 16px, `--elev-2`, 1.14:1 (sáng) và 1.15:1 (tối) so với nền trang, overflow visible. Ảnh chụp style base so với đích (1038 giá trị bằng nhau mỗi tình huống): chỉ khác những thay đổi có chủ đích (mất bóng của tuần và footer, nền dải đầu tuần và cột đầu, nhãn switch), cộng thêm độ rộng giảm 32px và khoảng toolbar tới header form từ 12 lên 16px (`20-snapdiff.txt`, ảnh base/đích) |
| F-5 dòng đầu tuần và cột đầu đậm hơn, chữ dễ đọc | PASS (chủ xem lại) | `--sheet-head-strong` có ở cả ba bộ; 1.27:1 (sáng) và 1.36:1 (tối) so với các ô trắng; 1.09:1 và 1.20:1 so với các ô ngày Mon/Tue (`--sheet-head`), một bước nhỏ đúng như yêu cầu ("lên 1 chút"); `--text` 12.30/9.91:1, `--muted` 4.59/4.83:1 trên nền đó (`41-contrast-tokens.txt`) |
| U4-04 switch tròn | PASS | mọi switch `appearance: none`, bo 999px, 44x24, núm tròn 18px, bốn tình huống |
| U4-05 không modal, chuyển ngày, bỏ chọn | PASS trừ lỗi 2 và 3 | `:modal` false, không `inert`, không `aria-modal` ở 768-1920; chuyển ngày bằng nút và bằng cột; bỏ chọn giữ focus và thông báo "Day editor closed"; bottom sheet trên điện thoại là modal |
| U4-06 góc, đẩy trang | PASS | bên phải 12/0/0/12, bên trái 0/12/12/0; khoảng cách tới mép và đáy 0; đỉnh nằm dưới thanh 56px; khoảng trống khi beside 32px (1330, 1440), 184px (1920) |
| U4-07 quy tắc | FAIL (lỗi 1) | overlay: chuyển ở 1329/1330, một lần đổi mỗi lần vượt mốc; cổ điển: chuyển ở 1344/1345 nhưng nhảy qua lại trong dải chiều cao |
| U4-08 mũi tên select | PASS | `appearance: none`, đệm cuối 34px, cách mép 12px, 5.83:1 / 7.07:1; có quy tắc forced colours (chỉ kiểm bằng giả lập, xem rủi ro) |
| U4-09 checkbox canh giữa | PASS | tâm WFH = tâm Category (0.00px), bốn tình huống |
| U4-10 "Show worked hours" | PASS | chữ hiển thị và tên truy cập |
| U4-12 múi giờ lên đầu | PASS | zone, start date, start time, end date, end time theo thứ tự DOM, màn hình và Tab ở 1440, 768, 390 |
| U4-13 Today/Now canh phải | PASS | chênh lệch mép phải 0.00px cho cả bốn link ở 1440, 768, 390 và trong hộp sửa phiên đang chạy; tên "Today, start date"... chứa từ hiển thị; 44x44 trên màn cảm ứng, cao 28px với chuột |
| U4-14 dòng nghỉ thẳng hàng | PASS | dòng gợi ý và dòng thêm: x/rộng của ô giờ và ô phút bằng nhau ở 1440, 768, 390 (dạng dòng) và trong hộp Check out; dạng chip ở 390 trong Check out |
| U4-15 hộp cảnh báo | PASS | focus đầu tiên ở OK; nằm trong khung nhìn ở 1440, 768, 390 (session) và 1440 (Check out); Escape = OK; focus về dòng bị đánh dấu đầu tiên, nếu không thì Save / "Check out with these breaks"; không còn `p.error` |
| Bố cục sửa phiên đang chạy (phần UI của U4-11) | PASS | phụ đề "running", hộp "No end yet", "Set an end instead", không có ô End, không có "Confirm no breaks taken", có gợi ý, ở 1440 và 390 |
| Trung thành mockup (phần chủ không đổi) | PASS | drawer, góc, quy tắc floating, hộp thoại session, sửa phiên đang chạy và bản xem trước khi nhập khớp B5-B8 và B10; chữ ký một hàng và tờ giấy góc vuông của B1-B3 đã được chủ đổi (hai hàng) và style tờ giấy để tự do. Một khác biệt nhìn thấy: điều khiển nhập của card là input file gốc có nhãn ("Choose File"), trong khi B10 vẽ nút "Import settings..." (docs/04 dòng 86 ghi nhận input gốc; rủi ro 10) |

**Hai route không có guard theo thiết kế.** Rời trang bằng một link: chấp nhận được. Chủ yêu cầu chuyển và bỏ chọn cột; ứng dụng
không có guard điều hướng ở màn hình nào (các form Settings cũng vậy) và guard ở router sẽ là một khái niệm mới. Tải lại sau khi
một commit label hoặc batch đổi ngày đang mở: chấp nhận được nhưng yếu nhất; người dùng chủ động đổi chính ngày đó và form phải
theo phiên bản mới, nhưng các ô đã gõ của ngày đó bị bỏ mà không báo. Cả hai được ghi ở docs/10 và docs/12 nhưng không có trong
docs/04 (lỗi 4). Một cải tiến tùy chọn rẻ là hỏi trước commit đó khi ngày đang mở còn sửa đổi chưa lưu.

**Review.** Việc chuyển sang hai cột ở 1330px là có cơ sở: dưới mốc đó bảng 850px đặt cạnh checklist 380px bị tràn (772px ở
1200-1329 trước đợt 4). Ở 1280 Review hoạt động tốt với một cột (giấy 1168px, lưới không tràn, trang không cuộn ngang); checklist
nằm sau bảng. Footer không còn bóng riêng: theo tôi nên giữ như vậy; tờ giấy là bề mặt duy nhất và footer đọc giống như trên PDF;
một đường kẻ mảnh `--sheet-rule` sẽ đem lại mép card cũ nếu chủ thích (lựa chọn của chủ, không phải lỗi).

**Settings, Administration, Profile.** Card xuất và nhập: nhãn hiển thị, input file gốc có nhãn; tiêu đề hộp xem trước nhận focus,
hộp chứa một bảng thật (caption, ba tiêu đề cột, 16 tiêu đề dòng, 3 tiêu đề nhóm, "changed"/"same" bằng chữ), Escape trả focus về
input file; axe 0 ở sáng và tối. Card công ty: tiêu đề, input file có nhãn, nút xuất. Đổi mật khẩu: nhãn hiển thị, autocomplete
`current-password`/`new-password` cùng một `username` ẩn, lỗi nằm trong đoạn `role="alert"` nhận focus. **Dịch chuyển bố cục của
card tải chậm:** khi giữ chunk 1.5 s, card đẩy "Import from Excel" xuống 326px (desktop) và 564px (360px) (layout-shift 0.61 và
0.64); việc này xảy ra một lần mỗi lần tải trang và nằm dưới màn hình đầu tiên, trước khi trên thực tế người dùng kịp tới link đó
bằng bàn phím. Kết luận của tôi: chờ ở phía test là chấp nhận được và hiện không cần biện pháp ở sản phẩm; giữ chỗ chiều cao cho
card (hoặc đặt card cuối trang) là cải tiến tùy chọn.

**Mục UI của AGENTS và hệ thống style.** Token màu mới `--sheet-head-strong` có ở bộ sáng và cả hai bộ tối (giá trị tối giống
nhau); các token khác của đợt 4 suy ra từ màu sẵn có hoặc là độ dài; mọi quy tắc ghi `transition` (12 quy tắc) đều ghi
`var(--transition)`, liệt kê sáu thuộc tính và không bao giờ `all`; thời lượng 0.01ms khi giảm chuyển động; không có animation hay
keyframes; hover chỉ trong `(hover: hover)`; trạng thái không bao giờ chỉ bằng màu (vị trí núm switch, "changed"/"same", chữ và
hình của trạng thái). Tương phản của mọi bề mặt và trạng thái mới ở sáng, tối và cả hai lựa chọn thủ công: `41-contrast-tokens.txt`
(đều đạt hoặc vượt mức yêu cầu). Một giá trị cứng mới ngoài token: `.transfer-table th[scope='row'] { width: 30% }` (rủi ro 7).

**WCAG 2.2 AA.** axe-core 4.14.0 (tag WCAG 2.0/2.1/2.2 A và AA; engine nạp từ thư mục task): 0 vi phạm trong 102 lần quét
(desktop và điện thoại, bốn tình huống theme: giấy Timesheet, drawer beside, floating ở 1280 và 900, bottom sheet, câu hỏi
discard, session mới, hộp cảnh báo, sửa phiên đang chạy, Check out, Review 1440/1280/390, Settings, Profile có lỗi,
Administration, bản xem trước khi nhập); quét chữ tối thiểu 4.59:1 (sáng) và 4.83:1 (tối), không có chữ nào dưới mức. SC 2.4.11:
96 lượt đi (768, 790, 900, 1024, 1180, 1329; drawer bên trái và bên phải; chế độ batch bật và tắt; DPR 1 và 2; Tab và Shift+Tab,
130 lần nhấn): 0 điểm dừng bị drawer che hoàn toàn sau một khung hình; 2 tới 22 mỗi lượt trong một khung hình trước khi drawer đổi
bên (theo thiết kế). Lượt đi bàn phím: thứ tự focus từ bảng tới drawer và ngược lại, Escape, các route của guard. Vùng chạm 44px
dưới 768px: không có điều khiển nhỏ hơn (ô switch nằm trong nhãn cao 44px). Không có cuộn ngang ở cấp trang tại 320, 360, 375,
390, 768, 820, 1024, 1280, 1329, 1330 và 1440 trên Timesheet (cả khi có drawer), Review, Settings và Profile.

## Độ mạnh của test

Mười bốn mutant của tôi trong `export-mut`, mỗi mutant áp dụng riêng (`mutate.mjs`, đúng một chỗ), build lại client, chạy các test
liệt kê trên project desktop, khôi phục file và so với export gốc (`cmp`; cuối cùng `diff -rq export/src export-mut/src` rỗng và
build lại sạch). Cả 14 đều bị bắt, mỗi mutant bởi một assertion, không phải timeout (`60-mutants-clean.txt`,
`61-mutant-reasons.txt`, `log-mut-M*.txt`):

| Mutant | Bị bắt bởi |
|---|---|
| M1 bỏ class paper khỏi section của Timesheet | `controls.spec.ts:95` và `surfaces.spec.ts:73` (6 failed) |
| M2 khoảng cách tiêu đề `--space-3` | `controls.spec.ts:49` (3 failed, "title row to period card at 768px") |
| M3 mũi tên cách mép 4px | `controls.spec.ts:429/484/510` (4 failed, "arrow edge distance 4") |
| M4 `COVER_TOLERANCE = 0` (dung sai khi đổi bên) | chỉ unit test "allows the tolerance at the drawer edges"; hai lượt đi của FIX1 vẫn pass (việc cắt theo cửa sổ đã xử lý trường hợp 0.23px) |
| M5 bỏ thao tác bỏ chọn | `day-editor.spec.ts:4607` (5 failed) |
| M6 bỏ qua guard discard ở Today | `day-editor.spec.ts:5033` (test Today) |
| M7 góc của drawer neo trái bo tròn ở phía mép | `day-editor.spec.ts:4886` |
| M8 dời ô múi giờ xuống dưới các ô giờ | `day-editor.spec.ts:5334` ở 1440 và 390 ("DOM order") |
| M9 focus sau hộp cảnh báo về tiêu đề thay vì Save | `day-editor.spec.ts:5713` ở 1440 và 390 |
| M10 khe giờ của dòng nghỉ 6.8rem | `day-editor.spec.ts:5613` ("time ... is not clipped") |
| M11 `--sheet-head-strong` = `--sheet-head` cũ (sáng) | `controls.spec.ts:259` và `:529` |
| M12 Today/Now canh theo đầu ô | `day-editor.spec.ts:5334` ("ends where Start date ends") |
| M13 chuyển kỳ trước khi hỏi (Keep editing không giữ được kỳ) | `day-editor.spec.ts:5091` |
| M14 bỏ handler Escape ở document của drawer | các lượt đi `day-editor.spec.ts:3294` và các test addendum (11 failed) |

Những khoảng trống không test nào bao phủ (khớp với lỗi 1-3): thanh cuộn cổ điển (mọi e2e chạy với thanh cuộn ẩn), Escape từ một
điều khiển trên bảng khi có sửa đổi chưa lưu, và focus sau Keep editing ở "Current period".

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

1. Drawer floating neo bên phải nằm đè lên đầu phải của thanh kỳ (Next, Today, Review) và nút check in/out đối với chuột ở
   768-1329px; bàn phím thì drawer đổi bên. Đây là điều dự kiến của một lớp phủ; đóng chỉ cần một lần nhấp.
2. Tải lại sau commit label hoặc batch trên ngày đang mở bỏ các ô đã gõ mà không báo (theo thiết kế; xem trên).
3. Card xuất/nhập tải chậm làm dịch trang một lần mỗi lần tải khi chunk của nó chậm (xem trên).
4. Đổi mật khẩu: một lỗi lặp lại y hệt không được thông báo lại và focus nằm ở nút; các ô không có `aria-invalid` (thông điệp nêu
   tên ô bằng chữ).
5. `ol.review-steps.plain` giữ thụt lề danh sách 40px của trình duyệt (chỉ `ul.plain` reset), nay thấy rõ trong Review một cột ở
   768-1329px (có từ trước).
6. `styles.css:85-88` nói editor khi neo dùng `--elev-2`; drawer dùng `--elev-3` ở mọi chế độ (docs/04 đúng). `--scrim-side`
   (`styles.css:102-103`, 428, 495) không còn được dùng từ khi bỏ backdrop, kèm chú thích cũ.
7. `width: 30%` trên tiêu đề dòng của bảng transfer là giá trị cứng ngoài token (quy tắc UI 1 của AGENTS).
8. Forced colours: quy tắc select trả lại mũi tên gốc (chỉ kiểm bằng giả lập); switch tròn vẽ núm bằng gradient, cách hiển thị
   trong chế độ forced colours thật không kiểm được ở headless (NOT VERIFIED).
9. Mã lỗi server xuất hiện trong chữ của hộp cảnh báo, ví dụ "(overlapping_user_intervals)" (định dạng thông báo có từ trước;
   docs/04 dòng 16 yêu cầu không có thuật ngữ DB trong luồng thông thường).
10. Điều khiển nhập của card cá nhân là input file gốc của trình duyệt ("Choose File / No file chosen"), không phải nút
    "Import settings..." của mockup; truy cập được và có ghi trong tài liệu, nhưng đơn giản hơn bản vẽ đã duyệt.

## Gate chưa chạy hoặc bị chặn

Không có kiểm tra bắt buộc nào chưa chạy. Chưa kiểm hiển thị forced colours thật và thiết bị có thanh cuộn cổ điển thật ngoài probe
headless.

## Xử lý phát hiện trước

Lỗi SC 2.4.11 của gate (1280, neo trái) đã đóng theo các lượt đi của tôi (0 bị che trong 96 lượt, gồm các độ rộng gần 1280 và DPR
2). Câu hỏi ở mục 5 của FIX1 đã được trả lời ở trên (không cần biện pháp ở sản phẩm).

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

Chưa sẵn sàng để nghiệm thu lại đợt 4: vùng A là FIX REQUIRED. Phép của chủ và pilot là việc riêng và không bị đụng tới.

## Một bước tiếp theo

Một vòng sửa có phạm vi cho lỗi 1-4 (một người viết source: `useEditorLayout.ts`/`styles.css`, `DayEditor.tsx`, `PeriodBar.tsx`,
docs/04 EN và VI, và ba test), rồi freeze, regate có một lượt chạy với thanh cuộn cổ điển, và một lần kiểm lại vùng A mới.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX4-AUDIT-A attempt 1; agent reviewer `a0a1a11cfee4a1c8e` (theo
  board); tác giả của snapshot trên board: PLAN `a3f294195d4f4c99f`, T01 `a92d8e4a467bd6b4e`, T02 `af66795ab39964860`, T03
  `abd3f154777315616`, T04 `ac40529a094d001dc`, T05 `ac50555628a30054f`, T06 `aeb02a4427bbe14e5`, FIX1 `aaf0f2fdc628d8f2c`.
- Context mới; tôi không viết thay đổi nào trong snapshot được kiểm và không sửa source, test, tài liệu, board hay STATE.
- Digest trước và sau: `b3e9c962…a1fda` (849 file) cả hai lần; bằng chứng gate cho snapshot đó: WP5-UX4-REGATE PASS.
- Path report mới: `handoff/delivery/WP5_UX4_REVIEW_A.md` (và `.vi.md`); các review trước không bị đụng.
- Xử lý phát hiện và task tiếp của coordinator: lỗi 1-4 vào một vòng sửa; các rủi ro dành cho chủ và coordinator.
