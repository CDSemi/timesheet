# Kiểm lại WP4 — vùng A (vận hành), lần 4: kiểm lại phần thay đổi trên bản đóng băng của vòng sửa thứ tư

Mẫu: [REVIEW](../templates/REVIEW.md). Bản gốc tiếng Anh (có thẩm quyền): [WP4_RECHECK_A4.md](WP4_RECHECK_A4.md). Prompt đánh giá: [WP4_REVIEW](../prompts/WP4_REVIEW.md); brief giao việc và hồ sơ tác vụ: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), mục "Attempt 4". Các đánh giá vùng A trước đó (giữ nguyên): [WP4_REVIEW_A](WP4_REVIEW_A.md), [WP4_RECHECK_A](WP4_RECHECK_A.md) (lần 1), [WP4_RECHECK_A2](WP4_RECHECK_A2.md) (lần 2) và [WP4_RECHECK_A3](WP4_RECHECK_A3.md) (lần 3). Bằng chứng: `handoff/delivery/evidence/WP4-RECHECK-A4/` (mục lục trong `00-README.txt`; đã che, LF; mã script lưu dạng `*.sh.txt`, `*.mjs.txt`).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP4, vùng A (vận hành), kiểm lại phần thay đổi gắn với digest (WP4-RECHECK-A lần 4) sau WP4-FIXB4 và WP4-DEPCLEAN2. 2026-10-06, 19:37 đến khoảng 20:05 UTC. Người đánh giá: subagent WP4-RECHECK-A lần 4 (profile timesheet-auditor, agent trên bảng `aa7e8b8b5f42b5f09` theo ghi nhận của coordinator), model tự báo `claude-opus-5-5`; yêu cầu opus/xhigh; effort và tốc độ không quan sát được từ trong phiên.
- **SHA commit được đánh giá và digest nguồn; commit chưa push; độ đầy đủ của nguồn:**
  - Commit `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, tức `freeze_commit` của WP4-REGATE4; commit cha là `972ccda`. `origin/main` là cùng commit, nên không có commit chưa push.
  - Digest nguồn `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` trên 775 tệp (không tính `handoff/`), bằng digest chính thức của gate.
  - Đã ghi trước (19:37 UTC) và sau các kiểm tra (19:52 UTC) trong repository, bằng dạng `git ls-tree` và `scripts/source-digest.mjs` (`00`, `99`). Đã kiểm lại sau khi viết xong báo cáo, hồ sơ tác vụ và bằng chứng (`99b`). HEAD không đổi, và không tệp nào ngoài `handoff/` thay đổi.
  - Nguồn đầy đủ: hai bản export `git archive` của commit. Mã cây đầy đủ `16e3e0fe…` của chúng bằng cây đóng băng, và digest giống nhau trước và sau các kiểm tra (`00b`, `99`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - Phần thay đổi kể từ `972ccda` chạm 14 đường dẫn ngoài `handoff/`. Mỗi đường dẫn thuộc WP4-FIXB4 hoặc WP4-DEPCLEAN2.
  - Mã chạy của vùng A chỉ bị chạm bởi các dòng chú thích trong `src/server/app.ts` (2) và `src/server/routes/imports.ts` (1). Bản thân trần import đổi trong `DEFAULT_READER_LIMITS` của bộ đọc (8 xuống 2 MiB), và route import lấy lại giá trị đó. Mọi giới hạn kích thước request khác không đổi, cả trong mã lẫn trong hành vi, theo một probe trên ứng dụng đã build.
  - Thay đổi docs/11 chỉ là trần import (8 xuống 2 MiB, EN và VI), và nó khớp với route.
  - Thay đổi `package.json` và tệp lock chỉ chuyển `fflate` 0.8.3 sang `devDependencies`. Nó không ảnh hưởng mã chạy của vùng A: không gì trong `src/` hay `scripts/` import `fflate`, và image chỉ cài các dependency production. Các probe vùng A đạt trên một thư mục tương đương image không có `fflate`.
  - `npm ci` không in dòng deprecation nào. `npm run verify` đạt khi `DATA_DIR` và `DATABASE_PATH` được export: 76 tệp, 1758 test, và cùng 41 kiểm tra smoke như lần 3.
  - Đã đọc kết quả drill của WP4-REGATE4: 208 PASS, tên các kiểm tra giống hệt drill của WP4-REGATE3.
  - Bảy probe vùng A của lần 1 đạt lại, với các dòng kiểm tra giống hệt. Mọi kết luận của lần 1 đến lần 3 vẫn đúng.
  - Không có lỗi. Hai rủi ro mới (R-RA8 Info, R-RA9 Low) liên quan đến mã có từ trước, không đổi, nằm ngoài phần thay đổi.
- **Phạm vi đã thực sự xem/chạy:**
  - Đã đọc:
    - AGENTS.md (từ đĩa) và brief (mục lần 4 và kết quả lần 1 đến lần 3);
    - WP4_REVIEW, mẫu REVIEW và WP4_RECHECK_A3 (được giữ nguyên);
    - kết quả của WP4-FIXB4, WP4-DEPCLEAN2, WP4-FIXB4-FREEZE và WP4-REGATE4, cùng bằng chứng drill của REGATE4;
    - các mục trên bảng của các tác vụ vòng 4, để tách tác giả với người kiểm định (`16`).
  - Mã và tài liệu đã đọc:
    - toàn bộ `git diff 972ccda 546cdda` ngoài handoff;
    - các giới hạn kích thước request và cách nối route của `app.ts`, `routes/imports.ts` và `routes/signatures.ts`;
    - các giới hạn của `xlsxReader.ts`;
    - các đoạn thay đổi của docs/07 và docs/11, EN và VI (so sánh theo từ);
    - các giai đoạn của `Dockerfile`;
    - phần lập kế hoạch đích của `ops/restore.ts`, cho R-RA9.
  - Đã chạy:
    - trên bản export thứ nhất: `npm ci`, `npm ls`, `npm audit --omit=dev` và `npm audit` đầy đủ, rồi `npm run verify` với theo dõi deprecation;
    - trên bản export thứ hai, không dùng Docker, các giai đoạn của `Dockerfile`: giai đoạn build, rồi `npm ci --omit=dev --ignore-scripts` trong một thư mục riêng chứa `dist/` và `package.json`, giống giai đoạn runtime;
    - trên thư mục tương đương image đó: các probe P2, P8, P4, P7, P3, R-A1 và A-03 của lần 1, không sửa, và một probe mới về giới hạn request;
    - so sánh tệp lock theo từng gói, và các kiểm tra mã nguồn và digest chỉ đọc.
  - Không chạy lệnh Docker nào.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| Digest dạng `git ls-tree` và `scripts/source-digest.mjs` trong repository, trước và sau | HEAD `546cdda` = `origin/main`; `26fcc969…` (775 tệp) cả hai lần; không có thay đổi ngoài handoff | `00`, `99` |
| `git archive 546cdda` (hai bản export); git dir riêng `add -A`, `write-tree` (ngoài repository) | cây `16e3e0fe…` = cây đóng băng; digest `26fcc969…` trước và sau các kiểm tra, trên cả hai bản export | `00b`, `99` |
| `git diff --name-status 972ccda 546cdda`; `--stat` | 215 đường dẫn: 201 dưới `handoff/` (194 thêm, 7 sửa), 14 bên ngoài, tất cả thuộc FIXB4 hoặc DEPCLEAN2 | `10` |
| Kiểm tra mã nguồn chỉ đọc (`git diff -U0`, `cmp` sau khi bỏ chú thích, `git rev-parse <commit>:<path>` ở 4 commit, `git grep`) | app.ts và imports.ts: chỉ dòng chú thích (`cmp` exit 0 khi bỏ chú thích); mọi giới hạn ngoài giới hạn của bộ đọc không đổi; mọi đường dẫn vùng A giống hệt blob kể từ `0f7fba2`; không module vùng A nào import; so sánh theo từ của docs/11 chỉ `8` → `2` | `11`, `11b` |
| `p-lock.mjs` trên hai tệp lock và `package.json` | 197 = 197 mục; chỉ `fflate` đổi: thêm `dev: true` và chuyển từ dependencies sang devDependencies; không gói nào phụ thuộc vào nó; không nằm trong 16 mục không phải dev | `11c` |
| `npm ci`; `npm ls fflate` (có và không có `--omit=dev`); `npm audit --omit=dev`; `npm audit` (Node 24.21.0, npm 11.18.0) | exit 0, 161 gói, không dòng deprecation; `fflate` chỉ là dev; audit production 0; audit đầy đủ có 1 mức high trong `source-map-js` chỉ dùng khi phát triển (R-RA6) | `12`, `12b` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, với `DATA_DIR`, `DATABASE_PATH` và `SMOKE_PORT=47613` được export | exit 0: 76 tệp / 1758 test, SMOKE PASSED (41, tên giống hệt lần 3); không dòng deprecation; thư mục `DATA_DIR` được export vẫn trống | `13`, `13b` |
| `npm ci`; `npm run build:server -- --sourceMap false`; `BUILD_SOURCEMAPS=off npm run build:client` (bản export thứ hai) | exit 0, 0, 0; `dist/` 116 tệp, 0 `*.map`, 0 `sourceMappingURL`; bundle `index-DH2TBHE1.js` (454.210 byte, độ dài sau giải mã 454.172; có "2 MiB" một lần, không có "8 MiB") | `14`, `14d` |
| `npm ci --omit=dev --ignore-scripts` trong `<work>/prod`, cộng `dist/` | exit 0, 16 gói, không có `fflate` ở đâu cả (`npm ls fflate` rỗng); 560 map của bên thứ ba, tất cả của pdf-lib (R-RA3) | `14b`, `14c` |
| Đọc `04-drill.txt` của WP4-REGATE4 và so với WP4-REGATE3 | `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL; tên kiểm tra giống hệt; bundle được phục vụ giống `14`; image ít hơn 21 đường dẫn, khớp với 17 tệp và 4 thư mục của `fflate` | `15`, `15b` |
| Chạy lại các probe của lần 1, không sửa, trên `<work>/prod`: P2, P8, P4, P7, P3, R-A1, A-03 (lần chạy 2) | tất cả exit 0: 31, 8, 16, 23, 10, 24 và 15 PASS; các dòng kiểm tra giống lần 3 | `20`-`27` |
| Cũng các probe đó, lần chạy 1 (`<work>/prod` chưa có `reference/examples`) | lệnh `seed` dành cho phát triển đọc `reference/examples/*.json` cạnh `dist/`, nên nó lỗi ENOENT; vì thế P2, P8, P4 và P7 lỗi theo; P3, R-A1 và A-03 đạt | `run1-*`, `30` |
| `p-limits.mjs` trên `<work>/prod`, cổng chỉ định 47618 (lần chạy 4; lần chạy 3 trên cổng 47617 cho cùng 20 dòng kiểm tra) | exit 0, 20 PASS: JSON 64 KiB, chữ ký 256 KiB, workbook 2 MiB (đúng 2 MiB → 422 `not_a_zip`; +1 và 8 MiB → 413); template 201; bản sao lưu chứa nguồn import với hash của template | `28` |
| `p-limits.mjs`, lần chạy 1 (fetch, cổng 47615) và 2 (`node:http` có keep-alive, cổng 47616) | lỗi tầng truyền tải sau các câu trả lời 413 sớm (R-RA8); ở lần chạy 3 và 4 mọi mã trạng thái đọc được đều đúng như mong đợi. Lần chạy 4 chỉ đổi tên một chuỗi mật khẩu mà kiểm tra precommit đã chặn | `run1-28`, `run2-28`, `run3-28` |
| `ps -W`, `ps -ef`, `netstat -ano` trước và sau | không còn tiến trình nào của lần kiểm định này, không có socket lắng nghe mới | `05`, `05b`, `05c`, `98` |
| `validate_package.py --preflight` (Python của workflow), sau khi viết cặp báo cáo và hồ sơ tác vụ, và lại sau lần sửa cuối | exit 0, PASS, 83 cặp bản dịch, ở mỗi lần chạy | `31` |
| `scripts/precommit-check.mjs` trên các tệp của tác vụ này, stage trong git dir riêng ngoài repository, chạy sau cùng | lần chạy 1: BLOCK, 2 phát hiện, chuỗi mật khẩu trần của lần đăng nhập bị từ chối trong `p-limits.mjs.txt` (đã bỏ ở lần chạy 4 của probe giới hạn); mọi lần chạy sau: exit 0, 0 phát hiện | `32` |

