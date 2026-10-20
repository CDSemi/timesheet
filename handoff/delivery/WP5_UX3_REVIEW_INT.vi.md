# Vòng đổi giao diện 3 của WP5, kiểm lại lần cuối và lượt tích hợp trên 8e55710 (WP5-UX3-AUDIT-INT)

Bản dịch của [WP5_UX3_REVIEW_INT.md](WP5_UX3_REVIEW_INT.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng đổi giao diện 3 do chủ sở hữu yêu cầu của WP5, kiểm lại lần cuối
  các phát hiện A2/B2 đã sửa bằng WP5-UX3-FIX4 (cùng FIX5 và FIX6 chỉ sửa test) và lượt tích hợp mà PASS của nó nghiệm thu lại WP5;
  task WP5-UX3-AUDIT-INT, attempt 1, ngày 2026-10-20 từ 04:40Z đến khoảng 06:10Z (2026-10-19 từ 21:40 đến khoảng 23:10 giờ
  America/Los_Angeles; kỳ đang hiển thị 10/12-10/25 chứa hôm nay, nên đồng hồ thật không rơi vào ngày cửa sổ; ngày cửa sổ được mô
  phỏng). Reviewer tự báo model `claude-opus-5-5` (agent trên board `a08c43f46e599d8f4`), profile timesheet-auditor (effort do profile
  đặt, không quan sát được từ bên trong). Model mạnh nhất trong các tác giả của snapshot là `claude-opus-5-5` (13 trong 68 task tác giả
  của WP5; `02-authors.txt`), nên reviewer không yếu hơn. Tôi không viết task nào của WP5 và không là planner, worker, verifier hay
  auditor nào của vòng 3 (kiểm tra board cho thấy ID của tôi không có trong tập tác giả).
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `8e557100d16b6b6eb86a48e00276835761aabfdf` (commit WP5-UX3-FIX6-FREEZE, đích của WP5-UX3-REGATE5). HEAD = origin/main = commit đó
  trước và sau; 0 dòng trạng thái ngoài `handoff/` trước và sau. Digest
  `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`, 833 file, không tính `handoff/`, ghi đầu tiên (04:44:49Z) và
  cuối cùng (05:37:49Z), mỗi lần theo ba dạng bằng nhau: export `git archive` sạch không có thư mục `.git` băm bằng
  `git hash-object --no-filters`, dạng `git ls-tree` (danh sách đã sắp xếp giống từng byte danh sách của export) và `npm run digest`
  trong repository. Không có commit chưa push. Source đủ: `npm ci` exit 0 ở bốn export (ba của đích, một của ceb86b6).
- **Quyết định: PASS.** Không có phát hiện.
  - Kiểm lại (mục 1): F-UX3A2-1, F-UX3A2-2, F-UX3A2-3 và F-UX3B2-1 đã đóng theo các probe của chính tôi trên bản dựng của đích; các
    chốt chặn R-A2-1, R-B2-1 và R-B2-4 đứng vững; mọi mutant chốt chặn đều bị bắt (8 trên 8; một mutant thứ chín để mô tả hành vi sống
    sót như dự đoán trong Chromium, rủi ro R-INT-2). Toàn bộ diff của FIX4 không gây hồi quy ở cả hai vùng, test của FIX5 không phụ
    thuộc giờ trong ngày và không có assertion nào yếu hơn, FIX6 loại bỏ race và không chỗ nào khác trong `hover.spec.ts` lấy một phần
    tử riêng của bố cục ngay sau khi đổi kích thước.
  - Tích hợp (mục 2): sáu review vùng và GOV cùng các bản ghi gate đã được đối chiếu; mọi phát hiện đã đóng hoặc được giữ làm rủi ro
    tùy chọn có lý do; mọi mục của chủ U-01..U-27, N-1, N-2, G-1..G-5, Q6, câu trả lời chip 24 giờ và Q7 đều có review đã đánh giá; mọi
    lý do FAIL của gate attempt 1, mọi phát hiện của sweep và độ lệch timeout của REGATE đều có kết luận.
  - Các probe liên vùng (mục 3), AC-13 ở ba múi giờ thiết bị (mục 4) và tài liệu (mục 5) đều đạt.
  - Kiểm tra bắt buộc (mục 6): typecheck 0, lint 0, `npm test` hai lần 0 (94 file, 2141 test), build 0 (gói chính 487.01 kB, không
    có cảnh báo), e2e ĐẦY ĐỦ trên đồng hồ thật exit 0 ngay lần đầu: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile
    322/37), không có dòng lỗi mạng hay buffer, nên không cần chạy lại.

## Phạm vi thật đã xem và chạy

1. Đọc như tuyên bố, không như bằng chứng: brief; AGENTS.md từ đĩa (bản được chèn vào ngữ cảnh của tôi là văn bản chưa sửa của
   chủ; file trên đĩa bằng blob `94bdcd81` của ceb86b6 và của đích, `36-governance.txt`); docs/08 (quy tắc audit); các quyết định
   của chủ và của coordinator trên board cho vòng 3; WP5_UX3_REVIEW_A, _B, _A2, _B2, GOV_UX3_REVIEW và GOV_UX3_REVIEW2; phần
   Results của WP5-UX3-GATE, -REGATE, -REGATE2, -REGATE3, -REGATE4, -REGATE5, -SWEEP, -DIAG1 và -FIX1 đến -FIX6; danh sách U của
   WP5-UX3-PLAN.
2. Đọc trọn các diff: `git diff ceb86b6..8629441 -- src tests docs` (FIX4, 8 path, `20-fix4-diff.txt`), `8629441..5c101c1`
   (FIX5, chỉ `tests/e2e/day-editor.spec.ts`, `21-fix5-diff.txt`), `5c101c1..8e55710` (FIX6, chỉ `tests/e2e/hover.spec.ts`,
   `22-fix6-diff.txt`); `git diff --name-only ceb86b6..8e55710` ngoài `handoff/` đúng bằng 8 path của FIX4
   (`23-names-base-target.txt`). Đã đọc mã: `AppShell.tsx` (các handler của thanh tab), `AccountMenu.tsx` (quy tắc để so sánh),
   `styles.css` tại các chỗ đặt mutant, `ClockOutDialog.tsx:106`, `breakRowsModel.ts:586-589`, `sessionModel.ts:300-305`, mọi chỗ đổi
   viewport trong `hover.spec.ts`.
