# Review độc lập

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP4, recheck độc lập mới lần hai cho vùng B (dữ liệu)
  sau vòng sửa thứ hai (WP4-FIXB2: bộ quét XML dạng luồng và giới hạn báo cáo; WP4-DEPCLEAN: gỡ fast-xml-parser).
  Recheck này kiểm WP4-RB-01 (mở lại WP4-B-01) đã đóng theo cả lớp, bộ quét mới đúng, giới hạn báo cáo giữ được và
  vùng B không hồi quy. 2026-10-06; task WP4-RECHECK-B2 lần 1 (profile timesheet-auditor, yêu cầu opus/xhigh); model
  tự báo `claude-opus-5-5`; effort không quan sát được. Author của snapshot đang kiểm: WP4-FIXB2 `claude-opus-5-5`,
  WP4-DEPCLEAN `claude-sonnet-5-5`, committer freeze và verifier WP4-REGATE2 `claude-sonnet-5-5`; các author vùng B
  trước được ghi trong WP4_REVIEW_B (mạnh nhất `claude-opus-5-5`). Model reviewer không yếu hơn ai trong số đó.
  WP4-RECHECK-A lần 2 chạy cùng lúc ở thư mục riêng; không chia sẻ file hay tiến trình nào và không đọc báo cáo của nó.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  `cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d` (là `freeze_commit` của WP4-REGATE2, đã push). Source digest
  `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503` (775 file, bỏ handoff/) trước và sau, bằng
  `scripts/source-digest.mjs` và dạng `git ls-tree`; bằng digest gate đã ghi. HEAD không đổi; cây làm việc không có
  thay đổi ngoài handoff/, cả tracked lẫn untracked. Source đủ: mọi kiểm tra chạy trên bản `git archive` của commit
  tại `D:\.claude-tmp\timesheet\WP4-RECHECK-B2` (ngoài Dropbox); cả 775 file ngoài handoff của bản export hash trùng
  blob của commit (`21-digest-after.txt`). Bộ đọc WP4-T09 đã nghiệm thu được export từ `13a258d` vào cùng thư mục
  task để làm differential.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** Về thực chất lớp lỗi của WP4-RB-01 đã đóng: mọi
  gói độc hại trước (P1b, P6, P7, r1, r2, r3) bị từ chối nhanh hoặc bị chặn, và 72 dạng độc hại mới nằm trong mọi
  giới hạn đã nêu đều tuyến tính và bị chặn (không ca nào quá 0,8 s hay +160 MiB, không 500, không stack trace, không
  file mồ côi). Bộ quét đúng (49/49 ca theo spec), differential với bộ đọc WP4-T09 trùng khít trên template được
  track và trên một workbook thực tế 12 sheet có ngày, giới hạn báo cáo giữ được (văn bản cắt ở 200 ký tự kèm
  `truncated`, báo cáo lưu lớn nhất 1,61 MiB, báo cáo vượt trần là 422, việc cắt không bao giờ đổi giá trị được nhập)
  và vùng B không hồi quy. Còn một lỗi mức Thấp: ngân sách bằng số mà docs/07 và `xlsxReader.ts` nêu cho cả lớp
  ("trong 500 ms thời gian vòng lặp sự kiện và thêm tối đa 150 MiB bộ nhớ trên máy tham chiếu") bị hai dạng trong
  giới hạn vượt qua (WP4-RB2-01: khoảng 610 ms, và +155 đến +158 MiB).
