# Review độc lập

Bản dịch của [WP2_RECHECK_A3.md](WP2_RECHECK_A3.md); tiếng Anh là nguồn chuẩn. Các review trước (giữ nguyên): [WP2_REVIEW_A](WP2_REVIEW_A.vi.md) và [WP2_RECHECK_A](WP2_RECHECK_A.vi.md). Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2-a2/` (mục lục `00-commands.txt`; đã che, LF).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP2, audit lại mới của vùng A (sổ OT và quyền riêng tư) tại commit cuối gói mới, task WP2-AUDIT-A2 lần 2, 2026-10-04 (UTC). Profile `timesheet-auditor`. Board ghi agent ID `a4b3acc53273ed5e2` cho lần này; ID không quan sát được trong phiên. Model tự báo `claude-opus-5-5`. Effort yêu cầu xhigh; effort thật không quan sát được. Model tác giả mạnh nhất của snapshot được kiểm là opus (WP2-T02, WP2-T03). WP2-FIXA, WP2-FIXB và WP2-FIXB2 chạy sonnet. Vì vậy model reviewer không yếu hơn.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:**
  - Commit `a3d1b6555c352afa68b3d61ddc67f0c596742698`. Đây là `freeze_commit` của WP2-GATE3 và bằng `origin/main`, nên không có commit chưa push.
  - Source digest `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` (613 file, không tính `handoff/`). Digest này bằng digest của gate.
  - Digest được đo trước và sau, trong thư mục dự án và trong bản clone tạm, bằng `git ls-tree` và bằng `scripts/source-digest.mjs`. Cây làm việc của dự án chỉ có thay đổi dưới `handoff/`.
  - Source đủ: mọi kiểm tra chạy trong bản clone tạm của commit đó trên ổ C:, ngoài Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - WP2-A2-02 đã được giải quyết. Câu trả lời ngoại lệ ngày lương và mọi lượt đọc của admin sau đó giống hệt từng byte dù nhân viên có hay không có timesheet: 30 trên 30 phản hồi khớp. Các dòng đã lưu vẫn được làm mới, và mã 409 cho kỳ đã chốt vẫn được giữ. Cùng probe đó trên f79413b phát hiện trường cũ, nên probe đủ nhạy.
  - WP2-A-01 vẫn được giải quyết. Vòng sửa không đụng đường dẫn nào của vùng A ngoài câu trả lời ngoại lệ ngày lương.
  - R1–R4 vẫn không chặn.
  - Một ghi nhận mới không chặn: WP2-A3-01 (Info, hướng tới tương lai).
- **Phạm vi thật đã xem/chạy:**
  1. Dải sửa `f79413b..a3d1b65`, một commit (`11-static-scans.txt`):
     - Server: chỉ `routes/admin.ts` (câu trả lời ngoại lệ ngày lương và một chú thích) và `services/calendars.ts` (`createPayrollException` chỉ trả `{exception}`, kèm một chú thích).
     - Client: chỉ `styles.css`, thêm bốn token có giá trị không đổi. Diff không có cấu trúc nào liên quan vùng A.
     - Test: `payroll-exceptions.test.ts` (test đối chứng mới), `isolation.test.ts` (chỉ chú thích), `day-editor.spec.ts`, và helper chỉ dùng cho test `tests/client/zoneOracle.ts` cùng unit test của nó.
     - 22 đường dẫn vùng A không đổi: sổ OT, nghỉ OT, bằng chứng, lịch sử, người dùng, nhập ngày lễ, timesheet, kỳ lương, audit, migration, `http/`, các route `api`/`ot`/`history`/`auth`, `api.ts` và các component client.
  2. Bề mặt admin tại a3d1b65: `routes/admin.ts` (cả tám route); `createPayrollException` và các helper của nó trong `periods.ts`; phạm vi chủ sở hữu của `history.ts`; cách `PayrollExceptions.tsx` và `api.ts` dùng câu trả lời (chúng không bao giờ đọc trường đã bỏ).
  3. Nguồn:
     - Chuẩn: docs/01 "Initial boundary", docs/03 "Records", docs/06 (lộ dữ liệu riêng tư chặn tiến độ), docs/10 E-10.
     - Hồ sơ: WP2_REVIEW_A và WP2_RECHECK_A cùng probe của chúng; kết quả và bằng chứng WP2-FIXB2; hồ sơ WP2-GATE3; các mục trên board (chỉ đọc).
  4. Kiểm tra độc lập:
     - `npm ci` và `npm run verify` có theo dõi deprecation.
     - 13 file test mục tiêu, file concurrency chạy thêm ba lần.
     - Test payroll mới chạy trên source f79413b (kiểm đỏ).
     - Các spec trình duyệt admin, isolation và OT-leave trên cả hai project.
     - Probe lần 1, không đổi: preview ngày lễ, có đối chứng 8fae685; sổ OT/quyền riêng tư; bổ sung; đối chứng admin A2; race đa tiến trình, 220 + 550 vòng.
     - Một probe đối chứng ngoại lệ ngày lương mới, có đối chứng f79413b.
     - Preflight của gói bằng Python của workflow.
- **Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:**

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; digest `git ls-tree`; `scripts/source-digest.mjs` (thư mục dự án) | a3d1b65 = origin/main; 5b370621…8581 (613 file); exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 gọi bằng đường dẫn đầy đủ) | 144 gói; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` | typecheck, lint, 32 file / 611 test, build, SMOKE PASSED; không có đầu ra deprecation (khớp duy nhất là dòng lệnh được in lại); exit 0 | `03-verify.txt` |
| vitest trên 13 file vùng A; concurrency ×3; payroll-exceptions và holiday-import dạng verbose | 13 file / 267 test; 8/8 ba lần; payroll-exceptions 13/13; holiday-import 29/29; exit 0 | `04-targeted-tests.txt` |
| `payroll-exceptions.test.ts` của a3d1b65 chạy trên source f79413b (worktree tạm) | đỏ như dự kiến: 4 lỗi, 9 đạt, mọi lỗi do khóa thừa `refreshed_pay_period`; exit 1 | `04b-red-payroll-on-f79413b.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, dist đã build) | 24 đạt trên cả hai project, gồm test màn hình ngoại lệ ngày lương; exit 0 | `05-e2e-admin-isolation-ot-leave.txt` |
| `node pr-race.mjs <clone> <work> 10`, rồi `… 25` (probe lần 1, 4 tiến trình OS, một file WAL) | 220 và 550 vòng production, 0 vi phạm; đối chứng không an toàn đặt trùng 10/10 và 25/25; integrity ok; exit 0 | `06-…`, `06b-…` |
| `node pa-ledger-privacy.mjs` (probe lần 1) | 119 đạt / 0 lỗi; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (probe lần 1) | 6 / 0; S6 và S7 không đổi; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` trên a3d1b65, rồi trên 8fae685 | a3d1b65: không suy ra được gì, không ghi gì; 8fae685: tái hiện lỗ hổng; exit 0 | `10-…`, `10b-…` |
| `node pg2-admin-differential.mjs` (probe A2 lần 1, không đổi) | 25 / 0; 27/27 giống hệt; ngoại lệ ngày lương nay "same" giữa hai thế giới (lần 1: khác); exit 0 | `13-probe-admin-differential.txt` |
| `node pe-payroll-differential.mjs` (probe mới) trên a3d1b65, rồi trên f79413b | a3d1b65: 20 / 0, 30/30 giống hệt, exit 0; đối chứng f79413b: 17 / 3 như dự kiến, exit 1 | `16-…`, `16b-…` |
| quét `git diff` / `git grep` | xem file | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest (clone và dự án) | không đổi a3d1b65 / 5b370621…8581; exit 0 | `12-digest-after.txt` |
| Python của workflow `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |
| cùng các validator sau khi ghi report này, kết quả brief và bằng chứng | PASS / PASS; exit 0. Một lượt chạy lại sau đó cho exit 1 chỉ vì `WP2_RECHECK_B3.md`, report của task WP2-AUDIT-B3 chạy song song, khi bản dịch của nó chưa có. Lượt chạy lại cuối, sau khi bản dịch đó xuất hiện, đạt (56 cặp, 930 link). | `14b-preflight-after-writes.txt` |
| `node scripts/precommit-check.mjs` (index của clone chỉ stage đầu ra của task này), hai lượt | PASS, 0 chặn, 0 cảnh báo; exit 0 | `15-precommit-check.txt` |
| gỡ worktree và thư mục tạm; kiểm lại HEAD và digest (thư mục dự án) | đã gỡ; a3d1b65 / 5b370621…8581 không đổi; exit 0 | `17-cleanup.txt` (ghi sau khi clone đã bị xóa, nên được quét bằng grep thay cho cổng precommit) |

- **Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:** không có lỗi chặn. Một ghi nhận không chặn:
  - **WP2-A3-01 | Info (ghi chú quyền riêng tư hướng tới tương lai; không chặn) | `src/server/services/calendars.ts:335-344` (payload audit của `createPayrollException`: owner null ở 337, `before` ở 342, `after` ở 343).**
    - Tái hiện: `16-probe-payroll-differential.txt`, các dòng "audit W0" và "audit W1".
    - Kỳ vọng/thực tế: đúng như bản sửa dự định, sự kiện audit `payroll_exception.create` giữ `refreshed_pay_period`. Nó cũng giữ dòng đã lưu: toàn bộ dòng ở `before` và dòng đã làm mới ở `after.pay_period`. Cờ là false ở thế giới không có timesheet và true ở nơi nhân viên có timesheet. Sự kiện có `owner_user_id` null, và không route nào đọc sự kiện không có chủ. `history.ts:66` lọc theo `owner_user_id = ?`, và lịch sử của admin lẫn nhân viên đều không liệt kê sự kiện này (S4, S5). Vì vậy hôm nay không có gì bị lộ.
    - Lý do ghi lại: một gói sau có thể thêm màn xem audit log cho admin, một bản xuất hoặc một công cụ hỗ trợ. Nếu hiển thị thô cho quản trị viên, payload này sẽ mở lại tín hiệu WP2-A2-02 theo từng kỳ lương.
    - Thay đổi cần làm: hiện không cần. Khi WP3 hoặc WP4 thêm bất kỳ màn xem audit nào mà quản trị viên thấy được, nó phải che `refreshed_pay_period`, `before` và `after.pay_period` của `payroll_exception.create`, hoặc áp dụng "quyền rõ ràng riêng" của docs/03.
- **Hành vi đã kiểm (không thấy lỗi):**
  1. **WP2-A2-02 đã giải quyết.**
     - Mã: `POST /api/admin/payroll-exceptions` trả 201 chỉ với `{payroll_exception}` (`admin.ts:169-171`). Service trả `{exception}`. Đối tượng ngoại lệ chỉ chứa trường lịch: calendar ID, ngày lương danh nghĩa, ngày lương, ngày và giờ hạn nộp, lý do và `created_at`.
     - Đối chứng (`16`), với hai thế giới cùng seed và cùng đồng hồ. Ở W0 không nhân viên nào hoạt động. Ở W1 hai nhân viên sửa ngày trong bốn kỳ lương, nên có dòng đã lưu cho 10-02, 10-16, 10-30 và 11-13; quản trị viên không làm gì mang tính cá nhân. Quản trị viên gửi cùng 10 yêu cầu ở cả hai thế giới. Chúng gồm kỳ hiện tại với hạn nộp mới, kỳ sau chỉ dời hạn nộp, một kỳ đã qua, một kỳ có dòng do nhãn tường minh tạo ra, một kỳ không có dòng, một yêu cầu trùng (409), lý do để trống (422), ngày không phải ngày lương (422), dời quá nửa chu kỳ (422) và lịch không tồn tại (404). 20 lượt đọc của admin sau đó là lịch, các kỳ, kỳ hiện tại, năm timesheet của chính mình, ba ngày, chính sách, lịch sử, OT và health. Cả 30 phản hồi giống hệt từng byte sau khi che UUID (P1).
     - Mọi 201 có đúng một khóa `payroll_exception` (P3). Không phản hồi admin nào chứa "refreshed", `pay_period_id` hay ID nhân viên ngoài danh sách tài khoản (P5).
     - Bản sửa giữ hành vi E-10. Ở W1 các dòng đã lưu thật sự được làm mới: 10-16 → 10-15 với hạn 10-13, 10-30 hạn 10-27 09:00, 10-02 → 10-01, 11-13 → 11-12 (S1). W0 không có dòng nào được lưu (S2). Integrity ok.
     - Độ nhạy: cùng probe trên f79413b cho thấy `refreshed_pay_period` false → true với X1–X4 (`16b`). Ngay cả ở đó, mọi lượt đọc sau ngoại lệ đều giống hệt, nên lỗ hổng chỉ nằm ở trường của 201.
     - Test hồi quy: test đối chứng mới, cùng ba khẳng định tập khóa, lỗi trên source f79413b (4 lỗi, `04b`) và đạt trên a3d1b65 (`04`). Fixture B của nó cũng cho admin sửa. Thế giới W1 của probe, nơi chỉ nhân viên sửa, lấp khoảng trống đó.
     - Probe A2 của lần 1 nay báo ngoại lệ là "same" giữa hai thế giới. Ở lần 1 nó khác ở `refreshed_pay_period` false → true (`13`, phần W).
     - Đã kiểm lại chốt chặn quy tắc 8: không văn bản chuẩn nào đòi hiển thị việc làm mới. Docs/10 E-10 chỉ nói dòng chưa chốt được làm mới và dòng đã chốt bị từ chối (`11` §5). Client chưa từng dùng trường này (`11` §3), và test trình duyệt của màn hình ngoại lệ ngày lương đạt trên cả hai project (`05`).
  2. **Mã 409 cho kỳ đã chốt được giữ (E-10)** (`16` F0–F6, trên bản sao của W1 lấy trước khi quản trị viên thao tác):
     - Khi timesheet của nhân viên cho ngày lương 10-16 đã chốt (UPDATE trực tiếp, như WP3 sẽ đặt), yêu cầu trả 409 `period_finalized`.
     - Nó không ghi gì: không ngoại lệ, không sự kiện audit, và các dòng đã lưu không đổi.
     - Chi tiết của nó chỉ có `{period_start, period_end}` (2026-09-28, 2026-10-11), không số đếm và không danh tính.
     - Một hay hai timesheet đã chốt cho ra lời từ chối giống hệt từng byte.
     - Ngoại lệ cho một kỳ khác chưa chốt vẫn trả 201 với cùng nội dung như ở W1.
  3. **WP2-A-01 vẫn được giải quyết.**
     - Mã: `holidayImport.ts` và `holiday-import.test.ts` không đổi trong dải sửa.
     - Probe lần 1 không suy ra được gì và không ghi gì (`10`). Cùng probe đó trên 8fae685 vẫn tái hiện lỗ hổng (`10b`).
     - Probe đối chứng A2 (`13`):
       - 27/27 phản hồi admin giống hệt từng byte trước và sau khi hai nhân viên ghi phiên làm, nhãn tường minh, nghỉ, một Clock in, một khoản ghi có và một đặt chỗ.
       - Các preview không mang danh tính, nhãn cá nhân hay khóa số đếm nào.
       - `finalized_conflicts` chỉ có `{date}`, ở mức kỳ, và giống hệt dù có một hay hai timesheet đã chốt.
       - Lệnh commit bị từ chối với 409 `finalized_period_affected` và chi tiết chỉ có ngày.
       - Hành vi commit (C1–C6, W1, W2) không đổi.
     - Test hồi quy đạt (29/29, `04`).
  4. **Không có hồi quy ở vùng A.**
     - Probe sổ OT/quyền riêng tư 119/0 (`07`): dấu vết sổ OT, chi tiêu không phụ thuộc nhãn, điều chỉnh và trạng thái pending của R-05, trigger chỉ-ghi-thêm, danh mục route, CSV, lịch sử, quyền sở hữu, và không có mật khẩu hay hash trong phản hồi nào.
     - Bổ sung 6/0 (`09`).
     - Race đa tiến trình (`06`, `06b`): 770 vòng production với 0 vi phạm, đối chứng luôn đặt trùng.
     - Test mục tiêu: 267 đạt (`04`). Các spec trình duyệt: 24 đạt (`05`).
     - `npm run verify` exit 0, không có đầu ra deprecation (`03`). Preflight PASS (`14`).
  5. **WP2-A2-01 (Info của lần 1) đã sửa trong mã.** `admin.ts:48-50` và `isolation.test.ts:280` nay ghi "calendar-only fields" và "no employee-derived count". Không còn "aggregate count" trong `src/`, `tests/` hay `docs/` (`11` §4). Theo brief, `WP2_HANDOFF.md:41` vẫn liệt kê "affected days, preserved overrides"; bước nghiệm thu sẽ sửa.
- **Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:**
  - R1 (Info, không đổi): nhánh trùng của `postCorrection` bỏ qua `sourceRef`. S6 vẫn cho điều chỉnh → `duplicate` so với ghi có → `source_key_conflict`, và `ledger.ts` không đổi. Không chặn.
  - R2 (Info, không đổi): ghi chú chính sách có khoảng trắng đầu trước `=` được xuất nguyên dạng (S7); `otEvidence.ts` không đổi. Không chặn.
  - R3 (Info, quyết định coordinator CALFIX, không đổi): 409 `calendar_in_use` (`users.ts:167`) cho biết tài khoản có dữ liệu hay không. `users.ts` không đổi. Không chặn.
  - R4 (chuyển sang WP3, không đổi):
    - WP3 phải lưu và xử lý kết quả `pending` của điều chỉnh và ghi nợ (`ledger.ts:114,128,408,460`).
    - WP3 cũng phải bỏ phút tạm tính khi chốt.
    - Cách diễn đạt lịch sử cho bút toán do hệ thống tạo chỉ là thẩm mỹ.
    - `ledger.ts` và `timesheets.ts` không đổi. Không chặn.
  - ADV-A-05 (Info, backlog) không đổi.
  - Tín hiệu thô đã được chấp nhận, không phải lỗi:
    - Mã 409 `period_finalized` cho kỳ đã chốt cho quản trị viên biết, theo từng kỳ lương, rằng có timesheet đã chốt. E-10 đòi lời từ chối này, và brief giữ nó. Nó không mang số đếm và không mang danh tính.
    - `finalized_conflicts` là cùng loại tín hiệu ở mức kỳ, được quyết định coordinator ngày 2026-10-04 cho phép.
  - WP2-A3-01 ở trên.
  - Test e2e R-07 không phụ thuộc mùa và các token CSS của WP2-FIXB2 thuộc vùng B; WP2-AUDIT-B3 kiểm lại chúng. Audit này chỉ xác nhận chúng không đụng đường dẫn nào của vùng A và `zoneOracle.ts` chỉ được test import.
- **Gate chưa chạy/bị chặn và lý do:**
  - Không có ở vùng A.
  - Không chạy theo thiết kế:
    - Probe nâng cấp WP1 → WP2: dải sửa không đổi mã migration hay lưu trữ, và WP2-GATE3 đã chạy lại nâng cấp migration.
    - Toàn bộ bộ e2e: WP2-GATE3 chạy 74 đạt và 2 bỏ qua; vùng B lo các luồng khác.
    - Đường dẫn WP3/WP4: chốt, PDF, chữ ký, email, triển khai.
  - Không probe nào lỗi do lỗi probe trong lần này, và mọi lượt chạy đều được giữ.
- **Xử lý phát hiện trước:**
  - WP2-A-01: vẫn đã sửa trên a3d1b65.
  - WP2-A2-02: đã sửa và đã kiểm. Câu trả lời giống hệt dù có hay không có timesheet của nhân viên, và mã 409 cho kỳ đã chốt được giữ.
  - WP2-A2-01: đã sửa trong mã; câu chữ trong handoff để bước nghiệm thu sửa theo brief.
  - R1–R4 và ADV-A-05: vẫn không chặn.
  - Hành vi đã kiểm ở lần 1: được xác nhận lại bằng bộ probe rút gọn.
- **Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:**
  - Sẵn sàng phần mềm: vùng A của WP2 đạt trên a3d1b65 / 5b370621. Nghiệm thu gói còn cần WP2-AUDIT-B3.
  - Phép của chủ cho gửi thật hoặc triển khai: không yêu cầu và không được cấp.
  - Kết quả pilot: không có.
- **Một bước/prompt tiếp:** coordinator ghi PASS này lên board. Khi WP2-AUDIT-B3 cũng đạt, coordinator giao bước nghiệm thu WP2. Bước đó sửa `WP2_HANDOFF.md:41` và có thể đưa WP2-A3-01 vào backlog WP3.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:**
  - Review: WP2-AUDIT-A2 lần 2; reviewer `a4b3acc53273ed5e2` (board). Reviewer lần 1 là `a09f7f19da91a5f11`, một agent khác.
  - Tác giả bản sửa được kiểm (board): WP2-FIXB2 `a908ddae97aaffe5a`. Các tác giả sửa trước đó là WP2-FIXA `aa3af6ddfb57e0a19` và WP2-FIXB `afdfdb7208db48436`.
  - Các tác giả WP2 trước đó, như liệt kê trong WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Committer (WP2-FIXB2-FREEZE `ab84d5b84b7b03680`), verifier (WP2-GATE3 `a412e4ac65755cb7c`) và planner không được coi là tác giả.
- **Context mới; xác nhận reviewer không viết thay đổi:** context mới. Reviewer không viết thay đổi nào trong WP2 và không viết review WP2 nào trước đó, và không sửa source. Mọi báo cáo task được coi là lời khẳng định và được chạy lại hoặc dò bằng probe. Lần kiểm đỏ chỉ chép một file test vào một worktree tạm rồi khôi phục. Cây được theo dõi của bản clone vẫn sạch.
- **Digest trước/sau; bằng chứng gate snapshot đó:**
  - Digest `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` và HEAD `a3d1b65` trước và sau (`01`, `12`).
  - Gate: WP2-GATE3 (`handoff/delivery/evidence/WP2-GATE3/`), verifier PASS trên cùng commit và digest.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP2_RECHECK_A3.md` và `.vi.md` là file mới. WP2_REVIEW_A, WP2_RECHECK_A và các thư mục bằng chứng của chúng (`WP2-AUDIT-A/`, `WP2-AUDIT-A2/`) không bị đụng tới. Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2-a2/`.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:**
  - WP2-A-01, WP2-A2-01 (mã) và WP2-A2-02: đóng.
  - WP2-A3-01 (Info): không chặn, ghi chú backlog cho bất kỳ màn xem audit nào của admin sau này.
  - R1–R4 và ADV-A-05: không chặn.
  - Vùng A không cần task sửa nào.
