# Review độc lập: thiết kế lại UI WP5, vùng A (kiểm lại sau WP5-UX-FIX7)

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi giờ,
  đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09 (Los Angeles); task WP5-UX-AUDIT-A6 lần 1; model tự báo
  claude-opus-5-5, không yếu hơn tác giả mạnh nhất của snapshot đang kiểm (claude-opus-5-5: WP5-UX-PLAN, T02, T04,
  FIX5 và FIX7; FIX2, FIX3, FIX4 và FIX6 chạy trên claude-sonnet-5-5); effort theo lệnh giao (xhigh).
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  bf954c0b371ad9a5fe461a603c5d476ea210e66c, digest
  b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 file, không tính `handoff/`), ghi đầu tiên và
  ghi lại lúc kết thúc. HEAD = origin/main = bf954c0; không có commit chưa push. Bản export sạch bằng `git archive` của
  bf954c0 có đúng 793 đường dẫn và blob của cây (danh sách bằng nhau, diff exit 0) và không đổi sau mọi kiểm tra.
- Quyết định: **PASS**
- Phạm vi thật đã xem/chạy: (1) chứng minh delta `5e104e1..bf954c0` (d3935e7 và 5b349f8 không đổi gì ngoài
  `handoff/`; FIX7 đổi 29 đường dẫn): đọc từng dòng toàn bộ diff client, test và docs, so sánh tĩnh chỗ gọi API và
  hàm dựng body, diff CSS theo khai báo, so sánh từng byte server và domain đã build, quét đơn vị tên nút ngày mới
  (87600 phép kiểm dưới mỗi một trong 8 múi giờ thiết bị), và các probe trình duyệt chạy cùng dữ liệu, cùng bước
  trên bản build bf954c0 và bản build 5e104e1: hộp thoại và bước nội tuyến với Cancel, Escape, Back và đổi bước;
  bộ chuyển "Shared with me" cùng AC-16 và cô lập; chọn ngày theo `data-day` ở 8 múi giờ thiết bị và 4 kỳ quanh
  5 lần đổi DST; kích thước dính và scroll padding với 43 điều khiển sửa, clock, lý do, xác nhận và điều hướng ở năm
  độ rộng, kèm một lần kiểm bằng bàn phím; (2) mục 1-7 vùng A của `WP5-UX-AUDIT-A.md` trên export sạch của bf954c0,
  dùng lại các probe của A5 làm phương pháp (chỉ chỉnh chỗ tên nút ngày đã đổi): endpoint và body so với bản build
  014bd47 cho mọi đường sửa, phép tính phía client, A-01, R-07 bằng probe đổi múi giờ thiết bị và giờ hạn trong ghi
  chú múi giờ, AC-04, AC-16/AC-01, riêng tư, PDF/AC-06/07/10, ranh giới từ 014bd47, `npm test`, mười spec e2e trên cả
  hai project và AC-13 một lần. Không lấy tóm tắt cũ nào làm bằng chứng.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A6/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest đầu tiên (ls-tree của bf954c0 và HEAD, `npm run digest`, export sạch) và lúc kết thúc (băm lại export, ls-tree của HEAD, `npm run digest`) | luôn là b7c011d2, 793 file; export không đổi; repository không đổi ngoài `handoff/` | `00-digest.txt`, `00-digest-after.txt` |
