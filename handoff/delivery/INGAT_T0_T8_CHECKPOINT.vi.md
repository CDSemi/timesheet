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

## Việc tiếp theo: dọn GHCR (GC)

- Yêu cầu của chủ dự án (2026-10-22, trong phiên này, nguyên văn): "Thêm 1 job dọn định kỳ
  xóa các phiên bản cũ, nhưng chỉ xóa các bản ko phải bản release. các bản release nếu
  muốn xóa thì cần phải xóa bằng tay".
- Chưa commit lúc bắt đầu: phần Results của `tasks/INGAT-T0T8-RECORD.md` và
  `evidence/INGAT-T0T8-RECORD/` (ghi sau commit hồ sơ `70dce2a`).
- INGAT-GC-PLAN xong (lần 1, timesheet-planner, tự báo claude-sonnet-5-5;
  `tasks/INGAT-GC-PLAN.md`, `evidence/INGAT-GC-PLAN/`): bản release = commit có git tag;
  một phiên bản chỉ bị xoá khi mọi tag của nó là SHA commit, không tag nào là commit có
  git tag, nằm ngoài 20 bản mới nhất và cũ hơn 30 ngày; mức sàn 10 / 7 ngày, tối đa 50 bản
  mỗi lần chạy, xoá bản cũ nhất trước; mặc định chạy thử; nhóm concurrency riêng; script
  `scripts/ghcr-cleanup.ts` có test offline; ADR 0003 mới. Chưa chạy: tsc, eslint, vitest
  thật, mọi lệnh gọi GitHub. Rủi ro còn lại: một commit không có tag, cũ hơn 30 ngày, mà
  Ingat vẫn cần để restore bản sao lưu, sẽ mất image trên registry.
- Quyết định của chủ dự án (2026-10-22, trong phiên này, nguyên văn): "D1. theo đề xuất /
  D2. Giữ 20 bản mới nhất và mọi bản dưới 30 ngày, không giới hạn số lượng mỗi lần xoá /
  D3. Xóa thật luôn (nhưng theo quy tắc D2 thì làm gì có bản nào hơn 30 ngày để mà xóa) /
  yes, lên main". Nghĩa là: D1 tag git nào cũng đánh dấu bản release; D2 giữ 20 bản mới
  nhất và mọi bản dưới 30 ngày, không giới hạn số bản xoá mỗi lần; D3 lịch chạy xoá thật
  ngay từ lần đầu (không có cổng `GHCR_CLEANUP_APPLY`); sau khi audit PASS thì commit và
  push lên `main`. D4 vẫn để ngỏ (chỉ khi lần xoá thật đầu tiên trả 403; trong lúc chờ
  không dùng token cá nhân).
- INGAT-GC-IMPL xong (lần 1, timesheet-worker-high, tự báo claude-sonnet-5-5): 15 tệp
  (`evidence/INGAT-GC-IMPL/snapshot-sha256.txt`), digest `1d004a9a…dfa0` (882 tệp); worker
  báo 26 test của job dọn, typecheck, lint, `npm test`, `npm run verify` exit 0 trong bản
  export sạch, bắt được năm đột biến, actionlint sạch. Lỡ quy tắc chạy: hai lần pipe `ls`
  vào `head` (chỉ để liệt kê).
- INGAT-GC-GATE lần 1 xong, FAIL (tự báo claude-sonnet-5-5): mọi mục đạt trên danh tính
  không đổi, trừ mục 6: bỏ dòng chặn "không bao giờ xoá hết mọi bản"
  (`scripts/ghcr-cleanup.ts:139`, lớp phòng thủ thêm mà mức sàn khiến luồng thường không
  chạm tới) thì cả 26 test vẫn đạt.
