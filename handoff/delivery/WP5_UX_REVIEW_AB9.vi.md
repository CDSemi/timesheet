# Thiết kế lại giao diện WP5, kiểm lại độc lập gộp vùng A và B (AB9) sau WP5-UX-FIX10

Bản dịch của [WP5_UX_REVIEW_AB9.md](WP5_UX_REVIEW_AB9.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện theo yêu cầu chủ dự án WP5, task WP5-UX-AUDIT-AB9,
  attempt 1, 2026-10-14 06:20Z đến khoảng 08:00Z (2026-10-13 23:20 đến 2026-10-14 01:00 giờ America/Los_Angeles). Reviewer tự báo model
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Đây là một lần kiểm lại phần thay
  đổi, gộp vùng A và vùng B. Các review A đến A7, B đến B7 và AB8 được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `90b98efc395c3894a21a909b6d361eadc6fc2bd9` (bản freeze của WP5-UX-FIX10, `freeze_commit` của WP5-UX-REGATE8). HEAD = origin/main = 90b98ef
  trước và sau; không có commit chưa push. Digest `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 file, không tính
  `handoff/`. Tôi ghi nó đầu tiên (06:20:41Z, ngay sau `node --version`) và cuối cùng (07:54:27Z), mỗi lần ở ba dạng bằng nhau:
  `scripts/source-digest.mjs`, `git ls-tree` tại 90b98ef và tại HEAD. Bản export sạch bằng `git archive` của 90b98ef chứa đúng 795 path và
  blob của cây (danh sách của nó bằng danh sách `ls-tree`), trước và sau mọi lần chạy. Source đủ: `npm ci` exit 0 trong bản export.
- **Quyết định: PASS.**
  - **Sản phẩm không đổi kể từ 255ba17.** Phần thay đổi 3670a6c..90b98ef chỉ chạm 8 path test, và các bản export sạch của 3670a6c, 90b98ef và
    255ba17 build ra cùng một `dist/` từng byte (230 file). Kết luận vùng A của A7, kết luận vùng B của B7 và kết luận của AB8 được giữ.
  - **Độ mạnh của test giữ được.** Không khẳng định nào bị bỏ hay làm yếu; `fixtures.ts` chỉ mở rộng một dòng import và thêm một phương thức;
    không thêm skip, fixme hay only; không có lần đạt rỗng; trường hợp biên báo lỗi có tên rõ ràng (đột biến M1-M5 và M7).
  - **Ngữ nghĩa của AB8-01 được giữ.** Hạn muộn hơn được ghi cho chính kỳ hiển thị, qua route ngoại lệ trả lương của admin đã phát hành, và
    chỉ khi hạn tự nhiên không còn xa hơn 120 s. Phần dựng tự khẳng định điều kiện trước của nó. Các test vẫn chứng minh tự động hóa hạn chót,
    quy tắc kích hoạt ở docs/05 dòng 26, và revision tự động cùng PDF của nó, và chúng không che giấu lỗi sản phẩm nào.
  - **AB8-02 đến AB8-04 đã đóng** (giải phóng trên mọi đường; ngày nhập nằm sau kỳ hiển thị; quy tắc năm mặc định của client). Phép suy của
    tôi trên 2026-10-01..2028-12-31, các đột biến và lượt quét xác nhận từng lỗi.
  - **Lượt quét đồng hồ giả lập của tôi đạt:** tám thời điểm mới, TOÀN BỘ bộ test trên cả hai project, mỗi lần 210 đạt, 0 lỗi, 26 bỏ qua.
    Thêm hai lần chạy một worker (2027-09-14 18:30 và 2027-03-15 10:00) cũng cho 210 / 0 / 26.
  - **Các kiểm tra bắt buộc đạt:** typecheck 0, lint 0, `npm test` 83 file / 1831 test, TOÀN BỘ e2e trên đồng hồ thật (trong cửa sổ AB8-01)
    210 đạt / 0 lỗi / 26 bỏ qua, AC-13 1/1, AC-01 với mọi nhóm isolation được chạy tới trên cả hai project.
  - Không có lỗi chặn. Sáu rủi ro tùy chọn (R-AB9-1 đến R-AB9-6) được liệt kê bên dưới. R-AB9-6 là hành vi sản phẩm có từ WP3; tôi đánh giá
    lại nó từ Results của FIX10 và xếp nó là không chặn, với lý do nêu ở đó.
  - PASS này nghiệm thu WP5 ở cả hai vùng và thay thế WP5-UX-AUDIT-A6 cùng các audit cũ hơn trỏ tới A6.

## Phạm vi thật đã xem và chạy

1. **Sản phẩm không đổi (phạm vi 1).** Tôi đọc toàn bộ diff `3670a6c..90b98ef` ngoài `handoff/` (8 path test, 234/26 dòng). Tôi export sạch
   3670a6c, 90b98ef và cả 255ba17, chạy `npm ci` và `npm run build` ở mỗi bản, rồi so `dist/` từng file.
2. **Độ mạnh của test (phạm vi 2).** Numstat, mọi dòng bị bỏ, số `expect(` và `test(`/`it(` theo từng file, quét skip/fixme/only/fail/slow/soft
   trên các dòng thêm và trên cả cây `tests/` ở hai commit, và một diff bỏ qua khoảng trắng của `shell.spec.ts`.
3. **Ngữ nghĩa của AB8-01 (phạm vi 3).** Tôi đọc `automation.spec.ts:118`, `pdf-visual.spec.ts:187`, phương thức mới
   `SeedClient.ensureDeadlineAhead` (`fixtures.ts:447-472`) và `laterDeadlineFor` (`displayedSeed.ts:54-57`). Tôi cũng đọc route sản phẩm
   `POST /api/admin/payroll-exceptions` (`admin.ts:230-249`, `calendars.ts:275-348`, `validatePayrollExceptions` và `payPeriodAt` trong
   `periods.ts:66-113`), schema của nó (`schemas.ts:274-282`), docs/05 dòng 26 và test tích hợp của sản phẩm
   `tests/integration/payroll-exceptions.test.ts`.
4. **AB8-02..04 (phạm vi 4).** Tôi đọc mọi lời gọi seed trên nhân viên dùng chung của worker (55 chỗ gọi) và các đường giải phóng ngày. Các phép
   suy riêng của tôi (`derive9.ts.txt`, `derive9fine.ts.txt`, `pool.ts.txt`) phủ mọi ngày từ 2026-10-01 đến 2028-12-31. Tôi chạy sáu đột biến
   mức unit và hai đột biến mức e2e trong một bản export nháp riêng.
5. **Lượt quét đồng hồ giả lập (phạm vi 5).** Tôi dùng nguyên preload của AB8 (giống từng byte bản trong bằng chứng AB8; bản của FIX10 và
   REGATE8 chỉ khác dòng chú thích đầu). Tôi chạy một phép đối chứng trước, rồi chạy TOÀN BỘ bộ test trên cả hai project tại tám thời điểm tự
   chọn, rồi hai lần chạy một worker.
6. **Kiểm tra bắt buộc (phạm vi 6)** tại 90b98ef trong bản export sạch: typecheck, lint, `npm test`, TOÀN BỘ e2e trên đồng hồ thật, AC-13 một
   lần, AC-01 với step reporter, `npm audit`.
7. **Mục mang theo (phạm vi 7):** R-AB8-1 đến R-AB8-4, R-B7-1 đến R-B7-4, A7 R1/R5/N5/N6/N7, B6 R-10, R-11, R-13, R-14 và R-16 đến R-20.
8. **Quan sát History của FIX10**, được đánh giá lại bằng một probe cục bộ của task (R-AB9-6).

**Đối chứng đồng hồ giả lập.** Preload `shiftclock.mjs` tới được runner Playwright, các worker của nó, CLI và server đã build qua
`NODE_OPTIONS=--import`. Mỗi tiến trình dời `Date` một hằng số, nên thời gian trôi vẫn thật. `src/client` vẫn không đọc đồng hồ trình duyệt
(grep `Date.now`, `new Date(`, `Date()`, `performance.now`, `setInterval` và `Temporal.Now` ra 0 dòng), và sản phẩm giống từng byte, nên trang
chỉ hiện ngày của server. Đối chứng vào thứ Ba 2026-11-24 (`08-…`):
- một spec đối chứng cục bộ, chép vào bản export nháp cho một lần chạy rồi xóa: server báo `today_local=2026-11-24`, kỳ hiển thị 11/09-11/22
  (trả lương 11/27) và hạn `2026-11-25T01:00:00Z`, trên cả hai project;
- spec hạn chót chưa sửa của 3670a6c đạt lúc 13:00 PST và lỗi lúc 18:30 PST với đúng ba lỗi AB8-01 (`automation.spec.ts:118` trên cả hai
  project, "the displayed period is not due yet"; `pdf-visual.spec.ts:187` trên desktop, revision null);
- spec của 90b98ef đạt lúc 18:30 PST (6 đạt, 2 bỏ qua theo thiết kế).

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-AB9/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest ba dạng, đầu và cuối; HEAD; bản export | `57e2974c…4b761d`, 795 file mọi lần; HEAD = origin/main = 90b98ef; danh sách của bản export bằng danh sách `ls-tree`, trước và sau | `01-…`, `90-…` |
| `git diff --numstat 3670a6c 90b98ef` ngoài `handoff/` | đúng 8 path test: `e2eSeedSelection.test.ts` 101/2, `admin.spec.ts` 15/9, `automation.spec.ts` 4/0, `displayedSeed.ts` 47/0, `fixtures.ts` 35/1, `pdf-visual.spec.ts` 5/3, `shell.spec.ts` 16/11, `timesheet.spec.ts` 11/0 | `02-…` |
| quét độ mạnh của test | liệt kê dòng bị bỏ theo file; `fixtures.ts` chỉ bỏ dòng import; thêm 0 skip/fixme/only/fail/slow/soft; cây có 12 dòng skip, 0 only và 0 fixme ở cả hai commit | `03-…` |
| `npm ci` + `npm run build` của 3670a6c, 90b98ef và 255ba17; so từng byte | exit 0 mỗi bản; `dist/` 230 file (180 server, 46 domain, 4 client); danh sách sha bằng nhau (cmp 0); `diff -r` exit 0 cho `dist/`, `dist/server` và `dist/client`; client `index-ZRY_mcb_.js` 483030 byte (`74d87ee4…`); không có diff dưới `src`, `scripts`, `docs`, các file package hay config | `04-…` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / exit 0 | `05-…` |
| `npm test` | exit 0; 83 file, 1831 test | `05-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0, 1/1 | `05-…` |
| `npm audit --omit=dev` / `npm audit` | 0 / 1 high (`source-map-js` chỉ ở dev, GHSA-68fv-2mgg-jv7q): R1 của A7 không đổi | `05-…` |
| các phép suy riêng (`derive9`, `derive9fine`, `pool`, `instants`) | `laterDeadlineFor`: 0 sai lệch trên 8230 thời điểm (tự nhiên 6122, dời 2108 trên 234 ngày) và trên 83115 thời điểm mỗi 15 phút (tự nhiên 63483, dời 19632); năm và ngày nhập trên 823 ngày: 0 vấn đề; quỹ ngày trống nhỏ nhất là 3, chỉ vào 2026-11-28..30 | `06-…` |
| đột biến unit và e2e trong một bản export nháp riêng | M1-M5 bị bắt; M6 sống sót (R-AB9-1); M7 lỗi rõ ràng; M8 đưa AB8-02 trở lại (2 lỗi) và bản đối chứng của nó đạt (25 đạt) | `07-…` |
| đối chứng đồng hồ giả lập (thứ Ba 2026-11-24) | spec đối chứng: server báo `today_local=2026-11-24`; spec hạn chót của 3670a6c: 6 đạt lúc 13:00 PST, đúng 3 lỗi AB8-01 lúc 18:30 PST; 90b98ef lúc 18:30 PST: 6 đạt | `08-…` |
| TOÀN BỘ e2e, cả hai project, đồng hồ THẬT, 2026-10-13 23:36-23:42 PDT (đường dời hạn) | **exit 0: 210 đạt, 0 lỗi, 26 bỏ qua** (desktop 103/0/15, mobile 107/0/11); 0 dòng deprecation; 203 bước expect lỗi đều là các vòng lặp `expect.poll` trong bốn spec không đổi | `09-…` |
| AC-01: `isolation.spec.ts` + `shell.spec.ts`, đồng hồ thật, 23:43 PDT | exit 0, 13 đạt, 1 bỏ qua (một test chỉ cho mobile, trên desktop); mọi dòng khẳng định isolation được chạy tới và đạt trên cả hai project, cả trong lần chạy đầy đủ | `10-…` |
| TOÀN BỘ bộ test dưới đồng hồ giả lập, 8 thời điểm cộng 2 lần chạy một worker (bảng dưới) | mỗi lần exit 0, 210 đạt, 0 lỗi, 26 bỏ qua; không cần chạy lại | `11-…` |
| probe History sau một lần ký sớm thủ công (cục bộ của task, bản export nháp) | lúc 2026-11-24 18:30 PST việc ký kỳ đang chạy được chấp nhận và History hiện nó như một dòng không phải hiện hành; vào 2026-11-28 cùng dòng đó đầy đủ (R-AB9-6) | `12-…` |

## Sản phẩm không đổi (phạm vi 1)

`git diff 3670a6c..90b98ef` ngoài `handoff/` chạm đúng 8 path test mà brief nêu, và `git diff --stat` trên `src`, `scripts`, `docs`, các file
package và mọi file cấu hình là rỗng. `git diff 255ba17..90b98ef` ngoài `handoff/` và `tests/` cũng rỗng. Ba bản export sạch build ra cùng một
`dist/` từng byte: 230 file (180 server, 46 domain, 4 client), danh sách sha256 từng file bằng nhau (cmp 0) và `diff -r` exit 0 cho cả `dist/`,
`dist/server` và `dist/client`. Bundle client là `index-ZRY_mcb_.js` (483030 byte, sha256 `74d87ee4…`) với `index-B6Rp4E3V.css` (`17b217c2…`),
như AB8 và REGATE8 đã ghi. Vậy sản phẩm của 90b98ef chính là sản phẩm của 255ba17, và kết luận vùng A và vùng B của A7, B7 và AB8 được giữ.

## Độ mạnh của test (phạm vi 2)

- `fixtures.ts` +35/-1: dòng bị bỏ duy nhất là dòng import, được mở rộng thêm `type DeadlinePeriodFacts` và `laterDeadlineFor`. Phần còn lại
  là phương thức mới `ensureDeadlineAhead`. Không helper cũ nào đổi (`displayedPeriodFreeWorkdays`, `clearSessions` và các helper khác giống
  từng byte).
- `displayedSeed.ts` +47/-0, `automation.spec.ts` +4/-0 và `timesheet.spec.ts` +11/-0 chỉ thêm.
- `shell.spec.ts` +16/-11: khi bỏ qua khoảng trắng, thay đổi duy nhất là `try {` / `} finally { await employeeSeed.clearSessions(workDate); }`
  và một dòng chú thích. Cả 7 khẳng định của `:67` được giữ.
- `pdf-visual.spec.ts` +5/-3: lần đọc `periods` được thay bằng kỳ mà `ensureDeadlineAhead` trả về (cùng trường `period_start` và
  `due_at_utc`); mọi khẳng định được giữ.
- `admin.spec.ts` +15/-9: hai kiểu interface được mở rộng; `year` nay lấy từ `defaultImportYear` của client; `newYear`, `midYear` và hằng
  `${year}-03-03` trở thành giá trị của `importDatesAfter`, dùng trong cùng các khẳng định (`[data-diff-date]`, `[data-kept-date]`,
  `arrayContaining`); một `expect` mới kiểm rằng ba ngày nằm trong năm nhập. Các khẳng định stale-hash, ranh giới, không đổi, banner cảnh báo
  và "next year has dates now" không đổi.
- `e2eSeedSelection.test.ts` +101/-2: hai dòng import được mở rộng; bốn test của FIX9 không đổi; thêm bốn test.
- Số lượng: `expect(` 87→88 (admin), 5→7 (fixtures), 18→35 (unit), không đổi ở các spec khác; `test(`/`it(` không đổi ở mọi spec, 4→8 trong
  file unit. Các dòng thêm không có `skip`, `fixme`, `.only`, `test.fail`, `.slow`, `expect.soft` hay retries. Cây `tests/` có 12 dòng skip,
  0 only và 0 fixme ở cả hai commit.
- **Không có lần đạt rỗng, và trường hợp biên báo lỗi rõ ràng:**
  - `ensureDeadlineAhead` gửi bằng `call(…, 201)`, hàm này khẳng định mã trạng thái và in nội dung phản hồi. Sau đó nó khẳng định hạn còn xa
    hơn biên và ngày trả lương không đổi. Đột biến M7 (không bao giờ ghi ngoại lệ) lỗi lúc 18:30 của một thứ Ba đến hạn với "the displayed
    period (payroll 2026-11-27) is due after 120 s from now", ở cả ba test hạn chót.
  - `automation.spec.ts:155` vẫn giữ phép kiểm riêng, trên kỳ mà nhân viên thấy, sau khi seed.
  - `admin.spec.ts:299` nêu tên ba ngày khi một trong số chúng ra khỏi năm nhập.
  - Đột biến unit: M1 (không bao giờ dời), M2 (trưa hôm nay), M3 (bỏ biên), M4 (giữ ngày danh nghĩa) và M5 (không khử trùng) đều làm các test
    unit mới lỗi. M6 (cho phép một ngày bằng ngày cuối kỳ) sống sót (R-AB9-1).

## Ngữ nghĩa của AB8-01 (phạm vi 3)

- **Một đường admin được hỗ trợ.** `POST /api/admin/payroll-exceptions` là một route admin đã phát hành. Schema của nó nhận `due_local_date` và
  `due_local_time`, và `payPeriodAt` tính hạn của kỳ từ hai giá trị đó. Test tích hợp của chính sản phẩm `payroll-exceptions.test.ts` ghi cùng
  dạng này (trả lương 10/16, hạn 10/14 12:00). docs/01 dòng 29 quy định ngoại lệ ngày trả lương là tường minh, và E-10 làm mới kỳ đã lưu chưa
  chốt. Seed không tạo ngoại lệ trả lương nào, và mỗi test hạn chót chạy trên server riêng mới của nó, nên các trường hợp 409
  `payroll_exception_exists` và `period_finalized` không thể xảy ra ở đó. Server dùng chung của worker không bao giờ bị chạm.
- **Cùng kỳ, cùng khẳng định.** Ngoại lệ giữ nguyên ngày trả lương danh nghĩa và ngày trả lương thật, nên `currentPayPeriod` vẫn mở đúng kỳ đó.
  Phép suy của tôi tìm thấy 0 sai lệch trên 8230 thời điểm (mười giờ trong ngày) và trên 83115 thời điểm mỗi 15 phút: helper dời hạn đúng khi
  hạn tự nhiên không còn xa hơn 120 s; ngoại lệ luôn qua `validatePayrollExceptions`; kỳ, 14 ngày của nó và ngày trả lương của nó được giữ; và
  hạn được ghi (12:00 ngày mai giờ Los Angeles) xa ít nhất 12 giờ và sau thời điểm kích hoạt. Step report cho thấy lần POST ngoại lệ trong mọi
  lần chạy trên đường dời hạn (3 lần mỗi lượt) và không lần nào trên đường tự nhiên.
- **Thứ được test vẫn là tự động hóa hạn chót.** Kích hoạt được ghi trước một phút. CLI chạy job lúc hạn + 1 phút, khi đó không có gì xảy ra nếu
  chưa kích hoạt, và từ hạn + 5 phút. Kỳ được chốt chỉ vì hạn đã ghi của nó bằng hoặc sau thời điểm kích hoạt, đúng như docs/05 dòng 26 yêu
  cầu; nếu tự động hóa dùng hạn tự nhiên, kỳ sẽ không đủ điều kiện và test sẽ lỗi. Ngày trên PDF (`printedDate`/`submissionDate`) lấy từ hạn
  mà server báo, nên ngày nộp tự động của AC-10 vẫn được kiểm. Mọi khẳng định về origin `deadline`, chờ duyệt, không có sign-off, ma trận ghi
  chú và ảnh, bản capture, các thông báo, dữ kiện History và góc nhìn của quản trị viên đều không đổi.
- **Không che giấu gì.** Ngoài cửa sổ, hạn tự nhiên vẫn chạy: 6122 trên 8230 thời điểm của tôi, và các lượt quét s3, s4 và s5. Trong cửa sổ,
  kịch bản tự nhiên không thể dựng được, vì trang đang hiện một kỳ đã quá hạn. Fixture chuẩn TM-23 và TM-24 và `deadline.test.ts` cũng phủ phép
  tính hạn tự nhiên của sản phẩm. Các ràng buộc của docs/05 về ngày tạo tài khoản và cài đặt đã lưu đúng ở cả hai đường: tài khoản và cài đặt
  của chúng có trước hạn được ghi.
- Kết luận: phần dựng là một đường admin được hỗ trợ; nó tự khẳng định điều kiện trước của mình; ý nghĩa ban đầu của cả hai test (nộp tự động
  tại hạn chót sau kích hoạt, AC-07, và AC-10 trên PDF tự động) được giữ; nó không che giấu lỗi sản phẩm nào.

## AB8-02..04 (phạm vi 4)

- **AB8-02.** `shell.spec.ts:67` giải phóng ngày của nó trong `finally`. `timesheet.spec.ts:199` ghi hai ngày lại trước khi seed, và một
  `afterEach` cấp file giải phóng chúng khi đạt lẫn khi lỗi. `admin.spec.ts:90` và các test day-editor có seed vốn đã giải phóng trong
  `finally`. `timesheet.spec.ts:414` lấy ngày trống cũ nhất và để nó không có phiên (chỉ đổi loại ngày), nên không làm cạn quỹ. Quỹ nhỏ nhất là
  3 ngày làm việc đã qua (2026-11-28 đến 11-30, Lễ Tạ ơn), và nhu cầu lớn nhất cùng lúc là 2. Đột biến M8 (bỏ cả hai lần giải phóng) đưa AB8-02
  trở lại vào 2026-11-30 với một worker ("expected >= 1, received 0" tại `timesheet.spec.ts:414`, cả hai project); các file chưa đột biến đạt
  tại cùng thời điểm. Lượt quét s3 (2026-11-30) đạt.
- **AB8-03.** `importDatesAfter` chỉ giữ một ngày danh nghĩa khi nó nằm sau ngày cuối của kỳ hiển thị; nếu không, nó dời ngày đó tới ngày trống
  đầu tiên sau ngày cuối kỳ, và giữ ba ngày khác nhau. Các spec chốt timesheet trên server dùng chung (`admin-status`, `history-settings`,
  `review`, `sharing`, `submission`) chỉ ký kỳ hiển thị (`Person.payrollDate`). Vậy không ngày nhập nào chạm được một ngày đã chốt, và không ngày
  nào nằm trước ngày hiệu lực (đầu kỳ). Phép suy của tôi trên 823 ngày tìm thấy 0 vấn đề.
- **AB8-04.** Năm kỳ vọng là `defaultImportYear(today, warnings)` của chính client, hàm mà form admin dùng (`AdminScreen.tsx:75,110`). Quy tắc
  riêng của tôi (tháng 10 đến tháng 12: năm sau, vì seed chỉ có ngày của 2026; còn lại: năm nay) bằng nó mọi ngày từ 2026-10-01 đến 2028-12-31,
  và ba ngày luôn bắt đầu bằng năm đó.

## Lượt quét đồng hồ giả lập (phạm vi 5)

TOÀN BỘ bộ test, cả hai project, tuần tự, mỗi lần chạy một thư mục output riêng, trong bản export sạch của 90b98ef; số worker mặc định (2) trừ khi
lần chạy ghi một worker. Thời điểm là giờ America/Los_Angeles. "Đường" là đường hạn chót mà step report cho thấy (3 lần POST ngoại lệ trả lương
= dời hạn, 0 = tự nhiên). Trong mọi lần chạy dưới đây: exit 0, 0 dòng deprecation, và mọi dòng khẳng định isolation và `shell.spec.ts:67` được
chạy tới và đạt trên cả hai project.

| Lần chạy | Thời điểm (LA) | Vì sao chọn | Đường | Ngày nhập (admin.spec) | desktop đạt/lỗi/bỏ | mobile đạt/lỗi/bỏ |
|---|---|---|---|---|---|---|
| thật | thứ Ba 2026-10-13 23:36 (đồng hồ thật) | thứ Ba đến hạn, sau giờ hạn (kiểm tra bắt buộc) | dời | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s1 | thứ Ba 2026-11-24 18:30 PST | thứ Ba đến hạn sau 18:00; ngày trả lương 11-27 là ngày lễ | dời | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s2 | thứ Sáu 2026-12-11 16:00 PST | ngày trả lương P; hạn muộn hơn vào P+1 | dời | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s3 | thứ Hai 2026-11-30 15:00 PST | 2026-11-30; quỹ ngày trống 3 (nhỏ nhất) | tự nhiên | 2027-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s4 | thứ Năm 2026-12-31 18:00 PST | 2026-12-31; năm mới nằm trong kỳ | tự nhiên | 2027-01-04, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s5 | thứ Hai 2027-03-15 10:00 PDT | ngày mới của 2027; P-4 ngay sau ngày đổi giờ; một ngày nhập là hôm nay | tự nhiên | 2027-03-15, 07-04, 03-16 | 103/0/15 | 107/0/11 |
| s6 | thứ Ba 2027-09-14 18:30 PDT | thứ Ba đến hạn sau 18:00 trong 2027; cả ba ngày bị dời, một ngày là hôm nay | dời | 2027-09-13, 09-14, 09-15 | 103/0/15 | 107/0/11 |
| s7 | thứ Sáu 2027-10-01 10:00 PDT | ngày trả lương trong 2027 và ngày đầu của cảnh báo năm 2028 | dời | 2028-01-01, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| s8 | thứ Ba 2028-02-29 18:30 PST | thứ Ba đến hạn rơi vào ngày nhuận, sau 18:00 | dời | 2028-02-28, 07-04, 03-03 | 103/0/15 | 107/0/11 |
| w1-s6 | như s6, `--workers=1` | mọi spec của một project chạy trên server mà admin.spec đã đổi (R-AB9-3) | dời | 2027-09-13, 09-14, 09-15 | 103/0/15 | 107/0/11 |
| w1-s5 | như s5, `--workers=1` | như trên, cho P-4 | tự nhiên | 2027-03-15, 07-04, 03-16 | 103/0/15 | 107/0/11 |

Không có lỗi mạng hay buffer, nên không cần chạy lại.

## Phát hiện

Không có. Tôi không tìm thấy lỗi chặn nào trong phần thay đổi, trong độ mạnh của test, trong ngữ nghĩa của AB8-01, trong AB8-02 đến AB8-04,
trong các kiểm tra bắt buộc hay trong lượt quét. (ID, mức, file:dòng, bằng chứng và cách sửa: không áp dụng.)

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-AB9-1:** test unit của `importDatesAfter` (`displayedSeed.ts:64-72`) không có trường hợp một ngày danh nghĩa bằng ngày cuối kỳ. Đột biến
  M6 (`>=` thay cho `>`) sống sót qua nó. Một ngày như vậy là chủ nhật trong kỳ hiển thị, mà một timesheet đã chốt bao phủ, ví dụ 2027-07-04,
  ngày cuối của kỳ trả lương 2027-07-09. Helper đã phát hành đúng trên mọi ngày tôi suy. Sửa tùy chọn: thêm trường hợp đó.
- **R-AB9-2:** `automation.spec.ts:268` ("không nộp khi chưa ghi thời điểm kích hoạt", FIX10 không đổi) chứng minh ít hơn trong cửa sổ. Khi đó
  hạn của kỳ hiển thị đã qua trước khi tài khoản của test tồn tại, nên chỉ riêng ràng buộc ngày tạo tài khoản của docs/05 đã cấm nộp. Test vẫn
  đạt, nhưng vào những ngày đó nó không tách riêng quy tắc kích hoạt. `deadline.test.ts:271`, `:293`, `:305` và `:961` phủ quy tắc này một
  cách tất định. Sửa tùy chọn: gọi `ensureDeadlineAhead` ở đó nữa.
- **R-AB9-3:** `admin.spec.ts:281` commit việc nhập ngày lễ trên lịch dùng chung của worker, hiệu lực từ đầu kỳ hiển thị, với các ngày ngay sau
  kỳ đó. Vì vậy một trong các ngày là hôm nay vào 86 ngày của 2027-2028: vào P-4 từ tháng 1 đến tháng 9, vào P-3 từ giữa tháng 3 và vào P-2 từ
  tháng 7. Trong 159 ngày, một ngày đã qua của kỳ đang chạy trở thành ngày lễ giả lập cho các spec chạy sau trên cùng worker. Các lượt quét tại
  những thời điểm đó đều đạt (s5 và s6, và cả hai lần chạy một worker, trong đó mọi spec sau của một project dùng chung server đó). Sửa tùy
  chọn: nhập trên một lịch mà không spec nào khác dùng (`seedSecondCalendar`), hoặc chọn ngày sau kỳ đang chạy.
- **R-AB9-4:** kỳ vọng của AB8-04 gọi chính `defaultImportYear` của client, nên nó kiểm cách nối dây của form, không phải một năm được đặc tả độc
  lập (docs/06 ưu tiên kỳ vọng độc lập). AB8 cho phép cách này, docs/04 không đặt năm mặc định, và phép suy của tôi kiểm quy tắc một cách độc lập
  cho mọi ngày của 2026-10-01..2028-12-31. Tùy chọn: khẳng định thêm quy tắc dạng hằng.
- **R-AB9-5:** `ensureDeadlineAhead` kiểm biên 120 s trước khi seed bốn ngày, và `automation.spec.ts:155` kiểm lại sau đó. Nếu hạn tự nhiên chỉ
  vừa hơn 120 s ở lần kiểm đầu, lần kiểm sau có thể lỗi. Cửa sổ cỡ thời gian seed (dưới vài giây) mỗi chu kỳ, lúc 16:57-16:58 các thứ Ba đến
  hạn. Tùy chọn: dùng biên trong helper lớn hơn biên của lần kiểm lại.
- **R-AB9-6 (hành vi sản phẩm có từ trước, WP3, ngoài phần thay đổi này):** Results của FIX10 nói rằng History liệt kê một revision của kỳ sau kỳ
  hiển thị mà không có dữ kiện ký, và điều này "không thể xảy ra với đồng hồ thật". Probe của tôi cho thấy nó có thể xảy ra, qua một lần ký sớm
  thủ công. Lúc 2026-11-24 18:30 PST (P-3), server chấp nhận việc ký kỳ đang chạy (11/23-12/06, trả lương 12/11). History khi đó hiện revision
  hiện hành của kỳ đó như một dòng không phải hiện hành: tiêu đề ghi "Payroll date 2026-12-11", và dòng không có dữ kiện Signed, không có badge
  giao gửi, không có "Resend email" và không có "Correct this period". Nguyên nhân là `historyWindow`/`buildRevisionRows` trong
  `src/client/components/deliveryModel.ts`: các cửa sổ kết thúc ở cuối kỳ hiển thị. Vào 2026-11-28 (P+1) cùng dòng đó đầy đủ.
  - **Vì sao không chặn:** revision, origin, PDF, người nhận và các lần gửi của nó vẫn hiện. Các thao tác History còn thiếu trở lại muộn nhất
    vào P+1, mười ngày trước hạn của chính kỳ đó. Code không đổi từ WP3 (5b90d30, 8ad2e4f) và nằm ngoài phần thay đổi chỉ-test này.
  - **Sửa tùy chọn cho backlog pilot:** kéo cửa sổ cuối tới hết kỳ đang chạy khi kỳ này nằm sau kỳ hiển thị.
  - Coordinator có thể xếp lại mục này theo docs/04 (History: "reasoned correction and explicit resend").
- **Mang theo, không đổi và không chặn** (sản phẩm giống từng byte, và FIX10 không chạm các file liên quan):
  - R-AB8-1: test unit seed không có trường hợp ngày đã có phiên; các test FIX9 không đổi.
  - R-AB8-2: `displayedPeriodFreeWorkdays` (`fixtures.ts:419-427`) vẫn giữ bộ lọc riêng.
  - R-AB8-3: một lần chạy vắt qua nửa đêm địa phương; chưa thấy.
  - R-AB8-4: độ phủ của lượt quét. Audit này thêm tám thời điểm trong 2026-2028, một ngày nhuận và một tuần đổi giờ, nhưng vẫn chỉ với lịch và
    bộ ngày lễ đã seed.
  - R-B7-1 đến R-B7-4. `sharing.spec.ts` và các phép kiểm cuộn ngang khác không đổi, nên R-B7-2 vẫn còn.
  - R1 của A7 (`npm audit --omit=dev` 0; `npm audit` 1 high, `source-map-js` chỉ ở dev, GHSA-68fv-2mgg-jv7q), R5, N5, N6 và N7.
  - R-10, R-11, R-13, R-14 và R-16 đến R-20 của B6.

  Chúng vẫn là backlog cho vòng sửa pilot.

## Gate bắt buộc chưa chạy hoặc bị chặn, và lý do

- Không có gate nào chưa chạy. Toàn bộ e2e chạy trên đồng hồ thật trên cả hai project, trong cửa sổ của AB8-01 (2026-10-13 23:36-23:42 PDT, sau
  hạn 17:00 của kỳ hiển thị), nên đường dời hạn đã chạy trên đồng hồ thật. Đường hạn tự nhiên chạy trong lượt quét (s3, s4 và s5).
- Mọi thời điểm lịch khác chỉ chạy dưới đồng hồ giả lập, đã được đối chứng như mô tả ở trên; ngày thật không đổi được.
- Tôi không chạy `npm run verify`, smoke hay drill Docker: brief không yêu cầu, và REGATE8 đã chạy chúng trên digest này.
- Fixture e2e gắn server vào cổng loopback do hệ điều hành cấp, theo thiết kế, như mọi gate trước. Tôi không tự khởi động server nào, nên không
  dùng cổng nào trong 48560-48579.

## Xử lý các phát hiện trước

- **WP5-UX-AB8-01: đóng.** Đồng hồ thật trong cửa sổ cho 210 đạt. Các thời điểm quét trên đường dời hạn (s1, s2, s6, s7 và s8) và trên đường tự
  nhiên đều đạt. Spec của 3670a6c lỗi lúc 18:30 của một thứ Ba đến hạn, còn spec của 90b98ef đạt tại cùng thời điểm.
- **WP5-UX-AB8-02: đóng.** Các ngày được giải phóng trên mọi đường; M8 đưa lỗi trở lại và bản sửa gỡ nó; s3 (2026-11-30, quỹ 3) đạt.
- **WP5-UX-AB8-03: đóng.** Các ngày nằm sau kỳ hiển thị; 0 vấn đề trên 823 ngày; s4 (2026-12-31, năm mới nằm trong kỳ) đạt.
- **WP5-UX-AB8-04: đóng.** Quy tắc của client bằng quy tắc của tôi mọi ngày; s5 đến s8 (2027-2028) đạt.
- WP5-UX-B7-01 = WP5-UX-A7-01 vẫn đóng (AB8), và WP5-UX-B6-01 vẫn đóng (B7), nhờ sản phẩm giống từng byte.
- PASS này thay thế WP5-UX-AUDIT-A6 và các audit cũ hơn trỏ tới A6.

## Sẵn sàng phần mềm, phép của chủ dự án và kết quả pilot

- **Sẵn sàng phần mềm:** WP5 đạt ở cả hai vùng trên 90b98ef (digest `57e2974c…`), dựa trên audit này, REGATE8 và sản phẩm giống từng byte đứng sau
  A7, B7 và AB8. Sáu rủi ro tùy chọn (R-AB9-1 đến R-AB9-6) và backlog mang theo vẫn để cho vòng sửa pilot.
- **Phép của chủ dự án:** không xin và không được cấp. Không triển khai, không gửi mail thật, chỉ dữ liệu giả lập.
- **Kết quả pilot:** chưa có; chưa chạy pilot nào.

## Một bước tiếp theo

Coordinator:
- ghi WP5-UX-AUDIT-AB9 PASS cho vùng A và B;
- đặt `superseded_by` cho WP5-UX-AUDIT-A6 và các audit cũ hơn trỏ tới nó;
- thêm R-AB9-1 đến R-AB9-6 vào backlog của vòng sửa pilot;
- tiếp tục nhiệm vụ với bước làm mới định danh của gói pilot (image drill của REGATE8 `sha256:dec7b485…`).

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-AB9, attempt 1.
  - Reviewer: tự báo `claude-opus-5-5`; một subagent mới, không thấy được agent ID từ bên trong.
  - Tác giả được kiểm: WP5-UX-FIX10 (`claude-sonnet-5-5`); bản freeze FIX10 (committer) và WP5-UX-REGATE8 (verifier, `claude-sonnet-5-5`); các
    tác giả vòng trước, mạnh nhất là `claude-opus-5-5`. Model của tôi không yếu hơn tác giả mạnh nhất.
- **Context mới; xác nhận reviewer không viết thay đổi:** xác nhận. Tôi không viết thay đổi nào được kiểm và không chạy gate, bản sửa hay audit
  trước nào của vòng này. Tôi không sửa file source, test, doc, board hay STATE. Các bản export, build, đột biến nháp, spec đối chứng và probe và
  mọi lần chạy đều nằm trong thư mục task. Ghi chú quy trình ở `00-README.txt`.
- **Digest trước/sau; bằng chứng gate snapshot đó:** `57e2974c…4b761d` trước và sau, ở ba dạng (`01-…`, `90-…`). Nó bằng digest ghi nhận của
  WP5-UX-REGATE8 (REGATE8 PASS; các mục NAS của nó NOT VERIFIED).
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_AB9.md` và `.vi.md`, đều là file mới; mọi review trước giữ
  nguyên.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** AB8-01 đến AB8-04 đã đóng; không có phát hiện mới. Bước tiếp: ghi PASS và backlog,
  như trên.
