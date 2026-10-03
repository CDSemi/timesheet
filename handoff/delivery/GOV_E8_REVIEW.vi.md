# Review độc lập

- Giai đoạn/ngày/reviewer và model/effort quan sát được: GOV (thay đổi quản trị cho quyết định E-8 của chủ cùng bản sửa harness check_recovery.py); 2026-10-03 (UTC); task GOV-E8-AUDIT lần 1, reviewer agent `a85143055ae40e81c`; model tự báo `claude-opus-5-5`; board yêu cầu effort xhigh, effort thực tế không quan sát được. Các tác giả được kiểm dùng `claude-sonnet-5-5`, nên model của reviewer không yếu hơn.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: `ed92cb7a59d1b26dbea0df7cfb6fb6b870f06ec2` (GOV-E8-FREEZE2, trùng `origin/main` và `git ls-remote origin refs/heads/main`); source digest `7586ba0821899960e24879ffacb435132edb9ab3e243be5a0a5bfb459290ec2f` (539 file, không gồm handoff/), trùng digest của GOV-E8-GATE2. Không có commit chưa push. Thay đổi trong working tree chỉ nằm dưới handoff/ (board, báo cáo task, bằng chứng). Khoảng quản trị `f7b9f8e3f07b68e636da54ba589b286fa59561b8..ed92cb7`.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS**.
- Phạm vi thật đã xem/chạy:
  1. Mục "Unified Frontend & UI/UX Standards" của AGENTS.md và AGENTS.vi.md, đối chiếu với quyết định E-8 của chủ (`owner_decisions` trên board, 2026-10-03), mục "Visual standard" của docs/04 (EN/VI) và E-8 trong docs/10 (EN/VI); so từng dòng EN/VI đã đổi.
  2. check_recovery.py cũ (393779d) và mới (ed92cb7): so khớp chính xác phần thân probe, có tính khoảng trắng; tên và thứ tự probe lấy từ lần chạy thật; chạy trong bản sao scratch với live board ở các giai đoạn hoạt động WP1 đến WP5; hai mutant để thử probe hồi quy; một probe về trường live còn phụ thuộc.
  3. Các governance path đổi trong khoảng (danh sách governance path của docs/08), kiểm bằng git.
  4. `validate_orchestration.py`, `check_recovery.py` và `validate_package.py --preflight` bằng workflow Python ghi trong run-validation.ps1 (Python 3.12.14).
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`, `git status --short`, `node --version`, `npm run digest` (trước) | HEAD ed92cb7; v24.21.0; digest 7586ba08…290ec2f (539 file); exit 0 | `evidence/GOV-E8-AUDIT/before.txt` |
| `git diff --name-only f7b9f8e ed92cb7 -- <governance path của docs/08>` | chỉ AGENTS.md, AGENTS.vi.md, handoff/delivery/check_recovery.py; exit 0 | `gov-paths.txt` |
| `git diff --name-only 393779d ed92cb7` | FREEZE2 chỉ đổi path dưới handoff/ | `gov-paths.txt` |
| `git diff --check f7b9f8e ed92cb7` | không có output; exit 0 | `gov-paths.txt` |
| `git grep -i 'tailwind\|brandkit\|P8000\|P9000\|product card\|product/platform\|thẻ sản phẩm\|duration-300\|transition-all\|utility class'` trong AGENTS/CLAUDE (EN/VI) | không khớp; exit 1 | `wording.txt` |
| `git grep -i 'tailwind\|brandkit\|P8000\|P9000'` trong docs/, handoff/prompts, handoff/templates, .claude/agents, package.json, src/ | không khớp; exit 1 | `wording.txt` |
| `git grep 'CSS custom propert\|4px\|300 ?ms\|ease-out'` trong AGENTS, docs/04, docs/10 (EN/VI) | câu chữ bắt buộc có trong cả sáu file; exit 0 | `wording.txt` |
| `<workflow-python> handoff/delivery/check_recovery.py` | PASS, count 82, đúng một "current board is valid"; exit 0 | `check-recovery.txt` |
| `<workflow-python> handoff/delivery/validate_orchestration.py` | PASS, 9 profile, 36 task, 1 đang chạy; exit 0 | `validate-orchestration.txt` |
| `<workflow-python> handoff/delivery/validate_package.py --preflight` | PASS, 47 cặp, 740 link, 91 kịch bản; exit 0 | `preflight.txt` |
| `probe-body-diff.py` (probe cấp cao nhất bản cũ so với thân suite() bản mới, bỏ thụt 4) | 4 hunk, đều đúng dự kiến; cũ 313 dòng, mới 312 | `probe-body-diff.txt` |
| `probe-experiments.py` (chỉ bản sao scratch) | bản cũ trên live board WP2: exit 1 "Running task outside active package" (tái hiện GOV-E8-GATE); bản cũ trong điều kiện thời WP1: 81; bản mới: 82 trên live WP2, trên board WP1 tối giản và trên task live ở WP3/WP4/WP5, tên giống hệt; các mutant đều bị bắt | `probe-experiments.txt` |
| `probe-residual-status.py` (scratch) | suite PASS khi status live là running/paused_usage/blocked; FAIL ngay probe đầu khi là software_ready | `probe-residual-status.txt` |
| digest sau (cùng các lệnh như lúc trước) | không đổi | `after.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **Không có lỗi chứng minh được.** Chi tiết đã kiểm:
  - E-8 (phạm vi 1–2). Mục 1 nay nêu `src/client/styles.css` (CSS custom properties) và chỉ cho thêm giá trị mới dưới dạng CSS custom property. Hình khối gắn với một custom property bán kính 4px. Đổ bóng áp dụng cho "thẻ (card) và panel". Chuyển động dùng `transition: all 300ms ease-out` cho hover/active/focus của nút bấm và liên kết, qua một custom property dùng chung. Không còn tham chiếu Tailwind, brandkit hay thẻ sản phẩm P8000/P9000 trong AGENTS hay CLAUDE (EN/VI), docs/, prompts, templates, profile, package.json hay src/. Tiêu đề, phạm vi C&D Semi, việc phối hợp ba skill (`stitch-design-taste`, `design-taste-frontend`, `high-end-visual-design`), mục 2, ý định bo góc nhỏ, đổ bóng mịn và tương tác vi mô cùng giọng điệu bán dẫn B2B đều được giữ. Các dòng EN và VI đã đổi tương đương nhau. Nội dung này khớp mục "Visual standard" của docs/04 (CSS custom properties thuần trong `src/client/styles.css`, bo góc 4px, 300 ms ease-out cho hover/active/focus, mật độ cao, ưu tiên mobile) và E-8 của docs/10 ở cả hai ngôn ngữ.
  - check_recovery.py (phạm vi 2). Phép so khớp chính xác phần thân chỉ cho thấy bốn thay đổi. (a) Probe chấp nhận live board được đưa ra khỏi suite và vẫn gọi `module.validate(real_board, live_state, configured)` như trước. (b) "WP2 blocked by unresolved WP1" thành "next package blocked by unresolved base package". Probe này nay chạy trên board và STATE tổng hợp, với phase của giai đoạn nền đặt rõ là `failed`; nhánh `== "passed"` của validator và phép assert câu báo lỗi không đổi. Probe cũ phụ thuộc STATE live. (c) Probe về task đang chạy ở giai đoạn không hoạt động dùng `NEXT_PACKAGE` thay cho chuỗi "WP2" cố định. (d) Task tổng hợp, `active_package` của board và STATE nay theo `BASE`. Thân của 78 probe còn lại trong suite giống hệt, chỉ khác thụt lề. Tên probe: 80 giữ nguyên thứ tự, 1 đổi tên, 1 thêm mới; số lượng tăng từ 81 lên 82. Đúng một probe dùng live board ("current board is valid", chạy đầu tiên). Probe hồi quy chạy lại toàn bộ 80 probe của suite với nền WP3 và assert tên giống hệt. Probe này có ý nghĩa: mutant khôi phục lỗi gốc (task mặc định "WP1") hỏng trong lần chạy lại WP3 (traceback ở dòng 426), còn mutant kế thừa giai đoạn hoạt động của live board hỏng với "Board/package summary disagree".
  - Governance path (phạm vi 3): chỉ AGENTS.md, AGENTS.vi.md và handoff/delivery/check_recovery.py đổi. Các thay đổi khác ngoài handoff/ (docs/02/03/04/10 và reference/fixtures, EN/VI) không phải governance path; audit của giai đoạn WP2 sẽ kiểm chúng.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R1 (thấp, tiềm ẩn, ngoài tiêu chí của brief này): board tổng hợp vẫn kế thừa các trường nhiệm vụ live khác `active_package`, như `status`, `coordinator_runtime` và `checkpoint`. Đã tái hiện trong scratch: khi live board chuyển sang `software_ready`, `suite()` hỏng ngay probe đầu với "Ready mission still has active work". Hôm nay status live là `running`, nên phép kiểm vẫn đạt. Cách sửa có phạm vi cho một task GOV sau, trước khi đổi trạng thái cuối của nhiệm vụ: đặt `status="running"` (và cố định `coordinator_runtime`) trong `synthetic()`, rồi thêm một probe thay đổi status live.
  - R2 (thấp, có từ trước, không thuộc khoảng): mục 2 của AGENTS.vi.md thiếu "mobile-first default" và "(clean padding/gap)" của bản tiếng Anh. Các gạch đầu dòng VI "Hình khối/Đổ bóng/Chuyển động" lồng vào mục 3, còn bản EN bắt đầu ở cột 0. Đây là chỉnh bản dịch tùy chọn; docs/04 VI đã có "ưu tiên mobile".
  - R3 (thông tin, phạm vi WP2): `src/client/styles.css` vẫn dùng bo góc 8px, 6px và 999px, chưa có custom property cho bán kính hay transition. WP2-T09 triển khai chuẩn hình ảnh, và audit WP2 nên kiểm việc này, kể cả việc hình viên thuốc 999px có hợp với "tránh hình khối ngẫu hứng/vui nhộn" hay không.
  - R4 (thông tin): cụm `4px / rounded` giữ nguyên câu chữ của chủ. "rounded" gợi tên một class Tailwind, nhưng câu đã gắn nó với một CSS custom property 4px, nên không tạo xung đột.
