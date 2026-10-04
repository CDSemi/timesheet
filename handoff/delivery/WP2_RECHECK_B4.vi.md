# Review độc lập

Bản gốc tiếng Anh: [WP2_RECHECK_B4.md](WP2_RECHECK_B4.md).

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP2, lần kiểm lại cuối của vùng B (workspace, admin, UI và tích hợp) sau vòng sửa thứ ba; 2026-10-04 (UTC); task WP2-AUDIT-B4 lần 1 (board ghi kind `audit`, profile timesheet-auditor). Model tự báo `claude-opus-5-5`; board yêu cầu effort xhigh, còn effort thực tế không quan sát được. Model tác giả mạnh nhất trong snapshot là opus (`claude-opus-5-5`, WP2-T02 và WP2-T03, theo board). Tác giả bản sửa vòng ba WP2-FIXB3, committer WP2-FIXB3-FREEZE và verifier WP2-GATE4 chạy sonnet (`claude-sonnet-5-5`). Vì vậy model của reviewer không yếu hơn. WP2-AUDIT-A2 (lần 3) chạy cùng lúc trong bản clone riêng, không dùng chung file nào.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  - Commit được kiểm: `5fafeaee72509c6110a907458643bf7582dad81a`. Đây là `freeze_commit` của WP2-GATE4, trùng origin/main.
  - Source digest: `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` (613 file, không gồm handoff/). Giá trị này giống nhau trước (11:58Z) và sau (12:21Z), ở thư mục dự án và trong bản clone scratch. Nó trùng phép đối chiếu `git ls-tree` và digest của gate.
  - HEAD của dự án là commit được kiểm cả trước lẫn sau, và không có gì thay đổi ngoài handoff/.
  - Source đủ: mọi lệnh chạy trong một bản git clone của commit đó trên ổ C: (ngoài Dropbox). Một bản clone thứ hai ở a3d1b65 chỉ dùng để so computed style và làm đối chứng cho oracle. Cả hai bản clone đã bị xóa sau khi xong.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.**
  - WP2-B3-01 đã sửa cho toàn bộ lớp literal: không còn literal thô nào trong các khai báo, dù do WP2 đưa vào hay không.
  - Computed style giống hệt a3d1b65 trên 91 trạng thái màn hình thật (mọi điểm chụp màn hình đã commit, cộng 20 trạng thái tương tác và media cho mỗi project). Một phép đối chứng đột biến (mutant) cho thấy probe phát hiện được thay đổi.
  - WP2-B3-02 đã sửa: oracle ném lỗi cho fold và gap đúng như tài liệu, unit test có cả hai trường hợp, và oracle không import gì.
  - Không có hồi quy vùng B. `npm run verify` và `npm run test:e2e` (cả hai project) đều đạt. B-01, B-02, B2-01, B2-02, màn hình ngoại lệ ngày lương và F1 vẫn đúng.
  - Không có phát hiện. Các đề xuất tùy chọn bên dưới không phải lỗi.
