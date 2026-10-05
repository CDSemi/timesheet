# Đánh giá độc lập

Bản gốc tiếng Anh: [WP3_RECHECK_BC2.md](WP3_RECHECK_BC2.md) (bản tiếng Anh là bản có giá trị). Brief và kết quả nhiệm vụ: [WP3-RECHECK-BC2](tasks/WP3-RECHECK-BC2.md). Lần recheck B/C trước (giữ nguyên): [WP3_RECHECK_BC](WP3_RECHECK_BC.md). Bằng chứng: `evidence/WP3-RECHECK-BC2/` (đã che, LF; địa chỉ `<email>`, tài khoản `<user>`; probe lưu dạng `*.mjs.txt`; ảnh chụp `*-synthetic.png`); bắt đầu từ [00-commands.txt](evidence/WP3-RECHECK-BC2/00-commands.txt).

- Gói/ngày/người đánh giá và model/effort quan sát được: WP3, kiểm tra lại mới (recheck) vòng sửa 2 (WP3-RBC-01, WP3-RBC-02, test của nhánh `sending` trong handler gửi, quyết định của chủ H-Q1 (a) và các tài liệu chuẩn), kèm kiểm tra hồi quy khu vực B và C; 2026-10-05 (UTC); nhiệm vụ WP3-RECHECK-BC2 lần 1 (loại `audit` trên board, profile timesheet-auditor, agent `a3acc7ac65de1693a` trên board). Model tự báo `claude-opus-5-5`; effort yêu cầu xhigh, không quan sát được. Model tác giả mạnh nhất của snapshot là opus (`claude-opus-5-5`, WP3 T01/T05/T08/T09/T13B); tác giả sửa vòng 2 WP3-FIX2 (`a6d6ed013885bf7f2`) chạy `claude-sonnet-5-5`. Người đánh giá không yếu hơn. WP3-RECHECK-A lần 2 chạy song song trong clone riêng; không dùng chung tệp, cổng hay tiến trình nào (server của tôi dùng cổng loopback do hệ điều hành cấp).
- Commit SHA được đánh giá và source digest chính xác; commit chưa push; độ đầy đủ của nguồn:
  - Commit được đánh giá `2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714` (`freeze_commit` của WP3-REGATE2, trên origin/main).
  - Source digest `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` (721 tệp, không tính handoff/), bằng digest của regate, trước và sau, trong thư mục dự án và trong clone scratch (dạng `git ls-tree` và `npm run digest`).
  - Nguồn đầy đủ: mọi lệnh chạy trong các git clone dưới `D:\.claude-tmp\timesheet\WP3-RECHECK-BC2` (ngoài Dropbox): `fix2` ở bản đóng băng, `pre2` ở bản đóng băng trước vòng 2 `2f2520e`, và `mut`, một clone thứ hai của bản đóng băng chỉ dùng để chạy đột biến (mỗi đột biến được khôi phục bằng `git checkout`, sau đó status trống).
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED** (một phát hiện mức Low, WP3-RBC2-01).
  - Đã sửa: WP3-RBC-01 và WP3-RBC-02. Test trực tiếp của nhánh `sending` có ý nghĩa (ba đột biến của nhánh, mỗi cái đều làm test này lỗi).
  - H-Q1 (a) được cài đúng như quyết định và chạy đúng trong mọi kịch bản tôi đã chạy. docs/05 và docs/10 nêu quy tắc này bằng EN và VI, khớp nhau; D-09 không đổi.
  - Mới: WP3-RBC2-01 (Low). Hai test hạn chót vẫn dùng một tài khoản chưa từng lưu setting, nên với H-Q1 chúng không còn kiểm tra guard mà chúng được viết ra để kiểm: guard kích hoạt F-4 của lần quét hạn chót, và việc loại trừ kỳ được nhập. Một đột biến bỏ một trong hai guard đó vẫn qua toàn bộ bộ test ở bản đóng băng; ở `2f2520e` cùng đột biến đó thì lỗi. Brief yêu cầu các thay đổi test vì H-Q1 không được làm yếu độ phủ. Hành vi production hiện đúng (probe H2).
  - Không có hồi quy ở khu vực B hay C.
