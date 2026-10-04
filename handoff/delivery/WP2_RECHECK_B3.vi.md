# Review độc lập

Bản gốc tiếng Anh: [WP2_RECHECK_B3.md](WP2_RECHECK_B3.md).

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP2, lần kiểm lại cuối của vùng B (workspace, admin, UI và tích hợp) sau vòng sửa thứ hai; 2026-10-04 (UTC); task WP2-AUDIT-B3 lần 1 (board ghi kind `audit`, profile timesheet-auditor). Model tự báo `claude-opus-5-5`; board yêu cầu effort xhigh, còn effort thực tế không quan sát được. Model tác giả mạnh nhất trong snapshot là opus (`claude-opus-5-5`, WP2-T02 và WP2-T03, theo board và WP2_HANDOFF). Tác giả bản sửa vòng hai WP2-FIXB2, committer của nó và verifier WP2-GATE3 chạy sonnet. Vì vậy model của reviewer không yếu hơn. WP2-AUDIT-A2 (lần 2) chạy cùng lúc trong bản clone riêng, không dùng chung file nào.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  - Commit được kiểm: `a3d1b6555c352afa68b3d61ddc67f0c596742698`. Đây là `freeze_commit` của WP2-GATE3, trùng origin/main.
  - Source digest: `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` (613 file, không gồm handoff/). Giá trị này giống nhau trước (11:07Z) và sau (11:22Z), ở thư mục dự án và trong bản clone scratch. Nó trùng phép đối chiếu `git ls-tree` và digest của gate.
  - HEAD của dự án là commit được kiểm cả trước lẫn sau, và không có gì thay đổi ngoài handoff/.
  - Source đủ: mọi lệnh chạy trong một bản git clone của commit đó trên ổ C: (ngoài Dropbox). Một bản clone thứ hai ở f79413b chỉ dùng để so style trên màn hình thật và làm đối chứng âm mùa đông. Cả hai bản clone đã bị xóa sau khi xong.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.**
  - Mọi mục trong phạm vi đều đạt: WP2-B2-01, WP2-B2-02 (sáu khai báo đã liệt kê), WP2-B-01, WP2-B-02, màn hình ngoại lệ ngày lương (WP2-A2-02, phía UI), không có hồi quy vùng B, và gate F1 vẫn đóng.
  - `npm run verify` và `npm run test:e2e` (cả hai project) đều đạt. Test e2e R-07 đã commit cũng đạt khi đồng hồ server ở giờ chuẩn Thái Bình Dương (PST).
  - Có hai phát hiện mới mức Thấp, cả hai chỉ cần sửa style hoặc helper của test, không đổi hành vi:
    - WP2-B3-01: vẫn còn các giá trị chữ viết cứng do WP2 đưa vào (`font-weight: 600` ×8 và `letter-spacing: -0.01em` ×4).
    - WP2-B3-02: oracle test mới ghi rằng giờ lặp do DST sẽ ném lỗi, nhưng thực tế nó lặng lẽ trả về một instant.