- **Phát hiện:** không có. Không quan sát thấy lỗi nào trong phần thay đổi được đánh giá.
- **Các kiểm tra đã xác minh, theo từng mục phạm vi lần 4 của brief:**
  1. Phần thay đổi kể từ `972ccda` (`10`, `11`, `11b`, `11c`):
     - `git diff --name-status 972ccda 546cdda` liệt kê 14 đường dẫn ngoài `handoff/`:
       - từ WP4-FIXB4: `src/server/import/xlsxReader.ts`, `src/server/app.ts`, `src/server/routes/imports.ts`, `src/client/importModel.ts`, test `importModel` phía client, spec e2e của import, hai test tích hợp workbook, và docs/07, docs/11, EN và VI;
       - từ WP4-DEPCLEAN2: `package.json` và `package-lock.json`.
     - `templateMapping.ts`, `workbookImport.ts`, `ImportScreen.tsx`, `ImportPreview.tsx` và docs/03 không đổi. Không gì thay đổi dưới `.claude/`, `reference/`, các migration, `AGENTS.md` hay `CLAUDE.md`.
     - 201 đường dẫn handoff là hồ sơ và bằng chứng.
     - **`app.ts` và `routes/imports.ts`, hai đường dẫn mã chạy vùng A duy nhất trong phần thay đổi.** Mọi dòng thay đổi đều là chú thích ("8 MiB" → "2 MiB"): 2 dòng trong `app.ts`, 1 dòng trong `routes/imports.ts`. Khi bỏ các dòng chú thích, cả hai tệp giống hệt nhau ở hai commit (`cmp` exit 0).
       - Trần import đến từ `DEFAULT_IMPORT_MAX_BYTES = DEFAULT_READER_LIMITS.maxCompressedBytes`. Dòng này không đổi; giá trị của bộ đọc đổi từ `8 * 1024 * 1024` thành `2 * 1024 * 1024` (vùng B).
       - Các giới hạn khác không đổi ở cả hai commit: giới hạn JSON chung (64 KiB), tải lên chữ ký (256 KiB), tệp cấu hình CLI (256 KiB) và trần manifest (32 MiB khi prune, 64 MiB khi restore). Cách nối route cũng không đổi.
       - Hành vi trên ứng dụng đã build (`28`, lần chạy 4):
         - Route JSON: đúng 64 KiB đi qua, còn 64 KiB + 1 trả 413 `payload_too_large`. Đã kiểm trên `/api/auth/login`, trên route JSON riêng của bộ định tuyến import `POST /api/imports/:id/commit`, và trên `PUT /api/settings`.
         - Tải lên chữ ký: đúng 256 KiB đến được bước kiểm tra ảnh (415), còn 256 KiB + 1 trả 413.
         - Tải lên workbook: đúng 2 MiB đến được bộ đọc (422 `not_a_zip`, 6 ms); 2 MiB + 1 và mức cũ 8 MiB trả 413 (2 và 4 ms).
         - Template đang được theo dõi được chấp nhận (201). Sau đó `/api/health` trả 200.
         - Bản sao lưu tạo sau đó chứa nguồn import đã lưu (loại `import`) với SHA-256 và kích thước của template, và bản sao của nó có hash bằng template.
     - Không đường dẫn vùng A nào khác thay đổi. Mỗi đường dẫn sau giống hệt blob ở `0f7fba2`, `cc34e7f`, `972ccda` và `546cdda`:
       - `src/server/ops`, `db` (cùng các migration), `jobs`, `mail` và `files`;
       - `cli.ts`, `index.ts` và `config.ts`;
       - `services/bootstrap.ts`, `automation.ts` và `operationsStatus.ts`;
       - `routes/signatures.ts`, `admin.ts` và `auth.ts`;
       - `Dockerfile`, `compose.example.yaml`, `.dockerignore`, `.env.example` và `.npmrc`;
       - `scripts/`, `vite.config.ts` và `tsconfig*.json`;
       - docs/03 và docs/10, EN và VI.
     - Không module vùng A nào import hay nhắc tên `xlsxReader`, `routes/imports`, `importModel`, `workbookImport` hay `templateMapping` (`git grep` exit 1). `importMaxBytes` chỉ được đặt qua `AppOptions`; không biến môi trường hay tệp cấu hình nào đặt nó.
     - **docs/11 (EN và VI)** chỉ đổi dòng 221. So sánh theo từ cho thấy đúng một con số `8` → `2` trong bước import ("at most 2 MiB" / "tối đa 2 MiB"), khớp với route. Không phát biểu nào khác của docs/11 nêu kích thước tải lên hay 413.
     - **docs/07** chỉ đổi dòng 46, EN và VI: đoạn về nhập workbook (trần của route, giới hạn của bộ đọc, cận được suy ra). Đây là nội dung vùng B. Câu liên quan đến vận hành, "at most 2 MiB … 413 `payload_too_large` above it", khớp với route.
     - **`package.json` và tệp lock (WP4-DEPCLEAN2).** Phép so sánh `p-lock` thấy 197 mục ở cả hai commit, với đúng các khác biệt sau:
       - `node_modules/fflate` thêm `"dev": true`;
       - `fflate` 0.8.3 chuyển từ dependencies sang devDependencies, ở gốc tệp lock và trong `package.json`.
       - Không trường nào khác của `package.json` thay đổi. Không mục lock nào phụ thuộc vào `fflate`, và nó không nằm trong 16 mục không phải dev.
     - **Thay đổi của DEPCLEAN2 không ảnh hưởng mã chạy của vùng A:**
       - không tệp nào trong `src/` hay `scripts/` import `fflate`; một chú thích trong `xlsxReader.ts` nhắc tên nó, và chỉ `tests/support/syntheticWorkbook.ts` cùng test của bộ đọc import nó;
       - bộ đọc đã biên dịch chỉ import `node:zlib`;
       - giai đoạn runtime cài bằng `npm ci --omit=dev --ignore-scripts`;
       - thư mục tương đương image của tôi không có `fflate`, và cả bảy probe vùng A lẫn probe giới hạn đều đạt trên nó;
       - image của REGATE4 liệt kê ít hơn image của REGATE3 21 đường dẫn, khớp với 17 tệp và 4 thư mục của `fflate`.
  2. `npm ci`, `npm run verify` và drill (`12`, `12b`, `13`, `13b`, `14`, `15`):
     - `npm ci`: exit 0, 161 gói, không dòng deprecation. `npm ls fflate --omit=dev` rỗng. `npm audit --omit=dev`: 0 lỗ hổng.
     - `npm run verify` với `DATA_DIR`, `DATABASE_PATH` và `SMOKE_PORT` được export và bật `--trace-deprecation --pending-deprecation`: exit 0.
       - 76 tệp / 1758 test, so với 1755 ở lần 3. 3 test thêm đến từ các thay đổi test của FIXB4 (số dòng `it(` ròng: +7 −4 trong test của bộ đọc, +1 −1 trong test phía client).
       - SMOKE PASSED, với cùng 41 tên kiểm tra như lần 3.
       - Không dòng deprecation; chỗ khớp "deprecat" duy nhất là dòng in lại `NODE_OPTIONS`.
       - Thư mục `DATA_DIR` được export có 0 mục trước và sau. A-04 vẫn đúng.
     - Đã đọc kết quả drill của WP4-REGATE4: `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL. 208 tên kiểm tra của nó giống hệt drill của REGATE3.
       - Giai đoạn 1: quét tệp cấm có tính cả source map dưới `/app/dist`, bundle không có `sourceMappingURL`, `/assets/<bundle>.map` trả 404, người dùng 10001, và chỉ có dependency production.
       - Giai đoạn 2: sao lưu trong lúc đang ghi, chứa cả hai nguồn import với hash của chúng.
       - Giai đoạn 3: restore bị tạm dừng với lý do `restored`, rồi giải phóng theo id và `--all` (R-A5).
       - Giai đoạn 4 và 5: nâng cấp từ schema WP3, và quay lui. Giai đoạn 6: import và số dư đầu kỳ.
       - Build image của REGATE4 mất 14 s, so với 8 s ở REGATE3. Các tệp gói đã đổi, nên các lớp `npm ci` rất có thể đã được build lại; đây là suy luận (R-RA5).
     - Tôi không chạy lại drill container. Thay vào đó, tôi chạy các giai đoạn của `Dockerfile` không qua Docker:
       - `dist/` có 116 tệp, 0 `*.map` và 0 `sourceMappingURL`;
       - bundle `index-DH2TBHE1.js` có cùng tên băm theo nội dung mà container của REGATE4 đã phục vụ, và độ dài sau giải mã (454.172) đúng là số drill đã in;
       - thư mục production cài đặt mà không có `fflate`.
  3. Các kết luận của lần 1 đến lần 3 vẫn đúng (`20`-`27`):
     - Bảy probe của lần 1 chạy không sửa trên thư mục tương đương image (`node_modules` production, không có `fflate`), với các dòng kiểm tra giống hệt lần 3:
       - P2, sao lưu khi có ba tiến trình ghi và restore cô lập, có hash và số dư: 31;
       - P8, danh sách cho phép của admin: 8;
       - P4, ranh giới đích của sao lưu và restore: 16;
       - P7, cửa sổ lưu giữ và lượt quét khi tạm dừng: 23;
       - P3, thoát ra qua junction khi prune: 10;
       - R-A1, từ chối và prune bình thường: 24;
       - A-03, các lần từ chối bootstrap không in dấu hiệu nào: 15.
     - Vì vậy:
       - WP4-A-01 đến A-04 đã đóng;
       - R-A1, R-A5 và R-A7 đúng;
       - sao lưu và restore, tạm dừng và đối soát, nâng cấp và quay lui, lưu giữ và các danh sách cho phép của admin vẫn đúng;
       - phần đồng bộ tài liệu vẫn đúng;
       - trường hợp hòa trong cùng một giây vẫn chấp nhận được (Info).
     - Mọi module vùng A mà chúng dựa vào giống hệt từng byte giữa `0f7fba2`, `cc34e7f`, `972ccda` và `546cdda`; `app.ts` chỉ khác ở chú thích.
- **Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh:**
  - **R-RA1 (Info), trường hợp hòa trong cùng một giây: không đổi và vẫn chấp nhận được.** Ở lần chạy này, 7 trên 12 cặp CLI liền nhau rơi vào cùng một giây UTC, và trong 3 cặp `--prune` đã xóa bản sao lưu vừa in ra. Luôn còn lại một bản sao lưu đầy đủ của giây đó (`25`).
  - **R-RA2 (Low), bản sao lưu đi kèm trước khi nâng cấp: không đổi.** Một lần `--prune` sau đó trong cùng ngày UTC xóa nó; sang ngày UTC kế tiếp thì nó được giữ (`25`).
  - **R-RA3 (Info), map của bên thứ ba: đã đo lại.** `node_modules` production có 560 map, tất cả của pdf-lib, giống lần 2. `fflate` không mang map nào. Chúng không bao giờ được phục vụ.
  - **R-RA4 (Info), một bản sao lưu ở tương lai xa chặn việc prune: không đổi** (mã không đổi).
  - **R-RA5 (Info), công cụ drill: vẫn còn.** Kiểm tra đó vẫn có thể đạt một cách rỗng khi build được lấy hết từ cache. Ở REGATE4 các tệp gói đã đổi, nên nhiều khả năng nó đã thấy output thật của `npm ci`. Cả hai lần `npm ci` của lần kiểm định này không in dòng deprecation nào.
  - **R-RA6 (Info), khuyến cáo về dependency: không đổi.** GHSA-68fv-2mgg-jv7q trong `source-map-js` 1.2.1 chỉ dùng khi phát triển; không có trong image.
  - **R-RA7 (Info), nhãn của drill: không đổi.** Drill in độ dài sau giải mã 454.172 với nhãn "bytes"; tệp có 454.210 byte.
  - **R-RA8 (Info, mới, tầng truyền tải HTTP, ngoài vùng A, có từ trước): câu trả lời 413 sớm và việc dùng lại kết nối.** Các route tải lên dạng thô trả 413 dựa trên `Content-Length` trước khi phần thân đến hết.
    - Với `fetch` (lần chạy 1), lần tải lên 2 MiB + 1 lỗi "other side closed", và không đọc được mã trạng thái nào.
    - Với agent keep-alive mặc định của `node:http` (lần chạy 2), lần tải lên ngay sau một câu trả lời 413 nhận `ECONNRESET` mà không có phản hồi, nhiều khả năng trên kết nối được dùng lại. Việc đó xảy ra sau 413 của route chữ ký, và lại xảy ra sau 413 của route workbook.
    - Khi mỗi lần tải lên dùng một kết nối riêng (lần chạy 3 và 4), mọi mã trạng thái đều đúng như mong đợi.
    - Route chữ ký có cùng hành vi này từ trước WP4, và client kiểm tra cả hai kích thước trước khi tải lên. Vì vậy đây không phải hệ quả của phần thay đổi, và chưa được quan sát trong trình duyệt.
    - Tùy chọn: trả các câu 413 sớm kèm `Connection: close`, hoặc đọc hết phần thân. Việc này có thể chuyển cho WP4-RECHECK-B4 hoặc backlog.
  - **R-RA9 (Low, mới, có từ trước trong `ops/restore.ts`, không phải hệ quả của phần thay đổi): một junction treo trỏ vào DATA_DIR.**
    - Lần chạy 1 của P4 đặt `restore --to` vào một junction có đích, `DATA_DIR/tmp`, chưa tồn tại. Restore trả `write_failed` (exit 1) thay vì lời từ chối `target_inside_data_dir` (exit 2), và không ghi gì vào phiên bản đang chạy (`run1-22`, `05c`).
    - Nguyên nhân là `canonical()`: nó không phân giải được đích còn thiếu của liên kết, nên nó lập kế hoạch với chính đường dẫn của liên kết, nằm ngoài DATA_DIR.
    - Nếu đích của liên kết xuất hiện trong khoảng giữa lúc lập kế hoạch và lúc ghi, restore có thể ghi vào đó. Cuộc đua này chỉ là lý thuyết và chưa được tái hiện.
    - Tùy chọn: từ chối một đích là liên kết đang tồn tại nhưng không phân giải được (`lstat`) với mã `target_unusable`.
  - Lỗi diễn đạt nhỏ (Info, có từ trước): docs/11 mục 4 bước 1 nói lệnh sao lưu "chỉ in các con số đếm", nhưng nó cũng in tên thư mục mới.
- **Gate bắt buộc chưa chạy/bị chặn và lý do:**
  - **Lần kiểm định này không chạy lại drill container và việc quét các lớp image.** Brief lần 4 yêu cầu đọc kết quả drill của WP4-REGATE4, và chỉ dùng Docker nếu một phát hiện cần đến. Không có phát hiện nào cần:
    - các đầu vào của image đã thay đổi là ba module đã biên dịch (hai trong số đó chỉ đổi chú thích) và các tệp gói (`fflate` bị bỏ khỏi production);
    - tôi đã tái hiện các giai đoạn build, prod-deps và runtime không qua Docker (`14`, `14b`), và chạy các probe vùng A trên kết quả đó;
    - drill của REGATE4 đọc thấy nhất quán, với cùng 208 kiểm tra.
    - Vì vậy đường container trên đúng bản đóng băng này dựa vào lần chạy của verifier REGATE4, một kết quả được báo cáo, cùng với phần tái hiện của lần kiểm định này và các lần chạy container của lần 1 và lần 2 trên mã vùng A giống hệt từng byte trừ chú thích.
  - Đích NAS và arm64 gốc: NOT VERIFIED (không có quyền truy cập của chủ sở hữu; các bước của chủ sở hữu ở docs/11), như ở lần 1 đến lần 3.
  - Không chạy lại `npm run test:e2e`. Nó không bắt buộc cho vùng A; REGATE4 báo 145 đạt và 5 bỏ qua trên bản đóng băng này. Không dùng SMTP thật (chỉ capture).
  - Các probe P1 và P1b (bộ chạy migration), P5 (token bootstrap), P6 (proxy và cấu hình) và P9 của lần đánh giá đầu không được chạy lại thành probe riêng. Mã của chúng không đổi kể từ `13a258d`, và 1758 test cùng drill của REGATE4 bao phủ chúng.
  - Tính đúng của WP4-FIXB4 trong vùng B thuộc về WP4-RECHECK-B4: cận được suy ra, thay đổi về giải nén và lý lẽ của các trần. Lần kiểm lại này chỉ xét ảnh hưởng của nó lên vùng A.
- **Xử lý các phát hiện trước:**
  - WP4-A-01, A-02, A-03 và A-04: vẫn đóng trên `546cdda` (`11`, `13`, `14`, `15`, `26`).
  - R-A1, R-A5 và R-A7: vẫn đúng (`15`, `24`, `25`).
  - R-RA1, R-RA2, R-RA4, R-RA5, R-RA6 và R-RA7: không đổi, backlog tùy chọn. R-RA3: đã đo lại, không đổi (560).
  - Rủi ro mới: R-RA8 (Info) và R-RA9 (Low).
  - Những gì đã thay đổi kể từ lần 3:
    - digest, từ `635f909d…` thành `26fcc969…`;
    - số test từ 1755 lên 1758 (các test ghim giới hạn của FIXB4);
    - trần import, từ 8 xuống 2 MiB, trong route, client, docs/07 và docs/11;
    - `fflate`, giờ chỉ là dev và không có trong image;
    - bundle phía client, từ `index-ZGs6tcbH.js` thành `index-DH2TBHE1.js`;
    - mẫu đo cùng một giây: 7 trên 12 cặp, 3 lần xóa.
  - R-A2, R-A3, R-A4, R-A6, R-A8 và R-A9 của lần đánh giá đầu giữ nguyên như đã ghi.
- **Sẵn sàng phần mềm, quyền của chủ sở hữu và kết quả thí điểm, tách riêng:**
  - Sẵn sàng phần mềm của vùng A: chấp nhận ở `546cdda` / `26fcc969…` trên một máy trạm. NAS và arm64 chưa được xác minh.
  - Quyền của chủ sở hữu: không yêu cầu và không được cấp; không triển khai gì và không gửi gì.
  - Kết quả thí điểm: chưa có (WP5).
- **Một hành động/prompt tiếp theo:** coordinator ghi WP4-RECHECK-A lần 4 là PASS ở digest `26fcc969…`. Khi WP4-RECHECK-B4 xong, coordinator chuyển WP4 sang nghiệm thu. R-RA1, R-RA2 và R-RA5 đến R-RA9 có thể đưa vào backlog như các cải tiến tùy chọn.

Không bịa phát hiện, không ghi đạt khi chưa quan sát. Một đánh giá một phần không phải là nghiệm thu đầy đủ.

## Nguồn gốc subagent độc lập

- **Tác vụ/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá:**
  - WP4-RECHECK-A, lần 4. Người đánh giá: subagent timesheet-auditor, agent trên bảng `aa7e8b8b5f42b5f09` (`claude-opus-5-5`).
  - Tác giả của phần thay đổi được đánh giá (`16`):
    - WP4-FIXB4 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - WP4-DEPCLEAN2 `a6a48b0c9d59f3cb2` (sonnet);
    - người commit WP4-FIXB4-FREEZE `a6dda119886e663af` (sonnet);
    - verifier WP4-REGATE4 `a2309045d22c66236` (sonnet).
  - Model tác giả mạnh nhất của bản này là `claude-opus-5-5`, nên người đánh giá không yếu hơn.
  - Người đánh giá không phải là:
    - người kiểm định lần 1 `a659b8cbd52722f18`;
    - người kiểm định lần 2 `aabafcca9efc225db`;
    - người kiểm định lần 3 `a9f9312409bbc8109`;
    - người kiểm định vùng A đầu tiên `af8b9184c8adf6eb0`;
    - người kiểm định WP4-RECHECK-B4 `aea194a66a8cd3b00`.
- **Ngữ cảnh mới; xác nhận người đánh giá không viết thay đổi:** ngữ cảnh mới. Người đánh giá này không viết gì trong WP4.
  - Nó chỉ viết báo cáo này, bản dịch, kết quả lần 4 trong brief và `evidence/WP4-RECHECK-A4/`.
  - Không sửa mã nguồn nào.
  - Các probe và bản build chạy trong một thư mục nháp ngoài Dropbox. Không chia sẻ tệp nào với WP4-RECHECK-B4, vốn đang chạy đo thời gian cùng lúc.
- **Digest nguồn trước/sau; bằng chứng gate cho bản đó:** `26fcc969…d9081` trước và sau, trong repository và trên cả hai bản export. Nó bằng digest chính thức của WP4-REGATE4 (`handoff/delivery/evidence/WP4-REGATE4/`).
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP4_RECHECK_A4.md` (tệp mới). `WP4_RECHECK_A3`, `WP4_RECHECK_A2`, `WP4_RECHECK_A`, `WP4_REVIEW_A` và các đánh giá khác không đổi.
- **Xử lý phát hiện và tác vụ sửa/kiểm lại tiếp theo của coordinator:** không cần tác vụ sửa cho vùng A. Backlog tùy chọn: R-RA1 đến R-RA9. Tiếp theo: nghiệm thu WP4 khi WP4-RECHECK-B4 xong.
