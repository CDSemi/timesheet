# Kiểm tra lại độc lập WP1 — bản sửa F-01 và cổng WP1

Lập theo mẫu [REVIEW](../templates/REVIEW.vi.md). Bản gốc tiếng Anh (có thẩm quyền): [WP1_RECHECK.md](WP1_RECHECK.md). Prompt: [WP1_REVIEW](../prompts/WP1_REVIEW.vi.md). Bản review gốc có F-01: [WP1_REVIEW](WP1_REVIEW.vi.md), được giữ nguyên.

- **Gói/ngày/người review và model/effort quan sát được:** chỉ WP1, nhiệm vụ kiểm tra lại WP1-F01-AUDIT, lần 1; 2026-10-02 theo America/Los_Angeles (dấu thời gian bằng chứng là 2026-10-03 UTC). Subagent kiểm toán độc lập, ngữ cảnh mới, dưới quyền coordinator. Model tự báo cáo `claude-opus-5-5`. Effort yêu cầu là xhigh; effort và tốc độ thực tế không quan sát được từ bên trong phiên. Không thay đổi thiết lập client, thanh toán hay gói đăng ký nào.
- **Commit SHA và source digest được review; commit chưa push; độ đầy đủ của mã nguồn:** `68bbb31435543329b6c51f29703d9e2e7a4290bf` (WP1-F01-FREEZE), trùng `origin/main`, nên không có commit chưa push. `npm run digest` cho `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59` trên 533 tệp, không tính `handoff/`. Phép kiểm git ls-tree và một bản export sạch bằng `git archive` cho cùng giá trị, khớp digest của WP1-F01-GATE. Trước và sau kiểm toán, cây làm việc chỉ có thay đổi trong `handoff/`. Mã nguồn đầy đủ: ứng dụng, migration, test, lockfile, fixture tham chiếu và đặc tả tiếng Anh.
- **Quyết định: PASS.** F-01 đã được giải quyết trên snapshot này. Cổng bắt buộc của WP1 đạt trong bản export sạch, và không phát hiện vi phạm hợp đồng mới. Ghi chú rủi ro còn lại của worker không vi phạm hợp đồng (nhận định và trích dẫn quy tắc ở dưới). Ba hành vi liên quan được ghi là rủi ro cho WP2, không phải lỗi. PASS này chấp nhận WP1 tại commit và digest này.

## Phạm vi thực sự đã kiểm tra/chạy

Đã đọc từ đĩa: AGENTS.md, brief nhiệm vụ, prompt WP1_REVIEW, bản review WP1 gốc (F-01), các tài liệu tiếng Anh [01](../../docs/01_PRODUCT_REQUIREMENTS.md), [02](../../docs/02_TIME_AND_OT_RULES.md), [03](../../docs/03_ARCHITECTURE_AND_DATA.md), [04](../../docs/04_UX_AND_SETTINGS.md), [06](../../docs/06_TEST_AND_ACCEPTANCE.md), [09](../../docs/09_IMPLEMENTATION_ROADMAP.md), và tài liệu 08 cho quy tắc kiểm toán. Báo cáo sửa lỗi và phần sửa lỗi trong WP1_HANDOFF được coi là lời khẳng định, không phải bằng chứng.

Mã đã lần theo: [timesheetCommands.ts](../../src/server/services/timesheetCommands.ts) (mọi đường ghi phiên làm việc và giờ nghỉ), `timesheets.ts` (đọc, `toSessionInterval`, view ngày/bảng chấm công), `domain/workday.ts` và `intervals.ts`, `http/errors.ts`, `http/schemas.ts`, các trigger phiên/giờ nghỉ trong migration 0001, lời gọi Clock out của client WP1, và tệp test hồi quy mới. Diff `bfdc1a8..68bbb31` ngoài `handoff/` chỉ thay đổi `clockOut` (+10/−1) và thêm `tests/integration/clock-out-breaks.test.ts`. Kể từ baseline review WP1 gốc `70e2257`, `src/`, `tests/`, `reference/`, các tài liệu quy tắc 01/02/03, lockfile và cấu hình build/test chỉ thay đổi bởi bản sửa này. Các thay đổi khác là tài liệu quản trị, script `precommit-check` và mục của nó trong package.json.

