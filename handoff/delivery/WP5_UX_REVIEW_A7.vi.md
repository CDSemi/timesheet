# Review độc lập: thiết kế lại UI WP5, vùng A (kiểm lại delta sau WP5-UX-FIX8)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi giờ, đường sửa,
  chia sẻ, cô lập, riêng tư, PDF); 2026-10-13 (Los Angeles); task WP5-UX-AUDIT-A7 lần 2; model tự báo claude-opus-5-5,
  không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN, T02, T04, FIX5 và FIX7; delta
  WP5-UX-FIX8 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  255ba17d6bf891c0ff779d4a4f518e0d2998cee8, digest
  b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 file, không tính `handoff/`), ghi đầu tiên và
  ghi lại lúc kết thúc. HEAD = origin/main = 255ba17 (không có commit sau); không có gì ngoài `handoff/` khác đi. Bản
  export sạch bằng `git archive` của 255ba17 có đúng 793 đường dẫn và blob của cây (danh sách bằng nhau, diff exit 0)
  và không đổi sau mọi kiểm tra.
- Quyết định: **FIX REQUIRED** (một phát hiện, WP5-UX-A7-01, mức Low, chỉ nằm trong test và có từ trước FIX8). FIX8
  không đổi hành vi nào của vùng A, và mọi hành vi vùng A tôi đã kiểm trên 255ba17 đều đạt. Vùng A chưa được chấp nhận
  ở 255ba17 chỉ vì `isolation.spec.ts` bắt buộc lỗi trên mọi bản build trong một phần của mỗi kỳ lương, kể cả hôm nay.
- Phạm vi thật đã xem/chạy: (1) chứng minh delta `bf954c0..255ba17` (một commit; `src/client/styles.css` +25 và
  `tests/e2e/sharing.spec.ts` +51, 0 dòng xóa): đọc toàn bộ diff, diff CSS theo khai báo, bố cục tính toán của thanh
  shell, bộ chuyển và thanh chia sẻ ở tám độ rộng trên cả hai bản build, so sánh từng byte server, domain và client đã
  build, so sánh tĩnh chỗ gọi API, hàm dựng body và phép tính phía client, và các probe trình duyệt chạy cùng dữ liệu,
  cùng bước trên bản build 255ba17 và bf954c0 ở 390x844 và 320x640, mỗi kích thước với múi giờ đang xem bằng múi giờ
  báo cáo và với ghi chú múi giờ hiện: bộ chuyển "Shared with me" bằng bàn phím, chạm và chuột cùng AC-16 và cô lập, và
  một probe vùng dính kèm lượt đi bằng bàn phím, có và không có chia sẻ nhận được; (2) chạy lại vùng A trên export sạch
  của 255ba17 với các probe của A6 làm phương pháp: body so với bản build 014bd47 ở từng bố cục (panel bên, trình sửa
  modal, sheet điện thoại) và các đường chia sẻ trong Settings, A-01, AC-04, R-07 bằng probe đổi múi giờ thiết bị và giờ
  hạn trong ghi chú múi giờ, AC-16/AC-01, riêng tư, ranh giới từ 014bd47, `npm test`, bảy spec e2e được nêu trên cả hai
  project, AC-13 một lần, và kiểm tiếp lỗi isolation. Không lấy tóm tắt cũ nào làm bằng chứng.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A7/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của 255ba17, HEAD và origin/main, `npm run digest`, export sạch) và lúc kết thúc (băm lại export, ls-tree, `npm run digest`) | luôn là b07727b2, 793 file; export không đổi; repository không đổi ngoài `handoff/` | `00-digest.txt`, `00-digest-after.txt` |
