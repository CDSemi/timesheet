# Rà soát độc lập

Bản gốc tiếng Anh: [WP4_RECHECK_B4.md](WP4_RECHECK_B4.md) (tiếng Anh là bản chuẩn).

- Gói/ngày/người rà và model/effort quan sát được: WP4, lần rà soát độc lập thứ tư của vùng B (dữ liệu) sau vòng sửa 4
  (WP4-FIXB4: giải nén bằng lời gọi zlib native, giải mã theo bước, cận ngân sách phân tích suy ra từ các giới hạn, và
  hạ trần kích thước file tải lên và gói). Kiểm tra xem WP4-RB3-01 đã đóng chưa (cận phân tích đã nêu nay có giữ với
  biên an toàn cho nội dung nén được và không nén được) và vùng B có còn vững không. 2026-10-06; tác vụ WP4-RECHECK-B4
  lần 1 (hồ sơ timesheet-auditor, yêu cầu opus/xhigh, không override); model tự khai `claude-opus-5-5`; effort không
  quan sát được. Tác giả của ảnh chụp được rà: WP4-FIXB4 `claude-opus-5-5`; WP4-DEPCLEAN2 (chỉ package.json/lock);
  người freeze và người gate WP4-REGATE4 (`claude-sonnet-5-5`) không viết mã nguồn. Model người rà không yếu hơn tác
  giả mạnh nhất. WP4-RECHECK-A lần 4 chạy song song trong thư mục riêng; không chia sẻ tệp hay tiến trình và không đọc
  báo cáo của nó.