3. Các kiểm tra bắt buộc trong một export sạch của đích (`export`), chạy tuần tự và một mình trên máy.
4. Probe của chính tôi, chỉ trong thư mục task (`zz-int-*.spec.ts`, bản sao là `script-*.txt`; Edge qua harness của repository,
   người dùng tổng hợp trên `example.invalid`): trong export thứ hai của đích (`probe`) và, để so sánh, trong một export của ceb86b6
   (`base`).
5. Chín mutant trong export thứ ba của đích (`mut`), mỗi mutant áp riêng, dựng lại client, chạy spec chốt chặn trên cả hai project,
   khôi phục file từ export nguyên bản và so khớp từng byte; sau mutant cuối, `src` bằng export nguyên bản và `dist` dựng lại bằng
   `dist` của export bắt buộc (`62-*.txt`).
6. docs/04, docs/10 và docs/12 (EN và VI) đối chiếu với hành vi đã đóng băng, kèm hai script kiểm tính tương đương.

## Bảng bằng chứng

Mọi bằng chứng là văn bản LF đã che trong `handoff/delivery/evidence/WP5-UX3-AUDIT-INT/` (mục lục `00-README.txt`) cùng 10 ảnh
`-synthetic.png`. Mã nguồn probe và script được giữ dưới dạng `script-*.txt`.

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest, ba dạng, đầu và cuối; HEAD; trạng thái ngoài `handoff/` | `507de97c…a2f6b6`, 833 file mọi lần; danh sách export = danh sách `ls-tree`; không có `.git` trong export; HEAD 8e55710 = origin/main; 0 dòng | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (bốn export), `npm run build` (probe, mut, base) | 0 mỗi lệnh | `30-setup-exits.txt`, `30-ci-*.txt`, `30-build-*.txt` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | 0 / 0; 0 dòng deprecation (chạy với `--trace-deprecation --pending-deprecation`) | `10-main-exits.txt`, `10-typecheck.txt`, `10-lint.txt` |
| `npm test` hai lần | 0 và 0: 94 file, 2141 test mỗi lần | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | 0; gói chính `index-DyUV--8_.js` 487.01 kB (gzip 143.17), AdminScreen 31.57 kB, ImportScreen 23.82 kB, CSS 79.40 kB; không có cảnh báo kích thước chunk | `10-build.txt` |
| AC-13 với TZ America/Los_Angeles, Asia/Tokyo, America/New_York (TZ của tiến trình con, có probe kiểm) | 0, 0, 0; 1/1 mỗi múi; probe offset 420, -540, 240 | `14-ac13-*.txt`, `14-tzprobe-*.txt` |
| e2e ĐẦY ĐỦ, đồng hồ thật, cả hai project (04:48:31-05:04:50Z) | exit 0: 651 passed, 67 skipped, 0 failed (desktop 329/30/0, mobile 322/37/0), 16.3 phút; 0 dòng deprecation và 0 dòng lỗi buffer hay mạng | `11-e2e-real.txt`, `11-e2e-real-counts.txt` |
| so sánh dist | bản dựng probe và mut bằng bản dựng bắt buộc (236 file); `dist/server` 180 và `dist/domain` 46 file của ceb86b6 bằng của đích | `34-dist-*.txt` |
| ranh giới server và domain | `git diff --stat a643794..8e55710 -- src/server src/domain src/client/api.ts package.json package-lock.json` rỗng; từ ceb86b6 cũng rỗng | `35-boundary.txt` |
| các path quản trị từ lần đóng băng GOV2 | `git diff --stat ceb86b6..8e55710` trên AGENTS, CLAUDE, docs/08, prompts, templates, `.claude`, `.agents`, docs/agents, các validator, precommit: rỗng | `36-governance.txt` |
| probe, đích, đồng hồ thật (lần 1) | 38 passed, 6 skipped theo project, 4 failed do lỗi probe của tôi (đã sửa, xem dưới) | `60-run-p-target.txt`, `p-target-errors.txt`, `50-obs-target-*.txt` |
| probe, đích, các probe đã sửa (lần 2) | 11 passed, 1 skipped theo project | `60-run-p-target-r2.txt`, `50-obs-target-r2-*.txt` |
| probe, base ceb86b6 | 18 passed | `60-run-p-base.txt`, `50-obs-base-*.txt` |
| probe pill ở 2026-10-26T16:00:00Z (đồng hồ FIX10) | 2 passed, hai lần (lần 2 có đường mở từ bảng) | `60-run-p-pill-1026*.txt`, `50-obs-target-sim1026*-pill.txt` |
| test của FIX5 chạy riêng ở bốn thời điểm mô phỏng | 2 passed mỗi thời điểm | `60-run-fix5-*.txt` |
| mutant | chạy 9: 8 chốt chặn bị bắt, 1 mutant mô tả sống sót | `60-mutants-summary.txt`, `61-mut-*-diff.txt`, `61-mut-*-e2e.txt` |
| tương đương tài liệu | hình dạng bằng nhau trong ba cặp; mọi khác biệt token là tên mục được dịch hoặc câu chuẩn được trích và dịch | `40-docs-parity.txt`, `41-docs-parity-lines.txt` |

## 1. Kiểm lại các phát hiện A2/B2 và FIX4, FIX5, FIX6

