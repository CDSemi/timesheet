# Checkpoint khôi phục: cho Ingat triển khai được ứng dụng (T0, T8)

Bản tiếng Anh là bản gốc: [INGAT_T0_T8_CHECKPOINT.md](INGAT_T0_T8_CHECKPOINT.md).

- Gói đang làm và vai trò: nhánh phụ "Ingat triển khai được" (T0: `ingat.toml` + job
  validate; T8: workflow dựng image và đẩy lên GHCR), do phiên Ingat yêu cầu cho cổng
  thoát M1 của Ingat. Điều phối: phiên này (vai timesheet-coordinator, model
  claude-opus-5-5).
- Đường dẫn; commit; digest; tệp chưa commit; commit chưa push: worktree
  `.claude/worktrees/relaxed-lalande-8359f0`, nhánh `claude/relaxed-lalande-8359f0`, HEAD
  `2bce0ab5842b80c710f23496d5173c122319e5c7` (= `main` lúc bắt đầu). Ảnh chụp được chấp
  nhận: chín tệp trong `evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt`, digest nguồn
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 tệp). Đã commit
  thành `6173f07777d3a972db77208390df86a5f7de1a11` và push lên `main` (fast-forward); các
  hồ sơ sau đó nằm trong commit INGAT-T0T8-RECORD.
- Phạm vi đã xong:
  - INGAT-T0T8-PLAN xong: bản nháp của chủ dự án không qua `ingat validate` (thiếu
    `expect_labels`); các lỗi khác của bản nháp (tag image cục bộ thay vì tên GHCR,
    `log_snapshot`, `TRUSTED_PROXY_ADDRESSES` bắt buộc, đường dẫn máy chủ trong câu
    pause, danh sách forbidden, mẫu số giờ phiên, khóa build không dùng) đã sửa; Compose
    và Dockerfile giữ nguyên; S15: Node.js v24.21.0 trên glibc, hỗ trợ chính thức cho
    kernel 4.4 là không (Tier 1 từ 4.18), rủi ro thực tế chưa kiểm.
  - INGAT-T0T8-IMPL xong: `ingat.toml`, `.github/workflows/ingat-validate.yml`,
    `.github/workflows/image.yml`, ADR 0002 EN/VI, một đoạn trong docs/07 EN/VI, một câu
    trong docs/11 EN/VI.
  - INGAT-T0T8-GATE PASS; INGAT-T0T8-AUDIT FIX REQUIRED (F1-F3, mức thấp, câu chữ và bằng
    chứng); INGAT-T0T8-FIX1 xong (chú thích, câu chữ, che chín dòng bằng chứng không liên
    quan: worker báo mười, lần kiểm lại đếm được chín); INGAT-T0T8-REGATE1 PASS;
    INGAT-T0T8-RECHECK1 PASS (auditor mới, `INGAT_T0_T8_RECHECK1.vi.md`).
  - Nhánh phụ được chấp nhận trên danh tính nêu trên (cổng kiểm và audit kiểm lại mới
    trên cùng ảnh chụp).
- Lệnh kiểm tra chạy gần nhất: RECHECK1 chạy `ingat validate` với
  `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`
  đúng dạng CI trên worktree và trên một bản export sạch: exit 0, "the app's settings file
  (ingat.toml) is valid"; actionlint exit 0.
- Đang sửa dở: không.
- Việc và cổng còn lại: không còn cho phần mềm. Hai workflow đã chạy trên GitHub và thành
  công (xem dưới). Còn phía chủ dự án: chế độ hiển thị package, máy chủ đích, spike S15
  của Ingat.
- Commit và push (2026-10-22): phiên yêu cầu đã bỏ điều kiện không push, chuyển lời chủ
  dự án "Đồng ý cho phiên timesheet commit và đẩy T0, T8 lên main của repo timesheet theo
  quy tắc của repo đó, rồi theo dõi CI build ảnh." Theo quy tắc thường trực của docs/08,
  INGAT-T0T8-COMMIT (timesheet-committer, sonnet) commit trên nhánh worktree và push
  `HEAD:refs/heads/main` dạng fast-forward (dừng nếu `origin/main` đã đổi). Checkout
  chính không bị đụng tới; `main` cục bộ của nó chậm hơn `origin/main` và cần
  `git merge --ff-only origin/main` trước lần commit kế tiếp ở đó. Sau đó INGAT-T0T8-CI
  (verifier) theo dõi hai workflow và kiểm tag GHCR, rồi một commit chỉ chứa hồ sơ
  `handoff/`.
- Vướng mắc hoặc dừng do hạn mức: không còn. Lệnh giao commit/push đầu tiên bị bộ kiểm
  quyền của client từ chối (lời đồng ý chuyển tiếp); đã giải quyết nhờ chủ dự án xác nhận
  trực tiếp trong phiên này.
- Quyết định và quy tắc giữ nguyên:
  - Cho tới khi chủ dự án xác nhận trực tiếp, thay đổi được để chưa commit (bên yêu cầu
    đã cấm push). Danh tính ảnh chụp đã audit là HEAD cộng danh sách SHA-256; committer
    đã chứng minh chín tệp được commit khớp danh sách đó.
  - `ORCHESTRATION.json` đang chạy thuộc coordinator ở checkout chính (vòng UX5). Nhánh
    phụ này không sửa bảng, STATE hay NEXT_ACTION; coordinator chính ghi các task của nó
    (INGAT-T0T8-PLAN, -IMPL, -GATE, -AUDIT, -FIX1, -REGATE1, -RECHECK1, -COMMIT, -CI,
    -RECORD) lên bảng. Lần push đã đổi cây của `main`, nên cổng kiểm kế tiếp của
    coordinator chính sẽ bao gồm nó.
  - Repository công khai: không ghi giá trị của máy chủ vào tệp được theo dõi; không đổi
    runtime khi chưa hỏi chủ dự án.
  - Tùy chọn, chưa làm: O1-O4 của lần kiểm lại (câu chữ) và R2-R5, R8, R9 của lần review
    đầu.
