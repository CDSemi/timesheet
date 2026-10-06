# Review độc lập

Bản gốc tiếng Anh: [WP4_RECHECK_B3.md](WP4_RECHECK_B3.md).

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP4, recheck độc lập mới lần ba cho vùng B (dữ liệu) sau
  vòng sửa thứ ba (WP4-FIXB3: giải mã một lần, giới hạn 255 cho thuộc tính được giữ, bản sao riêng, hạ giới hạn gói,
  R-B2-1, R-B2-2). Recheck này kiểm ba việc: WP4-RB2-01 đã đóng chưa (ngân sách parse đã nêu có giữ được với biên an
  toàn không), các thay đổi R-B2-1 và R-B2-2 có đúng không, và vùng B có còn giữ được không. 2026-10-06; task
  WP4-RECHECK-B3 lần 1 (profile timesheet-auditor, yêu cầu opus/xhigh); model tự báo `claude-opus-5-5`; effort không
  quan sát được. Author của snapshot đang kiểm: WP4-FIXB3 `claude-opus-5-5`; committer freeze và verifier
  WP4-REGATE3 (`claude-sonnet-5-5`) không viết source. Model reviewer không yếu hơn author mạnh nhất. WP4-RECHECK-A lần
  3 chạy cùng lúc ở thư mục riêng; không chia sẻ file hay tiến trình nào và không đọc báo cáo của nó.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  `972ccda6409a7521a008c55c35a5b5cf416daf1e` (là `freeze_commit` của WP4-REGATE3, đã có trên origin/main). Source digest
  `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` (775 file, không tính handoff/) trước và sau,
  tính bằng `scripts/source-digest.mjs` và bằng dạng `git ls-tree`; bằng digest gate đã ghi. HEAD không đổi; cây làm
  việc chỉ khác trong handoff/. Mọi kiểm tra chạy trên bản export `git archive` của commit đó dưới
  `D:\.claude-tmp\timesheet\WP4-RECHECK-B3`; 775 file ngoài handoff của export có hash bằng blob của commit
  (`99-digest-after.txt`). Reader WP4-T09 đã được chấp nhận được export từ `13a258d` vào cùng thư mục.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** Giải mã một lần, giới hạn thuộc tính được giữ,
  R-B2-1, R-B2-2, phép so sánh khác biệt và các kiểm tra hồi quy đều giữ được. Ngân sách parse đã nêu thì không giữ
  được. Các hình dạng nằm trong mọi giới hạn đã nêu mà phần XML không nén được (văn bản entropy cao, nên kích thước
  upload gần bằng kích thước XML) mất 508-611 ms cho một preview trong bộ nhớ. Qua HTTP chúng làm `/api/health` đứng
  554-648 ms. Comment trong code và docs/07 ghi trường hợp xấu nhất đo được khoảng 290 ms và +89 MiB (58 % và 60 %).
  Recheck này đo được 611 ms (122 %) và +123 MiB (82 %). Phát hiện WP4-RB3-01 (Low).
- Phạm vi thực sự đã kiểm/chạy:
  1. Đọc source ở commit đang kiểm: toàn bộ `import/xlsxReader.ts` (các giới hạn và comment ngân sách, `listEntries`,
     `inflateEntry`, `decodeXmlBytes`, `referenceCode`, `decodeXml`, `ownCopy`, các schema, `scanXml`, `parseXml` với
     kiểm tra encoding, `attr`, `richText`, `readWorksheet`, `readWorkbook`), toàn bộ `import/templateMapping.ts`
     (`matchedHoliday`, `readHolidays`, `readPeriod`, `detectFormulaDefects`, `mapWorkbook`), `services/workbookImport.ts`
     (`reportDay`, `buildReport`, `buildPlan`, `serializeReport`, `previewImport`), `routes/imports.ts`, hàm `put` của
     `files/fileStore.ts`; diff `cc34e7f..972ccda`.
  2. Tài liệu chuẩn: docs/07 "Workbook import" và bản `.vi.md` (câu ngân sách và các giới hạn mới khớp với code),
     WP4_REVIEW, WP4_RECHECK_B2 và các probe của nó, kết quả WP4-FIXB3 và WP4-REGATE3.
  3. Chạy: `npm ci` và `npm run verify` trên export; bốn bộ test của vùng; catalogue của RECHECK-B2 (E7, Y7 và các
     hình dạng còn lại) và phép tìm kiếm của FIXB3, cả hai dựng lại nguyên văn; phép tìm trường hợp xấu nhất của chính
     reviewer (104 hình dạng trong hai vòng, mỗi trường hợp một tiến trình mới), các lần chạy lặp, phân tích theo pha,
     một probe HTTP trên server đã build có thăm dò health, một probe tính đúng (75 kiểm tra) và phép so sánh khác
     biệt giữa hai reader.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả dưới `handoff/delivery/evidence/WP4-RECHECK-B3/`, đã che,
  LF):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (trước) | 972ccda; 635f909d…ec3f7b (775 file) theo cả hai cách; exit 0 | `01-baseline.txt` |