- Phạm vi thật đã xem/chạy:
  1. Diff a3d1b65..5fafeae. Ngoài handoff/, diff chạm đúng ba file: `src/client/styles.css`, `tests/client/zoneOracle.ts` và `tests/client/zoneOracle.test.ts`. JavaScript client đã build của hai commit giống nhau từng byte, trừ tên file source map, nên chỉ CSS khác nhau.
  2. WP2-B3-01, bằng scanner của riêng tôi (`literal-scan-b4.mjs.txt`, viết cho lần audit này, không dựa trên script kiểm kê của WP2-FIXB3):
     - Scanner phân tích mọi rule, kể cả các khối `@media` lồng nhau. Trong mỗi khai báo không phải định nghĩa custom property, nó bỏ các tham chiếu `var(--x)` rồi liệt kê số có hoặc không có đơn vị, màu hex, hàm màu và tên màu. Phần loại trừ theo brief: `0` trần, `1` không đơn vị, `100%`, từ khóa. Nó cũng báo fallback của `var()`, phần đầu at-rule, token chưa định nghĩa và token không dùng.
     - Kết quả ở 5fafeae: 431 khai báo, 0 khai báo có literal, 0 lần xuất hiện, 0 do WP2 đưa vào; 0 fallback `var()`; mọi token được tham chiếu đều đã định nghĩa.
     - Độ nhạy: cùng scanner chạy trên a3d1b65 tìm thấy 60 khai báo / 67 lần xuất hiện / 37 không có trong WP1. Con số này tái hiện đúng bản kiểm kê "trước" của WP2-FIXB3 và gồm cả mười hai dòng của WP2-B3-01.
     - Phần vẫn để literal: sáu phần đầu `@media`. Hai phần không có số, bốn phần chứa breakpoint 767/768 px; điều này đã ghi trong phần đầu stylesheet, vì custom property không điều khiển được media query. Các định nghĩa token (69, trong đó 21 token mới trong bản sửa này) mang giá trị theo thiết kế.
     - Tương đương tĩnh (`resolve-equiv.mjs.txt`): thay mọi `var()` bằng giá trị trong `:root` ở ngữ cảnh sáng, tối và giảm chuyển động thì cho đúng 431 khai báo như a3d1b65, tức 1293 giá trị đã thay với 0 khác biệt. Một bản sao đột biến cho 24 khác biệt.
  3. Computed style trên màn hình thật, bằng probe của riêng tôi (`audit-b4-capture.ts.txt`, `zz-audit-b4-states.spec.ts.txt`, `instrumented-copy.txt`):
     - Bộ e2e đã commit chạy nguyên vẹn, chỉ có các lệnh chụp màn hình được bọc trong một bản sao scratch. Mỗi điểm `page.screenshot` đã commit (26 màn hình có tên cho mỗi project) trở thành một điểm ghi: login, timesheet và timesheet view, các ngày sắp tới, xung đột và lý do khi sửa hàng loạt, day editor ở mười trạng thái (break, mặc định theo display zone, DST fold, DST gap, đổi zone, qua đêm, nghỉ một phần, lệch OT, hỏi lý do, vừa màn hình mobile), hộp thoại Clock out, OT sau khi dùng, history, xem trước settings, lỗi và xem trước nhập ngày lễ, tài khoản và ngày lương ở admin, và cả hai màn hình cách ly.
     - Một probe spec thêm 20 trạng thái cho mỗi project: vòng focus bàn phím, nút khi hover và khi nhấn (`:active`), hover thanh điều hướng và hàng, thanh sửa hàng loạt khi có và không có lựa chọn (nút bị vô hiệu), cả năm hình trạng thái (tam giác lỗi được chèn vào, vì chỉ lỗi tính toán mới hiện nó), chế độ màu tối trên timesheet, day editor, OT, history, settings và admin, giảm chuyển động, hover link xuất của OT, và nút ngoại lệ ngày lương bị vô hiệu.
     - Mỗi lần ghi chờ 1,2 giây rồi ghi mọi phần tử nhìn thấy được (cộng `::backdrop` của dialog): đường dẫn DOM, hộp bao, chữ của chính phần tử và 80 computed property. Cùng bộ test chạy ở a3d1b65 và ở 5fafeae: mỗi lần 78 đạt, 2 bỏ qua.
     - Kết quả (`style-compare.txt`): 91 trạng thái màn hình, 26.377 phần tử, 2.162.914 giá trị, **0 khác biệt style**, 0 khác biệt cấu trúc. Cả 48 khác biệt hình học đều ở các thẻ tài khoản admin có thứ tự và tên đổi giữa hai lần chạy (bề rộng h3 và badge bên cạnh). 314 khác biệt nội dung là giờ chấm công, UUID sinh ra và địa chỉ e-mail tổng hợp sinh ra.
     - Đối chứng đột biến (`style-compare-mutant.txt`): sửa năm token trong CSS đã build (`--space-row`, `--press-offset`, `--opacity-disabled`, `--order-first`, `--letter-spacing-tight`). Phép so khi đó báo 10.978 khác biệt style (padding 10.404, letter-spacing 350, opacity 193, order 25, transform khi nhấn 2). CSS đã được khôi phục về sha256 có tiền tố 957a13dd28eb9741.
     - Các giá trị computed riêng biệt của những thuộc tính đã token hóa (font-weight 600, bốn giá trị letter-spacing, các line-height, thời lượng 0,3 s và 1e-05 s khi giảm chuyển động, opacity 0,6, transform của hình thoi và khi nhấn, clip-path của tam giác và `.sr-only`, order −1, bán kính 4 px và 50 %) giống hệt nhau ở cả hai commit (`target-values.txt`).
  4. WP2-B3-02 (`oracle-check-b4.mjs.txt`):
     - Độc lập: `tests/client/zoneOracle.ts` có 0 câu import, 0 import động hay require, và không tham chiếu `src/`.
     - So với một tham chiếu vét cạn dựng bằng thuật toán khác (quét từng giờ để tìm điểm chuyển, rồi lập bảng chữ giờ tường cho mọi phút UTC trong ±72 giờ). Mười zone (Los Angeles, New York, Berlin, London, Sydney, Lord Howe với bước dịch 30 phút, Auckland, Santiago, Ho Chi Minh, Saigon), 32 điểm chuyển trong 2026–2027, 135.360 phút của các ngày chuyển giờ: mọi phút gap (900) ném "(DST gap)", mọi phút fold (900) ném "(DST fold)", mọi phút khác trả về đúng một instant. 4.200 mẫu ngày thường và 496 trường hợp tính tay không dùng Intl theo quy tắc Mỹ/EU, gồm cả các phút biên: 0 sai lệch.
     - Ba fold tái hiện của B3 nay ném "(DST fold)".
     - Đối chứng: cùng checker trên oracle ở a3d1b65 báo 2.280 sai lệch. Ở đó fold trả về một instant (lỗi B3), và thông báo gap không nêu loại.
     - Unit test đạt (6 test). Chúng có năm trường hợp fold (LA, Sydney, Berlin, kể cả phút lặp đầu tiên và cuối cùng), ba trường hợp gap và các phút liền kề.
     - Chú thích ở zoneOracle.ts:19-25 nay nói đúng hành vi thật.
  5. Không hồi quy:
     - `npm run verify`: 32 file / 613 test, lint (`no-deprecated`), build và smoke; 0 dòng deprecation.
     - `npm run test:e2e`: 74 đạt, 2 bỏ qua (test chỉ dành cho mobile, trên desktop).
     - Vitest có chủ đích: zoneOracle, payroll-exceptions và sessionModel, 53 test đạt.
     - Kiểm lại WP2-B2-01 trên code oracle mới: kiểm theo mùa không dùng Intl cho 2026–2028, 8.768 phép chuyển, 0 sai lệch. E2e R-07 đã commit đạt trên cả hai project, với đồng hồ server thật và với đồng hồ server dời sang ngày mùa đông (chọn 2026-11-02 và 2027-01-13, PST).
     - Tôi đã mở và xem các ảnh chụp: timesheet với mọi hình trạng thái, hỏi lại DST fold trên mobile, OT ở chế độ tối, vòng focus ở login, admin với nút ngày lương bị vô hiệu trên mobile, và day editor ở chế độ tối trên mobile. Không thấy gì sai.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả trong `handoff/delivery/evidence/WP2-AUDIT-B4/`, đã che, LF; Node v24.21.0 bản portable, gọi bằng đường dẫn đầy đủ; kênh Edge; không tải trình duyệt; TEMP/TMP, các clone và đầu ra e2e nằm trong thư mục làm việc riêng của auditor trên ổ C:; danh sách đầy đủ trong `00-commands.txt`):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (trước; dự án, clone, clone gốc) | HEAD 5fafeae = origin/main; e61fa914…14df (613 file) theo ba cách; gốc 5b370621…8581; exit 0 | `digest-before.txt` |
