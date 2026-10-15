# Vòng thay đổi giao diện thứ hai của WP5, audit độc lập vùng A và B trên d1a20a7 (WP5-UX2-AUDIT)

Bản dịch của [WP5_UX2_REVIEW.md](WP5_UX2_REVIEW.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện thứ hai theo yêu cầu của chủ trong WP5 (các slice WP5-UX2-T01
  đến T10), task WP5-UX2-AUDIT, attempt 1, 2026-10-15 từ 06:40Z đến khoảng 08:35Z (2026-10-14 23:40 đến khoảng 01:35 giờ America/Los_Angeles).
  Reviewer tự báo model `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Một audit gộp
  vùng A (thanh kỳ, Today, Current period, bảng timesheet, ngày ghi sổ) và vùng B (khung ứng dụng, thương hiệu, giao diện, điều khiển, khả năng
  truy cập, chia sẻ). Mọi review trước (A đến A7, B đến B7, AB8, AB9) được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `d1a20a7f0112fa00171fe4b1d6035427855f12b6` (bản freeze của WP5-UX2-T10, `freeze_commit` của WP5-UX2-GATE). HEAD = origin/main = d1a20a7 trước
  và sau; không có commit chưa push; không path nào ngoài `handoff/` bị sửa hay chưa theo dõi. Digest
  `20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5`, 814 file, không tính `handoff/`, ghi đầu tiên (06:41Z) và cuối cùng
  (08:30Z), mỗi lần ở ba dạng bằng nhau: một bản export sạch bằng `git archive` băm bằng `git hash-object --no-filters`, dạng
  `git ls-tree d1a20a7` (danh sách đã sắp xếp giống từng byte với danh sách của bản export), và `npm run digest` trong repository. Source đủ:
  `npm ci` exit 0 trong bản export.
- **Quyết định: FIX REQUIRED.**
  - Vòng này làm đúng điều chủ yêu cầu ở cả 16 mục và cả hai câu trả lời (mục 1). Các lựa chọn của coordinator (chữ thương hiệu từ 1440px,
    "Review" là dạng rút gọn của các nhãn review khác, mũi tên, token hover dùng chung toàn app, thanh điện thoại 112px khi có chia sẻ, các mục
    docs/10 E-1 và F-Q5 được viết lại) tôn trọng yêu cầu và đã được ghi.
  - Today và Current period chỉ dùng `today_local`, `current` và `in_progress` của server, ở chế độ của chính người dùng và ở chế độ xem chia sẻ
    (ngày của chủ), vào các ngày cửa sổ, lúc nửa đêm, cả hai ngày DST và lúc sang năm, với thiết bị ở rất xa múi giờ báo cáo (mục 2).
  - Không có check in/out trong bất kỳ chế độ xem chia sẻ nào ở mọi độ rộng, ClockProvider không bao giờ thao tác thay người khác, và quyền của
    người được chia sẻ không đổi (mục 3). Phần thay đổi ở server đúng là ba chuỗi thông báo và một comment (mục 4). Tài nguyên thương hiệu là
    vector, an toàn và trung thành với ảnh của chủ; không có file font trong repository; CSP không đổi (mục 7).
  - Các kiểm tra bắt buộc đạt: typecheck 0, lint 0, `npm test` 88 file / 1878 test, TOÀN BỘ e2e với đồng hồ thật 434 đạt / 0 lỗi / 42 bỏ qua
    (desktop 209/29, mobile 225/13), AC-13 1/1; build 0, smoke PASSED; 0 dòng deprecation.
  - Ba phát hiện mức Thấp chặn việc nghiệm thu sạch: WP5-UX2-AUDIT-01 (Today vẫn không hoạt động và không làm gì sau khi ngày ghi sổ qua nửa đêm
    trong lúc trang đang mở), WP5-UX2-AUDIT-02 (docs/04 và docs/10 không nói về hàng nút trên điện thoại ở 320px) và WP5-UX2-AUDIT-03
    (vòng focus của Today không hoạt động bị `opacity: 0.6` làm mờ còn 2.70:1 ở giao diện sáng, dưới mức 3:1 chủ đã quyết). Mỗi phát hiện có
    một cách sửa nhỏ, có phạm vi. Mọi đột biến brief nêu đều bị bắt (mục 6); việc đổi tên bị đảo ở ba chỗ không test nào đọc thì sống sót
    (rủi ro R-UX2A-2).
  - Năm rủi ro tùy chọn (R-UX2A-1 đến R-UX2A-5) được liệt kê riêng; R-UX2-1 (`/theme-init.js` không có `Cache-Control`) được đánh giá là chấp
    nhận được.

## Phạm vi thật đã xem và chạy

1. Các quyết định của chủ và của coordinator ngày 2026-10-14 trên bảng (nguyên văn), các plan PLAN đến PLAN4, mockup, các bản ghi slice T01 đến
   T10, bản ghi gate cùng ảnh chụp, review AB9 và lượt rà AX-01..AX-10, đọc như các tuyên bố.
2. Toàn bộ diff 90b98ef..d1a20a7 ngoài `handoff/` (67 path): source client, CSS, file server, các test và tài liệu.
3. Các kiểm tra bắt buộc trong một bản export sạch: typecheck, lint, `npm test`, build, smoke, TOÀN BỘ e2e trên cả hai project với đồng hồ thật,
   AC-13.
4. Bản build sạch của chính tôi cho 90b98ef và d1a20a7 và so `dist/` từng file; một probe header trên cả hai server đã build.
5. Các probe đồng hồ giả lập của chính tôi (ngày cửa sổ, nửa đêm, DST, sang năm, múi giờ thiết bị ở xa, chủ chia sẻ ở múi giờ khác) và một lần
   tái hiện nửa đêm khi trang để mở.
6. Một lượt quét axe-core và các lượt đi bàn phím ở 1440, 1280, 1024, 768 và 390, 375, 360, 320 với sáng, tối và cả hai lựa chọn tay, cùng vòng
   focus thực vẽ của Today không hoạt động; một lượt axe nền trên 90b98ef.
7. Vẽ lại logo và chữ thương hiệu cạnh ảnh nguồn của chủ.
8. Đột biến ở mức unit và e2e (24 lần chạy: 19 e2e và 5 unit hoặc integration; 20 đột biến khác nhau).
9. Tài liệu: docs/04, docs/10, docs/12, các dòng đổi tên trong docs/01, docs/02 và DEVELOPMENT, EN và VI.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che dữ liệu trong `handoff/delivery/evidence/WP5-UX2-AUDIT/` (mục lục `00-README.txt`), cùng bốn ảnh
`-synthetic.png`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng, đầu và cuối; HEAD; trạng thái ngoài handoff | `20e7a7c8…a609773fa5`, 814 file mọi lần; danh sách export = danh sách `ls-tree`; HEAD = origin/main = d1a20a7; không có thay đổi ngoài handoff | `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (bản export sạch) | exit 0 | `02-ci-exit.txt` |
| typecheck / lint (`no-deprecated`) / `npm test` / build / smoke | 0 / 0 / 0, 88 file, 1878 test / 0 / 0, SMOKE PASSED; 0 dòng deprecation trong mỗi log; lần chạy `npm test` thứ hai: 0, 88 / 1878 | `05-…` |
| TOÀN BỘ e2e, cả hai project, đồng hồ THẬT, 2026-10-14 23:44-23:54 PDT (ngày cửa sổ) | **exit 0: 434 đạt, 0 lỗi, 42 bỏ qua** (desktop 209/29, mobile 225/13), 9.8 phút | `20-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần (và thêm một lần với `TZ=Asia/Tokyo`) | exit 0, 1/1 (cả hai) | `21-ac13.txt`, `21-ac13-tokyo.txt` |
| `git diff --stat 90b98ef d1a20a7` (phạm vi; server, domain, migrations) | 67 path; server/domain/migrations: chỉ `timesheetCommands.ts` 4/4 | `10-…`, `11-…` |
| bản build của tôi cho 90b98ef và d1a20a7, `diff -r dist/` | `dist/domain` giống nhau; `dist/server` 1 trên 180 file, 4 dòng (3 chuỗi, 1 comment) | `13-…` |
| probe header trên cả hai server đã build | CSP giống nhau; `/theme-init.js` `text/javascript`, `/cd-logo.svg` `image/svg+xml`, `nosniff`; không file tĩnh nào có `Cache-Control` (cả hai bản build) | `81-…` |
| font và raster trong `git ls-files` | 0 file font; một `.jpg` tổng hợp cũ ngoài vòng này | `10-fonts.txt`, `10-rasters-nonsynthetic.txt` |
| tìm đọc đồng hồ thiết bị ở client; chuỗi "Clock" hiển thị | 0 / 0 | `31-…`, `33-…` |
| diff của test | 76 dòng bị bỏ, đều được thay bằng kiểm tra bằng hoặc mạnh hơn; thêm 5 skip theo project; không có only/fixme/fail/slow/soft | `50-…` |
| tương ứng tài liệu EN/VI, tìm từ cũ | cùng cấu trúc và token nguyên văn; chỉ yêu cầu được trích của chủ còn "Clock in/out" | `40-…`, `41-…` |
| đối chứng đồng hồ giả lập | server `today_local` 2026-10-26 lúc 00:30 PDT; thật 2026-10-14 | `61-…` |
| các probe Today của tôi, 11 thời điểm, cả hai project | mỗi lần 8 đạt, 2 bỏ qua, 0 lỗi | `62-probe-*.txt` |
| probe nửa đêm (trang mở qua 2026-10-25/26) | **lỗi**: Today vẫn không hoạt động, cú bấm không làm gì (phát hiện 01) | `62-probe-midnight-1025.txt` |
| lượt quét của bộ test: today/timesheet lúc 2026-10-26 00:30, today lúc 2026-10-30 23:45 | cả hai ở nhánh cửa sổ; 59 đạt / 0 lỗi / 11 bỏ qua và 17 / 0 / 5; ngân sách ở xa 690.0 và 591.0 trên 788 | `64-…` |
| quét axe-core 4.14.0; axe nền trên 90b98ef | 144 lượt: desktop 64/64 sạch; điện thoại: chỉ có lệch tên nút ngày mà 90b98ef cũng có, và `target-size` trên liên kết review ở 375px khi đã cuộn xuống dưới thanh dính lúc có lớp phủ mở (lượt kiểm thêm không có chia sẻ không thấy) | `70-…`, `71-…`, `74-…` |
| các lượt đi bàn phím | 32 lượt, 2,784 điểm dừng: 0 không có vòng focus, 0 bị che, 0 nhỏ hơn 24px, 0 điều khiển của vòng này trên điện thoại nhỏ hơn 44px, không cuộn ngang | `71-…` |
| vòng focus thực vẽ của Today không hoạt động | không hoạt động 2.70:1 (sáng) và 3.34:1 (tối), khi hoạt động 6.09 / 6.79; cả hai project, bốn tình huống (phát hiện 03) | `71-…`, `75-ringcalc.txt` |
| đột biến, unit và e2e | 20 đột biến trong 24 lần chạy: 16 bị bắt, gồm mọi đột biến brief nêu; 4 sống sót: đổi tên ở ba chỗ không có test (R-UX2A-2) và riêng `nowrap` (tương đương); digest bản tạm bằng 20e7a7c8… sau mỗi lần khôi phục | `72-…`, `70-mut-*.txt`, `73-mutation-summary.txt` |
| logo và chữ thương hiệu so với ảnh của chủ | chênh lệch trung bình của logo 0.456 / 0.437 / 0.424 ở 512 / 64 / 32 px; chênh lệch độ sáng của chữ 30.8/255, IoU mực 0.655 | `80-fidelity.txt`, `audit-brand-fidelity-synthetic.png` |

## 1. Trung thành với yêu cầu của chủ (câu hỏi audit 1)

Đối chiếu với nguyên văn yêu cầu của chủ ngày 2026-10-14 trên bảng (`owner_decisions`), mockup, ảnh chụp của gate và các lần chạy của tôi.

| Yêu cầu của chủ (2026-10-14) | Bản build tại d1a20a7 | Kết luận |
|---|---|---|
| UX2-1 (1) tô sáng cả cột của ngày đang mở trong Day editor | Desktop: thanh nhấn hai bên, đường gạch dưới đầu cột và nền nhạt sau mọi ô, chồng được lên thanh Today và vòng chọn nhiều ngày; điện thoại: hàng được khung lại; `aria-current="true"` chỉ trên nút của ngày đó | Đã làm |
| UX2-1 (2) kiểu chọn nhẹ hơn trong bộ chọn Label | Đường 1px trên nút mở, lựa chọn đang hoạt động có nền nhạt và thanh nhấn 3px ở mép đầu (không khung), giá trị hiện tại có chữ màu nhấn và dấu chọn | Đã làm |
| UX2-1 (3) nút chuyển tối/sáng trên thanh điều hướng chính | Thanh trên cùng của desktop (nhóm người dùng); bảng More trên điện thoại; lưu theo thiết bị, áp dụng trước lần vẽ đầu | Đã làm (sau đó đổi dạng theo UX2-4 (3)) |
| UX2-1 (4) hover rõ trên các nút chuyển | Nền hover 1.23:1 (sáng) / 1.45:1 (tối) so với lúc nghỉ (trước là 1.13 / 1.09) kèm viền nhấn; trạng thái nhấn là nền nhấn đặc và giữ nguyên khi con trỏ ở trên | Đã làm; token hover dùng chung toàn app của coordinator là mở rộng nhất quán, đã ghi trong docs/10 và docs/04 |
| UX2-1 (5) nút Today tường minh | Today trên thanh kỳ, chỉ dùng ngày của server, chuyển trình sửa đang mở sang hôm nay | Đã làm, kèm phát hiện WP5-UX2-AUDIT-01 (trang để mở qua nửa đêm) |
| UX2-1 (6) Show details thành công tắc trượt | Checkbox gốc với `role="switch"`, rãnh 44x24, vị trí núm và nền | Đã làm |
| WP5-UX2-Q1: Today = kỳ chứa hôm nay; nút thứ hai quay về kỳ mở trang | Today nhắm `in_progress`; "Current period" nhắm `current` của R-07, chỉ hiện trong năm ngày cửa sổ và chỉ khi đang ở kỳ khác | Đã làm; tên "Current period" khớp nhãn "current" của kỳ |
| UX2-2 (1) logo thay chữ thương hiệu, "CDSemi" khi đủ chỗ | Logo vector vẽ lại (cũng là favicon); phần chữ sau đó được thay bằng chữ thương hiệu của UX2-3 | Đã làm (được thay bởi UX2-3 (1)) |
| UX2-2 (2) điện thoại: Check in/out lên thanh tiêu đề; Today, Current period và Review cùng một hàng | Thanh chứa trạng thái và một nút trên mọi màn hình của chính người dùng (60px, 112px khi có hàng "Shared with me"); ba nút chung một hàng ở 390, 375 và 360px | Đã làm ở 390/375/360; ở 320px khi có Current period thì liên kết Review xuống hàng riêng, điều docs/04 không nói (phát hiện WP5-UX2-AUDIT-02) |
| UX2-2 (3) "Clock in/out" thành "Check in/out" | Mọi chuỗi hiển thị của client, ba chuỗi thông báo của server, docs/01, 02, 04, 10, 12 và DEVELOPMENT; đường dẫn API, mã lỗi và định danh giữ "clock" | Đã làm; vài chuỗi đã đổi không có test (rủi ro R-UX2A-2) |
| UX2-3 (1) chữ thương hiệu hai dòng cạnh logo, màu của ảnh, font của công ty | Đường viền vector (không có file font), "Semiconductor" là chữ S hoa cùng chữ hoa nhỏ, trên "SERVICES, INC.", `#006eba` / `#4c4f57`, logo bên trái, chữ bên phải, từ 1440px | Đã làm; ngưỡng 1440px (kế hoạch là 1280) giữ thanh có chia sẻ trên một hàng, đã ghi trong docs/10 |
| UX2-3 (2) bỏ dòng tên công ty khỏi timesheet trên màn hình | Đã bỏ khỏi bảng Timesheet và bảng Review; PDF giữ phần đầu | Đã làm |
| WP5-UX2-Q2: cho phép đường viền; sắc nhạt hơn ở giao diện tối | Đường viền; giao diện tối dùng `--accent` / `--muted` (6.79 / 6.56:1 trên thanh) | Đã làm |
| UX2-4 (1) điện thoại: "Sign off" thay vì xuống dòng, chữ đầy đủ khi vừa | Một dòng, 44px; "Sign off" cho "Review & sign off", "Review" cho "Review now" và "Review or correct"; tên truy cập là nhãn đầy đủ | Đã làm; "Review" cho hai nhãn kia là lựa chọn hợp lý của coordinator, đã ghi |
| UX2-4 (2) menu cách xa thương hiệu hơn trên màn hình lớn | 32px từ 1440px (trước là 24px), nơi chữ thương hiệu hiện; 24px dưới 1440px, nơi chỉ có logo 36px | Đã làm cho màn hình từ 1440px; đã ghi. Từ 1280 đến 1439px khoảng cách không đổi (chỉ có logo); chủ có thể muốn xem trên màn hình của mình (không phải lỗi) |
| UX2-4 (3) nút Dark/Light kèm biểu tượng thay cho nút "Dark mode" | Nhóm radio "Theme", Light (mặt trời) và Dark (mặt trăng), trên thanh và trong More | Đã làm |
| UX2-4 (4) "Due" theo kiểu nhãn | "Due" có màu và độ đậm của nhãn như "Payroll date", giá trị giữ kiểu giá trị, nội dung chữ không đổi | Đã làm |
| UX2-4 (5) chữ "to" trong khoảng kỳ | Mũi tên màu nhãn `aria-hidden` kèm " to " ẩn (trình đọc màn hình đọc "to"); văn bản vùng live và PDF giữ "to" | Đã làm; lựa chọn của coordinator trong các phương án của chủ, đã ghi |

Các lựa chọn khác của coordinator: thanh điện thoại 112px khi có chia sẻ là cái giá thật của việc đưa check in/out lên thanh, và màn hình đầu vẫn
giữ được (trạng thái mở trang xấu nhất 722.4 trên 788); các mục docs/10 E-1 và F-Q5 được viết lại thành "Check out"/"Check in/out" chỉ về thuật
ngữ, có nêu trong gạch đầu dòng thuật ngữ mới của docs/10, còn lịch sử nguyên văn vẫn nằm trên bảng. Tôi chấp nhận cả hai.

## 2. Ngày ghi sổ và múi giờ (câu hỏi audit 2, AGENTS quy tắc 7)

- **Mã nguồn.** `src/client` không đọc đồng hồ thiết bị: tìm `new Date(`, `Date.now`, `Date.UTC`, `performance.now` và `Temporal.` không ra gì
  (`31-device-clock-grep.txt`, rỗng). `periodJumpModel.ts` nhận `today_local`, `current` và `in_progress` của server và chỉ so sánh ngày ISO;
  `TimesheetScreen.tsx` đọc chúng qua `request('/periods/current')`, tức là requester của chia sẻ khi ở chế độ xem chia sẻ. Đích của Today là
  `in_progress.payroll_date`; của Current period là `current.payroll_date`; Current period chỉ hiện khi `current != in_progress` và kỳ đang hiện
  không phải `current`.
- **Các probe đồng hồ giả lập của tôi** (`shiftclock.mjs` của FIX10, bản chép giống từng byte; đối chứng: server đã build báo `today_local` giả
  lập, 2026-10-26 lúc 00:30 PDT, `61-…`). Trình duyệt không bị dịch giờ, nên ngày của chính nó là ngày thật 2026-10-14/15 trong khi server cách
  nhiều ngày hoặc nhiều tháng: một client dùng ngày thiết bị sẽ trượt mọi probe. Spec tạm `zz-audit-probe.spec.ts` chạy trên cả hai project với
  thiết bị ở Pacific/Kiritimati (UTC+14) và ở Pacific/Pago_Pago (UTC-11), cùng một chế độ xem chia sẻ mà chủ báo cáo ở Pacific/Kiritimati
  còn thiết bị của người được chia sẻ ở Pago Pago. Mười một thời điểm: 2026-10-25 23:30 (cuối ngày P-5, trước cửa sổ), 2026-10-26 00:30 (P-4,
  ngày đầu của cửa sổ), 2026-10-28 12:00, 2026-10-30 23:50 (P), 2026-10-31 00:30 (P+1), 2026-11-01 01:30 PDT và 01:30 PST (giờ lặp do DST),
  2027-03-14 03:30 (sau khi đổi giờ mùa xuân), 2026-12-31 23:50, 2027-01-01 00:30 và đồng hồ thật. Mỗi lần: 8 đạt, 2 bỏ qua (test trình
  sửa chỉ cho desktop, ở cả hai múi giờ thiết bị, trên project mobile), 0 lỗi (`62-probe-*.txt`). Ở mọi lần, nhãn Today nằm đúng ngày của
  server, Today không hoạt động đúng khi kỳ đang hiện chứa ngày đó, Today mở `in_progress`, Current period chỉ hiện trong cửa sổ và quay về `current`, trình sửa đang mở chuyển sang ngày
  của server, và mỗi lần nhảy đọc lại `/periods/current`. Trong chế độ xem chia sẻ, cả hai nút theo ngày của chủ, kể cả ở các thời điểm mà ngày
  của chủ khác ngày của người được chia sẻ (ví dụ 2027-03-14 03:30: chủ 2027-03-15 trong cửa sổ, người được chia sẻ 2027-03-14 ngoài cửa sổ),
  không có request nào tới `/api/clock` hay tới `/api/periods/current` của chính người được chia sẻ.
- **Lượt quét của bộ test** ở ngày đầu cửa sổ: `today.spec.ts` và `timesheet.spec.ts` lúc 2026-10-26 00:30 PDT (nhánh cửa sổ: exit 0, 59 đạt, 0 lỗi, 11 bỏ qua; ngân sách ở trạng thái ở xa tại 390x844 với nhãn Today ở hàng
  đầu là 690.0 khi có ghi chú múi giờ và 591.0 khi không, trên 788); và
  `today.spec.ts` lúc 2026-10-30 23:45 PDT (nhánh cửa sổ: exit 0, 17 đạt, 0 lỗi, 5 bỏ qua; `64-…`).
- **Nửa đêm khi trang đang mở: phát hiện WP5-UX2-AUDIT-01.** `zz-audit-midnight.spec.ts` đăng nhập lúc 2026-10-25 23:59:20 PDT (P-5, ngày cuối
  của kỳ đang chạy), chờ tới khi ngày của server thành 2026-10-26 (ngày đầu cửa sổ, `in_progress` chuyển sang 10/26-11/08), rồi bấm Today. Trang
  vẫn hiện Today không hoạt động (`aria-disabled="true"`), nhãn Today ở 10/25, và cú bấm không đổi gì: bảng vẫn ở 10/12-10/25
  (`62-probe-midnight-1025.txt`: kỳ vọng `10/26/2026→ to 11/08/2026`, nhận được `10/12/2026→ to 10/25/2026`).

## 3. Quyền sở hữu và chia sẻ (câu hỏi audit 3)

- **Không có check in/out trong chế độ xem chia sẻ, ở mọi độ rộng.** `AppShell.tsx` render `ClockProvider enabled={route !== 'shared'}`; khi tắt,
  provider cho context `null`, không gửi request và không hiện hộp thoại; `BarClock` và `ClockPanel` không render gì khi thiếu nó, và trang
  Timesheet chỉ render thẻ khi `own && desktop`. Probe của tôi mở một chia sẻ quyền sửa trên cả hai project và kiểm ở 1280 hoặc 390, rồi 1440,
  390 và 320: không có nút "Check in", "Check out", "Clock in" hay "Clock out", không có `.bar-clock`, `.clock-panel` hay `[data-clock]`, không
  có vùng "Check in and out", và không có request `/api/clock` nào trong cả phiên (`62-probe-*.txt`). `sharing.spec.ts` và `shell.spec.ts` khẳng
  định điều tương tự và đã đạt.
- **ClockProvider không bao giờ thao tác trên timesheet của người khác.** Nó chỉ gọi các route của chính người dùng qua `api()` (`/api/clock/in`,
  `/api/periods/current`, `/api/timesheets/{date}`), không bao giờ dùng requester của chia sẻ; trang Timesheet chỉ báo view cho nó khi `own`
  (`TimesheetScreen.tsx:159-163`); rời sang một địa chỉ chia sẻ thì trạng thái của nó được đặt lại (`ClockProvider.tsx:134-142`).
- **Các thao tác được phép của người được chia sẻ không đổi.** `dist/server` chỉ khác 90b98ef ở ba chuỗi thông báo và một comment, nên mọi route,
  điều kiện chặn và danh sách cho phép của chia sẻ giống từng byte. Ở client, người được chia sẻ chỉ có thêm Today và Current period, hai nút
  điều hướng qua chia sẻ (`expectOnlySharedRequests` trong `sharing.spec.ts:539-624`, và probe của tôi không thấy request tới kỳ của chính
  người được chia sẻ).

## 4. Phần thay đổi ở server (câu hỏi audit 4)

- `git diff --stat 90b98ef d1a20a7 -- src/server src/domain migrations`: chỉ có `src/server/services/timesheetCommands.ts`, 4 dòng thêm và 4 dòng
  bỏ (`10-bound-stat.txt`, `11-server-src-diff.txt`).
- Bản build sạch của tôi cho cả hai commit (`npm ci` và `npm run build`, mỗi lệnh exit 0): `dist/domain` giống nhau (46 file, `diff -r` exit 0);
  `dist/server` mỗi bên 180 file và chỉ một file khác, `services/timesheetCommands.js`, ở bốn dòng: "Clock out of the running session first" →
  "Check out of …" (409 `open_session_exists`), "… to clock out of" → "… to check out of" (409 `no_open_session`), "A saved break ends after this
  Clock out; …" → "… Check out; …" (422 `saved_break_after_clock_out`), và dòng comment. Không đường code, trạng thái, mã lỗi, đường dẫn API hay
  loại sự kiện nào đổi (`13-dist-diff.txt`). `dist/client` khác đúng như dự kiến (bundle mới, `theme-init.js`, `cd-logo.svg`, `index.html`).
- Header CSP giống từng byte trên cả hai bản build (`81-headers-new.txt`, `81-headers-old.txt`).

## 5. Khả năng truy cập, WCAG 2.2 AA, không thụt lùi (câu hỏi audit 5)

- **Các kiểm tra của bộ test đạt trong lần chạy đồng hồ thật của tôi** (434 đạt, `20-…`): AX-01 các lượt Shift+Tab với một chia sẻ nhận được
  (thanh điện thoại 112px) ở 1280, 768, 390, 375, 360 và 320 (`keyboard-access.spec.ts`, 0 điểm dừng bị che); AX-02 thanh nhấn của bộ chọn nhãn
  rộng ít nhất 2px và 3:1 so với nền lựa chọn và card (`focus-ring.spec.ts`, `expectRail`); AX-03 vòng focus của hộp thoại và bảng; AX-04 nút
  "Change several days" đang nhấn và cả hai phân đoạn giao diện đang chọn, với vòng/khe và khe/nền đạt 3:1; AX-05 tên nút ngày; AX-06 bộ chuyển;
  AX-07 vai trò alert và status (lỗi check in/out là `role="alert"` cả trên thanh và trong thẻ); AX-08 trả tiêu điểm, nay cả từ hộp thoại
  check out về nút trên thanh; AX-09 độ tương phản chữ trên nền đang sửa (thấp nhất 4.52 sáng / 4.62 tối); AX-10 dàn lại khi chọn nhiều ngày ở
  320px. Bốn tình huống giao diện (sáng, tối, chọn tối trên thiết bị sáng, chọn sáng trên thiết bị tối) được theme.spec, hover.spec,
  focus-ring.spec và timesheet.spec khẳng định trên cả hai project.
- **Lượt quét axe-core 4.14.0 của tôi** (chỉ cài trong thư mục task, `70-axe-install.txt`; tag wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa;
  CSP chỉ được bỏ qua trong context của probe đó để chèn được script): 144 lượt quét (mở trang, trạng thái ở xa, bật Show details, mở bộ chọn nhãn và, trên điện thoại, mở bảng More, ở 1440, 1280,
  1024 và 768 và ở 390, 375, 360 và 320 có một chia sẻ nhận được, trong bốn tình huống giao diện; `71-a11y-2-summary.txt`). Desktop: 64 trên 64
  lượt không có vi phạm. Điện thoại: mọi lượt báo `label-content-name-mismatch` trên 14 nút ngày, điều mà cùng lượt quét trên 90b98ef cũng báo
  (`74-axe-base-old.txt`; rủi ro R-UX2A-4); và chỉ 8 lượt ở 375px, khi bộ chọn hoặc bảng More đang mở, báo `target-size` trên liên kết review: ở
  các trạng thái đó trang đã cuộn sao cho liên kết nằm một phần dưới thanh dính 112px. Một lượt kiểm thêm không có chia sẻ ở 390, 380, 375, 370
  và 360 với từng lớp phủ mở, trên d1a20a7 và trên 90b98ef, không báo `target-size` (`77-axe375-*.txt`); liên kết cao 44px. Tôi hiểu đây là sự
  chồng lấn theo vị trí cuộn với thanh dính, không phải lỗi kích thước (tôi không lặp lại lượt quét có chia sẻ). Không quy tắc nào khác
  trượt: tương phản màu, vai trò, thuộc tính ARIA, tên, landmark và nhóm radio đều đạt trong cả bốn tình huống giao diện. Lượt quét nền của trang
  mở trên d1a20a7 bằng lượt của 90b98ef, trừ một kết quả `target-size` trên các liên kết điều hướng của bản build cũ nay đã hết
  (`74-axe-base-new.txt`).
- **Các lượt đi bàn phím của tôi** (tới từ đầu và lùi từ cuối trang Timesheet, mọi độ rộng, bốn tình huống giao diện; một điểm dừng đạt khi có
  vòng focus được vẽ, ít nhất một trong 25 điểm mẫu không bị che, và hộp của nó ít nhất 24x24, 44x44 trên điện thoại cho các điều khiển của vòng
  này): 32 lượt (8 độ rộng x 4 tình huống; điện thoại có một chia sẻ nhận được, nên thanh cao 112px), 44 điểm dừng mỗi chiều trên
  desktop và 43 trên điện thoại, tổng 2,784 điểm dừng: mọi điểm dừng có vòng focus được vẽ, không điểm nào bị thanh dính che, không điểm nào
  nhỏ hơn 24x24, mọi điều khiển của vòng này trên điện thoại ít nhất 44x44, và không độ rộng nào cuộn ngang (`71-a11y-2-summary.txt`). Thứ tự
  đúng như tài liệu: các liên kết điều hướng, nhóm Theme (một điểm dừng), Sign out, Previous, Next, Today, Review & sign off, Check in (thẻ trên
  desktop), Open a day, công tắc Show details, Change several days, rồi nút và bộ chọn nhãn của từng ngày; trên điện thoại nút Check in của
  thanh đứng đầu.
- **Các điều khiển mới so với các SC được nêu.** 1.3.1/4.1.2: `radiogroup` "Theme" với hai radio gốc, công tắc gốc, `aria-current` trên một nút
  ngày, Today `aria-disabled` kèm mô tả, một vùng live polite atomic cố định (4.1.3) cho các lần nhảy; 1.4.1: thanh nhấn, dấu chọn, vị trí núm,
  nền đã chọn và trạng thái radio là hình dạng hoặc ngữ nghĩa, không chỉ màu; 1.4.3/1.4.11: các dòng tương phản của bộ test (hover 1.23/1.45, viền
  6.09/6.79, trạng thái công tắc ít nhất 4.53, thanh nhấn ít nhất 4.72, chữ thương hiệu 5.33/8.19 sáng, 6.79/6.56 tối); 2.1.1: tới được và dùng
  được bằng bàn phím (phím mũi tên trong nhóm radio, Space trên công tắc); 2.4.3: Previous, Next, Today, Current period, Review, và tiêu điểm về
  Today sau Current period; 2.4.7/2.4.11: xem các lượt đi bàn phím và phát hiện WP5-UX2-AUDIT-03; 2.5.3: nhãn rút gọn của Review nằm trong tên truy
  cập đầy đủ, mũi tên bị ẩn và " to " được đọc; 2.5.8: Today, Current period, liên kết review, nhãn công tắc và nút Check in/out trên thanh đều
  44px trên điện thoại (nút 87.4x44 trong gate, ít nhất 44 trong lượt đi của tôi).
- **Vòng focus của Today không hoạt động.** Điểm ảnh thực vẽ trong dải vòng focus, trên cả hai project và cả bốn tình huống, ở cả hai lần
  chạy a11y (`71-a11y-real.txt`, `71-a11y-2-summary.txt`): khi không hoạt động, 121,159,217 trên card trắng = 2.70:1 ở giao diện sáng (thiết bị sáng và chọn sáng) và 76,114,169 trên `#1a2029` = 3.34:1 ở giao diện tối;
  cùng nút đó khi hoạt động vẽ 6.09:1 và 6.79:1. Các giá trị khớp với phép pha trộn opacity 0.6 đã tính (`75-ringcalc.txt`: 2.70 và 3.33).
  Phát hiện WP5-UX2-AUDIT-03.

## 6. Độ mạnh của test (câu hỏi audit 7)

- **Các khẳng định đã đổi, không cái nào bị làm yếu ngoài các thay đổi vai trò và chiều cao đã ghi.** 76 dòng bị bỏ trên 25 file test (`50-…`):
  đổi Clock → Check (danh sách cấm giữ cả hai tên), Show details `aria-pressed` → `role=switch` với `toBeChecked`, kiểm khung AX-02 → `expectRail`
  (không khung, thanh nhấn ít nhất 2px, 3:1 so với nền và card), vòng AX-04 mở rộng sang các phân đoạn giao diện với kiểm vòng/khe và khe/nền,
  thứ tự tab có Today, dòng tên công ty thành sự vắng mặt rõ ràng cộng các thông tin đầu bảng còn lại, và giới hạn thanh điện thoại 60 → 60 hoặc
  112.5 khi có chia sẻ, nay kèm phép so bằng `--shell-bar-size` (T09). Mỗi thay thế khẳng định cùng điều đó hoặc nhiều hơn. Skip được thêm: năm,
  tất cả theo project (`test.skip(isMobile …)` hoặc ngược lại); không thêm `.only`, `fixme`, `test.fail`, `slow` hay `expect.soft`. Không file
  test nào mất một `expect(` hay một test (`51-expect-counts.txt`); bộ vitest tăng từ 83 file / 1831 test trên 90b98ef lên 88 / 1878, và bộ
  e2e từ 236 lên 476 test trên cả hai project.
- **Đột biến** (mỗi lần một cái trong các bản export tạm, khôi phục sau đó; digest của bản export tạm lại bằng 20e7a7c8… ở cuối):

| ID | Đột biến | Lần chạy (thời điểm giả lập) | Kết quả |
|---|---|---|---|
| M1 | Today đọc ngày của thiết bị (`TimesheetScreen.tsx`, ba chỗ) | today.spec, cả hai project, 2026-10-27 13:00 PDT | bị bắt: 7 lỗi (desktop 4, mobile 3) |
| M2 | Today nhắm `current` (`periodJumpModel.ts`) | unit `periodJumpModel.test.ts`; today.spec, cả hai, 2026-10-27 13:00 | bị bắt: unit 3 lỗi; e2e 5 lỗi |
| M3 | bỏ `aria-current` khỏi nút của ngày đang sửa (cả hai bố cục) | timesheet.spec, cả hai, 2026-10-21 12:00 | bị bắt: 20 lỗi |
| M4a | bỏ hai thanh nhấn của cột đang sửa trên desktop (viền `::after`) | timesheet.spec, desktop | bị bắt: 4 lỗi |
| M4b | bỏ nền của hàng đang sửa trên điện thoại | timesheet.spec, mobile | bị bắt: 2 lỗi |
| M5 | giảm nửa nền hover sáng (dưới 1.20:1) | hover.spec, cả hai | bị bắt: 6 lỗi (desktop; điện thoại không có hover theo thiết kế) |
| M6 | bỏ `role="switch"` của Show details | timesheet.spec, cả hai | bị bắt: 15 lỗi |
| M7 | bỏ `<script src="/theme-init.js">` (không áp trước lần vẽ đầu) | theme.spec, cả hai | bị bắt: 14 lỗi |
| M8 | bật ClockProvider trong chế độ xem chia sẻ | sharing.spec và shell.spec, cả hai | bị bắt: 6 lỗi (điện thoại; trên desktop không có gì được vẽ trong chế độ xem chia sẻ và chính điều kiện chặn địa chỉ chia sẻ của provider vẫn ngăn request) |
| M9 | bỏ `<img>` logo | logo.spec, cả hai | bị bắt: 13 lỗi |
| M10a | đảo đổi tên trên nút Check in | shell.spec, cả hai | bị bắt: 7 lỗi |
| M10b | đảo đổi tên trên nhãn History/OT ("Clocked in") | unit `tests/client`; history-settings.spec và ot-leave.spec, cả hai | **sống sót** (359 unit, 22 e2e đạt): rủi ro R-UX2A-2 |
| M10c | đảo đổi tên trên chú thích chính sách ("first clock-in") | unit `tests/client`; history-settings.spec, cả hai | **sống sót** (359 unit, 14 e2e đạt): rủi ro R-UX2A-2 |
| M10d | đảo đổi tên trên thông báo check out cũ | day-editor.spec, cả hai | **sống sót** (50 đạt): rủi ro R-UX2A-2 |
| M10e | đảo đổi tên trên một chuỗi thông báo của server | integration `timesheet-api.test.ts` | bị bắt: 1 lỗi |
| M11 | bỏ `white-space: nowrap` của liên kết review | today.spec, mobile, 2026-10-27 13:00 | sống sót (10 đạt): đột biến tương đương với các font đã đo, vì quy tắc dạng rút gọn đã giữ nhãn trong hàng |
| M11b | bỏ quy tắc container dạng rút gọn (quy tắc một dòng bên cạnh Current period) | today.spec, mobile, 2026-10-27 13:00 | bị bắt: 1 lỗi |
| M12 | Current period hiện ngoài các ngày cửa sổ | unit; today.spec, cả hai, 2026-10-21 12:00 | bị bắt: unit 2 lỗi; e2e 6 lỗi |
| M13 | lựa chọn giao diện không được chép vào `data-theme` | theme.spec, cả hai | bị bắt: 36 lỗi |
| M14 | nới CSP (cho phép script `'unsafe-inline'`) | theme.spec, cả hai (build lại server) | bị bắt: 2 lỗi |

Mọi đột biến mà brief nêu đều bị bắt; việc đổi tên sống sót ở ba chỗ không test nào đọc (R-UX2A-2), và M11 không đổi hành vi với các font đã đo.
Sau mỗi lần khôi phục, digest của bản export tạm lại bằng 20e7a7c8… (20 lần kiểm, `73-mutation-summary.txt`).

## 7. Thương hiệu và quyền riêng tư (câu hỏi audit 6)

- **Không có file font, không có ảnh raster lạc.** `git ls-files` tại d1a20a7 không có `.ttf`, `.otf`, `.woff`, `.woff2` hay `.eot`
  (`10-fonts.txt`, rỗng). Ảnh raster duy nhất được theo dõi mà tên không kết thúc bằng `-synthetic.png` là file cũ
  `handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg` (tổng hợp theo tên, không thuộc vòng này; `10-rasters-nonsynthetic.txt`).
  `@pdf-lib/fontkit` và `dejavu-fonts-ttf` vẫn là dependency npm (không đổi); không có font nào trong repository.
- **SVG logo thuần vector và an toàn.** `src/client/public/cd-logo.svg` (3,440 byte) chỉ có `svg`, `circle`, `clipPath`, `g`, `rect` và `path`;
  tham chiếu duy nhất là `url(#disc)` nội bộ; không có `script`, `href`, `xlink`, `data:`, `image`, `text`, `foreignObject`, thuộc tính sự kiện
  hay `style`.
- **Chữ thương hiệu chỉ là đường viền.** `BrandWordmark.tsx` là một `svg` inline với hai phần tử `path` (`aria-hidden`, màu tô từ class CSS);
  không có `<text>`, không có `font-family` và không có `@font-face` ở đâu dưới `src/`; `wordmarkAsset.test.ts` bảo vệ điều này.
- **Trung thành với ảnh của chủ** (các bản chép nguồn trong thư mục tạm PLAN3 và PLAN4 vẫn còn; `80-fidelity.txt`,
  `audit-brand-fidelity-synthetic.png`). Logo, cả hai vẽ ở 512 trên nền trắng và thu nhỏ bằng cùng một bộ lọc hộp: chênh lệch tuyệt đối trung bình
  theo kênh 0.456 ở 512px (0.014% điểm ảnh lệch quá 48), 0.437 ở 64px và 0.424 ở 32px (0% lệch quá 48). Chữ thương hiệu: các path đã phát hành
  với màu giao diện sáng được vẽ vào hộp mực của ảnh 131x90 của chủ (hàng 62-84): chênh lệch độ sáng tuyệt đối trung bình 30.8 trên 255 và độ
  chồng mực (IoU) 0.655 so với một ảnh nguồn có nhòe và bóng đổ; ảnh đặt cạnh nhau cho thấy cùng dáng chữ, chữ S hoa cùng chữ hoa nhỏ, và dòng
  thứ hai giãn chữ. Tôi đánh giá cả hai là trung thành.
- **PDF giữ dòng tên công ty; bảng trên màn hình thì không.** `src/server/pdf` và `dist/server/pdf` không đổi; `timesheet.spec.ts` và
  `review.spec.ts` khẳng định sự vắng mặt trên hai bảng và tên xuất hiện đúng một lần (ẩn) trên thanh, và đã đạt.
- **CSP không đổi**, không có `securitypolicyviolation` (theme.spec, logo.spec); `/theme-init.js` là `text/javascript` và `/cd-logo.svg` là
  `image/svg+xml`, cả hai có `nosniff`.
- **R-UX2-1 (`/theme-init.js` không có `Cache-Control`).** Đúng, và đó là mẫu chung: trên cả hai bản build, `/`, `/theme-init.js`, `/cd-logo.svg`
  và các asset có hash đều có `Last-Modified`, không có `ETag` và không có `Cache-Control` (`81-…`). Trình duyệt có thể dùng lại một
  `theme-init.js` cũ trong một khoảng thời gian heuristic sau khi nâng cấp. Việc của file này nhỏ và ổn định (đọc một khóa, đặt một thuộc tính),
  và một bản cũ chỉ bỏ lỡ một thay đổi sau này của logic đó; `index.html` hiện cũng chịu như vậy. Đánh giá: một rủi ro mang theo chấp nhận được,
  không phải lỗi của vòng này (vòng này không được đổi server). Đề xuất sau: `Cache-Control: no-cache` cho `index.html` và `theme-init.js` (hoặc
  một tên có hash), và cache dài cho các asset có hash.

## 8. Tài liệu (câu hỏi audit 8)

- docs/04, docs/10, docs/12 và các dòng đổi tên trong docs/01 (FR-06), docs/02 (dòng 15) và DEVELOPMENT (dòng 68, 118) mô tả đúng sản phẩm đã
  build, trừ hàng ở 320px (WP5-UX2-AUDIT-02). Tương ứng EN/VI: sáu cặp có cùng tiêu đề, dòng bảng, gạch đầu dòng và mục đánh số, và cùng các
  token nguyên văn (số, px, tỉ lệ, mã màu hex, đoạn code) trừ dòng liên kết cặp bản dịch đã có và cách viết dấu phẩy thập phân nằm ngoài vòng
  này (`40-docs-parity.txt`). "Clock in/out" duy nhất còn trong tài liệu là yêu cầu được trích của chủ UX2-2 trong docs/10
  (`41-docs-clock-grep.txt`); không chuỗi hiển thị nào của client còn "Clock" (`33-client-clock-strings.txt`, rỗng).
- Không mâu thuẫn với quy tắc chuẩn (AGENTS quy tắc 8): R-07 và D-12 không đổi (kỳ mở trang), lựa chọn giao diện không phải dữ liệu nghiệp vụ,
  và FR-06/docs/02 chỉ đổi cách gọi. Câu "theo thiết bị" ở docs/04 dòng 82 cũ (nay là dòng 87) được thay theo chính yêu cầu của chủ và đã cập nhật ở cả hai ngôn ngữ.

## Phát hiện

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX2-AUDIT-01 | Thấp | `src/client/components/PeriodBar.tsx:121-125` (cú bấm bị bỏ qua khi `todayAway` là false) cùng `src/client/TimesheetScreen.tsx:399-408` (`todayAway` lấy từ lần đọc `periods` cuối của trang) | `zz-audit-midnight.spec.ts` lúc giả lập 2026-10-25 23:59:20 PDT, để trang mở tới khi ngày của server là 2026-10-26, rồi bấm Today (`62-probe-midnight-1025.txt`) | Kỳ vọng (docs/04 dòng 54): bảng không còn hiện ngày hôm nay, nên Today hoạt động và mở 10/26-11/08 với nhãn Today ở 10/26. Thực tế: Today vẫn `aria-disabled`, nhãn vẫn ở 10/25 và cú bấm không làm gì; chỉ hồi lại sau Next/Previous, tải lại trang, hoặc (chỉ ở chế độ của chính người dùng) khi tab được hiện lại | docs/04 dòng 54 (EN/VI); quy tắc B5 của PLAN "cú bấm đọc lại `/periods/current` trước … ngày có thể qua nửa đêm"; mục UX2-1 (5) của chủ | Cho cú bấm trên Today không hoạt động vẫn đọc lại `/periods/current` và quyết định theo câu trả lời đó (nhảy khi trạng thái mới là đang ở xa, nếu không thì giữ nguyên bảng và vùng live); có thể làm mới `periods` khi cửa sổ lấy lại tiêu điểm. Thêm một e2e đồng hồ giả lập đi qua nửa đêm của múi giờ báo cáo khi trang đang mở (probe trên là mẫu) |
| WP5-UX2-AUDIT-02 | Thấp (tài liệu) | `docs/04_UX_AND_SETTINGS.md` dòng 48 và 56 cùng `.vi.md`; gạch đầu dòng "Phone Review link" trong quyết định của coordinator ở docs/10 (EN/VI) | `today.spec.ts:414-417` (khẳng định và đạt) và `audit-today-bar-phone-away-w320-synthetic.png`: ở 320px khi Current period hiện, Today và Current period chung một hàng còn liên kết Review xuống hàng riêng với nhãn đầy đủ | Kỳ vọng: tài liệu mô tả hành vi ở 320px. Thực tế: tài liệu nói ba nút chung một hàng ("kể cả trong năm ngày khi Current period vào cùng hàng đó", "chung một hàng") | Câu hỏi audit 8; tài liệu theo bản build | Thêm một mệnh đề ở cả hai ngôn ngữ: "trên điện thoại hẹp nhất (dưới khoảng 330px) liên kết Review xuống hàng riêng với nhãn đầy đủ khi Current period hiện" |
| WP5-UX2-AUDIT-03 | Thấp | `src/client/styles.css:874-877` (`button[aria-disabled='true'] { opacity: var(--opacity-disabled) }`, mới ở T04) áp lên Today không hoạt động, mà vòng `:focus-visible` của nó thuộc chính phần tử bị làm mờ đó | Mở một kỳ có hôm nay (hoặc bấm Today), Shift+Tab rồi Tab quay lại Today, đọc điểm ảnh thực vẽ trong dải vòng focus (`zz-audit-a11y.spec.ts`, `71-…`; giá trị dự kiến trong `75-ringcalc.txt`) | Kỳ vọng: vòng dùng chung đạt ít nhất 3:1 so với card ở cả hai giao diện (quyết định của chủ WP5-UX-Q1 (a), docs/10; docs/04 dòng 82). Thực tế: 2.70:1 ở giao diện sáng (tối 3.34:1); cùng nút đó khi hoạt động vẽ 6.09:1 (sáng) và 6.79:1 (tối) | Quyết định của chủ WP5-UX-Q1 (a) và docs/04 "Chuẩn hình ảnh"; WCAG 1.4.11 miễn cho thành phần không hoạt động và 2.4.7 vẫn đạt (vòng vẫn nhìn thấy), nên đây là lỗi theo chuẩn của dự án, không phải lỗi WCAG 2.2 AA | Làm mờ Today không hoạt động bằng token màu (chữ và viền) thay cho opacity của phần tử, hoặc không để `opacity` tác động lên vòng focus (ví dụ một quy tắc riêng `button[aria-disabled='true']:focus-visible { opacity: 1 }` với chữ màu mờ); thêm Today không hoạt động vào spec vòng focus ở cả hai giao diện |

## Rủi ro và đề xuất tùy chọn (tách khỏi các phát hiện)

- **R-UX2A-1, `/theme-init.js` và các file tĩnh khác không có `Cache-Control` (R-UX2-1).** Đã xác nhận trên cả hai bản build; đánh giá ở trên là
  rủi ro mang theo chấp nhận được. Tùy chọn: `no-cache` cho `index.html` và `theme-init.js`, cache dài cho asset có hash (một thay đổi server cho
  vòng sau).
- **R-UX2A-2, các chỗ đổi tên sống sót.** Đảo ngược việc đổi tên ở một trong các chỗ này không bị test nào bắt: nhãn thao tác ở History/OT
  ("Checked in", `otModel.ts:107`), chú thích chính sách ("first check-in", `PolicyFields.tsx:52`), câu về chia sẻ trong Settings
  (`SharingSettings.tsx:42`) và các câu báo phiên cũ ("Check out again …", `ClockProvider.tsx:207`, `ClockOutDialog.tsx:122`). Các đột biến M10b,
  M10c và M10d của tôi xác nhận điều này (mục 6).
  Tùy chọn: một unit test trên các chuỗi hiển thị của client (hoặc một lệnh tìm trong mã nguồn ở `tests/client`) cấm các từ cũ ngoài định danh.
- **R-UX2A-3, ngưỡng của liên kết Review trên điện thoại phụ thuộc font.** Các ngưỡng container (`styles.css:1600-1650`) là giá trị rem cố định đo
  bằng font hệ thống của Windows (Segoe UI); chuỗi font là `system-ui`, nên iOS và Android vẽ ra độ rộng khác. Probe của tôi ép Arial và Verdana
  trên trạng thái ở xa của ngày cửa sổ, ở mọi độ rộng từ 320 đến 767px: liên kết không lần nào tràn và vẫn cao 44px (các dòng `REVIEWFIT` trong
  `71-a11y-2-summary.txt`); vậy nơi hàng quá hẹp, hàng flex có xuống dòng hẳn đã đưa liên kết xuống hàng riêng như ở 320px (không đo riêng). Ngân sách màn hình đầu ở trạng thái ở xa tại
  390x844 vào ngày đầu cửa sổ còn 80.6px trên timesheet của chính người dùng nhưng chỉ còn 28.6px khi có chia sẻ nhận được và ghi chú múi giờ (gate `62-obs-away.txt`),
  nên một hàng nút thứ hai (+52px) do font điện thoại rộng hơn có thể đẩy hàng ngày đầu tiên xuống dưới thanh tab vào ngày đầu cửa sổ. Tùy chọn:
  xem trên một iPhone và một điện thoại Android thật trong pilot, hoặc chừa vài rem trong ngưỡng.
- **R-UX2A-4, `label-content-name-mismatch` của axe trên nút ngày ở điện thoại.** Cùng lượt quét axe trên 90b98ef cũng báo lỗi này trên đúng 14 nút đó (`74-axe-base-old.txt`), nên nó có từ trước vòng này. Hai span của nút ("Mon", "09/28") không có
  khoảng trắng giữa chúng, nên chữ tính được là "Mon09/28"; tên "Edit Mon 09/28 (2026-09-28)" chứa đúng các từ nhìn thấy, đúng điều SC 2.5.3 đòi
  hỏi (AX-05, đã được chấp nhận trước đây). Tùy chọn: một khoảng trắng hoặc một phần tử xuống dòng giữa hai span để công cụ không báo.
- **R-UX2A-5, kỳ chứa hôm nay mang nhãn "future".** Trong năm ngày cửa sổ, kỳ mà Today mở mang nhãn quan hệ "future" của server
  (`audit-today-bar-phone-away-w390-synthetic.png`), vì R-07/D-12 gọi kỳ vừa kết thúc là "current". Đây là ngữ
  nghĩa server không đổi, giờ được gặp thường hơn qua Today; chủ có thể muốn đổi cách gọi nhãn sau này (không phải lỗi).
- **Quan sát cho chủ (không phải lỗi):** khoảng cách lớn hơn từ thương hiệu đến menu chỉ có từ 1440px; từ 1280 đến 1439px thanh chỉ có logo với
  khoảng cách 24px như trước.

## Gate chưa chạy/bị chặn và lý do

- Không kiểm tra bắt buộc nào chưa chạy: typecheck, lint, `npm test`, TOÀN BỘ e2e trên cả hai project với đồng hồ thật, AC-13 một lần, các probe
  đồng hồ giả lập của chính tôi và bộ đột biến đều đã chạy trên digest này. Drill không bắt buộc (WP5-UX2-GATE đã chạy; image
  `sha256:8b0effa0…`). Các mục NAS vẫn NOT VERIFIED như mọi gate trước.
- Các thời điểm lịch khác ngày thật 2026-10-14/15 chỉ chạy dưới đồng hồ giả lập, đã được kiểm bằng một đối chứng; đồng hồ của chính trình duyệt
  là thật theo thiết kế, điều làm các probe về ngày thiết bị chặt hơn.
- axe-core không có trong `node_modules`; tôi cài axe-core 4.14.0 với `--ignore-scripts` vào một thư mục mới chỉ trong thư mục task của tôi
  (không đổi repository hay dependency) và chèn nó trong một context probe bỏ qua CSP.
- Các probe server của tôi dùng cổng 48745 và 48746 với `DATA_DIR` và `DATABASE_PATH` trong thư mục task; fixture e2e dùng cổng loopback do hệ
  điều hành cấp, như mọi gate trước.

## Xử lý phát hiện trước

- WP5-UX-AUDIT-AB9 không tìm thấy lỗi; các rủi ro R-AB9-1 đến R-AB9-6 và backlog mang theo không bị vòng này chạm tới (các file liên quan không đổi
  hoặc chỉ đổi cách gọi), trừ R-AB8-4 (độ phủ của lượt quét) được mở rộng nhờ các thời điểm Today của vòng này và của tôi.
- AX-01 đến AX-10 và các mục B5 vẫn giữ (mục 5). Phát hiện 03 liên quan một điều khiển mới (Today không hoạt động), không phải sự thụt lùi
  của một mục AX, nhưng thuộc cùng quy tắc vòng focus chủ đã quyết (WP5-UX-Q1 (a)).
- Audit này chưa thay thế WP5-UX-AUDIT-AB9: một PASS trên digest sau này của vòng này mới thay thế.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

- **Sẵn sàng phần mềm:** chưa nghiệm thu lại trên d1a20a7. Vòng này làm đúng điều chủ yêu cầu, phần thay đổi server là ba chuỗi thông báo, ngữ
  nghĩa ngày ghi sổ và ranh giới chia sẻ giữ được, và các kiểm tra bắt buộc đạt; ba phát hiện mức Thấp phải được sửa và kiểm lại trên một
  digest mới trước. Cho tới lúc đó snapshot được nghiệm thu gần nhất vẫn là 90b98ef (WP5-UX-AUDIT-AB9); không điều gì ở đây ảnh hưởng tới dữ
  liệu, server hay các quyết định trong gói pilot.
- **Phép của chủ:** không yêu cầu và không được cấp. Không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot.

## Một bước tiếp theo

Coordinator:
- ghi WP5-UX2-AUDIT là FIX REQUIRED (các phát hiện WP5-UX2-AUDIT-01 đến 03; các rủi ro R-UX2A-1 đến R-UX2A-5 vào backlog);
- giao một task sửa có phạm vi (ví dụ WP5-UX2-FIX1; cỡ S-M, rủi ro M, worker-high) sở hữu `src/client/components/PeriodBar.tsx`,
  `src/client/TimesheetScreen.tsx`, `src/client/styles.css`, `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts` và docs/04, docs/10 (EN và
  VI), để: (1) cho cú bấm trên Today không hoạt động đọc lại `/periods/current` và nhảy khi câu trả lời mới là đang ở xa, kèm một e2e đồng hồ giả
  lập đi qua nửa đêm của múi giờ báo cáo khi trang đang mở; (2) thêm mệnh đề về hàng ở 320px vào docs/04 dòng 48 và 56 và vào gạch đầu dòng ở
  docs/10; (3) làm mờ Today không hoạt động mà không làm mờ vòng focus của nó, kèm kiểm vòng focus ở cả hai giao diện;
- sau đó là freeze của task đó, một regate trên digest mới (verify, lint, toàn bộ e2e trên cả hai project, lượt quét Today có một thời điểm nửa
  đêm, các kiểm tra tương phản) và một audit kiểm lại mới cho bản sửa trên digest đó.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX2-AUDIT, attempt 1.
  - Reviewer: tự báo `claude-opus-5-5`; một subagent mới (bảng ghi agent ID `aa1ac7827beb0fe41` cho task này; không quan sát được từ bên trong).
  - Các tác giả được kiểm (theo bảng): WP5-UX2-PLAN đến PLAN4 (`a767b8896b0d1cc72`), T01 `a9d962e5be41fe678`, T02 `ac90307b14c9bad40`, T03
    `aff6b930318d2d3a0`, T04 `ae57a22e4eaa6440a`, T05 `a51d67415e6afc416`, T06 `a04f4d6a819678578`, T07 `a4f3080aaa2d73816`, T08
    `a96d4ba20fcf89e1e`, T09 `aabbee779a229a4a3`, T10 `a291a953326b454ee`; tất cả tự báo `claude-sonnet-5-5`. Các bản freeze (committer) và
    WP5-UX2-GATE (verifier, `a46d743f16f3661d6`) cũng tự báo `claude-sonnet-5-5`. Model của tôi không yếu hơn tác giả mạnh nhất.
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm và không chạy plan, slice, freeze, gate
  hay audit trước nào của vòng này. Tôi không sửa file source, test, tài liệu, bảng hay STATE nào. Các bản export, build, đột biến, spec tạm và
  mọi lần chạy đều nằm trong thư mục task; trong repository tôi chỉ ghi cặp review này, phần Results trong brief của tôi và
  `handoff/delivery/evidence/WP5-UX2-AUDIT/`. Ghi chú quy trình: bảy dòng lệnh shell đã pipe một danh sách hay một kết quả grep vào `head`
  hoặc `tail` (không ảnh hưởng file hay tiến trình nào); lần chạy a11y đầu tiên của tôi bấm vào Today đang `aria-disabled` trong chính probe
  của tôi, nên các test đi bàn phím của nó hết giờ (mỗi test 10 phút) và chỉ dùng các dòng axe và vòng focus của nó; axe-core 4.14.0 được tải
  với `--ignore-scripts` vào riêng thư mục task. Không còn gì đang chạy.
- **Digest trước/sau; bằng chứng gate của snapshot đó:** `20e7a7c8…a609773fa5` (814 file) trước và sau, ở ba dạng (`01-digest-before.txt`, `01-digest-after.txt`). Nó bằng digest
  ghi nhận của WP5-UX2-GATE (gate PASS trên d1a20a7; các mục NAS NOT VERIFIED).
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX2_REVIEW.md` và `.vi.md`, cả hai là file mới; mọi review trước không bị
  chạm tới.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** WP5-UX2-AUDIT-01, 02 và 03 đang mở (mỗi cái mức Thấp); bước tiếp là task
  sửa và lần kiểm lại ở "Một bước tiếp theo".
