# Vòng thay đổi giao diện 3 của WP5, kiểm định độc lập khu vực A trên 7ce4e95 (WP5-UX3-AUDIT-A)

Bản dịch của [WP5_UX3_REVIEW_A.md](WP5_UX3_REVIEW_A.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện 3 của WP5 do chủ yêu cầu, sau vòng
  sửa (WP5-UX3-FIX1 và WP5-UX3-FIX2) và regate (WP5-UX3-REGATE, PASS kèm một sai lệch đã ghi), task WP5-UX3-AUDIT-A, lần 1,
  ngày 2026-10-16 từ 18:25Z đến khoảng 20:55Z (11:25 đến khoảng 13:55 giờ America/Los_Angeles, một ngày cửa sổ: kỳ
  hiển thị 09/28-10/11/2026, kỳ đang chạy 10/12-10/25). Model reviewer tự báo `claude-opus-5-5`, profile timesheet-auditor
  (effort do profile đặt, không quan sát được từ bên trong). Model tác giả mạnh nhất của snapshot trên board cũng là
  `claude-opus-5-5` (PLAN, PLAN2, T06, T08, FIX1, SWEEP), nên reviewer không yếu hơn. Chỉ khu vực A: thị giác, khung ứng
  dụng, Settings, bảng chấm công, khả năng tiếp cận, các mục khu vực A của vòng sửa, hai lần quá thời gian trên điện thoại
  của regate (mục 11) và đường nối ở DPR 2 (mục 12). Auditor khu vực B chạy song song trên cùng máy (thư mục của nó có
  hoạt động ghi file ở mọi lần lấy mẫu tải); mọi thời gian dưới đây mang theo bối cảnh đó.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `7ce4e95a0c4477374e981132d93b11aedab2e384` (commit WP5-UX3-FIX2-FREEZE, `freeze_commit` của regate); HEAD là commit đó
  trước và sau; không có gì ngoài `handoff/` bị sửa hay chưa theo dõi, trước và sau. Digest
  `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 file, không tính `handoff/`, ghi đầu tiên
  (18:26Z) và cuối cùng (20:42Z), mỗi lần ở ba dạng bằng nhau: bản xuất `git archive` sạch băm bằng
  `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp giống từng byte với bản xuất) và
  `npm run digest` trong repository. Source đủ: `npm ci` exit 0 trong ba bản xuất.
- **Quyết định: FIX REQUIRED.**
  - Sáu lỗi, một mức Medium và năm mức Low (mục "Lỗi"): vòng tiêu điểm bàn phím biến mất dưới con trỏ chuột trên nút ngày
    và bộ chọn Category của bảng, kể cả sau khi tiêu điểm quay về theo tài liệu từ Day editor (01); một quy tắc hover của
    bảng (và ba quy tắc cũ hơn) vẫn tô trên màn hình cảm ứng, trái với docs/04 và quy tắc UI của AGENTS (02); nút danh
    tính vẫn cao 38px với con trỏ thô (03); biểu tượng của mục Sign out dính sát chữ trong menu tài khoản và bảng More (04);
    một mutant bỏ việc trả tiêu điểm khi bấm Escape trong bảng More trên điện thoại vẫn sống sót qua bộ test (05); trên
    điện thoại bảng "Submissions and delivery" của Administration cuộn ngang mà bàn phím không với tới khi có một nhãn
    trạng thái gửi dài (06, có từ trước, axe mức serious).
  - Mục 11 (hai lần quá thời gian của regate): cả hai là nhiễu do tải với lý do đã nêu, không phải chờ quá sát khi đọc mã
    cũng không phải sản phẩm chậm. Một lần đứng ở mức máy khoảng 21 giây làm cả hai trình duyệt của hai worker đứng cùng
    lúc (tạo trang mất 21.8 giây ở một worker, một lần chờ 400 ms trả về sau 21.0 giây ở worker kia). Trong năm lần chạy
    đầy đủ của tôi (lần bắt buộc, một lần ở thời điểm của regate, một lần với đồng hồ thật, và hai lần cùng lúc ở thời
    điểm đó và với đồng hồ thật) hai test đạt 125 trên 125 lần; ngân sách thời gian sát của `theme.spec.ts:413` (tới 84%
    của 30 giây trên desktop) là rủi ro R8.
  - Mục 12 (đường nối ở DPR 2): không có đường nối, khe hở hay bóng đổ lên cột nâng bên cạnh ở 1440, 1445, 1367 và 1601,
    sáng và tối; vết khuyết của lần 1 đã hết (tệ nhất 3.0/255 dưới một chỗ nối bên trong ở giao diện sáng, so với
    22.5-28.5 ở lần 1); ở giao diện tối còn một chỗ trũng rộng một điểm ảnh thiết bị 8.4-9.5/255 trong hàng viền 1px tại
    mỗi chỗ nối (rủi ro R3).
  - Mọi thứ khác của khu vực A đạt: độ trung thành với chủ của U-01..U-20 và U-27 cùng các điều kiện G-1 b, G-2 a, G-5 b và
    U-06; hệ thống style (token đồng nhất giữa các bộ, một `--transition`, không có `all`, giảm chuyển động); khung ứng
    dụng và Settings (bàn phím, Escape, tiêu điểm sau mọi mục kể cả màn hình tải khi cần, chuyển hướng, Profile chỉ đọc,
    nhân viên không gửi yêu cầu `/api/admin/` nào, các test tích hợp 403); thanh kỳ và tiêu đề; bảng (cột nâng theo nhóm,
    108px, quy tắc 1360px, phía neo, tiêu điểm ở 768-899px); panel editor; axe 4.14.0 với 0 vi phạm trên 43 lần quét ngoại
    trừ `target-size` của menu tài khoản đã được chấp nhận (Administration trên điện thoại với trạng thái gửi dài, quét
    sau đó, cho ra lỗi 06); 10 trên 11 mutant của tôi bị bắt; các kiểm tra bắt buộc đều xanh.
  - Lời giải trình `target-size` của menu tài khoản trong FIX1 được chấp nhận với số đo của tôi (rủi ro R2).

## Phạm vi thật đã xem/chạy

1. Đọc như lời tuyên bố, không phải bằng chứng: brief, AGENTS.md từ đĩa, lời của chủ và các quyết định của coordinator
   ngày 2026-10-15/16 (gồm danh sách trọng tâm kiểm định, phần bổ sung và "regate timeouts"), PLAN và PLAN2 (thiết kế và
   kết quả), FIX1, SWEEP, FIX2 (kèm Addendum 1), GATE (lần 1, FAIL) và REGATE (PASS), cùng bằng chứng của chúng; docs/04
   (EN và VI), dòng kích thước chunk của docs/10.