- SHA commit được rà và digest nguồn; commit chưa đẩy; độ đầy đủ của nguồn:
  `546cddaf6747aef85e8b6d9b7712de9e28f138bf` (chính là `freeze_commit` của WP4-REGATE4, trên origin/main; HEAD =
  origin/main). Digest nguồn `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 tệp, loại trừ
  handoff/) trước và sau, tính bằng `scripts/source-digest.mjs` và bằng dạng `git ls-tree`; bằng đúng digest gate đã ghi.
  HEAD không đổi; cây làm việc chỉ khác dưới handoff/. Mọi kiểm tra chạy trên bản xuất `git archive` của commit đó dưới
  thư mục tác vụ; năm tệp nguồn vùng B của nó trùng mã băm với blob đã commit (`git hash-object --no-filters`:
  `xlsxReader.ts` f20abaf3, `templateMapping.ts` 96299179, `workbookImport.ts` f2990e38, `routes/imports.ts` 10ac5445,
  `importModel.ts` f8f58d5c). Bộ đọc WP4-T09 được xuất từ `13a258d` vào cùng thư mục tác vụ.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.** WP4-RB3-01 đã đóng. Cận ngân sách phân tích nay được suy ra
  từ các giới hạn áp đặt, không còn khẳng định từ các hình dạng đã dò; cách suy ra là đúng và tái lập được độc lập; và ở
  các trần đã hạ, mọi cấu trúc xấu nhất đều nằm sâu trong ngân sách 500 ms / +150 MiB và dưới cận suy ra. Các hình dạng
  không nén được của WP4-RECHECK-B3 từng kẹt 508-648 ms nay bị từ chối trong 0-3 ms bởi trần tải lên 2 MiB. Giải mã một
  lần, các mức trần, R-B2-1, R-B2-2, phép so sánh lành tính và các bộ test hồi quy đều còn vững. Không có lỗi mới.
- Phạm vi đã thực sự kiểm tra/chạy:
  1. Đọc nguồn tại commit được rà: `import/xlsxReader.ts` toàn bộ (chú thích ngân sách và `DEFAULT_READER_LIMITS`,
     `inflateEntry` với `inflateRawSync`/`maxOutputLength`, giải mã theo bước `decodeFlat`/`DECODE_STEP`,
     `decodeXml`/`SHORT_TEXT`, `ownCopy`, `scanXml` với việc hoãn giải mã thuộc tính giữ lại một lần mỗi thẻ, lối tắt địa
     chỉ chuẩn trong `readWorksheet`), `templateMapping.ts` (`scanText`/`MAX_TEXT_SCAN`, `readHolidays`,
     `detectFormulaDefects`, `mapWorkbook`, `previewWorkbook`), `services/workbookImport.ts` (`buildReport`,
     `serializeReport`/`MAX_REPORT_BYTES`, `buildPlan`, `previewImport`), `routes/imports.ts` (`DEFAULT_IMPORT_MAX_BYTES`
     = `maxCompressedBytes` của bộ đọc, 413 `payload_too_large`), `client/importModel.ts`; diff `972ccda..546cdda`.
  2. Cách suy ra: công thức chi phí và phép đo hệ số 61 họ đơn vị (`05`/`06` của WP4-FIXB4), kiểm từng nguồn chi phí
     (giải nén, giải mã, quét, thuộc tính, giá trị giữ lại, mapping, dựng và tuần tự hóa báo cáo), rồi đo lại độc lập
     (lượt 61 họ của chính người rà, `20-coeff.txt`) và tính lại bằng đối ngẫu quy hoạch tuyến tính (`21-bound.txt`).
  3. Tài liệu chuẩn: docs/07 "Workbook import" và `.vi.md` (câu 2 MiB, cận suy ra, hệ số, xác nhận), docs/11 EN/VI
     (2 MiB), docs/03 (không nêu kích thước), WP4_REVIEW, WP4_RECHECK_B3 và các probe của nó, kết quả WP4-FIXB4 và
     WP4-REGATE4.
  4. Thực thi: `npm ci` và `npm run verify` trên bản xuất; bốn bộ test vùng B; danh mục cấu trúc xấu nhất của FIXB4 (23
     hình) ở chế độ preview và cả đường dịch vụ; các danh mục không nén được của WP4-RECHECK-B3 dựng lại ở kích thước cũ
     đối chiếu bộ đọc trần mới; đo lại hệ số và tính lại cận độc lập; probe tính đúng (giải mã một lần, trần, R-B2-1,
     R-B2-2); phép so sánh hai bộ đọc lành tính với WP4-T09; probe HTTP máy chủ đã build có thăm dò `/api/health`.
- Bảng chứng cứ: lệnh | kết quả/exit | chứng cứ (đều dưới `handoff/delivery/evidence/WP4-RECHECK-B4/`, đã che, LF):

| Lệnh | Kết quả/exit | Chứng cứ |
|---|---|---|
| `git rev-parse HEAD`; `source-digest.mjs`; `git ls-tree … \| sha256sum` (trước) | 546cdda; 26fcc969…9081 (775 tệp) cả hai cách; exit 0 | `01-baseline.txt` |
| `npm ci` (bản xuất 546cdda; bản xuất 13a258d) | cài gói; 1 cảnh báo high chỉ ở dev (`source-map-js`, mang theo); exit 0 và 0 | `02-npm-ci.txt`, `03-t09-npm-ci.txt` |
| `npm run verify` (`--trace-deprecation --pending-deprecation`) | typecheck, lint, 76 tệp / 1758 test, build, SMOKE PASSED (41 PASS); không có dòng deprecation; exit 0 | `04-verify.txt` |
| `vitest run` workbook-reader, workbook-import, opening-balance, sharing-matrix | 4 tệp, 131 test đạt; exit 0 | `05-suites.txt` |
| `run-cost.mjs` CASES=`worst.mjs` `--run` (23 cấu trúc xấu nhất ở trần, 3 lượt) | tất cả được nhận, nằm trong mọi trần; xấu nhất một lượt 89 ms và +71 MiB; không OVER-BUDGET, không ném lỗi; exit 0 | `14-worst-run.txt` |
| `run-cost.mjs` CASES=`worst.mjs` `--full` (cả `previewImport`, 2 lượt) | tất cả được nhận; xấu nhất 90 ms và +46 MiB; không OVER-BUDGET, không ném lỗi; exit 0 | `16-worst-full.txt` |
| `run-cost.mjs` CASES=`rcb3-cases(2).mjs` `--run` (kích thước cũ, bộ đọc trần mới, 2 lượt) | 210 bị từ chối (`package_too_large`/`part_too_large`/`too_many_elements`/`total_xml_too_large`) trong 0-3 ms; 2 được nhận (báo cáo thực tế 2000 ngày lễ, 35 ms/+16 MiB); không OVER-BUDGET, không ném lỗi; exit 0 | `15-rcb3.txt` |
| `coeff.mjs` (61 họ, env đã chọn, 3 lượt) + `bound.mjs 3145728 100000 500000` | 61 đơn vị `@@`; cận tính lại 105,5 ms và +90,8 MiB (21 % và 61 % ngân sách), cùng tổ hợp xấu nhất; exit 0 | `20-coeff.txt`, `21-bound.txt` |
| `correct.mjs` | 75 PASS, 0 FAIL; 3 LENIENT (R-B3-1); exit 0 | `18-correct.txt` |
| `diff-build`/`diff-dump` (cả hai bản xuất)/`diff-compare` | ô của bộ đọc giống từng byte (1055 và 7403); preview giống sau khi bỏ `sourceCount`; báo cáo lưu giống sau khi bỏ `sourceCount` và phần `rules[3..7]` thêm sau T09 (168 ngày, 12 cờ floating, 23 ngày lễ, 44 phát hiện, 49 quyết định); compare exit 1 theo thiết kế | `17-differential.txt` |
| `http.mjs` (máy chủ build, cổng rảnh do OS cấp, capture, JOB_RUNNER=off) | template 201/24 ms, 12-sheet thực tế 201/26 ms; 5,4 MB không nén được → 413 trong 3 ms; xấu nhất tại trần 201/77 ms; `/api/health` xấu nhất 78 ms, không có non-200, không 5xx, 0 dòng lỗi máy chủ; máy chủ dừng qua handle | `19-http.txt` |
| digest sau; đồng nhất bản xuất/nguồn | không đổi; năm tệp vùng B trùng blob commit; không có thay đổi cây làm việc ngoài handoff | `99-digest-after.txt` |

  Kết quả theo từng mục:
  - **1 Cách suy ra là đúng (WP4-RB3-01 đã đóng).**
    - Công thức: thời gian <= 40 ms + 14,8 ns·X + 339 ns·O, bộ nhớ <= 15 MiB + 13,3 B·X + 428 B·O (X byte XML giải mã,
      O lần mở markup; thuộc tính tính giá 0 vì mỗi cái tốn ít hơn số byte của nó). Giá lấy từ 61 họ đơn vị đo được bằng
      đối ngẫu quy hoạch tuyến tính, nên không tổ hợp đơn vị nào trong giới hạn tốn hơn. Ở trần đã chọn (X = 3 MiB,
      O = 100 000) cận khoảng 121 ms và +95 MiB (24 % và 63 % ngân sách).
    - Mọi nguồn chi phí đều có trong công thức hoặc được xác nhận qua lượt dịch vụ đầy đủ: giải nén (họ `bytes-*`, giải
      nén native vào một bộ đệm), giải mã (họ `kept-text-refs/amp/bare-amp`, theo bước qua `DECODE_STEP` cho phần trên
      512 KiB), quét (`openings`, `attributes`), thuộc tính và giá trị giữ lại (`kept-cell-max`, `values`,
      `kept-attributes`, `kept-attribute-flood`, hình A2), mapping (probe đo bộ đọc + mapping cùng nhau), và dựng +
      tuần tự hóa báo cáo (lượt `--full` đo cả `previewImport`, báo cáo bị chặn bởi `MAX_REPORT_BYTES` = 2 MiB và
      `MAX_TEXT_LENGTH` = 200).
    - Xác nhận độc lập bằng đo. Tôi đo lại 61 họ hệ số trên máy này và tính lại cận bằng đối ngẫu quy hoạch tuyến tính:
      105,5 ms và +90,8 MiB, cùng tổ hợp xấu nhất (ô giữ rỗng + formulas-rand100-wide), đều dưới ngân sách với biên
      79 % và 39 % — nhất quán với 121 ms / +95 MiB đã nêu (là bao hình thận trọng hơn). 23 cấu trúc xấu nhất tại trần
      (một phần không nén được ở mỗi giới hạn đơn vị, nội dung không nén được ở trần XML/mở/thuộc tính/tải lên 2 MiB, các
      tổ hợp xấu nhất do chính cận chỉ ra, và các hình đắt nhất của recheck dựng lại) đều nằm trong mọi trần và sâu dưới
      ngân sách: xấu nhất preview một lượt 89 ms và +71 MiB, xấu nhất dịch vụ đầy đủ 90 ms và +46 MiB. Không vượt các con
      số đã nêu.
  - **2 Các trần vững.** Giới hạn tải lên của route là `DEFAULT_READER_LIMITS.maxCompressedBytes` = 2 MiB và trả 413
    `payload_too_large` khi vượt (probe HTTP: gói không nén được 5,4 MB → 413 trong 3 ms, `/api/health` 2 ms). Thông báo
    phía client là "2 MiB" (`importModel.ts`); docs/07 và docs/11 EN và VI ghi 2 MiB; docs/03 không nêu kích thước; các
    chuỗi "8 MiB" còn lại chỉ là ghi chú việc đã hạ trần. Workbook thực tế vẫn dư chỗ: template (26 KB) preview 201 trong
    24 ms, workbook 12 sheet (85 KB) 201 trong 26 ms, và mức tối đa 61 sheet được nêu (0,33 MB tải lên, 1,4 MB XML,
    53 400 lần mở) nằm trong mọi trần với biên 2-6x. (Ba năm sheet hai tuần một lần, 78 sheet, vượt trần 64 sheet có sẵn
    `maxSheets`, vòng sửa này không đổi — xem R-B4-3.)
  - **3 Tính đúng và hồi quy — vững.**
    - Giải mã diễn ra một lần và trần từ chối chứ không cắt: 75 PASS / 0 FAIL, gồm thực thể lồng nhau (`&amp;amp;`→`&amp;`,
      `&#38;#65;`→`&#65;`), CDATA giữ nguyên, tham chiếu bị chẻ bởi chú thích không bị nối, thuộc tính giữ lại giải mã
      một lần, và giá trị 255 ký tự giữ nguyên trong khi 256 thì từ chối cả gói (`attribute_too_large`). Các danh mục
      không nén được bị từ chối, không bị cắt.
    - R-B2-1 vững: hai ngày lễ cùng 300 ký tự đầu đều hiện cùng tên 200 ký tự, nhưng cờ floating lấy từ chính ngày lễ
      khớp (`matchedHoliday`), nên chỉ ngày floating là floating. R-B2-2 vững: chín khai báo khác UTF bị từ chối
      `unsupported_encoding` ở từng phần trong năm phần phân tích.
    - Phép so sánh với WP4-T09 (13a258d) giống sau khi bỏ `sourceCount` ở ô bộ đọc (giống từng byte) và preview; báo cáo
      lưu chỉ thêm khác ở `rules[3..7]` — quy tắc `not_due` và các quy tắc xung đột viết lại thêm sau T09 và đã được chấp
      nhận ở các gate trước, không phải thay đổi bộ đọc hay mapping. Toàn bộ 168 ngày, 12 cờ floating, 23 ngày lễ, 44 phát
      hiện và 49 quyết định đều giống.
    - `npm ci` và `npm run verify` đạt (1758 test, không dòng deprecation), và bốn bộ test vùng B đạt (131 test; tăng từ
      128 do WP4-FIXB4 thêm test ghim trần). Qua HTTP mọi tải lên là 201 hoặc 413, không bao giờ 5xx, và `/api/health`
      luôn phản hồi (xấu nhất 78 ms).