| Mục | Kết luận | Căn cứ (chạy của tôi trên bản dựng của đích) |
|---|---|---|
| F-UX3A2-1 (Medium): bảng More trên điện thoại vẫn mở sau khi tiêu điểm rời đi; các picker đang có tiêu điểm bị che | **Đã đóng** | Cả hai project ở 390x844 (`50-obs-target-more.txt`): mở bằng bàn phím, Tab qua Profile, Settings, Import, Theme, Sign out; lần Tab qua Sign out (Tab 6) đóng bảng; rồi thêm 54 lần Tab đi qua 47 điểm dừng khác nhau của trang và thanh: 0 điểm bị che hoàn toàn, 0 bị che một phần (25 điểm mẫu mỗi điểm dừng). Trên ceb86b6 cùng probe đó: bảng không bao giờ đóng, 12 điểm dừng bị che hoàn toàn, 2 bị che một phần (`50-obs-base-more.txt`, `int-more-hidden-focus-390-base-synthetic.png`). Escape từ Settings và từ Sign out đóng bảng và trả tiêu điểm về More (`aria-expanded` false); Shift+Tab lùi qua tab đầu tiên đóng bảng; Shift+Tab bên trong thanh giữ bảng mở. Chốt chặn: MA1 (bỏ việc đóng) và MA1b (chỉ blur có đích mới đóng, quy tắc của AccountMenu) làm `shell.spec.ts:779` fail trên cả hai project |
| F-UX3A2-2 (Low, độ mạnh test): vòng tiêu điểm của button link và tab điện thoại dưới con trỏ không có chốt chặn | **Đã đóng** | M4 (bỏ `.button-link:focus-visible:hover`) và M5 (bỏ `.shell-tabs .tab:focus-visible:hover:not(:disabled)`) đều làm `hover.spec.ts:718` fail trên project desktop, sáng và tối (project mobile theo thiết kế không hover được) |
| F-UX3A2-3 (Low): Sign out lệch 3px | **Đã đóng** | Menu ở 1280 và More ở 390, nhân viên và admin, sáng và tối, cả hai project (16 trường hợp, `50-obs-target-signout.txt`): biểu tượng của mọi mục bắt đầu ở 12px và chữ ở 42px bên trong mục, khoảng cách 12, lệch tâm 0.88; Sign out giữ viền 1px với đệm ngang 11px; chênh lệch lớn nhất so với Profile 0px. Trên ceb86b6: Sign out 15/45, 3px (`50-obs-base-signout.txt`; ảnh `int-account-entries-1280-{target,base}-synthetic.png`). MA3 (bỏ dòng padding) làm `shell.spec.ts:1135` fail, 4 test |
| F-UX3B2-1 (Low, độ mạnh test): việc ghi chú xóa dòng vắng mặt không có chốt chặn | **Đã đóng** | M6a (điều kiện của ghi chú bỏ `session.breaks.length > 0`) làm `day-editor.spec.ts:1882` (Check out E-1 không có dòng đã lưu) fail trên cả hai project; các assertion (`:1814` khi giữ một dòng đã lưu, `:1897-1907` khi hộp thoại mở không có dòng đã lưu và sau khi thêm rồi xóa một dòng) đã đọc trong diff |
| R-A2-1: việc quét hover đánh giá media theo chữ | **Đã đóng** | `collectHoverRules` cũng liệt kê các rule mà mọi media bao quanh đều khớp trên thiết bị (`hover.spec.ts:576-598`); test màn hình cảm ứng `:646` khẳng định hover none và pointer coarse trước. M6b (`tbody tr:hover` dưới `(hover: hover), (pointer: coarse)`) làm `:646` fail trên cả hai project. Giới hạn còn lại: style rule lồng trong style rule không được duyệt (stylesheet không có) |
| R-B2-1: "Confirm breaks" trên ca kết thúc hôm nay không có chốt chặn | **Đã đóng** | M5b (điều kiện ngày quá khứ theo đồng hồ thiết bị trong `confirmBreaksRows`) làm `day-editor.spec.ts:3941` fail trên cả hai project trên đồng hồ thật (phiên bản FIX5 của test) |
| R-B2-4: chú thích test-oracle trên `suggestedRows` | **Đã đóng** | `sessionModel.ts:300-303` nói đây là test oracle; `git grep` chỉ thấy nơi gọi trong `breakRowsModel.test.ts` và `sessionModel.test.ts` (`33-suggestedRows.txt`) |
| Toàn bộ diff của FIX4, cả hai vùng | **Không hồi quy** | Xem "Hành vi của bảng More" dưới đây; menu desktop ở 1280 không đổi (Tab qua Sign out đóng menu với tiêu điểm ở Check in, Escape trả tiêu điểm về nút danh tính, nhấn bên ngoài đóng menu); các mục tài khoản như trên; e2e đầy đủ xanh; `dist/server` và `dist/domain` giống từng byte với ceb86b6; thay đổi CSS duy nhất là một biểu thức token (`calc(var(--space-3) - var(--hairline))`); docs/10 dòng 240 ghi 487.01 kB, đúng kích thước đo được |
| Test của FIX5 | **Không phụ thuộc giờ; không assertion nào yếu hơn** | Chạy riêng trên cả hai project dưới đồng hồ FIX10 lúc 00:30 PDT (2026-10-20T07:30Z), 12:00 PDT, 23:45 PDT và 01:30 PST sau khi lùi giờ (2026-11-01T09:30Z): 2 passed mỗi lần; REGATE4 thêm 00:30, 02:00 và 23:30. Mọi assertion của FIX4 được giữ (ca trước đó, giờ của dòng, 15 phút, "suggested", không có PUT trước Save, "1 break (15 min)", nội dung PUT, ca đã lưu); thêm: múi giờ của người dùng bằng múi `Etc/GMT` đã chọn và cả ca nằm trên `today_local` của server. Offset `((23 - UTC hour) mod 24) - 11` làm giờ địa phương thành 12:xx ở mọi giờ UTC (offset -11..+12, đều là múi `Etc/GMT` hợp lệ). Việc bỏ dọn dẹp chỉ liên quan người dùng mới của chính test |
| Selector của FIX6 | **Hết race; không chỗ nào khác** | Bản sao dòng 753-756 với sự kiện `change` của matchMedia bị hoãn 150 ms, 20 vòng mỗi loại (`50-obs-target-race.txt`): selector trước FIX6 lấy nhầm nút `.sheet-date` cũ của desktop 20 trên 20 lần (sau đó bị gỡ khỏi DOM 20 lần); selector của FIX6 0 trên 20. Trong `hover.spec.ts` các lần đổi viewport ở dòng 161, 436 và 722 xảy ra trước khi đăng nhập hoặc trước khi trang được chuẩn bị; chỉ dòng 753 đổi kích thước một trang đã tải, và các locator tiếp theo của nó là `.sheet-day-button` chỉ có trên điện thoại và liên kết của thanh tab, thứ mà cả hai bố cục đều giữ (`24-hover-viewport.txt`, `24-hover-snips.txt`). Hai chỗ DIAG1 chưa kiểm (`focus-ring.spec.ts:228`, `surfaces.spec.ts:151`) lấy phần tử mà không đổi kích thước trước đó (`39-other-resize.txt`) |

**Hành vi của bảng More sau FIX4** (cả hai project ở 390x844: project mobile là điện thoại cảm ứng, project desktop là cửa sổ hẹp
với con trỏ chính xác; `50-obs-target-more.txt`, `50-obs-target-r2-more.txt`):