| `npm ci` (export của 972ccda; export của 13a258d) | 161 package; 1 cảnh báo high (chỉ dev, như trước); exit 0 và 0 | `02-npm-ci.txt`, `03-t09-npm-ci.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 file / 1755 test, build, SMOKE PASSED (41 PASS); không có dòng deprecation; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix (verbose) | 4 file, 128 test đạt; exit 0 | `05-suites.txt` |
| `node b2-cost.mjs` (catalogue RECHECK-B2, nguyên văn) | 72 hình dạng; E7, E7b, E7c, E7d bị từ chối `attribute_too_large` trong 22-24 ms; Y7, Y8, Y9 bị từ chối `total_xml_too_large` ở +73..+76 MiB trong 118-140 ms; xấu nhất 140 ms và +87 MiB; không có lỗi ném ra; exit 0 | `10-b2-catalogue.txt` |
| `run-cost.mjs` với `search.mjs` (FIXB3, nguyên văn) ở các giới hạn cuối (phần 4×2 MiB và 2×4 MiB, 150 000 lần mở) | 132 hình dạng, 120 được nhận, 12 bị từ chối; xấu nhất 184 ms và +93 MiB; exit 0 | `11-fixb3-search.txt` |
| `run-cost.mjs` với `rcb3-cases.mjs` (vòng 1: 67 hình dạng) | tất cả được nhận và nằm trong mọi giới hạn; thời gian xấu nhất 329 ms (64 thuộc tính được giữ, đã giải mã, dài 14 ký tự mỗi ô); bộ nhớ xấu nhất +119 MiB (khoảng 72 000 công thức khác nhau có tham chiếu trên sheet có ngày, phần XML hai byte); 3 trường hợp vượt mục tiêu bộ nhớ 70 %; exit 0 | `12-rcb3-run1.txt` |
| `run-cost.mjs` với `rcb3-cases2.mjs` (vòng 2: 37 hình dạng) | 35 được nhận; 4 OVER-BUDGET về thời gian, đều có phần XML không nén được: công thức 596-611 ms và +120..+121 MiB; lũ thuộc tính được giữ 508 ms; 13 vượt mục tiêu 70 %; exit 0 | `13-rcb3-run2.txt` |
| chạy lặp (mỗi trường hợp 5 tiến trình mới) | F2-rand100-d2-wide 576-593 ms, +117..+123 MiB; A2-rand13amp-wide 510-528 ms, +88..+92 MiB; exit 0 | `15-repeats.txt` |
| `phase.mjs` (F2-rand100 và hai đối chứng nén được) | vòng giải nén từng bước 4 KiB của reader, dựng lại: 264 ms cho upload này (`unzipSync` của fflate 61 ms); `readWorkbook` 527 ms, ánh xạ 41 ms. Đối chứng cùng kích thước XML: giải nén 38-39 ms, đọc 130-268 ms | `14-phase-F2.txt` |
| `node ../probes/http.mjs` (server đã build) | template 201 trong 41 ms; đối chứng nén được 201, health 260 ms; các hình dạng không nén được 201 sau 474-653 ms, health 476-648 ms (3 trong 4 trên 500 ms); không có 5xx, không lỗi kết nối, không dòng lỗi nào của server; 6 dòng và 7 file đã lưu (6 lần upload cộng chữ ký seed) | `16-http.txt` |
| `diff-build`, `diff-dump` (cả hai export), `diff-compare`, `diff-rules` | các ô reader giống từng byte (1 055 và 7 403); preview giống hệt sau khi bỏ `sourceCount`; báo cáo đã lưu giống hệt sau khi bỏ `sourceCount` và câu quy tắc R3 từ 0f7fba2 (168 ngày, 12 cờ ngày lễ trôi, 23 ngày lễ, 44 finding, 49 quyết định); exit 1 là do cách thiết kế phép so sánh thô, xem phần dưới | `17-differential.txt` |
| `node correct.mjs` | 75 PASS, 0 FAIL; liệt kê 3 trường hợp encoding dễ dãi; exit 0 | `18-correct.txt` |
| digest sau; tính toàn vẹn của export | không đổi; 775 trên 775 file export có hash bằng commit | `99-digest-after.txt` |

  Kết quả theo mục phạm vi:
  - **1 Lời khẳng định về ngân sách: không giữ được (WP4-RB3-01).**
    - Các hình dạng cũ, dựng lại nguyên văn: E7 và các biến thể bị từ chối trong 22-24 ms. Y7, Y8 và Y9 bị từ chối ở
      tổng XML của gói sau +73..+76 MiB. Cả catalogue RECHECK-B2 nằm trong 140 ms và +87 MiB. Phép tìm của FIXB3 ở các
      giới hạn cuối có đỉnh 184 ms và +93 MiB. Vậy chính các hình dạng của RB2-01 đã được đóng.
    - Phép tìm độc lập (104 hình dạng, mỗi hình dạng nằm trong mọi giới hạn đã nêu; số byte, số lần mở và số thuộc tính
      do bộ dựng tự đếm có trong bằng chứng). Nó bao gồm các đường giải mã (tham chiếu định sẵn, số và astral dày đặc,
      trộn lẫn, cặp `&;`, một tham chiếu đứng trước 4 MiB văn bản, CDATA, đoạn bị comment chia cắt), lũ thuộc tính
      được giữ ở giới hạn thuộc tính với mọi độ dài giá trị từ 6 đến 255, công thức trên sheet được ánh xạ (nhiều công
      thức ngắn, công thức bị cắt ở 8 192, công thức dùng chung), nhiều ô, giá trị, relationship và shared string nhất,
      các nút được giữ ở mức workbook, báo cáo lớn nhất (61 sheet có ngày, 2 000 ngày lễ), phần XML hai byte, và các tổ
      hợp của ngân sách thuộc tính, lần mở và byte.
    - Mọi hình dạng nén được đều dưới 500 ms (xấu nhất 379 ms). Bộ nhớ chưa bao giờ vượt +150 MiB (xấu nhất +123 MiB).
    - Trục mà chưa phép tìm nào trước đây dùng là nội dung không nén được. Mọi gói trước đây đều nén xuống tối đa
      0,6 MB. Với văn bản không nén được (upload 4,1-5,4 MB, nằm trong giới hạn gói 8 MiB), vòng giải nén dạng luồng
      từng bước 4 KiB của reader tốn khoảng 264 ms cho khoảng 5,4 MB (`unzipSync` một lần của fflate mất 61 ms trên cùng
      các byte đó). Chi phí này cộng thêm vào phần quét:
      - khoảng 74 000 công thức khác nhau có tham chiếu trên hai sheet có ngày mất 576-611 ms (+117..+123 MiB) trong bộ
        nhớ, và làm `/api/health` đứng 640-648 ms qua HTTP;
      - lũ giải mã 64 thuộc tính với giá trị ngẫu nhiên mất 508-528 ms, và 554 ms qua HTTP.
    - Server không bao giờ trả 5xx, vẫn chạy và không lưu gì cho upload bị từ chối; chi phí vẫn tuyến tính và có chặn.
  - **2 Tính đúng: giữ được.**
    - Mỗi giá trị được giải mã đúng một lần (`18-correct.txt`): `&amp;amp;` thành `&amp;`, `&amp;lt;` thành `&lt;`,
      `&#38;#65;` thành `&#65;` và `&#x26;amp;` thành `&amp;`. Điều này đúng trong văn bản inline, `<v>`, `<f>`,
      shared string và rich run, và trong các thuộc tính được giữ (tên sheet, `r`, `Id` của relationship).
    - CDATA giữ nguyên chữ, và một tham chiếu bị comment chia cắt không bao giờ được ghép lại. Qua bước ánh xạ, một
      nhãn viết `&amp;amp;Worked` đọc ra `&amp;Worked` và là nhãn không biết. Đọc code xác nhận `attr()` không còn giải
      mã và `decodeXml` chỉ chạy trong bộ quét.
    - Giới hạn 255 không bao giờ cắt một giá trị. 255 ký tự như đã viết được nhận và giữ nguyên; 256 làm cả gói bị từ
      chối (`attribute_too_large`). Giới hạn đếm ký tự như đã viết (51 × `&amp;` được nhận). Thuộc tính không được giữ
      thì không bị giới hạn. Một tên sheet viết bằng 255 ký tự (`2026.05.29` cộng 49 `&#32;`) được giải mã nguyên vẹn
      và ánh xạ vào kỳ lương 2026-05-29; thêm một ký tự viết nữa thì gói bị từ chối chứ không bị cắt.
    - R-B2-1 giữ được. Hai ngày lễ có chung 300 ký tự đầu, nên cả hai hiện cùng một tên 200 ký tự, và chỉ một trong
      hai là ngày lễ trôi. Qua `previewImport` và báo cáo đã lưu, ngày khớp với ngày lễ cố định có
      `floating_holiday: false` và không cần quyết định về ngày lễ trôi; ngày khớp với ngày lễ trôi có `true` và cần
      quyết định về ngày lễ trôi.
    - R-B2-2 giữ được. Chín tên (ISO-8859-1, latin1, windows-1252, US-ASCII, UTF-32, UTF-7, Shift_JIS, `UTF8`,
      ` UTF-8 `) bị từ chối với `unsupported_encoding` trong cả năm phần được parse (45 trên 45, nháy đơn và nháy kép).
      UTF-8, utf-8, UTF-16, utf-16le, UTF-16BE và không khai báo đều được nhận.
    - So sánh khác biệt với WP4-T09 (13a258d) trên template đang theo dõi và một workbook 12 sheet có ngày (`17`): các
      ô của reader giống từng byte, và preview giống hệt sau khi bỏ `sourceCount`. Báo cáo đã lưu giống hệt sau khi bỏ
      `sourceCount` và một chuỗi quy tắc: quy tắc R3 `not_due` mà WP4-FIXB thêm ở 0f7fba2, đã được chấp nhận ở
      WP4-REGATE. Điều này bao gồm cả 168 ngày, 12 cờ ngày lễ trôi và 49 quyết định. Không khác biệt nào đến từ reader
      hay bước ánh xạ.
  - **3 Hồi quy: không thấy.** `npm ci` và `npm run verify` đạt (1755 test, không có dòng deprecation), và bốn bộ test
    của vùng đạt (128 test). Chúng phủ các 404 về quyền sở hữu, preview và commit idempotent, commit đồng thời, quyết
    định và xung đột, `not_due`, các chặn F-2, việc không tự động hoá kỳ đã nhập, số dư đầu kỳ và ma trận chia sẻ. Qua
    HTTP mọi upload đều là 201 hoặc 422, không bao giờ 5xx. Diff từ cc34e7f chỉ chạm các đường dẫn của WP4-FIXB3.
