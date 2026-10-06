# Review độc lập

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP4, recheck độc lập mới cho vùng B
  (dữ liệu) sau vòng sửa (WP4-B-01, WP4-B-02, R1, R3, và kiểm vùng B còn vững trên freeze
  mới); 2026-10-06; task WP4-RECHECK-B lần 1 (profile timesheet-auditor, yêu cầu opus/xhigh);
  model tự báo `claude-opus-5-5`; effort không quan sát được. Model author mạnh nhất của WP4 là
  `claude-opus-5-5`; các author WP4-FIXB/FIXA tự báo `claude-sonnet-5-5` và verifier WP4-REGATE
  `claude-sonnet-5-5`, nên model reviewer không yếu hơn bất kỳ author nào của snapshot đang
  kiểm. WP4-RECHECK-A chạy cùng lúc ở thư mục riêng; không chia sẻ file hay tiến trình nào.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  `0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65` (là `freeze_commit` của WP4-REGATE). Source digest
  `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` (775 file, bỏ handoff/)
  trước và sau, bằng `scripts/source-digest.mjs` và dạng `git ls-tree` trên cả HEAD lẫn commit;
  bằng digest gate đã ghi. HEAD không đổi; ngoài handoff/ cây làm việc bằng commit (không thay
  đổi file ngoài handoff, cả tracked lẫn untracked). Source đủ: mọi kiểm tra chạy trên bản
  `git archive` của commit tại `D:\.claude-tmp\timesheet\WP4-RECHECK-B` (ngoài Dropbox); bốn
  file đang kiểm trong bản export hash trùng blob của commit (`10-export-integrity.txt`).
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.** WP4-B-02, R3 và R1 đã đóng
  và phần còn lại của vùng B vẫn vững, nhưng WP4-B-01 **chưa** đóng: một upload nhỏ tôn trọng
  mọi giới hạn đang có vẫn có thể chặn event loop nhiều giây và cấp phát hàng trăm MiB đến một
  GiB, và báo cáo lưu vẫn không bị chặn theo giá trị ô (tên ngày lễ, nhãn, chuỗi inline) — tới
  một `report_json` 100 MiB lưu từ upload 28 KB, hoặc một 500 `internal_error` từ upload 50 KB.
  Một lỗi mở lại WP4-B-01 (RB-01, mức Trung bình) với hai cơ chế.
- Phạm vi thật đã xem/chạy:
  1. Đọc source tại commit đang kiểm: `import/xlsxReader.ts` (giới hạn byte theo phần mới, quét
     trước phần tử/ô/dòng/chuỗi dùng chung `scanElements` và regex `ELEMENT_OPENING`, ngân sách
     inflate, dựng DOM), `import/templateMapping.ts` (`finalizeFindings` với `MAX_FINDING_SOURCES`/
     `MAX_FINDINGS_PER_CODE`, `readHolidays` với `MAX_HOLIDAY_ROWS`, `detectFormulaDefects`,
     `mapWorkbook`), `services/workbookImport.ts` (`planPeriod` `not_due`, `IMPORT_RULES`,
     `previewImport` lưu cả báo cáo), `services/otLeave.ts` (chốt R1 trong `reserveOtLeave`,
     `insideImportedPeriod`), `services/automation.ts` (so sánh `dueAtUtc`), nhãn `not_due`/
     `period_not_due` ở client `api.ts`/`importModel.ts`, và `app.ts`. fast-xml-parser 5.11.2
     `readTagExp`/`resolveNameSpace` (nó parse những tên thẻ nào).
  2. Chuẩn: docs/03 (import, số dư đầu, ranh giới API, "validated upload types/sizes"), docs/07
     "Nhập workbook" (câu về các giới hạn và mặc định an toàn I-3), docs/10 (quyết định import
     WP4 ngày 2026-10-06, I-3), WP4_REVIEW_B, kết quả WP4-FIXB/FIXA/REGATE, các probe WP4-AUDIT-B.
  3. Thực thi: `npm ci` và `npm run verify` trên bản export; sáu bộ test của vùng B; bốn probe
     của tôi (bộ đo chi phí trong bộ nhớ dựng lại P1b/B-02/P7 của audit cộng gói thù địch của
     tôi; probe cơ chế một-phần; probe HTTP máy chủ đã build với health song song; probe đọc
     cấu trúc template).
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả tại
  `handoff/delivery/evidence/WP4-RECHECK-B/`, đã mask, LF; Node v24.21.0 gọi bằng đường dẫn đầy
  đủ; chỉ Git Bash; chế độ capture, `JOB_RUNNER=off`; `DATA_DIR` và `DATABASE_PATH` khai báo rõ
  dưới thư mục task cho mọi lần chạy CLI/máy chủ; precommit trên bằng chứng: PASS, 13 file, 0
  phát hiện):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (trước) | 0f7fba2; dfe4541d…6742 (775 file) cả hai cách, HEAD và commit; exit 0 | `01-baseline.txt` |