- Phạm vi thực sự đã kiểm tra/thực thi:
  1. Diff `2f2520e..2d72d35`: 7 tệp nguồn, 7 tệp test, docs/05 và docs/10 (EN và VI), đúng các đường dẫn của WP3-FIX2. Đã đọc: AGENTS.md, brief, WP3_RECHECK_BC (các phát hiện, mục 5 và 6, rủi ro), WP3-FIX2 cùng các quyết định ràng buộc và kết quả, mục `owner_decisions` H-Q1 (2026-10-05) trên board, docs/05 "Deadline and recovery", docs/10 (D-09 và mục mới 2026-10-05), prompt WP3_REVIEW, kết quả WP3-REGATE2 và phần vòng sửa 2 trong WP3_HANDOFF.
  2. Mỗi mục của vòng 2 trên cả hai commit: các tệp test vòng 2 của bản đóng băng chạy trên mã nguồn `2f2520e`, probe của riêng tôi trên tệp SQLite thật chạy trên cả hai commit, và các đột biến của mã mới ở bản đóng băng.
  3. H-Q1 (a): một probe qua HTTP API và runner production qua tám hạn chót, lưu setting giữa kỳ, lựa chọn rõ cho kỳ quá hạn cùng giới hạn lúc tạo tài khoản, tắt tự nộp, múi giờ thiết bị, trạng thái vận hành của admin và các màn hình; mọi thay đổi test, seed và e2e vì H-Q1, kiểm bằng đột biến.
  4. Hồi quy khu vực B: job và lần gửi không chắc chắn (một runner thật bị giết, một runner chạy đồng thời), giới hạn kích hoạt, F-1 cho tài khoản đã cấu hình, ma trận ghi chú × ảnh, an toàn GET của mọi route GET, token CSS, ảnh chụp Edge trên desktop và mobile.
  5. Hồi quy khu vực C: danh mục route, 11 bộ mục × 17 route chia sẻ, kiểm tra trực tiếp, IDOR, chia sẻ lại, ranh giới admin, tranh chấp thu hồi (tất định và 20 vòng đa tiến trình), ghi nhận người thực hiện, và gợi ý (chỉ chủ sở hữu thấy, nằm ngoài hash).
  6. Mã mới: API lỗi thời, giá trị CSS viết cứng, kế hoạch truy vấn và chi phí của lần đọc gợi ý nay không còn giới hạn thời gian.