| `npm ci` (Node v24.21.0, cache trong thư mục task) | exit 0; "1 high severity vulnerability" (chỉ dev, R1) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1823 test đạt (A5: 1821; thêm 2 test `dayButtonName`) | `02-npm-test.txt` |
| `npm run typecheck`; `npm run lint`; `npm run build` | exit 0; exit 0; exit 0; không log nào có dòng deprecation | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, import, pdf-visual, focus-ring, keyboard-access trên cả hai project | exit 0; 178 test: 155 đạt, 23 bỏ qua theo điều kiện project của spec, 0 lỗi, 0 flaky (desktop 77 + 12 bỏ qua, mobile 78 + 11 bỏ qua); bảy spec A5 đã chạy ngoài focus-ring có đúng số đếm từng spec của A5 | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng, exit 0; toàn bộ: exit 1, một mức high (`source-map-js`, chỉ dev) | `06-npm-audit.txt` |
| delta 5e104e1..bf954c0, ranh giới từ 014bd47, server/domain đã build | 29 đường dẫn, đều của FIX7; không đổi `src/server`, `src/domain`, `api.ts`, `fixtures.ts`, package, cấu hình hay script; từ 014bd47 chỉ `src/domain/format.ts` (+13); `dist/server` giống từng byte ở 014bd47, 5e104e1 và bf954c0, `dist/domain` giống nhau ở 5e104e1 và bf954c0 | `10-delta.txt`, `10c-…`, `10d-…`, `10e-…`, `11b-dist-server.txt` |
| diff CSS theo khai báo | bỏ 4, thêm 34: token, `scroll-padding-top`, `top`/`max-height` dính của thanh chia sẻ và panel bên 1200px, `box-shadow` của focus, bố cục flex của bộ chuyển, `flex-wrap`/`max-width` của đầu ô ngày trên điện thoại; không đổi `visibility`, `opacity`, `pointer-events`, `z-index`, `overflow` hay `position` | `12a-css-rules.txt` |
| quét đơn vị tên nút ngày | 87600 phép kiểm dưới mỗi một trong 8 múi giờ thiết bị, 0 lỗi | `12b-day-name-probe.txt` |
| dòng test bị bỏ/thêm | 15 dòng bị bỏ, mỗi dòng được thay bằng cùng phép kiểm trên cùng phần tử (hoặc là một dòng import); không bỏ `test(` nào; `fixtures.ts` không đổi từ 014bd47 | `12c-tests-delta.txt` |
| chỗ gọi; hàm dựng body; phép tính client | 82 chỗ gọi / 66 khóa ở 5e104e1 và bf954c0, 0 chỗ gọi ghi đổi; 12/12 hàm dựng giống hệt 5e104e1; số chỗ có phép tính = 35 chỗ của A5 cộng 14 dòng không đổi trong các file FIX7 chỉ chạm để xử lý focus | `13-callsites.txt`, `14-body-builders.txt`, `16-client-arith.txt`, `16b-client-arith-diff.txt` |
| probe của A5 trên bf954c0 (1280, 1024, 390) | body, A-01 nghỉ phép, AC-04, R-07 + ghi chú múi giờ, riêng tư, AC-16/AC-01: 18 đạt; chạy lại body 3 đạt | `30-…`, `30b-…`, `37-summary.txt` |
| probe delta trên bf954c0 và 5e104e1 (1280, 1024, 390; probe dính thêm 768 và 320) | days, dialogs, switcher đạt trên cả hai bản build (days của 5e104e1 sau khi sửa probe, `32b-…`); dính: bf954c0 lệch 2 trong 645 phép kiểm focus (320 px, focus bằng script của ô ngày), 215/215 lần bấm thử; 5e104e1 lệch 70 trong 645 | `31-…`, `32-…`, `32b-…`, `35-sticky-counts.txt` |
| mốc 014bd47 (1280, 390) | probe body của A5 (giữ nguyên) và các bước Settings/Import: 4 đạt | `33-probe-014-baseline.txt` |
| kiểm tiếp ô ngày bằng bàn phím (cả hai bản build, 5 độ rộng) | bf954c0: Tab và Shift+Tab từ vị trí bị che nửa và che hết cho 25/25 điểm hiện ở 20/20 dòng; 5e104e1: 10 hoặc 15/25 (che nửa) và 0/25 (che hết) | `34-…`, `34b-datefield-summary.txt` |
| so sánh | days, switcher, dialogs so với 5e104e1; các bước Settings/Import và body so với 014bd47: missing=0 mismatches=0 (237 dòng SAME) | `36-compare.txt` (giữ `36a-compare-run1.txt`: hai lỗi giả của probe, xem ghi chú khi chạy) |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **không có.**
- Chứng minh delta (phạm vi 1): FIX7 đổi cách xử lý focus, tên, role, cách kích hoạt bộ chuyển và vị trí dính;
  không đổi hành vi nào của vùng A.
  1. Không đổi request, endpoint, body, `expected_version`, câu hỏi lý do, bước xác nhận, phép tính hay giá trị lưu,
     và Cancel, Escape vẫn không ghi gì. Về tĩnh: `src/server`, `src/domain`, `src/client/api.ts` và
     `tests/e2e/fixtures.ts` không có diff từ 5e104e1; 82 chỗ gọi client và 66 khóa endpoint như cũ, không chỗ gọi
     ghi nào đổi; 12 hàm dựng body giống hệt; server và domain đã build giống từng byte với 5e104e1. Mã focus chỉ thêm
     ref, lời gọi `focus()` và cờ: `BatchDialog.tsx:49-64` (`goTo` đặt bước và một cờ; `submit`, Cancel và `close`
     gốc không đổi), `TimesheetScreen.tsx:237-255,329-348` (nút mở được đọc trước `setBusy`; `closePreview` đặt thêm
     một cờ focus; `sendCommit` không đổi), `ImportCommit.tsx:31-44`, `OpeningBalanceForm.tsx:60-74`,
     `OpeningBalancePanel.tsx:38-44,168`, `SharingRows.tsx:86-104,197-203,234` (mỗi lần hủy hay đóng vẫn đổi trạng
     thái như cũ rồi mới đặt focus). Lúc chạy, ở 1280, 1024 và 390, cùng các bước trên bản build bf954c0 và 5e104e1
     cho cùng request, body và trạng thái lưu ở mọi bước: xem lại hàng loạt (Escape; Cancel; Review conflicts, Back,
     Escape; Review conflicts, Escape: mỗi lần chỉ có POST preview, không lưu gì; rồi xác nhận và commit với
     `confirm_conflicts: true`), xem lại khi chọn nhãn (cùng bốn cách thoát, rồi commit), Delete rồi Escape của trình
     sửa (không DELETE) và lần xóa thật, Escape và Cancel của Clock out (không POST) và lần gửi, cấp chia sẻ, đổi mục
     (Cancel; Escape, vẫn để mở bước đổi trên cả hai bản build; Save items: `PUT /api/shares/:id {items}`), kết thúc
     (Escape, Cancel, End share: `POST …/revoke {}`), rời chia sẻ (như vậy), import (Back to the preview, Escape,
     Confirm import với cùng quyết định) và số dư đầu kỳ cùng lần sửa (Back to edit, Escape, Cancel, rồi POST và PUT
     với cùng body). Các bước Settings và Import cũng cho cùng request, body và trạng thái lưu trên bản build 014bd47.
     Chỉ focus sau mỗi lần thoát là khác (đúng mục đích của FIX7).
  2. Bộ chuyển đến đúng các route như trước. Trước: `onChange` của select đặt
     `window.location.hash = value === '' ? '#/timesheet' : sharedHash(value, null)` (5e104e1
     `SharingSwitcher.tsx:17`); nay lệnh submit của form đặt cùng biểu thức trên giá trị đã chọn
     (`SharingSwitcher.tsx:20-23`); danh sách lựa chọn không đổi và form được tạo lại theo chủ sở hữu đang hiện (`:14`).
     Với người được chia sẻ từ chủ A (chỉ xem) và chủ B (được sửa) và chuỗi A, B, timesheet của tôi, B, A, timesheet của
     tôi, cả hai bản build đến cùng địa chỉ, thanh chia sẻ, tiêu đề và điều khiển chỉ dành cho chủ (chỉ xem: không Open
     a day, Change several days, ô chọn nhãn, checkbox, clock hay dòng chữ ký, 14 nút ngày "View"; được sửa: Open a day,
     Change several days và 14 ô chọn nhãn, vẫn không clock hay dòng chữ ký), chỉ hiện phiên của đúng chủ đó và gửi cùng
     request (chỉ `/api/shared/<owner>/…` cộng `GET /api/shares`); trên bf954c0 chỉ chọn thôi thì giữ nguyên địa chỉ và
     không gửi gì. Cô lập giống nhau ở cả hai: người được chia sẻ mở địa chỉ của một chủ chưa từng chia sẻ thì ở lại
     timesheet của mình (404 cho timesheet của chủ đó, 403 cho PUT vào chủ chỉ cho xem), người thứ ba không có bộ chuyển
     và không thấy phiên nào của A hay B (404 cho cả hai timesheet được chia sẻ).
  3. Chọn ngày theo `data-day` mở đúng ngày kế toán như trước. `focusDay()` nay tìm
     `[data-day="<date>"] [data-day-button]` (`TimesheetScreen.tsx:60-64`), đúng phần tử mà cách tìm theo
     `aria-label` của 5e104e1 tìm thấy; các nút vẫn gọi `actions.onEdit(day.workDate)` (`TimesheetSheet.tsx:59`,
     `SheetWeekTable.tsx:282`). Tên đến từ `dayButtonName` (`sheetModel.ts:106-109`), chỉ là chữ ghép từ `dateText`
     (cắt chuỗi `work_date`) và `weekday` (thứ theo UTC của `work_date`); không dùng múi giờ nào. Quét đơn vị: mọi
     ngày của 2025-2027 ở 10 múi giờ hiển thị, dưới 8 múi giờ thiết bị: tên đúng "{verb} {MM/DD} ({date})" (bảng) hoặc
     "{verb} {Ddd} {MM/DD} ({date})" (điện thoại), chữ ô và chữ phiên bằng 5e104e1; 0 lỗi trong 87600 cho mỗi múi giờ
     thiết bị. Trình duyệt, 1280/1024/390, 8 múi giờ thiết bị (Los Angeles, Sydney, Lord Howe, Kiritimati, Pago Pago,
     London, Tokyo, Chatham) x 4 kỳ (09/14-09/27 có lần bắt đầu DST của Chatham, 09/28-10/11 có một phiên vắt qua lần
     bắt đầu DST của Sydney và Lord Howe, 10/12-10/25 có lần kết thúc DST của London, 10/26-11/08 có lần kết thúc DST
     của Los Angeles): mọi danh sách `data-day` bằng của server, mọi tên bằng "{verb} {chữ hiện} ({date})", và chữ
     hiện, động từ và giờ phiên bằng dòng tương ứng của 5e104e1 (448 dòng mỗi bố cục, 0 khác); giờ phiên bằng oracle
     Intl và ở yên ngày đã lưu (phiên Los Angeles 10/03 08:00-12:00 hiện "10/04 01:00-06:00" ở Sydney và "10/04
     01:30-06:00" ở Lord Howe trên dòng 10/03). Ở 4 múi giờ x 2 kỳ, đã bấm cả 14 nút ngày trên cả hai bản build: mỗi
     nút mở đúng ngày của nó (`data-day-editor` và tiêu đề) và Close trả focus về đúng nút ngày đó (112 lần bấm mỗi bố
     cục, 0 khác).
  4. Hook kích thước dính và scroll padding không thể che hay chặn điều khiển sửa, clock, lý do hay xác nhận.
     `useBlockSize.ts:10-24` chỉ ghi chiều cao đo được của thanh shell và thanh chia sẻ (lên `<html>`) và của đầu trình
     sửa (lên hộp thoại) vào custom property rồi xóa khi unmount; stylesheet chỉ dùng chúng trong `scroll-padding-top`
     (`styles.css:399,414,1981`), `top` dính của thanh chia sẻ (`:3032`) và `top`/`max-height` dính của panel bên
     1200px (`:2014-2016`). Probe: 43 điều khiển mỗi độ rộng (clock, Open a day, Change several days, kỳ, ô chọn nhãn và
     nút ngày đầu/cuối, bộ chuyển; Close, Save, Notes, Leave hours, Add, Edit, Delete, Confirm delete, Confirm suggested
     breaks của trình sửa; lý do và Save của kỳ cũ; Preview, lý do, Cancel, Commit, Review conflicts, ô xác nhận, Confirm
     and commit, Back của hàng loạt; Clock out và hộp thoại của nó; màn hình chia sẻ được sửa và trình sửa của nó) từ ba
     vị trí bắt đầu (trang hoặc panel cuộn xuống đáy, lên đỉnh, điều khiển bị che nửa dưới vùng dính), mỗi điều khiển
     được focus, rồi đo 25 điểm mẫu, tâm và một lần bấm thử của Playwright. Trên bf954c0 cả 516 phép kiểm ở 1280, 768,
     1024 và 390 đạt (có focus, hiện, trúng ở tâm) và cả 215 lần bấm thử đạt; ở 1280 trong màn hình chia sẻ được sửa,
     panel bên bắt đầu ở 209.4 px = thanh shell 56 + thanh chia sẻ 141.4 + 12 và `max-height` là 578.6 px, mọi điều
     khiển đều với tới được. Ở 320 px có 2 trong 129 phép kiểm lệch: ô ngày "Open a day" đặt bị che nửa dưới thanh shell
     còn 10 trong 25 điểm hiện sau một lệnh `focus()` bằng script, lệnh này không cuộn ô nhập ngày; 5e104e1 cho đúng 2
     dòng đó. Khi tới ô này như người dùng bàn phím (Tab từ Clock in, Shift+Tab từ Show details, từ vị trí bị che nửa
     và che hết) thì ô hiện đủ (25/25, trúng tâm) trên bf954c0 ở cả 20 dòng tại 1280, 768, 1024, 390 và 320, còn trên
     5e104e1 bị che nửa hoặc che hết. Cùng probe dính trên 5e104e1 lệch 70 trong 645 phép kiểm (20 bị che hết dưới thanh
     shell, thanh chia sẻ hoặc đầu trình sửa). FIX7 bỏ được chỗ bị che và không thêm chỗ nào.
  5. Test: 15 dòng test bị bỏ gồm 12 lần chọn nút ngày được thay bằng `namedDayButton` (`data-day` của dòng, dấu
     `data-day-button` và tên mới có neo: cùng phần tử, chặt hơn), lần chọn "sheet date" của focus-ring được thay bằng
     `[data-day] [data-day-button]` cộng một assertion tên truy cập, một `toHaveCount(0)` của nút mang tên Edit trong
     màn hình người chỉ xem được thay bằng cùng phép đếm trên tên mới có neo, và một dòng import; không bỏ `test(` nào
     (sheetModel 26 -> 28, focus-ring 1 -> 5, còn lại bằng nhau); `fixtures.ts` không đổi từ 014bd47; các assertion
     vùng A của day-editor (lý do, phiên bản cũ, DST, qua đêm, A-01), sharing, isolation, review, submission, timesheet
     và import ngoài ra không bị chạm. Không assertion vùng A nào bị bỏ hay làm yếu.
- Đạt ở vùng A trên bf954c0 (tự tái hiện, ngoài các kiểm tra bắt buộc; `36-compare.txt`, `37-summary.txt`):
  1. Endpoint và body so với 014bd47: cùng 66 khóa gọi; chỗ gọi thêm từ 014bd47 vẫn chỉ là preview/commit một dòng
     của ô chọn nhãn và `PUT /sessions/:id` một chạm. Lúc chạy ở 1280 (panel bên không modal), 1024 (trình sửa modal)
     và 390 (sheet dưới) so với bản build 014bd47: clock in và out, ký xác nhận (`POST /api/timesheets/:p/signoff`, gắn
     với `payload_hash` và `expected_version` đã xem, 201), sửa hàng loạt kỳ cũ có lý do, PUT trường ngày và POST phiên
     mới của trình sửa, và đổi nhãn một ngày (ô chọn nhãn so với thanh hàng loạt một ngày của 014bd47) gửi cùng đường
     dẫn và body (khóa so sánh theo thứ tự đã sắp); body cấp/đổi/kết thúc/rời chia sẻ, commit import và ghi/sửa số dư
     đầu kỳ bằng của 014bd47 (mục delta 1).
  2. Client không tính phút nghiệp vụ: quét 35 file client đổi từ 014bd47 thấy 35 chỗ của A5 trùng từng dòng cộng 14
     dòng của `OpeningBalanceForm.tsx`, `OpeningBalancePanel.tsx` và `SharingRows.tsx`, các file nay mới được quét chỉ
     vì FIX7 chạm vào; không dòng nào trong 14 dòng là dòng của FIX7, và phép tính duy nhất trong đó
     (`resultingPosted(...)`, phần xem trước khi xác nhận số dư đầu kỳ) không đổi từ 014bd47; Overtime Total là
     `view.totals.provisional_credited_minutes` (`TimesheetSheet.tsx:289`).
  3. A-01 vẫn đóng: ở cả ba bố cục 12 lần nhập nghỉ phép sai dạng hoặc ngoài khoảng bị từ chối với thông báo và
     `aria-invalid` chỉ trên ô sai, không PUT và không lưu gì (36 lần từ chối, 0 PUT); nhập hợp lệ gửi 0, 45, 150, 240,
     480 và 1440 phút như trước.
  4. R-07: ba phiên Los Angeles của A5 xem ở America/Los_Angeles, Asia/Tokyo, Pacific/Kiritimati, Pacific/Pago_Pago và
     Asia/Ho_Chi_Minh ở yên ngày kế toán đã lưu với giờ và dấu ngày bắt đầu bằng oracle; 14 ngày, ô OT và tổng giống
     nhau; thanh kỳ ghi "Times in <zone>"; dòng hạn bằng chữ vẫn là "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)";
     giờ hạn trong ghi chú múi giờ bằng oracle của `due_at_utc` ở múi giờ đang xem (ví dụ "Wed 10/14/2026, 09:00" ở
     Tokyo, "Tue 10/13/2026, 13:00" ở Pago Pago); trang Review hiện cùng giờ theo múi giờ báo cáo; probe ngày của delta
     thêm 8 múi giờ, 4 kỳ và 5 lần đổi DST (mục delta 3).
  5. AC-04 ở từng bố cục: ô chọn nhãn kỳ cũ chỉ preview, cần lý do và commit kèm lý do; Save của trình sửa chờ lý do
     và PUT mang lý do; cả hai lý do có trong `/api/history`; ô chọn nhãn dừng khi phiên bản cũ; trường ngày mở qua
     "Open a day" từ chối lưu phiên bản cũ; xác nhận nghỉ một chạm gửi phiên bản đã tải và bị từ chối vì cũ; Delete rồi
     Escape không xóa gì; xung đột cần xác nhận và gửi `confirm_conflicts`. Hỏi DST fold/gap và qua đêm đạt trong e2e
     bắt buộc.
  6. AC-16/AC-01 ở từng bố cục: người chỉ xem không có Open a day, Change several days, clock, ô chọn nhãn, checkbox,
     nút ngày mang tên Edit, dải chữ ký, liên kết review hay ảnh; có 14 nút ngày "View …" (theo tên và theo
     `data-day-button`); trình sửa chỉ đọc không có ô nhập; không request nào ngoài `/api/shared/<owner>/` (cộng share
     và auth); người được sửa chỉ ghi qua `/api/shared/<owner>/` (ô chọn nhãn, trình sửa, Open a day ở 320 px trên
     điện thoại) và lịch sử của chủ ghi tên người đó; người thứ ba không thấy gì và nhận 404 cho timesheet, ngày, PUT
     ngày và PUT phiên được chia sẻ; probe bộ chuyển thêm chuỗi route (mục delta 2).
  7. Riêng tư và PDF: trang Timesheet trước và sau khi ký có 0 ảnh, 0 nền CSS url và 0 request `/api/signatures`, ngày
     ký ở dải chữ ký bằng oracle theo múi giờ báo cáo; trang Review có đúng một ảnh chữ ký ngoài bảng. Mã PDF và
     `pdf-visual.spec.ts` không đổi từ 014bd47 và server đã build giống từng byte; pdf-visual (2, desktop), review và
     submission e2e đạt (AC-06, AC-07, AC-10).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Info, không đổi) GHSA-68fv-2mgg-jv7q trong `source-map-js`
  chỉ dùng cho dev (vite -> postcss); `--omit=dev` sạch; file lock không đổi từ 014bd47. (R5, Info, không đổi) Trên điện
  thoại 390x844, thanh chủ sở hữu của người chỉ xem nằm ở 122.8-323.7 px và dòng ngày đầu kết thúc ở 849.7 px, dưới
  đỉnh thanh tab (788 px), như ở 5e104e1. (N5, Info, phương pháp probe, không phải lỗi) Lệnh `focus()` bằng script
  không cuộn ô nhập ngày, nên probe focus ô "Open a day" bằng script có thể để ô bị che nửa dưới thanh shell 320 px ở
  cả hai bản build; focus bằng bàn phím cuộn ô hiện đủ trên bf954c0 (mục delta 4). (N6, Info, không đổi) Bước đổi mục
  của một chia sẻ đã cấp không đóng khi nhấn Escape (nay bước này nhận focus như một nhóm); không ghi gì. (N7, Info,
  hình thức) `sheetModel.ts:111` viết `export const hm =(minutes…` (thiếu dấu cách sau `=`); lint vẫn đạt.