| `npm ci` (export) | 169 gói; 1 advisory cao (source-map-js, chỉ dev); không có dòng deprecation; exit 0 | `02-npm-ci.txt` |
| `npm run verify` (export, `--trace-deprecation --pending-deprecation`, `DATA_DIR` export) | typecheck, lint, 76 file / 1734 test, build, SMOKE PASSED; không deprecation; exit 0 | `03-verify.txt` |
| `vitest run` workbook-import, workbook-reader, opening-balance, sharing-matrix, ot-leave, client importModel | 6 file, 176 test pass; exit 0 | `04-suites.txt` |
| `node probes/r1-cost.mjs` (một child build + một run child mới mỗi case, trong bộ nhớ) | P1b/B-02/P7 của audit đều bị từ chối nhanh với RSS có chặn; template, workbook 26 và 60 sheet được chấp nhận; các gói hình thẻ, thuộc tính và chuỗi lớn của tôi được chấp nhận ở nhiều giây / 0,3–1,4 GiB, hoặc báo cáo 24–143 MiB, hoặc `JSON.stringify` ném `RangeError` | `05-r1-cost.txt`, `probe-r1-cost.mjs.txt` |
| `node ../probes/r2-http.mjs` (máy chủ build, `/api/health` song song) | các gói của audit bị từ chối trong 3–12 ms với health 2 ms; H2a 201 sau 3221 ms, health chờ 2920 ms; H4b 201 sau 5073 ms, health 4772 ms; H5d 201 lưu `report_json` 99.81 MiB; H5b 500 `internal_error` sau 5172 ms, log máy chủ `RangeError: Invalid string length`, máy chủ vẫn sống; exit 0 | `06-r2-http.txt`, `probe-r2-http.mjs.txt` |
| `node probes/r3-bypass.mjs` (một phần ~3,8 MiB, dưới mọi giới hạn) | `<c/>`/`<row/>` bị từ chối; `<1/>`, `<9/>`, `< />`, `<.a/>` và một `<c>` có 3,8 MiB thuộc tính đều được chấp nhận ở 0,6–1,1 s và 0,3–0,59 GiB cho upload 26 KB–1 MB | `07-r3-bypass.txt`, `probe-r3-bypass.mjs.txt` |
| digest sau; toàn vẹn export | không đổi; hash template `47ef42d5…6331`; bốn file đang kiểm hash trùng commit | `09-digest-after.txt`, `10-export-integrity.txt` |

  Kết quả theo mục phạm vi:
  - **1 Mỗi phát hiện đã đóng chưa.**
    - **WP4-B-02 — đã đóng.** Ca đã kiểm (150.000 ô Holiday Dates, 692 KB) nay bị từ chối
      `422 workbook_rejected`/`part_too_large` trong 7–13 ms, không còn 500 (trong bộ nhớ và qua
      HTTP). Sheet lễ 40.000 ô thật dưới giới hạn phần được preview sạch. 2.001 dòng ngày ở A/B
      bị từ chối `too_many_holidays`; một dòng xa thưa `A9999999` (và kết hợp dòng xa `A/B/C`)
      được preview dưới 30 ms — vòng lặp `readHolidays` nay lấy dòng từ các ô tồn tại, không
      spread và không lặp tới dòng xa. `verify` gồm các test B-02.
    - **WP4-B-01 — CHƯA đóng (xem phát hiện RB-01).** Ba gói đã kiểm thì đã sửa: gói `<c/>` 65 KB
      và gói `<c><v>1</v></c>` 113 KB bị từ chối `part_too_large` trong 4–6 ms ở ~82 MiB; gói P7
      nhiều công thức 2,7 MB bị từ chối `part_too_large`, gói bảy sheet 6,2 MB `total_too_large`;
      `/api/health` giữ 2 ms qua mỗi lần từ chối. Template và workbook 60 sheet được chấp nhận
      trong 20–170 ms dưới 120 MiB. Nhưng chính lời của phát hiện — "chi phí parse của một upload
      nhỏ bên trong mọi giới hạn là vô hạn về thời gian và bộ nhớ, và báo cáo lưu phình theo nó"
      — vẫn đúng cho các gói mà bản sửa không chặn (RB-01).
  - **2 Các chốt mới có đúng không.**
    - **R3 (`not_due`) — PASS.** `planPeriod` đặt `not_due` khi kỳ đã kết thúc nhưng
      `period.dueAtUtc > nowSeconds`, khớp quy tắc của chính lần quét hạn chót (`automation.ts:200`,
      chính thời điểm đến hạn tính là đã đến hạn). Chỉ-bỏ-qua: hành động duy nhất được phép là
      `skip`, `importable_days` bằng 0, `IMPORT_RULES` lưu quy tắc thời điểm đến hạn, một `import`
      rõ ràng của ngày như vậy là `422 decision_not_allowed`, và đúng thời điểm đến hạn trạng thái
      chuyển `new` và không cần quyết định — đều được bộ test khẳng định (`workbook-import …
      red-first (R3)`), gồm cả việc không ghi gì khi còn `not_due`. Đánh giá I-3: trong khuôn khổ
      quy tắc chuẩn. I-3 (a) của chủ là "kỳ chưa kết thúc không nhập được"; `not_due` chỉ làm điều
      đó chặt hơn trong vài ngày giữa lúc kỳ kết thúc và thời điểm đến hạn lương, được ghi ở docs/10
      là quyết định coordinator thận trọng, đảo ngược được, và giữ F-2 (kỳ đã nhập không ký được,
      nên import không được chiếm trước kỳ đang sống). Không đổi yêu cầu đã chốt nào.
    - **R1 — PASS.** `reserveOtLeave` ném `importedPeriodError()` (409 `imported_period`) cho ngày
      nghỉ nằm trong kỳ `imported_unverified`, sau kiểm trùng idempotent và trước kiểm số dư, nên
      không đặt chỗ gì; chốt dùng-use giữ làm phòng thủ lớp hai. Bộ test ot-leave khẳng định việc
      đặt chỗ là 409 và không tạo gì, và việc dùng một đặt chỗ có trước import cũng là 409.
  - **3 Hồi quy — vững.** `npm ci` và `npm run verify` trên export pass (76 file, 1734 test,
    SMOKE PASSED, không deprecation). Các bộ workbook-import, workbook-reader, opening-balance,
    sharing-matrix, ot-leave và client importModel pass (176 test). 404 theo chủ sở hữu, tính
    idempotent, hai-kết-nối đua, các chốt F-2, số dư đầu và client được các bộ đó chạy và không
    đổi do bản sửa. Diff sửa so với 13a258d chỉ nằm trong các path FIXB/FIXA (xác nhận bằng digest
    và cây làm việc ngoài handoff bằng commit).
  - **4 Đồng bộ tài liệu (docs/07, docs/10) — chính xác như viết, nhưng xem RB-01.** Đoạn nhập
    workbook của docs/07 nêu các giới hạn (4 MiB XML mỗi phần, 16 MiB mỗi gói, giới hạn phần tử,
    ô, dòng và chuỗi dùng chung, >2.000 dòng lễ → 422, phát hiện bị giới hạn) và mặc định an toàn
    `not_due`; mọi con số khớp `DEFAULT_READER_LIMITS`, `MAX_HOLIDAY_ROWS` và `finalizeFindings`.
    Mục 2026-10-06 của docs/10 khớp code và ghi đảo ngược được. Tài liệu mô tả giới hạn trung
    thực; lời khẳng định quá mức rằng các giới hạn chặn khối lượng công việc nằm trong chính header
    comment của `xlsxReader.ts`, thuộc RB-01, không phải lỗi tài liệu riêng.
- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:

| ID | Mức | File/hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc/AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| RB-01 | Trung bình (mở lại WP4-B-01) | `src/server/import/xlsxReader.ts` `scanElements`/`ELEMENT_OPENING` và `inflateEntry` (chỉ còn chặn theo byte khi quét đếm thiếu); `src/server/import/templateMapping.ts` `readHolidays`/`readPeriod` và `previewImport` lưu cả báo cáo (giá trị ô không bị chặn) | **(a) Chi phí parse.** Một phần worksheet ~3,8 MiB (upload 26 KB, dưới giới hạn 4 MiB mỗi phần và 16 MiB mỗi gói) điền `<1/>`, `<9/>`, `< />` hoặc `<.a/>` — tên thẻ `ELEMENT_OPENING` không khớp nhưng fast-xml-parser vẫn parse — preview trong 0,6–0,9 s ở 0,3–0,59 GiB (`r3-bypass`); cùng phần đó điền `<c/>` thì bị từ chối đúng. Bốn phần như vậy (upload 33 KB, H2a) → 201 sau 3221 ms với `/api/health` bị chặn 2920 ms (`r2-http`), ~1,4 GiB trong bộ nhớ (`r1-cost`). Một `<c>` với 3,8 MiB thuộc tính (quét đếm một phần tử) → 1,1 s / 0,55 GiB; bốn phần (4,19 MB, H4b) → 201 sau 5073 ms, health chặn 4772 ms. **(b) Kích thước báo cáo / sập.** Một chuỗi dùng chung 1 MiB được 100 tên lễ tham chiếu (upload 28 KB, H5d, tôn trọng mọi giới hạn) → một `report_json` 99,81 MiB được lưu và trả về; một chuỗi 4 MiB × 2.000 tên lễ (upload 50 KB, H5b) → `500 internal_error` sau 5172 ms, log máy chủ `RangeError: Invalid string length` (máy chủ vẫn sống); 3 sheet có ngày với nhãn chuỗi inline 4 MiB (56 KB, H6a/b) → báo cáo 24–143 MiB. | Kỳ vọng: các giới hạn chặn thời gian CPU, bộ nhớ và kích thước báo cáo lưu mà một gói không tin cậy bên trong giới hạn có thể gây ra, như `xlsxReader.ts:21-25` và docs/07 tuyên bố; gói bị từ chối trước khi cấp phát lớn. Thực tế: (a) regex quét trước yêu cầu tên thẻ bắt đầu bằng `[A-Za-z_]`, nên các mở thẻ bắt đầu bằng chữ số, dấu chấm, dấu câu và khoảng trắng (mà fast-xml-parser vẫn dựng thành DOM) và thuộc tính của phần tử không bao giờ được đếm — giới hạn byte 4/16 MiB là chốt duy nhất, và ~16 MiB markup như vậy dựng một DOM hàng triệu nút chặn event loop nhiều giây và tăng RSS hàng trăm MiB đến >1 GiB (NAS nhỏ, đích của docs/07, có thể OOM). (b) `MAX_FINDING_SOURCES` chỉ chặn các danh sách địa chỉ `sources`; tên lễ, nhãn ngày và giá trị ô chuỗi inline được lưu và trả về đầy đủ, nên báo cáo (`imports.report_json`, mà schema không bao giờ xóa) không bị chặn và giá trị lớn làm sập mapping/serialization bằng 500. | docs/03 "validated upload types/sizes"; docs/07 "Nhập workbook" (giới hạn từ chối "… và phát hiện trả về bị giới hạn"); `xlsxReader.ts:21-25`; FR-16; WP4-PLAN T08; WP4_REVIEW_B WP4-B-01 | Trong `scanElements`, đếm mọi `<` mở một thẻ cho tổng phần tử (khớp mọi ký tự không phải `/`, `!`, `?` sau `<`), không chỉ tên bắt đầu `[A-Za-z_]`, để markup chưa đếm không thể tới DOM; chặn thuộc tính mỗi phần một cách rẻ (ví dụ từ chối phần có số `=` hay số thuộc tính vượt ngưỡng), hoặc hạ `maxPartXmlBytes`/`maxTotalXmlBytes` để DOM chưa đếm xấu nhất bị chặn. Chặn độ dài lưu và trả về của mỗi giá trị ô giữ trong báo cáo (tên lễ, nhãn, chuỗi inline) — ví dụ cắt còn vài trăm byte kèm cờ — để kích thước `report_json` bị chặn bất kể nội dung ô, và `mapWorkbook`/`JSON.stringify` không thể ném. Thêm test red-first từ `r1-cost`/`r3-bypass`/`r2-http` (một phần điền `<1/>` bị từ chối hoặc có chặn; một gói chuỗi-dùng-chung/chuỗi-inline lớn cho báo cáo có chặn, không bao giờ 500). |

- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R-RB1: `previewWorkbook` bắt `WorkbookRejectedError` và trả 422, nhưng RB-01 (b) cho thấy một
    gói được chấp nhận vẫn có thể ném `RangeError` thuần ra khỏi `mapWorkbook`/dựng báo cáo, mà
    route báo là 500. Một 422/413 phòng thủ cho mọi lỗi khi dựng báo cáo (không chỉ
    `WorkbookRejectedError`) sẽ tránh 500 ngay cả trước khi chốt giá trị của RB-01 vào. Không
    phải lỗi riêng; gộp vào bản sửa RB-01.
  - R-RB2 (mang từ WP4_REVIEW_B R4): preview và file nguồn được giữ không có hạn mức theo user;
    cùng với báo cáo lớn của RB-01 (b), các upload khác nhau lặp lại làm phình DB và thư mục dữ
    liệu. Lựa chọn mở I-5 (khuyến nghị: tối đa 20 preview chưa commit mỗi người). Không phải lỗi.
  - R-RB3: R1 và R2 của WP4_REVIEW_B đã xử lý/giữ — R1 (đặt chỗ trong kỳ đã nhập) nay là 409 (đã
    sửa, ở trên); R2 (preview kiểu `can_commit` rồi 409) là sắc thái trình bày đã khóa ở client,
    không đổi, chấp nhận được.
  - R-RB4: `npm audit` báo một advisory cao ở `source-map-js` (chỉ dev), ngoài vùng B.