- Phạm vi thật đã xem/chạy:
  1. Đọc source tại commit đang kiểm: toàn bộ `import/xlsxReader.ts` (giới hạn, chú thích ngân sách, `listEntries`,
     `inflateEntry`, `decodeXmlBytes`, `referenceCode`, `decodeXml`, schema các phần, `scanXml`, `parseXml`, `attr`,
     `richText`, `readWorksheet`, `readWorkbook`), toàn bộ `import/templateMapping.ts` (`finalizeFindings`,
     `scanText`, `keptText`, `clipText`, `readHolidays`, `readPeriod`, `detectFormulaDefects`, `mapWorkbook`), toàn
     bộ `services/workbookImport.ts` (`MAX_REPORT_BYTES`, `serializeReport`, `previewImport`, `buildReport`,
     `reportDay`, `buildPlan`, `commitImport`), `routes/imports.ts`, `files/fileStore.ts` `put`, `domain/dates.ts`; bộ
     đọc WP4-T09 tại `13a258d` (tùy chọn fast-xml-parser, `richText`, `readWorksheet`); diff `0f7fba2..cc34e7f` và
     `13a258d..cc34e7f` của các file import, `package.json` và `package-lock.json`; hai file test mới.
  2. Canon: mục "Workbook import" của docs/07 và `.vi.md` (các câu về giới hạn và ngân sách khớp số trong code),
     WP4_REVIEW, WP4_REVIEW_B, WP4_RECHECK_B, kết quả WP4-FIXB2, WP4-DEPCLEAN và WP4-REGATE2, các quy tắc XML 1.0 về
     tham chiếu, CDATA, comment, PI, thuộc tính, thẻ đóng, BOM và khai báo encoding, và quy tắc OPC rằng các phần là
     UTF-8 hoặc UTF-16.
  3. Thực thi: `npm ci` và `npm run verify` trên bản export; sáu bộ test của vùng (hai lần, một lần verbose); sáu probe
     trước dựng lại y nguyên từng byte; probe của tôi: một probe đúng-sai của bộ quét so với spec có T09 đặt cạnh, một
     differential hai bộ đọc, một danh mục chi phí 72 dạng (mỗi ca một tiến trình con mới, lặp lại cho các ca sát ngân
     sách), một probe HTTP trên máy chủ build (gọi `/api/health` liên tục trong mỗi lần upload, số byte báo cáo lưu,
     file giữ lại, kiểm commit khi bị cắt, ngày lương biên, quyền sở hữu, idempotency, replay và xung đột) và một bản
     đối chiếu file.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả tại `handoff/delivery/evidence/WP4-RECHECK-B2/`, đã che,
  LF; Node v24.21.0 gọi bằng đường dẫn đầy đủ; chỉ Git Bash, shell của npm script = Git Bash; chế độ capture,
  `JOB_RUNNER=off`; `DATA_DIR` và `DATABASE_PATH` đặt rõ trong thư mục task cho mọi lần chạy CLI, test và máy chủ):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (trước) | cc34e7f; 96445de4…d503 (775 file) cả hai cách; exit 0 | `01-baseline.txt` |