- Đầu vào để tiếp tục: các brief và phần Results, hai bản review.
- Việc tiếp theo: các bước của chủ dự án. (1) Chuyển package `ghcr.io/cdsemi/timesheet`
  sang Public (Package settings, Danger Zone; không đảo ngược được; tổ chức phải cho phép
  package public). (2) Sau đó kéo ẩn danh theo digest và đọc hai nhãn. (3) Ở checkout
  chính, chạy `git merge --ff-only origin/main` trước lần commit kế tiếp (`main` cục bộ
  đang chậm hơn `origin/main`). (4) Ghi các task INGAT-T0T8 lên bảng. Actions và quyền
  `packages: write` đã hoạt động (lần chạy image thành công).
- Prompt tương ứng: `handoff/prompts/ORCHESTRATE.md` (vai trò và cổng), với các điểm
  lệch của nhánh phụ nêu trên.

## Khôi phục điều phối

- Mã task, trạng thái phụ thuộc: bảy task của chuỗi review, INGAT-T0T8-COMMIT và
  INGAT-T0T8-CI đã xong; INGAT-T0T8-RECORD commit các hồ sơ này. Diễn biến:
  INGAT-T0T8-COMMIT bị chặn (lần 1 chưa hề bắt đầu: bộ kiểm quyền của client từ chối
  chính lệnh giao việc, lý do "[Instruction Poisoning]", vì lời đồng ý được chuyển qua
  phiên khác chứ không phải chủ dự án gõ ở đây; không có gì được stage, commit hay push).
  Sau đó chủ dự án xác nhận trực tiếp trong phiên này (nguyên văn): "Tôi xác nhận: phiên
  này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*) rồi push lên main của
  CDSemi/timesheet. Đây là repo công khai, và lần push này sẽ chạy workflow đẩy image lên
  GHCR." INGAT-T0T8-COMMIT xong (timesheet-committer mới, sonnet): lần 1 dừng ở
  `git diff --cached --check` (hai dòng trống cuối `tasks/INGAT-T0T8-PLAN.md`; coordinator
  đã xoá, Addendum 1); lần 2 commit `6173f07777d3a972db77208390df86a5f7de1a11` trên nhánh
  worktree (198 đường dẫn) và push dạng fast-forward lên `main`; `origin/main` =
  `6173f07`; `refs/heads/main` cục bộ vẫn ở `2bce0ab`. Chín hash khớp trước và sau;
  precommit, `diff --check`, preflight exit 0; quét bí mật: chỉ có setup token đã che.
  INGAT-T0T8-CI xong, PASS (lần 1, timesheet-verifier, sonnet; API công khai không xác
  thực, 3 request): với `6173f07` cả hai lần chạy đều thành công, `ingat-validate`
  (https://github.com/CDSemi/timesheet/actions/runs/39884811892) và `image`
  (https://github.com/CDSemi/timesheet/actions/runs/39884811864), kể cả bước "build, push
  and check the image", bước này đẩy `ghcr.io/cdsemi/timesheet:<commit>` và chỉ đạt khi
  image kéo về là linux/amd64, user 10001:10001, revision = commit, version =
  `package.json`. Yêu cầu token GHCR ẩn danh trả HTTP 401: package vẫn private, nên chưa
  đọc được digest và nhãn từ bên ngoài. INGAT-T0T8-RECORD (timesheet-committer, sonnet)
  commit các hồ sơ này (chỉ `handoff/`) và push lên `main`; kết quả của chính nó nằm
  trong brief của nó.
- Mã phiên coordinator/subagent, cấu hình yêu cầu/thực tế và số lần: planner, worker và
  verifier yêu cầu sonnet, tự báo claude-sonnet-5-5; hai auditor yêu cầu opus, tự báo
  claude-opus-5-5; mỗi task lần 1.
- Tệp được giao, brief/kết quả/bằng chứng: `handoff/delivery/tasks/INGAT-T0T8-*.md`;
  `handoff/delivery/evidence/INGAT-T0T8-*/`; `INGAT_T0_T8_REVIEW.md`,
  `INGAT_T0_T8_RECHECK1.md` (mỗi tệp có `.vi.md`); thư mục task
  `D:\.claude-tmp\timesheet\INGAT-T0T8-*` (log thô, ngoài repository).
- Tiến trình đang chạy hoặc lệnh chưa rõ kết thúc: không có báo cáo nào.
- Digest đã kiểm gần nhất; verifier/audit còn chờ và kết luận: `47e8036bdcfd…a033`;
  REGATE1 PASS, RECHECK1 PASS; CI PASS trên `6173f07`.
- Tiếp tục agent cùng phiên hoặc đầu vào cho task thay thế: không cần.
- Hạn mức/thời điểm reset: không quan sát được.
- Một việc tiếp theo: chủ dự án chuyển package GHCR sang Public.