2. Mã đã đọc cho khu vực A: `styles.css` (token, ba bộ theme, quy tắc transition, mọi quy tắc hover, nhóm cột nâng, khung,
   cuộn trong thẻ tuần), `AppShell.tsx`, `AccountMenu.tsx`, `App.tsx`, `routeModel.ts`, `ProfileScreen.tsx`,
   `SettingsScreen.tsx`, `periodBarModel.ts`, `dayEditorModel.ts` (`dayPeriodPill`), `TimesheetSheet.tsx`
   (`revealFocused`), `SheetWeekTable.tsx` (tên bộ chọn), `DayEditor.tsx` (tên hộp thoại), `DayFieldsForm.tsx`
   (`aria-describedby`), `ConfirmDialog.tsx`, các helper e2e và các test nêu trong phần lỗi.
3. Kiểm tra bắt buộc trong bản xuất sạch `export`: `npm ci`, typecheck, lint, `npm test` hai lần, build, AC-13 một lần, e2e
   ĐẦY ĐỦ trên cả hai project với đồng hồ thật.
4. Probe riêng trong bản xuất thứ hai `export-p` (server ở 48950-48969; không có gì vào repository): đường nối DPR 2, khung
   và bàn phím, hình học bảng và điểm ảnh của khung, quét axe và tên hộp thoại, màn hình cảm ứng 1024px, một cú chạm trên
   điện thoại, vòng tiêu điểm dưới con trỏ, biểu tượng các mục tài khoản, Administration trên điện thoại sau các kỳ đã
   nộp, ảnh chụp (giữ 16).
5. Mười một mutant trong bản xuất thứ ba `export-m` (server ở 48940-48949), mỗi cái chạy toàn bộ unit test và các spec e2e
   liệt kê trên cả hai project, rồi khôi phục (build lại cho `index-4YHzamSq.js` như cũ; mọi file đã đột biến bằng bản xuất
   gốc).
6. Mục 11: đọc từng bước hai trace của regate; thời gian chạy của hai test trong chín lần chạy đầy đủ và lần chạy lặp của regate và
   của tôi; thêm bốn lần chạy đầy đủ, mỗi lần lặp hai test này bốn lần trong một project thêm với cấu hình mobile (thêm
   20 lần mỗi bộ; 42 test probe của `export-p` cũng chạy trong các bộ của `export-p`): một lần ở thời điểm của regate
   2026-12-31 23:30 America/Los_Angeles với preload FIX10 (bản sao giống từng byte), một lần với đồng hồ thật, rồi hai bộ
   cùng lúc (bốn worker), một ở thời điểm đó trong `export-m` và một với đồng hồ thật trong `export-p`; lấy mẫu tải ở đầu
   và cuối mỗi lần chạy (`load-context.txt`).