| `npm ci` (bản export của cc34e7f) | 161 gói; 1 cảnh báo high (source-map-js, chỉ dev); không dòng deprecation; exit 0 | `02-npm-ci.txt` |
| `git diff 0f7fba2 cc34e7f -- package.json package-lock.json`; grep bản export | package.json chỉ gỡ `fast-xml-parser`; lock: 121 dòng xóa, 0 dòng thêm, đúng 8 gói của DEPCLEAN; không source, test, script hay doc nào nhắc fast-xml-parser; không có trong node_modules | `03-deps.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 file / 1750 test, build, SMOKE PASSED (41 PASS); không dòng deprecation; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix, ot-leave, client importModel | 6 file, 192 test đạt (hai lần; lần hai verbose); exit 0 | `05-suites.txt`, `05b-suites-verbose.txt` |
| `node probes/b2-diff.mjs` (T09 tại 13a258d so với cc34e7f) | template và 12 sheet có ngày thực tế: kết quả bộ đọc trùng từng ô (1055 và 7403 ô); sheets, periods, holidays, calendar, summary, clean của preview trùng; findings trùng; exit 0 | `07-diff.txt`, `probe-b2-diff.mjs.txt` |
| `node probes/b2-scanner.mjs` | 49 ca spec PASS, 0 FAIL; báo 11 ca dễ dãi; exit 0 (lần đầu probe đếm sai độ sâu, xem `22-incidents.txt`) | `08-scanner.txt`, `probe-b2-scanner.mjs.txt` |
| dựng lại P1b, P7, r3, r1 (bản sao y nguyên) | mọi gói trước bị từ chối (2-10 ms) hoặc bị chặn (ca nhận tối đa 82 ms, +73 MiB); exit 0 | `09`–`13` |
| `node probes/b2-cost.mjs` (66 dạng mới; 6 dạng còn lại ở dòng dưới) | tất cả bị chặn và tuyến tính; E7 596 ms vượt ngân sách thời gian; nhiều bộ nhớ nhất Y2 +144 MiB, Y1 và Z1 +107 MiB; exit 0 | `14-b2-cost.txt`, `probe-b2-cases.mjs.txt`, `probe-b2-cost.mjs.txt` |
| `node probes/b2-cost.mjs <case> 5` và ca đối chứng cơ chế | E7/E7b/E7c 596-630 ms (một lần 781 ms); E7d (giải mã một lần) 334-341 ms; E1 324-338 ms; E5 176-193 ms; Y7 +155..+158 MiB; Y8 +141..+157 MiB; đối chứng Y1 +106..+108 MiB và Y9 (không gì bị ghim) +147..+148 MiB; exit 0 | `15-b2-cost-repeats.txt`, `20-b2-cost-mechanism.txt`, `23-b2-cost-memory-control.txt` |
| dựng lại P6, r2 qua HTTP (máy chủ build) | P6 422 trong 5-11 ms; r2: template và 60 sheet 201, mọi ca độc hại 422 hoặc 201, báo cáo lớn nhất 0,57 MiB, không dòng lỗi máy chủ; exit 0 | `16-p6.txt`, `17-r2.txt` |
| `node ../probes/b2-http.mjs` (máy chủ build, mọi dạng mới) | 0 phản hồi 5xx hay lỗi truyền; `/api/health` chờ lâu nhất trong một upload 629 ms (E7, E7b, E7c quá 500 ms; mọi ca khác ≤ 350 ms); báo cáo lưu lớn nhất 1.686.087 byte; L5, L6 422 `report_too_large`; kiểm commit khi bị cắt trùng kỳ vọng; ngày biên 201 và commit 200; các 404 quyền sở hữu; replay và xung đột đúng đặc tả; exit 0 | `18-b2-http.txt`, `probe-b2-http.mjs.txt` |
| `node probes/b2-files.mjs` | 56 file: 55 được `imports.storage_key` tham chiếu, 1 bởi `attachments` (chữ ký seed); 0 không được tham chiếu; 0 thiếu | `19-b2-files.txt` |
| digest sau; toàn vẹn bản export | không đổi; hash template `47ef42d5…6331`; 775/775 file export hash trùng | `21-digest-after.txt` |
| `scripts/precommit-check.mjs` trên các file audit này viết (trong một repo git nháp ở thư mục task) | PASS, 37 file, 0 phát hiện; exit 0 | `24-precommit.txt` |

  Kết quả theo mục phạm vi:
  - **1 Giới hạn tài nguyên giữ được theo cả lớp — về thực chất có, về con số thì không (WP4-RB2-01).**
    - Probe trước, dựng lại y nguyên: P1b (37 KB, 65 KB, 113 KB, sheet ngày lễ 150.000 ô) `part_too_large` trong 2-7
      ms; P7 `part_too_large`/`total_too_large` trong 0-10 ms; r3 `<1/>`, `<9/>`, `< />`, `<.a/>` `malformed_xml`
      trong 17-27 ms, `<c/>` và `<row/>` bị từ chối, `<c>` có 3,8 MiB thuộc tính `too_many_attributes` trong 64 ms;
      r1: 39 ca, mọi ca độc hại bị từ chối hoặc bị chặn, chậm nhất 82 ms (H5e, được nhận) và nhiều bộ nhớ nhất +73
      MiB (H4a, bị từ chối). Qua HTTP: P6 422 trong 5-11 ms; r2 mọi request 201 hoặc 422, `report_json` lớn nhất 0,57
      MiB, không dòng lỗi máy chủ.
    - Dạng mới (`14-b2-cost.txt`, `18-b2-http.txt`), mỗi dạng nằm trong mọi giới hạn đã nêu hoặc ở sát biên:
      - dạng tên thẻ: `<x/>`, ô giữ lại có tiền tố `<x:c/>`, tên ngoài Latin-1 `<ā/>`, tên astral, tên 65.000 ký tự,
        cặp mở/đóng tên 32.000 ký tự, thẻ đóng đệm 4 MiB khoảng trắng, thẻ mở 65.000 dấu cách, `<Row/>`/`<C/>`, mọi
        lớp ký tự tên, 19.999 dòng giữ lại: được nhận trong 29-179 ms tối đa +71 MiB, hoặc `too_many_elements` trong
        26-31 ms;
      - lũ thuộc tính: 64 mỗi phần tử × 3.124 × 2 + 1.562 (499.840 trong gói), 64 thuộc tính đều tên `r` trên ô giữ
        lại, tên thuộc tính 1.000 ký tự, 64 khai báo namespace mỗi phần tử, giá trị 64 KiB đầy `>` và dấu nháy,
        66.000 nút `sheetData` giữ lại với ba thuộc tính giữ lại: 49-129 ms, tối đa +59 MiB; 65 trên một phần tử
        `too_many_attributes`;
      - lồng sâu: khối sâu 40 tới giới hạn mở thẻ 28 ms; lồng các phần tử giữ lại `too_many_elements`;
      - văn bản dài và CDATA: nhãn CDATA 4 MiB, 99.990 đoạn CDATA trong một `<t>` giữ lại, 4 MiB văn bản bộ đọc không
        giữ, công thức 4 MiB dấu nháy, 2 triệu ký tự hai byte, 4 MiB chữ số hoặc khoảng trắng trong `<v>`: 48-65 ms,
        tối đa +61 MiB (99.990 đoạn CDATA bị từ chối ở giới hạn mở thẻ của gói trong 34 ms);
      - comment và PI: 2 × 99.990 bị từ chối ở giới hạn gói trong 15-18 ms; một comment hoặc PI 4 MiB mỗi phần 54-58
        ms; một `<t>` giữ lại bị 99.990 comment chia cắt bị từ chối trong 105 ms;
      - tham chiếu hàng loạt: `&amp;` 176-193 ms; `&#1234567;`, `&abcdefgh;`, `&;&a;` 104-176 ms; astral `&#x1F600;`
        171 ms; `&` trần trong 16 MiB văn bản giữ lại, trong thuộc tính `r` giữ lại hoặc trong một phần relationships
        4 MiB 256-338 ms; `&` trần trong giá trị thuộc tính giữ lại bị giải mã hai lần (E7) khoảng 610 ms — vượt ngân
        sách;
      - nhiều phần sát trần: 4 × 4 MiB giá trị giữ lại 156 ký tự 134 ms / +76 MiB; 61 sheet có ngày, mỗi sheet 270 KB
        (16 MiB) 115 ms / +71 MiB; 256 mục ZIP với 249 mục không phân tích 51 ms;
      - chuỗi dùng chung: 49.999 (giới hạn) 51 ms; 33.332 chuỗi rich text 50 ms; 49.999 chuỗi được 49.000 ô dùng 96 ms;
        một chuỗi 33.000 run được 2.000 tên ngày lễ dùng 45 ms;
      - chuỗi inline dài và báo cáo: 61 × 14 nhãn 17.000 chữ cái, 1.000 U+0001 hoặc 1.000 dấu euro, 2.000 tên ngày lễ
        1.020 ký tự khớp với 854 nhãn: 67-112 ms, tối đa +66 MiB, JSON preview tối đa 1,26 MiB;
      - nhiều bộ nhớ nhất: 4 × 49.990 ô rỗng có địa chỉ 10 ký tự và tên sheet 97 ký tự +107 MiB; cũng vậy nhưng mỗi
        phần được giải mã thành chuỗi hai byte và bị ghim bởi một giá trị giữ lại (Y2) +143..+145 MiB, với phần đệm
        ASCII và một ký tự ngoài Latin-1 (Y7) +155..+158 MiB — vượt ngân sách (Y9, giống vậy nhưng không có giá trị
        ghim, +147..+148 MiB);
      - từ chối muộn sau nhiều công việc nhất: giới hạn mở thẻ của gói ở cuối phần thứ 4 153 ms / +107 MiB;
        `tag_too_large` hoặc `malformed_xml` ở tận cuối sau 16 MiB `&` trần 318-322 ms; `too_many_holidays` sau hai
        sheet tối đa 89 ms.
    - Qua HTTP mọi dạng này (70 upload; hai ca đối chứng E7d và Y9 chỉ chạy trong bộ nhớ) trả 201 hoặc 422 (0 phản
      hồi 5xx), `/api/health` gọi liên tục trong mỗi upload chờ tối đa 350 ms trừ E7, E7b và E7c (593-629 ms), và máy
      chủ không ghi dòng lỗi nào. Upload bị từ chối không lưu gì: 56 file giữ lại khớp một-một với 55 dòng import và
      chữ ký seed.
  - **2 Bộ quét mới đúng.** `08-scanner.txt` kiểm bộ đọc mới theo spec XML (chuẩn so là spec; T09 đặt cạnh):
    - tham chiếu: năm entity định sẵn, tham chiếu thập phân và thập lục phân (kể cả astral), giải mã một lần
      (`&amp;lt;` vẫn là `&lt;`), tham chiếu trong giá trị thuộc tính (`r="A&#55;"` là A7) và trong `<v>`;
    - CDATA giữ nguyên văn (không giải mã tham chiếu, giữ markup) và có thể trộn với văn bản; comment và PI trong văn
      bản không phải văn bản và có thể đứng giữa các phần tử và ngoài gốc;
    - thuộc tính: nháy đơn và nháy kép, `>` và dấu nháy kia trong giá trị, LF/tab/CR quanh `=` và giữa các thuộc
      tính, thẻ tự đóng có dấu cách, `<t/>` rỗng, chấp nhận `</c >`;
    - BOM và encoding: BOM UTF-8, UTF-16LE và UTF-16BE có BOM (đọc đúng văn bản ngoài ASCII và astral); phần UTF-16
      không BOM bị từ chối;
    - namespace: phần tử có tiền tố gắn với namespace chính được đọc; `xml:space="preserve"` giữ khoảng trắng; run
      rich text có thuộc tính run được đọc và run phiên âm bị loại;
    - từ chối: DOCTYPE (cả chữ thường, sau `<! `, trong UTF-16), ENTITY, ELEMENT/ATTLIST, thẻ đóng sai, chưa đóng và
      mồ côi, comment/PI/CDATA chưa đóng, hai gốc, văn bản hoặc CDATA ngoài gốc, giá trị không nháy, thiếu khoảng
      trắng giữa thuộc tính, `< c>`, `<1>`, `</ v>`, thuộc tính không giá trị, dấu nháy chưa đóng, một `<` lẻ, và lồng
      sâu hơn 40 (đúng 40 thì được nhận): tất cả 422;
    - 49 PASS, 0 FAIL. So với T09, bộ đọc mới đúng ở chỗ T09 sai (CDATA bị giải mã, tham chiếu trong `<v>` thành
      `invalid_number`) và chặt hơn với XML hỏng mà T09 đọc lặng lẽ (R06-R22). 11 ca dễ dãi (entity chưa khai báo giữ
      nguyên, tham chiếu không hợp lệ giữ nguyên, `&` trần, thuộc tính trùng lấy cái sau, `<` trong giá trị, `]]>`
      trong văn bản, `--` trong comment, tiền tố chưa gắn, `&#1;`, phần khai báo ISO-8859-1 bị đọc như UTF-8, tên giữ
      lại ở namespace lạ) cư xử y như T09, không mở rộng gì và được liệt kê ở phần rủi ro.
    - Differential (`07-diff.txt`): trên template được track và trên một workbook tổng hợp thực tế 12 sheet có ngày
      (nhãn trộn gồm ngày lễ, một ngày lễ trôi, một nhãn lạ, nhãn từ cache công thức, giờ chấm, giờ vào không có giờ
      ra, một ngày trống và một ngày sai, một Chủ nhật có giờ chấm, công thức sạch và công thức thừa kế, một sheet ẩn,
      một ô ngày lương lệch, và 15 nhãn viết lại thành chuỗi dùng chung kiểu Excel có run rich text, một run phiên âm,
      `xml:space` và tham chiếu) kết quả bộ đọc trùng từng ô (1.055 và 7.403 ô) và preview — sheets, periods với ngày,
      nhãn, ô nguồn, ánh xạ, tên ngày lễ và giờ chấm của từng ngày, holidays, calendar, summary, clean và 6 cùng 60
      findings — trùng với kết quả T09.
  - **3 Giới hạn báo cáo giữ được.**
    - Văn bản: mọi nhãn, tên ngày lễ và văn bản nhân viên bị cắt ở 200 ký tự và gắn cờ (đếm `truncated` trong các ca L
      và S, 879 đến 2.904 cờ); chỉ văn bản tối đa 1.024 ký tự mới được so khớp.
    - Kích thước: `report_json` lưu lớn nhất 1.686.087 byte; L5 (2.000 tên ngày lễ và 854 nhãn 200 ký tự ba byte) và
      L6 (cũng vậy với U+0001) là 422 `workbook_rejected`/`report_too_large` và không lưu gì; các bộ test phủ lỗi tuần
      tự hóa (`report_too_large`) và lỗi ánh xạ (`report_failed`) là 422.
    - Việc cắt không bao giờ đổi giá trị được nhập (`18-b2-http.txt` V1): `Worked` + 300 dấu cách + `x` (307 ký tự, bị
      cắt và gắn cờ), `Worked` + 2.000 dấu cách (dài hơn phần quét, hiện `Worked` kèm `truncated`) và nhãn 1.100 dấu
      cách + `Vacation` là nhãn lạ, chỉ được bỏ qua; ép `import` cho một trong số đó là 422 `decision_not_allowed`;
      một tên ngày lễ 263 ký tự dùng làm nhãn ánh xạ thành Holiday với tên bị cắt; commit ghi đúng Worked, Holiday,
      Holiday, Vacation và năm ngày Worked như kỳ vọng, và không gì cho ba nhãn bị cắt. Import chỉ ghi một loại ngày và
      cờ WFH, cả hai từ khớp toàn văn.
  - **4 Hồi quy — không thấy.** `npm ci` và `npm run verify` đạt (1750 test, không dòng deprecation); sáu bộ test vùng
    đạt (192 test: các 404 quyền sở hữu, preview và commit idempotent, commit đồng thời, quyết định và xung đột,
    `not_due` (R3), các chốt F-2 và việc từ chối nghỉ bù OT trong kỳ đã nhập (R1), số dư đầu và quyền sở hữu của nó,
    ma trận chia sẻ, mô hình import phía client). Qua HTTP, upload lại y hệt trả 200 cùng id, nhân viên khác và admin
    nhận 404 khi đọc và commit và không thấy batch, commit lại y hệt là `replayed` và commit khác là 409
    `import_already_committed`; ngày lương 1900.01.01, 1900.01.19 và 2999.12.31 preview thành `not_in_calendar` và
    commit với toàn skip (không 500). Diff từ `0f7fba2` chỉ chạm ba file import, hai file test của chúng, docs/07 EN/VI,
    `package.json` và lock. `fast-xml-parser` cùng bảy gói phụ thuộc bắc cầu đã biến mất và không phụ thuộc nào khác
    đổi.

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:

| ID | Mức | File/hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc/AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP4-RB2-01 | Thấp | `src/server/import/xlsxReader.ts`: `attr()` giải mã giá trị thô ở mỗi lần gọi và `readWorksheet` `readCell` gọi `attr(cell, 't')` hai lần khi ô có con `<is>`; `decodeXml` quét một cửa sổ 9 ký tự tìm `;` sau mỗi `&`; đỉnh bộ nhớ cộng tới 200.000 ô giữ lại với bốn phần 4 MiB được giải mã thành chuỗi hai byte, và một giá trị giữ lại là `slice` ghim phần đã giải mã của nó; chú thích ngân sách cạnh `DEFAULT_READER_LIMITS`. Mục "Workbook import" của docs/07 và `.vi.md` (câu ngân sách) | **Thời gian (E7):** một upload 24.780 byte gồm bốn phần worksheet, mỗi phần 64 ô `<c r="A1" t="&&&…(65.000)"><is><t>x</t></is></c>` (thẻ dưới 64 KiB, phần dưới 4 MiB, XML dưới 16 MiB, 2 thuộc tính mỗi phần tử) được nhận trong 596-630 ms trong bộ nhớ qua 19 lần chạy E7/E7b/E7c (một lần lệch 781 ms), và qua HTTP trả 201 sau 593-629 ms trong khi `/api/health` chờ 593-629 ms. Đối chứng E7d (không `<is>`, `t` giải mã một lần) 334-341 ms; cùng `&` trong văn bản (E1) 324-338 ms. **Bộ nhớ (Y7):** một upload 545.605 byte gồm bốn phần, mỗi phần 49.985 ô rỗng có địa chỉ 10 ký tự, một giá trị giữ lại 20 ký tự, một ký tự ngoài Latin-1 và một comment ASCII đệm đủ 4 MiB, được nhận với maxRSS +155 đến +158 MiB (8 lần; Y8 với vai trò sheet được ánh xạ +141 đến +157 MiB). Đối chứng: cùng các ô nhưng không có phần hai byte (Y1) +106 đến +108 MiB; Y7 bỏ giá trị giữ lại, nên không gì ghim các phần (Y9), +147 đến +148 MiB. | Kỳ vọng: như docs/07 và code nêu, "các giới hạn này giữ mỗi lần preview trong 500 ms thời gian vòng lặp sự kiện và thêm tối đa 150 MiB bộ nhớ trên máy tham chiếu" (ngân sách nghiệm thu WP4-FIXB2 đặt để đóng RB-01). Thực tế: khoảng 610 ms và +158 MiB trên cùng máy (dạng `&amp;` mà bản sửa đo được 176 ms ở đây đo 176-193 ms). Chi phí vẫn tuyến tính và bị chặn (không 500, máy chủ vẫn chạy); chỉ giới hạn đã nêu cho cả lớp là sai. | docs/07 "Workbook import"; ngân sách `xlsxReader.ts`; WP4_RECHECK_B RB-01 (mở lại WP4-B-01); FR-16 | Giải mã mỗi giá trị thuộc tính giữ lại một lần và bỏ qua (hoặc từ chối) giá trị thuộc tính giữ lại dài hơn một trần nhỏ (`r`, `t`, `si` của OOXML chỉ vài ký tự; ví dụ 255, như `MAX_ID_LENGTH`); hạ nhẹ `maxTotalElements` (Y1 cho thấy khoảng 0,5 KiB đỉnh mỗi ô giữ lại) và giữ giá trị ô dưới dạng bản sao thay vì slice ghim phần đã giải mã; thêm E7 và Y7 vào bộ quét đối kháng (chặn thời gian, và một ghi chú bộ nhớ). Nếu coordinator muốn, thay vào đó nêu lại ngân sách trong docs/07, `.vi.md` và chú thích code bằng trường hợp xấu nhất đo được kèm biên an toàn. |

- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R-B2-1: `reportDay` đặt `floating_holiday` bằng cách so tên đã cắt của ngày lễ khớp với các tên đã cắt của ngày lễ
    trôi, nên hai tên ngày lễ chung 200 ký tự đầu có thể đánh dấu một ngày lễ không trôi là trôi (V1 ngày 4). Ảnh
    hưởng là thận trọng (thêm một quyết định rõ; loại ngày được nhập vẫn là Holiday) và không ngày lễ trôi nào mất cờ.
    Tùy chọn: lấy cờ từ chính ngày lễ đã khớp.
  - R-B2-2: bộ quét chấp nhận một số đầu vào mà spec XML coi là lỗi nghiêm trọng (11 ca dễ dãi), y như T09; không gì
    được mở rộng và chi phí đều được đếm. Một phần khai báo encoding khác UTF-8 hoặc UTF-16 bị đọc như UTF-8 (OPC chỉ
    cho UTF-8 và UTF-16). Tùy chọn: từ chối khai báo như vậy.
  - R-B2-3: một nhãn dài hơn 1.024 ký tự bắt đầu bằng khoảng trắng hiện thành nhãn rỗng kèm `truncated` (chỉ được bỏ
    qua). Thẩm mỹ.
  - R-B2-4 (mang sang): chưa có hạn mức preview theo người dùng (lựa chọn I-5 của chủ còn mở); `npm ci` báo một cảnh
    báo high trong `source-map-js` chỉ dùng cho dev; ngân sách chỉ đo trên máy trạm và NAS là NOT VERIFIED.