- Nhấn More khi tiêu điểm đang trong bảng gỡ bảng đúng một lần, và lần nhấn tiếp theo thêm bảng đúng một lần (MutationObserver:
  không có kiểu đóng rồi mở lại gây nháy), bằng click và bằng chạm. Nhấn vào phần đầu của chính bảng thì bảng vẫn mở.
- Nhấn bên ngoài đóng bảng: trên chữ tiêu đề kỳ và trên một điều khiển của trang ("Change several days").
- Đổi trang đóng bảng: liên kết tab Overtime và đổi địa chỉ sang `#/history`.
- Các mục (admin): Profile, Settings, Administration và Import bằng bàn phím đóng bảng và đặt tiêu điểm vào `h1` của trang mới
  kèm vòng tiêu điểm; mục của trang đang hiển thị trả tiêu điểm về More; mục chọn bằng con trỏ đặt tiêu điểm vào `h1` không có vòng.
- Phím mũi tên trong các radio Theme giữ bảng mở với tiêu điểm bên trong.
- Mutant MA1c (mọi blur không có đích đều đóng, bỏ điều kiện Tab) sống sót: trong Chromium nút More được nhấn sẽ nhận tiêu điểm, nên
  nhánh không có đích chỉ đạt tới sau một phím Tab. Rủi ro R-INT-2.

## 2. Tích hợp các bản ghi của vòng

### 2.1 Các review và gate

| Bản ghi (snapshot) | Quyết định | Kết luận tích hợp |
|---|---|---|
| GOV_UX3_REVIEW (79b9a53) | PASS | Còn hiệu lực cho phần UI: không path quản trị nào đổi từ ceb86b6 (`36-governance.txt`) và GOV2 giữ nguyên từng byte mục 1-13 và phần UI. R1 và R2 của nó đã đóng (mục 2.6) |
| WP5-UX3-GATE (cecfceb) | FAIL | Mọi lý do đã đóng (2.3) |
| WP5-UX3-SWEEP (cecfceb) | 13 phát hiện | Mọi phát hiện có kết luận (2.4) |
| WP5-UX3-REGATE (7ce4e95) | PASS kèm một độ lệch timeout đã ghi | Đã giải quyết (2.5) |
| WP5_UX3_REVIEW_A (7ce4e95) | FIX REQUIRED, F-UX3A-01..06 | Tất cả đã đóng bằng FIX3, kiểm lại ở A2; lịch sử |
| WP5_UX3_REVIEW_B (7ce4e95) | FIX REQUIRED, F-UX3B-1..2 | Cả hai đã đóng bằng FIX3, kiểm lại ở B2; lịch sử |
| GOV_UX3_REVIEW2 (ceb86b6) | PASS | Còn hiệu lực: AGENTS.md và AGENTS.vi.md không đổi từ ceb86b6 |
| WP5-UX3-REGATE2 (ceb86b6) | PASS | Các mục của nó được REGATE3 đến REGATE5 thay thế cho các snapshot sau |
| WP5_UX3_REVIEW_A2 (ceb86b6) | FIX REQUIRED, F-UX3A2-1..3 | Đóng tại đây (mục 1); lịch sử |
| WP5_UX3_REVIEW_B2 (ceb86b6) | FIX REQUIRED, F-UX3B2-1 | Đóng tại đây (mục 1); lịch sử |
| WP5-UX3-REGATE3 (8629441) | FAIL, chỉ mục 4 (test phụ thuộc giờ) | Đóng bằng FIX5 (REGATE4 mục 4, mục 1) |
| WP5-UX3-REGATE4 (5c101c1) | FAIL, mục 2 (ba lỗi chập chờn trên đồng hồ thật) | DIAG1: hai sự kiện máy `net::ERR_NO_BUFFER_SPACE` và một race, đã sửa bằng FIX6; REGATE5 PASS; lần chạy đầy đủ đầu tiên của tôi không có lỗi nào |
| WP5-UX3-REGATE5 (8e55710) | PASS | Cùng snapshot với audit này; các mục được chuyển tiếp của nó dựa trên bản dựng giống từng byte, điều tôi xác nhận (`34-dist-*.txt`) |

Quy tắc chuyển tiếp: sau ceb86b6 chỉ các handler của thanh tab trong `AppShell.tsx`, một dòng `styles.css`, một chú thích, ba spec
e2e và docs/10 dòng 240 thay đổi (FIX4), rồi hai test (FIX5, FIX6). `dist/server` và `dist/domain` giống từng byte với ceb86b6. Vì
vậy mọi kết luận của A, A2, B và B2 ngoài menu tài khoản và bảng More vẫn còn hiệu lực như đã ghi, và các phần FIX4 chạm tới được
đo lại tại đây (mục 1 và 3).

### 2.2 Các mục của chủ và review đã đánh giá

