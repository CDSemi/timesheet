# Kiểm lại độc lập quy trình: các phát hiện của WF-AUDIT trên commit sửa quản trị

Lập theo [REVIEW](../templates/REVIEW.vi.md). Bản dịch của [WORKFLOW_RECHECK.md](WORKFLOW_RECHECK.md); tiếng Anh là nguồn chuẩn. Hồ sơ task: [WF-AUDIT2](tasks/WF-AUDIT2.md). Các phát hiện được kiểm lại: [WORKFLOW_REVIEW](WORKFLOW_REVIEW.vi.md) (WF-A-01..WF-A-10).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** package GOV trên board. Kiểm ngày 2026-10-03 UTC (2026-10-02 America/Los_Angeles). Subagent `timesheet-auditor` context mới. Model tự báo `claude-opus-5-5`; không quan sát được effort. Bộ công cụ khớp profile auditor.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** freeze commit `c219d79a2c202861b719473cdffb0efb59f14290` = `origin/main`; không có commit chưa push. Source digest `d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2` (532 file, không gồm `handoff/`). Digest giống nhau ở checkout Dropbox và ở bản clone tạm tại SHA đó, và bằng digest của WF-GATE2. Trước và sau audit không có gì ngoài `handoff/` bị đổi. Phạm vi kiểm: thay đổi quản trị cộng dồn `1a25275..c219d79`; commit sửa `fd77a87..c219d79` được đọc từng dòng. Source đủ.
- **Quyết định: FIX REQUIRED.** Cả ba phát hiện Medium đã được sửa, và probe gốc của chúng nay cho kết quả đúng yêu cầu. Sáu trong bảy phát hiện Low đã được sửa; với WF-A-09, evidence đã commit được hoãn rõ ràng bằng một quyết định có ghi lại. Mọi kiểm tra bắt buộc đều đạt. Còn ba mục Low mở mà chưa có quyết định hoãn: phần còn lại của WF-A-10 và hai phát hiện mới WF-R-01, WF-R-02. Theo brief, phát hiện Low còn mở cần được sửa hoặc có quyết định hoãn ghi lại thì mới PASS được. Không có phát hiện mới mức Medium hay High.

## Phạm vi thật đã xem/chạy

Đọc từ đĩa: AGENTS.md (đầu tiên), brief WF-AUDIT2, WORKFLOW_REVIEW cùng evidence của nó, và toàn bộ diff `fd77a87..c219d79`: chín profile, tài liệu 08 và 10 cùng bản dịch, RESUME (+vi), NEXT_ACTION (+vi), STATE, `validate_orchestration.py`, `check_recovery.py` và `precommit-check.mjs`. Đọc toàn văn thêm: validator, check_recovery và script precommit hiện tại, tài liệu 08 (EN và VI), ORCHESTRATE, FIX_FINDINGS, template REVIEW, board (bản working tree và bản đã commit), checkpoint, và báo cáo của WF-FIX1, WF-FREEZE2, WF-GATE2. Các báo cáo đó được coi là lời khẳng định cần kiểm. Source ứng dụng không đổi: `git diff 1a25275 c219d79 -- src tests package-lock.json skills-lock.json` rỗng, và package.json chỉ thêm script `precommit-check` ở fd77a87.