- Gate chưa chạy/bị chặn và lý do: không mục bắt buộc nào của vùng B bị bỏ. Bộ e2e đầy đủ và màn
  diễn container ngoài phạm vi recheck này (WP4-REGATE đã chạy trên digest này: e2e 145 pass/5
  skip, drill 208 PASS). Đích NAS là NOT VERIFIED (không có quyền của chủ), cũng liên quan đến rủi
  ro OOM của RB-01 trên thiết bị nhỏ.
- Xử lý phát hiện trước:
  - WP4-B-02: **đã sửa và xác minh.** R1, R3: **đã làm và đúng.**
  - WP4-B-01: **chưa đóng.** Các gói đã kiểm bị từ chối, nhưng lớp lỗi của phát hiện (chi phí
    parse và phình báo cáo cho upload nhỏ trong giới hạn) còn tồn tại qua RB-01; cần thêm một vòng
    sửa và recheck.
  - Mặc định `not_due` của I-3, đồng bộ docs/07 và docs/10, và nhãn client: chính xác và trong
    khuôn khổ chuẩn.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: sẵn sàng phần mềm của vùng B chưa được
  nghiệm thu — RB-01 mở lại WP4-B-01 và phải được sửa rồi recheck trên digest mới. Mọi quy tắc
  toàn vẹn dữ liệu và riêng tư của vùng vững qua các probe (không truy cập chéo chủ, idempotent,
  chốt F-2, số dư đầu, khóa client). Phép pilot của chủ chưa được xin hay cấp. Không triển khai,
  không dữ liệu thật, không thư thật.
- Một bước/prompt tiếp: coordinator giao một task sửa có phạm vi (`handoff/prompts/FIX_FINDINGS.md`)
  cho RB-01 trong `xlsxReader.ts` (đếm mọi mở thẻ và chặn thuộc tính) và `templateMapping.ts`/
  `workbookImport.ts` (chặn độ dài giá trị ô lưu và không bao giờ 500 khi dựng báo cáo), kèm test
  red-first từ recheck này, rồi freeze, regate và một recheck vùng B mới trên digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP4_RECHECK_B.md](WP4_RECHECK_B.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP4-RECHECK-B lần 1. Author của
  snapshot đang kiểm: WP4-FIXB và WP4-FIXA (đều tự báo `claude-sonnet-5-5`); các author trước của
  vùng (T02/T08/T09/T10/T11, WP4-DEC) và auditor WP4-AUDIT-B được ghi ở WP4_REVIEW_B. Verifier
  WP4-REGATE tự báo `claude-sonnet-5-5`.
- Context mới; xác nhận reviewer không viết thay đổi: context mới; reviewer này không viết thay
  đổi, freeze, gate hay audit trước nào của WP4 (kể cả audit vùng B lần đầu). Chỉ viết cặp báo
  cáo này, phần Kết quả của brief và `evidence/WP4-RECHECK-B/`. Mọi probe chạy trong bộ nhớ hoặc
  với một máy chủ build dùng-một-lần dưới thư mục task; không workbook nào ghi vào repo và hash
  template không đổi.
- Digest trước/sau; bằng chứng gate snapshot đó:
  `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` trước và sau
  (`01-baseline.txt`, `09-digest-after.txt`); WP4-REGATE PASS trên cùng commit và digest, coi là
  tuyên bố và được chạy lại cho vùng này.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP4_RECHECK_B.md` và `.vi.md`
  (mới). WP4_REVIEW_B và mọi báo cáo trước không đổi.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: RB-01 (sửa; mở lại WP4-B-01);
  WP4-B-02, R1, R3 đã đóng. Tiếp theo: một bản sửa có phạm vi của `xlsxReader.ts`/
  `templateMapping.ts`/`workbookImport.ts`, rồi một recheck vùng B mới trên digest đã sửa. Không
  để lại tiến trình chạy hoang hay task nền; mọi probe chạy foreground và máy chủ build được dừng
  qua handle.
