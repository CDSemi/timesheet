# Review độc lập

- Giai đoạn/ngày/reviewer và model/effort quan sát được: GOV (thay đổi governance: câu phạm vi và gate WP3 trong prompt WP3); 2026-10-05 (UTC); task GOV-WP3P-AUDIT lần 1, reviewer agent `aa78670760adbe556` (theo board); model tự báo `claude-opus-5-5`; effort yêu cầu xhigh trên board, effort thật không quan sát được. Tác giả được kiểm, worker WP3-DOC `a3f90533c00057935`, dùng `claude-sonnet-5-5` (board, tự báo), nên model reviewer không yếu hơn.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: `da6d0cdd2d20b6ffabb18f4cfaf7d8ad72951c0d` (GOV-WP3P-FREEZE, bằng `freeze_commit` của GOV-WP3P-GATE, `origin/main` và `git ls-remote origin refs/heads/main`); commit cha `cb9800e4cfef57786c2e69bb4fd78d245ab5c817`. Source digest `4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f` (679 file, không tính handoff/), bằng giá trị kỳ vọng, trước và sau. Không có commit chưa push. Thay đổi trong working tree chỉ nằm dưới handoff/delivery/ (board, cặp checkpoint, brief và bằng chứng GOV-WP3P); các path governance và docs bằng commit freeze.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS**.
- Phạm vi thật đã xem/chạy:
  1. Phản chiếu và trung thành: câu phạm vi (dòng 17) và gate (dòng 21) của WP3_IMPLEMENT và câu gate của WP3_REVIEW (dòng 17), EN và VI, so từng byte với docs/09 dòng 33 và 37 (EN và VI) tại commit freeze và với bản trước (`git show cb9800e:<path>`). Sau đó đối chiếu với quyết định của chủ ngày 2026-10-04 trong docs/10 (dòng 123–135) và `owner_decisions` của board (chỉ đọc), cùng docs/01, 02, 03, 04, 05 và 06, nơi các quyết định đó được ghi.
  2. EN/VI tương đương cho từng mệnh đề thêm.
  3. Governance: mọi dòng đổi của bốn file prompt; danh sách path governance của docs/08 trên commit; AGENTS.md quy tắc 1, 3, 4, 6, 8, 13 và docs/08.
  4. Độ phủ gate: từng mục gate WP3 bắt buộc trong từng dòng gate của bốn file, và mệnh đề gate cũ được giữ nguyên văn.
  5. `validate_orchestration.py`, `check_recovery.py` và `validate_package.py --preflight` bằng Python workflow (Python 3.12.14).
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`, `git status --porcelain`, `git rev-parse origin/main`, `git ls-remote origin refs/heads/main` | HEAD da6d0cd = origin = remote; thay đổi chỉ dưới handoff/delivery/; exit 0 | `evidence/GOV-WP3P-AUDIT/before.txt` |
| `git ls-tree -r … HEAD \| grep -v '^handoff/' \| LC_ALL=C sort \| sha256sum`; `npm run digest` (Node 24.21.0 theo đường dẫn đầy đủ) | 4d4c4863…078f (679 file) cả hai; exit 0 | `before.txt`, `after.txt` |
| `git diff --name-status cb9800e da6d0cd`; ngoài handoff/delivery/ | chỉ bốn file prompt WP3; exit 0 | `gov-paths.txt` |
| `git diff --name-only cb9800e da6d0cd \| grep -E '<các path governance khác của docs/08>'` | không khớp; exit 1 | `gov-paths.txt` |
| `git diff --check cb9800e da6d0cd` | không có output; exit 0 | `gov-paths.txt` |
| `git diff --quiet da6d0cd -- handoff/prompts docs handoff/templates AGENTS.md CLAUDE.md .claude .agents` | exit 0 (working tree bằng commit freeze) | `gov-paths.txt` |
| `git grep` tìm chữ cũ "pending-review disclosure / pending review remains visible / auto-sign" trong prompt, template, docs/09 | không khớp; exit 1 | `gov-paths.txt` |
| `git grep -l 'auto-image on/off\|ảnh tự động bật/tắt'` ngoài handoff/delivery | chỉ docs/09 EN/VI và bốn prompt (không có bản gate khác); exit 0 | `gov-paths.txt` |
| `<workflow-python> mirror-check.py <project> da6d0cd cb9800e` | 6 × MATCH (phạm vi và gate, EN và VI, bằng docs/09:33/37); chỉ dòng 17/21 và 17 đổi; chỉ chèn thêm; exit 0 | `mirror.txt`, `mirror-check.py.txt` |
| `<workflow-python> gate-coverage.py <project> da6d0cd cb9800e` | đủ 13 mục trong cả bốn dòng gate; mệnh đề cũ giữ nguyên văn; exit 0 | `gate-coverage.txt`, `gate-coverage.py.txt` |
| `<workflow-python> handoff/delivery/validate_orchestration.py` | PASS, 9 profile, 133 task, 1 đang chạy; exit 0 | `validate-orchestration.txt` |
| `<workflow-python> handoff/delivery/check_recovery.py` | PASS, count 82, board không bị sửa; exit 0 | `check-recovery.txt` |
| `<workflow-python> handoff/delivery/validate_package.py --preflight` | PASS, 58 cặp dịch, 1078 link cục bộ, 91 kịch bản; exit 0 | `preflight.txt` |
| Đọc: tương đương EN/VI và bảng quyết định của chủ | xem các bảng | `analysis.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi: **Không có lỗi chứng minh được.** Những gì đã kiểm:
  - Phạm vi 1 (phản chiếu và trung thành). Bỏ nhãn ("Scope: ", "Required gate: ", "Phạm vi: ", "Gate bắt buộc: ") thì mỗi câu trong sáu câu giống từng byte với docs/09 dòng 33 hoặc 37 cùng ngôn ngữ. So với bản trước, thay đổi chỉ chèn thêm chữ. Câu phạm vi thêm "Add owner-granted timesheet sharing with per-item toggles and the admin status boundary." Gate thêm "; AC-16, the automatic note line and image options, outgoing automatic submissions without an automatic indicator, empty-period automatic submission and admin status without timesheet details" sau "both Sundays". Không bỏ gì. Mỗi mệnh đề thêm đều truy được về một quyết định đã ghi của chủ và văn bản chuẩn của nó: F-1 về AC-07; F-Q1/F-Q2 và G-Q1 về AC-07, docs/05:24 và D-09; F-3/F-Q3 về docs/01:37, docs/03:34 và AC-01; F-3/F-Q4/F-Q5 về FR-17, docs/03:31 và AC-16. F-5 đã được AC-10 phủ trong "AC-06–AC-10". Không mệnh đề nào nêu yêu cầu không có trong tài liệu chuẩn hay trong các quyết định, nên quy tắc 8 được tôn trọng.
  - Phạm vi 2 (EN/VI). Mọi mệnh đề thêm có cùng nghĩa trong tiếng Việt (bảng B trong `analysis.txt`). Các dòng VI giống từng byte với docs/09.vi.
  - Phạm vi 3 (governance). Trong mỗi file chỉ các dòng phạm vi/gate đổi, số dòng giữ như trước. Các dòng Operator, Read, checkpoint, giao nộp, Ranh giới task và Ranh giới audit giống từng byte với bản trước. Không path governance nào khác của docs/08 đổi trong commit. "All sending stays dry-run/capture." vẫn là câu cuối, đúng với AGENTS quy tắc 3, 6 và docs/08. Không có gì chạm tới vai trò, định tuyến, thẩm quyền hay quy tắc commit, và không có gì mâu thuẫn với AGENTS.md hay docs/08 (xem R1 về quy tắc 4).
  - Phạm vi 4 (độ phủ gate). Mỗi dòng gate vẫn nêu AC-06–AC-10 và AC-14, race đến hạn/tay, ảnh tự động bật/tắt, gửi gián đoạn/chưa rõ, job trùng, tải riêng, bằng chứng PDF gồm hai Chủ nhật và chỉ dry-run/capture. Mỗi dòng nay nêu thêm AC-16, dòng ghi chú và tùy chọn ảnh, bản tự nộp gửi đi không có dấu hiệu tự động, tự nộp kỳ chưa có dữ liệu và ranh giới tình trạng cho admin. Điều này đúng ở cả bốn file.
  - Phạm vi 5 (validator). Cả ba exit 0.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R1 (thông tin): AGENTS quy tắc 4 viết "Enforce ownership on all data/file actions. Keep PDFs, signatures and tokens private." Phạm vi mới thêm chia sẻ do chủ cấp, có thể gồm tải PDF đã chốt. Đây không phải mâu thuẫn. Quyền vẫn do chủ quyết và được kiểm ở mỗi thao tác ("ownership or an active grant of sufficient scope", docs/03:38). File ảnh chữ ký và token không bao giờ được chia sẻ (AC-16), còn PDF vẫn riêng tư, không công khai. Tùy chọn, cho một thay đổi GOV sau: thêm "or an owner-granted share item" vào quy tắc 4 (EN và VI) để tránh đọc hiểu theo nghĩa đen.
  - R2 (thấp, có từ trước, không do thay đổi này): cả docs/09:37 lẫn gate phản chiếu đều không nêu F-2 (dòng khoản thiếu chờ, docs/02:56), F-4 (một mốc kích hoạt, docs/05:26) hay cách hiển thị {SignOffStatus} theo G-Q2 (docs/04:52). Chúng thuộc các mục phạm vi đã có "deficit choices" và "activation boundary" và các tài liệu trong danh sách Đọc của prompt, và gate trước đây cũng không nêu chúng. Cả người triển khai lẫn auditor WP3 đều không nên bỏ qua việc kiểm chúng. Tùy chọn: nêu chúng trong một lần sửa docs/09 sau và phản chiếu lần sửa đó qua một vòng GOV.
  - R3 (thông tin, trau chuốt bản dịch): VI "tình trạng admin không có chi tiết timesheet" có thể bị đọc thành "tình trạng của chính admin". Dòng phạm vi VI ("ranh giới tình trạng cho admin") làm rõ nghĩa, và chữ này phản chiếu nguyên văn docs/09.vi:37. Tùy chọn: sửa thành "tình trạng cho admin …" trong docs/09.vi trước, rồi tới prompt.
  - R4 (thông tin): WP3-REQ2 mục 22 bảo "nối thêm" mệnh đề gate. Tác giả đặt nó trước "All sending stays dry-run/capture." và ghi đây là sai lệch. docs/09 và prompt giống nhau, câu dry-run vẫn đứng cuối và không bị điều kiện hóa, nên không cần làm gì.
  - R5 (thông tin): danh sách Đọc của prompt không có docs/01 (FR-17) và docs/10 (quyết định của chủ). Quy tắc chia sẻ và admin có trong docs/03, 04, 05 và 06, đều đã nằm trong danh sách. Không cần làm gì.