- Phát hiện: mức độ | file/hàm | tái hiện | mong đợi/thực tế | quy tắc/AC | cách sửa có giới hạn:

| ID | Mức độ | File/hàm | Tái hiện | Mong đợi / thực tế | Quy tắc/AC | Cách sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP4-RB3-01 | Low | `src/server/import/xlsxReader.ts`: `inflateEntry` (`INFLATE_STEP` = 4096, `Inflate` dạng luồng của fflate), cùng chi phí quét và ánh xạ mà nó cộng thêm vào; comment ngân sách cạnh `DEFAULT_READER_LIMITS`; docs/07 "Workbook import" và bản `.vi.md` (câu về trường hợp xấu nhất đo được) | `rcb3-cases2.mjs` F2-rand100-d2-wide: một upload 5,4 MB gồm hai sheet có ngày (8 MiB XML, 148 491 lần mở) mà các ô chứa khoảng 74 000 công thức khác nhau gồm chữ ngẫu nhiên, mỗi công thức một `&amp;`; các phần XML gần như không nén được. Trong bộ nhớ 576-611 ms và +117..+123 MiB qua 6 lần chạy; qua HTTP trả 201 sau 653 ms, `/api/health` 648 ms. A2-rand13amp-wide (64 thuộc tính được giữ mỗi ô, giá trị ngẫu nhiên 17 ký tự, 359 017 thuộc tính): 508-528 ms, HTTP 557 ms. Đối chứng F2-plain100 (cùng kích thước XML, nén được): 199-212 ms. Phân tích theo pha: vòng giải nén từng bước 4 KiB của reader, dựng lại, tốn 264 ms cho upload này, so với 38 ms của đối chứng. | Mong đợi (comment trong code và docs/07): mọi gói trong giới hạn xong trong 500 ms và +150 MiB, với trường hợp xấu nhất đo được khoảng 290 ms và +89 MiB (58 % và 60 %); mục tiêu của WP4-FIXB3 khoảng 70 %. Thực tế: 611 ms (122 %) và +123 MiB (82 %) trên máy trạm tham chiếu. Tuyến tính và có chặn; không có 5xx; server vẫn chạy. | docs/07 "Workbook import"; ngân sách trong `xlsxReader.ts`; WP4-RB2-01 (ngân sách có biên an toàn); FR-16 | Làm việc giải nén rẻ hơn mà vẫn giữ điểm dừng khi vượt giới hạn: ví dụ bước lớn hơn nhiều, hoặc một lần giải nén có chặn vào bộ đệm `data` đã cấp phát trước. Thêm nội dung không nén được (văn bản ngẫu nhiên, để kích thước upload gần bằng kích thước XML) làm một chiều của adversarial sweep và phép tìm trường hợp xấu nhất, cùng với công thức khác nhau trên sheet có ngày và lũ thuộc tính được giữ có giải mã. Sau đó đo lại và ghi lại trường hợp xấu nhất trong comment code và docs/07 EN/VI. Nếu không đưa được chi phí xuống khoảng 70 %, hạ `maxTotalXmlBytes` hoặc `maxCompressedBytes`, hoặc ghi lại ngân sách, tuỳ coordinator quyết định. |