| `git diff --name-status a3d1b65 5fafeae` | ngoài handoff/: chỉ styles.css, zoneOracle.ts, zoneOracle.test.ts | `diff-scope.txt`, `diff-scope-src.txt` |
| `npm ci --no-audit --no-fund` (clone, clone gốc) | mỗi bên 144 gói; exit 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint, 32 file / 613 test, build, SMOKE PASSED; 0 dòng deprecation; exit 0 | `verify.txt` |
| cùng NODE_OPTIONS, `npm run test:e2e` (clone; desktop và mobile) | 74 đạt, 2 bỏ qua; exit 0 | `e2e.txt` |
| `node literal-scan-b4.mjs` (5fafeae, rồi đối chứng a3d1b65) | 0 / 0 / 0 ở 5fafeae; đối chứng 60 / 67 / 37; exit 0 / 0 | `literal-scan-5fafeae.txt`, `literal-scan-a3d1b65-control.txt` |
| `node resolve-equiv.mjs` a3d1b65 với 5fafeae (và bản sao đột biến) | 1293 giá trị đã thay, 0 khác biệt; đột biến 24; exit 0 | `static-equivalence.txt` |
| bộ test có gắn probe, `AUDIT_B4_LABEL=base` (a3d1b65) và `=reviewed` (5fafeae) | mỗi lần 78 đạt, 2 bỏ qua; exit 0 / 0 | `style-runs.txt` |
| `node compare-b4.mjs` base với reviewed | 91 màn hình, 26.377 phần tử, 2.162.914 giá trị; style 0, cấu trúc 0; hình học 48 / nội dung 314, do nội dung | `style-compare.txt`, `target-values.txt` |
| đột biến: 5 token trong CSS đã build, chạy lại, khôi phục | 78 đạt, exit 0; 10.978 khác biệt style; hash CSS đã khôi phục | `style-compare-mutant.txt`, `style-runs.txt` |
| `node oracle-check-b4.mjs` (5fafeae, rồi đối chứng a3d1b65) | 0 sai lệch (900 gap, 900 fold, 496 trường hợp không Intl); đối chứng 2.280 sai lệch; exit 0 / 0 | `oracle-check-b4.txt`, `oracle-check-b4-control-a3d1b65.txt` |
| `node season-check.mjs` | 8.768 phép chuyển, 0 sai lệch, 382 ngày PST; exit 0 | `season-check.txt` |
| `vitest run zoneOracle.test.ts --reporter=verbose`; cùng payroll-exceptions và sessionModel | 6 đạt; 3 file / 53 đạt; exit 0 / 0 | `vitest-zoneoracle.txt`, `vitest-targeted.txt` |
| đồng hồ server thật / 2026-11-03 / 2027-01-14 (preload `winter-clock.mjs`), `playwright test zz-audit-b4-date day-editor.spec.ts -g "R-07\|zz-audit-b4"` | chọn 2026-10-02 / 2026-11-02 / 2027-01-13; mỗi lần 4 đạt; exit 0 ×3 | `winter-run.txt` |
| xóa file probe; digest sau (clone, clone gốc, dự án) | các clone sạch; HEAD dự án 5fafeae, e61fa914…14df theo hai cách, không có gì ngoài handoff/; exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` (clone scratch, đầu ra của lần audit này được stage ở đó); Python workflow `validate_package.py --preflight` | xem `preflight-privacy.txt` | `preflight-privacy.txt` |

  Hai lần chạy thất bại do công cụ của chính tôi, không lần nào do sản phẩm:
  - Lần kiểm oracle đầu tiên báo 2 sai lệch. Giá trị kỳ vọng là của tôi và bị sai: lúc 01:59 ở Berlin trong ngày fold vẫn là CEST. Tham chiếu vét cạn khớp với oracle. Tôi sửa checker rồi chạy lại (`oracle-check-b4-run1-auditor-expectation-error.txt`).
  - Preload mùa đông đầu tiên mất một dấu gạch ngược trong heredoc của shell. Node báo SyntaxError trước khi test nào chạy, exit 1 cho cả hai ngày mùa đông (`winter-run-attempt1-preload-syntax.txt`). Tôi viết lại bằng công cụ ghi file rồi chạy lại.

  Các file probe chỉ có trong các clone và đã bị xóa trước digest sau. Bản sửa đột biến chỉ chạm CSS trong `dist/` (bị bỏ qua) của clone và đã được khôi phục. Log đã được che bằng `mask.mjs.txt`.

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:
  - Không có.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  1. `--space-6` (styles.css:47) được định nghĩa nhưng không được tham chiếu. Ở a3d1b65 nó cũng đã không được dùng. Tùy chọn: bỏ hoặc dùng nó.
  2. Một số token có cùng giá trị nhưng mang nghĩa khác nhau (`--space-0` và `--rule` đều 2px; `--hairline` và `--press-offset` đều 1px). Đây không phải trùng lặp: một khoảng cách và một độ dày đường kẻ có thể thay đổi độc lập. Các token cấu trúc `--track`, `--cols-2/3/4` và `--order-first` theo lớp vét cạn của brief. Chúng vô hại, dù chi tiết hơn mức chuẩn UI thật sự cần.
  3. Phần đầu stylesheet (styles.css:4-5) gọi tên "the documented 768px literal". Các query còn dùng giá trị bù của nó, max-width 767px. Tùy chọn: nêu cả hai trong chú thích.
  4. Oracle lấy offset ứng viên từ ±1 ngày. Một zone có hai điểm chuyển trong vòng 48 giờ sẽ lọt qua. Không có zone như vậy trong 2026–2027 hay trong test. Tùy chọn: ghi điều này trong chú thích.
  5. Mang từ B3 và vẫn tùy chọn: `legacyPdtWallTime` vẫn được export cho unit test. Radio đầu tiên trên mobile của nhóm break có kích thước computed 17,19 × 18,75 px, ở cả hai commit, nên không phải hồi quy. Chưa có test đã commit nào ghim giá trị computed style; probe có gắn của lần audit này có thể trở thành một test như vậy.
  6. Lần chạy mùa đông chỉ dời đồng hồ server; đồng hồ trình duyệt vẫn là thật. Test R-07 lấy ngày từ API, nên điều này không giới hạn kết quả.
- Gate chưa chạy/bị chặn và lý do: không có gate nào của vùng B bị chặn.
  - Không chạy theo thiết kế: chốt sổ WP3, bản sửa đổi, PDF và email; Linux và NAS; kênh Chrome/Chromium (chỉ Edge).
  - Vùng A (WP2-AUDIT-A2, lần 3) chịu trách nhiệm đánh giá sổ cái, đồng thời và quyền riêng tư của phản hồi ngày lương. Toàn bộ bộ test đã đạt trong `npm run verify`.
- Xử lý phát hiện trước:
  - WP2-B3-01 (Low): **đã sửa, đã xác minh.**
    - Mười hai khai báo đã liệt kê, và cả 60 khai báo / 67 lần xuất hiện literal của lớp này, nay đều tham chiếu token.
    - Phép quét độc lập của tôi cho thấy còn 0.
    - Computed style giống hệt trên 91 trạng thái màn hình thật, và phép đối chứng đột biến phát hiện được thay đổi.
  - WP2-B3-02 (Low): **đã sửa, đã xác minh.**
    - Fold và gap ném lỗi đúng như tài liệu, 0 sai lệch so với tham chiếu vét cạn trên mười zone.
    - Các unit case fold và gap có mặt và đạt.
    - Oracle không import gì.
  - WP2-B2-01 (Medium): **vẫn đúng.**
    - Kiểm theo mùa: 0 sai lệch trong 2026–2028.
    - E2e R-07 đã commit đạt với ngày server PST trên cả hai project.
  - WP2-B2-02 và WP2-B-02 (Low): **vẫn đúng.** Các token trước không đổi, và mọi giá trị computed giống hệt a3d1b65.
  - WP2-B-01 (Medium): **vẫn đúng.** Các e2e đã commit cho mặc định display zone, R-07, DST fold, đọc lại khi đổi zone, hỏi lại khi fold và DST gap đạt trên cả hai project, và computed style của chúng giống hệt a3d1b65. Không có code sản phẩm nào thay đổi.
  - Màn hình ngoại lệ ngày lương (WP2-A2-02, phía UI): **vẫn đúng.**
    - E2e đã commit đạt trên cả hai project.
    - Probe của tôi xác nhận nút "Record exception" bị vô hiệu khi chưa có lý do, opacity 0,6 ở cả hai commit.
    - Phía server không đổi kể từ a3d1b65. Kết luận về quyền riêng tư thuộc WP2-AUDIT-A2.
  - WP2-GATE F1: **vẫn đóng.** E2e số dư không đủ đã commit đạt trên cả hai project. Các assertion của nó không đổi: thông báo, "Nothing was reserved", số dư khả dụng, và không có yêu cầu hay số dư nào thay đổi.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:
  - Sẵn sàng phần mềm của WP2: vùng B đạt trên digest e61fa914. Nghiệm thu WP2 còn cần WP2-AUDIT-A2, được báo cáo riêng.
  - Phép của chủ sở hữu: chưa xin; chưa triển khai gì, không gửi email.
  - Kết quả pilot: chưa có (WP5).
- Một bước/prompt tiếp: coordinator ghi nhận WP2-AUDIT-B4 = PASS trên 5fafeae / e61fa914. Nếu WP2-AUDIT-A2 (lần 3) cũng đạt trên digest này thì tiếp theo là nghiệm thu WP2 (commit nghiệm thu qua timesheet-committer), rồi lập kế hoạch WP3.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm:
  - Review: WP2-AUDIT-B4 lần 1. Agent ID của reviewer trên board là `a83d7267129f6a949`, theo board ghi; ID này không thấy được từ bên trong phiên.
  - Tác giả vòng ba trên board: WP2-FIXB3 `a33c20fa0f60a68da`, freeze/commit WP2-FIXB3-FREEZE `aadc0ad71deea6050`, gate WP2-GATE4 `a99b6f7545d1ec005`.
  - Các vòng trước và tác giả WP2 được liệt kê trong [WP2_RECHECK_B3](WP2_RECHECK_B3.vi.md), [WP2_RECHECK_B](WP2_RECHECK_B.vi.md) và [WP2_REVIEW_B](WP2_REVIEW_B.vi.md).
- Context mới; xác nhận reviewer không viết thay đổi:
  - Context mới. Reviewer này không viết gì trong WP2 và không đổi source nào.
  - Chỉ ghi vào report này, bản dịch của nó, phần kết quả của brief và `evidence/WP2-AUDIT-B4/`.
  - Các probe chỉ có trong các clone scratch và đã bị xóa trước digest sau.
- Digest trước/sau; bằng chứng gate snapshot đó: `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` trước và sau. Giá trị này bằng digest của WP2-GATE4 (`evidence/WP2-GATE4/digest-*.txt`) cho cùng commit 5fafeae.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP2_RECHECK_B4.md` và `.vi.md` (mới). [WP2_REVIEW_B](WP2_REVIEW_B.vi.md), [WP2_RECHECK_B](WP2_RECHECK_B.vi.md), [WP2_RECHECK_B3](WP2_RECHECK_B3.vi.md) và bằng chứng của chúng không đổi.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator:
  - WP2-B3-01 và WP2-B3-02: đóng, đã xác minh. WP2-B2-01, WP2-B2-02, WP2-B-01, WP2-B-02, màn hình ngoại lệ ngày lương và F1 vẫn đúng.
  - Vùng B không còn phát hiện mở, nên không cần task sửa hay recheck nào cho vùng B.