- Gate chưa chạy/bị chặn và lý do: không bỏ kiểm bắt buộc nào. Không chạy lại `npm run verify` vì brief này không yêu cầu và digest không đổi; GOV-WP3P-GATE đã ghi exit 0 trên cùng digest và commit.
- Xử lý phát hiện trước: không có. Đây là audit đầu tiên của thay đổi governance này.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: đây chỉ là review governance. Nó không khẳng định sẵn sàng phần mềm, không cho phép gửi thật hay triển khai, và không báo kết quả pilot.
- Một bước/prompt tiếp: coordinator ghi GOV-WP3P-AUDIT PASS (reviewed_commit da6d0cd) và để timesheet-committer commit bản ghi nghiệm thu; R1–R3 có thể vào backlog governance.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [GOV_WP3P_REVIEW.md](GOV_WP3P_REVIEW.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: GOV-WP3P-AUDIT lần 1; reviewer `aa78670760adbe556`; tác giả WP3-DOC `a3f90533c00057935` (đã viết bốn chỗ sửa prompt). Người commit GOV-WP3P-FREEZE và verifier GOV-WP3P-GATE không được tính là tác giả; coordinator chỉ viết brief.
- Context mới; xác nhận reviewer không viết thay đổi: context mới; reviewer không viết thay đổi nào trong snapshot được kiểm. Báo cáo của tác giả và gate được coi là lời khẳng định và đã chạy lại.
- Digest trước/sau; bằng chứng gate snapshot đó: 4d4c4863cd6b61d63236927d5c77c6ea132edcf8d8d940789ecb61904918078f trước và sau, HEAD da6d0cd trước và sau. Bằng chứng gate: `handoff/delivery/evidence/GOV-WP3P-GATE/checks.txt` (PASS, freeze_commit da6d0cd).
- Path report mới giữ lịch sử review trước: `handoff/delivery/GOV_WP3P_REVIEW.md` và `.vi.md` (file mới); các review trước giữ nguyên. Bằng chứng: `handoff/delivery/evidence/GOV-WP3P-AUDIT/`.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không cần sửa. R1–R3 là tùy chọn; R4 và R5 không cần làm gì.