7. Quét CSS tĩnh (chặn hover theo thiết bị, đồng nhất bộ theme, giá trị viết thẳng) trên target và trên a643794.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX3-AUDIT-A/` cùng 16 ảnh `-synthetic.png`.
Script và probe được giữ dạng `*.txt` (không bao giờ chạy được từ repository).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest ba dạng, đầu và cuối; HEAD; trạng thái ngoài handoff | `262138e0…bf0191`, 833 file mọi lần; danh sách bản xuất = danh sách `ls-tree`; HEAD 7ce4e95; 0 dòng ngoài handoff | `01-digest-*-before.txt`, `01-digest-*-after.txt`, `01-head-*.txt` |
| `npm ci` (ba bản xuất) | 0, 0, 0 | `02-ci-exit.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 dòng deprecation | `10-typecheck.txt`, `11-lint.txt`, `main-times.txt` |
| `npm test` hai lần | 0 và 0: 94 file, 2131 test mỗi lần (gồm test tích hợp 403, `vitest.config.ts` gồm `tests/**/*.test.ts`) | `12-npmtest-1.txt`, `12-npmtest-2.txt` |
| `npm run build` | 0; chunk chính `index-4YHzamSq.js` 487.17 kB (gzip 143.23), `AdminScreen` 31.57 kB, `ImportScreen` 23.82 kB, CSS 78.62 kB; không có cảnh báo kích thước chunk | `13-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `14-ac13.txt` |
| e2e ĐẦY ĐỦ, đồng hồ thật, cả hai project (18:30:07-18:47:25Z, LA 11:30-11:47 một ngày cửa sổ; auditor khu vực B đang chạy) | exit 0: 627 đạt, 67 bỏ qua, 0 lỗi (desktop 317/30/0, mobile 310/37/0), 17.3 phút, 0 dòng deprecation | `15-e2e-real.txt`, `15-e2e-real-counts.txt`, `load-context.txt` |
| `git diff --stat a643794 7ce4e95 -- src/server src/domain` | rỗng | `40-server-diff.txt` |
| quét CSS (target và a643794) | 0 khác biệt giữa hai bộ tối (60 token mỗi bộ), 0 token tối thiếu trong `:root`; 0 giá trị màu/bo góc/bóng/thời gian viết thẳng trong quy tắc; 7 quy tắc `:hover` ngoài `@media (hover: hover)` (10 ở a643794) | `20-cssscan.txt`, `20-cssscan-a643794.txt` |
| thời gian của hai test regate (10 log regate, của tôi) | xem mục 11 | `50-durations-regate.txt`, `51-durations-mine.txt`, `52-durations-item11.txt` |
| trace lỗi của regate | một lần đứng khoảng 21 giây làm cả hai trình duyệt của hai worker đứng cùng lúc | `70-item11-regate-traces.txt`, `trace_actions.py.txt` |
| probe (Edge 155, `export-p`) | xem các mục 3-12 | `obs-*.txt`, `log-probe-*.txt`, `zz-a-*.spec.ts.txt` |
| mutant (11) | 10 bị bắt, 1 sống sót (A4) | `mut-summary.txt`, `mut-A*-*.txt` |
| đồng nhất token EN/VI của docs/04 | 1 khác biệt, dòng ghi chú bản dịch VI | `60-parity-docs04.txt` |

## Lỗi

1. **Medium. Vòng tiêu điểm bàn phím biến mất dưới con trỏ chuột trên nút ngày và bộ chọn Category của bảng, kể cả sau
   khi tiêu điểm quay về theo tài liệu từ Day editor.**
   - Vị trí: `src/client/styles.css:2638-2650` (trong `@media (hover: hover)`, `.sheet .sheet-date:hover:not(:disabled)`
     đặt `box-shadow: none` với độ ưu tiên 0,4,0, thắng `.sheet .sheet-date:focus-visible` ở 0,3,0) và
     `styles.css:4320-4333` (`.sheet .label-trigger:hover:not(:disabled)`, 0,4,0, thay vòng tiêu điểm lõm 2px của
     `.sheet .label-trigger:focus-visible`, 0,3,0, bằng một đường `--accent-line` 1px ở độ trong 45% / 50%, khoảng 2:1).
     Chú thích ở `styles.css:4326` nói tiêu điểm bàn phím giữ chỉ báo 2px; dưới con trỏ thì không.
   - Tái hiện (`obs-ring.txt`, `zz-a-ring.spec.ts.txt`, ảnh `auditA-focus-*`): desktop 1440, sáng và tối. Tiêu điểm bàn phím
     trên một nút ngày khi con trỏ ở nơi khác: vòng `0 0 0 1px card, 0 0 0 3px accent`; khi con trỏ nằm trên nút:
     `box-shadow: none` trong khi `:focus-visible` là true. Bấm một ngày (editor mở cạnh bảng), nhấn Escape: tiêu điểm quay
     về nút ngày đó (docs/04 dòng 62) với `:focus-visible` true và không có vòng, ở cả hai giao diện. Bộ chọn Category
     dưới con trỏ: `inset 0 0 0 1px rgba(31,95,191,0.45)` thay vì `inset 0 0 0 2px accent`. Ở 1280 nền mờ của hộp thoại modal
     lấy mất hover nên vòng hiện ở đó.
   - Kỳ vọng: vòng tiêu điểm dùng chung vẫn hiện dưới con trỏ, như với nút (`styles.css:1301`, được
     `tests/e2e/hover.spec.ts:249` kiểm), kèm một kiểm tra e2e cho nút ngày và bộ chọn. Quy tắc: AGENTS.md quy tắc UI 3
     (focus-visible ở cả hai giao diện, vòng tiêu điểm dùng chung, 3:1), WCAG 2.2 SC 2.4.7. Có từ trước (quy tắc giống hệt ở
     a643794, `styles.css:1933-1943` và `2918-2931` ở đó); FIX2 đưa quy tắc của nút ngày vào `@media (hover: hover)` mà
     không đổi độ ưu tiên. Sửa có phạm vi: quy tắc `:focus-visible:hover` cho hai điều khiển giữ `--focus-ring` và vòng
     lõm, cùng khẳng định e2e.
2. **Low. Một quy tắc hover của bảng (và ba quy tắc cũ hơn) vẫn tô trên màn hình cảm ứng.**
   - Vị trí: `styles.css:4320-4324` `.sheet .label-trigger:hover` (bộ chọn Category của bảng, cũng dùng trong bảng điện
     thoại, `SheetWeekTable.tsx:321`) nằm ngoài `@media (hover: hover)`; cùng với `input/select/textarea:hover`
     (`styles.css:1176-1180`), `tbody tr:hover` (`:1457-1459`) và `.button-link:hover` (`:4538-4541`), đều chưa được chặn
     từ trước vòng 3.
   - Tái hiện (`obs-tap.txt`, `zz-a-tap.spec.ts.txt`): project mobile (`(hover: hover)` false, con trỏ thô), chạm bộ chọn
     Category của một ngày, đóng danh sách: nút vẫn giữ `background rgba(31,95,191,0.04)` và đường viền lõm 1px màu nhấn,
     `:hover` true, cho đến khi chạm chỗ khác. Trên màn hình cảm ứng 1024px cũng vậy (`obs-coarse.txt`).
   - Kỳ vọng: docs/04 dòng 92 "Hiệu ứng hover chỉ áp dụng trên thiết bị có hover (`@media (hover: hover)`), nên chạm không
     để lại hover" và AGENTS quy tắc UI 3 "hover (chỉ trên thiết bị có hover)". Mục 11 của FIX2 đã chặn các quy tắc hover
     `.sheet-day` và hai quy tắc khác của bảng, nhưng không chặn quy tắc này. Sửa có phạm vi: đưa bốn quy tắc vào
     `@media (hover: hover)` (giữ vòng của lỗi 01), mở rộng `hover.spec.ts:552` từ `.sheet-day` ra mọi quy tắc hover có tô.
3. **Low. Nút danh tính vẫn cao 38px với con trỏ thô từ 768px.**
   - Vị trí: `styles.css:663-673` `button.identity { min-height: var(--avatar-size) }` (0,1,1) thắng quy tắc cảm ứng
     `@media (max-width: 767px), (pointer: coarse) { button { min-height: var(--tap-min) } }` (`styles.css:1330-1339`,
     0,0,1).
   - Tái hiện (`obs-coarse.txt`, `zz-a-coarse.spec.ts.txt`): project desktop, `hasTouch`, 1024x900:
     `matchMedia('(pointer: coarse)')` là true; nút danh tính đo 296x38, là điều khiển duy nhất dưới 44px (input của công tắc
     và ô chọn được nhãn 44px của chúng bao).
   - Kỳ vọng: AGENTS quy tắc UI 3 và docs/04 dòng 93: điều khiển ít nhất 44px dưới 768px và với con trỏ thô (máy tính bảng
     nằm ngang hiện thanh này). WCAG 2.5.8 (24px) vẫn đạt. Sửa có phạm vi: `min-height: var(--tap-min)` cho
     `button.identity` dưới `(pointer: coarse)`, cùng một phép đo con trỏ thô trong test e2e.
4. **Low. Biểu tượng của mục Sign out dính sát chữ, trong menu tài khoản và trong bảng More trên điện thoại.**
   - Vị trí: `styles.css:864-871` cho `.account-panel .account-action` một `gap` 12px, nhưng `button.account-action`
     (`styles.css:883-887`, `AccountMenu.tsx:128-133`) là `display: block`, nên `gap` không có tác dụng.
   - Tái hiện (`obs-signout.txt`, `auditA-signout-icon-gap-desktop-synthetic.png`): Profile, Settings và Import (liên kết,
     `display: flex`) cách 12.0px giữa biểu tượng và chữ; Sign out cách 0.0px, và biểu tượng nằm cao hơn tâm chữ 3px, trên
     desktop và điện thoại.
   - Kỳ vọng: cùng khoảng cách và căn chỉnh biểu tượng như các mục khác (menu tài khoản U-04; AGENTS quy tắc UI 1 và 2,
     component nhất quán). Sửa có phạm vi: `display: flex; align-items: center` cho `.account-panel .account-action`.
5. **Low (độ mạnh test). Bỏ việc trả tiêu điểm khi bấm Escape trong bảng More trên điện thoại không bị phát hiện.**
   - Vị trí: `src/client/components/AppShell.tsx:158-162` (`closeOnEscape` đưa tiêu điểm về More). Mutant A4 thay dòng 161
     bằng `void 0;`.
   - Tái hiện (`mut-A4-*.txt`): unit 2131 đạt; `shell.spec.ts` và `theme.spec.ts` trên cả hai project 145 đạt, 0 lỗi.
     `shell.spec.ts:588` chỉ kiểm Escape cho menu desktop (nó đặt 1280px trên cả hai project) và test More ở
     `shell.spec.ts:713` chỉ kiểm các mục.
   - Kỳ vọng: một khẳng định rằng Escape trong bảng More đóng bảng và trả tiêu điểm về More (hành vi có tồn tại; probe của
     tôi xác nhận trên target, `obs-shell.txt` dòng "phone More, Escape"). docs/04 dòng 7: More chứa cùng nội dung tài khoản
     như menu desktop, mà Escape ở đó trả tiêu điểm. Sửa có phạm vi: ba dòng trong test More.
6. **Low (có từ trước). Trên điện thoại bảng "Submissions and delivery" của Administration cuộn ngang, bàn phím không
   với tới, khi có một nhãn trạng thái gửi dài.**
   - Vị trí: `src/client/styles.css:4881-4884` `.ops-table .badge { display: inline-block; white-space: nowrap }` trong bố
     cục điện thoại của bảng (`styles.css:4897-4926`, hai cột `1fr` mỗi hàng), ở `src/client/components/OperationsStatus.tsx:329`
     (`<div className="table-wrap">`, `overflow-x: auto` ở `styles.css:1429-1431`, không nhận tiêu điểm, không có nội dung
     nhận tiêu điểm). Không đổi từ a643794; vòng 3 dời Administration vào Settings (T03) nhưng không đụng bảng này.
   - Tái hiện (`obs-adminwrap.txt`, `zz-a-adminwrap.spec.ts.txt`, `log-probe-adminwrap2.txt`,
     `auditA-admin-submissions-phone-390-light-synthetic.png`): project mobile, một worker chạy trước `admin-status.spec.ts`,
     `automation.spec.ts` và `history-settings.spec.ts` (chúng tạo các kỳ đã nộp), rồi admin mở `#/settings/admin`: nhãn
     "Delivery recorded as uncertain" và mã lỗi `lease_expired_while_sending` tràn ra ngoài thẻ; khung bảng rộng 326px
     với chiều rộng cuộn 359px ở 390, và 256 so với 324 ở 320; axe 4.14.0 báo `scrollable-region-focusable` (serious) trên
     `.table-wrap` ở cả hai bề rộng. Vi phạm này cũng xuất hiện ở cả sáu lần quét Administration trên điện thoại trong các
     bộ chạy của mục 11 (sáng và tối); với một lần nộp đơn giản thì không tràn và không vi phạm.
   - Kỳ vọng: các hàng trên điện thoại, vốn đã chuyển thành danh sách hai cột, giữ mọi chữ trong thẻ mà không cuộn ngang
     (WCAG 2.2 SC 1.4.10 ở 320px; AGENTS quy tắc UI 2, ưu tiên điện thoại và co giãn) và không có vùng cuộn nào nằm ngoài
     tầm bàn phím (SC 2.1.1). Sửa có phạm vi: cho nhãn và mã lỗi (`.ops-code`) xuống dòng trên điện thoại, hoặc cho chúng cả
     hàng, cùng một kiểm tra axe hoặc kiểm tra tràn cho Administration trên điện thoại với trạng thái gửi dài.