- Phát hiện: mức độ | tệp/hàm | cách tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa gọn:

  Không có. Không có lỗi quan sát được.

- Rủi ro và cải thiện tùy chọn, tách khỏi lỗi đã chứng minh:
  - R-B4-1 (mang theo R-B3-1): khai báo mã hóa `<?xml?>` không đứng đầu phần (có khoảng trắng dẫn) hoặc sai dạng (dấu `?`
    trong version, dấu nháy lệch) không được nhận nên phần đó bị đọc như UTF-8 (3 ca LENIENT trong `18-correct.txt`).
    Phần đó vốn không well-formed và đọc sai chỉ biến văn bản thành nhãn lạ (chỉ bỏ qua). Tùy chọn: từ chối khai báo
    `<?xml` ở bất kỳ vị trí nào ngoài đầu phần.
  - R-B4-2 (mang theo R-B3-3): vẫn chưa có hạn ngạch preview theo user (lựa chọn chủ I-5 còn mở), và mục tiêu NAS là
    NOT VERIFIED (không có quyền của chủ). Ngân sách chỉ đo trên máy trạm này; theo hệ số NAS 3-4x của chính chú thích,
    preview xấu nhất (khoảng 90 ms ở đây) tương đương 0,3-0,4 s trên NAS — một khoảng dừng, không phải treo, và trần tải
    lên nay chặn nó. Cảnh báo high chỉ ở dev `source-map-js` vẫn còn (không phát hành).
  - R-B4-3: workbook hơn 64 sheet (ví dụ ba năm sheet hai tuần một lần, 78) bị từ chối bởi trần `maxSheets` có sẵn, vòng
    sửa này không đổi. Workbook thật của chủ là từng kỳ một; không phải hồi quy. Tùy chọn nếu sau này muốn nhập đa năm một
    tệp.
  - R-B4-4: giá LP của cận chỉ phủ 61 họ đơn vị đã đo; một loại đơn vị ngoài danh sách về lý thuyết có thể tốn hơn mỗi
    byte hay mỗi lần mở so với giá. Nhưng sweep cấu trúc xấu nhất và mọi họ probe trước đó đều nằm dưới cận, và trần tải
    lên 2 MiB chặn trước với nội dung không nén được, nên tôi không tìm thấy đơn vị đắt chưa phủ; đây là giả định dư,
    không phải lỗi quan sát được.