## Bảng bằng chứng

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `node --version`; `git rev-parse HEAD`; digest ls-tree (dự án, rồi clone); `npm run digest` | v24.21.0; 2d72d35; 0d513fca…7ea92 (721 tệp), giống nhau trong clone và với script | `00-commands.txt`, `19-identity-after.txt` |
| `npm ci` (fix2; pre2; mut) | exit 0; exit 0; exit 0 | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 tệp / 1416 test; SMOKE PASSED, 40 dòng `PASS`; 0 dòng deprecation | `02-verify.txt` |
| 6 tệp test vòng 2 đã đổi của bản đóng băng, chạy trên mã nguồn `2f2520e` | exit 1; 10 lỗi / 133 đạt: mọi test có tên của RBC-01, RBC-02 và H-Q1 cùng test câu chữ đều lỗi trước khi sửa; test nhánh `sending` đạt ở đó (nhánh đã có sẵn) | `03-red-prefix.txt` |
| Đột biến nhánh `sending`, quy tắc H-Q1 và giới hạn lúc tạo tài khoản (mut) | bỏ nhánh, bỏ `markUncertain`, cho lỗi được thử lại: mỗi cái exit 1, chỉ test nhánh mới lỗi; H-Q1 mặc định bật: 5 lỗi; mặc định tắt: 4 lỗi; bỏ giới hạn tạo tài khoản: 3 lỗi | `04-mutations.txt` |
| `npm run test:e2e` (Edge, desktop và mobile) | exit 0; 127 đạt, 5 bỏ qua, 0 lỗi (5,4 phút); 0 dòng deprecation | `05-e2e.txt` |
| Probe H1, H-Q1 (a), giới hạn tạo tài khoản, tắt tự nộp (fix2; pre2) | exit 0, 50 PASS; exit 1, 25 PASS / 25 FAIL (việc tự động hóa tài khoản chưa cấu hình trước H-Q1) | `06-h1-setup-bound.txt` |
| Probe B3, sự kiện hệ thống trong History (fix2; pre2) | exit 0, 25 PASS; exit 1, 15 PASS / 10 FAIL (tái hiện WP3-RBC-01) | `07-b3-history-system.txt` |
| Probe C1, phân quyền, ghi nhận người thực hiện và gợi ý, thêm mục 12 (fix2; pre2) | exit 0, 91 PASS; exit 1, 89 PASS / 2 FAIL (tái hiện WP3-RBC-02) | `08-c1-authz-hint.txt` |
| Probe C2, tranh chấp thu hồi | exit 0, 23 PASS; 20/20 vòng đa tiến trình, 0 lần ghi sau khi thu hồi | `09-c2-race.txt` |
| Probe B2, phục hồi lần gửi và job | exit 0, 25 PASS | `10-b2-send-recovery.txt` |
| Probe B4, an toàn GET (mọi route GET × chủ, grantee, admin, ẩn danh) | exit 0; 204 request, 1 có ghi (lần tải PDF của grantee, có audit) | `11-b4-get-safety.txt` |
| Probe B5, token CSS | exit 0; 0 giá trị cứng ngoài `:root`, 0 style inline | `12-b5-css-tokens.txt` |
| Probe B6, ma trận ghi chú × ảnh | exit 0, 30 PASS | `13-b6-note-image-matrix.txt` |
| Probe B7, kế hoạch truy vấn và chi phí đọc gợi ý (fix2; pre2) | exit 0; với 50 000 dòng audit ngày cũ: Review trung vị 35,5 ms (fix2) so với 1,6 ms (pre2) | `14-b7-query-cost.txt` |
| Probe U2, UI Edge trên server đã build (desktop và mobile) | exit 0, 28 PASS; 0 tràn ngang, 0 control không tên; đã xem 8 ảnh chụp | `15-u2-ui.txt`, `recheck-bc2-*-synthetic.png` |
| Các tệp race và hồi quy × 5 vòng mới | exit 0 mỗi vòng; 10 tệp / 184 test mỗi vòng | `16-race-rounds.txt` |
| Đột biến độ phủ cho WP3-RBC2-01 (mut; pre2) và lượt quét guard | M4, M5, M5b: exit 0 ở bản đóng băng (mỗi cái 1416 đạt, các guard không được kiểm); exit 1 ở `2f2520e` (mỗi cái 1 test). Lượt quét guard: bỏ phép bỏ qua `inactive_user`, `before_activation` hoặc `not_due` vẫn đạt ở cả hai commit; bỏ `finalized` thì lỗi ở cả hai | `17-coverage-mutations.txt` |
| Probe H2, hai guard với tài khoản bật tự nộp (fix2; mut với từng đột biến) | fix2: exit 0, 10 PASS; mut + M4: exit 1, 4 FAIL; mut + M5: exit 1, 1 FAIL (probe bắt được cả hai đột biến mà bộ test bỏ sót) | `18-h2-guards.txt` |
| `validate_package.py --preflight` (Python của workflow, thư mục dự án) | exit 0; PASS, 67 cặp bản dịch, 1358 link nội bộ, 91 kịch bản (lần chạy đầu dừng ở link `00-commands.txt` của tôi khi tệp chưa được ghi) | `20-preflight.txt` |
| Danh tính sau; kiểm tra quyền riêng tư trên index tạm | xem các tệp | `19-identity-after.txt`, `21-privacy.txt` |