- Phạm vi thật đã xem/chạy:
  1. Diff source f79413b..a3d1b65 ngoài handoff/ (8 file): styles.css, admin.ts, calendars.ts, hai file mới tests/client/zoneOracle.ts và zoneOracle.test.ts, day-editor.spec.ts, isolation.test.ts (chú thích) và payroll-exceptions.test.ts. Tôi đối chiếu chúng với R-07, quy tắc 5, 7 và 8 của AGENTS, và pre-flight UI của AGENTS.
  2. WP2-B2-01, kiểm bằng bốn cách:
     - Import: zoneOracle.ts không import gì, kể cả code sản phẩm.
     - Đối chiếu không dùng Intl: một phép tính riêng bằng số học thuần (quy tắc DST của Mỹ, không Intl) khớp oracle cho mọi ngày từ 2026 đến 2028. Tức là 0 lệch trong 2192 lần chuyển đổi, với cả `Asia/Ho_Chi_Minh` và bí danh `Asia/Saigon` của Edge.
     - Unit test: test bao ngày mùa hè, ngày mùa đông, cả hai ngày đổi giờ DST và mọi ngày của năm 2026.
     - Chạy spec e2e đã commit, không sửa gì, dưới đồng hồ server mùa đông. Một preload chỉ dành cho test dời đồng hồ của riêng `dist/server/index.js` và `cli.js`. Spec chọn 2026-11-02 và 2027-01-13 (PST), và test R-07 đạt trên cả hai project. Chạy giống hệt với spec cũ ở f79413b thì hỏng trên cả hai project (kỳ vọng "2026-11-02 08:00", nhận "07:00"). Điều này cho thấy đồng hồ đã dời thật sự đưa test vào mùa đông.
  3. WP2-B2-02 và WP2-B-02, bằng phép so riêng của tôi trên màn hình thật. Cùng các bước Playwright và cùng dữ liệu tổng hợp được chạy ở f79413b và ở a3d1b65:
     - Màn hình: đăng nhập, timesheet (lưới và danh sách ngày), hộp thoại sửa hàng loạt, day editor với form phiên và các dòng nghỉ, OT có một dòng nghỉ, lịch sử, cài đặt, hộp thoại Clock out và admin. Mỗi màn hình được chụp trên desktop và mobile sau 1,2 giây chờ ổn định.
     - Ghi lại: các selector mục tiêu đã chuyển sang token, cùng đường dẫn DOM, khung bao và 33 thuộc tính computed của mọi phần tử hiển thị.
     - Kiểm độ nhạy: một lần chạy với token đột biến (chỉ sửa CSS trong dist, đã khôi phục sau đó) chứng minh probe phát hiện được thay đổi.
     - Một lần quét tĩnh stylesheet liệt kê mọi giá trị viết cứng còn lại, đối chiếu với stylesheet WP1 (f32978f) và git blame.
  4. WP2-B-01 được kiểm lại với một múi giờ trình duyệt mà các spec đã commit không dùng (Europe/Berlin, có DST). Instant kỳ vọng lấy từ helper Intl riêng của tôi (dựa trên longOffset, tách khỏi cả sản phẩm lẫn zoneOracle.ts). Đã kiểm:
     - múi giờ nhập mặc định;
     - các instant được lưu, kể cả giờ nghỉ;
     - giờ về dự kiến hiện theo múi giờ hiển thị và có nhãn "derived";
     - đổi múi giờ của một phiên đã lưu từ Berlin sang London: giờ đồng hồ và giờ nghỉ được đọc lại, ngày kế toán và số phiên giữ nguyên, không có request ghi nào trước khi bấm Save;
     - hỏi lại DST sau khi đổi múi giờ: giờ lặp (Berlin sang Sydney, chọn instant muộn hơn) và giờ không tồn tại (London sang Los Angeles, dùng giờ hợp lệ đầu tiên); trong lúc hỏi không có gì được lưu.
  5. Màn hình ngoại lệ ngày lương của admin (WP2-A2-02, phía UI):
     - Lý do để trống hoặc chỉ có khoảng trắng thì nút vẫn bị khóa, và server trả 422.
     - Thành công trả 201, với body chỉ có đúng khóa `["payroll_exception"]`.
     - Một kỳ đã có timesheet chốt (đặt trực tiếp trong database tạm, như các integration test làm) trả 409 `period_finalized`. Lời từ chối hiện trong một đoạn `role="alert"`, và không có gì được ghi.
  6. Hồi quy: chạy đủ verify và e2e; chạy vitest verbose có chọn lọc cho các regression của FIXB2, FIXB và FIXA; chạy lại gate F1 có ảnh chụp. Tôi đã mở và xem trực tiếp 13 ảnh chụp: day editor với mặc định múi giờ hiển thị, đổi múi giờ (bản đã commit và bản probe), hỏi lại giờ không tồn tại, ngày lương admin (bản đã commit và bản probe kỳ đã chốt), thiếu số dư, và các ảnh chụp day editor, timesheet, OT, Clock out và admin ở commit được kiểm.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả trong `handoff/delivery/evidence/WP2-AUDIT-B3/`, đã che, LF; Node v24.21.0 portable gọi bằng đường dẫn đầy đủ; kênh Edge; không tải trình duyệt; TEMP/TMP, các bản clone và output e2e nằm trong thư mục làm việc riêng của auditor trên ổ C:; danh sách đầy đủ ở `00-commands.txt`):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (trước; dự án, clone, clone gốc) | HEAD a3d1b65 = origin/main; 5b370621…8581 (613 file) theo ba cách; clone gốc 4c2bd7ef…3528; exit 0 | `digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, clone gốc) | mỗi bản 144 gói; exit 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint (`no-deprecated`), 32 file / 611 test, build, SMOKE PASSED; 0 dòng deprecation; exit 0 | `verify.txt` |
| cùng NODE_OPTIONS, `npm run test:e2e` (clone; desktop và mobile) | 74 đạt, 2 bỏ qua (test chỉ cho mobile, trên desktop); exit 0 | `e2e.txt` |
| `vitest run zoneOracle.test.ts payroll-exceptions.test.ts sessionModel.test.ts --reporter=verbose` | 3 file, 51 test đạt, gồm bốn test oracle, test vi sai WP2-A2-02, `input zone choices` và các test đổi múi giờ; exit 0 | `vitest-targeted.txt` |
| `node oracle-check.mjs <clone>` | 0 lệch so với số học không Intl trong 2026–2028; kỳ vọng 08:00 cũ sai trên 382 ngày PST; giờ không tồn tại thì ném lỗi; 3 giờ lặp trả về một instant; exit 0 | `oracle-check.txt`, `oracle-check.mjs.txt` |
| `AUDIT_FAKE_NOW=2026-11-03T20:00:00Z` và `2027-01-14T20:00:00Z`, preload `fake-clock.mjs`, `playwright test zz-audit-b3-date day-editor.spec.ts -g "R-07\|audit-b3"` (spec đã commit, không sửa) | chọn 2026-11-02 / 2027-01-13; mỗi lần 4 đạt; exit 0 / 0 | `winter-run.txt`, `fake-clock.mjs.txt`, `zz-audit-b3-date.spec.ts.txt` |
| giống vậy trên f79413b (sau `npm run build`, exit 0): đồng hồ thật, rồi giả 2026-11-03 | đồng hồ thật 4 đạt, exit 0; mùa đông: R-07 hỏng trên cả hai project (kỳ vọng 08:00, nhận 07:00), exit 1, đúng là đối chứng âm mong đợi | `winter-control.txt`, `base-build.txt` |
| `node literal-scan.mjs <clone>` | 72 khai báo có giá trị viết cứng, 30 khai báo có giá trị không có trong WP1 (liệt kê ở WP2-B3-01 và rủi ro 1); exit 0 | `literal-scan.txt`, `literal-scan.mjs.txt` |
| `playwright test zz-audit-b3-style` ở a3d1b65 và ở f79413b; `node compare.mjs` | mỗi lần 4 đạt (exit 0 / 0); 18 màn hình, 4690 phần tử, 159.460 giá trị được so, **0 khác biệt**; có liệt kê giá trị mục tiêu | `style-runs.txt`, `style-compare.txt`, `zz-audit-b3-style.spec.ts.txt`, `compare.mjs.txt` |
| đột biến: CSS trong dist đặt `--shape-size` .75rem và `--font-size-base` 1.02rem, chụp, khôi phục | 4 đạt, exit 0; 1817 dòng khác trên 12 màn hình dùng các token đó; hash CSS đã khôi phục | `style-mutant.txt` |
| `playwright test zz-audit-b3-zone zz-audit-b3-payroll zz-audit-b3-f1` | 8 đạt; exit 0 | `probes-run1.txt`, `audit-b3-*.json`, `audit-b3-*-synthetic.png`, ba file `.spec.ts.txt` |
| bỏ các spec probe; digest sau (clone, clone gốc, dự án) | clone và clone gốc sạch; dự án HEAD a3d1b65, 5b370621…8581 theo hai cách, không có gì ngoài handoff/; exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` trong bản clone scratch, với output của lần audit này được stage ở đó (index của dự án không bị đụng); Python của workflow chạy `validate_package.py --preflight` (clone, rồi thư mục dự án) | quyền riêng tư PASS, 50 file, 0 phát hiện; preflight PASS (55 cặp / 924 liên kết; dự án 56 / 931); exit 0 / 0 / 0 | `preflight-privacy.txt` |

  Ngoài đối chứng âm có chủ ý, có một lần chạy hỏng. Phiên bản đầu của preload có một dấu gạch ngược bị shell làm hỏng, và Node báo SyntaxError trước khi bất kỳ test nào chạy (exit 1 cho cả hai ngày mùa đông, không có gì được thực thi). Tôi viết lại preload và chạy lại. Lần chạy lại đã ghi đè log đó, nên kết quả này lấy từ transcript của phiên. Các spec probe chỉ tồn tại trong các bản clone và đã được bỏ trước khi đo digest sau. Log được che bằng `export.mjs.txt`. Các bản clone, database tạm và output e2e đã bị xóa, và không còn tiến trình nào chạy.

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:

  **WP2-B3-01 — Thấp — vẫn còn các giá trị chữ viết cứng do WP2 đưa vào stylesheet.**
  - File: `src/client/styles.css` ở a3d1b65:
    - `font-weight: 600` ở các dòng 142 (`.shell-brand`), 170 (`.nav-link[aria-current='page']`), 377 (`th`), 516 (`.week-tag`), 588 (`.batch-count`), 763 (`.breaks legend`), 810 (`.time-problem legend`) và 860 (`.ot-balances dd`);
    - `letter-spacing: -0.01em` ở các dòng 143 (`.shell-brand`), 194 (`h1`), 842 (`.ot-screen h2`) và 861 (`.ot-balances dd`).
    - Chúng được thêm bởi WP2-T09A (717db3e), T09B (9c36a7e), T10 (26fa7c9) và T11 (55d3bb8).
  - Tái hiện: `literal-scan.txt`. Cả hai giá trị đều không có trong stylesheet WP1 (f32978f), vốn không có khai báo `font-weight` hay `letter-spacing` nào, và `:root` không có token cho giá trị nào trong hai. Hai lần audit trước đều không liệt kê chúng.
  - Kỳ vọng/thực tế: bước 1 của mục "Unified Frontend & UI/UX Standards" trong AGENTS yêu cầu khớp độ đậm chữ hiện có và "introduce new values only as CSS custom properties". Các vòng WP2-B-02 và WP2-B2-02 đã chuyển các kích thước viết cứng sang token, nhưng hai giá trị chữ này vẫn được viết cứng mười hai lần.
  - Quy tắc: pre-flight UI của AGENTS (tiêu chuẩn hình ảnh E-8).
  - Sửa có phạm vi:
    - Thêm vào `:root`, ví dụ `--font-weight-strong: 600` và `--letter-spacing-tight: -0.01em`, rồi dùng chúng trong 12 khai báo đó, không đổi gì về hình ảnh.
    - Kiểm lại: so trên màn hình thật với a3d1b65 (có thể dùng nguyên `zz-audit-b3-style.spec.ts.txt` và `compare.mjs.txt` của lần audit này), `npm run verify` và bộ e2e.

  **WP2-B3-02 — Thấp — oracle của test hứa ném lỗi với giờ lặp do DST nhưng lại trả về một instant.**
  - File/hàm: `tests/client/zoneOracle.ts:19-27`, hàm `instantOfWallTime`. Chú thích ở dòng 20-21 ghi "Only for unambiguous wall times: a DST fold or gap throws" (chỉ dùng cho giờ đồng hồ không mơ hồ: giờ lặp hay giờ không tồn tại đều ném lỗi).
  - Tái hiện (`oracle-check.txt`): giờ không tồn tại 2026-03-08 02:30 ở Los Angeles ném lỗi, đúng như mô tả. Nhưng ba giờ lặp trả về một instant mà không báo lỗi:
    - 2026-11-01 01:30 ở Los Angeles cho 08:30Z, instant sớm hơn;
    - 2026-04-05 02:30 ở Sydney cho 16:30Z, instant muộn hơn;
    - 2026-10-25 02:30 ở Berlin cho 01:30Z, instant muộn hơn.
    - Unit test chỉ kiểm giờ không tồn tại ("refuses a DST gap", zoneOracle.test.ts:42-46).
  - Kỳ vọng/thực tế: oracle là nguồn kỳ vọng độc lập dùng để đóng WP2-B2-01. Một test sau này gõ một giờ lặp sẽ lặng lẽ nhận một lựa chọn phụ thuộc múi giờ thay cho lời từ chối đã ghi. Đó chính là loại phụ thuộc thời gian ẩn mà bản sửa vừa loại bỏ. Hiện không test nào bị ảnh hưởng: e2e R-07 dùng một múi giờ không có DST (`Asia/Saigon`), và unit test không dùng giờ lặp nào.
  - Quy tắc: quy tắc 5 của AGENTS (bằng chứng test phải đúng như điều nó tuyên bố); quy tắc 7 của AGENTS và R-07 ("require explicit offset/fold for ambiguous times").
  - Sửa có phạm vi (chỉ test):
    - Cho `instantOfWallTime` ném lỗi khi giờ đồng hồ ứng với hai instant, ví dụ bằng cách thử thêm các ứng viên theo độ lệch giờ của một ngày trước và một ngày sau. Hoặc ghi đúng hành vi thật trong chú thích.
    - Thêm một trường hợp giờ lặp vào `zoneOracle.test.ts`.
    - Kiểm lại: unit test và e2e R-07 trên cả hai project.

- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  1. Các giá trị viết cứng còn lại của WP2 mà tôi đánh giá là chấp nhận được, theo `literal-scan.txt`:
     - cấu trúc bố cục: phân số lưới (`1fr`, `repeat(n, 1fr)`), `order: -1`, `100%`, `flex: 1`;
     - hình học của dấu trạng thái: `border-radius: 50%`, `polygon(…)` của tam giác, `rotate(45deg) scale(0.85)`, và `clip-path: inset(50%)` của `.sr-only`;
     - các đường mảnh 1–2 px và breakpoint 767/768 px, đã được chấp nhận ở lần 1;
     - các giá trị đã có từ WP1: 14px, 6px, 15px, 1.45, 1.4rem và 0.6.
     - `scale(0.85)` nằm ở ranh giới. Một token tùy chọn `--shape-diamond-scale` sẽ xóa mọi nghi ngờ.
  2. `legacyPdtWallTime` trong `tests/client/zoneOracle.ts:8-12` là một helper được export và cố ý sai, giữ lại chỉ để unit test minh họa lỗi cũ. Tùy chọn: đưa thẳng vào trong test.
  3. Trên mobile, radio đầu tiên của nhóm giờ nghỉ ("Breaks not confirmed yet") có kích thước computed 17,19 × 18,75 px thay vì 18,75 × 18,75 px trong day editor và hộp thoại Clock out: nó bị co lại trong hàng flex. Hiện tượng này cũng có ở f79413b, nên đây là một tồn đọng thẩm mỹ từ WP2-T10, không phải hồi quy. Tùy chọn: thêm `flex: none` cho input checkbox và radio.
  4. Chưa có test đã commit nào ghim giá trị computed của các token. Phép so của lần audit này đã phủ chúng, và probe có thể được commit làm kiểm tra hồi quy hình ảnh.
  5. Lần chạy mùa đông chỉ dời đồng hồ server; đồng hồ trình duyệt vẫn là thật. Test R-07 lấy ngày từ API và test đã đạt, nên điều này không hạn chế kết quả.
  6. Các rủi ro của lần 1 và lần 2 không nhắc lại ở đây thì chưa được đánh giá lại.