## Kết luận từng mục

### 1. Độ trung thành với chủ (U-01..U-20, U-27, G-1 b, G-2 a, G-5 b, U-06)

Màn hình: `auditA-sheet-editor-1440-{light,dark}`, `auditA-account-menu-1440-{light,dark}`,
`auditA-floating-panel-1280-light`, `auditA-lifted-run-1440-dark`, `auditA-phone-*`; số đo trong `obs-shots.txt`,
`obs-sheet.txt`, `obs-shell.txt`, `obs-seam.txt`.

| Mục | Kết luận | Bằng chứng |
|---|---|---|
| U-01 phong cách hiện đại | PASS | mục UI của AGENTS đọc từ đĩa, token ở `styles.css:9-343`, docs/04 dòng 85-96 |
| U-02 tương phản, bảng tuần nổi | PASS | thẻ tuần vuông với `--elev-2` (`obs-sheet.txt` phần hình dạng), thẻ trên nền 1.14/1.15 (regate, e2e `surfaces.spec`) |
| U-03 khối danh tính | PASS (lỗi 03 cho kích thước cảm ứng) | tên đậm trên email màu mờ, canh phải, dấu chấm lửng, avatar bên phải, mũi tên |
| U-04 menu avatar | PASS (lỗi 04 cho khoảng cách Sign out) | phần đầu, Profile, Settings, Administration (admin), Theme, Sign out |
| U-05 dời Settings và Admin | PASS | thanh chỉ còn Timesheet, Overtime, History; các trang con của Settings; chuyển hướng `#/admin` |
| U-06 chữ thương hiệu | PASS | hiện từ 1024 khi không có chia sẻ, ẩn 1024-1279 khi có chia sẻ, hiện từ 1280; một hàng 56px ở mọi bề rộng |
| U-07 check in/out trên hàng tiêu đề | PASS | tâm h1 91.0 = tâm cụm giờ 91.0, canh phải (1304 trên 1440, mép trang) |
| U-08 bỏ dòng tên | PASS | không có, cả của mình lẫn chia sẻ (e2e `shell.spec.ts:369/459`) |
| U-09 pill | PASS | old hổ phách, current xanh lá, future hồng, in progress xanh dương, trung tính xám; chữ 6.47-8.37:1 (e2e `timesheet.spec.ts:1643`) |
| U-10 hàng thông tin | PASS | một hàng ở 1440, xuống hàng ở 820 (e2e) |
| U-11 hàng Open a day | PASS | chữ, ô ngày và nút cùng tâm trên một hàng |
| U-12 khoảng cách thanh công cụ | PASS | khoảng 24.0px cùng một đường mảnh |
| U-13 cột đang sửa | PASS | ô Day được tô, khung màu nhấn 1px, không gạch đậm, không thanh hai bên |
| U-14 cột nâng | PASS | nâng lên với bóng mềm, góc 4px, một bóng cho mỗi nhóm |
| U-15/U-16 Category, Status | PASS | các hàng Day / Date / Category / Time / OT (h:mm) / Status; vòng có gạch chéo cho "No times" |
| U-17 Current | PASS | trạng thái rời kỳ ở 320px: Today, Current, Sign off trên một hàng 44px, tên "Current period", "Review & sign off" |
| U-18 chữ Open a day | PASS | ẩn ở 320 (hàng 288px), hiện ở 360 (328px): đúng quy tắc của chủ "ẩn khi không đủ chỗ" |
| U-19 ghi chú ngắn | PASS | chip "current period", "Times in America/Los_Angeles" |
| U-20 bề mặt đầu panel | PASS | bề mặt `--panel-head` với đường kẻ dưới |
| U-27 hàng WFH | PASS | đáy ô Category 856.0 = đáy WFH 856.0 ở 1440 |
| G-1 b bảng tuần vuông | PASS | `.sheet-week` và `.sheet-footer` bo góc 0 |
| G-1 b nâng 4px, không bóng đổ lên cột nâng bên cạnh | PASS | clip-path theo vị trí trong nhóm; các cột của nhóm không tự đổ bóng; đường nối mục 12 |
| G-1 b không bị ép hay chồng nội dung | PASS | mọi cột >= 110.6px (900) và >= 116.8px cạnh panel (1360); 0 từ rộng hơn ô, 0 phần tử tràn ở 900-1920 |
| G-1 b panel nổi | PASS | modal dưới 1360, cạnh bảng từ 1360; neo phải cho Mon-Wed, trái cho Thu-Sun ở 1280 và 1024, không bao giờ đè lên cột |
| G-2 a | PASS | "Category" ở mọi nơi trên bảng, editor và chế độ nhiều ngày (từ ngữ FIX2, e2e) |
| G-5 b | PASS | pill "in progress" và chip editor theo kỳ của chính ngày đó (e2e today.spec 728/787/826 trong một ngày cửa sổ; mutant A6, A10 bị bắt) |