- Rủi ro và cải tiến tuỳ chọn, tách khỏi lỗi đã chứng minh:
  - R-B3-1: một khai báo encoding không đứng đầu phần XML (có khoảng trắng phía trước), hoặc bị sai dạng (có `?` trong
    version, nháy không khớp), thì không được nhận ra, nên phần đó được đọc như UTF-8 (`18-correct.txt` mục LENIENT).
    Phần như vậy vốn đã không phải XML hợp lệ, và việc đọc sai chỉ biến văn bản thành nhãn không biết (chỉ được bỏ
    qua). Tuỳ chọn: từ chối khai báo `<?xml` ở bất kỳ đâu ngoài vị trí đầu, hoặc khai báo mà biểu thức không đọc được.
  - R-B3-2: bộ nhớ lên tới +117..+123 MiB trên sheet có ngày dày đặc công thức (82 % ngân sách, trên mục tiêu 70 % mà
    brief sửa lỗi đặt ra) ngay cả khi các phần XML nén được. Vẫn dưới ngân sách.
  - R-B3-3 (mang sang): không có hạn mức preview cho mỗi người dùng (lựa chọn I-5 của chủ sở hữu còn mở). Mỗi upload có
    thể làm event loop đứng trong khoảng thời gian trên, nên NAS (chậm hơn ba đến bốn lần, theo chính ước lượng của
    comment code) sẽ dừng khoảng 2 đến 2,5 giây cho mỗi upload như vậy. NAS NOT VERIFIED. Cảnh báo `source-map-js` chỉ
    dev vẫn còn.
  - R-B3-4 (mang sang): các trường hợp XML dễ dãi liệt kê trong WP4_RECHECK_B2 không đổi và không mở rộng gì.
