# Làm mới ghi chú phát hành và các mẫu pilot tạo lại trên dc487c6 (WP5-UX5-AUDIT-RN)

Bản dịch của [WP5_UX5_REVIEW_RN.md](WP5_UX5_REVIEW_RN.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/reviewer và model/effort quan sát được:** WP5, phần làm mới ghi chú phát hành chỉ gồm tài liệu (WP5-UX5-RELNOTES, đóng băng
  thành WP5-UX5-RELNOTES-FREEZE) và các mẫu pilot do WP5-UX5-REGATE15 tạo lại; task WP5-UX5-AUDIT-RN, lần 1, ngày 2026-10-29 từ khoảng
  17:47Z đến 18:10Z. Model reviewer tự báo `claude-opus-5-5` (agent `a78672c074e2e4544` trên bảng), profile timesheet-auditor (effort do
  profile đặt, không quan sát được từ bên trong). Các model tác giả trên bảng là `claude-opus-5-5`, `claude-sonnet-5-5` và một
  `claude-haiku-4-5-20251001`; RELNOTES, bản đóng băng của nó và REGATE15 là `claude-sonnet-5-5`; mạnh nhất là `claude-opus-5-5`, nên
  reviewer không yếu hơn. Agent id của tôi chỉ xuất hiện trên bảng ở task này.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `dc487c6114dd488121b1de1444e11cdacf5c237b` (WP5-UX5-RELNOTES-FREEZE, đã push; là `freeze_commit` của WP5-UX5-REGATE15). HEAD =
  origin/main = commit đó trước (17:48:53Z) và sau (18:02:36Z); không có dòng trạng thái nào ngoài `handoff/`. Digest
  `2072e3f206ff2003a9c7563b23267da463eeae6373f3f4eb98e660137fefb99b`, 882 file, không tính `handoff/`, bằng nhau trước và sau ở ba dạng
  (bản xuất `git archive` sạch băm bằng `git hash-object`, dạng `git ls-tree` của commit đích, `npm run digest` trong repository; các
  dòng đã sắp xếp của dạng bản xuất và dạng ls-tree giống nhau từng byte) và ở `npm run digest` trong một bản clone sạch của commit đích.
  Không có commit chưa push. Source đủ: `npm ci` exit 0 trong bốn bản xuất.
- **Quyết định: FIX REQUIRED.** Một phát hiện mức Low, F-UX5RN-1: tại commit phát hành, `DEVELOPMENT.md:3` (và `.vi.md`) vẫn ghi WP4
  "đang chờ gate cuối gói WP4-GATE và các audit độc lập; chưa được chấp nhận", trong khi các dòng README đã sửa ghi WP1 đến WP4 đã được
  chấp nhận và WP5 đã sẵn sàng về phần mềm, và dẫn người đọc sang DEVELOPMENT. Mọi điểm khác đều đúng:
  - phạm vi đúng là bốn file tài liệu, và bản build sạch của 0b45781 và dc487c6 cho `dist/` giống hệt (250 file), nên kết luận về sản
    phẩm của AUDIT-INT3 được chuyển sang nguyên vẹn;
  - mọi câu đã sửa khớp với bảng task, hồ sơ task, các review và bằng chứng của cổng kiểm;
  - không mất giới hạn hay rủi ro mang theo nào;
  - EN và VI khớp nhau và mọi liên kết đều tồn tại;
  - các mẫu tạo lại đến từ commit đích theo công thức T06, chỉ dữ liệu giả và chế độ capture. Lần chạy riêng của tôi từ commit đích tái
    tạo được chúng; mọi khác biệt so với T06 là giá trị riêng của từng lần chạy, không do commit nào.

  Các kiểm tra bắt buộc đều đạt.

## Phạm vi thật đã xem và chạy

1. Đọc như lời khai, không phải bằng chứng: brief; AGENTS.md trên đĩa; README, docs/12 và bản VI tại 0b45781 và dc487c6 (toàn văn và
   `git diff`); brief, Results và bằng chứng của RELNOTES và REGATE15; hồ sơ RELNOTES-FREEZE; `WP5_UX5_REVIEW_INT3.md`; các mục trên bảng
   của mọi cổng kiểm và audit WP1 đến WP5, RELNOTES, RELNOTES-FREEZE, REGATE15 và câu trả lời Q0 của chủ; `WP5_PILOT_PACKET.md` mục 0 đến
   3; `WP5_HANDOFF.md` (dàn ý và biên bản); bằng chứng và script của T06; log drill của REGATE11; docs/04, 05, 06, 09, 10, 11 và
   DEVELOPMENT về các câu trạng thái.
2. Các bản xuất `git archive` sạch của dc487c6, 0b45781 và 1fe5ad3 (commit của drill), mỗi bản có `npm ci` và `npm run build` riêng; bản
   xuất thứ tư của dc487c6 với `npm ci` và `npm run build:server` cho lần chạy mẫu của tôi; hai bản xuất nguyên trạng cho digest (trước
   và sau) và kiểm tra liên kết; một bản clone sạch cho `npm run digest`. Sau khi viết cặp này, `validate_package.py --preflight` đạt
   (141 cặp, 2.412 liên kết cục bộ; `62-preflight.txt`).
3. Các kiểm tra bắt buộc trong bản xuất của commit đích, lần lượt từng cái: typecheck, lint, build, `npm test`, và so sánh `dist/`.
4. Tạo lại độc lập các mẫu pilot từ commit đích bằng các bản sao script T06 của REGATE15 (giống từng byte), và so sánh ba chiều T06 /
   REGATE15 / của tôi. Tôi đã xem sáu ảnh render của REGATE15.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX5-AUDIT-RN/` (mục lục `00-README.txt`); script của tôi là
`90-*.txt`, các lần lỡ quy tắc ở `99-slips.txt`.

| Lệnh hoặc probe | Kết quả / exit | Bằng chứng |
|---|---|---|
| HEAD, origin/main, trạng thái ngoài `handoff/`; digest trước và sau (ls-tree, `npm run digest`, bản xuất); `npm run digest` trong bản clone sạch | dc487c6 ở mọi nơi; 0 dòng; `2072e3f2…fb99b`, 882 file, mọi dạng, trước và sau | `01-*` |
| `git diff --name-status 0b45781..dc487c6 -- . ':!handoff'` | đúng `README.md`, `README.vi.md`, `docs/12_RELEASE_NOTES.md`, `.vi.md`; exit 0 | `20-name-status.txt`, `21-doc-diff.txt` |
| `npm ci` và `npm run build` sạch của dc487c6, 0b45781 và 1fe5ad3 | đều exit 0; không có cảnh báo kích thước chunk | `02-builds.txt` |
| `dist/` 0b45781 so với dc487c6 | mỗi bên 250 file, mọi đường dẫn và SHA-256 bằng nhau | `50-dist-compare.txt` |
| `dist/server` và `dist/domain` 1fe5ad3 so với dc487c6 | mỗi bên 232 file, giống hệt; toàn bộ `dist/` chỉ khác ở `dist/client` (index.html, chunk vào, năm chunk lazy) | `51-*`, `52-*` |
| typecheck, lint, build, `npm test` trong bản xuất của commit đích | 0, 0, 0, 0; 101 file, 2.397 test; không có dòng deprecation, advisory hay cảnh báo | `03-core.txt` |
| bảng task: cổng kiểm và audit của WP1 đến WP5 và của từng vòng | như dẫn ở mục 2 dưới đây | `10-board-rounds.txt`, `11-board-gates.txt` |
| log drill của REGATE11; bằng chứng về sau; đường dẫn 1fe5ad3..dc487c6 | 209 PASS, 0 FAIL (33/32/57/35/27/23); không cổng kiểm hay audit nào sau đó chạy drill; không đổi file package, Dockerfile, compose, script drill, `vite.config.ts`, `src/server`, `src/domain` hay migration | `55-*`, `53-*`, `54-*` |
| liên kết và tương đương EN/VI của bốn file (bản xuất nguyên trạng) | 173 liên kết (35, 36, 51, 51), 0 thiếu; tiêu đề, SHA và ID bằng nhau; tập liên kết chỉ khác ở liên kết qua lại giữa hai bản | `30-doccheck.txt` |
| không có digest của commit đích trong tài liệu | không có `2072e3f2` và `dc487c6` ngoài `handoff/`; giá trị 64 hex duy nhất là `1e59ad31…` lịch sử; mọi SHA ngắn đều phân giải được | `32-consistency-grep.txt` |
| các câu trạng thái ngoài `handoff/` | `DEVELOPMENT.md:3` và `.vi.md:3` ghi WP4 chưa được chấp nhận (F-UX5RN-1) | `31-stale-status.txt` |
| script mẫu T06 so với REGATE15 | make-samples chỉ khác hai dòng chú thích (nhãn commit), extract giống hệt, ready-check chỉ khác cổng | `40-script-diffs.txt` |
| lần chạy mẫu của tôi từ commit đích (công thức T06) | archive, `npm ci`, `build:server`, make-samples, extract: đều 0; chế độ capture; 11 thư, 6 PDF, `pdf_hash_ok` 6/6, không job nào ở intervention hay failed; S2 không có lý do bị từ chối 422 `reason_required` | `41-samples-run.txt` |
| so sánh ba chiều T06 / REGATE15 / của tôi | 11 / 11 / 11 ghép cặp; 3 giống hệt ở cả ba; 8 bằng nhau khi chuẩn hóa mã nộp; header Date lệch 2-6 phút ở vài lần chạy; không có khác biệt nào khác | `42-samples-compare-three.txt` |
| quyền riêng tư, dữ liệu giả, capture | 21 địa chỉ khác nhau, đều `@example.invalid` hoặc `@timesheet.invalid`; không có đường dẫn profile; không có chữ leave hay holiday trong văn bản PDF nào; ready check 200/200 trên schema 15 | `43-privacy-scan.txt` |
| các commit trên đường dựng PDF và email 69d6340..dc487c6 | 94accda (dòng nghỉ phép khi một ngày có cả ngày lễ và nghỉ phép), f4049aa (nodemailer 10.1.4, zod 4.6.6), 0f52300 và 1fe5ad3 (restore và kiểm tra lần gửi đang chạy; không dựng gì) | `44-render-path-commits.txt` |
| các thông báo | `Auto-Submitted: auto-generated`, hạn nộp theo múi giờ báo cáo, liên kết cần đăng nhập, không Bcc; mọi thư nộp có `text/plain` và `text/html` kèm PDF | `45-notices-grep.txt` |
| kiểm tra tiến trình sót | không có tiến trình node, npm hay Edge nào của task này | `60-leftover-check.txt` |

## 1. Định danh và phạm vi

Khác biệt so với 0b45781 ngoài `handoff/` là bốn file tài liệu, không đổi package hay lockfile. Bản build sạch của hai commit giống nhau
từng byte. AUDIT-INT3 (PASS trên 0b45781 / 67aa715c) đã đánh giá sản phẩm. Kết luận đó được chuyển sang dc487c6 mà không cần chạy lại,
cùng với các mục chạy thật của REGATE14 và drill cùng `npm audit` của REGATE11. Đã xác nhận.

## 2. Độ chính xác của từng câu đã sửa

- **Định danh phát hành, docs/12:7.** Không ghi digest của cây thư mục; câu lịch sử `8e99d2c` / `1e59ad31` / 777 được giữ. Câu mới nói
  WP5-UX5-REGATE14 và WP5-UX5-AUDIT-INT3 đã đạt trên `0b45781` và nghiệm thu lại WP5: trên bảng, cả hai PASS, `freeze_commit` và
  `reviewed_commit` là 0b45781. Câu đó cũng nói ghi chú và README sau đó được làm mới trong một commit chỉ chứa tài liệu, được kiểm cổng
  và audit lại (dc487c6, REGATE15 PASS, audit này), và bản phát hành là commit đó. Đúng, với hai điều phụ thuộc.
  - Bàn giao WP5 chưa ghi SHA, digest và số file. ACCEPT-DOCS phải thêm (R-UX5RN-4).
  - Gạch đầu dòng mở đầu bằng "commit đóng băng cuối gói WP5" trong khi lại gọi REGATE14 trên 0b45781 là cổng kiểm cuối gói (R-UX5RN-1).
- **Cổng kiểm và audit nghiệm thu từng vòng**, đối chiếu với bảng:
  - vòng 1: WP5-UX-REGATE8 và WP5-UX-AUDIT-AB9, cả hai PASS trên 90b98ef;
  - vòng 2: WP5-UX2-REGATE2 và WP5-UX2-AUDIT2, cả hai PASS trên a643794;
  - vòng 3: WP5-UX3-REGATE5 và WP5-UX3-AUDIT-INT, cả hai PASS trên 8e55710;
  - vòng 4: gộp vào vòng 5 theo Q0 a ("cổng kiểm gói và các audit của vòng 5 bao cả vòng 4 và 5");
  - vòng 5: REGATE14 và AUDIT-INT3, PASS trên 0b45781. AUDIT-INT3 thay thế RECHECK-A2 và RECHECK-B3 (ghi chú review của nó và
    `superseded_by` trên bảng).

  Mọi câu đều đúng. Các lần trước bị trượt hoặc cần sửa không được nêu tên, và không cần nêu.
- **Câu về drill, docs/12:119.**
  - REGATE11 (đóng băng 1fe5ad3, quyết định FAIL vì timeout `import.spec.ts:102` trên desktop dưới tải của máy) đã chạy `drill --wp3`:
    209 PASS, 0 FAIL, tổng theo giai đoạn 33/32/57/35/27/23 trong log của nó.
  - Không cổng kiểm hay audit nào sau đó chạy lại. RECHECK-B3, AUDIT-INT, AUDIT-INT2 và AUDIT-INT3 chỉ nhắc drill như kết quả được
    chuyển sang hoặc như tên đường dẫn.
  - REGATE12, 13 và 14 chạy trên a5cbc91, d96df5d và 0b45781 và đã ghi `dist/server` và `dist/domain` giống hệt, file package không đổi.
    Bản build của riêng tôi xác nhận trọn vẹn: `dist/server` và `dist/domain` giống hệt giữa 1fe5ad3 và dc487c6, và git cho thấy từ
    1fe5ad3 không có thay đổi nào ở file package, Dockerfile, compose, script drill, `vite.config.ts`, `src/server`, `src/domain` hay
    migration.
  - Drill còn kiểm bundle client được phục vụ (trạng thái 200, không có `sourceMappingURL`, file `.map` trả 404). Điều đó phụ thuộc
    Dockerfile và `vite.config.ts`, vốn không đổi, chứ không phụ thuộc mã nguồn client, nên các thay đổi trong `dist/client` không làm yếu
    việc chuyển kết quả sang (R-UX5RN-3, chỉ là câu chữ).
- **Các câu trạng thái trong README** (README.md:3, :12, :54 và VI):
  - WP1 đến WP4 được chấp nhận độc lập: WP1-F01-AUDIT; WP2-AUDIT-A2 và B4; WP3-RECHECK-A và BC3; WP4-RECHECK-A và B4, đều PASS.
  - WP5 được chấp nhận (WP5-RECHECK PASS trên 014bd47) và được chấp nhận lại sau các vòng 1 đến 5 (như trên).
  - Pilot đang chờ, NAS NOT VERIFIED, chưa triển khai hay gửi email thật: `stop_before` của bảng và ghi chú NAS của mọi cổng kiểm.

  Tất cả đều đúng. DEVELOPMENT, tài liệu được các dòng này nêu đầu tiên, lại mâu thuẫn với chúng (F-UX5RN-1).
- **Bước tiếp theo và danh sách đọc.** Bước 3 thêm liên kết tới bàn giao WP5 (file có tồn tại). Bước tiếp theo ở bước 4, "chủ sở hữu xem
  xét gói pilot", là trạng thái sau ACCEPT-DOCS. Trước đó, gói pilot vẫn ghi định danh của vòng 3 và dặn không dùng nó (R-UX5RN-4).
- **Dòng mẫu, docs/12:120:** trỏ tới mục 3 của gói pilot và không khẳng định commit nào. Đúng.

## 3. Không mất gì

Mọi dòng đã sửa của docs/12 giữ nguyên nội dung, trừ mệnh đề "còn cần cổng kiểm và audit", và mọi giới hạn vẫn còn, đối chiếu từng dòng
với 0b45781. Giới hạn về drill giữ ý chính (các slice không chạy drill). Nó bỏ một mệnh đề bối cảnh vẫn còn đúng, "Các slice đã chạy
typecheck, lint, unit, integration, full e2e và smoke của server đã build" (R-UX5RN-2, tùy chọn). README chỉ bỏ các câu đã lỗi thời về
WP4 "chưa qua gate" và "không bắt đầu WP5".

## 4. Nhất quán

Các dòng đã sửa khớp với docs/04, 05, 06, 09 và 11.

Câu "vòng này cần cổng kiểm riêng … trước khi định danh phát hành được làm mới" ở docs/10 (dòng 187 và 221) ghi quyết định của từng vòng
tại thời điểm đó, nên không phải câu khẳng định trạng thái.

Gói pilot (định danh phát hành của vòng 3, vòng 4 và 5 "đang diễn ra", mẫu của 69d6340) và bàn giao WP5 (chưa có mục cho vòng 4 và 5) còn
cũ cho tới ACCEPT-DOCS, task đã lên lịch để cập nhật chúng. Đó là điều dự kiến, không phải lỗi của thay đổi này.

DEVELOPMENT.md không có trong danh sách của brief, nhưng các dòng README đã sửa trỏ tới nó, và nó mâu thuẫn với chúng (F-UX5RN-1).

## 5. EN/VI

Hai cặp có cùng tiêu đề, ID, SHA và liên kết (khác biệt liên kết duy nhất là các liên kết qua lại giữa hai bản), và mọi liên kết đều tồn
tại. Tôi đã đọc từng dòng VI đã sửa so với EN. Chúng nêu cùng sự kiện:
- "một timeout e2e khi nhập file dưới tải của máy chủ" là timeout e2e của chức năng import dưới tải của máy;
- "hồ sơ cổng kiểm" và "bản ghi của cổng kiểm" đều chỉ bản ghi của cổng kiểm.

Thiếu dấu phẩy giữa liên kết WP2 và WP3 ở bước 3 của README.vi.md là có từ trước thay đổi này (R-UX5RN-5).

## 6. Các mẫu pilot tạo lại

- **Từ commit đích, theo công thức T06.** Các bản sao của REGATE15 chỉ khác bản T06 ở hai dòng chú thích và cổng của ready-check. Lần
  chạy riêng của tôi dùng đúng các bản sao đó (giống từng byte) trên bản xuất mới của dc487c6 (`npm ci`, `build:server`). Nó cho cùng 11
  thư và 6 PDF một trang, `pdf_hash_ok` 6/6, không job nào ở intervention, và cùng lần từ chối 422 cho S2 khi không có lý do.
- **Chỉ dữ liệu giả và capture.** Chế độ gửi ra được in là `capture`, còn `PRODUCTION_SENDING_ENABLED` và `OUTBOUND_MODE` không được đặt.
  Người dùng là `example.invalid` và Message-ID là `timesheet.invalid`. Chữ ký là đường lượn sóng của dữ liệu seed.
- **Mọi khác biệt so với T06.** Ghép cặp theo người nhận, tiêu đề và revision, cả 11 thư của ba bộ khớp nhau về tiêu đề, header (không
  tính Message-ID, boundary và Date), nội dung đã giải mã và văn bản PDF sau khi chuẩn hóa mã nộp. Các phần MIME và tên tệp đính kèm bằng
  nhau. Các khác biệt còn lại là giá trị riêng của từng lần chạy, không phải commit:
  - **Mã nộp `TS-20261002-<10 hex>`, và vì thế byte và SHA-256 của mỗi PDF.** `submissionIdFor` (`reviewPayload.ts:70-73`) băm user id,
    vốn do `createUser` tạo ngẫu nhiên mỗi lần chạy; hàm này không đổi từ 69d6340. Lần chạy của tôi cho bộ mã thứ ba.
  - **Header Date muộn 2 đến 6 phút ở vài lần chạy:** S3 của REGATE15 lúc 06:32. Ở lần của tôi, S4 lúc 06:32, S6 lúc 06:30, S2 lúc 09:02
    và hai thông báo kết quả lúc 06:36. Các job cùng thời điểm chạy theo thứ tự thay đổi, và một lần gửi chạy trước PDF của nó được thử
    lại ở lượt sau, đúng lần thử lại "Send before the PDF" đã ghi trong tài liệu. Ngày trên PDF không đổi.

  Không commit nào giữa 69d6340 và dc487c6 làm đổi các mẫu này:
  - 94accda chỉ đổi PDF ở ngày có cả ngày lễ và nghỉ phép, và ở đây không có ngày như vậy;
  - nodemailer 10.1.4 của f4049aa giữ header và nội dung bằng nhau;
  - 0f52300 và 1fe5ad3 không dựng gì.

  Danh sách khác biệt do commit gây ra là rỗng.
- **Các ảnh render thể hiện đúng điều mục 3 nói**, trên sáu ảnh render của REGATE15:
  - S1: tên, ảnh chữ ký, 09/28/2026, Revision 1, tổng OT 16:30.
  - S2: Revision 2, Chủ nhật 08:00-15:46, 8:00, tổng OT 17:00, 09/30/2026.
  - S3: không có dấu hiệu tự động, 09/29/2026.
  - S4: "Automatic submission" dưới tiêu đề, 09/29/2026.
  - S5: 09/28/2026, ngày đã ký.
  - S6: không có ô giờ, tổng OT 16:30.
  - Các thông báo nói đúng điều mục 3 nói.

  "Worked" không có giờ hiện trên các PDF tự động. Không có nhãn ngày lễ và không có ngày nghỉ phép.

**Các câu trong mục 3 của gói pilot mà mẫu mới làm cho không còn đúng (cho ACCEPT-DOCS):**

1. `WP5_PILOT_PACKET.md:98`: "tạo từ bản xuất `git archive` sạch của commit `69d6340` (WP5-UX5-T05B-FREEZE, bản đóng băng các slice của
   vòng 5)". Chúng đến từ `dc487c6`, WP5-UX5-RELNOTES-FREEZE (WP5-UX5-REGATE15). Phần còn lại của dòng vẫn đúng: `npm ci`,
   `build:server`, dịch vụ production, đồng hồ cố định, capture, `example.invalid`, cờ không bao giờ được đặt, và lịch.
2. `:100`, đoạn nguồn gốc:
   - "tạo ở 69d6340 (WP5-UX5-T06 …)" nay là REGATE15;
   - "Lần chạy là `make-samples.mjs.txt` trong `evidence/WP5-UX5-T06/`" nay là bản sao của REGATE15 (chỉ khác nhãn commit);
   - "Chạy một lần": REGATE15 đã chạy, thêm một lần chạy đối chứng, và audit này chạy lại;
   - "Commit là bản đóng băng các slice vòng 5, không phải bản phát hành vòng 5 … sau đó các mẫu được tạo lại từ commit phát hành (làm mới
     sau cổng kiểm vòng 5)" không còn đúng: nay chúng đến từ bản ứng viên phát hành.
3. `:106-111`, cột SHA-256 của PDF:
   - S1 `430344dc50deb888eff18fd431ac298f52c1f692a20efc79a2699158004faffa`;
   - S2 `19e8268ed09de67a66c5f4fabe130ceaffa8464a4ec04fa6dfd5425c9c002dc3`;
   - S3 `bdafd3e1bf4d5efe3715b22f9e1d12df6c48759392f9dda1ee9bd717c17ce53b`;
   - S4 `fe1778e012158f709bafac7f90993b8ea582555f0a60ad13f689c9ad34543cac`;
   - S5 `01fede20046b4a1168573e08aef0d6bbc925d44b4847e69a9014767a8539ad4b`;
   - S6 `04500ec24df5f9ca4df44ee1ab2a7484b84982bbc4437200ec2dc5b91c6baafa`.

   Các hash đổi theo mã nộp ở mỗi lần chạy, nên gói pilot nên nói rõ điều đó.
4. `:108-110`, tên file thư và ảnh render: S3 nay là `msg-10-…auto-off…` (trước là `msg-08`); S4 là `msg-08-…auto-on…` (trước là
   `msg-07`); S5 là `msg-07-…signed…` (trước là `msg-10`). Tên của S1, S2 và S6 không đổi.
5. `:112-113`, thông báo: N1 và N2 nay là `msg-02` (note tắt) và `msg-03` (note bật), đổi chỗ. N3 và N4 nay là `msg-06` (note tắt) và
   `msg-09` (note bật), đổi chỗ. N5 không đổi (`msg-01`).
6. `:116`: "Mọi file nằm trong `handoff/delivery/evidence/WP5-UX5-T06/`". Chúng nằm trong
   `handoff/delivery/evidence/WP5-UX5-REGATE15/samples/`.

Vẫn đúng: `:102` (mỗi PDF một trang, ảnh render đã xem, `pdf_hash_ok` cho cả sáu), mô tả S1 đến S6 và N5, mọi mục của "Các mẫu cho thấy
gì" (`:120-128`) và danh sách duyệt câu chữ.

Ngoài mục 3, cần làm mới tương tự ở:
- `:28` (mẫu của `69d6340`);
- `:40` (bằng chứng trong `WP5-UX5-T06/`);
- `:53`, ready check của mục 1 (`44-ready-check.txt` của REGATE15 trên dc487c6 cho cùng kết quả);
- `:84`, mục 2 ("mười một thư được bắt từ bản build đóng băng của vòng 5").

Nếu F-UX5RN-1 dời bản phát hành sang một commit chỉ chứa tài liệu về sau, các mẫu đến từ dc487c6 chứ không phải từ bản phát hành. Chúng vẫn
đại diện đúng cho bản phát hành khi regate chứng minh `dist/` giống hệt; khi đó gói pilot nên nói như vậy thay vì tạo lại mẫu.

## 7. Các kiểm tra bắt buộc

Tất cả đều chạy trong bản xuất sạch của commit đích, lần lượt từng cái:
- typecheck exit 0;
- lint exit 0;
- build exit 0, không có cảnh báo kích thước chunk và không có cảnh báo deprecation;
- `npm test` exit 0: 101 file, 2.397 test.

So sánh `dist/` với 0b45781 giống hệt (250 file). Không chạy e2e vì `dist/` giống hệt. Thông báo "allow-scripts setting is being ignored"
của `npm ci` đến từ cấu hình npm ngoài repository (`.npmrc` của repository không có khóa đó). Nó giống ở REGATE14, REGATE15 và AUDIT-INT3,
và không phải là deprecation.

## Phát hiện

- **F-UX5RN-1 (Low): `DEVELOPMENT.md:3` và `DEVELOPMENT.vi.md:3` nêu trạng thái nghiệm thu mâu thuẫn với bản phát hành.**
  - **Tái hiện.** Dòng 3 của `git show dc487c6:DEVELOPMENT.md` ghi: "Status: **WP1, WP2 and WP3 independently accepted; WP4 implemented
    (T01–T12 and the documentation task T13), awaiting the package-final gate WP4-GATE and independent audits; not accepted.**" Dòng VI
    nói giống vậy và cả hai đều không nhắc WP5. Dòng này có từ WP4-T13 (13a258d).
  - **Mâu thuẫn.** Bảng task ghi WP4-RECHECK-A và WP4-RECHECK-B4 PASS trên 546cdda, WP5-RECHECK PASS và WP5-UX5-AUDIT-INT3 PASS. Các dòng
    README đã sửa ghi "WP1 đến WP4 đã được chấp nhận độc lập; WP5 đã sẵn sàng về phần mềm", và README.md:11 và :54 dẫn người đọc sang
    DEVELOPMENT ("xem DEVELOPMENT và các bàn giao"). Trước RELNOTES, hai tài liệu cùng cũ như nhau; RELNOTES làm chúng lệch nhau. Chính lý
    do của RELNOTES áp dụng nguyên văn: README "vẫn ghi WP4 chờ cổng kiểm và chưa được chấp nhận" và nằm trong digest. DEVELOPMENT.md cũng
    nằm trong digest, nên ACCEPT-DOCS không sửa được mà không dời bản phát hành.
  - **Kỳ vọng.** DEVELOPMENT.md:3 nêu đúng trạng thái của README, ví dụ: "Status: **WP1 to WP4 independently accepted; WP5 software
    ready (independently accepted, and re-accepted after UI change rounds 1 to 5); pilot pending and NAS NOT VERIFIED.**" Sau đó nêu
    bàn giao WP5 (`handoff/delivery/WP5_HANDOFF.md`) cùng các bàn giao khác, và bản VI có cùng sự kiện.
  - **Quy tắc.** docs/08:56 ("Observed files/evidence outrank stale narrative; report discrepancies"); mục đích của brief RELNOTES (không
    để trạng thái nghiệm thu cũ trong digest được phát hành).
  - **Sửa có phạm vi.**
    - Dòng 3 của DEVELOPMENT.md và của DEVELOPMENT.vi.md.
    - Vì bản phát hành khi đó thành một commit chỉ chứa tài liệu về sau, docs/12:7 (EN/VI) nên nói tài liệu được làm mới trong các commit
      chỉ chứa tài liệu, đã kiểm cổng và audit, và bản phát hành là commit cuối cùng trong số đó. Việc này cũng giải quyết R-UX5RN-1.
    - Sau đó đóng băng, chạy một regate có phạm vi (phạm vi, `dist/` giống hệt, core, liên kết và tương đương) và một lần kiểm lại mới.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- **R-UX5RN-1, hai câu "Bản phát hành là" trong docs/12:7.** Gạch đầu dòng mở đầu bằng "Bản phát hành là commit đóng băng cuối gói WP5" và
  gọi REGATE14 trên 0b45781 là cổng kiểm cuối gói. Sau đó nó kết thúc bằng "Bản phát hành là commit đó" (commit chỉ chứa tài liệu). Câu
  cuối quyết định, nhưng người đọc có thể hiểu 0b45781 là bản phát hành. Một quy tắc duy nhất, "commit đóng băng WP5 cuối cùng, đã kiểm
  cổng và audit", sẽ xóa chỗ nghi ngờ; nó nằm gọn trong phần sửa F-UX5RN-1.
- **R-UX5RN-2, một mệnh đề bối cảnh bị bỏ (docs/12:119).** "Các slice đã chạy typecheck, lint, unit, integration, full e2e và smoke của
  server đã build" vẫn đúng nhưng đã mất. Bản thân giới hạn vẫn còn. Tùy chọn.
- **R-UX5RN-3, việc chuyển kết quả drill chỉ nêu `dist/server`, `dist/domain` và file package.** Các kiểm tra client của drill dựa trên
  Dockerfile và `vite.config.ts`, không đổi từ 1fe5ad3 (đã kiểm), nên lập luận đứng vững; nêu thêm chúng sẽ làm nó đầy đủ. Tùy chọn về câu
  chữ.
- **R-UX5RN-4, các câu dẫn tới tương lai mà ACCEPT-DOCS phải làm cho đúng:**
  - docs/12:7, "SHA, digest và số file của nó được ghi trong bàn giao WP5";
  - README.md:12, "xem các bàn giao của chúng" cho việc nghiệm thu lại vòng 4 và 5, và "chủ sở hữu xem xét gói pilot" là bước tiếp theo.

  Bàn giao WP5 chưa có mục cho vòng 4 và 5, và gói pilot vẫn ghi vòng 3.
- **R-UX5RN-5, câu chữ ở bước 3 của README.** Bản EN "the WP2 handoff and the WP3 handoff, the WP4 handoff and the WP5 handoff" đọc
  vụng. Bản VI thiếu dấu phẩy giữa liên kết WP2 và WP3 (có từ trước). Tùy chọn.
- **R-UX5RN-6, giá trị mẫu riêng của từng lần chạy.** Mã nộp, hash PDF và vài header Date đổi ở mỗi lần chạy trên cùng mã. Gói pilot nên
  trình bày các hash là của lần chạy này và không trích giờ Date như sự kiện của sản phẩm.

Các rủi ro tùy chọn và backlog của AUDIT-INT3 (R-UX5I3-1..4, R-UX5I2-3 là quyết định của chủ nên làm trước pilot, và các mục trước đó)
không đổi ở commit đích này, vì sản phẩm giống nhau từng byte.

## Gate chưa chạy hoặc bị chặn

Không kiểm tra bắt buộc nào bị bỏ qua hay chạy lại. Không chạy theo phạm vi của brief:
- các bộ e2e, sweep, stress, mutant và axe (của REGATE14, được chuyển sang trên `dist/` giống hệt);
- container drill và `npm audit` (của REGATE11, được chuyển sang);
- một lần ready check mới (của REGATE15).

Các mục NAS vẫn NOT VERIFIED.

## Xử lý phát hiện trước

AUDIT-INT3 không có phát hiện nào còn mở. PASS của nó trên 0b45781 / 67aa715c vẫn có hiệu lực cho sản phẩm và chuyển sang dc487c6. Vì audit
này là FIX REQUIRED, nó chưa thay thế AUDIT-INT3 làm nghiệm thu hiện hành, và dc487c6 chưa phải bản phát hành được chấp nhận.

## Tách sẵn sàng phần mềm, phép của chủ và kết quả pilot

Sẵn sàng phần mềm của sản phẩm không đổi (AUDIT-INT3 và REGATE14 trên bản build giống hệt). Tài liệu phát hành cần phần sửa F-UX5RN-1
trước khi ACCEPT-DOCS nêu tên bản phát hành. Phép của chủ: chưa xin và chưa cho. Kết quả pilot: chưa có; NAS NOT VERIFIED. Không triển
khai hay gửi gì: chỉ capture cục bộ, người dùng giả `example.invalid`.

## Một bước tiếp theo

Một phần sửa tài liệu có phạm vi cho F-UX5RN-1 (`addresses_audit` WP5-UX5-AUDIT-RN):
- DEVELOPMENT.md:3 và .vi.md:3 nêu trạng thái của README;
- docs/12:7 EN/VI nêu quy tắc phát hành cho commit chỉ chứa tài liệu cuối cùng (R-UX5RN-1).

Sau đó đóng băng, chạy một regate có phạm vi chứng minh `dist/` giống hệt dc487c6 (để mẫu của REGATE15 vẫn đại diện cho bản phát hành), và
một lần kiểm lại mới. Tiếp theo là ACCEPT-DOCS, với danh sách của mục 3 ở trên.

## Nguồn gốc subagent độc lập

- **Task review, reviewer và tác giả.** WP5-UX5-AUDIT-RN, lần 1; agent reviewer `a78672c074e2e4544` (trên bảng). Tác giả của thay đổi được
  kiểm là WP5-UX5-RELNOTES `a68b03f4d8089f7a5`, WP5-UX5-RELNOTES-FREEZE `a962ae97f24128a31` và WP5-UX5-REGATE15 `a0dc256c7e72e3194`, bên
  trên các tác giả WP5-UX4 và WP5-UX5 của sản phẩm.
- **Context mới.** Tôi không viết thay đổi nào được kiểm, và không viết task hay audit WP5-UX4 hay WP5-UX5 nào. Tôi không đổi gì ngoài
  cặp review này, Results của brief và thư mục bằng chứng, và không stage hay commit gì.
- **Digest.** Trước và sau bằng nhau (ở trên). Bằng chứng gate cho snapshot này: WP5-UX5-REGATE15 PASS.
- **Đường dẫn report.** `handoff/delivery/WP5_UX5_REVIEW_RN.md` (+ `.vi.md`); mọi review trước giữ nguyên.
- **Xử lý phát hiện và task tiếp theo của coordinator.** F-UX5RN-1 còn mở (Low, FIX REQUIRED). R-UX5RN-1..6 là tùy chọn. Bước tiếp theo ở
  trên.