## Bảng bằng chứng

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD origin/main`; `npm run digest` (Node 24.21.0); trạng thái ngoài `handoff/`, trước audit | cả hai c219d79; d4d49149…29d2; không có | [0-identity-before](evidence/WF-AUDIT2/0-identity-before.txt) |
| validator và check_recovery trên board working tree | 1 / 1: "Unfinished dependency: WF-AUDIT2". WF-GATE2 đã có quyết định PASS nhưng trạng thái vẫn là `running` (quan sát 4) | [1-validator-recovery](evidence/WF-AUDIT2/1-validator-recovery.txt) |
| Clone tạm tại c219d79 (ngoài Dropbox, safe.directory theo từng tiến trình): digest, validator, check_recovery trên board đã commit | digest bằng nhau; 0 PASS (9 profile, 16 task); 0 PASS, 67 kiểm tra | [2-clone-validator-recovery](evidence/WF-AUDIT2/2-clone-validator-recovery.txt) |
| Probe riêng `3-probes.py` (24 board trong bộ nhớ dựng từ board thật) | lần 1: 21/24, do chính probe trỏ report tới file chưa có; lần 2: 24/24 đúng kỳ vọng, exit 0 | [3-probes.py](evidence/WF-AUDIT2/3-probes.py), [lần 1](evidence/WF-AUDIT2/3-probes-output-run1.txt), [lần 2](evidence/WF-AUDIT2/3-probes-output.txt) |
| `precommit-check.mjs --self-test` (checkout và clone); 22 probe tập stage trong clone | 0 / 0 (35 mẫu path, 59 mẫu dòng); 22/22 đúng kỳ vọng; clone sạch sau đó | [4-precommit](evidence/WF-AUDIT2/4-precommit-selftest-and-probes.txt), [script 5](evidence/WF-AUDIT2/5-precommit-probes.sh) |
| Giá trị secret có khoảng trắng, trong clone | 6 dạng có khoảng trắng exit 0; cùng giá trị không có khoảng trắng exit 1 | [script 5b](evidence/WF-AUDIT2/5b-spaced-secret-probes.sh), [kết quả 5b](evidence/WF-AUDIT2/5b-spaced-secret-probes.txt) |
| Quét riêng tư theo dải commit bằng luật của c219d79 | fd77a87..c219d79: 79 file, 0 phát hiện. 1a25275..c219d79: 152 file, 13 lần chặn profile-path đúng ở 7 file mà WF-A-09 đã liệt kê (đã hoãn) | [6-range-privacy](evidence/WF-AUDIT2/6-range-privacy.txt) |
| `npm ci`; `npm run lint` với `--trace-deprecation --pending-deprecation` (Node 24.21.0, clone) | 0; 0, không cảnh báo | [7-lint](evidence/WF-AUDIT2/7-lint.txt) |
| Chạy lại `2-probes.py` của WF-AUDIT với validator của c219d79 | probe 6 (tác giả tài liệu tự audit) nay bị từ chối, và probe 10b cho thấy EFFORTS không còn `max`. Probe 10 vẫn chấp nhận vì nó đưa `max` vào profile trong bộ nhớ và bỏ qua `parse_profile`; đường đi qua file thật thì từ chối (dòng kế) | [8-replay](evidence/WF-AUDIT2/8-replay-wf-audit-probes.txt) |
| Sửa thử file profile thật trong clone | `max` (expert, worker), `ultracode` và `fable` đều cho exit 1; profile nguyên vẹn cho 0 | [9-profile-tamper](evidence/WF-AUDIT2/9-profile-tamper.txt) |
| `validate_package.py --preflight` (Python của quy trình); `git diff --check 1a25275 c219d79`; phạm vi ngoài handoff | 0 (43 cặp, 532 link, 91 kịch bản); 0; chỉ 13 path quy trình | [10-preflight-diffcheck](evidence/WF-AUDIT2/10-preflight-diffcheck.txt) |
| Quan sát runtime và board | thân profile đã sửa được nạp; bản AGENTS.md được nạp vào context đã cũ; trạng thái board bị trễ | [11-observations](evidence/WF-AUDIT2/11-observations.txt) |
| Tìm câu chữ còn sót tại c219d79 | không còn "Sonnet/high" và "unless … in your context"; câu về gộp gate vẫn còn (WF-A-10) | [12-wording-grep](evidence/WF-AUDIT2/12-wording-grep.txt) |
| Định danh sau audit; quét riêng tư evidence của audit này và evidence gate/freeze chưa commit | xem phần Results của hồ sơ task | [13-identity-after](evidence/WF-AUDIT2/13-identity-after.txt) |

## Xử lý phát hiện trước (WF-A-01..WF-A-10)

| ID | Mức | Trạng thái | Căn cứ |
|---|---|---|---|
| WF-A-01 | Medium | Đã sửa | Tài liệu 08:26,30,32,36 (+vi) nêu một quy tắc duy nhất; profile auditor (dòng 25-26) không còn ngoại lệ fallback; validator (`validate_audits`) không còn bỏ qua `fallback_unavailable`; cụm "Sonnet/high" đã bỏ. Probe B1–B3 (auditor Sonnet `fallback_unavailable` kiểm tác giả sửa hoặc tác giả tài liệu dùng Opus, đang chạy hoặc đã xong) bị từ chối. B4 (mọi tác giả là Sonnet) được chấp nhận, đúng trường hợp quy tắc cho phép. B6: verifier không phải tác giả. |
| WF-A-02 | Medium | Đã sửa (xem WF-R-01) | Package `GOV` nằm ngoài `authorized_scope`; task GOV đang chạy được miễn kiểm tra; audit GOV đã xong cần `reviewed_commit` 40 hex (D1, D2); danh sách path quản trị nằm ở tài liệu 08:64 (+vi). Chạy lại probe 8 (D3): PASS của GOV vẫn hợp lệ sau khi digest đổi do sửa F-01. D4–D6: WP1-F01-FIX chỉ chạy khi WF-AUDIT2 PASS. Board đã chuyển mọi task WF-* sang GOV. |
| WF-A-03 | Medium | Đã sửa (xem WF-R-02) | Năm probe gốc (`SMTP_PASSWORD` không nháy, `api_token`, PNG chữ ký và PDF trong evidence, `/c/Users/<name>`) nay cho exit 1. Placeholder vẫn qua. Self-test có từng trường hợp. |
| WF-A-04 | Low | Đã sửa | Đã bỏ `max` khỏi EFFORTS; việc sửa thử file thật và E1/E2 đều bị từ chối. |
| WF-A-05 | Low | Đã sửa | Tác giả = mọi task không phải gate/audit/commit của package (attempt hiện tại và trước) cộng `author_agent_ids`. C1–C3 (tác giả tài liệu attempt 2 và 1, planner) bị từ chối khi `author_agent_ids` rỗng. |
| WF-A-06 | Low | Đã sửa | RESUME.md:5-11 và .vi:5-10 lấy trạng thái từ board và checkpoint và giao việc kiểm. Điều này khớp bước 1 của ORCHESTRATE và tài liệu 08:54. |
| WF-A-07 | Low | Đã sửa | Cả tám profile không phải coordinator đọc AGENTS.md từ đĩa, và tài liệu 08:34 (+vi) ghi tác dụng của restart. Bản được nạp vào context của auditor này đã cũ và việc đọc từ đĩa đã khắc phục (quan sát 3). |
| WF-A-08 | Low | Đã sửa | Profile committer (dòng 16-17) và tài liệu 08:74 (+vi) chốt Node 24. WF-FREEZE2 đã ghi `v24.21.0`. |
| WF-A-09 | Low | Đã sửa cho evidence mới; evidence đã commit được hoãn | Path hồ sơ người dùng nay bị chặn, và ngoại lệ che chỉ áp dụng cho log evidence đã stage. Quyết định hoãn việc che hồi tố được ghi ở docs/10:85 (+vi:86). 13 lần xuất hiện còn lại đúng là 7 file mà WF-A-09 đã liệt kê; dải sửa không thêm lần nào. |
| WF-A-10 | Low | Còn mở một phần | Tài liệu 08:62 định nghĩa snapshot cuối giai đoạn, và chuỗi trên board là FIX → FREEZE → GATE riêng → AUDIT → ACCEPT với hồ sơ task tiếng Anh. Mâu thuẫn ở các dòng NEXT_ACTION đã nêu vẫn còn (xem bảng dưới). |

## Phát hiện

| ID | Mức | File:dòng | Tái hiện / quan sát | Thay đổi cần làm |
|---|---|---|---|---|
| WF-A-10 (phần còn lại) | Low | handoff/NEXT_ACTION.md:33-34 (.vi:32); handoff/prompts/ORCHESTRATE.md:25-26 (.vi:23); handoff/prompts/FIX_FINDINGS.md:5 (.vi:5); `coordinator_decisions` trên board "S-size fix audits may include the gate" | 12-wording-grep: NEXT_ACTION vẫn cho audit F-01 chạy "gộp gate", và cả hai prompt cho mọi audit sửa cỡ S được gộp gate. Tài liệu 08:62 giới hạn `gate_included` cho sửa S-size trung gian và giữ gate riêng cho snapshot cuối giai đoạn, trong đó có recheck F-01. Board đã đúng khi có WP1-F01-GATE. | Sửa NEXT_ACTION (+vi) cho khớp board (state của coordinator; không cần chu trình GOV). Thêm điều kiện "sửa S-size trung gian" vào ORCHESTRATE và FIX_FINDINGS (+vi) (thay đổi quản trị), hoặc ghi quyết định hoãn ở docs/10 (+vi) nói rằng tài liệu 08 là chuẩn. Đánh dấu quyết định trên board là đã bị thay thế. |
| WF-R-01 | Low | handoff/delivery/validate_orchestration.py:252-258, 264-265, 283-291; docs/08:64 | Probe D9: một audit GOV PASS đã xong mà gate của nó có `freeze_commit` khác `reviewed_commit` của audit vẫn được chấp nhận. Gate và audit chỉ được ràng buộc bằng source digest, mà digest này không gồm `handoff/`, nơi chứa prompt, template, validator và check_recovery. Một bản sửa quản trị chỉ đụng `handoff/` (như câu chữ prompt của WF-A-10) giữ nguyên digest d4d49149…, nên WF-GATE2 cũ vẫn thỏa một audit mới. | Với audit GOV, yêu cầu có gate dependency mà `freeze_commit` bằng `reviewed_commit`, và thêm probe trong check_recovery. Nếu không thì ghi quyết định hoãn. |
| WF-R-02 | Low | scripts/precommit-check.mjs:17-20, 39; mẫu self-test `assign('password', 'two words here')` | 5b: secret theo dạng app password mà các nhà cung cấp SMTP phổ biến dùng (bốn nhóm bốn chữ cách nhau bằng khoảng trắng; chữ tổng hợp) lọt qua ở mọi dạng: YAML không nháy, nháy kép hoặc nháy đơn, env, `export`, và JSON. Cùng giá trị không có khoảng trắng thì bị chặn. WP4 cấu hình SMTP. | Chặn phép gán có tên secret mà giá trị khớp dạng có khoảng trắng đó, có nháy hay không, và thêm mẫu self-test. Nếu không thì ghi quyết định hoãn kèm lý do về rủi ro còn lại: file `.env` bị chặn theo path, và committer đọc diff. |

## Đánh giá các lựa chọn của coordinator

- **Allowlist chính xác `noreply@anthropic.com`: hợp lý.** Đây là một địa chỉ không mang tính cá nhân mà dòng ghi công bắt buộc phải có, được so khớp không phân biệt hoa thường trên toàn bộ chuỗi. P10, P11 và self-test chặn phần tên khác, tên miền khác và tên miền có đuôi thêm. P13 cho dòng trailer qua.
- **Heuristic secret không nháy (chữ số, ký hiệu hoặc từ 12 ký tự): chấp nhận được với vai trò heuristic.** Nó tránh bắt nhầm từ chỉ kiểu (P16 `password: required`) và bắt được secret sinh tự động điển hình (P1, P2, P7, P8). Các trường hợp lọt đã biết và chấp nhận được: giá trị chỉ có chữ dài 6–11 ký tự (L1, L2) và giá trị có dấu hai chấm (L3). Trường hợp giá trị có khoảng trắng là WF-R-02. Phần đầu script gọi đây là kiểm tra heuristic, và tài liệu 08:74 vẫn yêu cầu đọc diff.
- **Chặn path hồ sơ người dùng ở dòng thêm: hợp lý.** File source cũng bị chặn (P9). Ngoại lệ che chỉ áp dụng cho log evidence đã stage và chỉ phần tên tài khoản. Placeholder và tài khoản dùng chung được qua (P14). Path tài khoản thật bị chặn mà không bị in ra (R1). Giới hạn được chấp nhận: dạng thư mục bị biến đổi `C--Users-<name>` (L4).
- **Package GOV và danh sách path quản trị: hợp lý, còn một lỗ hổng ở validator (WF-R-01).** Có thể bổ sung: `.agents/` (bản skill cho Codex, gồm commit-message) và `docs/agents/`. PASS của GOV "chỉ bị thay thế bởi thay đổi quản trị sau đó", nhưng điều này vẫn chỉ là văn bản; validator không phát hiện được nếu không dùng git.
- **WF-FIX1 dùng `addresses_audit` thay cho dependency: đúng.** Theo ngữ nghĩa dependency của validator, dependency nghĩa là "đã đạt", nên phụ thuộc vào audit FIX REQUIRED bị từ chối (D7). Trường này giữ được khả năng truy vết. Nó chưa được ghi vào tài liệu và chưa được kiểm (D8 chấp nhận tham chiếu treo); đây là cải tiến tùy chọn.
- **Không viết lại evidence đã commit: đúng.** Chủ cấm viết lại lịch sử, và một commit che không xóa được tên khỏi lịch sử công khai. Quyết định hoãn đã được ghi ở docs/10 (+vi).
- **Chuỗi WP1-F01 lập lại: khớp tài liệu 08**, trừ câu chữ ở NEXT_ACTION và các prompt (WF-A-10).

## Rủi ro và cải tiến tùy chọn (không bắt buộc sửa)

- Board working tree sẽ không qua validator cho tới khi WF-GATE2 được đặt `done` (quan sát 4). Chưa có task commit nghiệm thu cho GOV, và WP1-F01-FIX phụ thuộc thẳng vào WF-AUDIT2. Các task WP1-F01-* đang chờ vẫn mang baseline fd77a87.
- File chưa commit `evidence/WF-GATE2/preflight-system-python.txt` chứa 7 path hồ sơ người dùng chưa được che. Commit nghiệm thu sẽ bị chặn cho tới khi committer che phần tên tài khoản như tài liệu 08 cho phép (quan sát 7).
- Ghi `addresses_audit` vào tài liệu 08 và kiểm rằng nó trỏ tới một audit có thật với kết quả FIX REQUIRED hoặc NOT VERIFIED.
- Model của các attempt trước không được ghi, nên một attempt Opus trước đó sẽ không nâng mức sàn độ mạnh. Tác giả không phải Claude được xếp hạng theo alias đã yêu cầu (chuyển tiếp từ WF-AUDIT).
- `mask()` in hai ký tự đầu của tên tài khoản. Audit đang chạy chỉ được kiểm việc tách tác giả khi đã xong (hành vi có từ trước thay đổi này).

## Gate chưa chạy/bị chặn và lý do

Không có kiểm tra bắt buộc nào bị bỏ qua. Không chạy lại `npm run verify`: source ứng dụng không đổi và WF-GATE2 đã chạy nó trên cùng digest. Validator và check_recovery trên board thật thất bại chỉ vì trạng thái board của coordinator bị trễ (quan sát 4); board đã commit thì đạt trong clone.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

Không đổi. WP1 là FIX REQUIRED với F-01 còn mở, và WP2 chưa bắt đầu. Không xin phép pilot của chủ; không gửi hay triển khai gì.

## Một bước tiếp

Coordinator đặt WF-GATE2 thành `done` và sửa NEXT_ACTION (+vi). Sau đó, với WF-A-10 (câu chữ prompt), WF-R-01 và WF-R-02, coordinator chọn một trong hai đường:

- một bản sửa GOV có giới hạn (ORCHESTRATE/FIX_FINDINGS +vi, ràng buộc commit GOV trong validator kèm probe, luật secret có khoảng trắng kèm mẫu self-test), tiếp theo là freeze commit, gate và một lần kiểm lại mới; hoặc
- ghi quyết định hoãn rõ ràng cho từng mục ở docs/10 (+vi), tiếp theo là một lần kiểm lại mới ngắn gọn các hồ sơ đó trên c219d79.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WF-AUDIT2 attempt 1; agent ID trên board `aace091e55c54c3b0`. Tác giả: `a232a5b7f6cdec442` (WF-REVIEW), `ae6c446dc434f85d6` (WF-IMPL-TOOLING), `afbd2f9ae6ec1fce3` và `ad742f3b42890d674` (WF-IMPL-DOCS), `a2a9ec20d51be6815` (WF-FIX1), tất cả là Sonnet 5.5. Auditor đầu tiên: `a80f8351bbd2fd196` (WF-AUDIT). Coordinator (Opus 5.5) chỉ ghi state và hồ sơ.
- Context mới; xác nhận reviewer không viết thay đổi: đã xác nhận. Auditor này chỉ ghi cặp báo cáo này, hồ sơ task WF-AUDIT2 và `evidence/WF-AUDIT2/`. Auditor không yếu hơn model tác giả mạnh nhất.
- Digest trước/sau; bằng chứng gate của snapshot đó: trước d4d49149…29d2; sau: xem 13-identity-after. WF-GATE2 PASS trên cùng commit và digest.
- Path report mới giữ lịch sử review trước: file mới; WORKFLOW_REVIEW và evidence của WF-AUDIT không đổi.
- Xử lý phát hiện và task sửa/kiểm lại tiếp của coordinator: xem "Một bước tiếp".