- INGAT-GC-FIX1 đang chạy (lần 1, timesheet-worker, model yêu cầu sonnet, không ghi đè;
  routing S/M/no; addresses_gate INGAT-GC-GATE): thêm test gọi thẳng vào dòng chặn đó (và
  vào bước kiểm ở dòng 136 nếu chưa có test). Xong (tự báo claude-sonnet-5-5): export
  `assertSafe`, thêm ba test, cả bảy đột biến giờ đều bị bắt (theo báo cáo worker); digest
  `e47e6344…ee56`, danh sách `evidence/INGAT-GC-FIX1/snapshot-sha256.txt`.
- INGAT-GC-REGATE1 xong, PASS (lần 1, timesheet-verifier, sonnet, cổng kiểm đầy đủ) trên
  digest `e47e6344…ee56`: script chỉ khác ở `export`; test job dọn 29, `npm test` 2374,
  smoke của verify đạt; cả bảy đột biến bị bắt; actionlint, ghim SHA, parity, preflight,
  riêng tư.
- INGAT-GC-AUDIT xong, PASS (lần 1, timesheet-auditor, tự báo claude-opus-5-5, ngữ cảnh
  mới; `INGAT_GC_REVIEW.vi.md`): danh tính khớp đầu và cuối; chạy lại mọi bước kiểm; 17
  phép thử đột biến riêng (13 bị bắt, 2 lỗ hổng test, 2 tương đương); không có đường nào
  xoá một bản được bảo vệ. Gợi ý tùy chọn O1-O9 (ví dụ ADR 0002 vẫn nói chưa có gì chạy
  trên GitHub; ghi rõ hơn nghĩa vụ gắn tag và dẫn Ingat; dùng phiên bản API mới hơn; hai
  lỗ hổng test; `assertSafe` không kiểm lại quy tắc tuổi). Lần chạy thật đầu tiên chưa
  diễn ra, theo thiết kế.
- INGAT-GC-COMMIT xong (lần 1, timesheet-committer, tự báo claude-sonnet-5-5; chủ dự án
  "yes, lên main"): commit `782cddabae6260a87c600936daf0408eebb17f56` (286 tệp: 15 tệp
  nguồn, 12 tệp handoff, 7 thư mục bằng chứng), push dạng fast-forward lên `main`;
  `origin/main` = `782cdda`; 15 hash khớp HEAD; digest không đổi `e47e6344…ee56`; mọi bước
  kiểm exit 0. Kết quả kiểm nằm trong `evidence/INGAT-GC-COMMIT/checks.txt` (chưa theo
  dõi).
- INGAT-GC-CI xong, PASS (lần 1, timesheet-light, tự báo claude-haiku-5-5; 7 request API
  công khai): `782cdda` ingat-validate run 39909592535 success, image run 39909592540
  success; `70dce2a` ingat-validate run 39885375736 success, image run 39885375744
  success; workflow `image-cleanup` (id 393702719) đã đăng ký, trạng thái active. Nó chưa
  chạy lần nào (chỉ chạy theo lịch hoặc khi bấm tay).
- INGAT-GC-RECORD xong (timesheet-committer, sonnet): commit
  `01c4cdcb5abefad41ec9f8431752eab76f4d2c4a` (9 đường dẫn handoff), push dạng fast-forward
  lên `main`. Chưa commit: `evidence/INGAT-GC-RECORD/`.

## Đồng bộ với checkout chính (2026-10-23)

- Chủ dự án (trong phiên này): agent của dự án timesheet báo lệch commit; chủ dự án muốn
  mọi thứ được đồng bộ và push trước khi bên nào làm tiếp, và hai agent phối hợp với nhau.
- Bên này không push thêm cho tới khi thống nhất cách làm (`origin/main` đứng ở `01c4cdc`
  về phía bên này).