## Xử lý các phát hiện

| Mục | Xử lý | Bằng chứng |
|---|---|---|
| WP3-RBC-01 (Low) | **Đã sửa.** `history.ts` gửi `actor_is_system` đúng khi actor đã lưu là NULL; client chỉ đọc cờ đó. Sau một lần nộp tự động có phiên OT ngày thứ Bảy, `ot_ledger.credit` và `timesheet.auto_finalize` hiện "automatic" (`data-history-actor="system"`), `deadline.overdue` cũng vậy. Với cả 17 sự kiện của hai chủ sở hữu, cờ bằng đúng "actor đã lưu là NULL". Việc admin đổi tên vẫn là "by someone else"; sửa của grantee vẫn là "Changed by Synthetic Grantee (shared access)"; sự kiện của chính chủ không có nhãn; không có id của người khác nào rời server. Ở `2f2520e` cờ này không có và khoản ghi có hiện "by someone else". Edge, desktop và mobile: "OT credit posted [automatic]". | `07`, `15`, `03`, `recheck-bc2-history-ot-credit-*-synthetic.png` |
| WP3-RBC-02 (Low) | **Đã sửa.** Khi chủ chưa chốt, gợi ý đếm mọi thay đổi của grantee với các ngày của kỳ, bất kể thời điểm: nghỉ phép lên kế hoạch nhập trước khi kỳ bắt đầu được liệt kê (2 ngày, khớp oracle của tôi trên các dòng audit), kể cả sau lần nộp tự động. Một thay đổi trước kỳ mà chủ sau đó đã sửa lại thì không được liệt kê. Sau khi share bị thu hồi, thay đổi vẫn được liệt kê. Lần ký của chủ kết thúc cửa sổ; một thay đổi sau đó của grantee được liệt kê riêng. Việc đọc review không ghi gì. Ở `2f2520e` thay đổi trước kỳ bị thiếu. Edge, desktop và mobile: Review kỳ 2026-10-30 ghi "2 days last changed by Example Employee Two" cho hai thay đổi làm trước khi kỳ đó bắt đầu. | `08` mục 11-12, `15`, `recheck-bc2-review-pre-period-hint-*-synthetic.png` |
| Test nhánh `sending` (RECHECK-BC mục 5, R3) | **Có ý nghĩa.** Test lấy lại một job có lần gửi vẫn ở `sending` dưới một lease còn hiệu lực, nên chỉ nhánh riêng của handler mới xử lý được. Bỏ nhánh, bỏ `markUncertain` hoặc cho lỗi được thử lại đều làm đúng test này lỗi. Test đạt ở `2f2520e` vì nhánh đã có ở đó; chỗ thiếu là test, không phải mã. | `04`, `03` |
| H-Q1 (a) | **Đã cài và đúng; một lỗi về độ phủ test (WP3-RBC2-01).** Xem mục tiếp theo. | `06`, `17`, `18` |
| docs/05, docs/10 | **Xong, khớp nhau.** docs/05 "Deadline and recovery" thêm cả hai giới hạn theo tài khoản: giới hạn lúc tạo tài khoản kèm nguồn (quyết định của coordinator ngày 2026-10-05, WP3-B-01) và quy tắc setting đã lưu (H-Q1 (a)); docs/10 thêm "Owner decisions — 2026-10-05 (WP3-FIX2, question H-Q1)". EN và VI nói cùng nội dung, từng câu một. Dòng D-09 không có dòng diff nào. | diff, `20` |

## Kiểm tra H-Q1 (a)