- Gate chưa chạy/bị chặn và lý do: không có gate nào của vùng B bị chặn.
  - Không chạy theo thiết kế: chốt kỳ, bản sửa đổi, PDF và email của WP3; Linux và NAS; các kênh Chrome/Chromium (chỉ Edge).
  - Vùng A (WP2-AUDIT-A2) chịu trách nhiệm đánh giá ledger, đồng thời và quyền riêng tư của response ngày lương (WP2-A2-01/02). Toàn bộ bộ test đã đạt bên trong `npm run verify`.
- Xử lý phát hiện trước:
  - WP2-B2-01 (Trung bình): **đã sửa, đã xác minh.**
    - Oracle độc lập: nó không import code sản phẩm nào và khớp với một phép tính không dùng Intl.
    - Unit test phủ cả hai mùa và các ngày đổi giờ DST.
    - Spec đã commit đạt với ngày server PST (2026-11-02, 2027-01-13), trong khi spec cũ hỏng ở đó.
  - WP2-B2-02 (Thấp): **đã sửa cho sáu khai báo đã liệt kê (8 dòng), đã xác minh.**
    - Bốn token (`--control-check-size`, `--shape-size`, `--dialog-max-height`, `--font-size-base`) cho giá trị computed giống hệt trên màn hình thật so với f79413b. Ví dụ: checkbox và radio 18,75 px, dấu trạng thái 10,5 px, max-height của hộp thoại 720 px trên desktop và 759,6 px trên mobile, ba h3 đều 15 px.
    - Các giá trị chữ viết cứng còn lại được chuyển thành WP2-B3-01.
  - WP2-B-01 (Trung bình): **vẫn giữ được** (probe Berlin và e2e đã commit): mặc định theo múi giờ hiển thị, instant được lưu, giờ về dự kiến có nhãn derived, đọc lại khi đổi múi giờ kể cả giờ nghỉ, và hỏi lại với giờ lặp và giờ không tồn tại.
  - WP2-B-02 (Thấp): **vẫn giữ được**. Mười token trước không đổi, và mọi giá trị computed giống hệt f79413b.
  - WP2-A2-02 (vùng A, phía UI): **đã xác minh**.
    - Lý do là bắt buộc, ở UI và ở server (422).
    - Body khi thành công chỉ có `payroll_exception`.
    - Kỳ đã chốt nhận 409 `period_finalized`, hiện bằng lời, và không có gì được ghi.
    - PayrollExceptions.tsx và api.ts chưa bao giờ dùng `refreshed_pay_period`. Kết luận về quyền riêng tư thuộc về WP2-AUDIT-A2.
  - WP2-A2-01 (vùng A): các thay đổi chỉ ở chú thích đã có mặt (đầu file admin.ts, isolation.test.ts:280), và do vùng A đánh giá.
  - WP2-GATE F1: **vẫn đóng**.
    - E2e thiếu số dư đã commit đạt trên cả hai project.
    - Lần chạy lại của tôi cho thấy thông báo "Not enough available OT balance. 1h 00m available, 1h 01m needed. Nothing was reserved." (`role="alert"`), bảng tóm tắt và số yêu cầu nghỉ không đổi, và có ảnh chụp `audit-b3-insufficient-balance-*-synthetic.png`.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:
  - Sẵn sàng phần mềm của WP2: chưa nghiệm thu. Vùng B là FIX REQUIRED (WP2-B3-01 và WP2-B3-02, đều mức Thấp); WP2-AUDIT-A2 báo cáo riêng.
  - Phép của chủ: không yêu cầu; không triển khai gì, không gửi email.
  - Kết quả pilot: chưa có (WP5).