### 2. Hệ thống style

PASS. `:root` sáng có 228 custom property; hai bộ tối giữ cùng 60 giá trị (0 khác biệt) và mọi token tối đều có trong
`:root`; hai token màu không có giá trị tối (`--scrim`, `--paper`) trung tính với theme theo thiết kế và có từ trước vòng 3.
Một `--transition` (`styles.css:504-507`) liệt kê màu, màu nền, vị trí nền, màu viền, bóng và transform; không có
`transition: all`, không có `animation`, không có `@keyframes`; giảm chuyển động đặt ba thời lượng về 0.01ms
(`styles.css:486-492`). Việc khai báo `--transition` cho mọi phần tử (trọng tâm 1) là cách chạy được để một phần tử chọn
thời lượng của nó. docs/04 "Visual standard" khớp với mã (thang bo góc 6/8/12/pill, bảng vuông, nâng 4px, tên elevation,
120/180/260 ms) trừ câu về hover ở dòng 92 (lỗi 02) và câu về con trỏ thô ở dòng 93 cho nút danh tính (lỗi 03).

### 3. Khung ứng dụng và Settings

PASS ngoài các lỗi 03-06. Desktop: thứ tự Tab Timesheet, Overtime, History, nút danh tính; Enter mở menu với tiêu điểm ở
Profile; Tab đi qua Profile, Settings, Administration, Theme (một điểm dừng), Sign out, rồi rời đi (menu đóng, tiêu điểm ở
Check in); Escape từ một mục đóng menu và trả tiêu điểm về nút; bấm ra ngoài và đổi hash đều đóng menu. Mọi mục chọn bằng
bàn phím đưa tiêu điểm đến `h1` của trang mới kèm vòng (`:focus-visible` true) và vẫn giữ sau 2.5 giây (dữ liệu đã tải); mục
của trang đang hiện trả tiêu điểm về nút danh tính; mục chọn bằng con trỏ đưa tiêu điểm đến `h1` mà không có vòng. Administration
tải khi cần: chunk chậm 3 giây vẫn nhận tiêu điểm ở tiêu đề; chunk 7 giây để tiêu điểm ở body (giới hạn 5 giây đã ghi, rủi
ro R5); người đã Tab đi nơi khác trong lúc tải vẫn giữ tiêu điểm đó. More trên điện thoại: Escape trả tiêu điểm về More,
các mục đưa tiêu điểm đến `h1` (Profile, Settings, Import, Administration), mục của trang đang hiện trả về More, chạm ra
ngoài thì đóng. Nhân viên: `#/settings/admin` và `#/admin` đi tới `#/timesheet`, nav các mục chỉ có Personal và Profile,
0 yêu cầu `/api/admin/`; Profile có 0 điều khiển sửa được và hiện vùng báo cáo đã lưu. Chunk tải khi cần và trạng thái lỗi
của chúng được `settings-routes.spec.ts:172-228` kiểm (đạt trong lần chạy của tôi). Phân quyền phía server không đổi (diff
`src/server` rỗng so với a643794; test tích hợp 403 trong cả hai lần `npm test`). Administration trên điện thoại với
trạng thái gửi dài: lỗi 06.

### 4. Thanh kỳ và tiêu đề

PASS. Hàng tiêu đề và không có dòng tên (U-07, U-08); pill chỉ từ các kỳ của server (`periodBarModel.ts:66-74`, cả chế độ
của mình và chia sẻ, e2e `today.spec.ts:728/910`); hàng thông tin; Open a day; "Sign off"/"Current" hẹp ở 320; khoảng 24px
trên thanh công cụ.

### 5. Bảng chấm công

PASS ngoài lỗi 01 và rủi ro R1. Nhóm cột nâng: xem mục 12. Khung editor như được vẽ (DPR 1, `obs-sheet.txt`): cạnh bảng ở
1366 và 1440 ít nhất 4.82:1 trên nền ô Day và 5.01-6.79 ở chỗ khác, sáng và tối; panel nổi ở 1280 hiện khung qua lớp phủ
bên ở 4.14:1 (sáng) và 2.79:1 trên nền ô Day (tối, 3.03-3.27 ở các hàng khác; trang bị inert, rủi ro R1). Tên Category/Status,
vòng gạch chéo "No times" (`shape shape-slashed`, bo 50%). Mọi cột >= 108px; quy tắc 1360px (modal ở 1359, cạnh bảng ở
1360); phía neo; 768-899px: 28 điểm dừng mỗi lần đi ở 768, 820, 880 và 899 với chi tiết tắt và bật, mọi điều khiển có tiêu
điểm và vòng của nó nằm trong phần thẻ đang thấy (hai điểm dừng Category ngày Chủ nhật còn 1.0px và có vòng lõm 2px), trang
không bao giờ rộng hơn cửa sổ.

### 6. Panel editor (phần khu vực A)

PASS. Bề mặt đầu panel và chip; thẻ ca với pill trạng thái, dòng nguồn và bảng giờ nghỉ; xác nhận xóa với Cancel đi trước
(`ConfirmDialog.tsx:54-64`, e2e `day-editor.spec.ts:2492/2603`); WFH trên hàng Category.

### 7. WCAG 2.2 AA

FIX REQUIRED vì lỗi 01, 03 và 06 (và 02 cho hover trên cảm ứng). axe-core 4.14.0 (bản sao trong thư mục task, chạy qua giao
thức DevTools; không thêm gì vào `package.json`): 43 lần quét (timesheet, editor cạnh bảng / nổi / bottom sheet, hộp thoại
ca, xác nhận xóa, chọn nhiều ngày, menu tài khoản hoặc More, Settings, Profile, Overtime, Administration; desktop 1366/1280
và điện thoại 390; sáng và tối): 0 vi phạm ngoại trừ `target-size` khi menu tài khoản mở ở 1280 ("Today", 10.5px) và 1440
("Review & sign off", 12.2px) (các lần quét Administration trên điện thoại trong bộ chạy của mục 11, với trạng thái
gửi dài trên server dùng chung, thêm `scrollable-region-focusable`: lỗi 06); `incomplete` chỉ có color-contrast và label-content-name-mismatch như ở regate. Các nút ngày
trên điện thoại (R-UX2A-4) không có vi phạm. Tên hộp thoại Day editor: Chromium (Edge 155, cây CDP và aria snapshot của
Playwright) "Day editor Fri 10/09/2026 (2026-10-09)" với dấu ngoặc sinh ra từ CSS; thuật toán tên của chính axe cho
"Day editor Fri 10/09/2026 2026-10-09" (không có ngoặc, không mất thông tin). Máy không cài Firefox hay WebKit (không có
thư mục `ms-playwright`, không có Firefox), nên engine thứ hai là NOT VERIFIED (rủi ro R4). Duyệt bằng bàn phím: mục 3 và 5.
AX-01..AX-10, R-12, B-02, B3-01 và các mục vòng 2: test e2e của chúng đạt trong lần chạy của tôi trên cả hai project; probe
của tôi không thấy hồi quy nào ngoài các lỗi 01-03 và 06.