- Gate bắt buộc chưa chạy/bị chặn và lý do: không có kiểm tra bắt buộc nào của vùng B chưa chạy. Không chạy lại vì nằm
  ngoài brief này và WP4-REGATE3 đã chạy trên digest này: bộ e2e và drill container. Đích NAS là NOT VERIFIED (không có
  quyền truy cập của chủ sở hữu), điều này cũng liên quan đến ngân sách.
- Xử lý các phát hiện trước:
  - WP4-RB2-01: cơ chế của E7 và Y7 (giải mã hai lần và phần XML bị ghim) **đã sửa và đã kiểm**. Lời khẳng định "ngân
    sách giữ được với biên an toàn" **chưa đạt**: WP4-RB3-01 (Low), qua nội dung không nén được, một trục mà cả phép tìm
    của bản sửa lẫn gate đều chưa thử.
  - R-B2-1: **đã sửa và đã kiểm**.
  - R-B2-2: **đã sửa và đã kiểm**, các trường hợp dễ dãi được ghi là R-B3-1.
  - WP4-RB-01, R-RB1, WP4-B-02, R1, R3: vẫn giữ được, qua các bộ test, các probe dựng lại và các kiểm tra HTTP.
- Sẵn sàng phần mềm, quyền của chủ sở hữu và kết quả pilot, tách riêng: mức sẵn sàng phần mềm của vùng B chưa được chấp
  nhận cho đến khi WP4-RB3-01 được sửa (hoặc ngân sách được ghi lại) và được recheck trên digest mới. Mọi quy tắc về
  toàn vẹn dữ liệu, riêng tư, giải mã và báo cáo của vùng đều giữ được dưới các probe. Chưa xin và chưa có quyền pilot
  của chủ sở hữu. Không triển khai, không dữ liệu thật, không thư thật.