- Tài khoản chưa từng cấu hình không bao giờ bị tự chốt và không có lần gửi nào. Ba tài khoản chưa cấu hình (một tài khoản có policy auto_deduct, một phiên OT thứ Bảy và một ngày làm thiếu; admin được seed; nhân viên được seed) đi qua tám hạn chót (2026-10-14 đến 2027-01-20) với runner production. Mỗi tài khoản không có revision tự động, không có timesheet đã chốt, không có job PDF hay gửi, không có lần gửi, không có dòng sổ, không có audit `deadline.*` hay `timesheet.auto_finalize`, không có bản ghi quá hạn và không có thông báo quá hạn hay kết quả. History của nó không có sự kiện tự động nào. Bốn múi giờ thiết bị cho kết quả giống nhau. Ở `2f2520e` cả ba đều bị nộp tự động mỗi kỳ (mỗi tài khoản 8 revision) và lỗi `recipient_missing`.
- Lưu setting giữa kỳ. Một tài khoản lưu bật tự nộp lúc 2026-10-20 (trong 2026-10-12..10-25) không nhận gì cho kỳ hạn 2026-10-14, và kỳ hiện tại được nộp đúng hạn (2026-10-28) cùng mọi kỳ sau. Một lần lưu đầu thông thường ngày 2026-10-29 không chạm tới kỳ quá hạn nào; tự động hóa bắt đầu từ hạn chót kế tiếp. Lựa chọn rõ cho kỳ quá hạn nộp các kỳ quá hạn có hạn sau lúc kích hoạt (2026-10-16 và 10-30, không có 10-02). Với một tài khoản tạo ngày 2026-10-15, lựa chọn đó không bao giờ chạm tới kỳ hạn 2026-10-14 (giới hạn lúc tạo tài khoản).
- Tắt tự nộp vẫn như trước. Tắt trước hạn chót cho một bản ghi quá hạn và không có revision. Tắt giữa kỳ cho một bản ghi quá hạn ở hạn chót kế tiếp, một cảnh báo quá hạn do lượt quét nhắc quyết định, và kỳ đó vẫn ký tay được. Tài khoản chưa cấu hình vẫn ký tay được (đường nộp tay không đổi).
- Trạng thái vận hành của admin và các màn hình. Trạng thái chỉ liệt kê revision, nên tài khoản chưa cấu hình không có dòng nào và không có lỗi; "Automatic submission starts" chỉ hiện thời điểm kích hoạt của hệ thống; không job nào của revision tự động cần can thiệp. Settings của tài khoản chưa lưu ghi "Not saved yet. Nothing is submitted for you until you save these settings with automatic submission on. It then applies to periods that fall due after you save." Tôi không thấy màn hình, câu nhắc hay câu trạng thái nào nói rằng tự động hóa áp dụng trước khi setup.
- Thay đổi test, seed và e2e. Không seed nào đổi. `automation.spec.ts` (can thiệp 2 → 0, danh sách revision của admin trống, nhãn History) phản ánh H-Q1 và chặt hơn. Helper `configuredUser` giữ cho 15 chỗ gọi đã đổi vẫn có ý nghĩa. Test B-01 nay đi qua lựa chọn rõ cho kỳ quá hạn, nên cũng kiểm luôn giới hạn (đột biến bỏ giới hạn tạo tài khoản làm 3 test lỗi). Test câu chữ của `settingsModel` chặt hơn. Nhưng hai test dựa vào việc tự động hóa một tài khoản chưa cấu hình đã không được đổi: xem WP3-RBC2-01.

## Phát hiện