### 8. Độ mạnh test (mutant của tôi)

| Id | Mutant (bản xuất nháp) | Unit | e2e (cả hai project trừ khi ghi) | Kết quả |
|---|---|---|---|---|
| A1 | nhóm nâng: ngày cuối của nhóm thành `mid` (`sheetModel.ts:71`) | 5 lỗi (`sheetModel.test.ts` liftRuns) | `timesheet.spec.ts:1422` lỗi | bị bắt |
| A2 | lớp khung và thanh Today nằm dưới các ô (`styles.css:2862` `--layer-under`) | đạt | `timesheet.spec.ts:878`, `:1010`, `:1202`, `:1422` lỗi | bị bắt (e2e) |
| A3 | chữ thương hiệu chỉ ẩn khi có chia sẻ đến 1199px (`styles.css:599`) | đạt | `logo.spec.ts:268` lỗi | bị bắt (e2e) |
| A4 | Escape ở More trên điện thoại giữ tiêu điểm trong bảng đã đóng (`AppShell.tsx:161`) | đạt | `shell.spec.ts`, `theme.spec.ts`: 145 đạt | **sống sót** (lỗi 05) |
| A5 | editor rộng từ 1300px chỉ trong script (`TimesheetScreen.tsx:44`) | đạt | `day-editor.spec.ts:3093`, `:3285` lỗi (desktop) | bị bắt (e2e) |
| A6 | pill "in progress" hiện thành "current" (`periodBarModel.ts:71`) | 6 lỗi (periodBarModel, dayEditorModel) | 10 lỗi (`today.spec.ts:728/787/826/910`, `timesheet.spec.ts:1643`) | bị bắt |
| A7 | route Administration cho mọi vai trò (`routeModel.ts:44`) | 2 lỗi (`routeModel.test.ts`) | `isolation.spec.ts:90/197`, `settings-routes.spec.ts:87` lỗi | bị bắt |
| A8 | tiêu đề cột trên điện thoại "Label" (`SheetWeekTable.tsx:264`) | đạt | `timesheet.spec.ts:1575` lỗi (mobile) | bị bắt (e2e) |
| A9 | tiêu điểm tiêu đề bỏ cuộc ngay (`AppShell.tsx:38`, 0 ms) | đạt | `shell.spec.ts:588`, `:713` lỗi | bị bắt (e2e) |
| A10 | chip editor bỏ qua kỳ đang chạy (`dayEditorModel.ts:97`) | 2 lỗi | `today.spec.ts:826` lỗi | bị bắt |
| A11 | Tab qua mục cuối không còn đóng menu (`AccountMenu.tsx:196`) | đạt | `shell.spec.ts:588` lỗi | bị bắt (e2e) |

Lần chạy unit của A6 cũng có hai lần quá thời gian không liên quan ở test tích hợp khi tải nặng (rủi ro R6). Khôi phục:
build lại sau lần hoàn tác cuối cho `index-4YHzamSq.js` và cả chín file đã đột biến bằng bản xuất gốc.

### 9. Các mục trọng tâm 1-7

1. `--transition` trên `*, ::before, ::after` và chữ hover chuyển sang `--accent-strong`: PASS (mục 2; e2e
   `hover.spec.ts:125` chữ 5.77/6.52).
2. Lỗi tải chunk với "Try again" tải lại trang: PASS (tải lại là cách duy nhất để thử lại một module lỗi trong cùng trang;
   e2e `settings-routes.spec.ts:206/228`).
3. Quét axe thật cho các nút ngày trên điện thoại (R-UX2A-4): PASS (0 vi phạm, sáng và tối).
4. Cuộn `.sheet-week` ở 768-899px và test điểm ảnh của cột nâng ở 1445px: PASS (mục 5, mục 12 ở 1440 và ba bề rộng lẻ).
5. Khoảng cách thanh và lề nav ở 1024-1279px khi có chia sẻ: PASS (một hàng 56px, không tràn, chữ thương hiệu ẩn).
6. Chữ "Open a day" chỉ ẩn ở 320: PASS (theo U-18: chỉ ẩn khi hàng không đủ chỗ).
7. Tên hộp thoại với dấu ngoặc sinh từ CSS: PASS trên Chromium; engine thứ hai NOT VERIFIED (không có cài), rủi ro R4.

### 10. Vòng sửa, khu vực A

- FIX1: tiêu điểm trong thẻ tuần ở 768-899px PASS; tên của nút Category và chip giờ nghỉ chứa chữ hiển thị PASS (axe 0 vi
  phạm `label-content-name-mismatch`; e2e `timesheet.spec.ts:1575/1612`, tên chip trong `day-editor.spec.ts`); lớp bóng
  theo nhóm PASS (không vết khuyết, mục 12; `::before` theo vị trí trong nhóm, bóng riêng `none`); test cột nâng không phụ
  thuộc thứ trong tuần PASS (`bandNeighbour` lấy một ngày khác trong cùng dải thứ Hai đến Chủ nhật,
  `timesheet.spec.ts:856-870`; regate đã chạy nó vào hai ngày thứ Ba); lời giải trình `target-size` của menu tài khoản
  được CHẤP NHẬN với số đo của tôi (1280: Today còn hở 2.5px, axe 10.5px; 1440: Review & sign off còn hở 4.2px, axe 12.2px;
  bấm vào dải hở 10.5px ở 1296 đóng menu và đưa tiêu điểm vào Today; menu do người dùng mở, không modal và tạm thời, so với
  ghi chú của WCAG 2.2 về nội dung do người dùng mở trong SC 2.4.11), rủi ro R2.
- FIX2 mục 1 (tiêu điểm sau khi chọn mục): PASS (mục 3, gồm cả màn hình tải khi cần, giới hạn chờ 5 giây và trường hợp con
  trỏ); mục 3 (chip editor theo kỳ của chính ngày): PASS (mutant A10 bị bắt, e2e với đồng hồ thật trong ngày cửa sổ); mục 4
  (từ ngữ category): PASS; mục 7 (Profile ở múi giờ thiết bị khác): PASS (`settings-routes.spec.ts:119-153` chạy dưới
  `Asia/Tokyo` và khẳng định vùng đã lưu); mục 11 (chặn hover): ĐẠT MỘT PHẦN, các quy tắc `.sheet-day` và hai quy tắc thêm
  đã chặn, `.sheet .label-trigger:hover` thì chưa (lỗi 02); mục 13 (gợi ý Category): PASS (`DayFieldsForm.tsx:104,119`);
  quy tắc tiêu điểm ở docs/04 dòng 7 EN và VI: PASS (cùng token).

### 11. Hai lần quá thời gian của regate

