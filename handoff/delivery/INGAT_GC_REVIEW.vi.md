# Review độc lập: INGAT-GC (job dọn định kỳ các phiên bản image cũ trên GHCR)

Bản dịch của [INGAT_GC_REVIEW.md](INGAT_GC_REVIEW.md); tiếng Anh là nguồn chuẩn.

- Giai đoạn/ngày/reviewer và model/effort quan sát được: việc tiếp theo "dọn GHCR" của nhánh phụ "Ingat deployability"
  (không có trên board); task INGAT-GC-AUDIT attempt 1; 2026-10-22 (America/Los_Angeles); timesheet-auditor, effort xhigh
  (do profile cố định); model tự báo `claude-opus-5-5`.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: HEAD gốc
  `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5` (nhánh `claude/relaxed-lalande-8359f0`) cộng 15 tệp chưa commit có SHA-256 ghi
  trong `handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt`; source digest
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56` (882 tệp, không tính `handoff/`). Trạng thái ngoài
  `handoff/` đúng bằng 15 đường dẫn đó. Snapshot cố ý chưa commit, nên danh tính dựa vào các hash và digest; không còn gì
  khác chưa push.
- Quyết định: **PASS**. Không thấy lỗi nào khiến job xoá được một bản release, bản không tag, bản mang tag không phải SHA,
  bản trong 20 bản mới nhất hay bản dưới 30 ngày, và mọi gate bắt buộc đã chạy và đạt trên danh tính này. Lần chạy thật
  đầu tiên chưa chạy theo thiết kế (xem dưới). Các đề xuất tuỳ chọn O1-O9 tách riêng; không mục nào chặn nghiệm thu.
- Phạm vi thật đã xem/chạy:
  - Đọc toàn bộ: `scripts/ghcr-cleanup.ts`, `tests/integration/ghcr-cleanup.test.ts`, hai fixture,
    `.github/workflows/image-cleanup.yml`, ADR 0003 EN và VI; diff của ADR 0002, docs/07 và docs/11 (EN và VI) và hai tệp
    tsconfig; `image.yml`, `ingat.toml`, `eslint.config.js`, `.gitattributes`. Hồ sơ PLAN, IMPL, FIX1, GATE và REGATE1
    được coi là tuyên bố và chạy lại, không tin sẵn.
  - Tài liệu công khai của GitHub (19 trang qua `docs.github.com/api/article/body`, mô tả OpenAPI) và các lần đọc không
    xác thực (kho, hai lần chạy mà docs/07 nêu, `GET /versions`, `git ls-remote`).
  - Ingat, chỉ đọc: ADR-0026, ADR-0007, LIFECYCLE 4.2, 4.6, 4.7, 4.9, 4.10, 4.13, 5.6, ARCHITECTURE (các dòng về image,
    R14), các khoá release của MANIFEST_SPEC.
  - Lần theo quy tắc xoá từ đầu đến cuối. Tag: `git ls-remote --tags` của kho công khai chạy trong mỗi job ngay trước
    script, ẩn danh (`persist-credentials: false`, `GIT_TERMINAL_PROMPT=0`); lỗi thì bước dừng (`bash -e`); `taggedCommits`
    quy tag chú thích về commit đã bóc, từ chối mọi dòng khác và dòng bóc không có tag của nó, và nhận danh sách rỗng.
    Phiên bản: `listVersions` phân trang 100 đến khi gặp trang ngắn, từ chối khi quá 3.000 và khi package rỗng;
    `parseVersions` từ chối mọi mục sai dạng và giữ một lần id lặp (trang bị dịch chỉ có thể thêm hoặc bỏ sót một phiên
    bản, không bao giờ đánh dấu nó; phiên bản bị bỏ sót thì không bị xoá và chỉ làm hạng của các bản cũ hơn giảm đi). Chọn,
    khớp đầu tiên thắng: không tag thì giữ; tag nào không khớp `^[0-9a-f]{40}$` thì giữ; tag nào thuộc tập commit có tag
    thì giữ; hạng < keepNewest thì giữ; tuổi <= keepDays thì giữ; còn lại thì xoá; phiên bản có ngày muộn hơn hiện tại quá
    một ngày làm dừng; ngưỡng sàn 10 / 7 được `assertOptions` áp cho mọi đường. `assertSafe` kiểm lại các quy tắc về
    tag, hạng và "không xoá hết". Vòng xoá: từ cũ nhất, đọc lại từng id và giữ nếu digest hay tag đã đổi, mọi trả lời
    khác 200 hay 204 ném lỗi và dừng lần chạy; không ghi gì khi thiếu `--apply`, và `--apply` bị từ chối ở chế độ offline.
    Workflow: `plan` (`packages: read`) luôn chạy; `apply` (`packages: write`) sau một `plan` thành công cho mọi lần
    chạy theo lịch, còn chạy tay chỉ khi `apply = true` (mặc định false); input chỉ đến script qua `env`; nhóm
    concurrency riêng. Tranh chấp: một lần đăng thêm bản mới nhất mà lần chạy chưa liệt kê; git tag được push khi một
    lần `apply` đang ở giữa `git ls-remote` và một lần xoá thì không bảo vệ phiên bản đó trong lần chạy ấy (O6); đồng hồ
    runner chạy nhanh bị chặn bởi ngưỡng 20 bản mới nhất, chạy chậm quá một ngày thì dừng.
- Bảng bằng chứng (lệnh | kết quả/exit | bằng chứng; tất cả trong `handoff/delivery/evidence/INGAT-GC-AUDIT/`, script ở
  `D:\.claude-tmp\timesheet\INGAT-GC-AUDIT`):

  | Lệnh | Kết quả / exit | Bằng chứng |
  |---|---|---|
  | `id.sh first` (15 SHA-256, `source-digest.mjs`, trạng thái, HEAD) | 0; 15 OK; digest `e47e6344…ee56`; HEAD `70dce2a` | `id-first-*.txt` |
  | `export.sh`: `git archive HEAD`, 15 tệp bằng `cp`, `sha256sum -c`, `npm ci` (Node v24.21.0, npm 11.19.1) | 0; 15 OK; 161 gói | `export-hashes.txt`, `npm-version.txt`, `npm-ci.txt` |
  | `vitest run tests/integration/ghcr-cleanup.test.ts` | 0; 29 đạt | `g1-vitest.txt` |
  | `npm run typecheck`; `npm run lint` | 0; 0 | `g2-typecheck.txt`, `g3-lint.txt` |
  | `npm test`; `npm run verify` | 0, 101 tệp / 2374 test; 0, `SMOKE PASSED`; không có "deprecat"/"warn" | `g4-test.txt`, `g5-verify.txt`, `deprecation-scan.txt` |
  | `dry.sh`: fixture với `--now 2026-11-01T00:00:00Z`, mặc định và `--keep-newest 10 --keep-days 7`; 11 lần từ chối | 0, giữ 35 xoá 5; 0, giữ 15 xoá 25; mỗi lần 1, một dòng `::error::` | `dry-*.txt`, `refuse-*.txt` |
  | `mut.mjs`: 17 đột biến riêng trên bản sao trong export | 13 bị bắt; 2 sống sót là lỗ hổng test (O4); 2 tương đương; đã khôi phục, sha256 `4302a44f…` | `mut-summary.txt`, `mut-a*.txt` |
  | `lint-probe.mjs`: thêm một lời gọi `escape()` đã lỗi thời vào bản sao trong export | lint 0 trước, 1 với `@typescript-eslint/no-deprecated`; đã khôi phục | `lint-coverage-probe.txt` |
  | `lsremote-probe.mts` trên một `git ls-remote --tags` thật (git/git, 1012 tag chú thích) | 0; mọi commit đã bóc đều có trong tập, không có đối tượng tag | `lsremote-real-probe.txt` |
  | actionlint 1.7.12 theo digest, `--network none`, chỉ đọc, ba workflow; kiểm ghim SHA | 0, không phát hiện; PASS 4 + 3 + 1 | `actionlint.txt`, `sha-pin-check.txt`, `uses-lines.txt` |
  | `git ls-remote` ẩn danh của setup-node v7.1.0, checkout v7.0.1 và tag của `CDSemi/timesheet` | 0; `949feb24…`, `3d3c42e5…` bằng các ghim; không có git tag | `public-repo.txt` |
  | Tài liệu GitHub và OpenAPI; `GET /repos/CDSemi/timesheet`, hai lần chạy, `GET /versions` không xác thực | 200; Organization, công khai; cả hai lần chạy `success` trên `6173f07` | `api-facts.txt`, `public-runs.txt`, `public-repo.txt` |
  | parity trên bốn cặp; `validate_package.py --preflight`; `git diff --check`; khoảng trắng của 7 tệp mới | PARITY OK x4; PASS, 127 cặp; 0; không có | `parity.txt`, `preflight.txt`, `diff-check.txt`, `trailing-ws-untracked.txt` |
  | `priv.sh track`: kho nháp có `.gitattributes`, 15 tệp cộng 258 tệp của nhánh dưới `handoff/` | precommit PASS, 0 chặn, 0 cảnh báo; `diff --cached --check` 0; không có dấu hiệu | `privacy-track*.txt` |
  | `id.sh last` | 0; 15 OK; digest không đổi; HEAD không đổi; trạng thái ngoài `handoff/` giống hệt; đường dẫn mới chỉ là của auditor | `id-last-*.txt` |

- Lỗi (mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi): không có. Mọi yêu cầu đều đạt: yêu
  cầu của chủ dự án (job không xoá bản release nào; bản release xoá bằng tay), D1 (mọi git tag), D2 (20 bản mới nhất và
  30 ngày, ngưỡng sàn 10 / 7, không giới hạn mỗi lần: `--max-delete` bị từ chối), D3 (job `apply` chạy cho mọi lần theo
  lịch, chạy tay là chạy thử trừ khi yêu cầu), D4 (không token cá nhân, không secret), thiết kế an toàn của kế hoạch, và
  quy tắc AGENTS (EN là chuẩn kèm cặp VI, ADR 0003 cho khái niệm mới, không API lỗi thời dưới lint, không tuyên bố đã
  chạy thật hay đã xoá).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - O1. ADR 0002 vẫn ghi "chưa có gì chạy trên GitHub" (dòng 3) và "không có lần chạy workflow, không image nào được
    đẩy, không package nào được tạo" (mục Sự thật, dòng 55-57; VI cũng vậy), trong khi docs/07 nay nói đúng rằng cả hai
    workflow đã thành công trên `6173f07` (đã kiểm: `public-runs.txt`). Có từ lần push `6173f07` và nằm ngoài phạm vi sửa
    của gói này (IMPL đã nêu); sửa cả hai dòng EN và VI trong lần commit hoặc ở task ghi nhận tiếp theo.
  - O2. Việc phải làm về tag được nêu đúng ("đặt git tag cho mọi commit có bản sao lưu cần khôi phục được quá 30 ngày");
    cách nói rõ hơn: đặt tag cho mỗi commit triển khai lên NAS, vì bundle của nó được khôi phục bằng chính image của nó, và
    trên DSM việc Container Manager đổi storage driver làm ẩn các image cục bộ nên khôi phục phải kéo lại theo digest đã
    ghi (Ingat ARCHITECTURE R14), máy mới cũng vậy.
  - O3. Script ghim phiên bản REST API `2022-11-28`. GitHub liệt kê nó còn được hỗ trợ đến 2028-03-10 và không gửi header
    `Deprecation`, nên hôm nay đây không phải lỗi theo quy tắc 11; sau ngày đó lần chạy dừng an toàn (410). Chuyển sang
    `2026-03-10` không cần đổi code cho các endpoint này (không có mục package-version trong breaking changes của nó).
  - O4. Lỗ hổng test (code đúng): bỏ phép so độ dài trong `sameTags` (phiên bản mất một tag, hay thành không tag, sau khi
    liệt kê sẽ bị xoá) và bỏ neo của `COMMIT_TAG` (tag chứa một dãy 40 ký tự hex, như `sha256-<64 hex>.sig`, sẽ bị coi là
    tag commit) đều để mọi test đạt. Thêm một test cho mỗi trường hợp.
  - O5. `assertSafe` kiểm lại mọi quy tắc trừ quy tắc tuổi, trong khi ADR 0003 nói lần kiểm thứ hai "ném lỗi nếu kết quả
    vi phạm quy tắc". Quy tắc tuổi được test bao phủ (đột biến a01, a02: mỗi cái 4 lỗi). Hoặc thêm kiểm tuổi (cần đồng hồ
    và `keepDays`), hoặc nêu tên các quy tắc nó kiểm lại.
  - O6. Git tag được push trong một lần `apply`, sau `git ls-remote` của nó, không bảo vệ phiên bản bị xoá trong lần chạy
    đó; chỉ phiên bản quá 30 ngày và ngoài 20 bản mới nhất bị ảnh hưởng, nên tag đặt trong hạn đã ghi không bao giờ trễ;
    vẫn còn khôi phục trong 30 ngày.
  - O7. Việc liệt kê với `packages: read` cũng chưa được kiểm như việc xoá (OpenAPI `enabledForGitHubApps: false`); lần
    chạy theo lịch đầu tiên có thể lỗi ngay ở job plan, và cùng phép kiểm "Manage Actions access" áp dụng. Xoá bằng
    `GITHUB_TOKEN` được tài liệu ghi là public preview, có thể đổi; cả hai đều dừng an toàn.
  - O8. Ngày: docs/07 và ADR 0003 ghi image đầu tiên là 2026-10-22, ngày địa phương của dự án; GitHub ghi lần push lúc
    2026-10-23T01:35Z, nên với job chạy theo UTC, lần xoá sớm nhất có thể của phiên bản đó là lần chạy 03:17 UTC ngày
    2026-11-22 ("khoảng 2026-11-21" vẫn thận trọng). Không quan sát được package riêng tư có phiên bản cũ hơn `6173f07`
    hay không; nếu có, theo D1 chúng không phải release và lần chạy đầu sẽ xoá chúng (khôi phục được trong 30 ngày), khớp
    với D3.
  - O9. Nhỏ: một phiên bản công khai không xoá được (hơn 5.000 lượt tải) ở đầu cũ nhất sẽ làm mọi lần chạy sau dừng ở cùng
    chỗ; docs/11 tóm tắt quy tắc mà thiếu phần 20 bản mới nhất; dòng 61 của ADR 0002 dài hơn độ ngắt dòng của tệp.
  - Đã xác nhận đúng, để lưu: các quy tắc và thứ tự của chúng, ngưỡng sàn, các lần dừng do ngày tương lai và do xoá hết,
    các parser, phân trang, đọc lại, dừng ở lỗi đầu tiên, mặc định chạy thử, `--apply` bị từ chối khi offline, quyền
    theo job, `persist-credentials: false`, input qua `env`, `inputs` dùng được trong `env` của workflow và `if` của job,
    ghim SHA, nhóm concurrency riêng, các câu của docs/07 và docs/11, nhãn V/C của ADR 0003, nghĩa EN/VI.
- Gate chưa chạy/bị chặn và lý do (chưa chạy theo thiết kế, không tính là đạt): bất kỳ lần chạy nào của
  `image-cleanup.yml` trên GitHub; danh sách phiên bản thật của package riêng tư (có `metadata.container.tags` hay không);
  `GITHUB_TOKEN` có được liệt kê và xoá hay không (vai trò "Manage Actions access" của package); mọi lần xoá hay khôi phục;
  Ingat trên máy đích. Không gọi có xác thực, không `gh`, không ghi lên GitHub hay GHCR, không đụng NAS của chủ dự án.
- Xử lý phát hiện trước: INGAT-GC-GATE attempt 1 (không test nào chạm tới lần dừng ở dòng 139) đã đóng: các test của FIX1
  có mặt và đạt (29 test); REGATE1 cho thấy cả hai kiểm tra nội bộ đều bị bắt, và audit này thêm 17 đột biến khác. Giới
  hạn mỗi lần và cổng biến kho của kế hoạch không còn, đúng như D2 và D3 yêu cầu.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: phần mềm sẵn sàng để `timesheet-committer` commit theo quy tắc thường
  trực của chủ dự án; commit lên `main` kích hoạt lịch chạy, lần xoá sớm nhất vào khoảng 2026-11-22. Việc của chủ dự án:
  xác nhận vai trò "Manage Actions access" của package, đặt tag theo việc phải làm, đọc lần chạy theo lịch đầu tiên. Chưa
  có lần chạy thật hay kết quả pilot nào.
- Một bước/prompt tiếp: coordinator ghi PASS và giao `timesheet-committer` commit 15 tệp cùng hồ sơ của nhánh (gộp O1 nếu
  chủ dự án muốn); O2-O9 có thể để cho một việc tiếp theo.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: INGAT-GC-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, tự báo); tác giả: planner của INGAT-GC-PLAN, worker của INGAT-GC-IMPL và fix worker của INGAT-GC-FIX1
  (đều tự báo `claude-sonnet-5-5`); gate INGAT-GC-GATE và INGAT-GC-REGATE1 (tự báo `claude-sonnet-5-5`).
- Context mới; xác nhận reviewer không viết thay đổi: context mới; auditor không viết gì trong snapshot và chỉ viết cặp
  review này, Results của brief, `handoff/delivery/evidence/INGAT-GC-AUDIT/` và thư mục task.
- Digest trước/sau; bằng chứng gate snapshot đó: `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56` và 15
  hash, giống nhau lần đầu (`id-first-*.txt`) và lần cuối (`id-last-*.txt`); bằng chứng gate
  `handoff/delivery/evidence/INGAT-GC-REGATE1/` (Decision PASS trên cùng danh tính).
- Path report mới giữ lịch sử review trước: `handoff/delivery/INGAT_GC_REVIEW.md` và `.vi.md` (review đầu tiên của việc
  tiếp theo này).
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: không còn phát hiện mở; O1-O9 tuỳ chọn cho coordinator.
