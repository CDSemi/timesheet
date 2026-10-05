# Đánh giá độc lập

Bản gốc tiếng Anh (có thẩm quyền): [WP3_RECHECK_BC3.md](WP3_RECHECK_BC3.md). Brief và kết quả của task: [WP3-RECHECK-BC3](tasks/WP3-RECHECK-BC3.md). Các lần kiểm tra lại B/C trước đó (giữ nguyên): [WP3_RECHECK_BC](WP3_RECHECK_BC.vi.md), [WP3_RECHECK_BC2](WP3_RECHECK_BC2.vi.md). Cùng lần audit này gắn lại khu vực A: [WP3_RECHECK_A3](WP3_RECHECK_A3.vi.md). Bằng chứng: `evidence/WP3-RECHECK-BC3/` (đã che, LF; địa chỉ thư là `<email>`, tài khoản là `<user>`, tên máy là `<host>`; mã probe và script lưu dạng `*.txt`); bắt đầu từ [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt).

- Gói/ngày/người đánh giá và model/effort quan sát được: WP3, kiểm tra lại mới hoàn toàn cho phát hiện WP3-RBC2-01 sau vòng sửa 3 chỉ sửa test (WP3-FIX3), kèm kiểm tra hồi quy nhanh cho khu vực B và C; 2026-10-05 (UTC); task WP3-RECHECK-BC3 lần 1 (loại `audit` trên bảng, profile timesheet-auditor, agent `a4e5c209ddf7091f5` trên bảng). Tự báo model `claude-opus-5-5`; effort yêu cầu xhigh, không quan sát được. Model tác giả mạnh nhất của snapshot được đánh giá là opus (`claude-opus-5-5`, các task WP3 trước đó). Tác giả vòng 3 WP3-FIX3 (`ab4bd2cde876c7ecb`), người commit WP3-FIX3-FREEZE (`aca480339f4624b19`) và cổng WP3-REGATE3 (`a41152818099fb8d5`) chạy sonnet (`claude-sonnet-5-5`). Người đánh giá không yếu hơn. Người đánh giá không phải bất kỳ auditor WP3 nào trước đó (`adc746b3b778914db`, `aca7e1ccf879138f1`, `a891cec229b6d5755`, `a4f9e4253ee83db68`, `a3acc7ac65de1693a`, `a6f4a505bd38d735e`, `a6dd03dfdd2f440e9`).
- SHA commit được đánh giá và digest nguồn; commit chưa đẩy; độ đầy đủ của nguồn:
  - Commit được đánh giá `49651c8bb91d56bf6c6966405257537ec7ca474b` (`freeze_commit` của WP3-REGATE3; `origin/main` trỏ cùng commit, nên không có gì chưa đẩy).
  - Digest nguồn `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` (721 tệp, trừ handoff/), bằng digest của regate. Ghi làm hai lệnh đầu tiên sau `node --version` trong thư mục dự án (`git rev-parse HEAD`; dạng `git ls-tree` trên bản freeze). Sau đó tính lại trong clone bằng `scripts/source-digest.mjs` và bằng `git ls-tree`. Cuối phiên vẫn cùng giá trị ([00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt), các dòng cuối). Digest của cây làm việc dự án khác chỉ vì 3 tệp chưa theo dõi trong `.claude/skills/readme-md/`, không thuộc bản freeze; tôi không động vào chúng.
  - Nguồn đầy đủ: mọi lệnh chạy trong các clone git dưới `D:\.claude-tmp\timesheet\WP3-RECHECK-BC3` (ngoài Dropbox): `repo` ở bản freeze, và `mut`, một clone thứ hai của bản freeze chỉ dùng cho đột biến (mỗi lần đều khôi phục bằng `git checkout`, sau đó status rỗng).
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.**
  - WP3-RBC2-01 đã được sửa. Các đột biến M4, M5 và M5b đều làm toàn bộ bộ test thất bại ở bản freeze. Với tệp test của 2d72d35 chúng vẫn qua, nên chính các test vòng 3 đã khôi phục độ phủ.
  - Quét guard: bỏ nhánh skip `inactive_user`, `before_activation` hoặc `not_due` nay đều làm một test mới thất bại; bỏ `finalized` vẫn làm hai test khôi phục thất bại.
  - Các test vòng 3 có ý nghĩa, ổn định (5 lần chạy lặp) và không làm yếu assertion nào trước đó.
  - Không hồi quy ở khu vực B hay C: verify, e2e, probe H1 và H2 đều qua.
  - Không có phát hiện. Bốn rủi ro được ghi riêng. R1 là khoảng trống test có từ trước, cùng loại với các khoảng trống của đợt quét (kiểm tra lại activation trong vòng lặp), và đã có cách test được chứng minh.