Kết luận: **nhiễu do tải với lý do đã nêu cho cả hai test** (rủi ro tùy chọn R8 cho ngân sách thời gian của
`theme.spec.ts:413`); không test nào là chờ quá sát khi đọc mã, chạy đua hay sản phẩm chậm. Mục 11 không dẫn tới
FIX REQUIRED.

Mỗi test chờ gì (theo mã):

- `tests/e2e/timesheet.spec.ts:1799` đăng nhập, rồi với từng bề rộng gọi `setViewportSize` và đọc khung bao cùng tên dễ
  tiếp cận; nó không có lần chờ cố định nào và không có poll nào ngoài `toHaveCount(14)` sau đăng nhập. Các bước của chính
  nó mất 0.7-3.9 giây ở mọi lần chạy tôi đã xem.
- `tests/e2e/theme.spec.ts:413` đo bốn trạng thái segment; mỗi lần đọc màu, viền hay bóng đi qua `settledStyle`
  (`tests/e2e/contrast.ts:83-98`): hai lần đọc cách nhau 400 ms trong một `expect.poll` 7 giây. Test đặt giảm chuyển động
  nên transition chỉ 0.01 ms (bình thường 180 ms): khoảng 400 ms dài hơn mọi transition, và sau đó sản phẩm không đổi màu
  nữa (mỗi lần kiểm tra trả về ở lần poll đầu, 0.42-0.49 giây trong trace của regate). Cái giá nằm ở số lần: khoảng 32 lần
  trên điện thoại và 44 lần trên desktop (hover thêm ba lần mỗi segment), nên riêng các lần chờ cố định đã chiếm 15-17
  giây (điện thoại) và 20-25 giây (desktop) trong ngân sách mặc định 30 giây của test.

Chuyện gì xảy ra ở regate (`70-item11-regate-traces.txt`, đọc từ hai file `trace.zip`):

- Worker A (`timesheet.spec.ts:1799`): `BrowserContext.newPage` mất 21.8 giây (monotonic 842,684 đến 864,508 ms), rồi một
  bước `Set viewport size` mất 6.5 giây; sau đó các bước của chính test chỉ mất khoảng 0.5 giây và xong mọi khẳng định
  0.17 giây sau khi hết ngân sách 30 giây.
- Worker B (`theme.spec.ts:413`, thiết bị tối chọn tay giao diện sáng, segment thứ ba, đã xong 23 lần kiểm tra trong 11.5
  giây): một `page.waitForTimeout(400)` trả về sau 21.0 giây (842,646 đến 863,645 ms), nên poll 7 giây bao quanh hết hạn
  ("the computed color is settled"); đóng context sau đó mất 9.7 giây.
- Hai lần đứng chồng lên nhau trên hai tiến trình trình duyệt riêng (giờ thật khoảng 17:28:09 đến 17:28:31Z): một lần
  đứng ở mức máy, không phải sản phẩm (không có yêu cầu hay thay đổi trang nào lúc đó) và không phải chạy đua trong test
  nào. Hồ sơ regate không nói lúc đó máy còn chạy gì khác.

Các lần chạy của tôi (`51-durations-mine.txt`, `52-durations-item11.txt`, `log-i11-*.txt`; mọi lần exit 0):

| Lần chạy (UTC) | Tải | `theme:413` điện thoại | `theme:413` desktop | `1799` điện thoại |
|---|---|---|---|---|
| bắt buộc, đồng hồ thật, 18:30-18:47 | một bộ, kiểm định khu vực B đang chạy | 4/4, 15.0-16.5 giây | 4/4, 20.8-23.3 giây | 1/1, 0.8 giây |
| 2026-12-31 23:30 LA (preload), 19:28-19:50 | một bộ cộng 42 probe và 20 lần lặp, khu vực B đang chạy | 20/20, 15.1-21.4 giây | 4/4, 21.0-21.4 giây | 5/5, 1.4-3.9 giây |
| đồng hồ thật, 19:50-20:10 | như trên, khu vực B chạy lúc đầu | 20/20, 15.0-16.6 giây | 4/4, 21.1-21.2 giây | 5/5, 1.4-1.9 giây |
| hai bộ cùng lúc, ở thời điểm đó và đồng hồ thật, 20:10-20:35 | bốn worker, khu vực B nghỉ | 40/40, 15.0-17.9 giây | 8/8, 23.6-25.2 giây | 10/10, 1.3-2.4 giây |
| để so sánh: chín lần chạy đầy đủ và lần lặp của regate | một bộ | 47/48, 14.7-17.2 giây (lần lỗi 33.3 giây) | 36/36, 20.2-22.1 giây | 11/12, 0.7-1.6 giây (lần lỗi 30.2 giây) |

Vậy: `1799` là nhiễu (nó không chờ gì; thời gian mất vào việc tạo trang trình duyệt chứ không vào sản phẩm, mà các bước
của sản phẩm chỉ mất khoảng 1 giây); `theme:413` là nhiễu từ cùng lần đứng đó (không có lần chờ ngắn hơn transition, không
chạy đua, không có đường đi chậm của sản phẩm). Không test nào lỗi trong 125 lần chạy của tôi, kể cả hai bộ cùng lúc ở thời
điểm của regate. Hai bộ cùng lúc không tái hiện được lần đứng, nên tôi không thể quy nó cho "chỉ do hai bộ chạy đầy đủ";
đó là một lần đứng của máy chưa rõ nguyên nhân.

### 12. Đường nối ở DPR 2

PASS (`obs-seam.txt`, `zz-a-seam.spec.ts.txt`, ảnh `auditA-seam-dpr2-*`). Một nhóm ba ngày (Tue-Thu) và một ngày lẻ (Sat),
chế độ nhiều ngày, DPR 2, ở 1440 (mép cột .42 .84 .28 .70 .14 .56) và 1445, 1367, 1601 (.92 .34 .78 .20 .64 .06 .50),
sáng và tối:

- dưới mỗi chỗ nối bên trong, trong 24 hàng điểm ảnh thiết bị dưới nhóm, độ lệch tệ nhất so với bóng cách 14 CSS px mỗi bên:
  sáng 2.8 và 3.0/255 ở mọi bề rộng (lần 1 đo 22.5-28.5 ở đó); tối 8.4-9.5/255 chỉ ở hai hàng điểm ảnh thiết bị đầu tiên
  (hàng viền 1px của `--elev-lift`), tối đa 2.9 ở các hàng dưới; phía trên nhóm tối đa 1.1 (sáng) và 4.0 (tối);
- bên trong nhóm, chỗ nối hiện đường kẻ cột bình thường, vẽ thành một cột điểm ảnh đầy và một cột một phần (225-249) thay vì
  hai cột (212, 212) do mép lẻ; không có khe sáng, không có đường nối tối;