- Gate bắt buộc chưa chạy/bị chặn và lý do: không gate bắt buộc nào của vùng B bị bỏ. Không chạy lại ở đây vì nằm ngoài
  brief và WP4-REGATE4 đã chạy trên digest này: bộ e2e và drill container. Mục tiêu NAS là NOT VERIFIED (không có quyền
  của chủ), cũng ảnh hưởng đến ngân sách.
- Xử lý các phát hiện trước:
  - WP4-RB3-01 (ngân sách không giữ cho nội dung không nén được): **đã sửa và xác nhận.** Ngân sách nay suy ra từ giới
    hạn và tái lập độc lập; hình đắt nhất của WP4-RECHECK-B3 (F2-rand100-d2-wide, trước 611 ms) bị từ chối
    `package_too_large` trong 0 ms, và cấu trúc được nhận xấu nhất là 89-90 ms và +71 MiB, sâu trong ngân sách. Chú thích
    mã và docs/07, docs/11 (EN/VI) nêu cận suy ra và trần 2 MiB.
  - WP4-RB2-01, R-B2-1, R-B2-2: vẫn **đã sửa và xác nhận**; các ca mã hóa lỏng vẫn là R-B4-1.
  - WP4-RB-01, R-RB1, WP4-B-02, R1, R3: vẫn vững, qua các bộ test, probe dựng lại và kiểm điểm HTTP.