| `npm ci` (Node v24.21.0, cache trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1823 test đạt (như ở bf954c0; FIX8 không thêm unit test) | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0; không log nào có dòng deprecation | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e sharing, isolation, day-editor, timesheet, review, submission, pdf-visual trên cả hai project (2026-10-13 19:01Z) | exit 1: 124 test, 103 đạt, 17 bỏ qua theo điều kiện project của spec, **4 lỗi** (`isolation.spec.ts:94` và `:145` trên desktop và mobile), 0 flaky. Mọi số đếm từng spec khác bằng của A6; sharing thêm 2 test mobile của FIX8 (bỏ qua trên desktop) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức high (`source-map-js`, chỉ dev) | `06-npm-audit.txt` |
| delta bf954c0..255ba17 và ranh giới từ 014bd47 | một commit, 2 đường dẫn, 76 dòng thêm, 0 dòng xóa (không xóa dòng nào ngoài `handoff/`); diff các đường dẫn cấm (server, domain, mọi file client `.ts`/`.tsx`, `api.ts`, `fixtures.ts`, `dayButton.ts`, unit và integration test, package, cấu hình, script, docs) rỗng; từ 014bd47 `src/server`, `src/domain`, `api.ts`, `fixtures.ts`, `pdf-visual.spec.ts` và các file package chỉ khác ở `src/domain/format.ts` (+13); danh sách 80 đường dẫn của vòng bằng danh sách ở bf954c0 | `10-delta.txt`, `10b-diff-fix8.txt` |
| kết quả build của 255ba17, bf954c0 và 014bd47 | `dist/server` giống nhau ở cả ba (180 file); `dist/domain` giống nhau ở 255ba17 và bf954c0 (46 file); JS client (482990 byte) bằng của bf954c0 trừ tên file source map của chính nó; chỉ asset CSS khác | `11b-dist.txt`, `11c-client-js-diff.txt` |
| diff CSS theo khai báo | bỏ 0, thêm 5: token `--switcher-basis: 16rem` và, dưới 768px, `.shell-bar` `column-gap: var(--space-3)`, `.shell-switcher` `flex: 1 1 var(--switcher-basis)`, `.shell-switcher label.inline` `padding-block: 0`, `.shell-switcher label .muted` `font-size: var(--font-size-xs)`; không đổi `display`, `visibility`, `opacity`, `pointer-events`, `z-index`, `overflow` hay `position` | `12a-css-rules.txt` |
| chỗ gọi; hàm dựng body; phép tính client | 82 chỗ gọi / 66 khóa endpoint ở bf954c0 và 255ba17, 0 chỗ gọi ghi đổi (so với 014bd47 chỗ gọi ghi thêm vẫn chỉ là preview một dòng của ô chọn nhãn và `PUT /sessions/:id` một chạm); 12/12 hàm dựng giống hệt bf954c0; quét phép tính trên 35 file client đổi từ 014bd47 (49 chỗ) trùng từng dòng với bf954c0 | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt` |
| probe của A6 trên 255ba17 (1280, 1024, 390) | body, A-01 nghỉ phép, AC-04, R-07 + ghi chú múi giờ, riêng tư, AC-16/AC-01: 18 đạt | `30-probe-255-main.txt`, `37-summary.txt` |
| mốc body 014bd47 (1280, 390) | 2 đạt | `33-probe-014-baseline.txt` |
| probe delta, bố cục tính toán (ngữ cảnh desktop 1280/1024/768/767, ngữ cảnh điện thoại 390/375/360/320) trên 255ba17 và bf954c0 | 2 + 2 đạt | `41-d255-css.txt`, `41-dbf9-css.txt` |
| probe delta, bộ chuyển bằng bàn phím, chạm và chuột (390x844 và 320x640, có và không có ghi chú múi giờ) trên 255ba17 và bf954c0 | 4 + 4 đạt | `42-d255-switcher.txt`, `42-dbf9-switcher.txt` |
| probe delta, vùng dính, lần thử chuột và chạm và lượt đi bằng bàn phím (390x844 và 320x640, có và không có ghi chú múi giờ, có và không có chia sẻ nhận được) trên 255ba17 và bf954c0 | 8 + 8 đạt; 255ba17: 936 phép kiểm focus, 312 lần thử chuột và 312 lần thử chạm, 592 điểm dừng Tab, 0 lần thử lỗi, 0 điểm dừng Tab bị che; 4 dòng ô ngày đã giải thích (bf954c0: 5) | `43-d255-sticky.txt`, `43-dbf9-sticky.txt` |
| kiểm tiếp isolation: các kỳ lúc này (probe chỉ đọc); `isolation.spec.ts` giữ nguyên của bf954c0; `shell.spec.ts` giữ nguyên của 255ba17; bản biến thể đổi ngày chọn của `isolation.spec.ts` do auditor tạo, chạy trên 255ba17; `isolation.spec.ts` giữ nguyên của 255ba17 chạy lại | hôm nay 2026-10-13, kỳ đang hiện 09/28-10/11, ngày chọn 2026-10-12 không hiện; bf954c0: exit 1, 2 đạt, 4 lỗi (đúng các test đó); shell: exit 1, 5 đạt, 2 lỗi (`:67` trên cả hai project); biến thể: exit 0, 6 đạt; 255ba17 chạy lại: exit 1, 2 đạt, 4 lỗi | `40-d255-periods.txt`, `04c-…`, `04e-…`, `04f-…`, `04g-isolation-variant-diff.txt`, `04d-…` |
| các đường chia sẻ trong Settings (cùng các bước import và số dư đầu kỳ) trên 255ba17 (1280, 1024, 390) và 014bd47 (1280, 390) | 3 + 2 đạt | `34-probe-255-settings.txt`, `34-probe-014-settings.txt` |
| so sánh (body và Settings so với 014bd47; bộ chuyển, vùng dính và bố cục tính toán so với bf954c0) | missing=0 mismatches=0, 338 dòng SAME; các dòng ô ngày được lượt đi bằng bàn phím giải thích; dưới 768px chỉ thuộc tính của FIX8 và hình học của chúng khác | `36-compare.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:
  **WP5-UX-A7-01 (Low; chỉ trong test; có từ trước FIX8): spec isolation bắt buộc lỗi trên mọi bản build trong bốn
  ngày của mỗi kỳ lương.**
  - Vị trí: `tests/e2e/isolation.spec.ts:51-53` (`seedOwner` lấy `employee.pastFreeWorkdays()[0]`) đối chiếu với các
    assertion chờ ngày đó nằm trong kỳ Timesheet đang hiện, `:105-108` (nhân viên thứ hai) và `:188-189` (admin);
    `tests/e2e/fixtures.ts:392-406` (`pastFreeWorkdays` liệt kê ngày của kỳ đang diễn ra trước). Cùng kiểu chọn ngày:
    `tests/e2e/shell.spec.ts:68` với `:75-77`.
  - Tái hiện: ngày 2026-10-13 lúc 19:01Z (12:01 ở Los Angeles) hôm nay theo múi giờ báo cáo là 2026-10-13; kỳ đang hiện
    ("current") là 09/28-10/11 (ngày trả lương 10/16, hạn 10/13 17:00), kỳ đang diễn ra là 10/12-10/25, và
    `pastFreeWorkdays()[0]` là 2026-10-12, không có trên trang (09/28-10/11) (`40-d255-periods.txt`,
    `periods7-255ba17.json.txt`). `isolation.spec.ts:94` dừng ở `:106` (không tìm thấy `[data-day="2026-10-12"]`) và
    `:145` ở `:188`, trên desktop và mobile (`04-e2e.txt`).
    Spec giữ nguyên của bản build bf954c0 lỗi đúng bốn test đó theo cùng cách lúc 19:23Z (`04c-…`), nên lỗi có từ trước
    FIX8; `shell.spec.ts:67` giữ nguyên của 255ba17 lỗi ở `:76` trên cả hai project vì cùng ngày đó (`04e-…`); spec của
    255ba17 lỗi lại lúc 19:24Z (`04d-…`). Bản sao spec của auditor với đúng một thay đổi về nội dung, ngày được chọn lấy
    từ `displayedPeriodFreeWorkdays()` (và đường dẫn import; mọi assertion giữ nguyên, `04g-isolation-variant-diff.txt`),
    đạt 6 trên 6 trên 255ba17 ở cả hai project (`04f-…`): không có lỗi cô lập nào nấp sau lỗi này.
  - Kỳ vọng/thực tế: kiểm tra isolation bắt buộc đạt bất cứ khi nào chạy. Thực tế: nó lỗi trên mọi bản build mỗi khi hôm
    nay theo múi giờ báo cáo nằm trong một kỳ mới sau ngày đầu của kỳ nhưng chưa qua ngày trả lương của kỳ trước, vì
    `currentPayPeriod` (`src/domain/periods.ts:149-164`) giữ kỳ trước trên màn hình tới ngày trả lương của nó: thứ Ba
    tới thứ Sáu của tuần đầu mỗi kỳ, 4 trong mỗi 14 ngày (lần này tới hết 2026-10-16 ở Los Angeles). Trong khoảng đó hai
    test dừng ở dòng ngày và không bao giờ tới các assertion cô lập. A6 (2026-10-10 03:10Z, ngày 10/09 ở Los Angeles) và
    WP5-UX-REGATE6 (hôm nay 2026-10-09) chạy ngoài khoảng đó nên đã đạt.
  - Quy tắc/AC: AGENTS.md quy tắc 5 (gate nghiệm thu bắt buộc, lệnh chạy được và kết quả thật: gate lỗi theo lịch thì
    không tái lập được); docs/06 AC-01 (kiểm tra hồi quy cô lập); danh sách e2e bắt buộc của lệnh giao này.
  - Sửa có phạm vi (chỉ test; không đổi sản phẩm): trong `seedOwner` của `isolation.spec.ts`, lấy ngày từ
    `employee.displayedPeriodFreeWorkdays()` (helper của fixtures mà các spec mới hơn dùng; `fixtures.ts` không đổi), và
    làm như vậy ở `shell.spec.ts:68`; không bỏ hay làm yếu assertion nào; chứng minh bằng cách chạy `isolation.spec.ts`
    và `shell.spec.ts` trên cả hai project trong khoảng lỗi (trước 2026-10-17 00:00 Los Angeles) và một lần ngoài khoảng
    đó.
- Chứng minh delta (phạm vi 1): FIX8 đổi bố cục thanh shell trên điện thoại dưới 768px và thêm hai test mobile; nó không
  đổi hành vi nào của vùng A.
  1. Chỉ CSS và một spec đổi, không đổi request, body, phép tính hay giá trị lưu nào. Diff là một commit với hai đường
     dẫn và không có dòng bị xóa; `src/server`, `src/domain`, mọi file client `.ts`/`.tsx`, `api.ts`, `fixtures.ts`,
     `dayButton.ts`, unit và integration test, các file package, cấu hình, script và docs không có diff. Server và domain
     đã build giống từng byte với của bf954c0 (server cũng giống của 014bd47) và JavaScript client là cùng một mã; 82 chỗ
     gọi, 66 khóa endpoint và 12 hàm dựng body không đổi. Năm khai báo CSS thêm vào (`styles.css:87`, `:3070-3087`) là
     một token, một khoảng cách cột, một flex basis, một padding theo chiều khối và một cỡ chữ; không cái nào chạm
     display, visibility, opacity, pointer events, thứ tự chồng lớp, overflow hay position.
  2. Stylesheet đổi gì trong app đã build (bố cục tính toán, cùng dữ liệu trên hai bản build): ở 1280, 1024 và 768 px cả
     78 dữ kiện của màn hình riêng của người được chia sẻ, 83 dữ kiện của màn hình chia sẻ và 49 dữ kiện của người không có
     chia sẻ đều bằng nhau. Dưới 768px chỉ năm thuộc tính của FIX8 và hình học chúng làm dịch chuyển là khác: ở 390 px
     khi có chia sẻ nhận được, thanh cao 60 px thay vì 106.8 (một hàng), `--shell-bar-size` đo được đi theo (60 px) và
     scroll padding cũng vậy (68 px = 60 + 8, cơ chế AX-01 không đổi); ở 320 px bộ chuyển vẫn xuống dòng dưới tên thương
     hiệu (90.8 px thay vì 106.8); khi không có chia sẻ nhận được chỉ khoảng cách cột tính toán khác và không gì dịch
     chuyển. Thanh chia sẻ vẫn tĩnh bên dưới thanh shell trên điện thoại như trước.
  3. Bộ chuyển đến đúng các route như trước, bằng bàn phím, chạm và chuột. Form, các lựa chọn và hàm submit không bị chạm
     (`SharingSwitcher.tsx` không có diff). Người được chia sẻ G của chủ A (chỉ xem) và chủ B (được sửa) chạy chuỗi A, B,
     timesheet của tôi, B, A, timesheet của tôi ba lần (bàn phím: focus select, phím mũi tên, Tab tới Open, Enter; chạm:
     chọn rồi chạm Open; chuột: chọn rồi bấm) ở 390x844 và 320x640, có và không có ghi chú múi giờ, trên 255ba17 và
     bf954c0: 72 bước mỗi bản build, mỗi bước cùng địa chỉ, thanh chia sẻ, tiêu đề, điều khiển chỉ dành cho chủ, dữ liệu
     của chủ trên trang và request trên cả hai bản build (`36-compare.txt` mục 2, 0 khác biệt). Chỉ chọn thôi thì không
     bao giờ chuyển trang hay gửi request; Tab từ select luôn tới Open; select và Open nằm trong khung nhìn và trúng ở tâm
     trước mọi bước (select 138.2x44 và Open 67.1x44 ở 390, 149.3x44 và 67.1x44 ở 320). AC-16: trong màn hình chỉ xem của
     A không có Open a day, Change several days, ô chọn nhãn, checkbox, nút ngày Edit, clock hay dòng chữ ký và có 14 nút
     ngày View; trong màn hình được sửa của B có Open a day, Change several days, 14 ô chọn nhãn và 14 nút ngày Edit, vẫn
     không có clock hay dòng chữ ký; mọi request nằm dưới `/api/shared/<owner>/` cộng `GET /api/shares`. Cô lập, như nhau
     trên hai bản build: G mở địa chỉ của C (chưa từng chia sẻ) không thấy gì của C (404 cho timesheet của C, 403 cho PUT
     vào A chỉ cho xem), và C không có bộ chuyển và nhận 404 cho timesheet của A và B (8 trên 8 lần chạy).
  4. Thanh mới không che hay chặn điều khiển sửa, clock, lý do hay xác nhận nào, có và không có chia sẻ nhận được, có và
     không có ghi chú múi giờ. `useBlockSize.ts` và các chỗ stylesheet dùng kích thước đo được không đổi; thanh thấp hơn
     nên scroll padding nhỏ đi đúng bấy nhiêu (mục 2). Probe trên cả hai bản build ở 390x844 và 320x640, mỗi kích thước
     có và không có ghi chú múi giờ, mỗi trường hợp có chia sẻ sửa nhận được (46 điều khiển: clock in và out, Open a day,
     Change several days, kỳ, ô chọn nhãn và nút ngày đầu/cuối, select và Open của bộ chuyển; Close, Save, Notes, Leave
     hours, Add, Edit, Delete, Confirm delete và Confirm suggested breaks của trình sửa; lý do và Save của kỳ cũ; Preview,
     lý do, Cancel, Commit, Review conflicts, ô xác nhận, Confirm and commit, Back của hàng loạt; hộp thoại Clock out;
     màn hình chia sẻ được sửa, liên kết Back, Open và trình sửa của nó) và không có chia sẻ (32 điều khiển): mỗi điều
     khiển được focus từ ba vị trí cuộn (25 điểm mẫu và tâm), một lần thử bằng chuột và một lần thử bằng chạm, cộng các
     lượt nhấn Tab thật qua màn hình riêng, trình sửa và màn hình chia sẻ. Trên 255ba17: 936 phép kiểm focus, 312 lần thử
     chuột và 312 lần thử chạm, 592 điểm dừng Tab; mọi lần thử đạt, mọi điểm dừng Tab hiện đủ (25/25, trúng tâm, 0 bị
     che). Các dòng duy nhất dưới thanh là bốn lần đặt ô ngày "Open a day" mà lệnh `focus()` bằng script không cuộn (N5
     của A6): bị che nửa dưới thanh 320 px (hiện 10/25) hoặc, ở 320x640 có ghi chú múi giờ trong màn hình chia sẻ, nằm
     dưới mép màn hình; cùng ô đó khi tới bằng Tab thì hiện 25/25 ở mọi trạng thái, và lần thử chuột và chạm của nó đều
     đạt. bf954c0 có năm dòng như vậy với cùng các bước (thêm một dòng: trong màn hình riêng ở 320 có ghi chú múi giờ, ô
     chỉ hiện 5/25 dưới thanh tab). FIX8 không thêm chỗ bị che nào (`36-compare.txt` mục 3).
  5. Không assertion vùng A nào bị bỏ hay làm yếu: diff spec chỉ thêm dòng (một describe với hai test mobile, `test(`
     4 -> 5, `expect(` 130 -> 144) đo dòng ngày đầu, chiều cao thanh, nhãn, vùng chạm và vị trí của bộ chuyển, và không
     cuộn ngang; `fixtures.ts` không đổi từ 014bd47; mọi spec khác không đổi.
- Đạt ở vùng A trên 255ba17 (tự tái hiện, ngoài các kiểm tra bắt buộc; `36-compare.txt`, `37-summary.txt`):
  1. Endpoint và body so với 014bd47, ở 1280 (panel bên không modal), 1024 (trình sửa modal) và 390 (sheet dưới) so với
     bản build 014bd47: clock in và out, ký xác nhận (`POST /api/timesheets/:p/signoff`, gắn với `payload_hash` và
     `expected_version` đã xem, 201), sửa hàng loạt kỳ cũ có lý do, PUT trường ngày của trình sửa (`leave_minutes` 150 từ
     2 giờ 30 phút) và POST phiên mới, và đổi nhãn một ngày (ô chọn nhãn so với thanh hàng loạt một ngày của 014bd47) gửi
     cùng đường dẫn và body (khóa so sánh theo thứ tự đã sắp; `36-compare.txt` mục 1).
     Các đường chia sẻ trong Settings cho cùng request, body và trạng thái lưu như trên bản build 014bd47 ở 1280, 1024 và
     390, từng bước một: cấp (`POST /api/shares` với e-mail và các mục), đổi (Cancel và Escape không ghi gì; Save items:
     `PUT /api/shares/:id {items}`), kết thúc và rời (Escape và Cancel không ghi gì; `POST /api/shares/:id/revoke {}`),
     cùng các bước import và số dư đầu kỳ của cùng probe (21 bước mỗi bố cục, 63 bằng nhau; `36-compare.txt` mục 5).
     Các lần ghi qua đường chia sẻ (`/api/shared/<owner>/days/batch`, `/days/:date`) nằm ở mục 6.
  2. Client không tính phút nghiệp vụ: lần quét phép tính trùng từng dòng với bf954c0 (49 chỗ trong 35 file client đổi
     từ 014bd47, đều đã được A6 xét); Overtime Total là `view.totals.provisional_credited_minutes`
     (`TimesheetSheet.tsx:289`).
  3. A-01 vẫn đóng: ở cả ba bố cục 12 lần nhập nghỉ phép sai dạng hoặc ngoài khoảng bị từ chối với thông báo và
     `aria-invalid` chỉ trên ô sai, không PUT và không lưu gì (36 lần từ chối, 0 PUT); nhập hợp lệ gửi 0, 45, 150, 240,
     480 và 1440 phút, và server từ chối 1440 với `leave_exceeds_required`.
  4. R-07: ba phiên Los Angeles (23:00-23:50, 00:20-01:10, một phiên qua đêm 22:00-02:00+1) xem ở America/Los_Angeles,
     Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago và Asia/Ho_Chi_Minh ở yên ngày kế toán đã lưu với giờ và dấu ngày
     bắt đầu bằng oracle; 14 ngày, ô OT và tổng giống nhau; thanh ghi "Times in <zone>"; dòng hạn bằng chữ vẫn là "Due Tue
     10/13/2026, 17:00 (America/Los_Angeles)"; giờ hạn trong ghi chú múi giờ bằng oracle của `due_at_utc` ở múi giờ đang
     xem ("Wed 10/14/2026, 09:00" ở Tokyo, "Tue 10/13/2026, 13:00" ở Pago Pago, "Wed 10/14/2026, 07:00" ở Thành phố Hồ
     Chí Minh); trang Review hiện cùng giờ theo múi giờ báo cáo.
  5. AC-04 ở từng bố cục: ô chọn nhãn kỳ cũ chỉ preview, cần lý do và commit kèm lý do; Save của trình sửa chờ lý do và
     PUT mang lý do; cả hai lý do có trong `/api/history`; ô chọn nhãn dừng khi phiên bản cũ; trường ngày mở qua "Open a
     day" từ chối lưu phiên bản cũ; xác nhận nghỉ một chạm gửi phiên bản đã tải và bị từ chối vì cũ; Delete rồi Escape
     không xóa gì; xung đột cần xác nhận và gửi `confirm_conflicts`. Hỏi DST fold/gap và qua đêm đạt trong e2e
     day-editor bắt buộc.
  6. AC-16/AC-01 ở từng bố cục: người chỉ xem không có Open a day, Change several days, clock, ô chọn nhãn, checkbox, nút
     ngày Edit, dải chữ ký, liên kết review hay ảnh; có 14 nút ngày "View"; trình sửa chỉ đọc không có ô nhập; không
     request nào ngoài `/api/shared/<owner>/` (cộng share và auth); người được sửa chỉ ghi qua `/api/shared/<owner>/` (ô
     chọn nhãn, trình sửa, Open a day ở 320 px trên điện thoại) và lịch sử của chủ ghi tên người đó; người thứ ba không
     thấy gì và nhận 404 cho timesheet, ngày, PUT ngày và PUT phiên được chia sẻ; probe bộ chuyển thêm chuỗi route bằng
     bàn phím, chạm và chuột (mục delta 3).
  7. Riêng tư và PDF: trang Timesheet trước và sau khi ký có 0 ảnh, 0 nền CSS url và 0 request `/api/signatures`, ngày ký
     ở dải chữ ký bằng oracle theo múi giờ báo cáo; trang Review có đúng một ảnh chữ ký (`/api/signatures/<id>`) ngoài
     bảng. Mã PDF và `pdf-visual.spec.ts` không đổi từ 014bd47 và server đã build giống từng byte; pdf-visual (2,
     desktop), review và submission e2e đạt (AC-06, AC-07, AC-10).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Info, không đổi) GHSA-68fv-2mgg-jv7q trong `source-map-js` chỉ
  dùng cho dev (vite -> postcss); `--omit=dev` sạch; file lock không đổi từ 014bd47. (R5, Info, đã cải thiện, vùng B)
  Trên điện thoại 390x844, trong màn hình chia sẻ chỉ xem có ghi chú múi giờ, thanh chủ sở hữu nằm ở 76-276.9 px và dòng
  ngày đầu nay kết thúc ở 802.9 px (A6: 849.7), vẫn dưới đỉnh thanh tab (788 px); docs/04 dòng 48 và B6-01 nói về màn
  hình đầu của chính người dùng, điều FIX8 đã sửa; vùng B xét màn hình chia sẻ. (N5, Info, phương pháp probe, không đổi)
  Lệnh `focus()` bằng script không cuộn ô nhập ngày, nên probe vùng dính khi focus ô "Open a day" có thể để ô bị che nửa
  dưới thanh hoặc nằm dưới mép màn hình; nhấn Tab thật thì tới ô này hiện đủ ở mọi trạng thái (mục delta 4). (N6, N7,
  Info, không đổi) như ở A6.