- Phạm vi thực sự đã kiểm tra/chạy:
  1. Đã đọc: AGENTS.md (từ đĩa), brief, WP3_RECHECK_BC2 cùng bằng chứng (script đột biến, probe H2), brief và kết quả WP3-FIX3, kết quả WP3-REGATE3, WP3_RECHECK_A và WP3_RECHECK_A2, prompt WP3_REVIEW, mục vòng sửa 3 của WP3_HANDOFF, bản ghi trên bảng của cả hai task.
  2. Phần thay đổi `2d72d35..49651c8` ngoài handoff/: một đường dẫn, `tests/integration/deadline.test.ts` (+65 −12). Không thay đổi gì trong `src/`, `docs/`, `scripts/` hay cấu hình.
  3. Đọc toàn bộ `src/server/services/automation.ts`, với các guard tại `:189` (`inactive_user`), `:191` (`not_active`), `:192` (`before_activation`), `:194` (`before_account`), `:195` (`not_due`), `:203` (`finalized`), `:204` (`imported`), `:208` (`overdue_recorded`), phép kẹp ứng viên `:257` và lệnh return ở mức quét `:343-344`.
  4. Đột biến M4, M5, M5b và đợt quét trên toàn bộ bộ test (`vitest run tests/integration tests/client tests/domain`) trong `mut`. Ba đột biến đó cũng chạy với tệp test cũ và mới. Thêm các biến thể tách nhỏ (M4a, M4b, M6a, M6b, `before_account`, `overdue_recorded`).
  5. Kiểm tra hồi quy nhanh cho B và C: verify, e2e trên Edge đã cài, probe H1 (setup bound) và H2 (guard), cùng probe H3 của tôi (activation bị xoá khi một lần quét đang chạy).

