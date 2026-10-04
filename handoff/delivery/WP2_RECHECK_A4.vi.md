# Review độc lập

Bản dịch của [WP2_RECHECK_A4.md](WP2_RECHECK_A4.md); tiếng Anh là nguồn chuẩn. Các review trước (giữ nguyên): [WP2_REVIEW_A](WP2_REVIEW_A.vi.md), [WP2_RECHECK_A](WP2_RECHECK_A.vi.md) và [WP2_RECHECK_A3](WP2_RECHECK_A3.vi.md). Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2-a3/` (mục lục `00-commands.txt`; đã che, LF).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP2, tái kiểm toán phần thay đổi (delta) của vùng A (sổ cái và quyền riêng tư) với ngữ cảnh mới, tại commit cuối gói mới; nhiệm vụ WP2-AUDIT-A2 lần 3, 2026-10-04 (UTC). Profile `timesheet-auditor`. Bảng ghi agent ID `afb3d9a9fc9587b29` cho lần này; ID không quan sát được trong phiên. Model tự báo `claude-opus-5-5`. Effort yêu cầu xhigh; effort thực tế không quan sát được. Model tác giả mạnh nhất của snapshot được rà soát là opus (WP2-T02, WP2-T03). Các vòng sửa chạy trên sonnet: WP2-FIXA, WP2-FIXB, WP2-FIXB2 và WP2-FIXB3. Vì vậy model người rà soát không yếu hơn.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:**
  - Commit `5fafeaee72509c6110a907458643bf7582dad81a`. Đây là `freeze_commit` của WP2-GATE4 và bằng `origin/main`, nên không có commit chưa đẩy.
  - Digest nguồn `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` (613 tệp, không tính `handoff/`). Giá trị này bằng digest của gate.
  - Digest được đo trước và sau, trong thư mục dự án và trong bản clone nháp, bằng `git ls-tree` và bằng `scripts/source-digest.mjs`. Cây làm việc của dự án chỉ có thay đổi trong `handoff/`.
  - Nguồn đầy đủ: mọi kiểm tra chạy trong một bản clone nháp của commit đó trên ổ C:, ngoài Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - Khoảng `a3d1b65..5fafeae` chỉ thay đổi `src/client/styles.css`, `tests/client/zoneOracle.ts` và `tests/client/zoneOracle.test.ts` ngoài `handoff/`. Nó không chạm vào mã máy chủ, sổ cái, quyền riêng tư hay quản trị.
  - WP2-A-01 và WP2-A2-02 vẫn đã được giải quyết. Lượt kiểm tra hồi quy nhanh tái tạo đúng kết quả của lần 2.
  - R1–R4 và WP2-A3-01 vẫn không chặn.
  - Một quan sát tùy chọn mới: WP2-A4-01 (Info, công cụ). Đây không phải lỗi của vùng A.
- **Phạm vi thật đã xem/chạy:**
  1. Khoảng delta `a3d1b65..5fafeae`, một commit (`11-static-scans.txt`):
     - Ngoài `handoff/`, name-status liệt kê đúng ba tệp. `styles.css` thêm 81 dòng và bỏ 60 dòng. `zoneOracle.ts` thêm 16 và bỏ 5. `zoneOracle.test.ts` thêm 33.
     - Các đường dẫn hiện có sau đây không thay đổi: `src/server` (kể cả `db/migrations`), `src/domain`, `scripts`, `docs`, `tests/integration`, `tests/domain`, `tests/e2e` và `tests/support`. Trong `src/client` chỉ `styles.css` thay đổi, nên `api.ts`, các màn hình và các component không đổi. `package.json` và `package-lock.json` cũng không đổi.
     - `zoneOracle.ts` không import gì. Chỉ `zoneOracle.test.ts` và `tests/e2e/day-editor.spec.ts` import nó. Thay đổi làm `instantOfWallTime` ném lỗi khi gặp giờ lặp DST (fold), cũng như khi gặp giờ bị nhảy (gap). Đó là vùng B (WP2-B3-02).
     - Trong `styles.css`, các dòng bỏ và thêm là phép thay giá trị bằng token. Token mới giữ đúng giá trị cũ, ví dụ `opacity: 0.6` thành `var(--opacity-disabled)` với `--opacity-disabled: 0.6`. Thay đổi không thêm cấu trúc `url()`, `@import` hay `content:`. Không có quy tắc `display` hay `visibility` nào thay đổi. Việc giá trị tính toán có giống hệt hay không là phần WP2-AUDIT-B4 xác minh.
     - Các dòng được trích dẫn của các phát hiện trước không đổi: `admin.ts:169-171`, `calendars.ts:335-344`, `holidayImport.ts:232`, `users.ts:167`, `history.ts:66`, và các tệp `ledger.ts`, `otEvidence.ts` và `timesheets.ts`.
  2. Nguồn: AGENTS.md (đọc từ đĩa), mục "Attempt 3" của brief, WP2_RECHECK_A3 cùng bằng chứng, kết quả và danh sách bằng chứng của WP2-FIXB3, bản ghi WP2-GATE4, và các mục trên bảng (chỉ đọc, để lấy model và ID tác giả).
  3. Kiểm tra độc lập:
     - `npm ci` và `npm run verify` có truy vết deprecation.
     - 13 tệp test vùng A được nhắm tới, cộng thêm tệp đồng thời (concurrency) chạy ba lần nữa.
     - Các spec trình duyệt admin, isolation và OT-leave trên cả hai project.
     - Các probe dùng lại nguyên vẹn làm lượt hồi quy nhanh: holiday preview (lần 1), A2 admin differential, payroll-exception differential (lần 2), ledger/privacy, supplement, và cuộc đua đa tiến trình với 220 vòng production.
     - Preflight của gói bằng Python của quy trình.
- **Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:**

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; digest `git ls-tree`; `scripts/source-digest.mjs` (thư mục dự án) | 5fafeae = origin/main; e61fa914…14df (613 tệp); exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 gọi bằng đường dẫn đầy đủ) | 144 gói; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify`, lần chạy 1 | typecheck, lint, 32 tệp / 613 test và build đạt. Smoke dừng ở "built server starts" với một top-level await không kết thúc; exit 13. Một tiến trình khác đang giữ cổng smoke mặc định 3100 (xem WP2-A4-01). | `03a-verify-run1-smoke-port-collision.txt` |
| Tái tạo: một listener HTTP đơn giản trên cổng 3198, rồi `SMOKE_PORT=3198 node scripts/smoke-built-server.mjs` | cùng dấu hiệu, exit 13. Nguyên nhân của lần chạy 1 là do môi trường. | `03b-smoke-port-collision-repro.txt`, `probes/occupy-port.mjs.txt` |
| `SMOKE_PORT=3197 NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify`, lần chạy 2 | typecheck, lint, 32 tệp / 613 test, build, SMOKE PASSED; không có đầu ra deprecation (khớp duy nhất là dòng lệnh được in lại); exit 0 | `03-verify.txt` |
| vitest trên 13 tệp vùng A; concurrency ×3; payroll-exceptions, holiday-import và zoneOracle dạng verbose | 13 tệp / 267 test; 8/8 ba lần; payroll-exceptions 13/13; holiday-import 29/29; zoneOracle 6/6; exit 0 | `04-targeted-tests.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, dist đã build) | 24 đạt trên cả hai project; exit 0 | `05-e2e-admin-isolation-ot-leave.txt` |
| `node pr-race.mjs <clone> <work> 10` (probe lần 1, 4 tiến trình OS, một tệp WAL) | 220 vòng production, 0 vi phạm; đối chứng không an toàn đặt trùng 10/10; integrity ok; exit 0 | `06-probe-multiprocess-race.txt` |
| `node pa-ledger-privacy.mjs` (probe lần 1) | 119 đạt / 0 lỗi; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (probe lần 1) | 6 / 0; S6 và S7 không đổi; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` (probe lần 1) | không suy ra được gì, không ghi gì; giống hệt lần 2; exit 0 | `10-probe-holiday-preview-privacy.txt` |
| `node pg2-admin-differential.mjs` (probe A2) | 25 / 0; 27/27 giống hệt; exit 0 | `13-probe-admin-differential.txt` |
| `node pe-payroll-differential.mjs` (probe lần 2) | 20 / 0; 30/30 giống hệt; exit 0 | `16-probe-payroll-differential.txt` |
| Quét `git diff` / `git grep` | xem tệp | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest (clone và dự án) | không đổi 5fafeae / e61fa914…14df; exit 0 | `12-digest-after.txt` |
| Python quy trình `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |
| cùng các validator sau khi ghi báo cáo này, kết quả trong brief và bằng chứng; cổng precommit trên index của clone chỉ với đầu ra của nhiệm vụ này được stage | xem tệp | `14b-preflight-after-writes.txt`, `15-precommit-check.txt` |

- **Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:** không có phát hiện chặn và không có lỗi vùng A. Một quan sát tùy chọn:
  - **WP2-A4-01 | Info (độ bền của công cụ; cải tiến tùy chọn; không chặn; có từ trước, nằm ngoài khoảng và ngoài vùng A) | `scripts/smoke-built-server.mjs:11,102-112`.**
    - Tái hiện: `03a` (trong lần chạy thật) và `03b` (tái tạo bằng một listener trên cổng smoke).
    - Mong đợi/thực tế: khi một tiến trình khác đã lắng nghe trên cổng smoke (mặc định 3100), vòng kiểm tra health ở dòng 105-107 chấp nhận câu trả lời của listener lạ. Máy chủ được spawn không bind được cổng và không ghi gì ra stdout. Khi đó `await firstLine` ở dòng 112 không bao giờ kết thúc, và Node kết thúc với exit 13 ("unsettled top-level await") mà không có dòng FAIL nêu nguyên nhân. Chạy hai cuộc kiểm toán cùng lúc trên một máy khiến điều này dễ xảy ra.
    - Quy tắc: AGENTS.md quy tắc 5 (kết quả ghi lại phải là thật). Gate không đạt sai, vì mã thoát khác 0, nhưng lỗi trông giống một lỗi của sản phẩm.
    - Thay đổi bắt buộc: không có cho WP2. Tùy chọn cho một nhiệm vụ công cụ sau này: chọn một cổng trống, như `tests/e2e/fixtures.ts` đã làm, hoặc dừng sớm khi tiến trình con phát `exit` hay `error`, kèm stderr của nó. Trong lúc chờ, một lần chạy đồng thời có thể đặt `SMOKE_PORT`.
- **Hành vi đã kiểm (không thấy lỗi):**
  1. **Delta không chạm đường dẫn nào của vùng A** (`11` §1-3, 8-11). Các thành phần máy chủ nhìn thấy được đều không đổi. Thay đổi phía client chỉ là stylesheet. Oracle là helper chỉ dùng cho test và không import mã sản phẩm.
  2. **WP2-A2-02 vẫn đã được giải quyết** (`16`, `04`, `05`):
     - `admin.ts:169-171` vẫn trả 201 chỉ với `{payroll_exception}`.
     - Differential: 10 yêu cầu payroll-exception và 20 lượt đọc admin sau đó giống hệt từng byte giữa thế giới không có timesheet của nhân viên và thế giới có (30/30, P1). Mọi 201 có đúng một khóa `payroll_exception` (P3) và chỉ các trường của lịch (P4). Không phản hồi admin nào chứa "refreshed", `pay_period_id` hay ID nhân viên (P5).
     - Các dòng đã lưu thực sự được làm mới trong W1 (S1). W0 không có dòng đã lưu nào (S2).
     - 409 `period_finalized` cho kỳ đã chốt được giữ (F1). Nó không ghi gì (F2), chỉ mang ngày của kỳ (F3), và giống hệt nhau khi có một hay hai timesheet đã chốt (F4).
     - Test hồi quy "answers the same success body whether or not employees have timesheets in the period (WP2-A2-02)" đạt (13/13), và test trình duyệt của màn hình payroll-exception cũng đạt trên cả hai project.
  3. **WP2-A-01 vẫn đã được giải quyết** (`10`, `13`, `04`):
     - Probe holiday-preview của lần 1 không suy ra ngày nào và không ghi gì (audit 12 → 12, phiên bản 1 → 1). Đầu ra giống hệt lần 2.
     - Differential A2: S0 và S1 cho 27/27 phản hồi admin giống hệt trước và sau khi hai nhân viên ghi dữ liệu. `finalized_conflicts` chỉ có `{date}` và ở cấp kỳ (F2, F3), và một so với hai timesheet đã chốt cho 27/27 phản hồi giống hệt (F1). Commit bị từ chối với 409 `finalized_period_affected` và chi tiết chỉ có ngày (F5), và hành vi commit C1-C6 không đổi.
     - Các test hồi quy đạt (holiday-import 29/29), kể cả "answers identically whether or not employees have day entries on the affected dates (WP2-A-01)". Test trình duyệt "an admin cannot open employee data through any admin screen" cũng đạt trên cả hai project.
  4. **Không có hồi quy vùng A:**
     - Probe ledger/privacy 119/0 (`07`) và supplement 6/0 (`09`).
     - Cuộc đua: 220 vòng production với 0 vi phạm, và đối chứng đặt trùng 10/10 (`06`). Phần này bao phủ AC-03, R-05 và R-06.
     - Test nhắm tới: 267 đạt (`04`). Spec trình duyệt: 24 đạt (`05`).
     - `npm run verify` exit 0, không có đầu ra deprecation (`03`). Preflight PASS (`14`).
- **Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:**
  - R1 (Info, không đổi): nhánh trùng lặp của `postCorrection` bỏ qua `sourceRef`. S6 vẫn cho correction → `duplicate` so với credit → `source_key_conflict`, và `ledger.ts` không đổi. Không chặn.
  - R2 (Info, không đổi): ghi chú chính sách có khoảng trắng đầu trước `=` được xuất nguyên dạng (S7). `otEvidence.ts` không đổi. Không chặn.
  - R3 (Info, quyết định điều phối CALFIX, không đổi): 409 `calendar_in_use` (`users.ts:167`) cho biết một tài khoản có dữ liệu hay không. `users.ts` không đổi. Không chặn.
  - R4 (chuyển tiếp sang WP3, không đổi):
    - WP3 phải lưu và xử lý kết quả `pending` của correction và debit (cuộc đua vẫn cho `pending` ở R10-R12).
    - WP3 cũng phải bỏ số phút tạm tính khi chốt.
    - Cách diễn đạt lịch sử cho các bút toán do hệ thống tạo chỉ là vấn đề hình thức.
    - `ledger.ts` và `timesheets.ts` không đổi. Không chặn.
  - WP2-A3-01 (Info, hướng tới tương lai, không đổi): payload audit của `payroll_exception.create` (`calendars.ts:335-344`) giữ `refreshed_pay_period` và dòng đã lưu. Sự kiện không có chủ sở hữu. Lịch sử của admin và của nhân viên không liệt kê nó (S4, S5 trong `16`), và `history.ts:66` vẫn lọc theo `owner_user_id = ?`. Bất kỳ màn hình audit nào sau này mà quản trị viên xem được phải che nó. Không chặn.
  - ADV-A-05 (Info, backlog): không đổi.
  - Các tín hiệu thô đã được chấp nhận, không đổi và không phải lỗi: 409 `period_finalized` cho kỳ đã chốt và `finalized_conflicts` ở cấp kỳ.
  - WP2-A4-01 ở trên (công cụ, tùy chọn).
  - Các token CSS và hành vi fold của oracle thuộc vùng B; WP2-AUDIT-B4 kiểm tra lại chúng.
- **Gate chưa chạy/bị chặn và lý do:**
  - Không có trong vùng A.
  - Không chạy theo thiết kế:
    - Probe nâng cấp WP1 → WP2: khoảng thay đổi không đổi mã migration hay lưu trữ, và WP2-GATE4 đã chạy lại việc nâng cấp migration.
    - Toàn bộ bộ e2e: WP2-GATE4 chạy 74 đạt và 2 bỏ qua. Vùng B bao phủ các luồng khác.
    - Đối chứng trên các commit cũ hơn: các probe không đổi và độ nhạy của chúng đã được chứng minh ở lần 1 và lần 2. Delta này không đổi mã máy chủ, nên một đối chứng không thêm thông tin.
    - Các đường dẫn WP3/WP4: chốt timesheet, PDF, chữ ký, email, triển khai.
  - Lần chạy verify 1 chỉ lỗi ở cổng smoke. Lần chạy 2 trên cổng trống đã đạt, và cả hai lần chạy đều được giữ.
- **Xử lý phát hiện trước:**
  - WP2-A-01: vẫn đã sửa trên 5fafeae.
  - WP2-A2-02: vẫn đã sửa. Câu trả lời giống hệt khi có hay không có timesheet của nhân viên, và 409 cho kỳ đã chốt được giữ.
  - WP2-A2-01: đã sửa trong mã tại a3d1b65 và không đổi từ đó. `WP2_HANDOFF.md:41` vẫn để lại cho bước nghiệm thu.
  - WP2-A3-01, R1–R4 và ADV-A-05: vẫn không chặn.
- **Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:**
  - Mức sẵn sàng phần mềm: vùng A của WP2 đạt trên 5fafeae / e61fa914. Nghiệm thu gói còn cần WP2-AUDIT-B4.
  - Quyền của chủ sở hữu cho việc gửi thật hoặc triển khai: không yêu cầu và không được cấp.
  - Kết quả thí điểm: không có.
- **Một bước/prompt tiếp:** bộ điều phối ghi PASS này lên bảng. Khi WP2-AUDIT-B4 cũng đạt, bộ điều phối giao bước nghiệm thu WP2. Bước đó sửa `WP2_HANDOFF.md:41` và có thể đưa WP2-A3-01 và WP2-A4-01 vào backlog.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:**
  - Rà soát: WP2-AUDIT-A2 lần 3; người rà soát `afb3d9a9fc9587b29` (bảng). Người rà soát lần 1 là `a09f7f19da91a5f11` và lần 2 là `a4b3acc53273ed5e2`, đều là agent khác.
  - Tác giả bản sửa được rà soát (bảng): WP2-FIXB3 `a33c20fa0f60a68da`. Các tác giả sửa trước là WP2-FIXA `aa3af6ddfb57e0a19`, WP2-FIXB `afdfdb7208db48436` và WP2-FIXB2 `a908ddae97aaffe5a`.
  - Các tác giả WP2 trước đó, như liệt kê trong WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Người commit (WP2-FIXB3-FREEZE `aadc0ad71deea6050`), người xác minh (WP2-GATE4 `a99b6f7545d1ec005`) và người lập kế hoạch không được coi là tác giả.
- **Context mới; xác nhận reviewer không viết thay đổi:** ngữ cảnh mới. Người rà soát không tạo thay đổi nào trong WP2 và không viết rà soát WP2 nào trước đó, và không sửa mã nguồn. Mọi báo cáo nhiệm vụ được coi là một tuyên bố và được chạy lại hoặc kiểm bằng probe. Cây được theo dõi của clone vẫn sạch.
- **Digest trước/sau; bằng chứng gate snapshot đó:**
  - Digest `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` và HEAD `5fafeae` trước và sau (`01`, `12`).
  - Gate: WP2-GATE4 (`handoff/delivery/evidence/WP2-GATE4/`), người xác minh PASS trên cùng commit và digest.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP2_RECHECK_A4.md` và `.vi.md` là tệp mới. WP2_REVIEW_A, WP2_RECHECK_A, WP2_RECHECK_A3 và các thư mục bằng chứng của chúng (`WP2-AUDIT-A/`, `WP2-AUDIT-A2/`, `WP2-AUDIT-A2-a2/`) không bị đụng đến. Bằng chứng: `handoff/delivery/evidence/WP2-AUDIT-A2-a3/`.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:**
  - WP2-A-01, WP2-A2-01 (mã) và WP2-A2-02: đã đóng.
  - WP2-A3-01 (Info): không chặn, một ghi chú backlog cho bất kỳ màn hình audit admin nào sau này.
  - WP2-A4-01 (Info): không chặn, một cải tiến công cụ tùy chọn cho script smoke.
  - R1–R4 và ADV-A-05: không chặn.
  - Vùng A không cần nhiệm vụ sửa nào.
