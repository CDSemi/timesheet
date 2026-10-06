# Kiểm lại WP4 — vùng A (vận hành), lần 3: kiểm lại phần thay đổi trên bản đóng băng của vòng sửa thứ ba

Mẫu: [REVIEW](../templates/REVIEW.md). Bản gốc tiếng Anh (có thẩm quyền): [WP4_RECHECK_A3.md](WP4_RECHECK_A3.md). Prompt đánh giá: [WP4_REVIEW](../prompts/WP4_REVIEW.md); brief giao việc và hồ sơ tác vụ: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), mục "Attempt 3". Các đánh giá vùng A trước đó (giữ nguyên): [WP4_REVIEW_A](WP4_REVIEW_A.md), [WP4_RECHECK_A](WP4_RECHECK_A.md) (lần 1) và [WP4_RECHECK_A2](WP4_RECHECK_A2.md) (lần 2). Bằng chứng: `handoff/delivery/evidence/WP4-RECHECK-A3/` (mục lục trong `00-README.txt`; đã che, LF; mã script lưu dạng `*.sh.txt`, `*.mjs.txt`).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP4, vùng A (vận hành), kiểm lại phần thay đổi gắn với digest (WP4-RECHECK-A lần 3) sau WP4-FIXB3. 2026-10-06, 17:00 đến khoảng 17:25 UTC. Người đánh giá: subagent WP4-RECHECK-A lần 3 (profile timesheet-auditor, agent trên bảng `a9f9312409bbc8109` theo ghi nhận của coordinator), model tự báo `claude-opus-5-5`; yêu cầu opus/xhigh; effort và tốc độ không quan sát được từ trong phiên.
- **SHA commit được đánh giá và digest nguồn; commit chưa push; độ đầy đủ của nguồn:**
  - Commit `972ccda6409a7521a008c55c35a5b5cf416daf1e`, tức `freeze_commit` của WP4-REGATE3; commit cha là `cc34e7f`. `origin/main` là cùng commit, nên không có commit chưa push.
  - Digest nguồn `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` trên 775 tệp (không tính `handoff/`), bằng digest chính thức của gate.
  - Đã ghi trước (17:00 UTC) và sau các kiểm tra (17:10 UTC) trong repository, bằng dạng `git ls-tree` và `scripts/source-digest.mjs` (`00`, `99`). Đã kiểm lại sau khi viết xong báo cáo, hồ sơ tác vụ và bằng chứng (`99b`). HEAD không đổi, và không tệp nào ngoài `handoff/` thay đổi.
  - Nguồn đầy đủ: một bản export `git archive` của commit. Mã cây đầy đủ `b0545cec…` bằng cây đóng băng, và digest giống nhau trước và sau các kiểm tra (`00b`, `99`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - Phần thay đổi kể từ `cc34e7f` chạm 7 đường dẫn ngoài `handoff/`. Mỗi đường dẫn thuộc quyền sở hữu của WP4-FIXB3, và không đường dẫn nào là mã chạy của vùng A. `package.json`, tệp lock và `.npmrc` giống hệt blob.
  - Thay đổi docs/07 chỉ ở dòng 46, EN và VI. Nó chỉ chạm phần phát biểu về giới hạn và ngân sách của bộ đọc workbook, và các con số khớp với mã.
  - `npm ci` không in dòng deprecation nào. `npm run verify` đạt khi `DATA_DIR` và `DATABASE_PATH` được export: 76 tệp, 1755 test, và cùng 41 kiểm tra smoke như lần 2.
  - Đã đọc kết quả drill của WP4-REGATE3: 208 PASS, tên các kiểm tra giống hệt drill của lần 2.
  - Bảy probe vùng A của lần 1 đạt lại, với các dòng kiểm tra giống hệt.
  - Các lệnh của giai đoạn build trong Dockerfile, chạy không qua Docker, tạo ra `dist/` không có map và không có `sourceMappingURL`.
  - Mọi kết luận của lần 1 và lần 2 vẫn đúng.
  - Không có lỗi. Các rủi ro trước vẫn giữ. Hai rủi ro Info mới (R-RA6, R-RA7) liên quan đến một khuyến cáo của gói chỉ dùng khi phát triển và một nhãn của drill, không liên quan đến sản phẩm.
- **Phạm vi đã thực sự xem/chạy:**
  - Đã đọc:
    - AGENTS.md (từ đĩa) và brief (mục lần 3);
    - WP4_REVIEW và mẫu REVIEW;
    - WP4_RECHECK_A2, được giữ nguyên, và kết quả lần 1, lần 2 trong brief;
    - kết quả của WP4-FIXB3 và WP4-REGATE3, cùng bằng chứng của REGATE3;
    - các mục trên bảng của WP4-RECHECK-A, WP4-FIXB3, WP4-FIXB3-FREEZE, WP4-REGATE3 và WP4-RECHECK-B3, để tách tác giả với người kiểm định.
  - Mã và tài liệu đã đọc:
    - toàn bộ `git diff cc34e7f 972ccda` ngoài handoff;
    - `workbookImport.ts`: thay đổi R-B2-1, cùng `importedPeriodError` và `isImportedTimesheet` không đổi;
    - `templateMapping.ts`: WeakMap `matchedHoliday`;
    - các giới hạn và chú thích ngân sách của `xlsxReader.ts`;
    - đoạn thay đổi của docs/07, EN và VI (so sánh theo từ);
    - giai đoạn build của `Dockerfile`, và kiểm tra bundle trong `scripts/container-drill.mjs`.
  - Đã chạy trên bản export:
    - `npm ci`, `npm ls`, `npm audit --omit=dev` và `npm audit` đầy đủ;
    - `npm run verify` với `DATA_DIR` và `DATABASE_PATH` được export và bật theo dõi deprecation;
    - các lệnh giai đoạn build của Dockerfile trên một bản export thứ hai, không dùng Docker;
    - các probe P2, P8, P4, P7, P3, R-A1 và A-03 của lần 1, không sửa;
    - các kiểm tra mã nguồn và digest chỉ đọc.
  - Không chạy lệnh Docker nào.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| Digest dạng `git ls-tree` và `scripts/source-digest.mjs` trong repository, trước và sau | HEAD `972ccda` = `origin/main`; `635f909d…` (775 tệp) cả hai lần; không có thay đổi ngoài handoff | `00`, `99` |
| `git archive 972ccda`; git dir riêng `add -A`, `write-tree` (ngoài repository) | cây `b0545cec…` = cây đóng băng; digest `635f909d…` trước và sau các kiểm tra | `00b`, `99` |
| `git diff --name-status cc34e7f 972ccda`; `git diff --quiet … -- package.json package-lock.json` | 148 đường dẫn: 141 dưới `handoff/` (134 thêm, 7 sửa), 7 bên ngoài, tất cả thuộc FIXB3; tệp gói không đổi (exit 0; blob `c74a01b9`, `f4f491a6`) | `10` |
| Kiểm tra mã nguồn chỉ đọc (`git grep`, `git rev-parse <commit>:<path>`, `git diff --word-diff`) | không đường dẫn vùng A nào đổi kể từ `0f7fba2`; hai export dùng ngoài vùng B giống hệt; docs/07 chỉ đổi 2 câu của dòng 46; các con số khớp với mã | `11` |
| `npm ci`; `npm ls fast-xml-parser`; `npm audit --omit=dev`; `npm audit` (Node 24.21.0, npm 11.18.0) | exit 0, 161 gói, không dòng deprecation; không có `fast-xml-parser`; audit production 0; audit đầy đủ có 1 mức high trong `source-map-js` 1.2.1 chỉ dùng khi phát triển | `12` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR` và `DATABASE_PATH` được export | exit 0: typecheck, lint, 76 tệp / 1755 test, build, SMOKE PASSED (41); không dòng deprecation; thư mục `DATA_DIR` được export vẫn trống | `13`, `13b` |
| `npm run build:server -- --sourceMap false`, rồi `BUILD_SOURCEMAPS=off npm run build:client`, trên bản export thứ hai | exit 0, 0; `dist/`: 116 tệp, 0 `*.map`, 0 `sourceMappingURL`; có bộ đọc của FIXB3; bundle `index-ZGs6tcbH.js` | `14` |
| Đọc `04-drill.txt` của WP4-REGATE3 và so với `15-drill.txt` của lần 2 | exit 0, 208 PASS (33/31/57/35/27/23), 0 FAIL; tên kiểm tra giống hệt; bundle được phục vụ giống `14` | `15` |
| Chạy lại các probe của lần 1, không sửa: P2, P8, P4, P7, P3, R-A1, A-03 | tất cả exit 0: 31, 8, 16, 23, 10, 24 và 15 PASS; các dòng kiểm tra giống lần 2 | `20`-`27` |
| `validate_package.py --preflight` (Python của workflow), sau khi viết cặp báo cáo và hồ sơ tác vụ | exit 0, PASS, 80 cặp bản dịch | `28` |
| `scripts/precommit-check.mjs` trên các tệp của tác vụ này, stage trong git dir riêng ngoài repository, chạy sau cùng | exit 0, 0 phát hiện, ở mỗi lần chạy (31 tệp ở lần cuối) | `29` |

- **Phát hiện:** không có. Không quan sát thấy lỗi nào trong bản được đánh giá.
- **Các kiểm tra đã xác minh, theo từng mục phạm vi lần 3 của brief:**
  1. Phần thay đổi (`10`, `11`):
     - `git diff --name-status cc34e7f 972ccda` liệt kê 7 đường dẫn ngoài `handoff/`:
       - `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` và `src/server/services/workbookImport.ts`;
       - `tests/integration/workbook-reader.test.ts` và `workbook-import.test.ts`;
       - docs/07 EN và VI.
     - Mỗi đường dẫn đều thuộc quyền sở hữu của WP4-FIXB3 trên bảng. `src/client/importModel.ts`, `.claude/`, `reference/`, các migration, `AGENTS.md` và `CLAUDE.md` không đổi.
     - 141 đường dẫn handoff là hồ sơ và bằng chứng:
       - cặp báo cáo WP4-RECHECK-A2 và WP4-RECHECK-B2;
       - chín brief tác vụ dưới `handoff/delivery/tasks/`;
       - bảng điều phối và cặp checkpoint workflow;
       - 125 tệp bằng chứng.
     - Không đường dẫn nào là mã chạy của vùng A. Mỗi mục sau giống hệt blob tại `0f7fba2`, `cc34e7f` và `972ccda`:
       - `src/server/ops`, `db`, `jobs`, `routes`, `mail` và `files`;
       - `cli.ts`, `app.ts`, `index.ts` và `config.ts`;
       - `bootstrap.ts`, `automation.ts` và `operationsStatus.ts`;
       - `Dockerfile`, `compose.example.yaml`, `.dockerignore` và `.env.example`;
       - `scripts/`, `vite.config.ts` và `tsconfig.json`;
       - docs/03, docs/10 và docs/11, EN và VI.
     - Các nơi import module đã đổi:
       - `routes/imports.ts`, route import của vùng B;
       - `finalization.ts`, `otLeave.ts` và `timesheetCommands.ts`, chỉ import `importedPeriodError` và `isImportedTimesheet`. Văn bản của chúng giống hệt ở cả hai commit (`cmp` exit 0).
       - Không module nào của vùng A import module đã đổi. Các đoạn thay đổi của `workbookImport.ts` chỉ chạm `reportDay` và `buildReport` (R-B2-1). Phần lưu tệp nguồn import, thứ mà bản sao lưu chép, không đổi.
     - `package.json` và `package-lock.json` không đổi (`git diff --quiet` exit 0; cùng mã blob), `.npmrc` cũng vậy.
     - Thay đổi docs/07 là một dòng (46), EN và VI. So sánh theo từ cho thấy chỉ hai câu thay đổi:
       - danh sách từ chối của bộ đọc: 16 → 8 MiB và 200.000 → 150.000, thêm giá trị thuộc tính được giữ lại (255 ký tự) và khai báo bảng mã khác UTF-8 hoặc UTF-16;
       - câu ngân sách, được thêm trường hợp xấu nhất đo được (khoảng 290 ms và +89 MiB).
       - Cam kết 500 ms / 150 MiB không đổi.
       - Mọi con số khớp với `DEFAULT_READER_LIMITS` và lệnh từ chối `unsupported_encoding` tại `972ccda`.
       - Đây là phát biểu về giới hạn và ngân sách của bộ đọc workbook, nên không rộng hơn mức brief cho phép. Không có nội dung vận hành nào thay đổi.
       - Dòng tải lên "tối đa 8 MiB" của docs/11 là `maxCompressedBytes`, không đổi.
  2. `npm ci` và `npm run verify` trên bản export (`12`, `13`, `13b`):
     - `npm ci`: exit 0, 161 gói, không dòng deprecation, không có `fast-xml-parser`. `npm audit --omit=dev`: 0 lỗ hổng.
     - `npm run verify` với `DATA_DIR` và `DATABASE_PATH` được export và `--trace-deprecation --pending-deprecation`: exit 0.
       - 76 tệp / 1755 test, so với 1750 ở lần 2; 5 test mới là test workbook vùng B của FIXB3.
       - SMOKE PASSED, cùng 41 tên kiểm tra như lần 2.
       - Không dòng deprecation.
       - Thư mục `DATA_DIR` được export có 0 mục trước và sau. A-04 vẫn đúng.
  3. Kết quả drill của WP4-REGATE3 (`15`):
     - Đã đọc: exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS (33/31/57/35/27/23), 0 FAIL. 208 tên kiểm tra giống hệt drill của lần 2.
     - Giai đoạn 1 đạt:
       - quét tệp bị cấm, kể cả source map dưới `/app/dist`;
       - bundle không có `sourceMappingURL`;
       - `/assets/<bundle>.map` trả về 404;
       - user dạng số, không phải root, và chỉ có dependency production.
     - Giai đoạn 2: sao lưu trong khi đang ghi, kể cả tệp nguồn import.
     - Giai đoạn 3: khôi phục ở trạng thái tạm dừng với lý do `restored`, rồi giải phóng theo id và `--all`, mỗi job được giải phóng chỉ gửi đúng một lần (R-A5).
     - Giai đoạn 4 và 5: nâng cấp từ schema WP3, và quay lui.
     - Tôi không chạy lại container drill (xem "Các gate bắt buộc chưa chạy"). Thay vào đó:
       - Tôi chạy các lệnh giai đoạn build của `Dockerfile` trên một bản export thứ hai (`14`): `tsc --sourceMap false`, rồi vite với `BUILD_SOURCEMAPS=off`. Kết quả: 116 tệp, 0 `*.map`, 0 `sourceMappingURL`, cùng các con số như image của lần 1 và lần 2.
       - Bundle đó có tên băm theo nội dung `index-ZGs6tcbH.js` và độ dài sau giải mã 454.172. Cả hai khớp với thứ container của REGATE3 đã phục vụ.
  4. Các kết luận của lần 1 và lần 2 vẫn đúng (`20`-`27`):
     - Bảy probe của lần 1, chạy lại không sửa trên server và CLI đã build của bản đóng băng này, đều exit 0, với các dòng kiểm tra giống hệt lần 2:
       - P2, sao lưu khi có ba tiến trình ghi và khôi phục cô lập với hash và số dư: 31;
       - P8, danh sách cho phép của admin: 8;
       - P4, ranh giới đích sao lưu và khôi phục: 16;
       - P7, cửa sổ lưu giữ và lượt quét khi tạm dừng: 23;
       - P3, thoát qua junction khi prune: 10;
       - từ chối R-A1 và prune bình thường: 24;
       - A-03, từ chối bootstrap mà không in dấu hiệu nào: 15.
     - Như vậy:
       - WP4-A-01 đến A-04 đã đóng;
       - R-A1, R-A5 và R-A7 đúng;
       - sao lưu và khôi phục, tạm dừng và đối soát, nâng cấp và quay lui, lưu giữ và danh sách cho phép của admin vẫn đạt;
       - đồng bộ tài liệu vẫn đạt;
       - trường hợp trùng giây vẫn chấp nhận được (Info).
     - Mã vùng A mà các kết luận này dựa vào giống hệt từng byte giữa `0f7fba2`, `cc34e7f` và `972ccda`.
- **Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh:**
  - **R-RA1 (Info), trường hợp trùng giây: không đổi và vẫn chấp nhận được.** `ops/prune.ts` không đổi. Trong lần chạy này, 6 trên 12 cặp CLI liền nhau rơi vào cùng một giây UTC, và trong 3 cặp `--prune` đã xóa bản sao lưu nó vừa in ra. Luôn còn lại một bản sao lưu đầy đủ của giây đó (`25`).
  - **R-RA2 (Low), bản sao lưu đi kèm trước nâng cấp: không đổi.** Một lần `--prune` sau đó trong cùng ngày UTC xóa nó; sang ngày UTC kế tiếp thì nó được giữ (`25`).
  - **R-RA3 (Info), source map của bên thứ ba trong image: không đo lại.** Dependency không đổi kể từ lần 2, khi đếm được 560 (chỉ pdf-lib). Chúng không bao giờ được phục vụ; giai đoạn 1 của REGATE3 cho thấy `/assets/*.map` trả về 404.
  - **R-RA4 (Info), một bản sao lưu ở tương lai xa chặn prune: không đổi** (mã không đổi).
  - **R-RA5 (Info), công cụ drill: vẫn áp dụng.**
    - Bản build image của REGATE3 mất 8 s với tệp gói không đổi, nên các lớp `npm ci` rất có thể đã lấy từ cache. Đây là suy luận; log build không có trong bằng chứng của nó.
    - Khi đó kiểm tra "build output (including npm ci) has no deprecation line" không thấy đầu ra nào của `npm ci`.
    - Cả hai lần chạy `npm ci` của lần kiểm định này đều không in dòng deprecation nào (`12`, `14`).
  - **R-RA6 (Info, mới, khuyến cáo dependency, chỉ khi phát triển):**
    - `npm audit` đầy đủ báo 1 mức high, GHSA-68fv-2mgg-jv7q trong `source-map-js` 1.2.1 (`vite` → `postcss`).
    - Tệp lock đánh dấu nó `"dev": true`. `npm ls --omit=dev` không liệt kê nó, và `npm audit --omit=dev` là 0, nên nó không có trong image.
    - Tệp lock giống hệt từng byte với `cc34e7f`, và REGATE3 cũng thấy khuyến cáo này.
    - Nó chỉ ảnh hưởng chuỗi công cụ build, vốn chỉ xử lý map của chính dự án. Tùy chọn: một tác vụ dependency sau này có thể lấy phiên bản đã sửa.
  - **R-RA7 (Info, mới, nhãn của drill):** kiểm tra bundle của drill in độ dài chuỗi sau giải mã dưới nhãn "bytes" (`container-drill.mjs:1514`): in 454.172 trong khi tệp trên đĩa là 454.210 byte. Điều kiện đạt không bị ảnh hưởng.
  - Lỗi chữ nhỏ (Info, có từ trước): docs/11 mục 4 bước 1 nói bản sao lưu "chỉ in số đếm", nhưng nó cũng in tên thư mục mới. docs/11 không đổi.
- **Các gate bắt buộc chưa chạy/bị chặn và lý do:**
  - **Lần kiểm định này không chạy lại container drill và không quét lớp image.** Brief lần 3 yêu cầu đọc kết quả drill của WP4-REGATE3, và chỉ cho dùng Docker khi cần. Tôi đánh giá là không cần:
    - đầu vào của image không đổi, ngoài ba module import đã biên dịch: `Dockerfile`, `compose.example.yaml`, `.dockerignore`, tệp gói, `.npmrc`, `vite.config.ts`, `tsconfig*.json` và mọi module vùng A;
    - các lệnh giai đoạn build đã được tái hiện không qua Docker (`14`);
    - drill của REGATE3 đọc nhất quán, với cùng 208 kiểm tra.
    - Một lần drill cũng sẽ làm nặng máy trạm này trong lúc WP4-RECHECK-B3 đang đo thời gian.
    - Vì vậy đường container trên đúng bản đóng băng này dựa vào lần chạy của verifier REGATE3, một kết quả được báo cáo, cùng với phần tái hiện của lần kiểm định này và các lần chạy container của lần 1, lần 2 trên mã vùng A giống hệt từng byte.
  - Đích NAS và arm64 gốc: NOT VERIFIED (không có quyền truy cập của chủ; các bước của chủ trong docs/11), như lần 1 và lần 2.
  - Không chạy lại `npm run test:e2e`. Vùng A không yêu cầu; REGATE3 báo 145 đạt và 5 bỏ qua trên bản đóng băng này. Không dùng SMTP thật (chỉ capture).
  - P1 và P1b (bộ chạy migration), P5 (token bootstrap), P6 (proxy và cấu hình) và P9 của lần đánh giá đầu không được chạy lại như probe riêng.
    - Mã của chúng không đổi kể từ `13a258d` và một lần nữa kể từ `cc34e7f` (`11`).
    - 1755 test và drill của REGATE3 bao phủ chúng.
  - Tính đúng của FIXB3 trong vùng B thuộc về WP4-RECHECK-B3: ngân sách phân tích, giải mã một lần, R-B2-1, R-B2-2 và phép so sánh workbook lành tính. Lần kiểm lại này chỉ xét ảnh hưởng của nó lên vùng A.
- **Xử lý phát hiện trước:**
  - WP4-A-01, A-02, A-03 và A-04: vẫn đóng trên `972ccda` (`11`, `13`, `14`, `15`, `26`).
  - R-A1, R-A5 và R-A7: vẫn đúng (`15`, `24`, `25`).
  - R-RA1, R-RA2, R-RA4 và R-RA5: không đổi, backlog tùy chọn. R-RA3: không đo lại; dependency không đổi.
  - Rủi ro Info mới: R-RA6 và R-RA7.
  - Những gì thay đổi kể từ lần 2:
    - digest, `96445de4…` thành `635f909d…`;
    - số test 1750 thành 1755, tất cả là test workbook vùng B;
    - mẫu trùng giây: 6 trên 12 cặp, 3 lần xóa.
  - R-A2, R-A3, R-A4, R-A6, R-A8 và R-A9 của lần đánh giá đầu giữ nguyên như đã ghi.
- **Mức sẵn sàng phần mềm, sự cho phép của chủ và kết quả thử nghiệm, tách riêng:**
  - Mức sẵn sàng phần mềm của vùng A: được chấp nhận tại `972ccda` / `635f909d…` trên máy trạm. NAS và arm64 chưa được xác minh.
  - Sự cho phép của chủ: không yêu cầu và không được cấp; không triển khai và không gửi gì.
  - Kết quả thử nghiệm: không có (WP5).
- **Một hành động/prompt tiếp theo:** coordinator ghi nhận WP4-RECHECK-A lần 3 là PASS tại digest `635f909d…`. Khi WP4-RECHECK-B3 xong, chuyển WP4 sang nghiệm thu. R-RA1, R-RA2, R-RA5, R-RA6 và R-RA7 có thể đưa vào backlog như các cải tiến tùy chọn cho prune, runbook, drill hoặc dependency.

Không bịa phát hiện và không ghi nhận đạt khi chưa quan sát. Một đánh giá một phần không phải là nghiệm thu đầy đủ.

## Nguồn gốc subagent độc lập

- **Tác vụ/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá:**
  - WP4-RECHECK-A, lần 3. Người đánh giá: subagent timesheet-auditor, agent trên bảng `a9f9312409bbc8109` (`claude-opus-5-5`).
  - Tác giả của phần thay đổi được đánh giá:
    - WP4-FIXB3 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - committer WP4-FIXB3-FREEZE `aaeffec9c7edac640`, sonnet;
    - verifier WP4-REGATE3 `aecfa5a35b65989fd`, sonnet.
  - Model tác giả mạnh nhất của bản này là `claude-opus-5-5`, nên người đánh giá không yếu hơn.
  - Người đánh giá không phải là:
    - người kiểm định lần 1 `a659b8cbd52722f18`;
    - người kiểm định lần 2 `aabafcca9efc225db`;
    - người kiểm định vùng A đầu tiên `af8b9184c8adf6eb0`;
    - người kiểm định WP4-RECHECK-B3 `a0e015d15e6c5c5fb`.
- **Ngữ cảnh mới; xác nhận người đánh giá không viết thay đổi:** ngữ cảnh mới. Người đánh giá này không viết gì trong WP4.
  - Chỉ viết báo cáo này, bản dịch, kết quả lần 3 trong brief và `evidence/WP4-RECHECK-A3/`.
  - Không sửa mã nguồn nào.
  - Probe và build chạy trong một bản export tạm ngoài Dropbox. Không dùng chung tệp nào với WP4-RECHECK-B3.
- **Digest nguồn trước/sau; bằng chứng gate cho bản đó:** `635f909d…c3f7b` trước và sau, trong repository và trên bản export. Nó bằng digest chính thức của WP4-REGATE3 (`handoff/delivery/evidence/WP4-REGATE3/`).
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP4_RECHECK_A3.md` (tệp mới). `WP4_RECHECK_A2`, `WP4_RECHECK_A`, `WP4_REVIEW_A` và các đánh giá khác không đổi.
- **Xử lý phát hiện và tác vụ sửa/kiểm lại tiếp theo của coordinator:** không cần tác vụ sửa cho vùng A. Backlog tùy chọn: R-RA1 đến R-RA7. Tiếp theo: nghiệm thu WP4 khi WP4-RECHECK-B3 xong.