| Mục của chủ | Được đánh giá bởi | Trạng thái ở đích |
|---|---|---|
| U-01 phong cách hiện đại (quản trị và token) | GOV_UX3_REVIEW (văn bản); AUDIT-A mục 1, mục 2 | PASS; chuyển tiếp |
| U-02 độ tương phản, week sheet nổi | AUDIT-A mục 1 | PASS; chuyển tiếp |
| U-03 khối danh tính | AUDIT-A mục 1, F-UX3A-03 (44px với con trỏ thô) đóng ở A2 | PASS; chuyển tiếp; chế độ xem chia sẻ giữ người đang đăng nhập (mục 3) |
| U-04 menu avatar (và More) | AUDIT-A mục 1; F-UX3A-04 (A2); F-UX3A2-1, F-UX3A2-3 | PASS tại đây (mục 1) |
| U-05 dời Settings và Administration | AUDIT-A mục 1 và mục 3 | PASS; admin tới được ở 13 độ rộng (mục 3) |
| U-06 wordmark | AUDIT-A mục 1 | PASS; chuyển tiếp |
| U-07 check in/out trên hàng tiêu đề, U-08 không có dòng tên | AUDIT-A mục 1 | PASS; chuyển tiếp |
| U-09 các pill | AUDIT-A mục 1 | PASS; chuyển tiếp; đã thấy lại pill (mục 3) |
| U-10 hàng meta, U-11 hàng Open a day, U-12 khoảng cách thanh công cụ | AUDIT-A mục 1 | PASS; chuyển tiếp |
| U-13 cột đang sửa, U-14 cột nổi | AUDIT-A mục 1, mục 5 và 12; đường nối của A2 | PASS; chuyển tiếp |
| U-15 Category, U-16 Status | AUDIT-A mục 1 (cùng G-2 a) | PASS; chuyển tiếp |
| U-17 Current, U-18 chữ Open a day | AUDIT-A mục 1 | PASS; chuyển tiếp |
| U-19 ghi chú ngắn (chip), U-20 bề mặt đầu panel | AUDIT-A mục 1 và 6 | PASS; đã thấy lại chip (mục 3) |
| U-21 hộp thoại ca và bảng giờ nghỉ | AUDIT-B mục 2 và 7 | PASS; chuyển tiếp |
| U-22 xác nhận xóa | AUDIT-A mục 6, AUDIT-B mục 6 | PASS; đã thấy trong chế độ xem chia sẻ được sửa (mục 3) |
| U-23 điền sẵn | AUDIT-B mục 4 (G-3 a) | PASS; chuyển tiếp |
| U-24 "Confirm no breaks taken" và các dòng | AUDIT-B mục 3; F-UX3B-1 (B, B2) | PASS; chuyển tiếp |
| U-25 Save là xác nhận | AUDIT-B mục 3 | PASS; chuyển tiếp |
| U-26 xác nhận trước Save và khi Cancel có thay đổi | AUDIT-B mục 3 và 8 (Check out, FIX2 mục 8) | PASS; đã đi lại chồng hộp thoại (mục 3) |
| U-27 WFH trên hàng Category | AUDIT-A mục 1 | PASS; chuyển tiếp |
| N-1 dòng giờ nghỉ, chip và hộp thoại con trên điện thoại | AUDIT-B mục 7 | PASS; đã đi lại chồng hộp thoại con (mục 3) |
| N-2 khoảng cách hộp thoại trên điện thoại | AUDIT-B mục 7 (đã đánh giá, audit-focus mục 9) | PASS; chuyển tiếp |
| G-1 b sheet vuông góc, nổi 4px, không đổ bóng lên cột nổi bên cạnh, panel nổi | AUDIT-A mục 1 và 12; đường nối của A2 | PASS; chuyển tiếp |
| G-2 a Category / Status | AUDIT-A mục 1 | PASS; chuyển tiếp |
| G-3 a điền sẵn và việc viết lại quy tắc | AUDIT-B mục 4; tài liệu (mục 5) | PASS; chuyển tiếp |
| G-4 biến thể của chủ (thông báo, rồi xác nhận) | AUDIT-B mục 3 (audit-focus mục 8) | PASS; đã đi lại ở 1280 (mục 3) |
| G-5 b "in progress" | AUDIT-A mục 1 (mutant A6, A10); sweep 3 và FIX2 mục 3 | PASS; đo lại vào một ngày cửa sổ (mục 3) |
| Q6 b ô ngày giờ nghỉ chỉ khi qua nửa đêm | AUDIT-B mục 2 (E14) và 7 | PASS; chuyển tiếp |
| câu trả lời chip 24 giờ | AUDIT-B mục 7 | PASS; đã thấy chip "Break 1 · 10/17/2026 00:00 → 00:15" (mục 3) |
| Q7 văn bản AGENTS.md | GOV_UX3_REVIEW2 | PASS; còn hiệu lực (không đổi từ đó) |

Không vùng nào bị bỏ sót: vùng A (hình ảnh, khung ứng dụng, settings, bảng, trợ năng), vùng B (tính toàn vẹn khi nhập giờ nghỉ và
các hộp thoại), quản trị (GOV và GOV2) và hành vi liên vùng của lượt này.

### 2.3 Các lý do FAIL của gate attempt 1 (WP5-UX3-GATE trên cecfceb)

| Lý do | Kết luận |
|---|---|
| 1a test cột nổi đo qua hai dải tuần vào các ngày thứ Ba | Đã đóng: FIX1 mục 1; REGATE chạy các thứ Ba 10-20 và 11-03; AUDIT-A mục 10 |
| 1b lỗi 409 phụ thuộc thứ tự ở bước seed (`timesheet.spec.ts:452`) | Đã đóng: FIX1 mục 2; REGATE hai lần ở 11-28; AUDIT-B mục 8 kèm mutant |
| 2 tiêu điểm bàn phím bị cắt trong thẻ tuần ở 768-880px | Đã đóng: FIX1 mục 3; các lượt đi của REGATE và REGATE2; AUDIT-A mục 5 và 10 |
| 3a axe `label-content-name-mismatch` trên nút chọn category | Đã đóng: FIX1 mục 4; axe của REGATE, REGATE2, REGATE3 |
| 3b lỗi tương tự trên các chip giờ nghỉ gợi ý trên điện thoại | Đã đóng: FIX1 mục 5; cùng các lần quét |
| 3c `target-size` của Today dưới menu tài khoản đang mở | Chấp nhận làm rủi ro tùy chọn R2 của AUDIT-A: menu do người dùng mở, không modal và tạm thời (ghi chú WCAG 2.2 của SC 2.4.11); không đổi |
| (đã đo, không phải lý do) vết khuyết bóng ở các mối nối bên trong | Đã đóng: FIX1 mục 7; AUDIT-A mục 12 và đường nối của A2 |

### 2.4 Các phát hiện 1-13 của sweep (WP5-UX3-SWEEP)