- Gate chưa chạy/bị chặn và lý do: không mục bắt buộc nào của vùng B bị bỏ. Không chạy lại vì nằm ngoài brief này và
  WP4-REGATE2 đã chạy trên digest này: bộ e2e (145 đạt, 5 bỏ qua) và drill container (208 PASS). Đích NAS là NOT
  VERIFIED (không có quyền truy cập của chủ), điều này cũng liên quan tới ngân sách.
- Xử lý phát hiện trước:
  - WP4-RB-01 (mở lại WP4-B-01): cơ chế (a) markup không được đếm và lũ thuộc tính và (b) báo cáo không chặn và lỗi
    500 **đã sửa và đã kiểm** trên mọi dạng cũ và mới; lớp lỗi bị chặn và tuyến tính. Ngân sách bằng số đã nêu
    **chưa đạt** với hai dạng: WP4-RB2-01 (Thấp).
  - R-RB1 (500 khi dựng báo cáo): **đã sửa** (L5/L6 422; lỗi tuần tự hóa và ánh xạ trong các bộ test là 422).
  - R-RB2 / I-5 (hạn mức preview): lựa chọn còn mở của chủ, không phải lỗi.
  - WP4-B-02, R1, R3: vẫn giữ (bộ test và các kiểm tra nhanh qua HTTP).
  - DEPCLEAN: đã gỡ `fast-xml-parser`, không phụ thuộc nào khác đổi: **đã kiểm**.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: sẵn sàng phần mềm của vùng B chưa được nghiệm thu cho tới khi
  WP4-RB2-01 được sửa (hoặc ngân sách được nêu lại) và được recheck trên digest mới; mọi quy tắc toàn vẹn dữ liệu, riêng
  tư và báo cáo của vùng đều giữ dưới các probe. Chưa xin và chưa có phép pilot của chủ. Không triển khai, không dữ
  liệu thật hay mail thật.
