# Vòng thay đổi giao diện 3 của WP5, kiểm lại khu vực A trên ceb86b6 sau FIX3 (WP5-UX3-AUDIT-A2)

Bản dịch của [WP5_UX3_REVIEW_A2.md](WP5_UX3_REVIEW_A2.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện 3 của WP5 do chủ yêu cầu, kiểm lại khu
  vực A sau WP5-UX3-FIX3 (các chỗ sửa cho F-UX3A-01..06 của WP5-UX3-AUDIT-A) và regate đã đạt WP5-UX3-REGATE2 (lần 2); task
  WP5-UX3-AUDIT-A2, lần 1, ngày 2026-10-19 từ 21:52Z đến khoảng 23:25Z (14:52 đến khoảng 16:25 giờ
  America/Los_Angeles; kỳ hiển thị 10/12-10/25/2026, chứa hôm nay, ngoài năm ngày cửa sổ). Model reviewer tự báo
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model tác giả mạnh
  nhất trên board là `claude-opus-5-5` (các planner của vòng 3, T06, T08 và FIX1; FIX3 và GOV2 là `claude-sonnet-5-5`), nên
  reviewer không yếu hơn. Tôi không viết task WP5-UX3 nào và không phải auditor khu vực A của lần đầu (agent
  `a86e1ea01994c05f3`). Lần kiểm lại khu vực B chạy song song trên cùng máy (thư mục của nó có hoạt động ghi file ở mọi lần lấy
  mẫu tải, `load-context.txt`); mọi thời gian dưới đây mang theo bối cảnh đó.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (commit WP5-UX3-GOV2-FREEZE, `freeze_commit` của REGATE2; ngoài `handoff/` nó chỉ
  thêm AGENTS.md và AGENTS.vi.md vào bản đóng băng a78ada5 của FIX3). HEAD = origin/main = commit đó trước và sau; 0 dòng
  trạng thái ngoài handoff trước và sau. Digest `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 file,
  không tính `handoff/`, ghi đầu tiên (21:54:01Z) và cuối cùng (23:17:11Z), mỗi lần ở ba dạng bằng nhau: bản xuất
  `git archive` sạch không có thư mục `.git` băm bằng `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp
  xếp giống từng byte với bản xuất) và `npm run digest` trong repository. Source đủ: `npm ci` exit 0 trong ba bản xuất.
- **Quyết định: FIX REQUIRED.**
  - Ba lỗi, một mức Medium và hai mức Low (mục "Lỗi"): ở cửa sổ rộng cỡ điện thoại bảng More vẫn mở sau khi tiêu điểm bàn
    phím rời nó, nên 12 trên 14 bộ chọn Category sau đó nhận tiêu điểm khi bị che hoàn toàn phía sau nó và Escape từ trang
    không đóng được nó (01, có từ vòng 3, WCAG 2.2 SC 2.4.11); hai trong bốn quy tắc tiêu điểm dưới con trỏ của FIX3 (liên
    kết dạng nút, tab điện thoại) có thể bị xóa mà không test nào hỏng (02, độ mạnh của test); mục Sign out bắt đầu lệch phải
    3px so với mọi mục khác (03, quan sát 1 của REGATE2).
  - F-UX3A-01, 02, 03, 05 và 06 đã đóng theo số đo của chính tôi trên bản dựng của target; F-UX3A-04 đã đóng cho điều nó nêu
    (khoảng cách biểu tượng và căn chỉnh dọc); phần lệch ngang còn lại là lỗi 03.
  - Các quan sát của REGATE2: 1 (Sign out lệch phải 3px) là lỗi 03; 2 (màn hình đầu ở trạng thái rời thấp hơn 2.2px) và 3
    (docs/10 dòng 240 nêu bản dựng FIX2) là rủi ro, không phải lỗi.
  - Đường nối ở DPR 2 của một nhóm cột nâng ở 1440, 1445, 1367 và 1601, sáng và tối: không có đường nối, khe hở hay vết khuyết,
    không có bóng trên cột nâng bên cạnh; các con số bằng lần đầu (sáng tệ nhất 2.8 và 3.0/255 dưới các chỗ nối bên trong;
    tối 8.4-9.5/255 trong hàng viền rộng một điểm ảnh thiết bị, rủi ro R3 không đổi).
  - Mutant: 13 mutant của tôi, 10 bị bắt, 3 sống sót: quy tắc tiêu điểm dưới con trỏ của liên kết dạng nút và của tab điện
    thoại (lỗi 02) và một quy tắc hover được chặn bằng `(hover: hover), (pointer: coarse)` (giới hạn theo văn bản của phép quét
    hover, rủi ro R-A2-1). Phép quét hover không rỗng; `surviveStall` chỉ thử lại các lần hết giờ của chính poll của nó và một
    transition không bao giờ ổn định vẫn làm hỏng cả 8 test tương phản sau ba lần thử.
  - Kiểm tra bắt buộc: typecheck 0, lint 0 (không có dòng deprecation), `npm test` hai lần 0 và 0 (94 file, mỗi lần 2141 test),
    build 0 (gói chính `index-BJ9ZzqiL.js` 486.81 kB, không có cảnh báo kích thước chunk), AC-13 0 (1/1); e2e ĐẦY ĐỦ với đồng
    hồ thật: lần 1 644 đạt và 1 hỏng do lỗi mạng (`read ECONNRESET`); lần 2 (lần chạy lại duy nhất được phép) exit 0, 645
    đạt, 67 bỏ qua, 0 hỏng (desktop 326/30, mobile 319/37).