| ID | Mức | Tệp/hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc/AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP3-RBC2-01 | Low | `tests/integration/deadline.test.ts:271` ("finalizes nothing while the activation instant is null") và `:786` ("never auto-submits an imported_unverified timesheet and records no overdue state for it"); guard ở `src/server/services/automation.ts:191`, `:343-344` và `:204` | Trong clone `mut`: (M4) cho `runDeadlineScan` và `assessPeriod` bỏ qua thời điểm kích hoạt NULL; (M5) dời phép bỏ qua `imported` ra sau quyết định bật tự nộp; (M5b) xóa phép bỏ qua `imported`. Chạy `vitest run tests/integration tests/client tests/domain`. | Kỳ vọng (brief WP3-FIX2: cập nhật mọi test dựa vào việc tự động hóa tài khoản chưa cấu hình; phạm vi 2 của WP3-RECHECK-BC2: thay đổi test vì H-Q1 không được làm yếu độ phủ): mỗi đột biến làm một test lỗi, như ở `2f2520e` (M4 làm test 271 lỗi; M5 và M5b làm test 786 lỗi). Thực tế ở bản đóng băng: 62 tệp / 1416 test đều đạt dưới mỗi đột biến. Cả hai test tạo user bằng `newUser()` và không lưu setting nào trước lần quét, nên H-Q1 đã chặn mọi lần ghi và guard không bao giờ cần đến. Nửa phần tắt của test 786 lưu công tắc tắt lúc 2026-09-30T01:00Z, sau hạn chót mà nó kiểm (2026-09-30T00:00Z), nên không công tắc nào chi phối kỳ đó và nửa này không chứng minh gì ở cả hai commit. Vì vậy việc loại trừ kỳ được nhập không có test nào ở bản đóng băng, và không có mã nào khác chặn việc tự chốt một kỳ được nhập. Guard F-4 ở mức lần quét là guard duy nhất khi kích hoạt bị xóa sau khi một job quét đã vào hàng đợi (probe H2 a). Hành vi production hiện đúng (H2: 10 PASS). | AC-07, F-4 (docs/05 "Deadline and recovery": không chốt gì trước khi kích hoạt; loại lịch sử nhập) | Dùng `configuredUser()` trong test 271 (hoặc lưu bật tự nộp trước lần quét). Trong test 786, lưu bật tự nộp trước lần quét đầu, và lưu công tắc tắt trước hạn chót mà nửa phần tắt kiểm. Tùy chọn thêm trường hợp "kích hoạt bị xóa sau khi một job quét đã vào hàng đợi". Kiểm rằng M4, M5 và M5b lại làm bộ test lỗi. |

Lượt quét guard không thấy guard nào khác bị làm yếu: bỏ phép bỏ qua `inactive_user`, `before_activation` hoặc `not_due` vẫn qua bộ test ở cả hai commit (mỗi guard nằm sau danh sách ứng viên, vốn đã lọc các trường hợp đó), còn bỏ phép bỏ qua `finalized` thì lỗi ở cả hai. Chỉ guard kích hoạt và guard kỳ được nhập chuyển từ có test ở `2f2520e` sang không có test ở bản đóng băng. Probe H2 cho thấy một test dùng tài khoản bật tự nộp bắt được cả hai đột biến. Không thấy lỗi nào khác.

## Hồi quy

- Khu vực B: không có.
  - Thử lại sau 60/300/900/3600 giây, rồi lần thứ năm. Một runner bị giết sau khi đã commit `sending` ở lần cuối để lại lần gửi ở `uncertain` kèm lời nhắc quyết định; một quyết định gửi đúng một lần; không có gì bị gửi lại. Lần gửi đang chạy của một runner sống không bị lượt chạy của runner khác đụng tới.
  - Kích hoạt trong quá khứ bị từ chối. Không có gì được tự động hóa trong 30 giây cuối trước hạn chót. Một revision cho mỗi kỳ.
  - F-1 cho tài khoản đã cấu hình: kỳ trống 2026-11-13 của một tài khoản đã setup trước được nộp với 14 ngày nhãn mặc định (Worked/Off), không OT, không thiếu giờ, không dòng sổ, chờ xác nhận, không reviewed hash, không actor.
  - Ma trận ghi chú × ảnh: ảnh 0/0/1/1, ghi chú chỉ khi bật, `{SignOffStatus}` là "Submitted" hoặc nội dung ghi chú, không có dấu hiệu tự động nào khác.
  - An toàn GET: 204 request, chỉ lần tải PDF của grantee (có audit) là có ghi (review của chủ với gợi ý không trống nằm trong số đó).
  - Token UI: vòng 2 không đổi CSS; 0 giá trị cứng ngoài `:root`, 0 style inline; 0 tràn ngang và 0 control không tên trên 8 ảnh chụp.
  - e2e: 127 đạt, 5 bỏ qua.