| # | Kết luận |
|---|---|
| 1 tiêu điểm sau khi chọn một mục tài khoản | Đã đóng: FIX2 mục 1; AUDIT-A mục 3; đo lại cho More tại đây (mục 1) |
| 2 M18 sống sót | Đã đóng: FIX2 mục 2; mutant A09 của AUDIT-B |
| 3 chip của editor ghi "future period" cho một ngày in progress | Đã đóng: FIX2 mục 3; mutant A10 của AUDIT-A; đo lại vào một ngày cửa sổ (mục 3) |
| 4 chữ "label" | Đã đóng: FIX2 mục 4; AUDIT-A mục 10; REGATE |
| 5 cách xử lý của docs/12 khi Check out | Đã đóng: FIX2 mục 5, rồi FIX3 (R-UX3B-3); AUDIT-B2 |
| 6 con số chunk trong docs/10 | Đã đóng: FIX2, rồi FIX4 mục 8 (487.01 kB, bằng bản dựng của tôi) |
| 7 M21 sống sót | Đã đóng: FIX2 mục 7; AUDIT-A mục 10 |
| 8 câu hỏi bỏ thay đổi khi Check out | Đã đóng: FIX2 mục 8; AUDIT-B mục 8 |
| 9 tham chiếu mục trong docs/10 | Đã đóng: docs/10 dòng 226 nay ghi "document 04, the paragraph after the Screens table, line 16 before round 3" |
| 10 các helper không dùng | Đã đóng: FIX2 mục 10 (AUDIT-B), rồi FIX3 bỏ `quickBreaksOf`; `suggestedRows` được đánh dấu (R-B2-4) |
| 11 rule hover không có điều kiện | Đã đóng: FIX2 và FIX3 (F-UX3A-02, A2); nay có chốt chặn theo việc khớp media (R-A2-1) |
| 12 Check out sau khi xóa các dòng đã lưu | Đã đóng: F-UX3B-1 (FIX3, B2) và chốt chặn F-UX3B2-1 của nó (FIX4, tại đây) |
| 13 gợi ý của Category không được liên kết | Đã đóng: FIX2 mục 13; AUDIT-A mục 10 |

### 2.5 Độ lệch timeout của REGATE

AUDIT-A mục 11 đánh giá hai timeout trên mobile của lần chạy 2026-12-31 (test tương phản của `theme.spec.ts`,
`timesheet.spec.ts:1799`) là nhiễu do tải từ một lần máy khựng khoảng 21 s, với ngân sách thời gian hẹp của test tương phản là rủi
ro R8. FIX3 mục 12 cho test đó ngân sách 120 s và việc thử lại có giới hạn cho các timeout poll của chính nó; A2 đánh giá là hợp lý
(mutant M12) và đóng R8. Trong lần chạy đầy đủ của tôi, test tương phản (nay ở `theme.spec.ts:430`) mất 20.6-21.7 s trên desktop
và 15.5-16.7 s trên điện thoại, còn `timesheet.spec.ts:1799` mất 1.1 s, tất cả đều đạt (`11-e2e-real-counts.txt`). Kết luận: đã xác
nhận, đã đóng.

### 2.6 Sổ rủi ro

Đã đóng: A R1 (docs/04 dòng 46 nêu giới hạn của lớp nền mờ) và R8; A2 R-A2-1; B R-UX3B-3 và R-UX3B-4; B2 R-B2-1 và R-B2-4; quan
sát 3 của REGATE2 (nhãn trong docs/10); GOV R1 (docs/04 dòng 96 nay ghi "readable density") và R2 (`--transition-duration` đặt tại
chỗ qua `--transition` dùng chung, docs/04 dòng 90).

Giữ làm rủi ro tùy chọn, mỗi mục với lý do như đã ghi và không bị các diff sau làm thay đổi: A R2 (target-size dưới menu đang mở, đã
biện minh), R3 (chỗ trũng một pixel thiết bị ở chủ đề tối DPR 2, không thấy ở cỡ thường), R4 (dấu ngoặc sinh bằng CSS trong tên hộp
thoại, không có engine thứ hai), R5 (màn hình tải lười chậm hơn 5 s để tiêu điểm ở body, giới hạn theo thiết kế), R6 và B R-UX3B-6
(timeout của test tích hợp khi tải song song nặng; không có trong hai lần `npm test` của tôi), R7 (More giữ tiêu điểm ở chính nó khi
mở bằng bàn phím; thấy lại tại đây), R9 (ghi chú bằng chứng); A2 R-A2-2 (mã lỗi trên điện thoại bị ngắt giữa định danh), R-A2-3
(kiểu hover của button link, có từ trước), R-A2-4 (lỗi mạng chập chờn), quan sát 2 của REGATE2 (màn hình đầu khi đi xa thấp hơn
2.2px, trong ngân sách); B R-UX3B-1, -2, -5, -7; B2 R-B2-2, -3, -5; GOV R3 (ngữ cảnh được chèn đã cũ, thấy lại trong audit này), R4
(Today không hoạt động được làm mờ: cách đọc trước vẫn đứng, trạng thái còn có ở mức chương trình), R5, R6 (GLOSSARY.md và
`docs/adr/` chưa có, backlog quản trị); GOV2 R1-R9 (ghi chú cho chủ, câu chữ trong backlog, thông tin); đề xuất tùy chọn làm cứng
fixture của DIAG1 (không áp dụng; quy tắc chạy lại được dùng).

## 3. Hành vi liên vùng (probe của chính tôi)

