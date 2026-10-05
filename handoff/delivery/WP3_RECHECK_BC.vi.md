# Đánh giá độc lập

Bản gốc tiếng Anh: [WP3_RECHECK_BC.md](WP3_RECHECK_BC.md) (bản tiếng Anh là bản có giá trị). Brief và kết quả nhiệm vụ: [WP3-RECHECK-BC](tasks/WP3-RECHECK-BC.md). Bằng chứng: `evidence/WP3-RECHECK-BC/` (đã che, LF; probe lưu dạng `*.mjs.txt`; ảnh chụp `*-synthetic.png`); bắt đầu từ [00-commands.txt](evidence/WP3-RECHECK-BC/00-commands.txt).

- Gói/ngày/người đánh giá và model/effort quan sát được: WP3, kiểm tra lại mới (recheck) khu vực B và C sau vòng sửa 1 (các phát hiện WP3-B-01..03 và WP3-C-01..03, kèm kiểm tra hồi quy); 2026-10-05 (UTC); nhiệm vụ WP3-RECHECK-BC lần 1 (loại `audit` trên board, profile timesheet-auditor, agent `a4f9e4253ee83db68`). Model tự báo `claude-opus-5-5`; effort yêu cầu xhigh, không quan sát được. Model tác giả mạnh nhất của snapshot là opus (`claude-opus-5-5`, WP3 T01/T05/T08/T09/T13B); tác giả sửa lỗi WP3-FIXB và WP3-FIXC chạy `claude-sonnet-5-5`. Người đánh giá không yếu hơn. WP3-RECHECK-A chạy song song trong clone riêng; không dùng chung tệp, cổng hay tiến trình nào.
- Commit SHA được đánh giá và source digest chính xác; commit chưa push; độ đầy đủ của nguồn:
  - Commit được đánh giá `2f2520e1ab80ff55938b70cd469f0bfe888e04a2` (`freeze_commit` của WP3-REGATE, bằng origin/main).
  - Source digest `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 tệp, không tính handoff/), bằng digest của regate, trước và sau, trong thư mục dự án và trong clone scratch (xem mục "Identity" trong 00-commands.txt).
  - Nguồn đầy đủ: mọi lệnh chạy trong một git clone của commit đó dưới `D:\timesheet-tmp\WP3-RECHECK-BC` (ngoài Dropbox). Một clone thứ hai ở bản đóng băng trước khi sửa `a1cd566` chạy cùng các test hồi quy và probe, để cho thấy mỗi kịch bản gốc thất bại trước khi sửa.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED** (hai phát hiện mức Low).
  - Đã sửa: WP3-B-01, WP3-B-02, WP3-C-01, WP3-C-02, WP3-C-03.
  - Sửa một phần: WP3-B-03. Khoản ghi có OT mà lần nộp tự động ghi vào sổ không có người thực hiện, và trong History của chủ sở hữu vẫn hiện "by someone else" (phát hiện mới WP3-RBC-01).
  - Mới: WP3-RBC-02. Gợi ý trên màn hình Review bỏ sót một thay đổi của người được chia sẻ (grantee) thực hiện trước khi kỳ bắt đầu (ví dụ nghỉ phép đã lên kế hoạch), khi chủ sở hữu chưa chốt kỳ đó.
  - Không có hồi quy ở khu vực B hay C.
- Phạm vi thực sự đã kiểm tra/thực thi:
  1. Diff a1cd566..2f2520e: 13 tệp nguồn và 10 tệp test, đúng các đường dẫn mà WP3-FIXB và WP3-FIXC đã báo. Đã đọc: AGENTS.md, brief, WP3-AUDIT-B/C (phạm vi và kết quả), WP3_REVIEW_B/C, WP3-FIXB/FIXC cùng các quyết định ràng buộc, prompt WP3_REVIEW, các mục vòng sửa trong WP3_HANDOFF, kết quả WP3-REGATE, WP3-REQ:445-465 và 580-592, docs/05 "Deadline and recovery" và các mục trên board.
  2. Mỗi phát hiện: probe của riêng tôi trên tệp SQLite thật, chạy trên cả hai commit, cộng với các test hồi quy của bản đóng băng chạy trên mã nguồn a1cd566.
  3. Hồi quy khu vực B: job, thử lại và lần gửi không chắc chắn (với một tiến trình runner thật bị giết và một runner chạy đồng thời), giới hạn kích hoạt và F-1, ma trận ghi chú × ảnh, an toàn GET của mọi route GET, token CSS, ảnh chụp Edge trên desktop và mobile.
  4. Hồi quy khu vực C: danh mục route, 11 bộ mục × 17 route chia sẻ, kiểm tra trực tiếp, IDOR, chia sẻ lại, ranh giới quản trị, tranh chấp thu hồi (các đan xen tất định và 20 vòng đa tiến trình), ghi nhận người thực hiện, và nơi gợi ý được phép hoặc không được phép xuất hiện.
  5. Mã mới: API lỗi thời, giá trị CSS viết cứng, kế hoạch truy vấn.

## Bảng bằng chứng

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `node --version`; `git rev-parse HEAD`; digest ls-tree (dự án, rồi clone) | v24.21.0; 2f2520e; eeb417d3…48410 (721 tệp) | `00-commands.txt` |
| `npm ci` (clone; clone trước khi sửa) | exit 0; exit 0 | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 tệp / 1407 test; SMOKE PASSED, 40 dòng `PASS`; 0 dòng deprecation | `02-verify.txt` |
| 9 tệp test unit/integration đã đổi hoặc mới của bản đóng băng, chạy trên mã nguồn a1cd566 | exit 1; 23 lỗi / 140 đạt: mọi test hồi quy có tên của B-01, B-02, B-03, C-01 và C-02 đều lỗi trước khi sửa | `03-red-prefix.txt` |
| Probe B1 giới hạn tự động hóa (bản đóng băng; a1cd566) | exit 0, 27 PASS; exit 1, 19 PASS / 8 FAIL (tái hiện B-01) | `04-b1-automation.txt` |
| Probe B2 khôi phục gửi và job (bản đóng băng; a1cd566) | exit 0, 25 PASS; exit 1, 21 PASS / 4 FAIL (tái hiện B-02) | `05-b2-send-recovery.txt` |
| Probe B3 nhãn History (bản đóng băng; a1cd566) | exit 1, 8 PASS / 1 FAIL (WP3-RBC-01); exit 1, 5 PASS / 4 FAIL (tái hiện B-03) | `06-b3-history-labels.txt` |
| `npm run test:e2e` (Edge, desktop và mobile) | exit 0; 127 đạt, 5 bỏ qua, 0 lỗi (5,2 phút); 0 dòng deprecation | `07-e2e.txt` |
| Probe C1 phân quyền, ghi nhận người thực hiện, gợi ý (bản đóng băng; a1cd566) | exit 1, 84 PASS / 1 FAIL (WP3-RBC-02); exit 1, 74 PASS / 11 FAIL (tái hiện C-01 và C-02) | `08-c1-authz-hint.txt` |
| Probe C2 tranh chấp thu hồi | exit 0; 23 PASS: 20 đan xen tất định và tải PDF đều bị từ chối, không ghi gì; đối chứng không có bước kiểm tra lại thì lần ghi lọt vào; 20/20 vòng đa tiến trình với 0 lần ghi sau thu hồi | `09-c2-race.txt` |
| Probe B4 an toàn GET (mọi route GET × chủ sở hữu, grantee, quản trị, ẩn danh) | exit 0; 204 request, 1 request có ghi (lần tải PDF của grantee có audit); review có gợi ý của chủ sở hữu nằm trong số đó | `10-b4-get-safety.txt` |
| Probe B5 token CSS (bản đóng băng và a1cd566) | exit 0; 0 giá trị cứng ngoài `:root`, 0 style inline, bo góc/bóng/chuyển tiếp chỉ qua token | `11-b5-css-tokens.txt` |
| Probe B6 ma trận ghi chú × ảnh | exit 0; 30 PASS | `12-b6-note-image-matrix.txt` |
| Probe B7 kế hoạch truy vấn của các truy vấn mới | exit 0 | `13-b7-query-plans.txt` |
| Probe U1 giao diện Edge trên server đã build (desktop và mobile) | exit 1; 25 PASS / 2 FAIL (WP3-RBC-01 trên cả hai khung nhìn); 0 tràn ngang, 0 điều khiển không tên; đã xem 10 ảnh | `14-u1-ui.txt`, `recheck-bc-*-synthetic.png` |
| Các tệp test tranh chấp và hồi quy × 5 vòng tiến trình mới | exit 0 ở mỗi vòng; 8 tệp / 126 test mỗi vòng (deadline-race, delivery-crash, jobs-restart, delivery, deadline, history, review-grantee-changes, sharing) | `15-race-rounds.txt` |
| Danh tính sau; kiểm tra quyền riêng tư trên index tạm | xem tệp | `16-digest-after.txt`, `17-privacy.txt` |

## Xử lý các phát hiện

| Phát hiện | Kết luận | Bằng chứng |
|---|---|---|
| WP3-B-01 (Medium) | **Đã sửa.** Một tài khoản tạo ngày 2026-11-12, sau khi kích hoạt, chưa từng lưu cài đặt, không bị tạo bản sửa đổi tự động nào cho ba kỳ đã quá hạn (a1cd566: 10-16, 10-30 và 11-13). Nó cũng không có dòng timesheet, bản ghi quá hạn hay job nào. Hạn đầu tiên sau khi tạo (kỳ lương 11-27) được tự động hóa với 14 ngày nhãn mặc định (F-1). Một tài khoản tạo giữa một kỳ được tự động hóa tại hạn của chính kỳ đó. Các tài khoản tạo trước khi kích hoạt vẫn nhận F-1 (một bản sửa đổi, 14 ngày, không OT, không thiếu giờ, không dòng sổ) cho hạn đầu tiên sau kích hoạt, và không có gì cho hạn trước đó. Bốn múi giờ thiết bị cho kết quả giống hệt. 4 test hồi quy lỗi trên a1cd566 và đạt trên bản đóng băng. | `04`, `03` |
| WP3-B-02 (Low) | **Đã sửa.** Một tiến trình runner thật bị giết sau khi `sending` đã được commit ở lần thử thứ năm (lần cuối). Khi lease còn hiệu lực thì không có gì thay đổi. Một lượt chạy sau khi hết hạn: lần thử thành `uncertain` (`lease_expired_while_sending`), chủ sở hữu thấy lời nhắc quyết định, và một lần gửi lại thông thường bị từ chối với `delivery_uncertain` (a1cd566: vẫn `sending`, không có lời nhắc, `delivery_in_progress`). 6 giờ các lượt chạy không ghi nhận bản gửi nào. Một quyết định gửi đúng một lần; quyết định thứ hai bị 409; audit một lần; một bản sửa đổi. Test hồi quy lỗi trên a1cd566. | `05`, `03` |
| WP3-B-03 (Low) | **Sửa một phần.** Mã thô đã hết, và `timesheet.auto_finalize` cùng `deadline.overdue` hiện "automatic". Nhưng `ot_ledger.credit` không có người thực hiện, do lần nộp tự động ghi, vẫn hiện "OT credit posted [by someone else]" (API, model phía client và Edge trên desktop lẫn mobile). Xem WP3-RBC-01. | `06`, `14`, `recheck-bc-history-ot-credit-*-synthetic.png` |
| WP3-C-01 (Medium) | **Đã sửa, kèm WP3-RBC-02.** Review của chủ sở hữu liệt kê đúng các ngày có thay đổi cuối cùng đến qua chia sẻ, đối chiếu với oracle riêng của tôi trên các dòng audit. Một thay đổi của chủ sở hữu giành lại ngày đó. Sau khi chủ sở hữu ký chỉ các thay đổi sau đó của grantee được tính. Lần nộp tự động không đặt lại cửa sổ. Gợi ý không có dưới `/api/shared` (404), với chủ sở hữu B, trong review riêng của grantee (chỉ nêu grantee của chính grantee) và trong cả 5 GET quản trị. Nó không thay đổi dòng nào. Hash: `payload_hash` hiển thị bằng hash chuẩn hóa của payload. Trên một bản sao cơ sở dữ liệu mà các dòng audit của grantee được gán lại cho chủ sở hữu (cùng nội dung, ẩn gợi ý), hash giống hệt. Ký khi gợi ý đang hiện lưu reviewed = payload = hash hiển thị, và snapshot không chứa tên grantee. Hiển thị và có tên trên desktop và mobile; token E-8 (bo góc 4 px, viền `--rule`, bóng panel). | `08`, `14`, ảnh chụp |
| WP3-C-02 (Low) | **Đã sửa.** Các trường hợp sau vẫn không được ghi tên: một lần thu hồi qua route quản trị của quản trị viên cũng đang giữ một chia sẻ, một hành động quản trị cùng giây trước một lần cấp sau đó, và một grantee rời chia sẻ. Trên a1cd566 cả ba lần thu hồi của quản trị viên đều bị ghi tên "Example Admin". Tải xuống hiện "Downloaded by …", chỉnh sửa hiện "Changed by …". Cả 26 dòng được ghi tên đều là lần ghi của grantee qua `/api/shared`. | `08`, `03` |
| WP3-C-03 (Info) | **Đã sửa.** Chú thích `AppEnv` trong `src/server/types.ts` mô tả `requireShare`. | diff |

## Phát hiện

| ID | Mức | Tệp/hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc/AC | Cách sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP3-RBC-01 | Low | `src/client/components/sharingModel.ts:177` (`SYSTEM_OPERATIONS`, dùng bởi `historyActorBadge` và `HistoryScreen.tsx:21`); các khoản ghi sổ không có người thực hiện tại `src/server/services/finalization.ts:627` và `:650` | Probe B3 / U1: một nhân viên bật tự động nộp và có một phiên OT ngày thứ Bảy; kích hoạt; lượt chạy tại hạn nộp tự động và ghi có 180 phút với `actor_user_id` NULL. `GET /api/history` → History hiện "OT credit posted [by someone else]" (`data-history-actor="other"`). Một khoản trừ thiếu giờ tự động đã được phép đi cùng đường đó. | Kỳ vọng (quyết định điều phối B-03: "label system events as system events, never as 'someone else'"; WP3_REVIEW_B B-03 "label actor-less events as an automatic system action"): automatic. Thực tế: chỉ ba mã thao tác liệt kê tay được coi là sự kiện hệ thống | docs/04 Screens, F-Q2, WP3-B-03 | Xác định "hệ thống" từ chính sự kiện, không từ danh sách. Ví dụ server gửi `actor_is_system: true` khi `actor_user_id` IS NULL (không có định danh nào rời server), và `historyActorBadge` dùng nó. Thêm test: một lần nộp tự động có ghi có OT (và một khoản trừ thiếu giờ đã được phép) hiện "automatic". |
| WP3-RBC-02 | Low | `src/server/services/sharedActs.ts:91-94` (`granteeChangesForReview`, cửa sổ `occurred_at >= đầu kỳ` khi chủ sở hữu chưa chốt) | Probe C1 §11: ngày 2026-10-05 một grantee ghi Vacation cho 2026-10-20 (kỳ 2026-10-12..10-25, chưa bắt đầu); ngày 10-14 nó sửa 10-13. Ngày 10-26 chủ sở hữu mở Review kỳ 2026-10-30. Gợi ý ghi "1 day last changed by Synthetic Grantee" (chỉ 10-13), dù cả hai ngày đều do grantee sửa sau cùng. | Kỳ vọng (mục đích của gợi ý, giảm thiểu "fabricated attestation" ở WP3-REQ G): mọi ngày của kỳ có thay đổi cuối cùng qua chia sẻ kể từ lần chốt trước của chủ sở hữu. Thực tế: thay đổi trước ngày đầu kỳ bị bỏ, dù bộ lọc ngày làm việc đã giới hạn các dòng trong kỳ. Điều này khớp câu chữ của quyết định điều phối ("since the period started"), nên điều phối viên cần hoặc sửa hoặc chấp nhận rõ ràng khoảng hở này. | WP3-REQ C/G, quyết định điều phối C-01 | Khi chủ sở hữu chưa chốt lần nào thì không dùng cận dưới thời gian: ngày làm việc của kỳ đã giới hạn các dòng. Hoặc ghi một quyết định điều phối chấp nhận khoảng hở. Thêm test: một thay đổi của grantee trước ngày đầu kỳ được liệt kê. |

Không quan sát thấy lỗi nào khác.

## Nhận định theo yêu cầu của brief

- **Mục 5, "claimed 0" trong `delivery-crash.test.ts`.** Nó phản ánh đúng thứ tự mới. Bước khôi phục giờ chạy ở đầu mọi lượt có handler gửi, trước mọi lần claim. Các khẳng định kết quả (uncertain, `lease_expired_while_sending`, job ở intervention `delivery_uncertain`, sau đó không gửi gì, một lần gửi lại sau quyết định) không đổi và vẫn đạt. Khẳng định đã đổi lỗi trên a1cd566 (claimed 1, intervention 1). Có một mất mát nhỏ: nhánh `sending` của chính handler (`sendJob.ts:228-232`) không còn được test này chạm tới. Probe B2 §3b của tôi chạy nhánh đó (job được claim lại bị đánh dấu uncertain và dừng hẳn, không gửi gì). Tùy chọn: một unit test trực tiếp.
- **Mục 5, trường hợp biên còn lại.** Chấp nhận được. Probe B2 §3a tái hiện: lease hết hạn sau bước khôi phục đầu lượt và trước lượt quét claim. Job sang intervention `lease_expired` và lần thử vẫn `sending`. Cho đến lượt kế tiếp (chu kỳ mặc định 15 s) chủ sở hữu thấy "Sending", và một lần gửi lại thông thường trả 409 `delivery_in_progress`. Lượt thông thường kế tiếp chuyển nó thành `uncertain` kèm lời nhắc, và một quyết định gửi đúng một lần. Không bao giờ tự gửi lại. Thuần hiển thị: job giữ `last_error = lease_expired`, không phải `delivery_uncertain`.
- **Mục 5, giới hạn ngày tạo tài khoản kẹp cả cài đặt đã lưu.** Đúng và cần thiết. Trên a1cd566, lựa chọn tường minh "áp dụng cho bản nháp đã quá hạn" của một tài khoản tạo ngày 2026-12-12 đã nộp mọi kỳ kể từ khi kích hoạt (10-16 đến 12-11): năm kỳ trước khi tài khoản tồn tại, phần lớn là kỳ trống (B1 §4). Câu đầu của quyết định ("must never finalize a period whose deadline passed before the user's account existed") được ưu tiên hơn "giữ hành vi hiện tại". Các lần lưu thông thường giữ thời điểm của chính chúng (≥ ngày tạo, có khẳng định trong test). Lựa chọn tường minh vẫn nộp một kỳ quá hạn có hạn sau ngày tạo. docs/05 chưa ghi giới hạn này (rủi ro R5).
- **Mục 6, `SHARED_ACT_OPERATIONS` thay cho đường dẫn hoặc cờ được ghi lại.** Nó đạt kết quả của quyết định tại snapshot này:
  - Đọc mã: chỉ `timesheetCommands.audit()` (`ctx.actor`, chỉ tách khỏi subject bởi `requireShare`) và route PDF chia sẻ ghi các mã này với người thực hiện khác chủ sở hữu. Seed và CLI ghi chúng với actor = chủ sở hữu.
  - Probe C1 §8: cả 26 dòng được ghi tên đều là lần ghi của grantee qua `/api/shared`. Các trường hợp route quản trị, cùng giây, rời chia sẻ và `user.*` vẫn không được ghi tên.

  Đây là suy luận, không phải dấu ghi lại mà quyết định đã nêu. Test chống trôi được viết tay, có năm route và chỉ kiểm một chiều. Nó không lấy danh sách route từ `SHARED_ROUTES`, và không bắt được một route không chia sẻ trong tương lai ghi `day_entry.*`/`work_session.*` thay cho người khác (ví dụ nhập dữ liệu hoặc chỉnh sửa của quản trị viên ở WP4). Nhận định: đủ cho WP3; chưa cần dấu ghi lại ngay. Dấu ghi lại, hoặc ít nhất một bộ chặn chiều ngược, trở thành bắt buộc trước khi có đường ghi không chia sẻ nào được ghi các mã đó cho người khác (rủi ro R1).
- **Mục 6, grantee rời chia sẻ không còn được nêu tên.** Điều này nhất quán với WP3-REQ:455-457. Việc rời là hành động riêng của grantee trên bản ghi chia sẻ qua `/api/shares`, không phải sự kiện "performed under a grant", và "events by anyone else stay unattributed". Nó cũng theo quyết định C-02. Chủ sở hữu vẫn thấy chia sẻ biến mất khỏi danh sách, và bảng trường của History hiện `revoked_by_role: grantee`. Chấp nhận được; tùy chọn dùng cách diễn đạt theo vai trò (R8).
- **Mục 6, test cửa sổ thời gian bị thay.** Không mất độ phủ đáng kể nào. Test cũ chèn một dòng tổng hợp sau khi chia sẻ kết thúc, để kiểm quy tắc cửa sổ mà quyết định nay cấm. Một lần ghi thật sau thu hồi bị chặn từ trước bởi kiểm tra trực tiếp và bước kiểm tra lại trong transaction (C2: 20/20 vòng, 0 lần ghi sau thu hồi; đối chứng chứng minh khe hở là có thật). Các test mới phủ route quản trị, cùng giây, rời chia sẻ và năm route ghi.

## Hồi quy

- Khu vực B: không có.
  - Thời gian thử lại là 60/300/900/3600 s, rồi đến lần thử thứ năm.
  - Lần thử `sending` đang chạy của một runner sống không bị bước khôi phục đầu lượt của runner khác đụng tới, và hoàn tất `accepted`.
  - Kích hoạt trong quá khứ bị từ chối. Không tự động hóa gì 30 s trước hạn. Mỗi kỳ một bản sửa đổi.
  - F-1 đúng với các tài khoản tạo trước khi kích hoạt.
  - Ma trận 2×2 ghi chú × ảnh cho số ảnh 0/0/1/1, ghi chú chỉ khi bật, `{SignOffStatus}` là "Submitted" hoặc văn bản ghi chú, và không có dấu hiệu tự động nào khác.
  - An toàn GET: 204 request, chỉ lần tải PDF có audit của grantee là có ghi.
  - Chỉ dùng token; 0 tràn ngang và 0 điều khiển không tên trên desktop và mobile.
  - e2e 127 đạt, 5 bỏ qua.
- Khu vực C: không có.
  - 88 mục (method, path) như ở a1cd566; đúng 17 route chia sẻ, và route review không nằm trong số đó.
  - 11 bộ mục × 17 route đúng như kỳ vọng. Người lạ và quản trị viên 404, ẩn danh 401, `no-store`.
  - Thu hồi, rời, thu hồi của quản trị, đổi phạm vi và vô hiệu hóa đều có hiệu lực ở request kế tiếp. IDOR 404. Không chia sẻ lại. Quản trị viên không thể tạo chia sẻ. Danh sách quản trị chỉ có các trường được cho phép.
  - Không có `grantee_changes`, bí mật hay địa chỉ email trong phản hồi chia sẻ.
  - Tranh chấp 20/20.

## Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

- R1: suy luận `SHARED_ACT_OPERATIONS` (xem mục 6). Trước khi WP4 thêm nhập dữ liệu hoặc chỉnh sửa của quản trị viên trên dòng ngày hoặc phiên, hãy ghi một dấu trên các dòng audit được ghi qua `/api/shared`, hoặc thêm một bộ chặn chiều ngược. Lấy danh sách route của test chống trôi từ `SHARED_ROUTES`.
- R2: trường hợp biên còn lại của B-02 (xem mục 5), tối đa một chu kỳ runner.
- R3: nhánh `sending` của handler không còn test trực tiếp.
- R4: các tài khoản chưa từng cấu hình, tạo trước khi kích hoạt (admin của seed, một nhân viên seed), bị nộp tự động mỗi kỳ và lỗi `recipient_missing` (B1 §6). Đây là rủi ro R3 của audit A; điều phối viên giữ mặc định, và quyết định của chủ dự án còn chờ.
- R5: docs/05 "Deadline and recovery" chưa ghi giới hạn ngày tạo tài khoản (việc bổ sung tài liệu mà WP3-FIXB đã nêu). Cần thêm ở cả EN và VI.
- R6: chi phí truy vấn. Gợi ý đọc mọi dòng audit của chủ sở hữu qua `audit_events_owner`. Truy vấn tìm lần chốt đọc mọi dòng audit `timesheet_revision` của mọi người dùng qua `audit_events_entity`. Cả hai bị giới hạn theo kích thước dữ liệu, không theo request, và ổn ở quy mô này. Tùy chọn: thêm bộ lọc theo chủ sở hữu.
- R7: gợi ý chỉ hiện số ngày, không liệt kê các ngày (`work_dates` có được gửi nhưng không hiển thị). Tùy chọn.
- R8: tùy chọn diễn đạt `share.revoke` trong History theo vai trò ("do người được chia sẻ kết thúc" / "do quản trị viên"), không nêu tên.

## Các cổng bắt buộc chưa chạy/bị chặn và lý do

- SMTP thật, triển khai NAS và kích hoạt production: bị cấm trước khi chủ dự án cho phép thí điểm.
- `validate_package.py --preflight` không do nhiệm vụ này chạy (WP3-REGATE đã chạy, exit 0). Không có dòng recheck bắt buộc nào bị bỏ.

## Xử lý các phát hiện trước

WP3-B-01, WP3-B-02, WP3-C-01, WP3-C-02 và WP3-C-03 đã được sửa. WP3-B-03 được sửa một phần (WP3-RBC-01). WP3-RBC-02 là mới. PASS của WP3-REGATE, các báo cáo sửa lỗi và các dòng HANDOFF được coi là tuyên bố và đã chạy lại: verify (62 tệp / 1407 test, 40 dòng smoke `PASS`) và e2e tái lập được.

## Mức sẵn sàng phần mềm, sự cho phép của chủ dự án và kết quả thí điểm

- Mức sẵn sàng phần mềm (khu vực B và C): chưa được chấp nhận cho đến khi WP3-RBC-01 và WP3-RBC-02 được sửa (hoặc RBC-02 được chấp nhận bằng quyết định) và được kiểm tra lại.
- Sự cho phép của chủ dự án cho gửi thật hoặc kích hoạt: chưa yêu cầu, chưa có. Kết quả thí điểm: không có.

## Một hành động kế tiếp

Điều phối viên giao một nhiệm vụ sửa có giới hạn cho WP3-RBC-01, và cho WP3-RBC-02 hoặc một quyết định ghi lại việc chấp nhận nó, theo [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md). Sau đó là đóng băng, cổng kiểm tra và một lần recheck B/C mới ở digest mới.

Không bịa phát hiện hay kết quả đạt chưa quan sát. Một đánh giá một phần không phải là chấp nhận toàn bộ.

## Nguồn gốc subagent độc lập

- Nhiệm vụ/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá: WP3-RECHECK-BC lần 1, agent `a4f9e4253ee83db68`. Tác giả sửa lỗi được đánh giá: WP3-FIXB `a733c2b6b34235750` và WP3-FIXC `a3cd9ff3fef21b47a` (sonnet); người commit WP3-FIX-FREEZE `a53d1c0a0a86519c5`; người xác minh WP3-REGATE `a1ae9d6bf43d5d60f`; cùng các tác giả WP3 trên board.
- Ngữ cảnh mới; xác nhận người đánh giá không là tác giả thay đổi: ngữ cảnh mới. Người đánh giá này không là tác giả của bất kỳ thay đổi nào trong WP3, kể cả các bản sửa. Nó chỉ ghi cặp báo cáo này, mục Results trong brief của mình và `evidence/WP3-RECHECK-BC/`. Chỉnh sửa chỉ trong scratch: các tệp test của bản đóng băng được checkout vào clone scratch a1cd566 cho lượt chạy đỏ.
- Source digest trước/sau; bằng chứng cổng kiểm tra cho snapshot đó: `eeb417d3…48410` trước và sau; bằng chứng WP3-REGATE thuộc cùng commit và digest.
- Đường dẫn báo cáo mới, giữ nguyên lịch sử đánh giá trước: `handoff/delivery/WP3_RECHECK_BC.md` và `.vi.md` (mới); WP3_REVIEW_B/C không bị đụng tới.
- Xử lý phát hiện và nhiệm vụ sửa/recheck kế tiếp của điều phối viên: như trên; một nhiệm vụ sửa có giới hạn (RBC-01, RBC-02 hoặc một quyết định), rồi một lần recheck B/C mới.