- Gate chưa chạy/bị chặn và lý do: không có cho vùng A.
- Xử lý phát hiện trước: WP5-UX-A-01 vẫn đóng (mục 3). Rủi ro của A5: R1 không đổi; R5 không đổi (Info, không ảnh
  hưởng vùng A); N3 (hover đè focus) và N4 (hình thức) thuộc vùng B hoặc chỉ là hình thức, nằm ngoài delta này.
  WP5-UX-AUDIT-A5 (và qua đó A2, A3, A4 và WP5-RECHECK) được audit này thay thế cho vùng A.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chấp nhận bf954c0; WP5 chỉ được nghiệm thu lại nếu lần
  kiểm lại vùng B song song (WP5-UX-AUDIT-B6) cũng đạt. Không liên quan phép của chủ, gửi thật hay pilot.
- Một bước/prompt tiếp: coordinator ghi nhận PASS này (cùng WP5-UX-AUDIT-B6) và, nếu cả hai đạt, nghiệm thu lại WP5 ở
  bf954c0 qua committer.

Ghi chú khi chạy: chỉ dùng Git Bash; không pipe vào head hay tail, không đưa script qua stdin, không chuyển hướng tới
thiết bị null; mọi file đều ghi trong thư mục task, thư mục bằng chứng hoặc cặp review này; các lần chạy nối tiếp nhau,
mỗi lần chạy Playwright có thư mục output riêng. Sơ suất thiết kế probe, đã sửa trước các lần chạy được ghi: thư mục
probe ban đầu thiếu file package `"type": "module"` (lần chạy đầu không khởi động); probe dính ban đầu focus vào nút
Save bị vô hiệu của kỳ cũ (nút bị vô hiệu không nhận focus; nay probe gõ một thay đổi và lý do trước, không lưu gì);
lần chạy mobile đầu của probe ngày trên 5e104e1 dùng danh sách selector không giới hạn trong dòng (lỗi strict mode;
chạy lại với `:is(...)`, `32b-…`); lần so sánh đầu (`36a-compare-run1.txt`) có hai lỗi giả, chữ notes khác trong probe
body bf954c0 của tôi (chạy lại với chữ của probe 014bd47, `30b-…`) và thứ tự khóa JSON (nay so sánh với khóa đã sắp).
Fixture e2e tự chọn cổng loopback trống; tôi không khởi động server riêng; không còn gì đang chạy.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A6.md](WP5_UX_REVIEW_A6.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A6 lần 1; agent reviewer ae28cb6041639f3c1
  (board); tác giả của delta WP5-UX-FIX7 ac4684761796f0e78 (claude-opus-5-5); các tác giả trước của vòng như liệt kê
  trong `WP5_UX_REVIEW_A5.md`.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer này không viết gì trong vòng thiết kế lại và
  không chạy gate, đợt quét hay audit nào trước đó của vòng; chỉ viết review này, bản dịch, phần Results của task và
  `evidence/WP5-UX-AUDIT-A6/`; các export và bản build của bf954c0, 5e104e1 và 014bd47 cùng mọi probe chạy trong thư
  mục task, không bao giờ trong repository.
- Digest trước/sau; bằng chứng gate snapshot đó: b7c011d2 trước và sau; WP5-UX-REGATE5 PASS trên cùng freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A6.md` (mới); `WP5_UX_REVIEW_A.md` đến
  `WP5_UX_REVIEW_A5.md` giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không có phát hiện; vùng A không cần task sửa.