- Khu vực C: không có.
  - 88 mục (method, path) như trước; đúng 17 route chia sẻ, mỗi route có guard và handler; route review không nằm trong số đó.
  - 11 bộ mục × 17 route như kỳ vọng; người lạ và admin 404, ẩn danh 401, `no-store`.
  - Thu hồi, rời đi, admin thu hồi, đổi phạm vi và vô hiệu hóa tài khoản áp dụng ngay ở request kế tiếp; IDOR 404; không chia sẻ lại; admin không tạo được share; danh sách của admin chỉ có các trường cho phép.
  - Ghi nhận người thực hiện: mọi dòng được ghi tên đều là lần ghi của grantee qua `/api/shared`; thu hồi qua route admin, thu hồi cùng giây và việc grantee rời đi vẫn không ghi tên.
  - Gợi ý: chỉ chủ sở hữu thấy (không có dưới `/api/shared`, với chủ B, trong mọi GET của admin), nằm ngoài hash (`payload_hash` giống nhau khi ẩn gợi ý; lần ký lưu reviewed = payload = hash đã hiện; snapshot không có tên grantee).
  - Tranh chấp thu hồi: 20 đan xen tất định đều từ chối lần ghi; 20/20 vòng đa tiến trình với 0 lần ghi sau khi thu hồi.

## Mã mới

- API lỗi thời: không có. `npm run lint` (typescript-eslint `no-deprecated`) đạt trong verify; 0 dòng deprecation trong verify, e2e và output server của probe UI.
- Giá trị CSS viết cứng: vòng 2 không đổi CSS; `HistoryScreen.tsx` chỉ đổi một data attribute.
- Truy vấn: `governingSwitch` và `hasSavedSettings` dùng index của `submission_settings`. Lần đọc gợi ý nay không có giới hạn thời gian khi chủ chưa chốt kỳ: nó đi qua mọi dòng audit ngày và phiên của chủ (index `audit_events_owner`, rồi sắp xếp tạm). Với 50 000 dòng cũ, một lần đọc Review mất trung vị 35,5 ms thay vì 1,6 ms. Chi phí này bị giới hạn bởi kích thước dữ liệu, không theo request, và nhỏ ở quy mô này (rủi ro R1).

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- R1: chi phí đọc gợi ý khi chủ chưa chốt tăng theo toàn bộ lịch sử audit ngày/phiên của chủ (35,5 ms ở 50 000 dòng). Tùy chọn: lọc theo ngày làm việc của kỳ ngay trong SQL hoặc đánh index cho ngày làm việc.
- R2: tài khoản chưa cấu hình nhận nhắc trước hạn chót nhưng không có bản ghi hay cảnh báo quá hạn sau hạn chót (docs/05 nói rõ như vậy). Nhân viên chưa từng mở Settings không được báo rằng không có gì được nộp. Nên nêu trong gói pilot; trạng thái admin cũng không hiện "chưa setup".
- R3: lượt quét hạn chót đánh giá lại mọi kỳ kể từ lúc kích hoạt của mọi tài khoản chưa cấu hình ở mỗi lượt (chúng không bao giờ tới trạng thái cuối). Chi phí là O(tài khoản × kỳ) mỗi phút với vài truy vấn có index cho mỗi mục; ổn ở quy mô này.
- R4: docs/05, gạch đầu dòng lúc tạo tài khoản: "The period in which the account was created is still submitted at its deadline" chỉ đúng khi setting đã được lưu; câu dẫn ("both only narrow what is submitted") bao quát điều đó. Câu chữ tùy chọn: "is still eligible at its deadline".
- R5: `history.test.ts` "WP3-RBC-01 … (the automatic OT credit and debit)" không tạo khoản trừ nào. Cờ được kiểm cho mọi sự kiện nên độ phủ vẫn giữ; tên test nói quá.
- R6: tài khoản do seed tạo (actor NULL, chỉ seed của CLI) hiện "Account created [automatic]". Điều này theo đúng quy tắc ràng buộc; tài khoản production được tạo qua route admin.
- Mang theo: R1 của WP3_RECHECK_BC (dấu "qua share" trước WP4) nay là mục mang theo số 15 trong HANDOFF.