- Một hành động/prompt tiếp theo: coordinator giao một bản sửa có giới hạn (`handoff/prompts/FIX_FINDINGS.md`) cho
  WP4-RB3-01. Bản sửa nên làm việc giải nén rẻ hơn và thêm nội dung không nén được vào adversarial sweep và phép tìm
  trường hợp xấu nhất, với test red-first dựa trên F2-rand100 và A2-rand13amp, rồi đo lại và ghi lại trường hợp xấu nhất
  trong docs/07 EN/VI và comment code (hoặc ghi lại ngân sách). Sau đó là freeze, regate và một recheck vùng B mới trên
  digest mới.

Không bịa phát hiện hay kết quả đạt chưa quan sát. Review một phần không phải là chấp nhận hoàn chỉnh.

## Nguồn gốc subagent độc lập

- Task/lần review, ID reviewer và ID author được review: WP4-RECHECK-B3 lần 1 (ID agent trên board do coordinator ghi;
  reviewer không quan sát được). Author của snapshot đang kiểm: WP4-FIXB3 (`claude-opus-5-5`), committer
  WP4-FIXB3-FREEZE và verifier WP4-REGATE3 (`claude-sonnet-5-5`). Các author và auditor vùng B trước được ghi trong
  WP4_REVIEW_B, WP4_RECHECK_B và WP4_RECHECK_B2.
- Context mới; xác nhận reviewer không viết thay đổi: context mới. Reviewer này không viết thay đổi, bản sửa, freeze
  hay gate nào của WP4, và không chạy WP4-AUDIT-B, WP4-RECHECK-B hay WP4-RECHECK-B2. Reviewer chỉ ghi cặp báo cáo này,
  phần Results của brief và `evidence/WP4-RECHECK-B3/`. Mọi workbook độc hại đều được dựng và giữ trong thư mục task;
  không có workbook hay file nhị phân nào trong bằng chứng.
- Source digest trước/sau; bằng chứng gate cho snapshot đó:
  `635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b` trước và sau (`01-baseline.txt`,
  `99-digest-after.txt`). WP4-REGATE3 PASS trên cùng commit và digest được coi là một lời khẳng định và được chạy lại
  cho vùng này.
- Đường dẫn báo cáo mới, giữ lịch sử review trước: `handoff/delivery/WP4_RECHECK_B3.md` và `.vi.md` (mới).
  WP4_REVIEW_B, WP4_RECHECK_B, WP4_RECHECK_B2 và mọi báo cáo trước không đổi.
- Xử lý phát hiện và task sửa/recheck tiếp theo của coordinator: WP4-RB3-01 (sửa hoặc ghi lại ngân sách), rồi một
  recheck vùng B của WP4 mới trên digest mới. Tiến trình con server của probe HTTP đã được dừng qua handle (SIGTERM).
  Không dùng hay để lại container, lệnh docker hay tiến trình nền nào.