| Probe | Kết quả |
|---|---|
| Editor nổi ở 1280 với các hộp thoại xếp chồng (`50-obs-target-r2-stack.txt`, `int-stack-notice-1280-target-r2-synthetic.png`) | Editor là modal và neo bên trái của một cột thứ Sáu; thanh trên cùng bị trơ (focus bằng script bị từ chối; 40 lần Tab không bao giờ tới một điều khiển của trang, chỉ đi qua trình duyệt). Hộp thoại ca nằm trên (editor bị trơ phía sau), rồi thông báo "No breaks listed" (hộp thoại ca bị trơ phía sau; tiêu điểm ở "Go back and add breaks"). Thứ tự Escape: thông báo đóng với tiêu điểm ở "Add break"; "Leave breaks unconfirmed for now" mở "Save this session?" (tiêu điểm ở Back) và Escape trở về hộp thoại với tiêu điểm ở Save; Escape trong hộp thoại đã đổi hỏi "Discard your changes?" (tiêu điểm ở Keep editing), Escape ở đó tiếp tục sửa; Discard đóng với tiêu điểm ở "Add session"; Escape đóng editor với tiêu điểm ở nút ngày của cột. Không có lần ghi nào trong cả lượt đi. axe 4.14.0: 0 vi phạm ở tầng 1 và 3 |
| Điện thoại 390 (cả hai project): sheet editor, hộp thoại ca dạng chip, hộp thoại con "Break 1" | More đang mở, rồi nhấn vào một ngày: bảng đóng và sheet mở; More bị trơ phía sau sheet (focus bằng script bị từ chối, sheet phủ tâm của nó). Ca qua đêm: bố cục chip; hộp thoại con là modal thứ ba (mọi thứ phía sau bị trơ). Escape: hộp thoại con về chip, hộp thoại về Edit, sheet về nút ngày; sau đó More lại hoạt động. axe 0 vi phạm (`int-stack-subdialog-390-target-r2-synthetic.png`) |
| Menu tài khoản trên editor không modal ở 1366 (`50-obs-target-menu-editor.txt`, `int-menu-over-editor-1366-target-synthetic.png`) | Mọi mục của menu nằm trên cùng tại tâm của nó, phía trên panel editor; Escape chỉ đóng menu (tiêu điểm ở nút danh tính, editor vẫn mở); mở bằng bàn phím đặt tiêu điểm vào Profile; Tab qua Sign out đóng menu trong khi editor vẫn mở; nhấn bên ngoài đóng menu; sau đó Escape trong editor đóng editor (tiêu điểm về nút ngày); mục Settings rời màn hình với tiêu điểm ở `h1` Settings. axe 0 vi phạm. Ở 1280 editor modal giữ nút danh tính bị trơ |
| Chế độ xem chia sẻ, chỉ xem và được sửa, cả hai project (`50-obs-target-r2-shared.txt`, `int-shared-*-editor-target-r2-synthetic.png`) | Thanh trên cùng và nội dung tài khoản hiển thị grantee đang đăng nhập, không bao giờ là chủ; không có Check in/out; pill "current" và "Draft". Chỉ xem: không có Open a day, Change several days hay các picker Category; hộp thoại có tên "Day …" với các chip kỳ, múi giờ và "View only"; thẻ ca và bảng giờ nghỉ không có Add, Edit, Delete hay Confirm breaks; chỉ có lần đăng nhập được ghi. Được sửa: có các công cụ; "Confirm breaks" liệt kê 3 gợi ý nằm trong ca, Save đi qua "Save this session?" và PUT đi tới `/api/shared/:ownerId/sessions/…` (ca của chủ sau đó được xác nhận với 3 giờ nghỉ); Cancel của xác nhận xóa không gửi gì. Request ngoài `/api/shared/:ownerId`: chỉ `GET /api/auth/setup` trước khi đăng nhập. axe 0 vi phạm ở cả bốn lần quét editor |
| Pill "in progress" và chip của editor (`50-obs-target-sim1026-r2-pill.txt`, `int-pill-window-day-target-sim1026-r2-synthetic.png`) | Đồng hồ FIX10 lúc 2026-10-26 09:00 PDT (ngày cửa sổ; current 10/12-10/25, in progress 10/26-11/08): pill khi vào trang "current"; hôm nay qua Open a day: chip "in progress"; một ngày của kỳ đang hiển thị: "current period"; Today: pill "in progress"; hôm nay từ bảng đó và qua Next: chip "in progress". Đồng hồ thật (không phải ngày cửa sổ): pill "current", chip "current period", kỳ sau "future" |
| Settings và Administration cho admin (`50-obs-target-admin.txt`) | 13 độ rộng từ 1920 đến 320 trên cả hai project, không có và có một chia sẻ nhận được: menu tài khoản (từ 768px) hoặc More (dưới đó) liệt kê Administration; mục chọn bằng con trỏ, liên kết "Settings sections" và `#/admin` đều tới `h1` Administration; mục Settings bằng bàn phím đặt tiêu điểm vào `h1` Settings; không cuộn ngang |

## 4. AC-13

`tests/integration/ac13-two-week.test.ts` chạy qua tiến trình con có đặt `TZ`: America/Los_Angeles (probe offset 420 phút),
Asia/Tokyo (-540) và America/New_York (240): exit 0 với 1/1 mỗi múi (`14-*.txt`). Kịch bản tự cố định múi giờ báo cáo của nó, nên múi
giờ thiết bị không được làm nó thay đổi, và quả thật không.

## 5. Tài liệu

- docs/04 (EN và VI) mô tả đúng hành vi đã đóng băng mà tôi quan sát: dòng 7 (nội dung menu tài khoản và More, Escape, nhấn bên
  ngoài, đổi trang, Tab qua Sign out, tiêu điểm sau khi chọn mục), dòng 13 (các trang con của Settings, `#/admin`), dòng 14 và 63
  (chế độ xem chia sẻ, chip "View only"), dòng 53 và 63 (pill và chip "in progress"), dòng 62 và 68 (panel nổi modal, một modal trên
  cùng, Escape và trả tiêu điểm), dòng 67 (chip 24 giờ, hộp thoại con), dòng 70 (ghi chú xóa dòng khi Check out), dòng 96 ("readable
  density").
- docs/10 dòng 240 (VI 241) ghi 487.01 kB, bằng bản dựng của tôi (`index-DyUV--8_.js`, cùng tên file với bản dựng của REGATE3); dòng
  219-246 mang các câu trả lời của chủ và quyết định của coordinator cho vòng 3, gồm văn bản quy tắc của G-3.
- docs/12 dòng 35-41 và 71 khớp với hành vi.
- EN/VI: tiêu đề, gạch đầu dòng và hàng bảng bằng nhau trong ba cặp; xét từng dòng trên các đoạn của vòng 3, khác biệt token duy nhất
  là tên mục được dịch, các câu chuẩn được trích và dịch, và "round 3" được viết là "thứ ba" (`40-*`, `41-*`).
- AGENTS.md trên đĩa là văn bản GOV2-AUDIT đã chấp nhận; thay đổi kiểu dáng duy nhất của FIX4 chỉ dùng token (quy tắc UI 1 của AGENTS).

## 6. Kiểm tra bắt buộc (export sạch của đích; `10-main-exits.txt`)

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | exit 0, 0 dòng deprecation |
| `npm run lint` | exit 0, 0 dòng deprecation |
| `npm test` (hai lần) | exit 0 cả hai; 94 file, 2141 test mỗi lần |
| `npm run build` | exit 0; gói chính 487.01 kB; không có cảnh báo kích thước chunk |
| AC-13 ở ba múi giờ thiết bị | exit 0 mỗi múi (mục 4) |
| e2e ĐẦY ĐỦ, cả hai project, đồng hồ thật | exit 0 ngay lần đầu: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile 322/37), 16.3 phút; không có `ERR_NO_BUFFER_SPACE` hay dòng lỗi mạng nào khác, nên không cần quy tắc chạy lại |

## Lỗi