- Gate chưa chạy/bị chặn và lý do: `isolation.spec.ts` giữ nguyên không thể đạt trên bản build nào cho tới 2026-10-17
  00:00 (Los Angeles) (WP5-UX-A7-01); các assertion của nó đạt trên 255ba17 khi ngày được chọn nằm trong kỳ đang hiện.
- Xử lý phát hiện trước: WP5-UX-A-01 vẫn đóng (mục 3). A6 không có phát hiện; các rủi ro R1, R5, N5, N6 và N7 của nó
  được ghi tiếp ở trên. WP5-UX-AUDIT-A6 (PASS ở bf954c0) chưa được một audit chấp nhận nào thay thế: audit này không chấp
  nhận vùng A ở 255ba17.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chưa được chấp nhận ở 255ba17 cho tới khi WP5-UX-A7-01
  được sửa và kiểm lại; bản thân FIX8 không cần đổi gì cho vùng A. WP5 chỉ được nghiệm thu lại nếu cả hai lần kiểm lại
  vùng đều đạt. Không liên quan phép của chủ, gửi thật hay pilot.
- Một bước/prompt tiếp: coordinator mở một bản sửa có phạm vi chỉ trong test cho WP5-UX-A7-01 (`isolation.spec.ts` và
  `shell.spec.ts` chọn một ngày của kỳ đang hiện), rồi freeze, gate và một lần kiểm lại vùng A mới cho delta đó, chạy cả
  hai spec trong khoảng lỗi (trước 2026-10-17 00:00 Los Angeles) và ngoài khoảng đó.

