# Vòng thay đổi giao diện thứ hai của WP5, kiểm lại độc lập vòng sửa trên a643794 (WP5-UX2-AUDIT2)

Bản dịch của [WP5_UX2_REVIEW2.md](WP5_UX2_REVIEW2.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện thứ hai theo yêu cầu của chủ trong WP5, sau vòng
  sửa của nó (WP5-UX2-FIX1 và WP5-UX2-FIX2), task WP5-UX2-AUDIT2, attempt 1, 2026-10-15 từ 12:40Z đến khoảng 14:05Z (05:40 đến
  khoảng 07:05 giờ America/Los_Angeles). Reviewer tự báo model `claude-opus-5-5`, profile timesheet-auditor (effort do profile
  đặt, không quan sát được từ bên trong). Một lượt kiểm lại mới cho ba phát hiện và rủi ro R-UX2A-2 của WP5-UX2-AUDIT, cho mọi dòng
  mà vòng sửa đã đổi, và cho các vùng audit đầu đã nghiệm thu. Mọi review trước, kể cả [WP5_UX2_REVIEW.vi.md](WP5_UX2_REVIEW.vi.md),
  được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `a6437943403fc416240fd13a787a8c4748af3e84` (bản freeze của WP5-UX2-FIX2, `freeze_commit` của WP5-UX2-REGATE2). HEAD =
  origin/main = a643794 trước và sau; không có commit chưa push; không path nào ngoài `handoff/` bị sửa hay chưa theo dõi. Digest
  `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 file, không tính `handoff/`, ghi đầu tiên (12:42Z) và
  cuối cùng (13:46Z), mỗi lần ở ba dạng bằng nhau: một bản export sạch bằng `git archive` băm bằng
  `git hash-object --no-filters`, dạng `git ls-tree a643794` (danh sách đã sắp xếp giống từng byte với danh sách của bản export), và
  `npm run digest` trong repository. Source đủ: `npm ci` exit 0 trong bản export.
- **Quyết định: PASS.**
  - Ba phát hiện mức Thấp và rủi ro R-UX2A-2 của WP5-UX2-AUDIT đã đóng trên a643794 (mục 1). Lần bấm trên Today không hoạt động và
    các lần đọc lại mới khi focus và khi tab hiện đều theo ngày của server qua nửa đêm của múi giờ báo cáo, ở chế độ của chính người
    dùng và ở chế độ xem chia sẻ mà chủ báo cáo theo một múi giờ xa, với múi giờ thiết bị xa cả hai; một lần bấm khi không ở xa chỉ đọc
    một lần và không đổi gì. docs/04 và docs/10 (EN và VI) mô tả hàng 330px và lần bấm khi không hoạt động đúng như bản build. Vòng
    focus của Today không hoạt động vẽ đủ màu nhấn (6.09:1 sáng, 6.79:1 tối) trên cả bốn cạnh, với cả hai lựa chọn tay, trên cả hai
    project, và không còn phần tử nhận focus nào bị opacity làm mờ. Test cách gọi mới bắt được các chuỗi bị đảo lại.
  - Không hồi quy (mục 2). Bản sửa chỉ đổi đúng những gì các phát hiện cần. Today và Current period vẫn chỉ dùng `today_local`,
    `current` và `in_progress` của server. Các lần đọc lại mới đọc một lần cho mỗi lần focus cửa sổ thật hoặc tab hiện lại, không bao
    giờ đọc theo focus phần tử, không bao giờ lặp, và ở chế độ xem chia sẻ không bao giờ ra khỏi chia sẻ hay đánh thức provider check
    in/out. Thanh kỳ giữ WCAG 2.2 AA ở 1440, 390 và 320 trong cả hai giao diện và cả hai lựa chọn tay.
  - Các vùng không đổi giữ nguyên kết luận (mục 3): không gì khác đổi từ d1a20a7, và `dist/server` vẫn chỉ khác 90b98ef ở ba chuỗi thông
    báo và một comment.
  - Các kiểm tra bắt buộc đạt: typecheck 0, lint 0, `npm test` 0 (89 file, 1882 test, hai lần), build 0, smoke PASSED, 0 dòng
    deprecation; TOÀN BỘ e2e trên cả hai project với đồng hồ thật (một ngày trong cửa sổ) 448 đạt, 0 lỗi, 42 bỏ qua (desktop 216/29,
    mobile 232/13), và ngoài cửa sổ (mô phỏng 2026-11-04 15:00 PST) 448 / 0 / 42 với cùng cách chia; AC-13 1/1.
  - Mọi đột biến brief nêu đều bị bắt (mục 4): bỏ lần đọc lại khi bấm nút không hoạt động (với đồng hồ thật và dưới preload),
    bỏ lần đọc lại khi focus hoặc khi tab hiện, khôi phục quy tắc opacity và đảo lại một chuỗi đã đổi tên (hai chỗ); cũng như bỏ cơ chế
    một lần đọc tại một thời điểm, gửi lần đọc lại tới route của chính người dùng trong chế độ xem chia sẻ, và bỏ vòng focus của Today
    không hoạt động. Các test vòng focus của FIX2 bắt được opacity và vòng bị mất cả trong lẫn ngoài cửa sổ, nên chúng không rỗng. Một
    đột biến thêm, cú bấm quyết định theo các kỳ đã cũ, chỉ bị bắt dưới đồng hồ mô phỏng (rủi ro R-UX2A2-4).
  - Không có phát hiện mới. Các rủi ro tùy chọn mới R-UX2A2-1 đến R-UX2A2-4 và các rủi ro mang theo R-UX2A-1, -3, -4 và -5 được liệt
    kê ở mục 5. Như brief nêu, PASS này nghiệm thu lại WP5 trên a643794 và thay thế WP5-UX-AUDIT-AB9 cùng các audit trỏ tới nó.

## Phạm vi thật đã xem và chạy

1. Đọc như các tuyên bố, không phải bằng chứng: review đầu [WP5_UX2_REVIEW.vi.md](WP5_UX2_REVIEW.vi.md), bản ghi của WP5-UX2-FIX1,
   FIX2, REGATE (FAIL) và REGATE2 (PASS) cùng bằng chứng của chúng, và các quyết định của chủ và của coordinator ngày 2026-10-14 và
   2026-10-15 trên bảng.
2. Toàn bộ diff d1a20a7..a643794 ngoài `handoff/`: 11 path, 415 dòng thêm và 19 dòng xóa (hai commit, b1b725b và a643794). Mọi dòng
   đổi của `TimesheetScreen.tsx`, `PeriodBar.tsx`, `styles.css`, bốn file test và bốn file tài liệu đều được đọc, cùng phần mã không
   đổi mà chúng gọi (`periodJumpModel.ts`, `ClockProvider.tsx`, `api.ts`, `SharedTimesheetScreen.tsx`, `AppShell.tsx`,
   `sheetModel.ts`, các token CSS).
3. Các kiểm tra bắt buộc trong một bản export sạch: `npm ci`, typecheck, lint, `npm test` hai lần, build, smoke, TOÀN BỘ e2e trên cả
   hai project với đồng hồ thật, AC-13 một lần.
4. Tự build sạch 90b98ef và a643794 và so `dist/` từng file; header phản hồi của server đã build.
5. Các probe đồng hồ mô phỏng của tôi (`shiftclock.mjs` của FIX10, bản chép giống từng byte, đã kiểm bằng một lần đối chứng): năm
   probe nửa đêm (chế độ của chính người dùng lúc hết kỳ, lúc hết cửa sổ năm ngày và giữa kỳ; một Today đang hoạt động trên kỳ kế tiếp
   qua nửa đêm đầu tiên của kỳ đó; một chế độ xem chia sẻ qua nửa đêm của chủ ở một múi giờ xa), test nửa đêm của chính repository
   chạy dưới preload, và một lượt TOÀN BỘ e2e trên cả hai project ngoài cửa sổ (2026-11-04 15:00 PST).
6. Đếm request của các lần đọc lại mới khi focus và khi tab hiện: đi bàn phím, focus phần tử bằng script, sự kiện focus cửa sổ được
   phát (một lần, mười lần trong một tác vụ, mười lần cách nhau 50 ms), visibility hiện và ẩn, một lần chuyển tab thật, và lần bấm khi
   không hoạt động, ở chế độ của chính người dùng và chế độ xem chia sẻ, với đồng hồ thật và ngoài cửa sổ.
7. Khả năng truy cập của thanh kỳ và Today không hoạt động: quét axe-core 4.14.0, đi bàn phím toàn trang và vòng focus thực sự được
   vẽ ở 1440 (project desktop) và 390, 320 (project mobile), ở giao diện sáng, tối và cả hai lựa chọn tay, trong cửa sổ (đồng hồ thật)
   và ngoài cửa sổ (mô phỏng); hàng Review trên điện thoại đo từ 316 đến 400px.
8. Đột biến của bản sửa (11 đột biến trong 15 lượt chạy cùng 2 lượt đối chứng, mỗi lượt trong một bản sao nháp).
9. Tài liệu: docs/04 dòng 48, 54 và 56 và gạch đầu dòng "Phone Review link" của docs/10, EN và VI.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che dữ liệu trong `handoff/delivery/evidence/WP5-UX2-AUDIT2/` (mục lục `00-README.txt`), cùng bốn ảnh
chụp `-synthetic.png`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng, đầu và cuối; HEAD; trạng thái ngoài handoff | `229df806…0b04db3`, 815 file mọi lần; danh sách export = danh sách `ls-tree`; HEAD = origin/main = a643794; không thay đổi ngoài handoff | `01-digest-before.txt`, `01-digest-after.txt`, `00-head.txt` |
| trích các task WP5-UX2 trên bảng | mọi tác giả và gate tự báo `claude-sonnet-5-5`; audit này là opus | `02-board-ux2.txt` |
| `npm ci` / typecheck / lint (`no-deprecated`) / `npm test` / build / smoke / `npm test` lần nữa (bản export sạch) | 0 / 0 / 0 / 0, 89 file, 1882 test / 0 / 0, SMOKE PASSED / 0, 89 / 1882; 0 dòng deprecation trong mọi log | `05-exits.txt`, `05-*.txt` |
| TOÀN BỘ e2e, cả hai project, đồng hồ THẬT, 2026-10-15 05:48-05:59 PDT (ngày cửa sổ P-1) | **exit 0: 448 đạt, 0 lỗi, 42 bỏ qua** (desktop 216/29, mobile 232/13), 11.3 phút | `20-e2e-real.txt`, `20-e2e-counts.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0, 1/1 | `21-ac13.txt` |
| phạm vi: `git diff --stat d1a20a7 a643794` ngoài `handoff/`; cấu hình, server, public, file thương hiệu, khung và chia sẻ | 11 path (415+/19-); mọi thứ khác rỗng | `10-*.txt`, `11-diff-full.txt`, `13-config-diff-d1.txt` |
| tự build 90b98ef và a643794, `diff -r dist/` | `dist/domain` giống hệt; `dist/server` 1 trên 180 file, 4 dòng (3 chuỗi, 1 comment) | `13-dist.txt`, `13-dist-diff.txt` |
| đối chứng đồng hồ mô phỏng | server `today_local` 2026-11-04 lúc 15:00 PST; trình duyệt là ngày thật 2026-10-15 | `61-control-1104.txt` |
| các probe nửa đêm của tôi: 10/25, 10/30, 10/31 (của chính người dùng, thiết bị Kiritimati), 10/25 ở Kiritimati (chia sẻ), trường hợp biên | 10 đạt, 0 lỗi (mỗi lượt hai project) | `62-midnight-*.txt` |
| test nửa đêm của repository dưới preload (2026-10-25 23:59:20 PDT) | exit 0, 2 đạt (nhánh qua nửa đêm) | `63-repo-midnight-1025.txt` |
| TOÀN BỘ e2e, cả hai project, mô phỏng 2026-11-04 15:00 PST (ngoài cửa sổ) | **exit 0: 448 đạt, 0 lỗi, 42 bỏ qua** (desktop 216/29, mobile 232/13), 12.9 phút | `64-full-1104-1500.txt`, `64-full-counts.txt` |
| probe request, của chính người dùng và chia sẻ, đồng hồ thật và ngoài cửa sổ | exit 0 cả hai lần, 4 trên 4: focus phần tử 0 request; một lần đọc cho mỗi lần focus cửa sổ thật (2-3 lần trong một lượt 80 lần bấm vòng qua cuối trang) và cho mỗi sự kiện focus được phát, rồi không gì; tab hiện: chia sẻ 1 lần đọc, của chính người dùng 3 lần đọc kỳ + 1-2 lần đọc timesheet; bấm nút không hoạt động 1 lần đọc; chế độ chia sẻ: 0 request ra ngoài chia sẻ (23-27 mỗi test) | `66-requests-*.txt` |
| hàng Review trên điện thoại, 316-400px | hàng riêng ở 330px trở xuống; chung hàng dưới dạng "Sign off" từ 332px; 44px; không cuộn ngang | `67-row-real.txt` |
| probe a11y: axe-core 4.14.0, đi bàn phím, vòng thực vẽ; 1440 / 390 / 320; bốn tình huống giao diện; đồng hồ thật và 2026-11-04 | exit 0 cả hai lần, 8 trên 8; 72 lượt quét axe: desktop 20 sạch, 4 chỉ có tên bộ chọn nhãn ngày lễ có từ trước (R-UX2A2-3), điện thoại 48 chỉ có tên nút ngày có từ trước (R-UX2A-4); 72 lượt đi, 3.048 điểm dừng: 0 không có vòng, 0 bị che, 0 dưới 24px, 0 điều khiển thanh kỳ dưới 44px trên điện thoại, 0 dưới opacity nhỏ hơn 1; vòng Today không hoạt động 6.09 / 6.79 (thấp nhất 6.70) trên cả bốn cạnh | `68-a11y-*.txt`, `68-a11y-summary.txt`, bốn ảnh `-synthetic.png` |
| đồng bộ EN/VI của các dòng tài liệu đã đổi | token nguyên văn bằng nhau; cùng tiêu đề và gạch đầu dòng | `40-docs-parity.txt`, `40-docs-*.txt` |
| diff test | một dòng đổi (một import); không thêm skip, only, fixme, fail, slow hay soft; số dòng `expect(` 22→28, 125→143, 38→49, cùng 4 trong test mới | `50-*.txt`, `51-expect-counts.txt` |
| tương phản theo token của Today không hoạt động | vòng 6.09 / 6.79 khi đủ độ đậm (2.70 / 3.33 ở 0.6); chữ mờ 5.83 / 6.56 | `75-ringcalc.txt` |
| đột biến | 11 đột biến, 15 lượt: 14 bị bắt, 1 sống sót theo thiết kế (MF với đồng hồ thật, bị bắt dưới preload); 2 lượt đối chứng đạt; mọi lần khôi phục giống từng byte; cuối cùng digest của bản sao nháp bằng `229df806…` | `72-*.txt`, `73-mutation-summary.txt` |

## 1. Các phát hiện trước (câu hỏi audit 1)

### WP5-UX2-AUDIT-01 (Today không phản ứng sau nửa đêm khi trang vẫn mở): đã đóng

- **Điều đã đổi.** `PeriodBar.tsx:123-127` giờ gọi `onToday` ở mọi lần bấm, dù nút hoạt động hay không. `TimesheetScreen.tsx:230-257`
  `jumpToToday(wasAway)` luôn đọc lại `/periods/current` qua `request` và chạy `todayJump` trên câu trả lời mới: chỉ nhảy và thông báo
  khi trạng thái mới là "ở xa"; nếu không thì làm mới các kỳ và để nguyên bảng, trình sửa và vùng live (một lần bấm khi không hoạt
  động không bao giờ xóa thông báo). `TimesheetScreen.tsx:157-181` thêm một effect đọc lại các kỳ khi cửa sổ có `focus` và khi
  `visibilitychange` sang hiện, qua `request` (nên chế độ xem chia sẻ đọc route của chủ), với một ref chỉ cho một lần đọc tại một thời
  điểm. Không dùng đồng hồ thiết bị, không dùng múi giờ hiển thị: logic ngày duy nhất vẫn là `periodJumpModel.ts`, không đổi.
- **Các probe nửa đêm của tôi** (`zz-audit2-midnight.spec.ts`, đồng hồ mô phỏng bắt đầu 90 giây trước nửa đêm, cả hai project; trình
  duyệt giữ ngày thật 2026-10-15 và múi giờ thiết bị là Pacific/Kiritimati, nên ngày của chính nó là 2026-10-16; ba tab trên một
  phiên; mọi request `/api` được ghi lại):

| Bắt đầu (múi giờ báo cáo) | Chế độ | Trước nửa đêm | Không ai chạm qua nửa đêm | Bấm Today không hoạt động (đã cũ) | Focus cửa sổ / tab hiện ở các tab khác | Kết quả |
|---|---|---|---|---|---|---|
| 2026-10-25 23:58:30 PDT (hết kỳ) | của chính người dùng | không hoạt động trên 10/12-10/25, nhãn 10/25; một lần bấm đối chứng = 1 lần đọc, không gì đổi | 0 request trên 3 tab; vẫn không hoạt động, nhãn 10/25 | nhảy sang 10/26-11/08, nhãn 10/26, live "Showing today, Mon 10/26/2026, in the period 10/26/2026 to 11/08/2026", Current period hiện; 6 request (lần đọc lại của cú nhảy và lần tải thường lệ) | 1 lần đọc khi focus; 3 lần đọc kỳ + 2 lần đọc timesheet khi tab hiện (gồm cả các lần tra của T09); mỗi cách làm Today hoạt động trên 10/12-10/25, không điều hướng | exit 0, 2 đạt |
| 2026-10-30 23:58:30 PDT (thứ Sáu payroll, cửa sổ kết thúc) | của chính người dùng | không hoạt động trên 10/26-11/08, Current period hiện, live "Showing today, Fri 10/30/2026, ..." | 0 request | 1 lần đọc; bảng và vùng live không đổi; nhãn 10/31; Current period biến mất | 1 lần đọc khi focus; cùng kết quả | exit 0, 2 đạt |
| 2026-10-31 23:58:30 PDT (giữa kỳ, hai giờ trước khi lùi đồng hồ) | của chính người dùng | không hoạt động trên 10/26-11/08, nhãn 10/31 | 0 request | 1 lần đọc; bảng không đổi; nhãn 11/01 | 1 lần đọc khi focus; cùng kết quả | exit 0, 2 đạt |
| 2026-10-25 23:58:00 Pacific/Kiritimati (hết kỳ của chủ; 02:58 PDT với người được chia sẻ) | chia sẻ (chủ trên một lịch thứ hai ở Kiritimati, thiết bị người được chia sẻ ở Pacific/Pago_Pago) | không hoạt động trên 10/12-10/25 của chủ; bấm đối chứng = 1 lần đọc `/api/shared/{owner}/periods/current` | 0 request | nhảy sang 10/26-11/08 của chủ với nhãn của chủ và câu live, Current period hiện; 3 request qua chia sẻ | đúng 1 lần đọc qua chia sẻ khi focus và 1 khi tab hiện; Today hoạt động | exit 0, 2 đạt; không có request `/api/periods/current`, `/api/clock*` hay timesheet của chính người được chia sẻ; ngày của chính người được chia sẻ vẫn là 10/25 |

- **Test nửa đêm của chính repository** (`today.spec.ts:538`) dưới preload lúc 2026-10-25 23:59:20 PDT đi nhánh qua nửa đêm (mỗi
  project 38 giây) và đạt trên cả hai project; với đồng hồ thật nó đi nhánh còn lại (một lần bấm khi không hoạt động = đúng một lần
  đọc, không gì di chuyển) và đạt trong lượt chạy đồng hồ thật của tôi và trong lượt ngoài cửa sổ.
- **Bấm khi không ở xa thì không gì thay đổi**: thấy ở mọi lần bấm đối chứng ở trên (của chính người dùng và chia sẻ) và ở nhánh đồng
  hồ thật của `today.spec.ts:538`.

### WP5-UX2-AUDIT-02 (tài liệu thiếu hàng 320px): đã đóng

- docs/04 dòng 48 giờ thêm "(trên điện thoại hẹp nhất, dưới khoảng 330px, liên kết Review khi đó có hàng riêng với nhãn đầy đủ)",
  dòng 56 cùng quy tắc, và gạch đầu dòng "Phone Review link" của docs/10 cùng mệnh đề; dòng 54 mô tả Today không hoạt động là "làm mờ
  bằng màu", lần bấm khi không hoạt động và các lần đọc lại khi focus và khi tab hiện. Các dòng VI có cùng mệnh đề (tôi đã đọc) và cùng
  các token nguyên văn (`40-docs-parity.txt`: danh sách token bằng nhau cho docs/04 dòng 48, 54, 56 và docs/10 dòng 202/203; cùng số
  tiêu đề và gạch đầu dòng). Không tài liệu nào khác còn nói Today không hoạt động "không làm gì" (`40-docs-inactive.txt`).
- Sản phẩm như đã build: probe hàng của tôi (`67-row-real.txt`, project mobile, đồng hồ thật vào một ngày trong cửa sổ, sau khi bấm
  Today để Current period hiện, từ 316 đến 400px, mỗi bước 2px) thấy liên kết Review có hàng riêng với nhãn đầy đủ ở 330px trở xuống,
  nằm chung hàng dưới dạng "Sign off" từ 332 đến 396px và hiện nhãn đầy đủ từ 398px; luôn cao 44px và không cuộn ngang. "Dưới khoảng
  330px" là chính xác. `today.spec.ts:389` của bộ test khẳng định hàng riêng ở 320px và đạt trong lượt chạy đồng hồ thật.

### WP5-UX2-AUDIT-03 (vòng focus của Today không hoạt động bị làm mờ còn 2.70:1): đã đóng

- `styles.css:879-883` làm mờ `button.secondary[aria-disabled='true']` bằng `color: var(--muted)` và `border-color: var(--line)`;
  opacity của phần tử đã bỏ, và quy tắc hover khi không hoạt động (`styles.css:855-859`) giữ cùng viền. Cả hai token có trong `:root`
  và trong cả hai bộ tối (không có token mới).
- Điểm ảnh vòng focus được vẽ trong test của bộ test (`focus-ring.spec.ts:407`, cả hai project, bốn tình huống giao diện): đồng hồ
  thật (ngày trong cửa sổ) desktop 6.11:1 (sáng, sáng chọn tay) và 6.40:1 (tối, tối chọn tay), mobile 6.09:1 và 6.79:1; ngoài cửa sổ
  (2026-11-04) 6.09:1 và 6.79:1 trên cả hai project; opacity tính được 1; chữ mờ 5.83:1 / 6.56:1. Kỳ vọng từ token
  (`75-ringcalc.txt`): 6.09 / 6.79 khi đủ độ đậm, 2.70 / 3.33 ở 0.6.
- Probe của tôi (`zz-audit2-a11y.spec.ts`) lấy mẫu cả bốn cạnh của vòng ở ba độ sâu trong dải nhấn 2px và nhân opacity của nút với mọi
  phần tử cha: trong 24 lần đo (1440, 390 và 320; bốn tình huống giao diện; trong cửa sổ cạnh Current period và ngoài cửa sổ) mọi
  cạnh đều đủ màu nhấn, 6.09:1 ở giao diện sáng và 6.79:1 ở giao diện tối (một mẫu tối bị khử răng cưa là 6.70:1), với chuỗi opacity
  bằng 1 và chữ mờ 5.83:1 / 6.56:1 (`68-a11y-summary.txt`). Các ảnh chụp `audit2-inactive-today-*-synthetic.png` cho thấy vòng khép
  kín quanh nút màu xám, cạnh một Current period đang hoạt động trong cửa sổ và cạnh liên kết Review ngoài cửa sổ.
- **Không phần tử nào khác làm mờ vòng focus bằng opacity.** Các quy tắc `opacity` còn lại trong `styles.css` chỉ là `button:disabled`
  (869), `input.switch-input:disabled` (1297), cả hai bị khóa thật và không bao giờ nhận focus, và nút radio giao diện vô hình (602,
  `opacity: 0`), có vòng được vẽ trên nhãn của nó (`.theme-option:has(input:focus-visible)`, 613). Không file TSX nào đặt opacity. Chỉ
  nút Today mang `aria-disabled` (`23-ariadisabled.txt`). Các lượt đi bàn phím của tôi thấy không có điểm dừng nào, trong 72 lượt đi
  trang Timesheet, có vòng được vẽ dưới opacity nhỏ hơn 1 (vòng của radio giao diện do nhãn của nó vẽ, đúng thiết kế).

### R-UX2A-2 (các chuỗi đã đổi tên mà không test nào đọc): đã đóng

- `tests/client/userWording.test.ts` quét mọi file `.ts`, `.tsx`, `.css`, `.html` và `.js` dưới `src/client` (khẳng định hơn 40 file)
  tìm "clock in", "clock out" (dấu cách hoặc gạch nối), "clocked" và "checking the clock" ngoài comment, chỉ cho phép hai id phần tử
  `clock-out-title` và `clock-out`; hai test tự kiểm cho thấy mỗi cụm từ đều bị bắt và định danh, đường dẫn API và comment được bỏ qua.
- Hai chỗ tôi đảo lại mà chưa đột biến nào trước dùng, `ClockOutDialog.tsx:74` ("check-out time" thành "clock-out time") và
  `ClockPanel.tsx:20` ("Checking your status" thành "Checking the clock"), mỗi chỗ làm hỏng 1 trong 3 test, nêu tên file và dòng
  (`72-MD-unit.txt`, `72-MD2-unit.txt`). FIX1 đã cho thấy điều tương tự cho năm chỗ audit đầu nêu; ba chuỗi của server vẫn được test
  tích hợp bảo vệ (audit đầu, M10e).

## 2. Bản sửa không gây hồi quy (câu hỏi audit 2)

- **Đã đọc mọi dòng đổi** (`11-diff-full.txt`). Ngoài ba phát hiện, bản sửa không đổi gì: thay đổi ở PeriodBar là bỏ điều kiện chặn
  và một comment; thay đổi CSS là một quy tắc và quy tắc hover đi kèm; thay đổi ở TimesheetScreen là effect đọc lại, tham số `wasAway`
  và biến `todayAway` được đưa lên trước. Dòng test duy nhất bị xóa là dòng import của `today.spec.ts` (thêm `newPerson`); không khẳng
  định nào bị xóa hay làm yếu; không thêm `skip`, `only`, `fixme`, `test.fail`, `slow` hay `expect.soft` (`50-test-removed-lines.txt`,
  `50-test-added-skips.txt`, rỗng).
- **Các trường hợp biên của đường bấm mới, đọc trong mã.** Một lần bấm khi hoạt động xóa thông báo trước, như cũ; một lần bấm khi không
  hoạt động giữ nguyên nó. Có một hành vi khác d1a20a7 trong một trường hợp hiếm: bấm Today đang trông như hoạt động mà câu trả lời mới
  nói bảng đã hiện hôm nay (trang để mở và có focus qua nửa đêm đầu tiên của kỳ đang hiện, kỳ đó đến bằng Next) giờ chỉ làm mới các kỳ
  (nhãn Today hiện ra, Today chuyển sang không hoạt động) thay vì "nhảy" sang chính kỳ đó kèm cuộn và thông báo; thông báo cũ được khôi
  phục, và trong trường hợp này nó rỗng vì Next đã xóa nó. Probe trường hợp biên của tôi cho thấy điều đó trên cả hai project
  (`62-midnight-edge-1025.txt`: Next sang 10/26-11/08 trước nửa đêm, bấm sau nửa đêm: một lần đọc, Today không hoạt động, nhãn ở 10/26,
  Current period hiện, không thông báo, hàng của hôm nay nằm trong vùng nhìn). Không phải lỗi: bảng đã hiện kỳ của hôm nay. Một lần
  đọc lại thất bại hiện dòng lỗi thường lệ của màn hình. Bấm hai lần thì mỗi lần một lần đọc (theo nhịp người dùng, không lặp). Comment
  giao diện ở `PeriodBar.tsx:14` nói một lần bấm khi không hoạt động "chỉ đọc lại"; màn hình cũng có thể nhảy sau nửa đêm (chỉ là cách
  diễn đạt).
- **Ngữ nghĩa Today và Current period (AGENTS quy tắc 7).** Không có lần đọc đồng hồ thiết bị nào trong `src/client`: grep `new Date(`,
  `Date.now`, `Date.UTC`, `performance.now`, `Temporal.` và `getTimezoneOffset` không thấy gì; `resolvedOptions` chỉ có ở
  `format.ts:7`, là múi giờ hiển thị, Today không bao giờ dùng (`31-device-clock-grep.txt`). `periodJumpModel.ts` không đổi từ
  d1a20a7. Bằng chứng hành vi giữ nguyên:
  - TOÀN BỘ bộ test với đồng hồ thật (một ngày trong cửa sổ, 2026-10-15) và TOÀN BỘ bộ test ngoài cửa sổ (2026-11-04 15:00 PST) đều
    đạt trên cả hai project, kể cả `today.spec.ts` (thiết bị Asia/Ho_Chi_Minh) và test chế độ xem chia sẻ `sharing.spec.ts:539` (chủ
    ở Pacific/Auckland trên một lịch lệch một tuần);
  - các probe nửa đêm ở trên: múi giờ thiết bị Pacific/Kiritimati (ngày thiết bị 2026-10-16 trong khi server nói 10/25 đến 11/01), và
    một chế độ xem chia sẻ mà ngày của chủ (Kiritimati) qua nửa đêm còn ngày của chính người được chia sẻ (Los Angeles) thì không: mọi
    cú nhảy, nhãn và Current period chỉ theo ngày server của chủ.
- **Số request của các lần đọc lại mới** (`zz-audit2-requests.spec.ts`, chế độ của chính người dùng và một chia sẻ chỉ xem, cả hai
  project, với đồng hồ thật và ngoài cửa sổ; `66-requests-*.txt`):
  - focus phần tử không bao giờ đọc: 20 lần Tab trong trang và focus bằng script mọi điều khiển của thanh kỳ và thanh công cụ (8 ở chế
    độ của chính người dùng, 4 ở chế độ chia sẻ) không phát `focus` cửa sổ và không tạo request nào;
  - một lần focus cửa sổ thật đọc một lần: đi bàn phím qua điểm dừng cuối thì rời tài liệu rồi quay lại; 80 lần bấm cho 2 hoặc 3 sự
    kiện `focus` cửa sổ và đúng chừng ấy lần đọc route kỳ của chính chế độ đó, không gì khác;
  - một sự kiện focus cửa sổ được phát: một lần đọc, rồi không gì trong 3 giây (không lặp); mười sự kiện trong một tác vụ: một lần đọc
    (cơ chế một lần đọc tại một thời điểm); mười sự kiện cách nhau 50 ms: mười lần đọc, mỗi lần xong trước sự kiện kế, không gì khác;
  - tab hiện lại: một lần đọc ở chế độ chia sẻ; ở chế độ của chính người dùng 3 lần đọc kỳ và một hoặc hai lần đọc timesheet, vì lần
    tra check in/out và lần tải lại bảng của T09 phản ứng với cùng sự kiện (rủi ro R-UX2A2-2); tab ẩn: không gì;
  - một lần bấm Today không hoạt động: đúng một lần đọc;
  - một lần chuyển tab thật (`bringToFront`) không phát `focus` cửa sổ trong Chromium headless, nên không đọc gì;
  - ở chế độ chia sẻ không request nào ra khỏi chia sẻ trong suốt test (23 đến 27 request mỗi test: không có `/api/periods/current`,
    `/api/clock*`, `/api/timesheets*` hay các route finalization). Provider check in/out im lặng ở đó: nó bị tắt trên route chia sẻ,
    không có trình nghe focus, và trình nghe visibility của nó thoát ra khi địa chỉ là chia sẻ (`ClockProvider.tsx:119-143`, không đổi).
  - Phiên bản đầu của probe kỳ vọng 80 lần Tab không tạo request nào và dừng ở đó (`66-requests-real-v1.txt`); đi bàn phím vòng qua cuối
    trang là một lần focus cửa sổ thật, nên probe được viết lại để đếm các sự kiện đó; probe đã sửa đạt trên cả hai project ở cả hai
    chế độ với đồng hồ thật (`66-requests-real.txt`, một ngày trong cửa sổ) và ngoài cửa sổ (`66-requests-1104-1500.txt`).
- **WCAG 2.2 AA của thanh kỳ và Today không hoạt động** (`zz-audit2-a11y.spec.ts`; `68-a11y-*.txt`, tóm tắt `68-a11y-summary.txt`).
  Project desktop ở 1440, project mobile ở 390 và 320; sáng, tối và cả hai lựa chọn tay; mỗi lượt ba trạng thái (khi vào trang, Next,
  Next hai lần), nên có đủ Today không hoạt động, Today hoạt động và Current period; với đồng hồ thật (ngày trong cửa sổ) và lúc
  2026-11-04 (ngoài cửa sổ):
  - đi bàn phím từ đầu trang: 72 lượt với 3.048 điểm dừng (đồng hồ thật và 2026-11-04, `68-a11y-real.txt` và
    `68-a11y-1104-1500.txt`): 0 điểm dừng không có vòng được vẽ, 0 bị các thanh dính che, 0 nhỏ hơn 24x24, 0 điểm dừng có vòng vẽ dưới
    opacity nhỏ hơn 1, và không cuộn ngang ở độ rộng nào;
  - thứ tự trên thanh kỳ luôn là Previous, Next, Today, Current period (khi hiện), Review; mọi điều khiển của thanh kỳ trên điện thoại
    ít nhất 44x44; Today không hoạt động vẫn nằm trong thứ tự Tab;
  - axe-core 4.14.0 (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa): 72 lượt quét. Desktop: 20 trên 24 sạch; 4 lượt còn lại là kỳ
    11/23-12/06 trong bốn tình huống giao diện, nơi kết quả duy nhất là `label-content-name-mismatch` trên nút mở bộ chọn nhãn của hai
    ngày lễ (có từ trước, rủi ro R-UX2A2-3). Điện thoại: cả 48 lượt chỉ báo `label-content-name-mismatch` trên 14 nút ngày (có từ
    trước, R-UX2A-4). Không quy tắc nào khác hỏng: tương phản màu, tên, vai trò, thuộc tính ARIA, landmark và kích thước đích đều đạt ở
    mọi trạng thái, kể cả Today không hoạt động và Current period;
  - SC 1.4.11 không áp dụng cho Today không hoạt động (thành phần không hoạt động), nhưng vòng của nó là vòng dùng chung ở đủ độ đậm (ở
    trên) và chữ mờ giữ 5.83:1 / 6.56:1; SC 2.4.7 và 2.4.11 đạt (vòng được vẽ, không bao giờ bị che); SC 2.5.3 đạt cho Today, Current
    period và liên kết Review (tên bằng hoặc chứa chữ nhìn thấy); SC 4.1.2: `aria-disabled` và mô tả "Already showing today" cho biết
    trạng thái.

## 3. Các vùng không đổi được giữ nguyên kết luận (câu hỏi audit 3)

- **Không gì khác của vòng này đổi từ d1a20a7.** `git diff --stat d1a20a7 a643794` ngoài `handoff/` liệt kê đúng 11 path ở trên
  (`10-scope-stat.txt`); bản thân a643794 chỉ đổi `tests/e2e/focus-ring.spec.ts`, thêm 4 dòng (`10-fix2-stat.txt`). Server, domain,
  migration, script, file package, Dockerfile, file compose, mọi file cấu hình, `src/client/public` và `index.html` không đổi
  (`13-config-diff-d1.txt`, rỗng), và các thành phần thương hiệu, khung, đồng hồ và chia sẻ cũng vậy (`BrandWordmark.tsx`,
  `AppShell.tsx`, `ClockProvider.tsx`, `SharingSwitcher.tsx`, `SharedTimesheetScreen.tsx`; `10-unchanged-areas.txt`, rỗng).
- **`dist/server` vẫn chỉ khác 90b98ef ở ba chuỗi thông báo.** Bản build sạch của cả hai commit: `dist/domain` giống hệt (46 file);
  `dist/server` mỗi bên 180 file, một file khác, `services/timesheetCommands.js`, ở bốn dòng: "Check out of the running session
  first" (409 `open_session_exists`), "There is no running session to check out of" (409 `no_open_session`), "A saved break ends after
  this Check out; ..." (422 `saved_break_after_clock_out`) và một comment (`13-dist.txt`, `13-dist-diff.txt`). Header CSP không đổi
  và `/`, `/theme-init.js`, `/cd-logo.svg` vẫn không có `Cache-Control` (`61-control-real.txt`).
- **Các kết luận mức PASS của audit đầu được giữ nguyên**: độ trung thành với chủ (16 mục yêu cầu và cả hai câu trả lời; đích của
  Today và điều kiện hiện của Current period không đổi, bản sửa chỉ thêm các lần đọc lại mà audit đầu yêu cầu), chia sẻ (không có
  check in/out trong chế độ xem chia sẻ; các lần đọc lại mới chỉ đi qua requester của chia sẻ, như các probe chia sẻ và test đọc lại
  cho thấy; quyền của người được chia sẻ không đổi vì `dist/server` không đổi), thương hiệu và riêng tư (không file thương hiệu, font,
  ảnh raster hay CSP nào đổi), phần thay đổi ở server (ở trên) và tài liệu (chỉ bốn dòng nêu trong các phát hiện đổi). Không điều gì
  audit đầu đã nghiệm thu bị làm yếu.

## 4. Độ mạnh của test cho bản sửa (câu hỏi audit 4)

Mỗi đột biến được áp dụng bằng `mutate.py` (đúng văn bản, đúng một lần xuất hiện) trong bản sao nháp `mut/`, build lại client, chạy
riêng các test được nêu với thư mục kết quả riêng, rồi khôi phục mọi file đã chạm từ a643794 và kiểm giống từng byte với bản export
sạch, và build lại client; cuối cùng digest của bản sao nháp lại bằng 229df806… (`01-digest-mut-after.txt`).

| ID | Đột biến | Lượt chạy | Kết quả |
|---|---|---|---|
| MA | bỏ lần đọc lại khi bấm nút không hoạt động (điều kiện cũ `if (jumps.todayAway) jumps.onToday()` quay lại `PeriodBar.tsx`) | `today.spec.ts` "left open across", cả hai project, đồng hồ thật | **bị bắt**: 2 lỗi (lần đọc `/periods/current` mong đợi không bao giờ đến) |
| MA | như trên | cùng test dưới preload lúc 2026-10-25 23:59:20 PDT (nhánh qua nửa đêm) | **bị bắt**: 2 lỗi (mong đợi `10/26/2026→ to 11/08/2026`, nhận `10/12/2026→ to 10/25/2026`, đúng triệu chứng ban đầu) |
| MF | cú bấm quyết định theo các kỳ đã cũ của trang (`todayJump` nhận `periods.today_local`) | đồng hồ thật | sống sót (2 đạt): ngoài lúc nửa đêm ngày cũ và ngày mới như nhau (rủi ro R-UX2A2-4) |
| MF | như trên | preload lúc 2026-10-25 23:59:20 PDT | **bị bắt**: 2 lỗi (cùng triệu chứng) |
| MB1 | bỏ lần đọc lại khi cửa sổ có `focus` | `today.spec.ts` "re-read" (cả hai test đọc lại và test nửa đêm), đồng hồ thật | **bị bắt**: 4 lỗi (test đọc lại của chính người dùng và chia sẻ, cả hai project) |
| MB2 | bỏ lần đọc lại khi `visibilitychange` | như trên | **bị bắt**: 4 lỗi (của chính người dùng: 2 lần đọc, mong đợi ít nhất 3; chia sẻ: không lần đọc nào) |
| MB3 | bỏ cả hai lần đọc lại | test nửa đêm dưới preload lúc 2026-10-25 23:59:20 PDT | **bị bắt**: 2 lỗi (tab được làm mới bằng focus vẫn giữ nhãn cũ: mong đợi không có, nhận 2026-10-25) |
| MB4 | bỏ cơ chế một lần đọc tại một thời điểm | "re-read", đồng hồ thật | **bị bắt**: 4 lỗi (hai sự kiện focus trong một tác vụ: mong đợi 1 lần đọc, nhận 2) |
| MG | lần đọc lại đi tới route của chính người dùng trong chế độ xem chia sẻ (`ownRequest` thay cho `request`) | "re-read", đồng hồ thật | **bị bắt**: 2 lỗi (test đọc lại ở chế độ chia sẻ, cả hai project: lần đọc qua chia sẻ không bao giờ đến) |
| MC | khôi phục quy tắc opacity (thêm lại `button[aria-disabled='true'] { opacity: var(--opacity-disabled) }` bên cạnh việc làm mờ bằng màu) | `focus-ring.spec.ts` "inactive Today", cả hai project, đồng hồ thật (cửa sổ: Today thành không hoạt động sau một lần bấm) | **bị bắt**: 8 lỗi (opacity 0.6; vòng vẽ 2.70 hoặc 2.73:1 sáng, 3.34 hoặc 3.16:1 tối, đúng các số ban đầu) |
| MC | như trên | như trên, mô phỏng 2026-11-04 15:00 PST (ngoài cửa sổ: Today không hoạt động ngay khi vào trang) | **bị bắt**: 8 lỗi (opacity 0.6; 2.70:1 sáng, 3.34:1 tối; các trường hợp tối hỏng ở kiểm tra opacity và kiểm tra đủ màu nhấn) |
| ME | bỏ vòng focus của Today không hoạt động (`:focus-visible { box-shadow: none }` cho nó) | đồng hồ thật | **bị bắt**: 8 lỗi ("a focus ring is painted": 0 lớp vòng) |
| ME | như trên | mô phỏng 2026-11-04 15:00 PST | **bị bắt**: 8 lỗi (0 lớp vòng) |
| MD | đảo lại một chuỗi đã đổi tên: `ClockOutDialog.tsx:74` "check-out time" thành "clock-out time" | unit `userWording.test.ts` | **bị bắt**: 1 trên 3 lỗi, nêu tên file và dòng |
| MD2 | đảo lại một chuỗi đã đổi tên: `ClockPanel.tsx:20` "Checking your status" thành "Checking the clock" | như trên | **bị bắt**: 1 trên 3 lỗi, nêu tên file và dòng |
| đối chứng | không đột biến, trong cùng bản sao nháp | "inactive Today" lúc 2026-11-04; "left open across" và "re-read" với đồng hồ thật | đạt: 8 trên 8 và 6 trên 6 |

- **Các test vòng focus của FIX2 không rỗng ở nhánh nào.** Khi không đột biến chúng đạt với đồng hồ thật (một ngày trong cửa sổ, nơi
  test bấm Today đang hoạt động trước) và lúc 2026-11-04 (ngoài cửa sổ, nơi Today không hoạt động ngay khi vào trang và test focus vào
  nó, lùi ra bằng Shift+Tab rồi quay lại bằng Tab): mỗi lần 8 trên 8 (`20-e2e-real.txt`, `64-full-1104-1500.txt`,
  `72-base-fr-1104.txt`). Với MC chúng hỏng 8 trên 8 ở cả hai ngày với đúng các số ban đầu; với ME chúng hỏng 8 trên 8 ở cả hai ngày
  vì không có vòng nào được vẽ trên nút đang có focus. Vậy ở cả hai nhánh, test đưa focus bằng bàn phím tới Today không hoạt động và đo
  một vòng thật.

## 5. Rủi ro (câu hỏi audit 5)

- **R-UX2A-1, `/theme-init.js` và các file tĩnh khác không có `Cache-Control`.** Không đổi: bản build server giống hệt ngoài ba chuỗi,
  và lần đọc header của tôi cho thấy `/`, `/theme-init.js` và `/cd-logo.svg` không có `Cache-Control` hay `ETag`
  (`61-control-real.txt`). Vẫn là rủi ro mang theo chấp nhận được cho một vòng server sau.
- **R-UX2A-2, các chuỗi đổi tên không được test.** Đã đóng nhờ `userWording.test.ts` (mục 1).
- **R-UX2A-3, ngưỡng của liên kết Review trên điện thoại phụ thuộc font.** Không đổi (ngưỡng container vẫn là các giá trị rem cũ);
  mệnh đề tài liệu mới nói "dưới khoảng 330px", đúng như tôi đo với font hệ thống của máy này (mục 1). Một điện thoại có font hệ thống
  rộng hơn có thể làm điểm xuống hàng dịch đi; xem thử trên iPhone và điện thoại Android thật trong pilot vẫn là bước tùy chọn.
- **R-UX2A-4, axe báo `label-content-name-mismatch` trên các nút ngày của điện thoại.** Không đổi: mọi lượt quét điện thoại của tôi đều
  báo lỗi này trên 14 nút ngày và không gì khác; mã của nút không thuộc vòng sửa. Vẫn có từ trước và là tùy chọn.
- **R-UX2A-5, kỳ mà Today mở hiện nhãn "future" trong các ngày của cửa sổ.** Không đổi; câu hỏi tùy chọn WP5-UX2-Q3 của chủ vẫn mở
  và mặc định (a) giữ nguyên. Tôi không quyết định việc này.
- **R-UX2A2-1 (mới, tùy chọn), Today không hoạt động khác Today hoạt động chủ yếu ở sắc màu.** Chữ mờ so với chữ màu nhấn chỉ 1.04:1 về
  độ sáng (sáng) và 1.03:1 (tối); viền khác nhau 1.51:1 và 2.09:1; con trỏ chỉ đổi sang `not-allowed` khi dùng chuột
  (`75-ringcalc.txt`; kiểu opacity 0.6 của d1a20a7 khác khoảng 2.3:1). Thành phần không hoạt động được miễn SC 1.4.11, trạng thái được
  báo cho công nghệ hỗ trợ (`aria-disabled` và mô tả "Already showing today"), bấm vào thì vô hại (đọc lại, và chỉ di chuyển khi ngày
  đã đổi), và quy tắc "không bao giờ chỉ bằng màu" của docs/04 viết cho trạng thái ngày; nên đây không phải lỗi. Tùy chọn: thêm một dấu
  hiệu không phải màu (ví dụ viền gạch hoặc không viền khi không hoạt động), hoặc chủ tự đánh giá qua ảnh chụp
  (`audit2-inactive-today-desktop-light-next-synthetic.png` và ba ảnh nữa).
- **R-UX2A2-2 (mới, thông tin), thêm một lần đọc kỳ khi một tab của chính người dùng hiện lại.** Lần đọc lại mới của màn hình đi cùng
  lần tra check in/out và lần tải lại bảng của T09, nên một tab hiện lại giờ đọc `/api/periods/current` 3 lần (trước là 2) cùng một
  hoặc hai lần đọc timesheet mà T09 vốn đã làm; số lần có giới hạn, theo nhịp người dùng và không bao giờ lặp (mục 2). Tùy chọn: để màn
  hình bỏ lần đọc lại khi tab hiện ở chế độ của chính người dùng, nơi lần tải lại của T09 đã làm mới các kỳ.
- **R-UX2A2-3 (mới được ghi, có từ trước, tùy chọn), tên của bộ chọn nhãn trên desktop vào những ngày có dòng nhãn thứ hai.** Lượt quét
  của tôi trên kỳ 11/23-12/06 (desktop, cả bốn tình huống giao diện) báo `label-content-name-mismatch` trên nút mở bộ chọn nhãn của
  2026-11-26 và 2026-11-27, hai ngày lễ: tên của nút là "Label for {date}: {nhãn chính}" (`SheetWeekTable.tsx:117`) trong khi chữ nhìn
  thấy còn có dòng thứ hai của `LabelContent` (`sheetModel.ts:137-162`: vào ngày lễ là tên ngày lễ và chữ "Holiday"; vào các ngày khác là
  một dòng nghỉ phép, "Work from home" hoặc "Note"). Mã này không đổi từ 90b98ef và nằm ngoài vòng này; các lượt quét trước không đi tới
  một kỳ có ngày lễ. Nhãn chính nhìn thấy có trong tên, như AX-05 đã chấp nhận cho các nút ngày. Tùy chọn: đưa các dòng nhìn thấy vào tên
  của nút trong vòng sửa của pilot.
- **R-UX2A2-4 (mới, tùy chọn), quyết định lúc nửa đêm chỉ được bảo vệ bởi một lượt chạy dưới đồng hồ mô phỏng.** Đột biến MF của tôi
  (cú bấm quyết định theo các kỳ đã cũ của trang thay vì câu trả lời mới) đạt bộ test với đồng hồ thật và chỉ bị bắt khi
  `today.spec.ts:538` chạy dưới preload của FIX10 trong vòng 90 giây trước một nửa đêm của múi giờ báo cáo (mục 4); MA (không đọc lại
  gì) thì bị bắt cả với đồng hồ thật. Cách chạy preload nằm trong bằng chứng ở handoff, không ở `scripts/`, docs/06 hay DEVELOPMENT, nên
  một gate sau có thể bỏ sót. Tùy chọn: một script hoặc bước gate có tài liệu cho lượt chạy nửa đêm, hoặc một test mức màn hình đưa vào
  một câu trả lời kỳ đã cũ.
- **Quan sát (không phải lỗi).** Sau một nửa đêm giữa kỳ, vùng live ẩn giữ câu của lần nhảy trước (một ngày cũ hơn); câu đó không được
  đọc lại, và brief yêu cầu một lần bấm khi không hoạt động không chạm vào vùng này.

## Phát hiện

Không có. Không tìm thấy lỗi nào trong vòng sửa hay trong những gì nó chạm tới; các mục ở trên là rủi ro và quan sát tùy chọn.

## Gate chưa chạy hoặc bị chặn, và lý do

- Không kiểm tra bắt buộc nào chưa chạy: typecheck, lint, `npm test`, TOÀN BỘ e2e trên cả hai project với đồng hồ thật, AC-13 một
  lần, các probe đồng hồ mô phỏng của tôi với một lượt TOÀN BỘ ngoài cửa sổ, và các đột biến đều đã chạy trên digest này. Drill không
  bắt buộc (WP5-UX2-REGATE2 đã chạy; image phát hành `sha256:6d1844425345…`). Các mục NAS vẫn NOT VERIFIED như mọi gate trước.
- Các thời điểm lịch khác ngày thật 2026-10-15 chỉ chạy dưới đồng hồ mô phỏng, đã kiểm bằng một lần đối chứng; đồng hồ riêng của
  trình duyệt vẫn là thật theo thiết kế, điều này làm các kiểm tra ngày thiết bị chặt hơn.
- Focus cửa sổ và visibility được phát dưới dạng sự kiện trong các probe và trong bộ test: Chromium headless không phát `focus` cửa
  sổ khi chuyển tab thật (`bringToFront`) trong probe của tôi (0 sự kiện, 0 lần đọc), nên chưa quan sát được một lần chuyển tab; lần
  focus cửa sổ thật của một lượt đi bàn phím rời rồi quay lại tài liệu thì đã quan sát được (mỗi lần một lần đọc), và trình nghe là cùng
  một trình nghe trong cả hai trường hợp.
- axe-core 4.14.0 là bản chép từng byte của file mà audit đầu đã tải vào thư mục task của nó (`70-axe-copy.txt`, có ghi SHA-256); nó
  chỉ được chèn trong ngữ cảnh probe của tôi, với CSP được bỏ qua ở đó.
- Các lần chạy server và CLI của tôi dùng fixture e2e (cổng loopback do hệ điều hành cấp, thư mục dữ liệu riêng) và `SMOKE_PORT`
  48871 với `DATA_DIR` và `DATABASE_PATH` trong thư mục task.

## Xử lý phát hiện trước

- WP5-UX2-AUDIT-01, 02 và 03: đã đóng (mục 1).
- FAIL của WP5-UX2-REGATE (các test vòng focus phụ thuộc lịch) được FIX2 trả lời và đã thấy được sửa: tám test đạt trong và ngoài cửa
  sổ (mục 4).
- Backlog đang mang theo trước đó (R-AB9-1 đến R-AB9-6 và cũ hơn) không bị vòng sửa chạm tới.
- Như brief nêu, PASS này nghiệm thu lại WP5 trên a643794 và thay thế WP5-UX-AUDIT-AB9 cùng các audit trỏ tới nó (coordinator ghi
  `superseded_by` trên bảng).
- Các rủi ro của audit đầu: R-UX2A-2 đã đóng; R-UX2A-1, -3, -4 và -5 được mang theo (mục 5); thêm các rủi ro tùy chọn mới R-UX2A2-1 đến
  R-UX2A2-4.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

- **Sẵn sàng phần mềm:** được nghiệm thu lại trên a643794 / `229df806…` bằng PASS này, cùng gate PASS của WP5-UX2-REGATE2 trên cùng
  digest (image phát hành `sha256:6d1844425345…`, do gate đó ghi). Việc làm mới định danh trong gói pilot theo commit và image này là
  bước của coordinator; không điều gì ở đây đổi dữ liệu, server hay các quyết định D-1 đến D-15 của gói pilot.
- **Phép của chủ:** không yêu cầu và không được cấp. Không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa pilot nào chạy.

## Một bước tiếp theo

Coordinator:
- ghi WP5-UX2-AUDIT2 là PASS trên a643794 / `229df806…`, và `superseded_by` WP5-UX2-AUDIT2 trên WP5-UX-AUDIT-AB9 cùng các audit trỏ
  tới nó;
- đưa R-UX2A-1, R-UX2A-3, R-UX2A-4 và R-UX2A2-1 đến R-UX2A2-4 vào backlog (R-UX2A-5 vẫn đi cùng câu hỏi tùy chọn WP5-UX2-Q3 của chủ);
- rồi commit nghiệm thu, làm mới định danh trong gói pilot (a643794, image `6d1844425345…`) và các bản ghi nghiệm thu lại WP5.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX2-AUDIT2, attempt 1.
  - Reviewer: tự báo `claude-opus-5-5`; một subagent mới (bảng ghi agent ID `a24468c424df70b4b` cho task này; không quan sát được từ
    bên trong).
  - Các tác giả được kiểm (theo bảng): WP5-UX2-PLAN đến PLAN4 (`a767b8896b0d1cc72`), T01 `a9d962e5be41fe678`, T02
    `ac90307b14c9bad40`, T03 `aff6b930318d2d3a0`, T04 `ae57a22e4eaa6440a`, T05 `a51d67415e6afc416`, T06 `a04f4d6a819678578`, T07
    `a4f3080aaa2d73816`, T08 `a96d4ba20fcf89e1e`, T09 `aabbee779a229a4a3`, T10 `a291a953326b454ee`, FIX1 `aa625bed0af810281`, FIX2
    `a7aa5daee5dc1129b`; tất cả tự báo `claude-sonnet-5-5`, cũng như các freeze, WP5-UX2-GATE, REGATE và REGATE2. Model của tôi không
    yếu hơn model mạnh nhất của các tác giả.
- **Context mới; reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm, không chạy plan, slice, sửa, freeze
  hay gate nào của vòng này, và tôi không phải auditor của WP5-UX2-AUDIT (agent `aa1ac7827beb0fe41`). Tôi không sửa source, test, tài
  liệu, bảng hay file STATE nào. Các bản export, build, probe và đột biến nằm trong thư mục task; trong repository tôi chỉ viết cặp
  review này, phần Results của brief và `handoff/delivery/evidence/WP5-UX2-AUDIT2/`. Ghi chú quy trình: một lệnh `sleep 1` chạy
  trực tiếp, một lần đọc file log bằng `tail -c` ghi sang file khác, và một dòng trạng thái được pipe vào `tail -n 0` trái với quy tắc
  của brief (không in gì; không ảnh hưởng file hay tiến trình); hai lỗi probe của chính tôi được phát hiện và chạy lại sau khi sửa, giữ
  cả hai log đầu (probe request đầu kỳ vọng không có lần đọc nào từ một lượt Tab vòng qua cuối trang; bộ lấy mẫu vòng focus đầu có ô cắt
  1x1 rơi ra ngoài vòng ở hai cạnh và tính đường viền trong suốt của radio giao diện là một vòng); các spec riêng của task chỉ nằm trong
  `px/`, không bao giờ trong bản export được kiểm; axe-core được chép, không tải về. Không còn gì đang chạy.
- **Digest trước/sau; bằng chứng gate của snapshot đó:** `229df806…0b04db3` (815 file) trước và sau, ở ba dạng
  (`01-digest-before.txt`, `01-digest-after.txt`). Nó bằng digest ghi nhận của WP5-UX2-REGATE2 (gate PASS trên a643794; các mục NAS
  NOT VERIFIED).
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX2_REVIEW2.md` và `.vi.md`, cả hai đều mới; mọi review trước
  không bị chạm tới.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** WP5-UX2-AUDIT-01, 02, 03 và R-UX2A-2 đã đóng; không có phát
  hiện mới; không cần task sửa; các rủi ro tùy chọn vào backlog ("Một bước tiếp theo").