- Mức sẵn sàng phần mềm, quyền của chủ và kết quả thử nghiệm tách riêng: mức sẵn sàng phần mềm của vùng B đạt tại digest
  này: WP4-RB3-01 đã đóng và mọi quy tắc toàn vẹn dữ liệu, riêng tư, giải mã, ngân sách và báo cáo của vùng đều vững qua
  probe và bộ test. Chưa xin và chưa có quyền thử nghiệm của chủ. Không triển khai, không dữ liệu thật, không mail thật;
  mục tiêu NAS là NOT VERIFIED.
- Một hành động/nhắc tiếp theo: coordinator ghi WP4-RECHECK-B4 PASS và tiến hành chấp nhận gói WP4 / hành động roadmap
  kế tiếp; không còn sửa vùng B nào tồn đọng. Mang theo R-B4-1..R-B4-4 như rủi ro.

Không có phát hiện bịa hay lần đạt chưa quan sát. Rà soát một phần không phải là chấp nhận trọn vẹn.

## Nguồn gốc subagent độc lập

- Tác vụ/lần rà, ID người rà và ID tác giả được rà: WP4-RECHECK-B4 lần 1 (ID agent bảng do coordinator ghi; người rà
  không quan sát được). Tác giả ảnh chụp được rà: WP4-FIXB4 (`claude-opus-5-5`), WP4-DEPCLEAN2 (chỉ package.json/lock),
  người commit WP4-FIXB4-FREEZE và người gate WP4-REGATE4 (`claude-sonnet-5-5`). Tác giả và người rà vùng B trước ghi ở
  WP4_REVIEW_B, WP4_RECHECK_B, WP4_RECHECK_B2 và WP4_RECHECK_B3.
- Ngữ cảnh mới; xác nhận người rà không viết thay đổi: ngữ cảnh mới. Người rà không viết thay đổi, sửa, freeze hay gate
  WP4 nào, và không chạy WP4-AUDIT-B, WP4-RECHECK-B, WP4-RECHECK-B2 hay WP4-RECHECK-B3. Chỉ viết cặp báo cáo này, phần
  Kết quả của brief và `evidence/WP4-RECHECK-B4/`. Mọi workbook thù địch được dựng và giữ dưới thư mục tác vụ; không có
  workbook hay tệp nhị phân trong chứng cứ.
- Digest nguồn trước/sau; chứng cứ gate cho ảnh chụp đó:
  `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` trước và sau (`01-baseline.txt`,
  `99-digest-after.txt`). WP4-REGATE4 PASS trên cùng commit và digest được coi là một tuyên bố và chạy lại cho vùng này.
- Đường dẫn báo cáo mới giữ lịch sử rà trước: `handoff/delivery/WP4_RECHECK_B4.md` và `.vi.md` (mới). WP4_REVIEW_B,
  WP4_RECHECK_B, WP4_RECHECK_B2, WP4_RECHECK_B3 và mọi báo cáo trước không đổi.
- Xử lý phát hiện và tác vụ sửa/recheck tiếp của coordinator: không có phát hiện; WP4-RB3-01 đã đóng. Không cần sửa hay
  recheck vùng B thêm tại digest này. Tiến trình con máy chủ của probe HTTP đã dừng qua handle (SIGTERM); không dùng hay
  để lại container, lệnh docker hay tiến trình nền.