Ghi chú khi chạy: chỉ dùng Git Bash; không đưa script qua stdin, không chuyển hướng tới thiết bị null; mọi file đều ghi
trong thư mục task, thư mục bằng chứng, cặp review này hoặc phần Results của lệnh giao; các lần chạy nối tiếp nhau, mỗi
lần chạy Playwright có thư mục output riêng; fixture e2e tự chọn cổng loopback trống và tôi không khởi động server riêng
(không cổng nào trong 48440-48459 bị chiếm); không còn gì đang chạy. Sơ suất, ghi lại trung thực: một lệnh pipe `cat` vào
`tail -c 600` để đọc cuối một log (19:13Z), trái quy tắc (không mất dữ liệu, không lặp lại); lần chạy đầu của các probe
theo phương pháp A6 dùng đường dẫn output tương đối từ trong thư mục probe nên không ghi được gì (chạy lại với đường dẫn
tuyệt đối, `30-…`). Lần kiểm bằng chứng (`38-evidence-check.txt`) không thấy byte CR, địa chỉ hay đường dẫn hồ sơ người
dùng nào; hai chỗ nó báo chỉ là tên thư mục task trong chính văn bản của lệnh giao và trong quy tắc che của
`mask.mjs.txt`.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A7.md](WP5_UX_REVIEW_A7.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A7 lần 2; agent reviewer a20d8532cf4870e3a
  (board; lần 1 là agent adb1361e72d2ebd96 và không ghi gì vào repository); tác giả của delta WP5-UX-FIX8
  a1879ebe9ac6923de (claude-sonnet-5-5); các tác giả trước của vòng như liệt kê trong `WP5_UX_REVIEW_A6.md` và
  `WP5_UX_REVIEW_A5.md`.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer này không viết gì trong vòng thiết kế lại và không
  chạy gate, đợt quét hay audit nào trước đó của vòng; chỉ viết review này, bản dịch, phần Results của task và
  `evidence/WP5-UX-AUDIT-A7/`; các export và bản build của 255ba17, bf954c0 và 014bd47 cùng mọi probe chạy trong thư mục
  task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: b07727b2 trước và sau; WP5-UX-REGATE6 PASS trên cùng freeze commit (e2e
  của nó chạy ngày 2026-10-09, ngoài khoảng lỗi của WP5-UX-A7-01).
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A7.md` (mới); `WP5_UX_REVIEW_A.md` đến
  `WP5_UX_REVIEW_A6.md` giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: WP5-UX-A7-01 đang mở (Low, chỉ trong test); một bản sửa test
  có phạm vi, freeze, gate và một lần kiểm lại vùng A mới cho delta đó.