- Gate chưa chạy/bị chặn và lý do: không bỏ phép kiểm bắt buộc nào. Không chạy lại `npm run verify` vì brief quản trị này không yêu cầu; GOV-E8-GATE2 đã ghi exit 0 trên cùng digest.
- Xử lý phát hiện trước: GOV-E8-GATE FAIL ("Running task outside active package") đã được giải quyết. Audit đã tái hiện lỗi bằng script cũ trên live board WP2, và script mới đạt ở mọi giai đoạn hoạt động từ WP1 đến WP5.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: đây chỉ là review quản trị. Review không khẳng định sẵn sàng phần mềm, không cấp phép của chủ cho gửi thật hay triển khai, và không báo kết quả pilot.
- Một bước/prompt tiếp: coordinator ghi GOV-E8-AUDIT PASS (reviewed_commit ed92cb7) và để timesheet-committer commit các bản ghi nghiệm thu. Tùy chọn: lập một task GOV nhỏ cho R1 trước khi nhiệm vụ đạt `software_ready`.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [GOV_E8_REVIEW.md](GOV_E8_REVIEW.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: GOV-E8-AUDIT lần 1; reviewer `a85143055ae40e81c`; tác giả GOV-E8-FIX `aa102ee05d1b8af38`, WP2-DEC `a6b907acae4ca9c63` và GOV-E8-FIX2 `aab35502b4e6ccfdb`. Committer GOV-E8-FREEZE `ae9c8ea666ed77551`, GOV-E8-FREEZE2 `a213ba9e9b84b50f6` và verifier GOV-E8-GATE2 `a4534ceda7b8a9994` không được tính là tác giả.
- Context mới; xác nhận reviewer không viết thay đổi: context mới; reviewer không viết thay đổi nào trong snapshot được kiểm. Báo cáo của tác giả chỉ được coi là lời khẳng định và đã được chạy lại.
- Digest trước/sau; bằng chứng gate snapshot đó: 7586ba0821899960e24879ffacb435132edb9ab3e243be5a0a5bfb459290ec2f trước và sau, HEAD ed92cb7 trước và sau. Bằng chứng gate: `handoff/delivery/evidence/GOV-E8-GATE2/` (PASS, freeze_commit ed92cb7).
- Path report mới giữ lịch sử review trước: `handoff/delivery/GOV_E8_REVIEW.md` và `.vi.md` (file mới); các review trước không bị đụng tới. Bằng chứng: `handoff/delivery/evidence/GOV-E8-AUDIT/`.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không cần sửa. R1 là task GOV tùy chọn sau này; R2 là chỉnh bản dịch tùy chọn; R3 thuộc audit của WP2-T09; R4 không cần làm gì.