- Một bước/prompt tiếp: coordinator giao một bản sửa có phạm vi (`handoff/prompts/FIX_FINDINGS.md`) cho WP4-RB2-01 trong
  `xlsxReader.ts` (giải mã thuộc tính giữ lại một lần và giới hạn độ dài; thôi ghim phần đã giải mã hoặc hạ giới hạn
  mở thẻ) kèm test red-first từ E7 và Y7 — hoặc nêu lại ngân sách trong docs/07, `.vi.md` và chú thích code — rồi
  freeze, regate và một recheck vùng B mới trên digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP4_RECHECK_B2.md](WP4_RECHECK_B2.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP4-RECHECK-B2 lần 1 (agent ID trên board do coordinator
  ghi; reviewer không quan sát được). Author của snapshot đang kiểm: WP4-FIXB2 `a25ba7423ae0846ed`
  (`claude-opus-5-5`), WP4-DEPCLEAN `af38846cc479cc2e3` (`claude-sonnet-5-5`), committer freeze `a6aac816cd417734e`;
  verifier gate WP4-REGATE2 `acddc52ef017c9200`; các author và auditor vùng B trước được ghi trong WP4_REVIEW_B và
  WP4_RECHECK_B.
- Context mới; xác nhận reviewer không viết thay đổi: context mới; reviewer này không viết thay đổi, bản sửa, freeze
  hay gate nào của WP4 và không chạy WP4-AUDIT-B lẫn WP4-RECHECK-B. Nó chỉ viết cặp báo cáo này, phần Results trong
  brief của nó và `evidence/WP4-RECHECK-B2/`. Mọi workbook độc hại được dựng và giữ trong thư mục task; không workbook
  hay file nhị phân nào nằm trong bằng chứng; hash template không đổi.
- Digest trước/sau; bằng chứng gate snapshot đó: `96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503`
  trước và sau (`01-baseline.txt`, `21-digest-after.txt`); WP4-REGATE2 PASS trên cùng commit và digest, được coi là
  một tuyên bố và đã chạy lại cho vùng này.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP4_RECHECK_B2.md` và `.vi.md` (mới). WP4_REVIEW_B,
  WP4_RECHECK_B và mọi báo cáo trước giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: WP4-RB2-01 (sửa hoặc nêu lại); rồi một recheck vùng B mới
  của WP4 trên digest mới. Không để lại máy chủ, runner, container hay tiến trình nền nào; mọi tiến trình con máy chủ
  được dừng qua handle; không chạy lệnh docker nào. Một vi phạm thủ tục không gây ảnh hưởng (một lệnh thừa không làm
  gì chuyển hướng tới /dev/null) và các lỗi probe được ghi trong `22-incidents.txt`.
