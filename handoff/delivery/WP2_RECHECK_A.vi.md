# Review độc lập

Bản dịch của [WP2_RECHECK_A.md](WP2_RECHECK_A.md); tiếng Anh là nguồn chuẩn. Bản review trước (giữ nguyên): [WP2_REVIEW_A](WP2_REVIEW_A.vi.md). Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2/` (mục lục `00-commands.txt`; đã che, LF).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP2, kiểm tra lại vùng A (ledger và quyền riêng tư) bằng ngữ cảnh mới sau vòng sửa lỗi audit, task WP2-AUDIT-A2 lần 1, 2026-10-04 (UTC). Profile `timesheet-auditor`. Board ghi agent ID `a09f7f19da91a5f11` cho task này; ID này không quan sát được từ trong phiên. Model tự báo `claude-opus-5-5`. Effort yêu cầu xhigh; effort thực không quan sát được. Model tác giả mạnh nhất trong WP2 là opus (WP2-T02, WP2-T03), còn WP2-FIXA và WP2-FIXB chạy sonnet, nên model reviewer không yếu hơn.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `f79413b77e7f745e1eff383f1ad748e7667533da`. Đây là `freeze_commit` của WP2-GATE2 và trùng `origin/main`, nên không có commit chưa push. Source digest `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` (611 file, không tính `handoff/`), bằng digest của cổng. Digest được đo trước và sau, ở thư mục dự án và ở bản clone tạm; `scripts/source-digest.mjs` trong clone cho cùng giá trị. Cây làm việc của dự án chỉ có thay đổi trong `handoff/`. Source đủ: mọi kiểm tra chạy trong một bản clone tạm của commit đó trên ổ C:, ngoài Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.** WP2-A-01 đã được giải quyết. Giờ không phản hồi hay màn hình admin nào thay đổi khi nhân viên ghi dữ liệu. Probe so sánh 27 phản hồi admin trước và sau hoạt động của nhân viên, và tất cả giống hệt từng byte. Các phản hồi này gồm mọi lệnh đọc admin truy cập được, bảy lần xem trước lịch nghỉ và ba lần commit bị từ chối. Probe của lần 1 giờ không suy ra được gì. Cũng các probe đó trên commit cũ 8fae685 vẫn phát hiện chỗ lộ, nên chúng đủ nhạy. `finalized_conflicts` là tín hiệu chỉ có ngày, ở mức kỳ lương, không có số đếm. Hành vi commit không đổi. Vòng sửa không gây hồi quy nào ở vùng A. R1–R4 vẫn không chặn. Có hai nhận xét mới không chặn: WP2-A2-01 (Info, câu chữ cũ) và WP2-A2-02 (Low, một tín hiệu mức kỳ lương có từ trước, nằm ngoài phạm vi sửa).
- **Phạm vi thật đã xem/chạy:**
  1. Phạm vi sửa `8fae685..f79413b` (`11-static-scans.txt`):
     - Server: phạm vi sửa chỉ đổi `src/server/services/holidayImport.ts`. Không đổi migration, route, ledger, leave, history, evidence, xác thực hay code người dùng.
     - Client vùng A: kiểu dữ liệu xem trước trong `api.ts` và `HolidayImport.tsx`. Test là `tests/integration/holiday-import.test.ts`.
     - Các file client của WP2-FIXB (`DayEditor.tsx`, `SessionForm.tsx`, `sessionModel.ts`, `DayFigures.tsx`, `styles.css`): đã quét tìm cấu trúc lưu trữ, console, mạng, admin, ledger và user ID; không thấy cái nào.
  2. Bề mặt admin tại f79413b: `routes/admin.ts` (cả tám route); `services/holidayImport.ts` (cả file); `services/calendars.ts` (ngoại lệ kỳ lương); `services/periods.ts`; `HolidayImport.tsx`; `adminModel.ts`. Màn admin được kiểm trên Edge ở cả hai khung nhìn.
  3. Nguồn:
     - Nguồn chuẩn: docs/01 "Initial boundary", docs/03 "Records", docs/06 (lộ dữ liệu riêng tư chặn việc đi tiếp).
     - Hồ sơ: WP2_REVIEW_A cùng R1–R4 và các probe của nó; kết quả WP2-FIXA và WP2-FIXB; WP2-GATE2; quyết định coordinator trên board ngày 2026-10-04 (chỉ đọc).
  4. Kiểm tra độc lập:
     - `npm ci` và `npm run verify` có theo dõi deprecation.
     - 13 file test chọn lọc, cùng file test đồng thời thêm ba lần.
     - Test hồi quy mới chạy trên source cũ (kiểm đỏ).
     - Các spec trình duyệt admin, cô lập và OT leave trên cả hai project, thêm một spec tạm cho màn xem trước.
     - Các probe của lần 1, không sửa: xem trước lịch nghỉ, ledger/quyền riêng tư, bổ sung, và cuộc đua đa tiến trình với 10 vòng mỗi tổ hợp.
     - Một probe so sánh mới, có đối chứng trên commit cũ.
     - Preflight của package bằng Python workflow.
- **Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:**

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; digest `git ls-tree` (dự án và clone) | f79413b; 4c2bd7ef…3528 ở cả hai; exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 gọi bằng đường dẫn đầy đủ) | 144 gói; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` | typecheck, lint, 31 file / 606 test, build, SMOKE PASSED; 0 dòng deprecation; exit 0 | `03-verify.txt` |
| vitest trên 13 file (ledger, ot-leave, ot-leave-concurrency, history, evidence-export, isolation, migrations, ot-api, ledger.fixtures, user-admin, holiday-import, payroll-exceptions, adminModel); concurrency ×3; holiday-import chi tiết | 13 file / 266 test; 8/8 cả ba lần; holiday-import 29/29; exit 0 | `04-targeted-tests.txt` |
| `holiday-import.test.ts` của f79413b chạy trên source 8fae685 (worktree tạm) | đỏ như mong đợi: ba test quyền riêng tư mới lỗi, 26 đạt; exit 1 | `04b-regression-red-on-base.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, bản build dist) cùng `zz-audit-a2.spec.ts` tạm | spec của tác giả 24 đạt (cả hai project); spec tạm lỗi do bug của spec (ô năm), rồi đạt 2/2 ở lần 2; exit 1 rồi 0 | `05a-…-run1.txt`, `05b-e2e-preview-screen-probe.txt`, hai ảnh `audit-a2-…-synthetic.png` |
| `node pr-race.mjs <clone> <work> 10` (probe lần 1, 4 tiến trình OS, một file WAL) | 22 tổ hợp × 10 = 220 vòng, 0 vi phạm; đối chứng không an toàn giữ chỗ trùng 10/10; integrity ok; exit 0 | `06-probe-multiprocess-race.txt` |
| `node pa-ledger-privacy.mjs` (probe lần 1) | 119 đạt / 0 lỗi; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (probe lần 1) | 6 / 0; S6 và S7 không đổi; số đếm S8 giờ không còn; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` (probe lần 1) trên f79413b, rồi trên 8fae685 | f79413b: không suy ra được gì, không ghi gì; 8fae685: tái hiện được chỗ lộ; exit 0 | `10-probe-holiday-preview-privacy.txt` |
| `node pg2-admin-differential.mjs` (probe mới), ba lần chạy; cùng probe trên 8fae685 | lần 1 và lần 2 có bug của probe (xem mục lục); lần 3: 25 / 0, exit 0; đối chứng commit cũ: 15 / 10 như mong đợi, exit 1 | `13-…`, `13a-…-run2`, `13b-…-base-control` |
| quét `git diff` / `git grep` | xem file | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest; `node scripts/source-digest.mjs` (clone) | không đổi 4c2bd7ef…3528; exit 0 | `12-digest-after.txt` |
| Python workflow `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |

- **Phát hiện: mức độ | file/hàm | tái hiện | mong đợi/thực tế | quy tắc/AC | cách sửa có giới hạn:** không có phát hiện chặn. Có hai nhận xét không chặn:
  - **WP2-A2-01 | Info (câu chữ tài liệu lệch; không chặn) | `src/server/routes/admin.ts:48-50`, `tests/integration/isolation.test.ts:280`, `handoff/delivery/WP2_HANDOFF.md:41`.**
    - Tái hiện: `11-static-scans.txt` §4 và §7.
    - Mong đợi/thực tế: chú thích của router admin và của test cô lập vẫn nói xem trước/commit lịch nghỉ và ngoại lệ kỳ lương trả về "dates, names and aggregate counts". WP2 HANDOFF vẫn liệt kê "affected days, preserved overrides". Code giờ không trả số đếm nào suy ra từ dữ liệu nhân viên. Không ảnh hưởng hành vi.
    - Cần sửa (tùy chọn, lần tới chạm vào các file đó hoặc trong handoff chấp nhận WP2): ghi "dates, names and calendar-only fields; no employee-derived counts".
  - **WP2-A2-02 | Low (gia cố quyền riêng tư; không chặn; có từ trước, ngoài phạm vi sửa) | `src/server/routes/admin.ts:169` và `src/server/services/calendars.ts:299,323,343`, cùng `src/server/services/periods.ts:21-27` và `src/server/services/timesheetCommands.ts:90`.**
    - Tái hiện: `13-probe-admin-differential.txt`, OBS W3.
    - Mong đợi/thực tế: `POST /api/admin/payroll-exceptions` trả `refreshed_pay_period`. Giá trị này là true khi có dòng `pay_periods`, và lần sửa bảng giờ đầu tiên của bất kỳ ai dùng lịch đó tạo ra dòng ấy. Vì vậy admin biết, theo từng kỳ lương, có ai dùng lịch đó đã sửa bảng giờ hay chưa. Trong probe, giá trị là false khi chưa có dữ liệu nhân viên và true sau khi nhân viên sửa. Hành vi giống hệt trên 8fae685.
    - Vì sao không chặn: tín hiệu không theo từng ngày. Nó không có số đếm, không có danh tính, và chính admin sửa bảng giờ của mình cũng tạo ra dòng đó. Lệnh này là lệnh ghi: nó để lại sự kiện audit và một ngoại lệ mà mọi người dùng đều thấy, và mỗi ngày lương danh nghĩa chỉ làm được một lần. Màn admin không hiển thị giá trị này. Độ thô tương tự R3, mà coordinator đã chấp nhận (CALFIX).
    - Gia cố tùy chọn cho coordinator hoặc WP3: bỏ trường này khỏi phản hồi admin và giữ nó trong bản ghi audit.
- **Hành vi đã xác minh (không thấy lỗi):**
  1. **WP2-A-01 đã sửa.**
     - Probe lần 1: mỗi ngày bị ảnh hưởng trong bản xem trước giờ chỉ còn `date`, `label_before` và `label_after`. Không suy ra được gì ("none"); sự kiện audit vẫn 12 → 12 và phiên bản lịch 1 → 1 (`10`).
     - Probe so sánh (`13` A1–A3): hai nhân viên ghi dữ liệu. Các thao tác ghi là phiên làm việc nhãn mặc định ngày 10-05, 10-07 và 10-08, nhãn tường minh Sick, Vacation, Worked và Off (cả vào ngày lễ), một lần Clock in đang chạy, một credit và một yêu cầu giữ chỗ OT leave. Cả 27 phản hồi admin giữ nguyên từng byte. Chúng gồm users, me, calendar, periods, bảng giờ của chính admin, days, policies, history, OT và CSV, health, xem trước A–G (kỳ hiện tại, ngày tương lai, đổi tên và đổi loại, xóa ngày, hồi tố, CSV có lỗi, mọi ngày của kỳ hiện tại), các lần commit bị từ chối và một route dữ liệu đoán mò.
     - Không bản xem trước nào chứa ID nhân viên, email, nhãn cá nhân hay khóa số đếm.
     - Màn hình (`05b`, ảnh chụp): chữ trong phần xem trước giống hệt trước và sau khi nhân viên ghi một phiên làm việc và một nhãn Vacation. Mỗi dòng ngày bị ảnh hưởng chỉ ghi "date Worked to Holiday", và màn hình hiện câu quy tắc cố định.
  2. **Test hồi quy.** Test "answers identically whether or not employees have day entries on the affected dates (WP2-A-01)" so sánh cả body bằng `toEqual` và kiểm không có danh tính, không có khóa số đếm. Cùng test finalized chỉ-ngày, nó lỗi trên source 8fae685 (`04b`: 3 lỗi) và đạt trên f79413b (`04`).
  3. **`finalized_conflicts`** (`13` F1–F5):
     - Mỗi phần tử chỉ là `{date}`. Góc nhìn admin giống hệt khi có một hay hai bảng giờ đã chốt, nên không mang số đếm.
     - Tín hiệu ở mức kỳ lương: khi kỳ hiện tại đã chốt, cả 14 ngày thay đổi đều được liệt kê, kể cả những ngày không có entry.
     - `can_commit` là false và `preview_hash` là null.
     - Commit bị từ chối bằng 409 `finalized_period_affected`, với details là `{conflicts:[{date}]}`.
     - Các bản xem trước ngoài kỳ đã chốt không bị ảnh hưởng.
     - Quyết định coordinator cho phép tín hiệu chỉ có ngày.
  4. **Hành vi commit không đổi.**
     - Code: trong phạm vi sửa, `commitHolidayImport` và `resultHash` không bị chạm; chỉ kiểu finalized-conflict mất số đếm.
     - Probe (`13` C1–C6, W1, W2; giống hệt trên 8fae685 ở `13b`):
       - `preview_hash` bằng một sha256 tính độc lập của kết quả chuẩn hóa.
       - Commit trả 201 và ghi đúng một phiên bản lịch và một sự kiện audit, kèm tóm tắt import. `day_entries` và các phiên làm việc không đổi từng byte.
       - Cùng request đó sau commit của chính nó là re-commit giống hệt đã được ghi trong tài liệu: 200 unchanged, không ghi gì.
       - Một bản xem trước bị lỗi thời do commit khác trả 409 `stale_preview`, không ghi gì.
       - Một bản xem trước mới không có thay đổi commit thành 200 unchanged.
       - Sau commit, nhãn tường minh được giữ (Vacation 12-24, Off 12-31), còn ngày mặc định theo lịch (12-31 Shutdown).
       - Có và không có dữ liệu nhân viên, phản hồi commit và vô hiệu hóa tài khoản giống hệt nhau (hash đã che).
  5. **Không hồi quy ở vùng A.**
     - Probe ledger/quyền riêng tư 119/0 (`07`): luồng ledger, tiêu hao không phụ thuộc nhãn, hiệu chỉnh và pending theo R-05, trigger chỉ-thêm, danh mục route, CSV, history, quyền sở hữu, và không có mật khẩu hay hash trong bất kỳ phản hồi nào trong 160 phản hồi.
     - Probe bổ sung 6/0 (`09`).
     - Cuộc đua đa tiến trình (`06`): 220 vòng, 0 vi phạm; đối chứng giữ chỗ trùng 10/10.
     - Test chọn lọc (`04`): 266 đạt. Các spec trình duyệt cô lập và OT leave của tác giả đạt trên cả hai project (`05a`).
     - `npm run verify` exit 0, không có dòng deprecation (`03`). Preflight PASS (`14`).
- **Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh:**
  - R1 (Info, không đổi): nhánh duplicate của `postCorrection` bỏ qua `sourceRef`. S6 vẫn cho thấy hiệu chỉnh → `duplicate` còn credit → `source_key_conflict`, và `ledger.ts` không đổi. Không chặn.
  - R2 (Info, không đổi): ghi chú policy có khoảng trắng đầu trước `=` được xuất nguyên văn (S7); `otEvidence.ts` không đổi. Không chặn.
  - R3 (Info, quyết định coordinator CALFIX, không đổi): 409 `calendar_in_use` (`users.ts:167`) cho biết tài khoản đã có dữ liệu hay chưa. `users.ts` không đổi. Không chặn.
  - R4 (chuyển sang WP3, không đổi): WP3 phải lưu và xử lý kết quả `pending` của hiệu chỉnh và khoản trừ. WP3 cũng phải bỏ phút tạm tính khi chốt. Câu chữ lịch sử cho các bút toán do hệ thống tạo chỉ là thẩm mỹ. `ledger.ts` và `timesheets.ts` không đổi. Không chặn.
  - ADV-A-05 (Info, backlog) không đổi.
  - WP2-A2-01 và WP2-A2-02 ở trên.
  - Các thay đổi múi giờ nhập và CSS của WP2-FIXB thuộc vùng B, do WP2-AUDIT-B2 kiểm lại. Lần kiểm này chỉ xác nhận chúng không chạm đường nào của vùng A.
- **Cổng bắt buộc chưa chạy/bị chặn và lý do:**
  - Không có ở vùng A.
  - Không chạy theo thiết kế:
    - Probe nâng cấp WP1 → WP2: phạm vi sửa không đổi migration hay code lưu trữ, và bước 4 của WP2-GATE2 đã chạy lại phần nâng cấp migration.
    - Toàn bộ bộ e2e: WP2-GATE2 đã chạy, 74 đạt và 2 bỏ qua; vùng B lo các luồng còn lại.
    - Các đường của WP3/WP4: chốt bảng giờ, PDF, chữ ký, email, triển khai.
  - Bug của probe: có bốn bug, ba ở probe mới và một ở spec tạm. Mỗi bug chỉ được sửa trong probe hoặc spec rồi chạy lại. Mọi lần chạy đều được giữ, trừ lần 1 của pg2, chỉ hiện trong phiên (`00-commands.txt`).
- **Xử lý phát hiện trước:**
  - WP2-A-01: đã sửa và xác minh trên f79413b, theo phương án coordinator ngày 2026-10-04 (bỏ mọi số đếm suy ra từ dữ liệu nhân viên; tín hiệu finalized chỉ có ngày).
  - R1–R4 và ADV-A-05: vẫn không chặn.
  - Các hành vi đã xác minh ở lần 1: được bộ probe rút gọn xác nhận lại.
- **Mức sẵn sàng phần mềm, quyền của chủ và kết quả pilot, tách riêng:**
  - Mức sẵn sàng phần mềm: vùng A của WP2 đạt trên f79413b. Việc chấp nhận package còn cần WP2-AUDIT-B2.
  - Quyền của chủ cho việc gửi thật hay triển khai: không yêu cầu, không được cấp.
  - Kết quả pilot: không có.
- **Một hành động/prompt tiếp theo:** coordinator ghi PASS này lên board. Khi WP2-AUDIT-B2 cũng đạt, coordinator giao bước chấp nhận WP2. Bước đó có thể sửa câu chữ cũ của WP2-A2-01 trong WP2_HANDOFF. Coordinator cũng quyết định có đưa WP2-A2-02 vào backlog WP3 hay không.

Không bịa phát hiện, không ghi đạt khi chưa quan sát. Một review từng phần không phải là chấp nhận hoàn chỉnh.

## Nguồn gốc subagent độc lập

- **Task/lần review, ID reviewer và ID tác giả được review:**
  - Review: WP2-AUDIT-A2 lần 1; reviewer `a09f7f19da91a5f11` (board).
  - Tác giả bản sửa được review (board): WP2-FIXA `aa3af6ddfb57e0a19` và WP2-FIXB `afdfdb7208db48436`.
  - Các tác giả WP2 trước đó, như liệt kê trong WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Committer (WP2-FIX-FREEZE `a478b6cc23befba3d`), verifier (WP2-GATE2 `a44cc217fb0ba6b27`) và planner không được coi là tác giả.
- **Ngữ cảnh mới; xác nhận reviewer không là tác giả thay đổi:** ngữ cảnh mới. Reviewer không viết thay đổi nào trong WP2, không viết WP2_REVIEW_A, và không sửa source nào. Mọi báo cáo task đều được coi là lời khai và được chạy lại hoặc kiểm bằng probe. Spec e2e tạm chỉ tồn tại trong bản clone tạm và đã bị xóa; cây theo dõi và digest của clone không đổi.
- **Source digest trước/sau; bằng chứng cổng cho snapshot đó:**
  - Digest `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` và HEAD `f79413b` trước và sau (`01`, `12`).
  - Cổng: WP2-GATE2 (`handoff/delivery/evidence/WP2-GATE2/`), verifier PASS kèm ghi chú bằng chứng F1, trên cùng commit và digest.
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP2_RECHECK_A.md` và `.vi.md` là file mới. WP2_REVIEW_A và bằng chứng `handoff/delivery/evidence/WP2-AUDIT-A/` của nó không bị chạm. Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2/`.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:**
  - WP2-A-01: đã đóng.
  - WP2-A2-01 (Info) và WP2-A2-02 (Low): không chặn, dành cho handoff chấp nhận hoặc backlog.
  - R1–R4 và ADV-A-05: không chặn.
  - Vùng A không cần task sửa nào.