## Gate chưa chạy/bị chặn và lý do

- SMTP thật, triển khai NAS và kích hoạt production: bị cấm trước khi chủ cho phép pilot.
- Không có dòng recheck bắt buộc nào bị bỏ chưa chạy.

## Xử lý các phát hiện trước

WP3-RBC-01 và WP3-RBC-02 đã sửa. Test trực tiếp của nhánh `sending` bị thiếu (RECHECK-BC mục 5, R3) đã được khôi phục và có ý nghĩa. R4 của RECHECK-BC (tài khoản chưa cấu hình bị nộp và lỗi) được đóng nhờ H-Q1; R5 (giới hạn tạo tài khoản trong docs/05) được đóng. WP3-RBC2-01 là mới. Kết quả PASS của WP3-REGATE2, báo cáo WP3-FIX2 và các dòng HANDOFF được xem là lời khẳng định và được chạy lại: verify (62 tệp / 1416 test, 40 dòng smoke `PASS`) và e2e (127 đạt, 5 bỏ qua) đều tái hiện được. Lời khẳng định trong HANDOFF "14 tests relied on automating an account that never saved its settings" là chưa đủ: còn hai test nữa cũng vậy (WP3-RBC2-01).

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

- Sẵn sàng phần mềm (khu vực B và C): chưa nghiệm thu cho tới khi WP3-RBC2-01 được sửa và kiểm tra lại. Không thấy lỗi production nào; bản sửa chỉ ở test.
- Phép của chủ cho gửi thật hoặc kích hoạt: chưa xin, chưa có. Kết quả pilot: không có.

## Một bước tiếp theo

Coordinator giao một bản sửa chỉ ở test, có phạm vi, cho WP3-RBC2-01 theo [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), dùng đột biến M4 và M5 làm kiểm tra đỏ. Sau đó là đóng băng, gate và một recheck B/C mới ở digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP3-RECHECK-BC2 lần 1, agent `a3acc7ac65de1693a` trên board. Tác giả sửa được kiểm: WP3-FIX2 `a6d6ed013885bf7f2` (sonnet, lần 1-2); committer WP3-FIX2-FREEZE `af78db5acb44add73`; verifier WP3-REGATE2 `abb46237e2b7c9c61`; cùng các tác giả WP3 trên board.
- Context mới; xác nhận reviewer không viết thay đổi: context mới. Người đánh giá này không viết gì trong WP3, kể cả hai vòng sửa. Chỉ ghi cặp báo cáo này, mục Results của brief và `evidence/WP3-RECHECK-BC2/`. Các sửa chỉ trong scratch: các tệp test vòng 2 của bản đóng băng được chép vào clone `pre2` cho lần chạy đỏ (đã khôi phục sau đó) và các đột biến trong `mut` và `pre2` (mỗi cái đã khôi phục).
- Digest trước/sau; bằng chứng gate snapshot đó: `0d513fca…7ea92` trước và sau; bằng chứng WP3-REGATE2 là cho cùng commit và digest.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP3_RECHECK_BC2.md` và `.vi.md` (mới); WP3_RECHECK_BC và WP3_REVIEW_B/C không bị đụng tới.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: như trên; một bản sửa chỉ ở test cho WP3-RBC2-01, rồi một recheck B/C mới.