- cột nâng bên cạnh không nhận bóng (bóng riêng của mỗi cột trong nhóm là `none`, lớp `::before` của nó vươn 64px qua mỗi
  mép trong và clip của cột cắt nó lại); các cột không chọn bên cạnh nhận bóng ngoài của nhóm như thiết kế (sáng tới
  33.5/255 cạnh ngày lẻ, tối tới 26.1).

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- R1. Dưới 1360px khung editor của cột đang mở được nhìn qua lớp phủ bên: 4.14:1 (sáng) và 2.79:1 trên nền ô Day (tối).
  Trang lúc đó bị inert nên WCAG không đòi hỏi, nhưng docs/04 dòng 46 ghi "đo được 4.82:1 trở lên trên mọi bề mặt cột" mà
  không nêu giới hạn đó; nên thêm giới hạn vào docs/04 hoặc làm khung đậm hơn dưới lớp phủ.
- R2. Cảnh báo `target-size` của menu tài khoản ở 1280 và 1440 vẫn còn (lời giải trình được chấp nhận; không có lỗi là do
  đánh giá, không phải do axe).
- R3. Giao diện tối, DPR 2: một chỗ trũng rộng một điểm ảnh thiết bị 8.4-9.5/255 ở hàng viền tại mỗi chỗ nối bên trong của
  nhóm; không thấy được ở kích thước bình thường (FIX1 ghi 6-7/255).
- R4. Dấu ngoặc trong tên hộp thoại là nội dung sinh từ CSS: Chromium có tính, thuật toán riêng của axe bỏ qua; không có
  engine trình duyệt thứ hai để kiểm.
- R5. Màn hình tải khi cần mất hơn 5 giây sẽ để tiêu điểm ở body sau khi chọn mục tài khoản (giới hạn theo thiết kế).
- R6. Khi tải nặng (probe của tôi chạy cạnh một lần chạy mutant và kiểm định khu vực B), `tests/integration/restore.test.ts`
  (hook 10 giây) và `backup-prune.test.ts` (30 giây) quá thời gian một lần; cả hai lần `npm test` bắt buộc đều đạt. Khu vực B
  hoặc INT có thể muốn xem lại ngân sách thời gian của chúng.
- R7. Bảng More trên điện thoại giữ tiêu điểm ở More khi mở bằng bàn phím (menu desktop chuyển đến mục đầu); chấp nhận
  được cho một disclosure mà bảng của nó theo sau trong thứ tự Tab, và docs/04 chỉ nêu việc chuyển đến mục đầu cho menu
  desktop.
- R8. `theme.spec.ts:413` không có ngân sách thời gian riêng: các lần kiểm tra cố định 400 ms dùng 50-72% (điện thoại) và
  69-84% (desktop, khi hai bộ chạy cùng lúc) của 30 giây mặc định, nên một lần máy đứng lâu hơn khoảng 5-9 giây sẽ làm nó
  lỗi bất kể sản phẩm ra sao (lần đứng 21 giây của regate đã làm vậy trên điện thoại). Tùy chọn: `test.slow()` hay một
  thời hạn riêng, hoặc mỗi segment một lần kiểm tra ổn định rồi đọc trực tiếp (transition chỉ 0.01 ms dưới chế độ giảm
  chuyển động mà test tự đặt).
- R9 (ghi chú về bằng chứng). Các bộ chạy của mục 11 trong `export-p` cũng chạy probe của tôi, nên `obs-*.txt` chứa, sau
  lần chạy probe đầu (18:47-19:00Z), thêm các khối nối tiếp từ cùng probe trong các bộ đó (giả lập 2026-12-31 23:30-23:51
  LA và đồng hồ thật); chúng khớp với lần đầu trừ các lần quét Administration trên điện thoại đã cho ra lỗi 06.

## Gate chưa chạy/bị chặn và lý do

- Engine trình duyệt thứ hai cho tên hộp thoại (mục 7, trọng tâm 7): không có cài; NOT VERIFIED.
- Các mục NAS nằm ngoài kiểm định này.
- Mọi thứ khác brief liệt kê đều đã chạy.

## Xử lý phát hiện trước

- Các lý do FAIL của GATE lần 1 ở khu vực A (tiêu điểm bị cắt ở 768-899px; axe a và b; target-size c): đã đóng, đã đóng, đã
  đóng, chấp nhận có giải trình (R2).
- Phát hiện khu vực A của SWEEP 1, 3, 4, 7, 11, 13: đã đóng trừ 11, đóng cho các quy tắc `.sheet-day` nhưng còn quy tắc của
  bộ chọn (lỗi 02).
- Phần còn lại ở giao diện tối của FIX1 (6-7/255 ở DPR 2): đo được 8.4-9.5/255, giữ thành R3.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

Khu vực A của vòng 3 chưa được nghiệm thu trên 7ce4e95 cho đến khi các lỗi 01-06 được sửa, đóng băng, regate và
kiểm lại. Không đụng tới việc gửi thật, triển khai hay pilot nào; phép pilot của chủ không bị ảnh hưởng và vẫn đang chờ
(D-1..D-15).

## Một bước tiếp

Một task sửa có phạm vi cho các lỗi 01-06 (CSS cho vòng tiêu điểm dưới con trỏ, chặn hover và chiều cao nút danh
tính với con trỏ thô, bố cục mục Sign out, cho nhãn trạng thái gửi xuống dòng trên điện thoại, một khẳng định Escape cho
bảng More, mở rộng hover spec và kiểm tra Administration trên điện thoại), rồi đóng băng, regate và
một lần kiểm lại khu vực A mới trên digest mới.

## Nguồn gốc subagent độc lập

- Task/lần review, reviewer và tác giả đang kiểm: WP5-UX3-AUDIT-A lần 1, timesheet-auditor (context mới, `claude-opus-5-5`);
  tác giả của các lát và bản sửa đang kiểm là các worker, planner và committer WP5-UX3 trên board (không ai trong số đó là
  reviewer này).
- Context mới; reviewer không viết thay đổi nào trong snapshot và không sửa source, docs, test, board hay STATE; chỉ ghi cặp
  file này, phần Results của brief và thư mục bằng chứng.
- Digest trước và sau: `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191` (833 file) ở ba dạng cả hai lần;
  bằng chứng gate cho snapshot này: WP5-UX3-REGATE.
- Đường dẫn report mới, giữ lịch sử review cũ: `handoff/delivery/WP5_UX3_REVIEW_A.md` (review khu vực A đầu tiên của vòng 3).
- Sơ suất (không ảnh hưởng bằng chứng): hai pipeline `grep` chỉ đọc kết thúc bằng `| head -n 0` (không làm gì) vào khoảng
  18:44Z và 18:46Z, và một vòng chờ vào khoảng 19:39Z đẩy đầu ra lỗi của `grep` vào `/dev/null` khi file đánh dấu chưa có,
  đều trái quy tắc của brief (`slips.txt`); `head` và `tail` cũng được chạy trực tiếp trên vài file trong thư mục task
  (không qua pipe). Không đưa gì vào python hay node qua stdin, không heredoc, không xóa đệ quy, không kill tiến trình. Server của bản xuất gốc dùng cổng loopback do hệ điều hành cấp (harness của
  repository); bản xuất probe và mutant dùng 48950-48969 và 48940-48949.