## Phạm vi thật đã xem/chạy

1. Đọc như lời tuyên bố, không phải bằng chứng: brief, AGENTS.md từ đĩa ở ceb86b6 (mục UI "Frontend and UI/UX standards"),
   mục "Gates and independent audit" của docs/08, review khu vực A đầu tiên WP5_UX3_REVIEW_A (lỗi F-UX3A-01..06, rủi ro
   R1-R9, kết luận từng mục) cùng bằng chứng và probe của nó, WP5-UX3-FIX3 (Results), WP5-UX3-REGATE2 (Results, lần 2) và
   bằng chứng của nó, các quyết định của coordinator ngày 2026-10-16 và 2026-10-19 trên board, docs/04 (EN và VI) và dòng
   kích thước chunk của docs/10.
2. Toàn bộ thay đổi của FIX3 `git diff 7ce4e95..a78ada5 -- src tests docs` (20 đường dẫn) và `a78ada5..ceb86b6` (ngoài
   `handoff/` chỉ có cặp AGENTS). Mã đã đọc cho khu vực A: `styles.css` (mọi quy tắc hover, mọi quy tắc tiêu điểm mà chúng có
   thể đè, quy tắc cảm ứng, các mục tài khoản, bảng Administration trên điện thoại), `AppShell.tsx`, `AccountMenu.tsx`,
   `contrast.ts`, và các test mới hoặc đã đổi trong `hover.spec.ts`, `shell.spec.ts`, `admin-status.spec.ts` và
   `theme.spec.ts` (ghi chú đọc mã: `notes-extra.txt`).
3. Kiểm tra bắt buộc trong bản xuất sạch `export`: `npm ci`, typecheck, lint, `npm test` hai lần, build, AC-13 một lần, e2e
   ĐẦY ĐỦ trên cả hai project với đồng hồ thật (lần 1 hỏng một lần do lỗi mạng, nên lần chạy lại duy nhất được phép tiếp theo).
4. Probe của tôi trong bản xuất thứ hai `export-p` (các `zz-a2-*.spec.ts` trong thư mục task, không có gì trong repository;
   Edge qua harness của repository): vòng dưới con trỏ và các lần đi bằng bàn phím, quét stylesheet, chạm trên điện thoại, kích
   thước với con trỏ thô, hình học của các mục tài khoản, Administration trên điện thoại với axe-core 4.14.0, màn hình đầu trên
   điện thoại, độ tương phản của các quy tắc đã đổi, cách bảng More cư xử khi tiêu điểm rời nó, và các đường nối ở DPR 2 (probe
   đường nối của lần đầu với tên đầu ra đổi lại, để có số so sánh được).
