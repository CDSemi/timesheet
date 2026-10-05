# Kiểm tra lại WP3 — khu vực A sau vòng sửa 3 (gắn lại digest)

Mẫu: [REVIEW](../templates/REVIEW.vi.md). Bản gốc tiếng Anh (có thẩm quyền): [WP3_RECHECK_A3.md](WP3_RECHECK_A3.md). Brief: [WP3-RECHECK-A](tasks/WP3-RECHECK-A.md), mục "Attempt 3 (coordinator note)", với phạm vi ở các mục 5–7 của [WP3-RECHECK-BC3](tasks/WP3-RECHECK-BC3.md). Các báo cáo khu vực A trước đó (giữ nguyên): [WP3_REVIEW_A](WP3_REVIEW_A.vi.md), [WP3_RECHECK_A](WP3_RECHECK_A.vi.md), [WP3_RECHECK_A2](WP3_RECHECK_A2.vi.md). Cùng lần audit này kiểm tra lại khu vực B và C: [WP3_RECHECK_BC3](WP3_RECHECK_BC3.vi.md). Bằng chứng: `evidence/WP3-RECHECK-BC3/` (đã che, LF; địa chỉ thư là `<email>`, tài khoản là `<user>`; mã probe `*.mjs.txt`); nhật ký lệnh [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP3, khu vực A, gắn lại digest sau vòng sửa 3 chỉ sửa test (task WP3-RECHECK-A, lần 3), 2026-10-05 (UTC). Người đánh giá: subagent Claude Code `timesheet-auditor`, agent `a4e5c209ddf7091f5` trên bảng, cũng là auditor mới của WP3-RECHECK-BC3. Tự báo model `claude-opus-5-5`; yêu cầu opus/xhigh; effort không quan sát được từ trong phiên. Model tác giả mạnh nhất của WP3 là opus. Tác giả vòng 3 (WP3-FIX3 `ab4bd2cde876c7ecb`), người commit (WP3-FIX3-FREEZE `aca480339f4624b19`) và người kiểm cổng (WP3-REGATE3 `a41152818099fb8d5`) chạy sonnet. Người đánh giá không yếu hơn. Người đánh giá không phải auditor của lần 1 hay lần 2 (`a6f4a505bd38d735e`, `a6dd03dfdd2f440e9`) và không phải auditor WP3 nào khác.
- **SHA commit được đánh giá và digest nguồn; commit chưa đẩy; độ đầy đủ của nguồn:** commit `49651c8bb91d56bf6c6966405257537ec7ca474b` (`freeze_commit` của WP3-REGATE3; `origin/main` là cùng commit). Ghi làm hai lệnh đầu tiên sau `node --version`: HEAD của thư mục dự án `49651c8…` và digest dạng `git ls-tree` `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` (trừ handoff/), bằng digest chính thức của regate. Bản clone riêng (tách rời tại `49651c8`) cho cùng digest bằng `scripts/source-digest.mjs` (721 tệp) và bằng `git ls-tree`. HEAD và digest lúc kết thúc không đổi (các dòng cuối của [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt)). Nguồn đầy đủ; không sửa mã nguồn nào. 3 tệp chưa theo dõi trong `.claude/skills/readme-md/` của thư mục dự án nằm ngoài bản freeze và không bị động tới.
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - Phần thay đổi `2d72d35..49651c8` chỉ chạm một tệp test và các bản ghi handoff.
  - Probe đua, HTTP và gợi ý đều qua lại trên bản freeze mới, với cùng kết quả như lần 2.
  - Các kết luận của lần 2 được giữ nguyên.
  - Không có phát hiện.
- **Phạm vi thực sự đã kiểm tra/chạy (mục 5–7 của brief):**
  - Mục 5:
    - `git diff --stat` và `--name-status 2d72d35 49651c8` ngoài handoff/ cho một đường dẫn, M `tests/integration/deadline.test.ts` (+65 −12).
    - Cùng diff đó trên `src`, `docs`, `scripts`, `package.json`, `package-lock.json`, cấu hình tsconfig, eslint, vite, vitest và playwright, `.gitattributes`, `.gitignore`, `.editorconfig`, `.npmrc`, AGENTS/CLAUDE, `.claude`, `.agents`, `reference` và README/DEVELOPMENT là rỗng.
    - Có 141 đường dẫn handoff thay đổi.
    - Diff test được đọc từng dòng trong lần kiểm tra lại BC3: thêm 4 test và không bỏ assertion nào.
  - Mục 6: probe đua (20 vòng × 4 tiến trình hệ điều hành, chạy hai lần), probe HTTP và probe gợi ý của lần 2. Các địa chỉ đã che được dựng lại lúc chạy; ngoài ra các probe giữ nguyên, trừ một dòng log thêm vào đường xử lý lỗi của probe HTTP. Chúng chạy trên mã production đã build của bản clone ở bản freeze.
  - Mục 7: từng kết luận của lần 2 được so với những gì phần thay đổi có thể chạm tới và với kết quả chạy lại.
- **Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `node --version` (bản portable, đường dẫn đầy đủ); `git rev-parse HEAD`; `git ls-tree … \| sha256sum` (thư mục dự án); `scripts/source-digest.mjs` và `git ls-tree` trong clone | `v24.21.0`; `49651c8…`; `c31c300c…ec72`; như vậy trong clone (721 tệp) | [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |
| `git diff 2d72d35 49651c8` ngoài handoff/; trên src, docs, scripts và cấu hình | một tệp test; rỗng | [17-delta.txt](evidence/WP3-RECHECK-BC3/17-delta.txt), [17b-test-diff.txt](evidence/WP3-RECHECK-BC3/17b-test-diff.txt) |
| `npm ci`; `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | exit 0; exit 0, 62 tệp / 1420 test, SMOKE PASSED với 40 dòng `PASS`, không có dòng deprecation | [01-npm-ci.txt](evidence/WP3-RECHECK-BC3/01-npm-ci.txt), [02-verify.txt](evidence/WP3-RECHECK-BC3/02-verify.txt) |
| `ROUNDS=20 node race-probe.mjs` (mỗi vòng: hai lần ký thủ công giống hệt và hai lượt `cli.js run-jobs` production, thành bốn tiến trình; sau đó hai lượt xả hàng đợi), chạy hai lần | exit 0 cả hai; thủ công thắng 11 / hạn chót thắng 9 / lỗi 0, rồi 9 / 11 / 0 | [10-race.txt](evidence/WP3-RECHECK-BC3/10-race.txt), [10b-race-rerun.txt](evidence/WP3-RECHECK-BC3/10b-race-rerun.txt) |
| `node http-probe.mjs` (server đã build, loopback, cổng do hệ điều hành chọn, `JOB_RUNNER=off`, capture) | lần 3: exit 0, HTTP PROBE PASSED, 84 PASS; lần 1: exit 1 vì lỗi truyền tải ở client của probe sau 25 PASS, 0 FAIL; lần 2: lỗi cú pháp của tôi, không khởi động | [12-http.txt](evidence/WP3-RECHECK-BC3/12-http.txt), [12a-http-earlier-runs.txt](evidence/WP3-RECHECK-BC3/12a-http-earlier-runs.txt) |
| `node hint-probe.mjs` | exit 0; HINT PROBE PASSED, 12 PASS | [13-hint.txt](evidence/WP3-RECHECK-BC3/13-hint.txt) |
| `npm run test:e2e` (Edge; dùng chung với BC3) | exit 0; 127 qua, 5 bỏ qua | [05-e2e.txt](evidence/WP3-RECHECK-BC3/05-e2e.txt) |

- **Hành vi đã kiểm chứng (không thấy lỗi):**
  1. **Đua, chốt sổ và sổ cái.** Mỗi vòng của cả hai lần chạy đều cho kết quả sau.
     - Một bản sửa đổi, một bộ bút toán sổ cái (`+60` ghi có và `-240` ghi nợ thiếu giờ, `source_ref` = bản sửa đổi), hai dòng sửa đổi, job PDF và job gửi thành công, một lần gửi được chấp nhận, một bản capture, số dư đã ghi 120, `integrity_check` ok và không vi phạm khoá ngoại.
     - Khi đường thủ công thắng: một lần ký `created` và một lần `replayed`, với `signed_at` = thời điểm được đưa vào 2026-09-30T00:30:05Z.
     - Khi hạn chót thắng: cả hai lần ký thủ công nhận 409 `already_finalized`; review vẫn chờ, không có bản ký và không có `signed_at` bịa ra.
  2. **Ranh giới HTTP (84 PASS).**
     - Bản sửa đổi, PDF và chữ ký chỉ dành cho chủ sở hữu. Nhân viên khác, quản trị viên, id viết hoa, id duyệt thư mục và đường chia sẻ đã thu hồi nhận 404; người ẩn danh nhận 401.
     - Không đường tĩnh nào trả tệp riêng tư; `no-store` trên các câu trả lời cho chủ sở hữu; danh sách gửi chỉ theo chủ sở hữu.
     - Câu trả lời quản trị nằm trong danh sách cho phép và không chứa chi tiết timesheet.
     - C-01: gợi ý chỉ chủ sở hữu thấy, nằm ngoài payload, hash, PDF và thư.
     - C-02: phần ghi nguồn không lộ dữ liệu của người dùng khác.
     - RBC-01: `actor_is_system` bằng "không có người thực hiện" trong cơ sở dữ liệu cho mọi sự kiện History của bốn người dùng, và sự kiện hệ thống không mang danh tính.
     - RBC-02: phép nghỉ đã lên kế hoạch trước kỳ do người được chia sẻ nhập chỉ hiện trong review của chủ sở hữu.
     - H-Q1 (a): E3, chưa từng lưu setting, không có bản sửa đổi, dòng, bút toán, job, lần gửi, sự kiện hệ thống hay dòng trạng thái quản trị.
     - AC-14: lần gửi tự động của quản trị viên khi thiếu người gửi hiện `failed_permanent`/`sender_missing`, không bao giờ là đã chấp nhận.
     - Không có mật khẩu, hash, token phiên hay hash token trong 198 văn bản thu thập.
     - Server đã dừng ở cuối (`SIGTERM`).
  3. **Gợi ý và ràng buộc hash (12 PASS).**
     - Khi hiện và ẩn gợi ý trên dữ liệu giống từng byte, những thứ sau giống hệt: hash đã review và phiên bản mong đợi, `payload_sha256`/`reviewed_sha256` và JSON payload đã lưu, byte của PDF (SHA-256 `923d50ab…`), bút toán sổ cái và thư đã capture.
     - Payload không chứa tên hay trường nào của người được chia sẻ, và việc đọc review không ghi gì.
     - Phép nghỉ đã lên kế hoạch trước kỳ (2026-09-17) và thay đổi của kỳ sau được liệt kê; ngày chủ sở hữu đã sửa lại thì không; sau khi ký, chỉ thay đổi muộn hơn của người được chia sẻ được liệt kê.
- **Kết luận của lần 2 (mục 7): giữ nguyên.**
  - Vòng sửa 3 không đổi tệp production, migration, tài liệu, script hay cấu hình nào, nên mã mà lần 2 đã chạy giống từng byte.
  - Ba probe chạy lại cho cùng kết quả như lần 2: đua 0 lỗi (ở đây 11/9 rồi 9/11, ở lần 2 là 11/9 hai lần), HTTP 84 PASS, gợi ý 12 PASS.
  - Kết quả lần 2 cho sự cố K1–K7, PDF và ảnh render Edge, so sánh H-Q1 và migration vẫn mô tả đúng bản freeze này. Đầu vào của chúng (`src/server/db`, chốt sổ, review payload, sổ cái, PDF, job, thư, tự động hoá) không đổi, và không có migration mới (`src/server/db` không có diff).
  - Bốn probe đó không chạy lại; chúng nằm ngoài phạm vi lần 3.
- **Phát hiện: mức độ | tệp/hàm | cách tái hiện | kỳ vọng/thực tế | quy tắc/AC | cách sửa có giới hạn:** không có. Không thấy lỗi nào trong khu vực A.
- **Rủi ro và cải tiến tuỳ chọn, tách khỏi lỗi đã chứng minh:**
  - R1, R2 và R4–R9 của WP3_RECHECK_A và WP3_RECHECK_A2 không đổi, vì không nguồn nào thay đổi. R3 vẫn đóng nhờ H-Q1 (a).
  - Các nhận xét mới về khoảng trống test của lần audit này (kiểm tra lại activation trong vòng lặp, các guard ngày tạo tài khoản dư thừa) thuộc khu vực B và được ghi là R1–R4 trong [WP3_RECHECK_BC3](WP3_RECHECK_BC3.vi.md).
- **Cổng bắt buộc chưa chạy/bị chặn và lý do:**
  - SMTP thật bị cấm trước khi chủ sở hữu cho phép.
  - Các probe sự cố, PDF, so sánh H-Q1 và migration không chạy lại: nằm ngoài phạm vi lần 3, và mã của chúng giống từng byte (xem mục 7).
  - Không có gì bắt buộc bị chặn.
- **Xử lý các phát hiện trước đó:**
  - WP3_RECHECK_A2 (lần 2, PASS tại `2d72d35` / `0d513fca…ea92`) được lần này gắn lại sang `49651c8` / `c31c300c…ec72`. Khu vực A chưa từng và hiện không có phát hiện.
  - Ghi chú quy trình, không phải phần mềm:
    - Lần chạy 1 của probe HTTP dừng vì lỗi truyền tải ở client (ECONNRESET ở yêu cầu đầu tiên sau bảy lượt `spawnSync` chặn luồng, khi bộ test đột biến đang làm máy bận).
    - Lần 2 không khởi động vì chỗ sửa của tôi.
    - Cả hai được giữ làm bằng chứng; lần 3 là lần chính thức.
    - Một `cmd.exe` tương tác vô tình được mô tả trong mục "Ghi chú quy trình" của WP3_RECHECK_BC3.
- **Sẵn sàng phần mềm, quyền của chủ sở hữu và kết quả chạy thử, tách riêng:**
  - Sẵn sàng phần mềm của khu vực A của WP3 tại `49651c8` / `c31c300c…ec72`: PASS.
  - Quyền của chủ sở hữu cho gửi thật, kích hoạt hay triển khai: không xin, không được cấp. Chỉ chế độ capture; không bao giờ đặt `PRODUCTION_SENDING_ENABLED`.
  - Kết quả chạy thử: không có.
- **Một hành động/prompt tiếp theo:** điều phối viên ghi PASS này cho khu vực A tại `c31c300c…ec72` cùng với WP3-RECHECK-BC3 (PASS), rồi chạy bước nghiệm thu WP3.

Không bịa phát hiện, không ghi PASS chưa quan sát. Một đánh giá một phần không phải là nghiệm thu đầy đủ.

## Nguồn gốc subagent độc lập

- **Task/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá:** WP3-RECHECK-A lần 3, người đánh giá `a4e5c209ddf7091f5`. Tác giả được đánh giá: các tác giả WP3 liệt kê trong [WP3_REVIEW_A](WP3_REVIEW_A.vi.md); vòng sửa 1 và 2 như liệt kê trong [WP3_RECHECK_A](WP3_RECHECK_A.vi.md) và [WP3_RECHECK_A2](WP3_RECHECK_A2.vi.md); vòng sửa 3 WP3-FIX3 `ab4bd2cde876c7ecb` với người commit WP3-FIX3-FREEZE `aca480339f4624b19`; cổng WP3-REGATE3 `a41152818099fb8d5`.
- **Ngữ cảnh mới; xác nhận người đánh giá không là tác giả thay đổi:** ngữ cảnh mới. Người đánh giá này không là tác giả thay đổi nào của WP3, kể cả các vòng sửa, và không phải auditor khu vực A trước đó. Không sửa mã nguồn. Đã ghi tệp này, bản dịch của nó, khối lần 3 trong brief, cặp WP3_RECHECK_BC3, phần Results của BC3 và `evidence/WP3-RECHECK-BC3/`.
- **Digest nguồn trước/sau; bằng chứng cổng cho snapshot đó:** trước và sau đều là `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` trên HEAD `49651c8bb91d56bf6c6966405257537ec7ca474b`; kết quả WP3-REGATE3 báo cùng digest trên cùng commit.
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP3_RECHECK_A3.md` (mới). WP3_REVIEW_A, WP3_RECHECK_A và WP3_RECHECK_A2 không đổi.
- **Xử lý phát hiện và task sửa/kiểm tra lại tiếp theo của điều phối viên:** không có phát hiện và không có task sửa. Tiếp theo là bước nghiệm thu WP3.