## Bảng bằng chứng

Mọi lệnh đều chạy trong lần kiểm toán này với Node v24.21.0 bản portable và npm 11.18.0, Node 24 đứng đầu PATH. Verify và probe dùng `NODE_OPTIONS=--trace-deprecation --pending-deprecation`. Đường dẫn trong log đã được che.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`, `origin/main`, `git status`, `npm run digest`, băm ls-tree | 0; HEAD = origin/main = 68bbb31; chỉ có thay đổi trong `handoff/`; digest c6e24381… (533 tệp) hai lần | [before.txt](evidence/WP1-F01-AUDIT/before.txt) |
| `git archive 68bbb31` ra vùng tạm ngoài Dropbox; git index tạm; `node scripts/source-digest.mjs` | 0; 533 tệp nguồn; digest c6e24381… | [export.txt](evidence/WP1-F01-AUDIT/export.txt) |
| `npm ci` (export sạch) | 0; 141 gói, 0 lỗ hổng | [npm-ci.txt](evidence/WP1-F01-AUDIT/npm-ci.txt) |
| `npm run verify` (export sạch) | 0; typecheck strict, lint (`no-deprecated`), **11 tệp / 180 test**, build server và client, **smoke 13/13**; không có cảnh báo deprecation | [verify.txt](evidence/WP1-F01-AUDIT/verify.txt) |
| `npm test -- --reporter=verbose` | 0; 180/180: time 33, OT 34, deficit 17, engine 31, migrations 10, isolation 8, edit rules 9, API 14, auth 14, static 4, clock-out 6 | [test-verbose.txt](evidence/WP1-F01-AUDIT/test-verbose.txt) |
| Probe riêng, bản build freeze: `node probe.mjs <export> freeze` | 0; **68/68 kỳ vọng đạt**; ghi nhận 7 quan sát | [probe-freeze.txt](evidence/WP1-F01-AUDIT/probe-freeze.txt), [mã nguồn](evidence/WP1-F01-AUDIT/probe-f01-audit.mjs.txt) |
| Cùng probe, baseline trước sửa `bfdc1a8` (export, `npm ci`, `build:server`) | 0 (chế độ ghi nhận); **48 đạt / 20 trượt**: F-01A 422, F-01B R 541/credit 60, cùng các kiểm tra liên quan về sửa giờ nghỉ, phạm vi và UPDATE không đổi dòng nào đều trượt. Probe phân biệt được F-01 | [probe-baseline.txt](evidence/WP1-F01-AUDIT/probe-baseline.txt) |
| Tệp test hồi quy của freeze chạy trên mã baseline, rồi trên freeze | 1 rồi 0; baseline 5 trượt / 1 đạt, freeze 6/6 | [regression-red-green.txt](evidence/WP1-F01-AUDIT/regression-red-green.txt) |
| Xem xét `git diff`, grep các đường ghi và client | 0; phạm vi như nêu ở trên | [diff-review.txt](evidence/WP1-F01-AUDIT/diff-review.txt) |
| `validate_package.py --preflight` bằng Python 3.12 đi kèm; phần số học fixture chạy riêng | 1 do một liên kết thư mục bị hỏng có sẵn trong một hồ sơ quy trình (rủi ro 5); 33 + 32 + 16 + 10 = 91 kịch bản tham chiếu đạt | [validator.txt](evidence/WP1-F01-AUDIT/validator.txt) |
| HEAD, trạng thái và digest sau kiểm toán | xem phần nguồn gốc | [after.txt](evidence/WP1-F01-AUDIT/after.txt) |

### Tính lại độc lập (freeze, SQLite tổng hợp mới, migrate mới)

Probe tự tạo cơ sở dữ liệu, migration, seed tổng hợp, đồng hồ tất định và app chạy trong tiến trình từ `dist/` đã build. Probe không dùng `tests/support`. Giá trị kỳ vọng lấy từ thời gian UTC trôi qua và một oracle bội số gần nhất độc lập, giữ bội số thấp hơn khi hòa.

| Kịch bản | Kỳ vọng = quan sát |
|---|---|
| **F-01A**: phiên 09:00 LA đang mở có giờ nghỉ đã lưu 11:00–11:15; Clock out 18:16 LA xác nhận đúng giờ nghỉ đó | 200; đã đóng, version 2, một giờ nghỉ lưu 18:00Z–18:15Z; gộp 33.360 s, loại trừ 900 s, **R 541, E 61, T 61, credit 60**; GET ngày khớp; một sự kiện audit `work_session.clock_out` (actor = owner = nhân viên, reason null) với before {mở, chưa xác nhận, v1, 1 giờ nghỉ} và after {đóng, đã xác nhận, v2, 1 giờ nghỉ}; version bảng chấm công +1 |
| **F-01B**: cùng trạng thái, xác nhận `breaks: []` | 200; không còn giờ nghỉ lưu; loại trừ 0; **R 556, E 76, T 76, credit 90**; GET ngày và bảng chấm công khớp; audit `after.breaks = []` |
| Sửa giờ nghỉ thực tế khi Clock out (xác nhận 11:00–11:20) | một giờ nghỉ 18:00Z–18:20Z; R 536, T 56, credit 60 |
| Cùng người dùng, phiên đã đóng 07:00–08:00 (nghỉ 10 phút) cộng phiên đang mở | chỉ thay giờ nghỉ của phiên đang mở; giờ nghỉ buổi sáng được giữ; một B mỗi ngày: R 606, T 126, credit 120 |
| Hai người dùng, cả hai có phiên đang mở và giờ nghỉ đã lưu | Clock out của nhân viên không đổi phiên, ID dòng giờ nghỉ và audit của admin; GET chéo người dùng trả 404 cả hai chiều; Clock out của chính admin cho R 511, credit 30; Clock out lần hai của nhân viên trả 409 |
| Lỗi được tiêm sau DELETE (TEMP trigger trên lệnh chèn audit clock_out) | 500; phiên vẫn mở, v1; **giờ nghỉ đã xóa được khôi phục với đúng ID dòng gốc**; không có audit; version bảng chấm công không đổi; thử lại cho credit 90 |
| UPDATE không đổi dòng nào (TEMP trigger `RAISE(IGNORE)`) | **409 `stale_version`**; rollback toàn bộ như trên. Baseline trả 200 và ghi audit cùng các lần tăng version cho một cập nhật không xảy ra |
| Tập gửi lên không hợp lệ (giờ nghỉ sau thời điểm Clock out) | 422 `break_outside_session`; phiên vẫn mở; giờ nghỉ đã lưu được giữ |
| Clock out chưa xác nhận với `breaks: []` | 200; `incomplete_breaks`, mọi số phút là null; giờ nghỉ đã lưu được giữ |
| Engine: 240.300 tổ hợp oracle; ngày thường 30/31/45/46/75/76 → 0/30/30/60/60/90; ngày nghỉ 15/16/120 → 0/30/120; 09:00–18:00 với giờ nghỉ dịch R 480/credit 0; hai phiên 4h15m40s → R 511 (không phải 510)/credit 30; thứ Sáu ca ngày cộng ca qua đêm R 360, O 120, credit 120; ca đêm thứ Hai R 480; DST mùa xuân/thu 300/360; từ chối khoảng trống DST và giờ lặp; fold 0/1 → 08:30Z/09:30Z | tất cả khớp |

## Xem xét diff (tiêu chuẩn và đặc tả)

- **Giao dịch:** DELETE, UPDATE, chèn giờ nghỉ, mục ngày, tăng version bảng chấm công và audit đều chạy trong `writeTransaction` sẵn có (`better-sqlite3` `.immediate()`). Rollback sau DELETE được chứng minh bằng tiêm lỗi.
- **Quyền sở hữu:** DELETE giới hạn bởi `session_id = ? AND user_id = ?`, và phiên lấy từ `findOpenSession(ctx.user.id)` ([timesheetCommands.ts:442-444](../../src/server/services/timesheetCommands.ts)). Probe hai người dùng cho thấy không có ảnh hưởng chéo (AC-01).
- **Audit:** ảnh chụp before là phiên đang mở được nạp trước khi xóa, ảnh chụp after được nạp lại. Cả hai đã được kiểm chứng, cùng actor và owner (R-07).
- **Version:** UPDATE phiên giữ `WHERE version = ?` và nay kiểm tra `changes === 1` (dòng 458), nhất quán với `updateSession`. Nhánh này được probe thực thi.
- **Thứ tự:** giờ nghỉ gửi lên được kiểm tra hợp lệ trước (`resolveSession`). Các dòng đã lưu chỉ bị xóa khi `breaks_confirmed` là true, trước UPDATE thời điểm kết thúc, nên trigger giữ-bên-trong không thể chạy trên những dòng đang được thay.
- **Không đổi quy tắc nghiệp vụ hay engine:** `src/domain/`, tài liệu quy tắc và fixture không bị đụng tới. Chỉ lệnh lưu trữ thay đổi. Văn phong khớp `updateSession`, chú thích bằng tiếng Anh và trích R-01/R-02, lint và typecheck đạt.

## Nhận định về ghi chú rủi ro còn lại (Clock out chưa xác nhận với danh sách giờ nghỉ khác rỗng)

Quan sát (giống hệt trên baseline trước sửa, nên không do bản sửa gây ra): với `breaks_confirmed:false`, giờ nghỉ gửi lên được thêm vào các dòng đã lưu. Nếu một giờ nghỉ chồng lên dòng đã lưu, trigger `session_breaks_no_overlap` trả 422 `overlapping_breaks` với rollback toàn bộ và phiên vẫn mở; sau đó Clock out chưa xác nhận với `[]`, hoặc Clock out có xác nhận, sẽ thành công. Giờ nghỉ không chồng lấn được lưu cạnh giờ nghỉ cũ. Ngày đó vẫn ở trạng thái `incomplete_breaks` và mọi số phút tính toán là null.

**Nhận định: chấp nhận được, không vi phạm hợp đồng và không phải phát hiện mới.** Lý do:
- R-01: giờ nghỉ vẫn nằm trong phiên và không chồng lấn (trigger bảo đảm), và thông tin giờ nghỉ chưa biết vẫn là chưa đầy đủ, không cộng hay trừ gì (`workday.ts:91-93`).
- R-02 và tài liệu 04 (Chỉnh sửa): mọi hành động xác nhận khi Clock out (xác nhận giờ nghỉ gợi ý hoặc thực tế, hoặc không nghỉ) nay thay đúng toàn bộ tập đã lưu, như F-01A, F-01B và probe sửa giờ nghỉ cho thấy. Chưa biết vẫn khác với xác nhận bằng không, và OT vẫn chờ.
- Mọi đường đặt `breaks_confirmed = 1` đều ghi trọn tập gửi lên: `createSession` trên phiên mới, `updateSession` và `clockOut` có xác nhận bằng DELETE rồi INSERT. Vì vậy hợp tập chưa xác nhận không bao giờ đến được OT; probe tiếp theo xác nhận qua sửa phiên và nhận đúng tập đã xác nhận (R 526, credit 60).
- Không quy tắc chuẩn nào định nghĩa cách một danh sách chưa biết, chưa đầy đủ gộp với các dòng đã lưu. Giữ bằng chứng đã ghi khi còn chưa biết không đổi OT và không xóa gì. Client WP1 chỉ gửi `breaks: []` khi Clock out (`TimesheetScreen.tsx:93`).

## Phát hiện

**Không có.** Không quan sát thấy lỗi nào về tiêu chuẩn hay đặc tả. F-01 đã đóng (xem phần xử lý).

## Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh

1. **Danh sách giờ nghỉ chưa biết, chưa đầy đủ (rủi ro còn lại):** hành vi cộng thêm nêu trên chưa được ghi thành tài liệu và khác ngữ nghĩa thay thế của sửa phiên. Khi WP2 xây dựng chỉnh sửa giờ nghỉ và xác nhận lúc Clock out, cần định nghĩa hợp đồng (cộng thêm hay thay thế) và kiểm thử, kể cả trường hợp gửi lại giờ nghỉ đã lưu.
2. **Dòng giờ nghỉ sau "bây giờ" trên phiên đang mở:** kiểm tra thời gian tương lai chỉ bao gồm bắt đầu và kết thúc phiên ([timesheetCommands.ts:196-199](../../src/server/services/timesheetCommands.ts)), nên phiên đang mở chấp nhận giờ nghỉ muộn hơn hiện tại. Clock out chưa xác nhận trước giờ nghỉ đó trả 422 `break_outside_session` (trigger `work_sessions_breaks_stay_inside`, migration 0001 dòng 227–233). Clock out có xác nhận nay thành công. Hành vi này có từ trước bản sửa; nó không bao giờ trừ giờ nghỉ tương lai (R-02) và trong WP1 chỉ chạm tới được qua API. WP2: từ chối các dòng như vậy hoặc định nghĩa cách Clock out xử lý chúng.
3. **Clock out không có `expected_version`:** một tập đã xác nhận sẽ thay các dòng mà client khác lưu sau khi bên gọi nạp phiên; audit `before` vẫn giữ chúng. Trước bản sửa, cùng một view cũ đó lại trừ các giờ nghỉ không thấy. Nên cân nhắc `expected_version` cho Clock out có xác nhận khi WP2 thêm chỉnh sửa đa thiết bị (tài liệu 03 "kiểm tra version").
4. **Độ mạnh của test hồi quy (tùy chọn):** test rollback của worker thất bại ở bước kiểm tra hợp lệ trước khi DELETE chạy; các khẳng định rollback của nó cũng đạt trên mã trước sửa, vốn chỉ trượt ở bước cuối. Không test nào thực thi nhánh `changes !== 1`. Probe chứng minh cả hai hành vi. Tùy chọn: thêm test hồi quy tiêm lỗi và test UPDATE không đổi dòng nào.
5. **Hồ sơ ngoài mã nguồn WP1:** `validate_package.py --preflight` dừng ở một liên kết thư mục trong `handoff/delivery/WORKFLOW_HANDOFF.md` dòng 65 (`evidence/WF-AUDIT3/`), được commit trong bfdc1a8. Coordinator nên sửa hồ sơ này; nó nằm ngoài source digest.
6. Các rủi ro của review WP1 trước (ngữ nghĩa ranh giới lịch sử, ngoại lệ ngày trả lương và kỳ đã lưu, giới hạn một tiến trình, bất biến UPDATE tùy chọn ở DB) giữ nguyên; mã nguồn của chúng không đổi.

## Cổng bắt buộc chưa chạy/bị chặn và lý do

Không cổng bắt buộc nào của WP1 bị chặn: type check, build, test migration SQLite mới, mọi fixture time/OT, cô lập hai người dùng (kể cả Clock out) và các giá trị cổng tường minh đều đã chạy. Không chạy theo phạm vi gói: luồng trình duyệt (cổng WP2), sổ cái và đồng thời (WP2/WP3), chốt sổ/PDF/gửi (WP3), Docker/NAS/sao lưu/nhập (WP4), triển khai thật và thí điểm (WP5). Chưa kiểm chứng chạy trên Linux. Trình kiểm tra gói toàn kho dừng ở rủi ro 5; chỉ phần số học fixture của nó được chạy.

## Xử lý các phát hiện trước

- **F-01 (P2, R-01/R-02/R-04, FR-06, AC-02): ĐÃ GIẢI QUYẾT và kiểm chứng** trên 68bbb31 / c6e24381. F-01A trả 200 với một giờ nghỉ, R 541 và credit 60. F-01B trả 200 không có giờ nghỉ, R 556, E 76 và credit 90. Các điều kiện của bản sửa giới hạn (thay thế trong giao dịch giới hạn theo chủ sở hữu, audit before/after, rollback, test hồi quy) đều đạt. Việc chỉ thay thế khi đã xác nhận phù hợp với quy tắc, như phần nhận định ở trên giải thích.
- Rủi ro của review gốc: trạng thái không đổi (rủi ro 6).

## Mức sẵn sàng phần mềm, sự cho phép của chủ sở hữu và kết quả thí điểm

- **Sẵn sàng phần mềm:** WP1 được chấp nhận qua kiểm tra lại độc lập tại 68bbb31 / c6e24381. WP2 có thể bắt đầu sau commit chấp nhận của coordinator.
- **Sự cho phép của chủ sở hữu:** không yêu cầu, không sử dụng. Chỉ dùng dữ liệu tổng hợp cục bộ và request trong tiến trình: không gửi thư, không triển khai, không thông tin xác thực, không thanh toán, không commit.
- **Kết quả thí điểm:** không có; WP5 còn chờ.

## Một hành động/prompt tiếp theo

Coordinator: ghi WP1-F01-AUDIT PASS, chạy WP1-F01-ACCEPT (commit chấp nhận và push), cập nhật STATE, NEXT_ACTION và HANDOFF, rồi giao WP2 kèm rủi ro 1–3 trong brief.

Không bịa phát hiện, không ghi nhận kết quả đạt chưa quan sát.

## Nguồn gốc subagent độc lập

- **Nhiệm vụ/lần review, ID người review và ID tác giả được review:** WP1-F01-AUDIT lần 1. ID agent người review trên bảng: `aab85eb01ecc75c80` (do coordinator gán; không quan sát được từ bên trong phiên). Tác giả được review: WP1-F01-FIX `aaa3e81ab96efd11e` (`claude-sonnet-5-5`, tự báo cáo) và bản triển khai WP1 gốc (Claude Code, `claude-opus-5-5`, theo WP1_HANDOFF). Độ mạnh kiểm toán: `claude-opus-5-5` bằng model tác giả mạnh nhất.
- **Ngữ cảnh mới; xác nhận người review không là tác giả thay đổi:** ngữ cảnh mới, không fork từ người triển khai. Tôi không là tác giả thay đổi nào trong snapshot được review và không sửa mã nguồn; tôi chỉ ghi các tệp liệt kê dưới đây.
- **Source digest trước/sau; bằng chứng cổng cho snapshot đó:** trước `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59`, HEAD 68bbb31. Sau: cùng digest và HEAD ([after.txt](evidence/WP1-F01-AUDIT/after.txt)). Bằng chứng cổng: WP1-F01-GATE PASS ở cùng commit và digest, được chạy lại độc lập ở đây.
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP1_RECHECK.md` và `.vi.md`, bằng chứng trong `handoff/delivery/evidence/WP1-F01-AUDIT/`, kết quả nối vào [brief nhiệm vụ](tasks/WP1-F01-AUDIT.md). WP1_REVIEW và bằng chứng trước không đổi.
- **Xử lý phát hiện và nhiệm vụ sửa/kiểm tra lại tiếp theo của coordinator:** F-01 đã giải quyết; không có phát hiện mới; không có nhiệm vụ sửa. Tiếp theo: WP1-F01-ACCEPT.