## Bảng bằng chứng

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `node --version` (bản portable, đường dẫn đầy đủ); `git rev-parse HEAD`; digest dạng ls-tree (dự án, rồi clone); `scripts/source-digest.mjs` (clone) | v24.21.0; 49651c8; c31c300c…ec72 (721 tệp) ở mọi dạng | [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |
| `git diff --stat/--name-status 2d72d35 49651c8` ngoài handoff/, và trên src, docs, scripts và cấu hình | một đường dẫn, M `tests/integration/deadline.test.ts` (+65 −12); diff thứ hai rỗng | [17-delta.txt](evidence/WP3-RECHECK-BC3/17-delta.txt), [17b-test-diff.txt](evidence/WP3-RECHECK-BC3/17b-test-diff.txt) |
| `npm ci` (repo; mut) | exit 0; exit 0 | [01-npm-ci.txt](evidence/WP3-RECHECK-BC3/01-npm-ci.txt) |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 tệp / 1420 test; SMOKE PASSED, 40 dòng `PASS`; 0 dòng deprecation | [02-verify.txt](evidence/WP3-RECHECK-BC3/02-verify.txt) |
| Bộ test sạch, rồi M4, M5, M5b (mut, toàn bộ bộ test) | sạch exit 0 (1420 qua); M4 exit 1 (1 thất bại); M5 exit 1 (1 thất bại); M5b exit 1 (2 thất bại) | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| Quét guard (mỗi lần xoá một dòng skip, toàn bộ bộ test) | `inactive_user`, `before_activation`, `not_due`: exit 1, mỗi cái 1 thất bại (các test quét mới); `finalized`: exit 1, 2 thất bại; `overdue_recorded`: exit 1, 3 thất bại; `before_account`: exit 0 | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| M4, M5, M5b với `deadline.test.ts` của 2d72d35 và của bản freeze | tệp cũ: exit 0, mỗi lần 40 qua; tệp freeze: exit 1, 1 / 1 / 2 thất bại | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| Bổ sung: M4a (chỉ return mức quét), M4b (chỉ `not_active` trong vòng lặp), M6a (chỉ phép kẹp ứng viên), M6b (cả hai guard theo ngày tạo tài khoản) | M4a exit 0; M4b exit 0; M6a exit 0; M6b exit 1 (3 thất bại) | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt), [04b-mutations2.txt](evidence/WP3-RECHECK-BC3/04b-mutations2.txt) |
| Probe H3 (một TEMP trigger xoá activation sau bản sửa đổi tự động đầu tiên của một lần quét đang chạy): repo; mut; mut + M4b | exit 0, 4 PASS; exit 0, 4 PASS; exit 1, 1 FAIL (kỳ sau bị chốt sau khi activation đã bị xoá) | [18b-h3-midscan.txt](evidence/WP3-RECHECK-BC3/18b-h3-midscan.txt), [04b-mutations2.txt](evidence/WP3-RECHECK-BC3/04b-mutations2.txt) |
| `vitest run tests/integration/deadline.test.ts --reporter=verbose` × 5 | exit 0 mỗi lần; mỗi lần 44 qua; sáu test vòng 3 lần nào cũng qua | [05b-deadline-repeat.txt](evidence/WP3-RECHECK-BC3/05b-deadline-repeat.txt) |
| `npm run test:e2e` (build, rồi Playwright trên Edge đã cài, desktop và mobile) | exit 0; 127 qua, 5 bỏ qua, 0 thất bại (5,9 phút); 0 dòng deprecation | [05-e2e.txt](evidence/WP3-RECHECK-BC3/05-e2e.txt) |
| Probe H1: setup bound (H-Q1 (a)), giới hạn theo ngày tạo tài khoản, tắt công tắc, múi giờ thiết bị, trạng thái quản trị | exit 0, 50 PASS | [06-h1-setup-bound.txt](evidence/WP3-RECHECK-BC3/06-h1-setup-bound.txt) |
| Probe H2: guard F-4 và guard kỳ nhập khẩu với tài khoản bật tự động, qua runner | exit 0, 10 PASS | [18-h2-guards.txt](evidence/WP3-RECHECK-BC3/18-h2-guards.txt) |
| `validate_package.py --preflight` (Python của workflow, thư mục dự án) | xem tệp | [20-preflight.txt](evidence/WP3-RECHECK-BC3/20-preflight.txt) |
| Kiểm tra quyền riêng tư trên index tạm; danh tính lúc kết thúc | xem các tệp | [21-privacy.txt](evidence/WP3-RECHECK-BC3/21-privacy.txt), [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |

## Xử lý phát hiện WP3-RBC2-01

**Đã sửa.** Mỗi đột biến từng qua toàn bộ bộ test ở 2d72d35 nay làm bộ test thất bại, và đúng ở test được viết cho guard đó.

| Đột biến | Ở bản freeze (toàn bộ bộ test) | Test thất bại | Với tệp test của 2d72d35 |
|---|---|---|---|
| M4: lần quét và `assessPeriod` coi activation NULL là 1970 (`:191`, `:343-344`) | exit 1, 1 thất bại | `deadline.test.ts:271` "finalizes nothing while the activation instant is null, even for an account whose auto-submit is on" | exit 0, 40 qua |
| M5: nhánh skip `imported` bị dời ra sau quyết định bật tự động (`:204`) | exit 1, 1 thất bại | `:796` "never auto-submits an imported_unverified timesheet of an account whose auto-submit is on, and records no overdue state" | exit 0, 40 qua |
| M5b: xoá nhánh skip `imported` | exit 1, 2 thất bại | `:796` và `:809` "does not mark an imported_unverified timesheet overdue when auto-submit was saved off before the deadline" | exit 0, 40 qua |

- Test 271 nay tạo tài khoản bằng `configuredUser()`, tức là lưu bật nộp tự động, và khẳng định có dòng settings. Vì vậy, theo H-Q1, chỉ guard activation mới giữ được tài khoản đó lại. Dưới M4, lần quét chốt cả hai kỳ đã đến hạn.
- Test 796 dùng tài khoản bật tự động; dưới M5 hoặc M5b, kỳ nhập khẩu bị chốt.
- Test 809 là nửa "tắt". Nộp tự động được lưu bật lúc tạo tài khoản, rồi tắt lúc 2026-09-21T12:00Z, trước hạn 2026-09-30T00:00Z. Test khẳng định không có bản sửa đổi, không có job và không có bản ghi quá hạn. Test này bắt được M5b (xuất hiện bản ghi quá hạn) và đúng là không bắt M5, vì M5 chỉ đổi thứ tự trong trường hợp bật.
- Hành vi production không đổi và đúng: probe H2 qua 10/10 qua runner production. Trong đó có một job quét được xếp hàng khi tự động hoá đang hoạt động và chạy sau khi activation đã bị xoá.

## Quét guard

| Nhánh skip trong `assessPeriod` | Ở 2d72d35 (WP3_RECHECK_BC2) | Ở bản freeze | Test phủ |
|---|---|---|---|
| `inactive_user` (`:189`) | chưa phủ | **đã phủ** (1 thất bại) | `:855`, TEMP trigger vô hiệu hoá tài khoản sau bản sửa đổi đầu tiên |
| `before_activation` (`:192`) | chưa phủ | **đã phủ** (1 thất bại) | `:865`, TEMP trigger dời mốc activation về sau |
| `not_due` (`:195`) | chưa phủ | **đã phủ** (1 thất bại) | `:875`, đồng hồ đọc 2026-10-01 khi đã có bản sửa đổi |
| `finalized` (`:203`) | đã phủ | đã phủ (2 thất bại) | hai test "recovery after downtime" |
| `imported` (`:204`) | chưa phủ | **đã phủ** (M5b: 2 thất bại) | `:796`, `:809` |
| `overdue_recorded` (`:208`), thêm | — | đã phủ (3 thất bại) | các test tắt công tắc và setup-bound |
| `before_account` (`:194`), thêm | — | riêng dòng này chưa phủ (exit 0) | theo cặp với phép kẹp ứng viên `:257`: M6b làm 3 test thất bại (B-01, kẹp H-Q1); xem R2 |
| riêng `not_active` (`:191`), thêm | — | riêng dòng này chưa phủ (M4b exit 0) | theo cặp với `:343-344`: M4 làm test F-4 thất bại; xem R1 |

Cả bốn nhánh skip mà brief nêu (`inactive_user`, `before_activation`, `not_due`, `finalized`) nay đều đã được phủ.

## Chất lượng test

- **Có ý nghĩa, không phải bản sao của mã.** Mọi test vòng 3 đều khẳng định kết quả đã lưu: các bản sửa đổi kèm ngày trả lương, dòng timesheet, dòng đã chốt, job, bản ghi quá hạn và bản tóm tắt của lần quét. Không test nào khẳng định lý do skip hay một lời gọi nội bộ. Mỗi test bị đột biến của chính guard của nó giết, và mỗi đột biến đó không làm test vòng 3 nào khác thất bại (04-mutations). Các test quét dùng công cụ chỉ dành cho test để đổi trạng thái sau khi danh sách ứng viên đã lập: TEMP trigger theo kết nối và một đồng hồ chạy lùi. Đây là cách duy nhất để chạm tới các guard này, vì `listCandidates` đã lọc sẵn các trường hợp đó (`:235`, `:257-260`). Việc vô hiệu hoá tài khoản hay đổi activation trong lúc quét là sự kiện thật, và đồng hồ hệ thống lùi lại cũng vậy. TEMP trigger mất đi cùng kết nối của từng test, nên không rò sang test khác.
- **Ổn định.** Năm lần chạy lặp tệp này: lần nào cũng 44 qua. Toàn bộ bộ test và e2e cũng qua.
- **Không làm yếu assertion nào trước đó.** Diff không xoá dòng `expect` nào: trong tệp, 235 lời gọi thành 250 và 40 test thành 44; trong cả bộ, 1416 test thành 1420. Test F-4 giữ mọi assertion và thêm một. Test nhập khẩu cũ được tách đôi. Nửa đầu nay khẳng định thêm bản tóm tắt của lần quét và không có timesheet nào bị chốt. Nửa "tắt" chuyển việc lưu công tắc lên trước hạn: nửa cũ lưu công tắc sau hạn nên không chứng minh được gì. Nay nó khẳng định thêm không có bản sửa đổi và không có job. Trường hợp kỳ nhập khẩu của tài khoản chưa từng cấu hình, mà test cũ tình cờ chạm tới, đã được các test `not_configured` của H-Q1 phủ.
- Nhận xét nhỏ, không phải lỗi: test `before_activation` dời activation về 2026-10-14T00:00:01Z. Mốc này nằm trước đồng hồ của lần quét, nên route production sẽ từ chối vì ở quá khứ (`activation_in_past`). Một mốc ở tương lai cũng giết đột biến theo cùng cách (R4).

## Hồi quy (khu vực B và C)

Không có.
- Verify: 1420 test, smoke 40 `PASS`.
- e2e: 127 qua, 5 bỏ qua. Cùng số liệu với WP3-REGATE3 và WP3_RECHECK_BC2.
- H1: 50 PASS, như WP3_RECHECK_BC2.
  - Tài khoản chưa từng cấu hình không nhận gì qua tám mốc hạn.
  - Lưu giữa kỳ, lựa chọn áp dụng cho kỳ quá hạn có kẹp theo ngày tạo tài khoản, tắt công tắc và ký thủ công đều đúng như quyết định.
  - Bốn múi giờ thiết bị cho kết quả giống hệt.
  - Không có lỗi tự động trong trạng thái quản trị.
- H2: 10 PASS.
- Nguồn của khu vực B và C giống từng byte với 2d72d35 (xem diff ở trên), nên các probe khu vực C của WP3_RECHECK_BC2 (phân quyền, đua thu hồi, gợi ý) không chạy lại ở đây. Probe gợi ý và probe HTTP của khu vực A trong [WP3_RECHECK_A3](WP3_RECHECK_A3.vi.md) đã kiểm tra lại ranh giới route chia sẻ và gợi ý trên bản freeze này (84 và 12 PASS).

## Phát hiện

Không có. Không thấy lỗi nào trong thay đổi vòng 3, trong khu vực B và C, hay trong hành vi production.

## Rủi ro và cải tiến tuỳ chọn (không phải lỗi đã chứng minh)

- **R1 (Thấp, khoảng trống test có từ trước).** Riêng lần kiểm tra lại activation trong vòng lặp `automation.ts:191` không được test nào phủ.
  - M4b (chỉ bỏ dòng đó, với giá trị dự phòng 1970) qua toàn bộ bộ test.
  - Test F-4 return tại `:343-344` trước khi tới `:191`, và bản ở 2f2520e cũng vậy. Nên đây không phải sự làm yếu của vòng 2 hay vòng 3, và không guard nào mà brief nêu bị bỏ trống.
  - Guard này có thể chạm tới trong production: quản trị viên xoá activation khi một lần quét đang chạy. Probe H3 cho thấy mã chạy đúng (4 PASS) và probe bắt được M4b, vốn chốt kỳ 2026-10-16 sau khi activation đã bị xoá.
  - Tuỳ chọn: thêm test quét thứ tư với một TEMP trigger đặt `automation_active_from = NULL` sau bản sửa đổi đầu tiên (cách của H3), kỳ vọng `finalized: 1`.
- **R2 (Thông tin).** Dòng `before_account` `:194` và phép kẹp ứng viên `:257` dư thừa lẫn nhau. Bỏ riêng từng cái thì bộ test vẫn qua (đợt quét; M6a); bỏ cả hai thì 3 test thất bại (M6b). `users.created_at` không bao giờ được cập nhật trong `src/server`, nên `:194` không thể chạm tới với một ứng viên đã được liệt kê. Không cần làm gì.
- **R3 (Thông tin).** M4a chỉ bỏ return ở mức quét và giữ `activated: false`. Nó qua bộ test, vì khi đó nhánh skip `not_active` trong vòng lặp giữ lại mọi ứng viên: không ghi gì, nhưng danh sách ứng viên vẫn được đọc. Chú thích của ScanSummary "nothing was read or written" chưa được test ở vế "read". Không cần làm gì.
- **R4 (Thông tin).** Test `before_activation` dùng một mốc activation mà route production sẽ từ chối vì ở quá khứ. Tuỳ chọn: dùng một mốc ở tương lai (ví dụ 2026-10-20T00:00:00Z), vẫn giết cùng đột biến.
- Các rủi ro R1–R6 chuyển tiếp từ WP3_RECHECK_BC2 không đổi: vòng 3 không đổi nguồn hay tài liệu nào.

## Cổng bắt buộc chưa chạy/bị chặn và lý do

- SMTP thật, triển khai NAS và kích hoạt production bị cấm trước khi chủ sở hữu cho phép chạy thử.
- Không bỏ sót dòng kiểm tra lại bắt buộc nào. Probe chụp giao diện (U2) không chạy lại vì không tệp client nào thay đổi; e2e đã phủ các màn hình trên Edge.

## Xử lý các phát hiện trước đó

- WP3-RBC2-01: đã sửa (ở trên).
- Các khẳng định của WP3-FIX3 được tái lập:
  - verify cho 1420 test;
  - M4, M5 và M5b làm 1, 1 và 2 test thất bại;
  - mỗi test skip mới thất bại khi xoá guard tương ứng;
  - `finalized` làm 2 test thất bại.
- Hai điểm khác, đều chặt hơn: tôi chạy toàn bộ bộ test thay vì một tệp, và chạy thêm tệp test cũ để cho thấy test cũ không bắt được các đột biến.
- PASS của WP3-REGATE3 (verify 1420, e2e 127/5) được tái lập.
- Các dòng vòng sửa 3 của WP3_HANDOFF khớp với những gì tôi quan sát.

## Sẵn sàng phần mềm, quyền của chủ sở hữu và kết quả chạy thử

- Sẵn sàng phần mềm của khu vực B và C của WP3 tại `49651c8` / `c31c300c…ec72`: PASS theo lần kiểm tra lại này.
- Quyền của chủ sở hữu cho gửi thật, kích hoạt hay triển khai: không xin, không được cấp. Chỉ chế độ capture; không bao giờ đặt `PRODUCTION_SENDING_ENABLED`. Kết quả chạy thử: không có.

## Một hành động tiếp theo

Điều phối viên ghi WP3-RECHECK-BC3 PASS và WP3-RECHECK-A lần 3 PASS ([WP3_RECHECK_A3](WP3_RECHECK_A3.vi.md)) tại digest `c31c300c…ec72`, rồi chạy bước nghiệm thu WP3. R1 có thể đưa vào danh sách chuyển tiếp của HANDOFF như một test tuỳ chọn.

Không bịa phát hiện, không ghi PASS chưa quan sát. Một đánh giá một phần không phải là nghiệm thu đầy đủ.

## Ghi chú quy trình

- Một shell tương tác vô tình. Khi chạy `cmd.exe /c where npm` từ Git Bash, tham số `/c` bị đổi thành đường dẫn, nên `cmd.exe` khởi động ở chế độ tương tác. Lệnh hết thời gian chờ và thành task nền `b16y9jy1f`, đang chờ stdin. Tôi không kill nó (brief cấm kill theo PID); điều phối viên có thể dừng task đó. Nó không chạy lệnh nào và không ghi gì.
- Probe HTTP (khu vực A): lần 1 dừng vì lỗi truyền tải (`fetch failed`, ECONNRESET) ở phía client của probe, khi bộ test đột biến đang làm máy bận. Lần 2 không khởi động vì lỗi cú pháp trong dòng log tôi thêm. Lần 3 là lần chính thức (84 PASS). Mọi lần chạy đều giữ trong bằng chứng.

## Nguồn gốc subagent độc lập

- Task/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá: WP3-RECHECK-BC3 lần 1, agent `a4e5c209ddf7091f5`. Tác giả bản sửa được đánh giá: WP3-FIX3 `ab4bd2cde876c7ecb` (sonnet); người commit WP3-FIX3-FREEZE `aca480339f4624b19`; cổng WP3-REGATE3 `a41152818099fb8d5`; cùng các tác giả WP3 trước đó trên bảng.
- Ngữ cảnh mới; xác nhận người đánh giá không là tác giả thay đổi: ngữ cảnh mới. Người đánh giá này không là tác giả của gì trong WP3, kể cả mọi vòng sửa, và không sửa mã nguồn. Chỉ ghi cặp báo cáo này, cặp WP3_RECHECK_A3, phần Results của hai brief và `evidence/WP3-RECHECK-BC3/`. Các sửa đổi chỉ trong vùng nháp là các đột biến trong `mut`, mỗi lần đều đã khôi phục.
- Digest nguồn trước/sau; bằng chứng cổng cho snapshot đó: `c31c300c…ec72` trước và sau; bằng chứng WP3-REGATE3 cho cùng commit và digest.
- Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước: `handoff/delivery/WP3_RECHECK_BC3.md` và `.vi.md` là tệp mới. WP3_RECHECK_BC, WP3_RECHECK_BC2 và WP3_REVIEW_B/C không bị động tới.
- Xử lý phát hiện và task sửa/kiểm tra lại tiếp theo của điều phối viên: WP3-RBC2-01 đã sửa; không có task sửa; tiếp theo là bước nghiệm thu WP3.