Không có. Không tìm thấy lỗi sản phẩm hay thiếu sót về độ mạnh test ở mức Low trở lên trên đích.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- **R-INT-1 (độ chính xác tài liệu).** docs/04 dòng 7 viết rõ Escape, nhấn bên ngoài, đổi trang và Tab qua Sign out cho menu desktop,
  còn với More chỉ nói nó "holds the same account content". Bảng More hành xử giống vậy (mục 1); một câu sẽ nêu rõ điều đó (Escape trả
  tiêu điểm về More; tiêu điểm rời thanh tab, kể cả bằng Shift+Tab, đóng bảng).
- **R-INT-2 (engine chưa kiểm).** Nhánh blur không có đích của bảng More chỉ đóng sau một phím Tab, để một lần nhấn More trong engine
  mà nút được nhấn không nhận tiêu điểm (WebKit: Safari trên iPhone và macOS) không đóng rồi mở lại bảng. Trong Chromium không phân
  biệt được nhánh đó (mutant MA1c sống sót) và máy không cài engine nào khác: NOT VERIFIED ở đó, như các mục engine thứ hai trước.
- **R-INT-3 (máy).** `net::ERR_NO_BUFFER_SPACE` vẫn xảy ra khi tải nặng: một lần trong lượt chạy mutant MA1 của tôi
  (`shell.spec.ts:478` mobile, bộ chặn lỗi console, không liên quan đến mutant; `mut-MA1-320.txt`). Lần chạy bắt buộc của tôi không có.
  Quy tắc chạy lại bao trùm trường hợp này.
- **R-INT-4 (thông tin).** Từ 768 đến 1023px khi có một chia sẻ nhận được, thanh desktop chiếm hai hàng (102px; 128px trong mô phỏng
  của project mobile). docs/04 chỉ hứa một hàng từ 1024px, nơi điều đó đúng.

## Gate chưa chạy hoặc bị chặn

- Mọi kiểm tra của brief đã chạy. Không có trình duyệt engine thứ hai: NOT VERIFIED cho hành vi riêng của engine (R4, R-INT-2), như
  trong mọi audit vòng 3 trước. Drill, compose, `npm audit`, đường nối DPR 2 và danh sách axe đầy đủ không thuộc brief này; chúng dựa
  trên REGATE3 đến REGATE5 và A2 với bản dựng giống từng byte (`34-dist-*.txt`). Các mục NAS vẫn nằm ngoài.

## Xử lý phát hiện trước

- F-UX3A2-1, F-UX3A2-2, F-UX3A2-3 (WP5-UX3-AUDIT-A2) và F-UX3B2-1 (WP5-UX3-AUDIT-B2): đã đóng trên 8e55710.
- R-A2-1, R-B2-1, R-B2-4: đã đóng. Các phát hiện trước F-UX3A-01..06 và F-UX3B-1..2: đã đóng ở A2/B2, vẫn còn hiệu lực trên đích.
- Lỗi phụ thuộc giờ của REGATE3 và race của REGATE4: đóng bằng FIX5 và FIX6; hai sự kiện buffer của REGATE4: do máy, quy tắc chạy lại.

## Sẵn sàng phần mềm, phép của chủ và pilot

- Sẵn sàng phần mềm: PASS này nghiệm thu lại WP5 sau vòng đổi giao diện 3 trên 8e55710 / `507de97c…`, cùng với PASS của
  WP5-UX3-REGATE5 trên cùng snapshot.
- Phép của chủ: chưa yêu cầu hay cấp; không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- Kết quả pilot: chưa có; chưa chạy pilot nào. D-1..D-15 vẫn đang chờ.

## Một bước tiếp

Coordinator: ghi WP5-UX3-AUDIT-INT PASS (reviewed_commit 8e55710, digest 507de97c), chạy commit nghiệm thu lại WP5 cùng cặp review này
và bằng chứng, làm mới định danh bản phát hành trong gói pilot, và báo chủ R-INT-1 (một câu trong docs/04) như đề xuất tùy chọn.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX3-AUDIT-INT attempt 1, timesheet-auditor, agent trên board
  `a08c43f46e599d8f4`. Tác giả của snapshot: các worker và planner của WP5 trên board (vòng 3: T01-T10, T05B, T08B, FIX1-FIX6, GOV,
  GOV2, PLAN, PLAN2, SWEEP, DIAG1; FIX4 và FIX5 `a8f4f5e3891cdacbf`, FIX6 `acf6febcfc061feee`); các reviewer của vòng 3 là A
  `a86e1ea01994c05f3`, B `a5ec67dc3fe32bb69`, A2 `a8b394d336bd441d1`, B2 `a342a5834865a6e27`, GOV `a4c120e2f4b43f612`, GOV2
  `a425d954ed94e4526`.
- Context mới; reviewer không viết thay đổi nào trong snapshot và không sửa file source, tài liệu, test, AGENTS, board hay STATE nào; chỉ
  viết cặp review này, phần Results của brief và thư mục bằng chứng.
- Digest trước và sau: `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6` (833 file) theo ba dạng cả hai lần; bằng chứng
  gate cho snapshot này: WP5-UX3-REGATE5 (PASS).
- Path report mới, giữ các review trước: `handoff/delivery/WP5_UX3_REVIEW_INT.md` và `.vi.md`; mọi review trước không đổi.
- Lỗi vi phạm quy tắc (chỉ đọc, không ảnh hưởng kết quả nào; `96-slips.txt`): chín lệnh hiển thị được pipe vào `head` hoặc `tail` và một
  lần đọc `od -c` được pipe vào `tail`; một kết quả grep bị ghi do gõ sai path vào thư mục cha của thư mục task rồi được dời vào ngay. Sửa probe (không phải
  phát hiện về sản phẩm): tiêu đề trang trên điện thoại chỉ dành cho trình đọc màn hình, nên bước nhấn bên ngoài đầu tiên chờ một phần
  tử vô hình; chia sẻ chỉ xem không có "Open a day", nên lượt chỉ xem đầu tiên chờ nó; lần kiểm tra trơ đầu tiên tính điểm dừng tiêu
  điểm của chính trình duyệt là rời modal. Mỗi lỗi đã được sửa và chạy lại (lần 2). Không đưa gì vào node hay python qua stdin, không
  heredoc, không xóa đệ quy, không kill tiến trình; harness tự chọn cổng loopback, và chỉ đặt `SMOKE_PORT` 49140. Không còn gì của audit
  này đang chạy.