5. Mười ba mutant trong bản xuất thứ ba `export-m`, mỗi mutant áp dụng riêng, dựng lại, chạy với các spec e2e đã liệt kê trên
   cả hai project, rồi khôi phục (cả hai file bị đổi giống từng byte với bản xuất sạch sau đó, `cmp`).

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX3-AUDIT-A2/` cùng 12 ảnh `-synthetic.png`. Mã nguồn
của probe và script được giữ dưới dạng `*.txt`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng, đầu và cuối; HEAD; trạng thái ngoài handoff | `b35dddd5…ebb48`, 833 file mọi lần; danh sách bản xuất = danh sách `ls-tree`; không có `.git` trong các bản xuất; HEAD ceb86b6 = origin/main; 0 dòng ngoài handoff | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (ba bản xuất) | 0, 0, 0 | `02-ci-exit.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 dòng deprecation | `10-typecheck.txt`, `11-lint.txt`, `main-times.txt` |
| `npm test` hai lần | 0 và 0: 94 file, mỗi lần 2141 test | `12-npmtest-1.txt`, `12-npmtest-2.txt` |
| `npm run build` | 0; gói chính `index-BJ9ZzqiL.js` 486.81 kB (gzip 143.10), `AdminScreen` 31.57 kB, `ImportScreen` 23.82 kB, CSS 79.35 kB; không có cảnh báo kích thước chunk | `13-build.txt`, `16-static-summary.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `14-ac13.txt` |
| e2e ĐẦY ĐỦ lần 1, đồng hồ thật, cả hai project (21:59:20-22:17:24Z; kiểm định khu vực B đang chạy; probe của tôi từ 22:07Z) | exit 1: 644 đạt, 1 hỏng, 67 bỏ qua (desktop 325/30/1, mobile 319/37/0), 17.9 phút, 0 dòng deprecation. Chỗ hỏng: `automation.spec.ts:268` desktop, `TypeError: fetch failed`, nguyên nhân `read ECONNRESET`, ở dòng 277 của spec (một yêu cầu tới server riêng của nó), đọc từ trace được giữ lại: một lỗi mạng, không phải một khẳng định | `15-e2e-real.txt`, `15-e2e-real-counts.txt` |
| riêng test đó, `--repeat-each 5`, cả hai project | exit 0, 10 trên 10 đạt | `15-auto268-alone.txt` |
| e2e ĐẦY ĐỦ lần 2 (lần chạy lại duy nhất được phép), đồng hồ thật, không có gì khác của tôi đang chạy | exit 0: 645 đạt, 67 bỏ qua, 0 hỏng (desktop 326/30/0, mobile 319/37/0), 16.1 phút (23:00:30-23:16:43Z; kiểm định khu vực B đang chạy lúc bắt đầu), 0 dòng deprecation; `automation.spec.ts:268` đạt trên cả hai project | `15-e2e2-real.txt`, `15-e2e2-real-counts.txt` |
| probe (`export-p`, bản dựng `index-BJ9ZzqiL.js` như target) | xem các mục dưới đây; lần chạy vòng tiêu điểm đầu tiên dừng ở bước More (probe của tôi giả định bảng đóng khi Tab ra ngoài, điều dẫn tới lỗi 01) và được chạy lại đầy đủ | `obs-*.txt`, `log-probe-*.txt`, `zz-a2-*.spec.ts.txt` |
| mutant (`export-m`) | 13 đã chạy, 10 bị bắt, 3 sống sót | `mut-summary.txt`, `mut-M*-diff.txt`, `mut-M*-e2e.txt` |

## Lỗi

1. **Medium. Ở cửa sổ rộng cỡ điện thoại, bảng More vẫn mở sau khi tiêu điểm bàn phím rời khỏi nó, và các bộ chọn Category
   của bảng chấm công nhận tiêu điểm khi bị che hoàn toàn phía sau bảng đó; Escape từ trang không đóng được bảng.**
   - Ở đâu: `src/client/components/AppShell.tsx:141-162` và `:196-227`. Bảng More đóng khi hash đổi (`:142-146`), khi nhấn
     con trỏ ra ngoài thanh tab (`:149-156`) và khi bấm Escape chỉ lúc tiêu điểm còn trong thanh tab
     (`onKeyDown={closeOnEscape}` trên `nav`, `:196`). Không có gì đóng nó khi tiêu điểm rời đi. Menu tài khoản trên desktop
     mang cùng nội dung và đóng khi tiêu điểm rời khỏi nó (`AccountMenu.tsx:193-197`, "Tab past the last entry moves focus
     out of the root: the panel closes"). Có từ khi bảng More được làm trong vòng 3 (FIX3 không đụng `AppShell.tsx`); lần
     kiểm định đầu đã kiểm Escape, các mục và việc nhấn ra ngoài, chưa kiểm Tab ra khỏi bảng.
   - Tái hiện (`obs-more.txt`, `zz-a2-more.spec.ts.txt`, `a2-more-panel-covers-focused-picker-390-light-synthetic.png`): cả
     hai project ở 390x844 (project desktop là cửa sổ hẹp trên thiết bị có bàn phím và con trỏ; project mobile là điện thoại
     cảm ứng có bàn phím), bảng chấm công cuộn sao cho các hàng của tuần đầu nằm ở nửa dưới. Đặt tiêu điểm vào More, Enter
     (bảng mở ở 105,457 278x323), Tab năm lần tới Sign out, Tab thêm một lần: tiêu điểm rời bảng (ra document, rồi thanh
     trên cùng) và bảng vẫn mở. Các lần Tab tiếp theo đi qua mọi hàng của hai tuần: 12 trên 14 bộ chọn Category nhận tiêu
     điểm khi toàn bộ hộp của chúng nằm trong hộp của bảng và 25 trên 25 điểm mẫu bên trong mỗi bộ chọn được tô bởi bảng
     (vòng tiêu điểm không thấy được); hai bộ chọn còn lại bị che 5/25. Khi một bộ chọn bị che đang giữ tiêu điểm, Escape
     không đổi gì (bảng vẫn mở, tiêu điểm vẫn bị che). Cả hai project như nhau. Để so sánh, menu desktop ở 1280 đóng ở lần
     Tab qua Sign out (`obs-more.txt`, dòng so sánh).
   - Mong đợi: không điều khiển nào đang có tiêu điểm bị nội dung của tác giả che hoàn toàn (WCAG 2.2 SC 2.4.11, AA; người
     dùng không thể làm lộ nó mà không di chuyển tiêu điểm, vì Escape không có tác dụng từ trang), vòng tiêu điểm chung luôn
     thấy được (quy tắc UI 3 của AGENTS), và bảng More cư xử như menu mà nó mang nội dung (docs/04 dòng 7: menu đóng khi "a
     press outside, a page change or Tab past Sign out"; More "holds the same account content"; mẫu menu tài khoản trong
     docs/10). Cách sửa có giới hạn: đóng bảng More khi tiêu điểm rời thanh tab (một `onBlur` trên `nav` với phần tử nhận
     tiêu điểm nằm ngoài nó, như `AccountMenu` làm), giữ Escape và việc trả tiêu điểm về More, và thêm một khẳng định e2e
     trên cả hai project rằng Tab qua Sign out đóng More (kiểm bằng mutant: bỏ việc đóng).
2. **Low (độ mạnh của test). Hai trong bốn quy tắc tiêu điểm dưới con trỏ của FIX3 có thể bị xóa mà không test nào hỏng.**
   - Ở đâu: `src/client/styles.css:4584-4586` (`.button-link:focus-visible:hover`, vòng của mọi liên kết dạng nút như
     "Review & sign off" dưới con trỏ) và `:795-797` (`.shell-tabs .tab:focus-visible:hover:not(:disabled)`, các tab điện
     thoại trên thiết bị có thể hover). Test e2e mới `tests/e2e/hover.spec.ts:672-712` chỉ phủ nút ngày, bộ chọn Category
     và nút ngày trên điện thoại; không test nào hover một liên kết dạng nút hay một tab đang có tiêu điểm (`git grep` các spec
     e2e).
   - Tái hiện (`mut-summary.txt`, `mut-M4-*.txt`, `mut-M5-*.txt`): M4 (bỏ quy tắc của liên kết dạng nút) đạt các spec `hover`,
     `focus-ring`, `surfaces`, `keyboard-access`, `review` và `today` trên cả hai project, 199 đạt, 0 hỏng; M5 (bỏ quy tắc của
     tab) đạt `hover`, `focus-ring`, `shell`, `keyboard-access` và `theme`, 272 đạt, 0 hỏng. Probe của tôi trên target cho thấy
     cả hai vòng đều có dưới con trỏ (`obs-ring.txt`), nên sản phẩm hôm nay đúng; chỉ thiếu chốt chặn.
   - Mong đợi: mỗi chỗ sửa của lỗi Medium F-UX3A-01 đều được một test giữ, như FIX3 đã làm cho ba điều khiển của bảng chấm
     công (mutant của FIX3 cho ba quy tắc đó bị bắt; mutant của tôi cũng vậy: M1-M3). Thiếu chúng, vòng của các liên kết dạng
     nút (`.button-link:hover` 0,2,0 đặt `--elev-1` đè lên vòng chung 0,1,0) và của các tab điện thoại (quy tắc hover của tab
     0,5,0 đặt `box-shadow: none`) lại biến mất dưới con trỏ mà không ai hay (WCAG 2.2 SC 2.4.7, quy tắc UI 3 của AGENTS).
     Cách sửa có giới hạn: thêm một liên kết dạng nút (liên kết review của thanh kỳ) và một tab điện thoại không phải tab hiện
     tại vào các điều khiển của `hover.spec.ts:672-712` (lần lượt là vòng chung và vòng inset).
3. **Low. Mục Sign out bắt đầu lệch phải 3px so với mọi mục khác trong menu tài khoản và bảng More.**
   - Ở đâu: `src/client/styles.css:875-882` cho cả hai loại mục cùng khoảng cách và chiều cao nhưng không cùng padding ngang:
     các liên kết giữ `padding: var(--space-1) var(--space-3)` của `.nav-link` (12px, không có viền bên, `:625-635`), còn
     `button.account-action` (`:895-901`) giữ `padding: var(--space-2) var(--button-pad-x)` của nút (14px) cộng viền trong
     suốt 1px (`:1218-1229`).
   - Tái hiện (`obs-css.txt` phần "Sign out", `a2-account-entries-menu-1280-light-zoom2-synthetic.png`): menu ở 1280 và More
     ở 390, sáng và tối: Profile, Settings và Import bắt đầu biểu tượng ở 12.0px và chữ ở 42.0px bên trong mục; Sign out ở
     15.0px và 45.0px. Khoảng cách 12.0px và độ lệch tâm 0.88px bằng nhau cho mọi mục (F-UX3A-04 như đã nêu là đã đóng). Ảnh
     cắt phóng 2x cho thấy biểu tượng và chữ của Sign out không thẳng hàng với cột phía trên.
   - Mong đợi: cùng khoảng cách biểu tượng "và căn chỉnh như các mục khác", đúng điều F-UX3A-04 yêu cầu (menu tài khoản U-04;
     quy tắc UI 1 và 2 của AGENTS, thành phần nhất quán). REGATE2 ghi đây là một quan sát; tôi đánh giá là lỗi vì các mục của
     cùng một bảng nhìn rõ là không thẳng hàng và nguyên nhân là một token padding không chủ ý. Cách sửa có giới hạn: cho
     `.account-panel .account-action` cùng điểm bắt đầu ngang như các liên kết (ví dụ `padding-inline: calc(var(--space-3) -
     var(--hairline))`, giữ viền 1px cho đường biên khi hover) và khẳng định điểm bắt đầu của biểu tượng trong
     `shell.spec.ts:1077`.

## Các lỗi F-UX3A-01..06 của lần đầu (probe của tôi trên bản dựng của target)

| Lỗi | Kết luận | Cơ sở |
|---|---|---|
| F-UX3A-01 vòng tiêu điểm dưới con trỏ | **Đã đóng** | `obs-ring.txt` (hai lần chạy, thiết bị sáng và tối, Edge, project desktop): với tiêu điểm bàn phím, vòng được tô cả khi con trỏ ở xa lẫn khi nằm trên điều khiển, chuỗi shadow tính được giống nhau ở hai trường hợp, `:focus-visible` và `:hover` đều đúng: nút ngày (outset 3px; vòng so với cột đang hover 5.75 sáng, 6.15 tối), bộ chọn Category (inset 2px; 5.44 và 5.54 so với nền hover), cả hai liên kết dạng nút ("Review & sign off" ở thanh kỳ và ở chân trang chữ ký, 6.09 và 6.79), nút danh tính, liên kết điều hướng, nút quiet và secondary, công tắc Show details; ở cửa sổ 390 trên cùng thiết bị: nút ngày trên điện thoại (5.63, 6.14), bộ chọn Category trên điện thoại (5.32, 5.54), tab không phải hiện tại, tab hiện tại và More (inset 2px, 4.96 và 4.68 so với nền hover của tab) và liên kết review trên điện thoại. Tiêu điểm quay về bằng Escape ở 1440: bấm một ngày (editor nằm cạnh bảng), Escape, tiêu điểm ở nút ngày đó với `:focus-visible` và `:hover`, vòng 5.75 sáng và 6.15 tối. Ảnh `a2-ring-date-under-pointer-1440-light-synthetic.png`. Mutant M1-M3 bị bắt; với hai quy tắc còn lại xem lỗi 02 |
| F-UX3A-02 chặn hover | **Đã đóng** | `obs-css.txt`: stylesheet đã phân tích (một file CSS, 771 quy tắc được duyệt, không có sheet adopted, không có phần tử `<style>`, không lồng quy tắc) có 31 quy tắc `:hover`, mọi quy tắc đều nằm trong một media rule có văn bản đúng là `(hover: hover)`, trên cả hai project. Project mobile, sáng và tối: hai lần chạm vào một bộ chọn Category để lại nền, viền và bóng bằng lúc nghỉ (`:hover` vẫn khớp sau lần chạm nhưng không có dáng hover); một lần chạm vào ô ngày và một lần chạm chỗ khác để viền ô ở trạng thái nghỉ. Mutant M6 bị bắt |
| F-UX3A-03 44px với con trỏ thô | **Đã đóng** | `obs-css.txt`: project desktop, context riêng có `hasTouch` (con trỏ thô, không hover) ở 768, 1024 và 1280: 4 điều khiển trên thanh, nhỏ nhất 44px, nút danh tính 232.92x44; 42 điều khiển trên trang, cái duy nhất dưới 44px là input công tắc (44x24) được nhãn 137.9x44 phủ; menu tài khoản 5 điều khiển, không cái nào dưới 44px. Con trỏ mịn ở 767 và 390: điều khiển trên thanh 44px. Mutant M7 bị bắt |
| F-UX3A-04 khoảng cách và căn chỉnh của Sign out | **Đã đóng** như đã nêu (khoảng cách và căn chỉnh dọc) | `obs-css.txt`: Sign out là `display: flex`, khoảng cách 12.0px và tâm biểu tượng cách tâm chữ 0.88px, bằng Profile, Settings và Import, menu 1280 và More 390, sáng và tối. Mutant M8 bị bắt. Điểm bắt đầu theo chiều ngang lệch 3px: lỗi 03 |
| F-UX3A-05 Escape của bảng More chưa có test | **Đã đóng** | `shell.spec.ts:754-770` khẳng định điều này; mutant M11 (A4: `AppShell.tsx:161` thay bằng `void 0;`) làm hỏng 4 test (`shell.spec.ts:713`, employee và admin, cả hai project, `toBeFocused`), 71 đạt; target đạt các test đó ở cả hai lần chạy đầy đủ |
| F-UX3A-06 Administration trên điện thoại | **Đã đóng** | `obs-admin.txt`: trạng thái gửi dài "Delivery recorded as uncertain" và `lease_expired_while_sending` (seed bằng SQL của test trong repository từ một file trong thư mục task, quyết định `mark_delivered` qua API), project desktop và mobile, sáng và tối: wrapper client/scroll 326/326 ở 390 và 256/256 ở 320, trang không rộng hơn cửa sổ, 0 phần của hàng vượt ra ngoài thẻ, axe-core 4.14.0 (tag WCAG 2.0-2.2 A/AA) 0 vi phạm ở cả hai độ rộng và hai giao diện (8 lần quét); nhãn 2 dòng, mã 2 dòng. Mutant M9 (bỏ ngắt dòng của nhãn: cuộn 348 so với 326) và M10 (bỏ ngắt dòng của mã: 359 so với 326) bị `admin-status.spec.ts:243` bắt trên cả hai project |

## Hồi quy từ diff của FIX3 (khu vực A)

Cơ sở: `git diff 7ce4e95..a78ada5 -- src tests docs` là toàn bộ thay đổi; trong khu vực A nó chạm `styles.css` (mười một nhóm
quy tắc liệt kê trong `notes-extra.txt`), docs/04 dòng 46 (EN và VI) và bốn spec e2e; `a78ada5..ceb86b6` chỉ đổi cặp AGENTS,
trong đó mục "Frontend and UI/UX standards" không đổi.

- Dáng trên thiết bị có thể hover (`obs-contrast.txt`, `obs-ring.txt`): các dáng hover mà FIX3 chuyển vào `(hover: hover)` vẫn
  như cũ ở đó: viền ô nhập lúc nghỉ 1.22 (sáng) và 1.66 (tối), khi hover 5.10 và 7.53; liên kết dạng nút bước nền 1.08 (sáng)
  và 1.11 (tối) cộng vòng `--elev-1`, viền nhấn 6.09 và 6.79, chữ trên nền hover 5.63 và 6.14 (như trước FIX3; xem rủi ro
  R-A2-3); bộ chọn Category bước nền 1.12 với đường `--accent-line` 1px (1.98 so với nền, không đổi từ vòng 2); hàng bảng
  (History) 1.08. Nút secondary để đối chiếu 1.23 với viền 6.09 và chữ 6.52. Độ ưu tiên của mọi cặp tiêu điểm và hover:
  `notes-extra.txt` mục 2; không quy tắc hover nào còn đè lên vòng tiêu điểm.
- Đi bằng bàn phím với con trỏ ở xa và nằm trên mỗi điểm dừng (`obs-walk.txt`, sáng và tối, hai lần chạy): Timesheet 1440 42
  điểm dừng, menu tài khoản 3 điểm dừng sau mục đầu (nó đóng ở lần Tab qua Sign out), Settings 49 điểm dừng, Timesheet điện
  thoại ở 390 trên thiết bị có hover 42 điểm dừng, bảng More 13 điểm dừng: vòng được tô ở mọi điểm dừng theo cả hai cách
  (thấp nhất 4.68). Các điểm dừng bị đánh dấu chỉ là nút chọn bên trong ô ngày và ô giờ (`:focus-visible` sai, vòng được vẽ
  qua `:focus-within` như thiết kế, WP5-UX-B5 R-12). Lần đi qua More tìm ra lỗi 01.
- Cảm ứng: các lần chạm ở trên; kích thước với con trỏ thô ở trên; Administration trên điện thoại ở trên.
- Mọi thứ FIX3 không đụng tới giữ kết luận của lần đầu (độ trung thành với chủ U-01..U-20, U-27 và các điều kiện G; hệ thống
  style; khung ứng dụng và Settings trừ lỗi 01 và 03; thanh kỳ; hình học của bảng; panel editor; axe), dựa trên diff ở trên;
  e2e đầy đủ với đồng hồ thật và các probe của tôi không thấy thay đổi nào ở chúng.

## Độ mạnh của test

| Id | Mutant (bản xuất nháp, áp dụng riêng) | Spec e2e đã chạy (cả hai project) | Kết quả |
|---|---|---|---|
| M1 | bỏ quy tắc tiêu điểm-và-hover của nút ngày (`styles.css:2667`) | `hover` | bị bắt: `hover.spec.ts:673` desktop, sáng và tối ("date button ... the ring under the pointer equals the ring with the pointer away") |
| M2 | bỏ quy tắc tiêu điểm-và-hover của bộ chọn Category (`:4360`) | `hover` | bị bắt: cùng test, "Category picker" |
| M3 | bỏ quy tắc tiêu điểm-và-hover của nút ngày trên điện thoại (`:3051`) | `hover` | bị bắt: cùng test, "phone day button" |
| M4 | bỏ quy tắc tiêu điểm-và-hover của liên kết dạng nút (`:4584`) | `hover`, `focus-ring`, `surfaces`, `keyboard-access`, `review`, `today` | **sống sót**: 199 đạt (lỗi 02) |
| M5 | bỏ quy tắc tiêu điểm-và-hover của tab điện thoại (`:795`) | `hover`, `focus-ring`, `shell`, `keyboard-access`, `theme` | **sống sót**: 272 đạt (lỗi 02) |
| M6 | đưa `tbody tr:hover` ra khỏi `@media (hover: hover)` | `hover` | bị bắt: `hover.spec.ts:577` cả hai project ("hover rules outside (hover: hover)") |
| M6b | chặn `tbody tr:hover` bằng `(hover: hover), (pointer: coarse)` (áp dụng trên màn hình cảm ứng) | `hover` | **sống sót**: 68 đạt (chặn theo văn bản của phép quét, rủi ro R-A2-1) |
| M7 | bỏ quy tắc chiều cao của nút danh tính với con trỏ thô (`:676-680`) | `shell` | bị bắt: `shell.spec.ts:1049` cả hai project |
| M8 | bỏ `display: flex; align-items: center` của Sign out (`:896-897`) | `shell` | bị bắt: `shell.spec.ts:1077`, 4 test ("Sign out: the icon gap is 12px") |
| M9 | bỏ ngắt dòng của nhãn trên điện thoại (`:4986-4989`) | `admin-status` | bị bắt: `admin-status.spec.ts:243` cả hai project (wrapper 348 so với 326) |
| M10 | bỏ ngắt dòng của mã lỗi trên điện thoại (`:4991-4993`) | `admin-status` | bị bắt: cùng test (359 so với 326) |
| M11 | A4: `AppShell.tsx:161` `moreButton.current?.focus();` thay bằng `void 0;` | `shell` | bị bắt: `shell.spec.ts:713`, 4 test (F-UX3A-05) |
| M12 | phân đoạn theme không bao giờ ổn định: `.theme-option { transition-duration: 60s !important; transition-timing-function: linear !important }` | `theme -g "contrast of the checked"` | bị bắt: 8 trên 8 hỏng sau 25.3-27.8 giây, "the computed boxShadow is settled", "Timeout 7000ms exceeded while waiting on the predicate" (ba lần thử của wrapper, rồi lỗi) |

- Phép quét hover trên toàn stylesheet (`hover.spec.ts:577-624`) đúng và không rỗng: nó đọc các sheet đã phân tích của trình
  duyệt, đi vào media rule và grouping rule, thất bại với mọi selector `:hover` không được chặn, giữ allowlist rỗng kèm quy tắc
  rõ cho mục được thêm, và còn đòi hơn 20 quy tắc đã chặn cộng bảy quy tắc có tên, nên một sheet rỗng hay không đọc được sẽ
  thất bại (M6 bị bắt). Giới hạn của nó là chặn theo văn bản: một quy tắc dưới `(hover: hover), (pointer: coarse)`, `not all
  and (hover: hover)` hay `(any-hover: hover)` được tính là đã chặn dù nó có thể áp dụng trên màn hình cảm ứng (M6b sống sót),
  và CSS lồng bên trong một style rule không được duyệt (hôm nay sheet không có). Rủi ro R-A2-1.
- `surviveStall` (`theme.spec.ts:77-86`) chỉ thử lại các lần hết giờ của chính poll của nó trong test này (thông báo "the
  computed ... is settled" và "Timeout 7000ms exceeded while waiting on the predicate"; `toBeFocused` và hết giờ của test không
  khớp; mỗi phép đo được bọc chạy lại từ đầu của chính nó), tối đa hai lần, rồi ném lỗi lại; mọi khẳng định không đổi. Một lỗi
  ổn định thật của sản phẩm vẫn làm test hỏng (M12). Cái giá là một trạng thái chỉ ổn định sau 7 đến khoảng
  21 giây nay sẽ đạt (test chạy với giảm chuyển động, khi đó transition của sản phẩm là 0.01 ms). Chấp nhận.

## Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

- R1 (lần đầu): **đóng bằng tài liệu.** docs/04 dòng 46 nay nói rõ 4.82:1 đúng khi editor nằm cạnh bảng từ 1360px, còn qua lớp
  nền bên dưới 1360px khung đo được 4.14:1 (sáng) và 2.79 đến 3.27:1 (tối); EN và VI mang cùng các con số. FIX3 không đổi khung
  hay lớp nền (diff), nên các con số của lần đầu vẫn đúng.
- R3: **không đổi.** Giao diện tối ở DPR 2: 8.4-9.5/255 trong hàng viền rộng một điểm ảnh thiết bị tại mỗi chỗ nối bên trong
  (`obs-seam.txt`); không thấy được ở kích thước thường (`a2-seam-dpr2-join1-zoom6-1367-dark-synthetic.png`).
- R5: không đổi (AppShell không đổi): một màn hình tải khi cần chậm hơn 5 giây để tiêu điểm ở body sau một mục.
- R7: không đổi: More giữ tiêu điểm trên chính nó khi mở bằng bàn phím (menu desktop chuyển tới mục đầu). Lỗi 01 là một lỗi
  riêng của cùng bảng này.
- R8: **đóng** nhờ ngân sách 120 giây và `surviveStall` (đã đánh giá ở trên).
- Quan sát 2 của REGATE2 (màn hình đầu ở trạng thái rời thấp hơn 2.2px): **rủi ro, không phải lỗi.** Probe của tôi
  (`obs-phone.txt`, mobile, 390x844): lúc vào trang đáy hàng đầu ở 559.5 (658.4 khi có ghi chú múi giờ), kỳ sau 561.7 (660.6),
  kỳ trước 583.0 (682.0): thanh của kỳ "old" cao hơn. Thanh tab ở 788, nên khoảng trống là 106 đến 228.5px; `today.spec.ts:465`
  khẳng định ngân sách của trạng thái rời. Các con số ở docs/04 dòng 49 là trạng thái lúc vào trang; tùy chọn: nêu thêm biến
  thiên của trạng thái rời ở đó.
- Quan sát 3 của REGATE2 (docs/10 dòng 240 "main chunk 487 kB in the build after WP5-UX3-FIX2"): **rủi ro, không phải lỗi.**
  Câu đó là bản ghi có ngày của quyết định tách mã; 486.81 kB của bản dựng FIX3 vẫn làm tròn thành 487 kB và dưới ngưỡng cảnh
  báo 500 kB, nên không có gì sai trong đó. Tùy chọn: cập nhật nhãn.
- R-A2-1: chặn hover theo văn bản của phép quét (ở trên).
- R-A2-2: mã lỗi trên điện thoại `lease_expired_while_sending` nay bị ngắt giữa định danh ở 390 và 320
  (`a2-admin-submissions-320-light-synthetic.png`); nó sẽ vừa trọn trên một hàng riêng (khoảng 189px so với 326 và 256). Ở 320
  khoảng ngày của kỳ cũng ngắt bên trong ngày "2026-10-25" tại dấu gạch nối (có từ trước). Tùy chọn: cho `.ops-code` cả hàng
  trên điện thoại.
- R-A2-3: liên kết dạng nút khi hover dùng `--off` và `--elev-1` (bước nền 1.08 sáng, 1.11 tối) thay cho nền `--hover-fill`
  mà docs/04 dòng 92 nêu cho các nút; liên kết "Review & sign off" ở chân trang chữ ký không có đường biên lúc nghỉ lẫn dưới
  con trỏ. Không đổi từ WP2-T11 và WP5-UX-T02; docs/04 dòng 92 không liệt kê liên kết dạng nút, nên không phải lỗi của vòng này.
- R-A2-4: lần chạy e2e ĐẦY ĐỦ thứ 1 hỏng một lần với `read ECONNRESET` ở một yêu cầu của `automation.spec.ts:268` tới server
  riêng của nó khi có tải song song (kiểm định khu vực B và các probe của tôi); test đạt 10 trên 10 khi chạy riêng và trên cả hai project trong lần chạy 2.
  Một lần chập chờn mạng ở mức harness, ngoài khu vực A.

## Các gate bắt buộc chưa chạy hoặc bị chặn

- Engine trình duyệt thứ hai (máy không cài cái nào), như lần đầu: NOT VERIFIED cho phần hiển thị riêng của engine.
- Mọi kiểm tra brief liệt kê đều đã chạy.

## Xử lý các lỗi trước

- F-UX3A-01, 02, 03, 05, 06: đã đóng. F-UX3A-04: đã đóng như đã nêu; phần lệch ngang còn lại là lỗi 03.
- Rủi ro của lần đầu: R1 đóng bằng tài liệu, R8 đóng, R3, R5, R7 không đổi; R2, R4, R6, R9 không kiểm lại ở đây (đối tượng của
  chúng không đổi).

## Mức sẵn sàng của phần mềm, sự cho phép của chủ và pilot

Khu vực A của vòng 3 chưa được chấp nhận trên ceb86b6 cho tới khi lỗi 01-03 được sửa, đóng băng, regate và kiểm lại. Không có
việc gửi thật, triển khai hay hoạt động pilot nào bị đụng tới; sự cho phép pilot của chủ không bị ảnh hưởng và vẫn đang chờ.

## Một bước tiếp theo

Một task sửa có giới hạn cho lỗi 01-03: đóng bảng More của điện thoại khi tiêu điểm rời thanh tab (kèm e2e trên cả hai
project), thêm một liên kết dạng nút và một tab điện thoại vào test vòng-dưới-con-trỏ, căn điểm bắt đầu ngang của mục Sign out
(kèm khẳng định); rồi đóng băng, regate và một lần kiểm lại khu vực A mới trên digest mới.

## Nguồn gốc subagent độc lập

- Task/lần review, reviewer và tác giả được review: WP5-UX3-AUDIT-A2 lần 1, timesheet-auditor (context mới,
  `claude-opus-5-5`, agent trên board `a8b394d336bd441d1`); tác giả của các thay đổi được review là các worker, planner và
  committer của WP5-UX3 trên board (FIX3 `a61d450ff073015d9`, GOV2 `af5bf8a7f6d5d5e58`), không ai trong số đó là reviewer này.
- Context mới; reviewer không viết thay đổi nào trong snapshot và không sửa file source, docs, test, board hay STATE nào; chỉ
  viết cặp này, phần Results của brief và thư mục bằng chứng.
- Digest trước và sau: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 file) ở ba dạng cả hai lần; bằng
  chứng gate cho snapshot này: WP5-UX3-REGATE2 (lần 2).
- Đường dẫn báo cáo mới, giữ lịch sử review trước: `handoff/delivery/WP5_UX3_REVIEW_A2.md` (review khu vực A đầu tiên
  `WP5_UX3_REVIEW_A.md` không đổi).
- Sơ suất (không ảnh hưởng kết quả nào): một lệnh hiển thị chỉ đọc có pipe vào `tail -c` (khoảng 22:11Z) và một lệnh chuyển
  hướng tới `/dev/stderr` (khoảng 23:00Z), trái với quy tắc của brief; `head` và `tail` cũng được chạy trực tiếp trên vài file
  trong thư mục task (không qua pipe). Không có gì được đưa vào python hay node qua stdin, không heredoc, không xóa đệ quy,
  không dừng tiến trình nào. Harness của repository khởi động mỗi server trên một cổng loopback do hệ điều hành cấp, như các
  lần kiểm định trước; tôi không đặt cổng nào ngoài 49080-49109. npm chạy các script của nó qua shell mặc định của nó.
