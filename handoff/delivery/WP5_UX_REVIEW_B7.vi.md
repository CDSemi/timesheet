# Thiết kế lại UI của WP5, kiểm lại độc lập phần thay đổi của vùng B (B7) — sửa B6-01, thanh shell gọn trên điện thoại, độ mạnh của test và các kiểm tra bắt buộc

Bản dịch của [WP5_UX_REVIEW_B7.md](WP5_UX_REVIEW_B7.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng thay đổi UI theo yêu cầu của chủ trong WP5, task
  WP5-UX-AUDIT-B7, attempt 2, 2026-10-13 (UTC 18:56Z đến khoảng 19:45Z). Attempt 1 (2026-10-09) dừng vì hết hạn mức sử dụng và
  không để lại bản ghi nào; tôi bỏ qua thư mục task của nó. Reviewer tự báo model `claude-opus-5-5`, profile timesheet-auditor
  (effort do profile đặt, không quan sát được từ bên trong). Vùng A được kiểm lại riêng (WP5-UX-AUDIT-A7) và không nằm trong báo
  cáo này. Các review vùng B trước, từ [B](WP5_UX_REVIEW_B.vi.md) đến [B6](WP5_UX_REVIEW_B6.vi.md), được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `255ba17d6bf891c0ff779d4a4f518e0d2998cee8` (bản freeze của WP5-UX-REGATE6). HEAD = origin/main = 255ba17 trước và sau; không có
  commit nào sau đó, nên không gì ngoài `handoff/` khác đi. Digest `b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe`,
  793 file, không tính `handoff/`. Tôi ghi digest đầu tiên (18:57:10Z, ngay sau `node --version`) và ghi lại sau mọi kiểm tra
  (19:36:18Z). Ba dạng bằng nhau: `git ls-tree` ở 255ba17 và ở HEAD, `scripts/source-digest.mjs` trong repository, và cùng script đó
  trong một scratch clone ở 255ba17. Source đủ: scratch clone sạch, `npm ci` exit 0.
- **Quyết định: FIX REQUIRED.**
  - Phần thay đổi đúng như FIX8 nói: CSS cho thanh trên điện thoại và hai test e2e mobile mới. Không dòng test nào bị bỏ hay làm
    yếu. Các test mới fail trên bf954c0 đúng vì lỗi của chúng.
  - **B6-01 đã đóng.** Ở 390x844, trong cả bốn trạng thái, giao diện sáng và tối, hàng ngày đầu tiên kết thúc phía trên thanh tab.
  - Mọi mục vùng B mà thay đổi thanh có thể ảnh hưởng đều đạt ở 767, 390 và 320, sáng và tối, có và không có chia sẻ nhận được.
    Không gì thay đổi từ 768px trở lên.
  - Typecheck, lint và `npm test` đạt (82 file, 1823 test). **E2e đầy đủ không đạt:** 204 đạt, 6 lỗi, 26 bỏ qua. Sáu lỗi là một
    lỗi test có từ trước FIX8: **WP5-UX-B7-01** (Low). Ba test lấy "một ngày làm việc trống đã qua" từ kỳ đang diễn ra. Vào ngày thứ
    Ba đến hạn của mỗi kỳ, trước 17:00 America/Los_Angeles, app không hiện kỳ đó đầu tiên, nên các test fail trước khi tới các
    assertion cô lập AC-01 của chúng.
    - Tái hiện: ở 255ba17 và ở bf954c0.
    - Chứng minh: các bản sao scratch lấy ngày từ kỳ đang hiện đạt 6/6 trong cùng khung giờ.
  - Một kiểm tra bắt buộc bị lỗi thì không thể đạt, và gate phụ thuộc vào ngày trên lịch (AGENTS.md quy tắc 5, docs/06 dòng 30).
    Vì vậy lỗi này chặn.
  - Không thấy lỗi chặn nào khác. Chữ bị cắt trong ô chọn (một quan sát của gate) là thoái lui không chặn, R-B7-1.

## Phạm vi thật đã xem/chạy

1. **Chứng minh phạm vi thay đổi:** `git diff bf954c0..255ba17` ngoài `handoff/` (`10-…`). Tôi chạy hai test mới trên bản build
   bf954c0 qua một bản sao scratch của spec ở 255ba17 trong một bản base (`30-…`).
2. **Các probe Playwright của chính tôi** (`b7.probe.ts.txt`). Chúng chạy trên server tôi tự build ở cổng 48420-48423, với tài khoản
   tổng hợp, hai người chia sẻ ("Synthetic Sharing Owner" chỉ xem, "Synthetic Sharing Partner" được sửa), một người nhận và một
   người không có chia sẻ. Chúng chạy trên cả hai snapshot ở mọi chỗ cần so sánh.
   - P1: màn hình đầu, bốn trạng thái, sáng và tối, ở 390x844, thêm 375/360/320 để tham khảo.
   - P2: các mục của bộ chuyển, mỗi bề rộng và mỗi bước một trang mới.
   - P2t: Open bằng chạm và bằng chuột.
   - P2s: bộ chuyển trong màn hình chia sẻ.
   - P3: đi Tab và Shift+Tab, kiểm bị che bằng lưới 5x5 và kiểm vòng focus.
   - P3b: vòng focus như được render.
   - P4: style tính toán của mọi phần tử và ảnh thanh shell từ 768px trở lên.
   - P5: quét bề rộng 300-420.
   - P6: 320x256.
   - P7: kiểm bộ phát hiện cuộn ngang của e2e.
3. **Mã và tài liệu:** `styles.css` (thanh shell, quy tắc chạm, bộ chuyển), `SharingSwitcher.tsx`, `AppShell.tsx` và
   `useBlockSize.ts`. docs/04 dòng 7, 14, 48 và 80 (EN/VI), mục C của WP5-UX-PLAN và chú thích mockup A2, và docs/06.
4. **Các kiểm tra bắt buộc ở 255ba17:** typecheck, lint, `npm test` và e2e đầy đủ trên cả hai project, tất cả có bật truy vết
   deprecation.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-B7/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng (trước / sau) | `b07727b2…4a95abe`, 793 file, đều bằng nhau; HEAD = origin/main = 255ba17 | `00-…`, `00b-…`, `90-…` |
| `npm ci` / `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / 0 / 0; không dòng deprecation nào | `02a-…` đến `02c-…` |
| `npm test` (truy vết deprecation) | exit 0; 82 file, 1823 test | `03-…` |
| `npm run test:e2e` (build + cả bộ, Edge, cả hai project, truy vết deprecation), 19:01-19:07Z | **exit 1: 204 đạt, 6 lỗi, 26 bỏ qua** (desktop 100/3/15, mobile 104/3/11). Các lỗi: `shell.spec.ts:67`, `isolation.spec.ts:94`, `isolation.spec.ts:145` trên cả hai project, đều vì không tìm thấy `[data-day="2026-10-12"]`. `automation.spec.ts:118` đạt trên cả hai project (không ECONNRESET); hai test mới của FIX8 đạt (mobile) | `04-…`, `04a-…` |
| Chạy lại 6 test lỗi ở 255ba17, rồi trên bản build bf954c0 | 6 lỗi / 6 lỗi, cùng locator: có từ trước, không do FIX8 | `04b-…`, `04c-…` |
| Bối cảnh lỗi | kỳ đang hiện 09/28-10/11/2026, "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)"; ngày được tạo 2026-10-12 thuộc kỳ đang diễn ra | `04d-…` |
| Các bản sao scratch dùng `displayedPeriodFreeWorkdays()` (mỗi file một dòng) ở 255ba17, cùng khung giờ | **6 đạt**, exit 0 | `04e-…`, `04f-…` |
| `git diff --stat/--numstat bf954c0..255ba17` ngoài `handoff/` | `src/client/styles.css` +25/-0, `tests/e2e/sharing.spec.ts` +51/-0; một commit; 0 dòng test bị bỏ | `10-…` đến `10d-…` |
| Test mới của FIX8 trên bản build bf954c0 | 2 lỗi (mobile), mỗi test đúng vì lỗi của nó: đáy hàng đầu 812,8 > 788,5; thanh shell 106,8 > 60; 2 bỏ qua (desktop, theo điều kiện project) | `30-…` |
| P1 màn hình đầu, 390x844, sáng và tối | cả bốn trạng thái hiện đầy đủ (bảng dưới); bf954c0: có chia sẻ + ghi chú 812,8 > 788 | `50-…`, `50b-…`, ảnh chụp |
| P2/P2t/P2s bộ chuyển ở 767 (cả hai project), 640 (desktop = 1280 ở 200%), 390/375/360/320, sáng và tối | nhãn hiển thị, tên, AX-06, vùng chạm, tương phản, phóng to và reflow đều đạt (bảng dưới); giá trị ô chọn bị cắt (R-B7-1) | `51-…` đến `51f-…` |
| P3 đi phím: desktop 767; mobile 767/390/320; sáng và tối; Timesheet, trình sửa ngày, màn hình chia sẻ chỉ xem và được sửa; có và không có chia sẻ | **128 lượt đi, 2928 điểm dừng: 0 bị che hoàn toàn, 0 bị một thanh che một phần, tối thiểu 25/25 điểm mẫu hiện, 0 thiếu vòng focus, 0 vòng không còn cạnh nào hiện, 0 điểm dừng ra ngoài trình sửa dạng modal**; Escape đóng trình sửa và trả focus về nút ngày | `52-…`, `52b-…` |
| P3b vòng focus được render trên ô chọn và Open của bộ chuyển (màn hình của mình và màn hình chia sẻ) | 4 cạnh ở mọi bề rộng: 6,09:1 sáng, 6,79:1 tối | `52c-…` |
| P4 768/1024/1280 (desktop) và 768x1024 (mobile), sáng và tối, có và không có chia sẻ, bf954c0 so với 255ba17 | 24 trạng thái, 8696 lần so phần tử, **0 khác biệt** giá trị tính toán; `--shell-bar-size` và `scroll-padding-top` bằng nhau; 24 ảnh thanh shell giống nhau từng byte | `53-…` |
| P5 quét 300-420 px (cả hai project) | một hàng từ 355 px (thanh 60), xuống dòng dưới đó (90,83); 0 cuộn ngang, 0 chồng lấn, vùng chạm 44, nhãn hiện ở cả 121 bề rộng | `54-…`, `54b-…` |
| P6 320x256 (1280x1024 ở 400%) | thanh 90,83 (bf954c0 106,83), không cuộn ngang, đi Tab 25/25 hiện ở mọi điểm dừng | `55-…` |
| P7 biểu thức cuộn ngang của e2e với một khối tràn 600 px ép thêm | project mobile: innerWidth tăng lên 616 = scrollWidth, nên `scrollWidth <= innerWidth` vẫn đạt; clientWidth giữ 390. Project desktop: bắt được (R-B7-2) | `56-…`, `56b-…` |
| Quét token CSS (255ba17 và bf954c0) | 0 giá trị màu hay thời lượng viết thẳng ngoài khối token, 0 `var()` chưa định nghĩa, 7/7 transition là `var(--transition)`, `--radius: 4px`; một bo góc ghép (`var(--radius) var(--radius) 0 0`, bottom sheet) có từ trước thay đổi | `20-…` |
| tài liệu | không có tài liệu nào trong phần thay đổi; docs/04 dòng 48 và dòng 80 EN/VI không đổi | `60-…` |

## Xử lý B6-01: đã đóng

Project mobile, 390x844, đăng nhập thật, 14 hàng ngày, giảm chuyển động. Mỗi ô ghi đáy của `[data-day]` đầu tiên, rồi khoảng cách
tới đỉnh thanh tab (788 px). Sáng và tối giống hệt nhau. scrollY là 0 và không có cuộn ngang.

| Trạng thái (390x844) | 255ba17 | Thanh shell | bf954c0 |
|---|---|---|---|
| Không có chia sẻ nhận được, ghi chú múi giờ hiện | 757,97 (+30,03) | 52 | 757,97 |
| Không có chia sẻ nhận được, ghi chú múi giờ ẩn | 659,02 (+128,98) | 52 | 659,02 |
| Có chia sẻ nhận được, ghi chú múi giờ hiện | **765,97 (+22,03)** | 60, một hàng | **812,80 (-24,80)**, thanh 106,83 |
| Có chia sẻ nhận được, ghi chú múi giờ ẩn | 667,02 (+120,98) | 60, một hàng | 713,84 |

`--shell-bar-size` đo được bằng chiều cao thanh ở mọi trạng thái (52 / 60 / 90,83 px). Số đo ở các bề rộng khác chỉ để tham khảo
(`50-…`):

| Kích thước | Không chia sẻ, có ghi chú | Có chia sẻ, có ghi chú | Có chia sẻ, không ghi chú |
|---|---|---|---|
| 375x812 | 775,36 so với 756 | 783,36 so với 756 | 667,02 so với 756 |
| 360x800 | 827,36 so với 744 | 852,75 so với 744 | 736,41 so với 744 |
| 320x640 (thanh 90,83 khi có chia sẻ) | 924,92 so với 584 | 963,75 so với 584 | 830,02 so với 584 |

## Các mục vùng B mà thay đổi thanh có thể ảnh hưởng (767, 390, 320; sáng và tối; có và không có chia sẻ nhận được)

| Mục | Kết quả |
|---|---|
| Nhãn hiển thị (SC 3.3.2) | "Shared with me" hiện ở mọi bề rộng (12 px, hai dòng), nằm trong khung nhìn và không bị che. Khi không có chia sẻ thì không có bộ chuyển và thanh cao 52 px |
| Tên chứa nhãn (SC 2.5.3) | ARIA snapshot `combobox "Shared with me"`; đúng một combobox có đúng tên đó; form `Shared with me`; nút `Open` |
| AX-06 (SC 3.2.2) | ArrowDown, ArrowDown, ArrowUp, End, Home, PageDown và ArrowDown trên ô chọn đổi giá trị và giữ `#/timesheet`. Không thanh chia sẻ nào hiện và không request nào ngoài GET được gửi. Tab tới Open, và Enter mở `#/shared/{owner}/timesheet` kèm thanh chia sẻ. Chạm (mobile) hoặc bấm chuột (desktop) vào Open cũng vậy trên trang mới. Nút chỉ dành cho chủ trong màn hình chia sẻ: 0 |
| Vùng chạm 44x44 | ô chọn ít nhất 90x44 (138x44 ở 390, 149x44 ở 320), Open 67x44, nhãn cao 44; 0 nút nào trên thanh dưới 44 ở 300-420 px |
| Tương phản của nhãn nhỏ hơn (SC 1.4.3) | chữ thường 12 px: 5,83:1 sáng (rgb 91,102,117 trên trắng), 6,56:1 tối; giá trị ô chọn 14,57 / 14,91 |
| Phóng to chữ (SC 1.4.4) | Phóng to trình duyệt 200% trên desktop cho 1280→640 và 767→384: thanh vẫn một hàng (60 px), không cuộn ngang và không chồng lấn. Chỉ phóng chữ 200% (gốc 30 px) ở 767 và 640: không cuộn ngang, nhãn 24 px hiện, thanh 85,6 / 139,3 px và `--shell-bar-size` theo đúng. Ở bề rộng điện thoại, chỉ phóng chữ 200% cần 456 px và Open đè lên mũi tên của ô chọn khoảng 8 px; điều này giống hệt ở bf954c0, nên có từ trước FIX8 (R-B7-4) |
| Reflow ở 320 (SC 1.4.10) | bề rộng layout = bề rộng trong = 320, tỉ lệ 1, không cuộn ngang, mọi phần tử của thanh nằm trong khung nhìn; 400% của 1280 (320x200) và 320x256: không cuộn ngang |
| Focus không bị che (SC 2.4.11) | 128 lượt đi, 2928 điểm dừng, 0 bị che hoàn toàn và 0 bị thanh shell, thanh tab, thanh chia sẻ hay đầu trình sửa che một phần |
| Vòng focus nhìn thấy | Mọi điểm dừng đều có vòng focus; ô ngày hiện vòng trên khung bao `:focus-within`, như B6 R-12 đã ghi. Ô chọn và Open: vòng render đủ 4 cạnh, 6,09 / 6,79 |
| Token, bo góc 4px, transition chung | quy tắc mới dùng `var(--space-3)`, `var(--switcher-basis)` (token mới 16rem trong `:root`), `var(--font-size-xs)` và `0`; ô chọn và Open bo góc 4 px và transition `var(--transition)`; quét sạch |
| Không đổi từ 768px trở lên | 0 giá trị tính toán khác nhau qua 8696 lần so phần tử; ảnh giống nhau từng byte |

## Đánh giá các quan sát của gate

- **Chữ trong ô chọn bị cắt.** Đây không phải lỗi WCAG 2.2 AA:
  - SC 1.4.10: ở 320 px không có gì cuộn theo hai chiều và không chức năng nào mất.
  - Mở ô chọn gốc sẽ liệt kê mọi tên đầy đủ, với tên đang chọn được đánh dấu.
  - Combobox cung cấp đầy đủ lựa chọn đang chọn làm giá trị, và các quan hệ được lập trình rõ (SC 1.3.1).
  - Sau khi Open, thanh chia sẻ nêu đủ tên người chia sẻ ("Viewing Synthetic Sharing Owner's timesheets - view only").
  - docs/04 chỉ hứa rằng thanh chia sẻ nêu tên người chia sẻ.

  Việc bị cắt vẫn có thể che mất người đang được chọn trước khi bấm Open. Các tên có chung phần đầu ("Synthetic Sharing Owner" và
  "Synthetic Sharing Partner") hiện cùng một chữ. FIX8 làm điều này tệ hơn ở 355-420 px (R-B7-1).
- **Màn hình đầu dưới 390.** docs/04 dòng 48 (EN và VI) chỉ hứa ngân sách "ở 390x844". Plan C ("hàng ngày đầu tiên hiện trong màn
  hình đầu") được nêu cho mockup A2 ở 390 px, và không gì hứa ở bề rộng nhỏ hơn. Ngay cả người không có chia sẻ nhận được cũng
  vượt ngân sách khi có ghi chú múi giờ ở 375x812 và 360x800, cả trước và sau FIX8. Vì vậy đây không phải lỗi.

## Độ mạnh của test

- FIX8 thêm 51 dòng và không bỏ dòng nào. Hai test bỏ qua trên project desktop theo điều kiện project và fail trên bf954c0 đúng vì
  lỗi của chúng. Chúng assert:
  - đáy hàng đầu so với đỉnh thanh tab (+0,5);
  - thanh một hàng (tối đa 60);
  - scrollY 0;
  - ô chọn và Open ít nhất 44x44 và nằm trong thanh;
  - nhãn hiển thị;
  - không cuộn ngang. Assertion cuối này rỗng trên project mobile (R-B7-2).
- **Không assertion nào bị bỏ hay làm yếu trong phần thay đổi.**

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-B7-01 | Low (chỉ test; chặn vì một kiểm tra bắt buộc lỗi) | `tests/e2e/shell.spec.ts:68` và `tests/e2e/isolation.spec.ts:52` (`seedOwner`, dùng bởi `:94` và `:145`) lấy ngày từ `pastFreeWorkdays()` (`tests/e2e/fixtures.ts:392-406`). Helper đó trả ngày từ cả `periods.in_progress` và `periods.current`, mới nhất trước. App hiện `periods.current` đầu tiên | Chạy `npm run test:e2e` vào thứ Ba đến hạn của bất kỳ kỳ nào, từ 00:00 đến 17:00 America/Los_Angeles (ở đây 2026-10-13, 19:01Z). Helper trả về thứ Hai 2026-10-12 của kỳ đang diễn ra, trong khi trang hiện 09/28-10/11 (hạn thứ Ba 10/13 17:00). `[data-day="2026-10-12"]` không bao giờ được tìm thấy. Cùng 6 test đó lỗi trên bản build bf954c0 (`04b-…`, `04c-…`, `04d-…`) | Kỳ vọng: bộ test trình duyệt bắt buộc đạt vào mọi ngày, và các luồng cô lập AC-01 (đổi hash, đổi id, các màn hình admin) luôn chạy. Thực tế: 6 lỗi trên cả hai project trong khoảng 17 giờ của mỗi kỳ 14 ngày, trước khi bất kỳ assertion cô lập nào chạy | AGENTS.md quy tắc 5 (theo gate nghiệm thu bắt buộc; e2e đầy đủ là kiểm tra bắt buộc của audit này); docs/06 dòng 30 (đồng hồ xác định); bằng chứng AC-01 của docs/06 | Tạo dữ liệu từ kỳ app hiện đầu tiên. Ví dụ, gọi `displayedPeriodFreeWorkdays()` ở cả hai chỗ gọi: các bản sao scratch của tôi với đúng thay đổi một dòng đó đạt 6/6 trong khung giờ lỗi (`04e-…`, `04f-…`). Hoặc chuyển trang tới kỳ chứa ngày đã chọn. Giữ mọi assertion cô lập. Cân nhắc trường hợp biên khi kỳ đang hiện không có ngày làm việc thường nào đã qua (thứ Hai là ngày lễ, sau giờ hạn) |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-B7-1 giá trị ô chọn bị cắt (thoái lui do FIX8, không chặn).** Thanh một hàng làm ô chọn hẹp lại ở 355-420 px: phần nội dung
  120 px ở 390 thay vì 185, 107 ở 375 thay vì 171, 94 ở 360 thay vì 158.
  - "My timesheets" giờ bị cắt ở 355-385 px ("My timeshe" ở 360, "My timesheet" ở 375). Ở bf954c0 nó chỉ bị cắt ở 300-313.
  - Một tên người chia sẻ khoảng 160 px bị cắt ở mọi bề rộng 300-420. Ở bf954c0 tên đó vừa từ 388 px; ở 390 màn hình giờ hiện
    "Synthetic Sharin" trong khi bf954c0 hiện "Synthetic Sharing Owner" (`51e-…`, `51f-…`, ảnh chụp).
  - Cách sửa tùy chọn:
    - cho bộ chuyển xuống dòng dưới tên thương hiệu khi ô chọn sẽ còn ít hơn khoảng 10rem. Ngân sách màn hình đầu chỉ được hứa ở
      390x844, và nơi đó vẫn vừa một hàng chỉ khi ô chọn còn đủ chỗ;
    - hoặc rút gọn chữ nhãn hiển thị;
    - hoặc hiện tên người đang chọn cạnh Open.
- **R-B7-2 các kiểm tra cuộn ngang của e2e rỗng trên project mobile.** `expectNoSidewaysScroll` (`sharing.spec.ts:172-177`, cũng
  được hai test mới dùng) và cùng biểu thức đó trong 10 file spec khác so `scrollWidth` với `window.innerWidth`. Dưới giả lập
  `isMobile`, trang rộng hơn thiết bị sẽ thu nhỏ lại, nên innerWidth tăng theo nội dung: một khối 600 px ép thêm cho 616 = 616 và
  kiểm tra vẫn đạt (P7). `timesheet.spec.ts:57` và `:181` dùng `clientWidth`, cách này bắt được. Probe của tôi không thấy tràn ở bề
  rộng điện thoại khi đo bằng `clientWidth`, nên đây không phải lỗi sản phẩm. Đề xuất: so với `document.documentElement.clientWidth`.
- **R-B7-3 nhãn xuống thành hai dòng ở mọi bề rộng dưới 768 px**, kể cả ở 767 nơi hộp nhãn rộng 577 px, vì ô chọn giãn trước. Ở
  bf954c0 nhãn cũng xuống dòng, ở cỡ 15 px. Chỉ là thẩm mỹ.
- **R-B7-4 chỉ phóng chữ 200% ở bề rộng điện thoại (có từ trước).** Hàng bộ chuyển cần 456 px, nên trang cuộn ngang. Open đè lên
  cạnh phải của ô chọn (mũi tên của nó) khoảng 8 px. Cả hai giống hệt ở bf954c0, nơi thanh còn cao hơn (216 px so với 174). Phóng
  to trình duyệt trên desktop (kỹ thuật G142) không có hiện tượng nào trong hai. Tùy chọn.
- **Chuyển tiếp từ B6 (không đánh giá lại ngoài phần thay đổi):** R-10, R-11, R-13, R-14, R-16 đến R-20.
- **Thông tin:** `npm ci` báo 1 cảnh báo mức high, các review trước đã truy tới một dependency dev; tôi không kiểm lại ở đây.

## Gate chưa chạy hoặc bị chặn, và lý do

Không có gate nào chưa chạy. E2e đầy đủ chạy một lần trên cả hai project; nó chỉ lỗi vì WP5-UX-B7-01, lỗi tôi đã tái hiện trên cả hai
snapshot và truy ra nguyên nhân. Tôi không chạy lại cả bộ sau 17:00 America/Los_Angeles. Lần chạy scratch trong `04e-…` đã cho thấy
sáu test đạt trong cùng khung giờ khi ngày tạo dữ liệu được lấy từ kỳ đang hiện. Vùng A nằm ngoài review này.

## Xử lý các phát hiện trước

- WP5-UX-B6-01 **đã đóng** (bảng trên).
- Các rủi ro B6 R-10, R-11, R-13, R-14 và R-16 đến R-20 nằm ngoài phần thay đổi và không đổi.
- R-B7-1 đến R-B7-4 là mới và tùy chọn.
- WP5-UX-B7-01 là mới và còn mở.

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

- **Sẵn sàng phần mềm, vùng B:** chưa, chỉ vì WP5-UX-B7-01, một lỗi Low chỉ ở test. Hành vi sản phẩm trong phần thay đổi đều đạt.
- **Phép của chủ:** không xin và không được cho. Không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot nào.

## Một bước tiếp theo

Coordinator: mở một task sửa nhỏ chỉ trong test cho WP5-UX-B7-01. Nó đổi hai chỗ tạo dữ liệu, hoặc cho trang mở kỳ chứa ngày đã
tạo. Sau đó freeze, chạy gate có e2e đầy đủ, và kiểm lại vùng B giới hạn ở hai file spec cùng các kiểm tra bắt buộc. Có thể quyết
luôn R-B7-1 trong cùng vòng.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-B7, attempt 2.
  - Reviewer: tự báo `claude-opus-5-5` (một subagent mới; agent ID không thấy được từ bên trong).
  - Các tác giả được kiểm: WP5-UX-FIX8 (`claude-sonnet-5-5`); bản freeze của FIX8 và WP5-UX-REGATE6 (verifier và committer); các
    tác giả của vòng trước, mạnh nhất là `claude-opus-5-5`. Model của tôi không yếu hơn tác giả mạnh nhất.
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm và không chạy gate, bản
  sửa hay audit trước nào của vòng này. Tôi không sửa file source, test, tài liệu, board hay STATE nào.
  - Probe và các bản sao spec scratch của tôi chỉ nằm trong clone và bản base trong thư mục task, được loại ra bằng
    `.git/info/exclude`.
  - Ghi chú quy trình: một file liệt kê đầu tiên bị ghi cạnh thư mục task và được chuyển vào ngay. Hai phiên bản probe dùng lại một
    trang mobile qua các bước phóng to, làm hỏng thao tác chạm của Playwright; đây là lỗi của probe, và các trang mới cho thấy mọi
    thao tác chạm đều chạy. Một tên ảnh chụp của probe bị từ chối rồi được đổi tên. Chi tiết trong `00-README.txt`.
- **Digest trước/sau; bằng chứng gate cho snapshot đó:** `b07727b2…4a95abe` trước và sau, ba dạng (`00-…`, `90-…`); bằng digest ghi
  nhận của WP5-UX-REGATE6.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_B7.md` và `.vi.md`, đều là file mới; mọi review trước
  được giữ nguyên.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp của coordinator:** B6-01 đã đóng và WP5-UX-B7-01 còn mở. Tiếp theo: bản sửa chỉ trong
  test ở trên, rồi gate và kiểm lại vùng B.
