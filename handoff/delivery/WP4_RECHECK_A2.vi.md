# Kiểm lại WP4 — vùng A (vận hành), lần 2: kiểm lại phần thay đổi trên bản đóng băng của vòng sửa thứ hai

Mẫu: [REVIEW](../templates/REVIEW.md). Bản gốc tiếng Anh (có thẩm quyền): [WP4_RECHECK_A2.md](WP4_RECHECK_A2.md). Prompt đánh giá: [WP4_REVIEW](../prompts/WP4_REVIEW.md); brief giao việc và hồ sơ tác vụ: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md), mục "Attempt 2". Các đánh giá vùng A trước đó (giữ nguyên): [WP4_REVIEW_A](WP4_REVIEW_A.md) và [WP4_RECHECK_A](WP4_RECHECK_A.md) (lần 1). Bằng chứng: `handoff/delivery/evidence/WP4-RECHECK-A2/` (mục lục trong `00-README.txt`; đã che, LF; mã script và probe lưu dạng `*.sh.txt`, `*.mjs.txt`).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP4, vùng A (vận hành), kiểm lại phần thay đổi gắn với digest (WP4-RECHECK-A lần 2) sau WP4-FIXB2 và WP4-DEPCLEAN. 2026-10-06, 14:54 đến khoảng 15:20 UTC. Người đánh giá: subagent WP4-RECHECK-A lần 2 (profile timesheet-auditor, agent trên bảng `aabafcca9efc225db` theo ghi nhận của coordinator), model tự báo `claude-opus-5-5`; yêu cầu opus/xhigh; effort và tốc độ không quan sát được từ trong phiên.
- **SHA commit được đánh giá và digest nguồn; commit chưa push; độ đầy đủ của nguồn:**
  - Commit `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d`, tức `freeze_commit` của WP4-REGATE2. `origin/main` là cùng commit, nên không có commit chưa push.
  - Digest nguồn `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` trên 775 tệp (không tính `handoff/`), bằng digest chính thức của gate.
  - Đã ghi trước (14:54 UTC) và sau (15:08 UTC) trong repository, bằng dạng `git ls-tree` và `scripts/source-digest.mjs` (`00`, `99`). Đã kiểm lại sau khi viết xong báo cáo, hồ sơ tác vụ và bằng chứng (`99b`). HEAD không đổi, và không tệp nào ngoài `handoff/` thay đổi.
  - Nguồn đầy đủ: một bản export `git archive` của commit. Mã cây đầy đủ `940def94…` bằng cây đóng băng, và digest bằng nhau trước và sau mọi kiểm tra (`00b`, `99`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - Phần thay đổi kể từ `0f7fba2` chạm 9 đường dẫn ngoài `handoff/`, mỗi đường dẫn thuộc WP4-FIXB2 hoặc WP4-DEPCLEAN. Không đường dẫn nào là mã chạy của vùng A, và không module nào của vùng A import chúng.
  - Thay đổi tệp lock chỉ gỡ `fast-xml-parser` và 7 gói phụ thuộc bắc cầu của nó. Không thêm và không đổi gói nào.
  - Vùng A vẫn đạt trên bản đóng băng mới. `npm ci` không in dòng deprecation nào, `npm run verify` đạt khi `DATA_DIR` được export, và toàn bộ drill đạt với 208 kiểm tra. Cả image từ cache lẫn image build không cache đều không có map nào dưới `/app/dist`, và bảy probe vùng A của lần 1 đều đạt với cùng bộ kiểm tra.
  - Mọi kết luận của lần 1 vẫn đúng. Chỉ các con số thay đổi (số gói, số test, số map bên thứ ba); chúng được liệt kê ở mục "Xử lý phát hiện trước".
  - Không có lỗi. Bốn rủi ro trước vẫn giữ, R-RA3 với con số nhỏ hơn. Một rủi ro Info mới (R-RA5) liên quan đến công cụ drill, không liên quan đến sản phẩm.
- **Phạm vi đã thực sự xem/chạy:**
  - Đã đọc: AGENTS.md (từ đĩa), brief (mục lần 2), WP4_REVIEW, mẫu REVIEW, WP4_RECHECK_A và kết quả tác vụ của nó, kết quả của WP4-FIXB2, WP4-DEPCLEAN và WP4-REGATE2, và các mục trên bảng của những tác vụ này để tách tác giả với người kiểm định.
  - Mã và tài liệu đã đọc: toàn bộ `git diff 0f7fba2 cc34e7f` ngoài `handoff/`, gồm `workbookImport.ts` (đường preview và hai export không đổi `importedPeriodError`, `isImportedTimesheet`), phần đầu và các giới hạn của `xlsxReader.ts`, và đoạn thay đổi của docs/07 (EN và VI). Thêm `scripts/container-drill.mjs` (kiểm tra build và map), `Dockerfile`, `vite.config.ts` và `compose.example.yaml`.
  - Đã chạy trên bản export: probe so sánh tệp lock; `npm ci` và `npm audit --omit=dev`; `npm run verify` với `DATA_DIR` và `DATABASE_PATH` được export; bản build WP3 và toàn bộ container drill với `--wp3`; một lần build image không cache trong Compose project `ts-wp4-rca2`; quét lớp của cả hai image mà không khởi động container; các probe P2, P8, P4, P7, P3, R-A1 và A-03 của lần 1, không sửa; kiểm tra mã nguồn chỉ đọc.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| Digest dạng `git ls-tree` và `scripts/source-digest.mjs` trong repository, trước và sau | HEAD `cc34e7f`; `96445de4…` (775 tệp) cả hai lần; không có thay đổi ngoài handoff | `00`, `99` |
| `git archive cc34e7f`; git dir riêng `add -A`, `write-tree` (ngoài repository) | cây `940def94…` = cây đóng băng; digest `96445de4…` trước và sau mọi kiểm tra | `00b`, `99` |
| `git diff --name-status 0f7fba2 cc34e7f` | 127 đường dẫn: 118 dưới `handoff/delivery/`, 9 bên ngoài, tất cả là đường dẫn sở hữu của FIXB2 hoặc DEPCLEAN; không có đường dẫn quản trị hay vùng A | `10` |
| `node p-lock.mjs` trên cả hai phiên bản của `package.json` và `package-lock.json` | exit 0, `LOCK CHECK PASSED`: gỡ 8 mục, thêm 0, đổi 0; cả 8 thuộc bao đóng của `fast-xml-parser`, không gói nào bên ngoài cần chúng | `11` |
| `npm ci`; `npm audit --omit=dev` (Node 24.21.0, npm 11.18.0) | exit 0, 161 gói, không dòng deprecation, 8 gói đã gỡ không còn trong `node_modules`; audit 0 lỗ hổng | `12` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, `DATA_DIR` và `DATABASE_PATH` được export | exit 0: typecheck, lint, 76 tệp / 1750 test, build, SMOKE PASSED (41 kiểm tra, giống lần 1); không dòng deprecation; thư mục `DATA_DIR` được export vẫn trống | `13` |
| Bản build WP3 (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0 | `14` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-rca2 --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`, 33/31/57/35/27/23 PASS (208), 0 FAIL | `15` |
| Quét lớp image của drill (`docker image save`, `tar`) | `/app/dist`: 116 tệp, 0 `*.map`, 0 `sourceMappingURL`; 560 map bên thứ ba (chỉ pdf-lib); không còn gói đã gỡ | `16` |
| `docker compose --project-name ts-wp4-rca2 --file compose.example.yaml build --no-cache` | exit 0; mọi bước nguồn được build lại; `tsc --sourceMap false`; vite không in map; 0 dòng deprecation | `17` |
| Quét lớp image build không cache | cùng các con số; `/app/dist` giống từng byte với image của drill | `18` |
| Phần còn sót của Docker theo project và tên; `docker image rm` cả hai image kiểm định | không còn gì | `19` |
| Chạy lại các probe của lần 1, không sửa: P2, P8, P4, P7, P3, R-A1, A-03 | tất cả exit 0: 31, 8, 16, 23, 10, 24 và 15 PASS; các dòng kiểm tra giống lần 1 | `20`-`26` |
| Kiểm tra mã nguồn chỉ đọc | xem tệp | `27` |
| `validate_package.py --preflight` (Python của workflow), sau khi viết cặp báo cáo | exit 0, PASS, 78 cặp bản dịch | `28` |
| `scripts/precommit-check.mjs` trên các tệp của tác vụ này, stage trong git dir riêng ngoài repository, chạy sau cùng | exit 0, 0 phát hiện | `29` |

- **Lỗi:** không có. Không quan sát thấy lỗi nào trong snapshot được đánh giá.
- **Các kiểm tra đã xác minh, theo mục phạm vi lần 2 của brief:**
  1. Phần thay đổi:
     - `git diff --name-status 0f7fba2 cc34e7f` liệt kê 9 đường dẫn ngoài `handoff/` (`10`).
       - FIXB2: `xlsxReader.ts`, `templateMapping.ts`, `workbookImport.ts`, hai tệp test workbook và docs/07 EN và VI.
       - DEPCLEAN: `package.json` và `package-lock.json`.
       - Mỗi đường dẫn đều là đường dẫn sở hữu của các tác vụ đó trên bảng. Không có gì đổi dưới `.claude/`, `reference/`, các migration, `AGENTS.md` hay `CLAUDE.md`.
     - Không đường dẫn nào trong 9 đường dẫn là mã chạy của vùng A (`27`).
       - Không đường dẫn nào đổi dưới `ops/`, `db/` hay `jobs/`, cũng không trong `cli.ts`, `app.ts`, `index.ts`, `config.ts`, `bootstrap.ts`, `automation.ts` hay các route.
       - Dockerfile, ví dụ Compose, `.dockerignore`, `.env.example`, `scripts/`, docs/03, docs/10 và docs/11 cũng không đổi.
       - Không module nào của vùng A import một module đã đổi.
       - `timesheetCommands`, `otLeave` và `finalization` chỉ import `importedPeriodError` và `isImportedTimesheet` từ `workbookImport.ts`, và diff không chạm vào hai hàm này.
       - Thay đổi docs/07 là một đoạn duy nhất về nhập workbook (dòng 46, EN và VI). Các con số của nó bằng mã: 100.000/200.000 lần mở markup, 64/200.000/500.000 thuộc tính, thẻ mở 64 KiB, độ sâu 40, tên sheet 100, 2.000 dòng ngày lễ, 200 ký tự, báo cáo 2 MiB.
     - Thay đổi tệp lock chỉ gỡ `fast-xml-parser` và các gói bắc cầu của chính nó (`11`).
       - `package.json` mất một dòng và giống hệt ở mọi chỗ khác.
       - Tệp lock mất 8 mục: `fast-xml-parser` 5.11.2, `fast-xml-builder` 1.3.1, `strnum` 2.4.2, `@nodable/entities` 3.1.0, `anynum` 1.0.1, `is-unsafe` 2.0.2, `path-expression-matcher` 1.6.2 và `xml-naming` 0.3.0.
       - Không thêm và không đổi gì, và mục gốc chỉ khác ở phụ thuộc đó.
       - Mỗi mục bị gỡ đều thuộc bao đóng của `fast-xml-parser` trong tệp lock cũ, và không gói nào ngoài bao đóng đó cần chúng.
       - Không mã nguồn, test, script hay tài liệu nào ngoài `handoff/` còn nhắc đến các gói đã gỡ (`27`).
  2. Hành vi vùng A trên bản đóng băng mới:
     - `npm ci`: exit 0, 161 gói (trước là 169), không dòng deprecation. Các gói đã gỡ không còn trong `node_modules`, và `npm audit --omit=dev` không thấy lỗ hổng nào (`12`).
     - `npm run verify` với `DATA_DIR` và `DATABASE_PATH` được export: exit 0, 76 tệp / 1750 test, và cùng 41 kiểm tra smoke như lần 1. Không dòng deprecation; thư mục được export vẫn trống, nên A-04 vẫn đạt (`13`).
     - Đã đọc kết quả drill của WP4-REGATE2: 208 PASS (33/31/57/35/27/23). Tôi chạy lại drill thay vì dựa vào kết quả đó, vì phần thay đổi đổi các phụ thuộc của image và mã nhập mà giai đoạn 6 chạy trong container. Kết quả: exit 0, 208 PASS với cùng số đếm theo giai đoạn (`15`).
       - Giai đoạn 1: user dạng số không phải root, quét tệp cấm gồm `*.map` dưới `/app/dist`, bundle không có `sourceMappingURL`, và `/assets/<bundle>.map` trả 404.
       - Giai đoạn 2: backup trong lúc đang ghi, gồm cả các nguồn nhập.
       - Giai đoạn 3: restore cô lập, tạm dừng gửi ra và giải phóng.
       - Giai đoạn 4 và 5: nâng cấp từ schema WP3, và quay lui.
       - Giai đoạn 6: nhập và số dư đầu.
     - Image không chứa map (`16`-`18`).
       - Image của drill, được BuildKit lấy từ cache, và bản build không cache của tôi giống nhau từng byte dưới `/app/dist`: 116 tệp, 0 `*.map`, 0 `sourceMappingURL`.
       - Bản build không cache đã chạy `npm ci`, `tsc --sourceMap false` và vite không map, và không in dòng deprecation nào.
     - Các probe của lần 1, chạy lại không sửa, đều đạt với các dòng kiểm tra giống hệt lần 1 (`20`-`26`):
       - backup dưới ba luồng ghi và restore cô lập với hash và số dư (P2, 31);
       - allowlist của admin (P8, 8);
       - ranh giới đích của backup và restore (P4, 16);
       - cửa sổ lưu giữ và lượt quét khi tạm dừng (P7, 23);
       - các đường thoát junction của prune (P3, 10);
       - việc từ chối R-A1 và prune bình thường (24);
       - các lần từ chối bootstrap không in dấu hiệu nào (A-03, 15).
  3. Các kết luận của lần 1 vẫn đúng:
     - WP4-A-01 đến A-04: đã đóng.
     - R-A1, R-A5 và R-A7: đúng.
     - Backup và restore, tạm dừng và đối soát, nâng cấp và quay lui, lưu giữ và allowlist của admin đều đạt.
     - Phần đồng bộ tài liệu vẫn đúng.
     - Trường hợp trùng giây vẫn chấp nhận được (Info).
     - Mã vùng A mà chúng dựa vào giống từng byte giữa `0f7fba2` và `cc34e7f`.
     - Những gì đã đổi được liệt kê ở mục "Xử lý phát hiện trước" bên dưới.
- **Rủi ro và đề xuất tùy chọn, tách khỏi lỗi đã chứng minh:**
  - **R-RA1 (Info), trùng giây: không đổi và vẫn chấp nhận được.** `ops/prune.ts` không đổi. Lần chạy này, 8 trong 12 cặp CLI liền nhau rơi vào cùng một giây UTC, và trong 5 cặp đó `--prune` xóa chính backup nó vừa in ra (lần 1: 7 và 3). Luôn còn lại một backup đầy đủ của giây đó (`25`). Tùy chọn: giữ `requiredName` khi trùng.
  - **R-RA2 (Low), backup ghép trước nâng cấp: không đổi.** Một lần `--prune` sau đó trong cùng ngày UTC sẽ xóa nó; sang ngày UTC kế tiếp thì nó được giữ (`25`). Tùy chọn thêm một dòng vào runbook, như ở lần 1.
  - **R-RA3 (Info), source map bên thứ ba trong image: nay còn 560, tất cả của pdf-lib** (trước là 566; 6 map của `fast-xml-parser`, `fast-xml-builder` và `path-expression-matcher` đã đi cùng phụ thuộc). Chúng không bao giờ được phục vụ, và `/assets/*.map` trả 404 (`16`, `18`).
  - **R-RA4 (Info), một backup có thời điểm quá xa trong tương lai chặn prune: không đổi** (mã không đổi; việc từ chối được thấy lại trong `25`).
  - **R-RA5 (Info, mới, công cụ drill, có từ trước): một kiểm tra của drill có thể đạt mà không kiểm gì.**
    - Kiểm tra của giai đoạn 1 "build output (including npm ci) has no deprecation line" chỉ đọc log của `docker build` (`container-drill.mjs:1442-1443`).
    - Khi BuildKit lấy mọi bước từ cache, như lần chạy này (11 `CACHED`, log không có output của `npm ci`, `tsc` hay vite), kiểm tra không có gì để soát và vẫn đạt.
    - Sản phẩm không bị ảnh hưởng: `npm ci` trên bản export và bản build không cache của tôi đều không in dòng deprecation nào (`12`, `17`).
    - Tùy chọn: drill có thể build với `--no-cache`, hoặc ghi rõ trong chi tiết kiểm tra khi mọi bước đều lấy từ cache.
  - Lỗi diễn đạt nhỏ (Info, có từ trước): docs/11 mục 4 bước 1 nói backup "chỉ in số đếm", nhưng nó cũng in tên thư mục mới. docs/11 không đổi.
- **Gate bắt buộc chưa chạy/bị chặn và lý do:**
  - Máy đích NAS và arm64 gốc: NOT VERIFIED (không có quyền truy cập của chủ; các bước của chủ trong docs/11). Chúng nằm ngoài lần kiểm lại trên máy trạm này, như ở lần 1.
  - Không chạy lại `npm run test:e2e`. Nó không bắt buộc cho vùng A, và WP4-REGATE2 báo 145 đạt, 5 bỏ qua trên bản đóng băng này. Không dùng SMTP thật (chỉ capture).
  - Các probe P1 và P1b (bộ chạy migration), P5 (token bootstrap), P6 (proxy và cấu hình) và P9 của đợt kiểm định đầu không được chạy lại thành probe riêng.
    - Mã của chúng không đổi kể từ `13a258d` (bằng chứng `15` của lần 1) và lại không đổi kể từ `0f7fba2` (`10`, `27`).
    - Drill giai đoạn 1, 3, 4 và 5 cùng 1750 test bao phủ chúng trên bản đóng băng này.
  - Tính đúng của bộ quét mới thuộc vùng B (giới hạn tài nguyên, trần báo cáo và phép so sánh trên workbook lành tính) thuộc về WP4-RECHECK-B2. Lần kiểm lại này chỉ xét ảnh hưởng của nó lên vùng A.
- **Xử lý phát hiện trước:**
  - WP4-A-01, A-02, A-03 và A-04: vẫn đóng trên `cc34e7f` (`13`, `15`-`18`, `26`).
  - R-A1, R-A5 và R-A7: vẫn đúng (`15`, `24`, `25`).
  - R-RA1, R-RA2 và R-RA4: không đổi, backlog tùy chọn. R-RA3 được cập nhật thành 560 map.
  - Những gì đã đổi kể từ lần 1:
    - digest, `dfe4541d…` thành `96445de4…`;
    - số gói 169 thành 161;
    - số test 1734 thành 1750, tất cả trong các bộ test workbook của vùng B;
    - số map bên thứ ba 566 thành 560.
  - Các mục R-A2, R-A3, R-A4, R-A6, R-A8 và R-A9 của đợt kiểm định đầu giữ nguyên như đã ghi.
- **Sẵn sàng phần mềm, phép của chủ và kết quả pilot, tách riêng:**
  - Sẵn sàng phần mềm của vùng A: chấp nhận tại `cc34e7f` / `96445de4…` trên máy trạm (Docker Desktop, linux/amd64). NAS và arm64 chưa được xác minh.
  - Phép của chủ: không yêu cầu và không được cấp; không triển khai và không gửi gì.
  - Kết quả pilot: chưa có (WP5).
- **Một bước/prompt tiếp theo:** coordinator ghi WP4-RECHECK-A lần 2 là PASS tại digest `96445de4…`. Khi WP4-RECHECK-B2 xong, chuyển WP4 sang nghiệm thu. R-RA1, R-RA2 và R-RA5 có thể vào backlog như cải tiến tùy chọn cho runbook, prune hoặc drill.

Không có lỗi bịa và không có kết quả đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt đánh giá, ID người đánh giá và ID tác giả được đánh giá:**
  - WP4-RECHECK-A, lần 2. Người đánh giá: subagent timesheet-auditor, agent trên bảng `aabafcca9efc225db` (`claude-opus-5-5`).
  - Tác giả của phần thay đổi được đánh giá:
    - WP4-FIXB2 `a25ba7423ae0846ed` (timesheet-expert, `claude-opus-5-5`);
    - WP4-DEPCLEAN `af38846cc479cc2e3` (`claude-sonnet-5-5`);
    - người commit WP4-FIXB2-FREEZE `a6aac816cd417734e` và người kiểm gate WP4-REGATE2 `acddc52ef017c9200`, đều sonnet.
  - Model tác giả mạnh nhất của snapshot là `claude-opus-5-5` (WP4-FIXB2 và các tác vụ WP4 trước), nên người đánh giá không yếu hơn.
  - Người đánh giá không phải:
    - người kiểm định lần 1 `a659b8cbd52722f18`;
    - người kiểm định vùng A đầu tiên `af8b9184c8adf6eb0`;
    - người kiểm định WP4-RECHECK-B2 `af0ca5d5f3ab94048`.
- **Context mới; xác nhận người đánh giá không viết thay đổi:** context mới. Người đánh giá này không viết gì trong WP4.
  - Nó chỉ viết báo cáo này, bản dịch, kết quả lần 2 trong brief và `evidence/WP4-RECHECK-A2/`.
  - Không sửa mã nguồn nào.
  - Các probe chạy trong một bản export nháp ngoài Dropbox. Không dùng chung tệp nào với WP4-RECHECK-B2.
- **Digest nguồn trước/sau; bằng chứng gate của snapshot đó:** `96445de4…cae7d503` trước và sau (repository và export), bằng digest chính thức của WP4-REGATE2 (`handoff/delivery/evidence/WP4-REGATE2/`).
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP4_RECHECK_A2.md` (tệp mới). `WP4_RECHECK_A`, `WP4_REVIEW_A` và các đánh giá khác không đổi.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** vùng A không cần task sửa. Backlog tùy chọn: R-RA1 đến R-RA5. Tiếp theo: nghiệm thu WP4 khi WP4-RECHECK-B2 xong.