- INGAT-SYNC-RECON xong (lần 1, timesheet-planner, tự báo claude-sonnet-5-5, chỉ đọc;
  `tasks/INGAT-SYNC-RECON.md`): `main` cục bộ `7aafa21` (WP5-UX5-FIX2, chưa push) đi trước
  1 và chậm 2 commit so với `origin/main` `01c4cdc`, rẽ nhánh từ `70dce2a`; không có tệp
  chung; `git merge-tree` sạch; không có merge hay rebase dở. Coordinator của checkout
  chính (phiên `95755b87…`) đã thêm hai mục chưa commit vào cặp checkpoint này trong
  checkout chính ("Structural audit of `ingat.toml`" và "Design review of the manifest
  format") đúng chỗ `782cdda`/`01c4cdc` thêm mục của mình, nên lệnh
  `git merge --ff-only origin/main` của nó (quyết định ngày 2026-10-23 của chủ dự án)
  không chạy được.
- Cách làm đề xuất (cần chủ dự án duyệt một merge commit, thay quyết định "chỉ
  fast-forward, không merge commit" trên bảng cho riêng lần đồng bộ này):
  0. coordinator bên kia ngừng mọi lệnh git ghi và mọi chỉnh sửa cặp tệp này trong
     checkout chính cho tới bước 4;
  1. bên này commit và push các hồ sơ còn lại (fast-forward);
  2. một verifier kiểm đúng cây sau khi gộp (`git merge-tree` của `origin/main` mới và
     `7aafa21`, archive ra rồi chạy `npm ci` và `npm run verify`);
  3. committer bên này tạo merge commit trong worktree (`git merge --no-ff
     refs/heads/main`), kiểm cây của nó trùng cây đã kiểm, rồi push dạng fast-forward lên
     `origin/main`;
  4. coordinator bên kia lưu hai mục của nó, khôi phục cặp tệp, chạy
     `git merge --ff-only origin/main`, thêm lại hai mục sau các mục của bên này, commit
     các tệp review INGAT chưa theo dõi và bản cập nhật bảng (ghi các task INGAT), rồi push.
- 2026-10-23: chủ dự án đã chuyển lời yêu cầu tạm dừng; bên kia đang tạm dừng (chủ dự
  án, nguyên văn: "Bên kia hiện đang tạm dừng, ko chạy gì cả"). Bước 1 INGAT-SYNC-RECORD
  (timesheet-committer, sonnet) commit các hồ sơ này dạng fast-forward. Tiếp theo là bước 2
  (verifier kiểm cây sau khi gộp). Bước 3, merge commit, chờ chủ dự án duyệt rõ ràng.
- Bước 1 xong: INGAT-SYNC-RECORD commit `db8793967b6967fbe0f62c6e97d9039ffe4f39fe` (15
  đường dẫn handoff) và push dạng fast-forward; `origin/main` = `db87939`. Committer ghi
  nhận tên tài khoản hệ điều hành trong `evidence/INGAT-SYNC-RECON/recon2.txt` (đã có sẵn
  trong 14 tệp công khai trước đó; precommit vẫn đạt): một việc riêng tư cần chủ dự án
  xem sau.
- Chủ dự án duyệt bước 3 (2026-10-23, trong phiên này, nguyên văn): "nếu ko có gì xung
  đột thì merge đi, nếu có xung đột thì bạn tự giải quyết nếu đc, nếu ko đc thì chỉ rõ để
  tôi hiểu mà biết đường quyết định".
- Bước 2 INGAT-SYNC-GATE xong, PASS (lần 1, timesheet-verifier, sonnet): cây sau khi gộp
  T = `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`, không xung đột; typecheck, lint,
  `npm test` (2374/2374), `npm run verify`, `ingat validate` đã ghim và actionlint exit 0
  trên T.
- Bước 3 INGAT-SYNC-MERGE lần 1 dừng: `git merge` đã ghi các tệp gộp vào thư mục làm
  việc, rồi lỗi "unable to write .git/worktrees/relaxed-lalande-8359f0/index" (exit 128).
  Không có `MERGE_HEAD`, HEAD vẫn `db87939`, chưa commit hay push gì, không dọn hay reset
  gì; thư mục làm việc đang chứa các tệp của 7aafa21 dưới dạng thay đổi chưa stage.
- Bước 3 lần 2 đang chạy (timesheet-committer mới, sonnet; Addendum 1 của brief): dựng
  merge commit M từ cây đã kiểm T bằng `git commit-tree` (cha `db87939`, `7aafa21`), kiểm
  qua một index tạm nằm ngoài Dropbox, rồi dựng commit hồ sơ R trên M, và push R dạng
  fast-forward. Index và nhánh của worktree giữ nguyên (cục bộ bị cũ; mọi thứ trong đó sẽ
  có trên `origin`).
- Lần 2 xong (tự báo claude-sonnet-5-5): M = `b8bae505cdd546b29c48389219dd263fd670662b`
  (cây T, cha `db87939`, `7aafa21`); R = `377554e024db1669e47fd19eeadaf9dccc672b3e` (hồ sơ
  trên M); lần push đầu lỗi HTTP 408, lần thử lại là fast-forward, exit 0; `origin/main` =
  R; `7aafa21` là tổ tiên của R. Worktree giữ nguyên (HEAD `db87939`, các tệp của lần
  merge lỗi vẫn chưa stage).
- INGAT-SYNC-CHECK xong, PASS (timesheet-light, tự báo claude-haiku-5-5; chỉ đọc):
  `origin/main` = ls-remote = R `377554e`; M có cây T, cha `db87939`, `7aafa21`; R chỉ có
  một cha là M; M..R = 24 đường dẫn, đều trong `handoff/delivery/`; `7aafa21` và `db87939`
  là tổ tiên của `origin/main`; HEAD của checkout chính vẫn là `7aafa21`.
- INGAT-SYNC-RECORD2 (timesheet-committer, sonnet) commit các hồ sơ cuối này trên R bằng
  index tạm và push dạng fast-forward. Sau đó bên này không push gì thêm; worktree của bên
  này đã cũ (HEAD `db87939`, các tệp của lần merge lỗi chưa stage) và không chứa gì mà
  `origin` chưa có, nên chủ dự án có thể xoá nó.
- Bước 4, coordinator bên kia (chủ dự án chuyển lời): lưu hai mục của nó trong cặp tệp
  này, khôi phục cặp tệp, `git fetch`, `git merge --ff-only origin/main`, thêm lại hai mục,
  commit các tệp review INGAT chưa theo dõi và bản cập nhật bảng (ghi các task INGAT),
  rồi push.
- INGAT-SYNC-RECORD2: lần 1 dừng ở precommit (email danh tính commit trong
  `evidence/INGAT-SYNC-CHECK/02-M.txt` và `03-R.txt`); INGAT-SYNC-MASK đã thay các dòng đó.
  Lần 2 (cùng agent) qua mọi bước kiểm (19 đường dẫn, precommit PASS, cây `6ac74e7c…`)
  nhưng bộ kiểm quyền của client từ chối lệnh `commit-tree` và push, lý do "[PII Data
  Handling]". Không tạo hay push gì. Không lách; không giao lại cho agent đó cùng hành
  động. `origin/main` vẫn là `377554e`, đã chứa merge; chỉ các hồ sơ cuối này chưa lên
  GitHub.
- Chủ dự án (2026-10-23, nguyên văn): "Tôi xác nhận cho commit và push các tệp hồ sơ
  handoff/delivery/**/INGAT-SYNC* và cặp INGAT_T0_T8_CHECKPOINT lên main; các dòng email đã
  được che." INGAT-SYNC-RECORD2 lần 3 chạy với một committer mới (Addendum 2 của brief),
  trong lúc coordinator bên kia vẫn tạm dừng.
- Việc của chủ dự án cho job dọn: không cần gì để bắt đầu (lịch chạy xoá thật ngay từ lần
  đầu, và trước khoảng 2026-11-21 không có bản nào cũ hơn 30 ngày). Nếu lần chạy lịch đầu
  tiên lỗi 403, kiểm vai trò "Manage Actions access" của `CDSemi/timesheet` trên package
  (D4 vẫn để ngỏ). `main` cục bộ ở checkout chính giờ chậm hơn `origin/main` ba commit
  (chạy `git merge --ff-only origin/main` ở đó).