- Một bước/prompt tiếp: coordinator giao một task sửa có phạm vi với `addresses_audit: WP2-AUDIT-B3` qua [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), gồm WP2-B3-01 (token trong styles.css, giá trị computed không đổi) và WP2-B3-02 (oracle từ chối giờ lặp hoặc sửa chú thích, kèm một trường hợp unit test). Tiếp theo là freeze, một gate WP2 mới và kiểm lại vùng B trên digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm:
  - Review: WP2-AUDIT-B3 lần 1. Agent ID của reviewer trên board là `a4a12ead83ae7b867`, theo board ghi; ID này không thấy được từ bên trong phiên.
  - Tác giả vòng hai trên board: WP2-FIXB2 `a908ddae97aaffe5a`, freeze/commit WP2-FIXB2-FREEZE `ab84d5b84b7b03680`, gate WP2-GATE3 `a412e4ac65755cb7c`.
  - Vòng sửa trước và các tác giả WP2 được liệt kê trong [WP2_RECHECK_B](WP2_RECHECK_B.vi.md) và [WP2_REVIEW_B](WP2_REVIEW_B.vi.md).
- Context mới; xác nhận reviewer không viết thay đổi:
  - Context mới. Reviewer này không viết gì trong WP2 và không đổi source.
  - Chỉ ghi report này, bản dịch, phần kết quả trong brief và `evidence/WP2-AUDIT-B3/`.
  - Các spec probe chỉ tồn tại trong các bản clone scratch và đã được bỏ trước khi đo digest sau. Phần sửa đột biến chỉ chạm vào output build `dist/` (bị git bỏ qua) của bản clone và đã được khôi phục.
- Digest trước/sau; bằng chứng gate snapshot đó: `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` trước và sau. Giá trị này trùng digest của WP2-GATE3 (`evidence/WP2-GATE3/digest-*.txt`) cho cùng commit a3d1b65.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP2_RECHECK_B3.md` và `.vi.md` (mới). [WP2_REVIEW_B](WP2_REVIEW_B.vi.md), [WP2_RECHECK_B](WP2_RECHECK_B.vi.md) và bằng chứng của chúng giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator:
  - WP2-B2-01 và WP2-B2-02: đóng vì đã xác minh. WP2-B-01, WP2-B-02 và F1 vẫn giữ được.
  - Còn mở: WP2-B3-01 (Thấp) và WP2-B3-02 (Thấp). Cả hai vừa trong một task style và helper test có phạm vi, không đổi server hay hành vi.
  - Sau đó là freeze, một gate WP2 mới và kiểm lại WP2-AUDIT-B trên digest mới, giữ nguyên report này.
