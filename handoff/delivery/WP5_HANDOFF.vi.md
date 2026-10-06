# Bàn giao WP5 — Nghiệm thu độc lập và chuẩn bị pilot

Hoàn thành từ [HANDOFF](../templates/HANDOFF.vi.md). Bản gốc: [WP5_HANDOFF.md](WP5_HANDOFF.md). Các mục tới "Nguồn gốc điều phối" là ảnh chụp WP5-REL trước cổng kiểm cuối gói; chỗ nào khác biên bản nghiệm thu ở cuối thì biên bản thắng. Biên bản nghiệm thu do WP5-ACCREC điền (chỉ ghi hồ sơ, không sửa mã nguồn) sau khi WP5-RECHECK đạt. Không số liệu nào được chạy lại để viết nó; mọi số liệu lấy từ bảng, ghi chú cổng kiểm và các file review.

## Biên bản bàn giao

- **Giai đoạn/phạm vi, ngày, người làm:** chỉ WP5, theo [WP5-PLAN](tasks/WP5-PLAN.md), [WP5_IMPLEMENT](../prompts/WP5_IMPLEMENT.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md). Ảnh chụp ngày 2026-10-06, do tác vụ WP5-REL viết ([brief](tasks/WP5-REL.md)).
- **Model/effort/tốc độ thật, hoặc không quan sát được:** WP5-REL: tự báo `claude-sonnet-5-5` (profile timesheet-worker); effort và tốc độ không quan sát được từ trong phiên. Các tác vụ khác tự báo trong brief của chúng.
- **Commit SHA, source digest và commit chưa push, hoặc source archive đủ:**
  - Cơ sở của WP5-REL: commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` (WP5-AC13-FREEZE), bằng `origin/main`, digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` trên 777 file (không tính `handoff/`).
  - WP5-REL đã được đóng băng thành `74d5bfec6700126da4105b5d97f5efe943f896f5` (digest `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 file). Nguồn được chấp nhận là bản sau: commit `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61`, 779 file (xem biên bản nghiệm thu).
  - Các commit của bản ứng viên đã chấp nhận: WP1 đến WP4 được chấp nhận tại `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 file); biên bản chấp nhận WP4 `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`.
- **Trạng thái triển khai; trạng thái review độc lập:**
  - Xong và đã đóng băng tại thời điểm ảnh chụp: đánh giá độc lập (khu vực A PASS, khu vực B FIX REQUIRED với B-01 Trung bình và B-02 Nhẹ, cả hai về tài liệu), bản sửa sổ tay WP5-FIXB (commit `85838b515a86b3cca40cfbba189ba290ec06de58`) và test AC-13 tích hợp WP5-AC13 (commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741`).
  - Sau đó: WP5-REL được đóng băng, qua cổng kiểm (WP5-GATE, WP5-REGATE, WP5-REGATE2 PASS), audit cuối và recheck (WP5-RECHECK PASS). Xem biên bản nghiệm thu.
- **Hành vi đã làm và file đổi:**
  - WP5-FIXB (`85838b5`): `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` (ràng buộc Compose, tag image theo release và bản sao file env), một chú thích trong `.env.example` và một trong `compose.example.yaml`.
  - WP5-AC13 (`8e99d2c`): `tests/integration/ac13-two-week.test.ts` và `tests/integration/ac13-support.ts`; không đổi mã nguồn ứng dụng.
  - WP5-REL (ảnh chụp này, chỉ tài liệu): `docs/12_RELEASE_NOTES.md` và `.vi.md` mới; `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` (mục 13 đến 16, các chỗ giữ chỗ mới, các dòng bảng ánh xạ lệnh); một dòng liên kết trong `README.md` và `README.vi.md`; cặp bàn giao này. Không đổi mã nguồn ứng dụng, test, hành vi Compose hay migration.
- **Migration/tương thích schema:** WP5 không đổi. Schema mới nhất là 13 (migration 0007 đến 0013 là của WP4; xem [bàn giao WP4](WP4_HANDOFF.vi.md)).
- **Hợp đồng chuẩn đổi và lý do, hoặc không:** không. `docs/11` có thêm mục 13 đến 16 làm phần sổ tay mà [11](../../docs/11_OPERATIONS_RUNBOOK.vi.md) đã hoãn cho pilot; không quy tắc nào của docs/01 đến 10 đổi.
- **Bảng kiểm:**

  | Lệnh | Môi trường | Exit status | Kết quả | Path bằng chứng |
  |---|---|---|---|---|
  | Đánh giá khu vực A: export sạch của `546cdda`, probe quy trình tích hợp | Node 24.21.0, chế độ capture, dữ liệu tổng hợp | không nhắc lại | PASS: 77 trên 77 kiểm tra, instance lỗi 12 trên 12 | `evidence/WP5-ASSESS-A/` |
  | Đánh giá khu vực B: phát hành tái lập được, drill stage 1 đến 6, restore độc lập | Docker Desktop, linux/amd64, dữ liệu tổng hợp | không nhắc lại | phát hiện WP5-B-01 (Trung bình) và WP5-B-02 (Nhẹ), cả hai về tài liệu | `evidence/WP5-ASSESS-B/` |
  | WP5-AC13 `npm run verify` | Node 24.21.0 | 0 | 77 file test, 1.759 test, smoke đạt | `evidence/WP5-AC13/verify.txt` |
  | Các kiểm tra WP5-REL | Node 24.21.0 | xem brief WP5-REL | đối chiếu EN/VI, kiểm tra khóa env, verify, precommit, preflight, digest | `evidence/WP5-REL/` |

  Số liệu chính xác nằm trong bằng chứng đã nêu. Số liệu cuối nằm trong biên bản nghiệm thu.
- **ID AC bao phủ; phần chưa chạy/bị chặn thật:**
  - AC-13 có test tích hợp (WP5-AC13) và probe độc lập (khu vực A). AC-14 và AC-15 được bao phủ ở chế độ capture, bằng drill WP4 và restore khu vực B.
  - Chưa chạy: SMTP thật (lời nhắc lặp lại, lỗi chứng chỉ, gửi trước khi có PDF), đích NAS (CHƯA ĐƯỢC KIỂM CHỨNG), kỳ pilot thật của chủ sở hữu, và các bước mục 13 đến 16 của sổ tay (viết từ code; không stage drill nào bao phủ).
- **Ảnh/PDF/capture giả:** các ảnh render PDF `*-synthetic.png` và danh sách capture đã che nằm trong `evidence/WP5-ASSESS-A/`. Mẫu email và PDF chính xác của pilot thuộc WP5-PILOT và chưa tồn tại.
- **Lỗi đã sửa, lỗi còn và backlog tùy chọn:**
  - Đã sửa: WP5-B-01 (Trung bình, ràng buộc Compose) và WP5-B-02 (Nhẹ, file env được giữ cùng backup ngoài thiết bị) bằng WP5-FIXB; WP5-FINAL-AUDIT xác nhận cả hai đã giải quyết.
  - Rủi ro đưa vào ghi chú phát hành ([12 Ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md)): R-WA1 đến R-WA3 và R-WA8, R-B5-1, R-B5-2, R-B5-4, và các mục liên quan pilot ở [WP5-PLAN](tasks/WP5-PLAN.md) mục F.
  - Backlog quản trị trước trạng thái mission `software_ready`: GOV-RECOVERY (`check_recovery.py` độc lập với trạng thái sống).
- **Đầu vào setup cần chủ cung cấp, không secret:** model NAS, phiên bản DSM và `uname -m`; đường dẫn dữ liệu và backup; UID và GID; tên máy chủ HTTPS và địa chỉ proxy; nhà cung cấp và chế độ SMTP cùng địa chỉ người gửi; địa chỉ người nhận ở bộ phận lương và địa chỉ của chính chủ sở hữu cho lần gửi đầu; danh sách ngày lễ công ty 2027; số dư mở đầu có bằng chứng, nếu có. Giá trị thật nằm trong bản riêng của chủ sở hữu, ngoài git.
- **Quyết định đang mở của chủ sở hữu (tất cả đang chờ; mỗi cái là khuyến nghị, không cái nào đã quyết):** bảng đầy đủ ở [WP5-PLAN](tasks/WP5-PLAN.md) mục D.

  | ID | Phương án khuyến nghị (owner decision pending) |
  |---|---|
  | D-1 (R-A3) | Giữ quy tắc: bản build cũ chạy với `JOB_RUNNER=off` cho tới khi đối soát |
  | D-2 (WP4-I-1) | Kỳ nháp không bao giờ nhận ngày nhập (hiện tại) |
  | D-3 (WP4-I-2) | Nhập "Off day (overtime used)" thành Off không ảnh hưởng sổ cái, nếu nhập lịch sử trước pilot; nếu không thì giữ bỏ qua |
  | D-4 (WP4-I-3) | Kỳ chưa kết thúc không được nhập (hiện tại) |
  | D-5 (WP4-I-4) | Cho phép hiệu chỉnh có lý do số dư mở đầu về net bằng 0, nếu có ghi một số dư |
  | D-6 (WP4-I-5) | Hạn mức 20 bản xem trước chưa commit mỗi người, sau pilot (trước đó nếu đưa người khác vào) |
  | D-7 (WP3 carry 1) | Chấp nhận lời nhắc ít nhất một lần sau sự cố ở SMTP thật |
  | D-8 (WP3 carry 2) | Xếp lỗi chứng chỉ TLS là lỗi cấu hình vĩnh viễn (tùy đánh giá) |
  | D-9 (E-11) | Pilot chỉ của chủ sở hữu, mật khẩu tạm đặt ngoài kênh; có route đổi mật khẩu trước khi thêm người khác |
  | D-10 | Một số dư mở đầu có bằng chứng hoặc 0; không nhập lịch sử cho pilot |
  | D-11 | Tài liệu được theo dõi chỉ giữ các chỗ giữ chỗ; giá trị thật ở bản riêng của chủ sở hữu |
  | D-12 | Kỳ đầu theo giai đoạn: ký tay, lần gửi thật đầu tới địa chỉ của chính chủ sở hữu, tắt tự động nộp, không thời điểm kích hoạt; bật tự động từ kỳ sau |
  | D-13 | NAS giữ trạng thái CHƯA ĐƯỢC KIỂM CHỨNG cho tới khi chủ sở hữu đánh dấu danh sách docs/11 |
  | D-14 | Tuyên bố bản phát hành đầu tiên khi chủ sở hữu cho phép pilot; sau đó sửa lỗi đi qua nhánh và pull request; agent không tạo tag |
  | D-15 (F-Q6) | Giữ nguyên việc đã bỏ số đếm của bản xem trước ngày lễ |
- **Thao tác production và phép rõ, thường không:** không. Không triển khai, không email thật, không dữ liệu thật. `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt và thời điểm kích hoạt trống. Phép của chủ sở hữu chưa được xin và chưa được cấp.
- **Usage/credits chỉ khi quan sát thật:** không quan sát được trong phiên này.
- **Một bước tiếp và prompt tương ứng:** coordinator ghi WP5-ACCEPT trên `014bd47` / `150420e7…`, cho commit các thay đổi packet chưa commit, rồi xin chủ sở hữu các câu trả lời D-1 đến D-15 và phép pilot cùng gói pilot ([WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md)); GOV-RECOVERY còn lại trước trạng thái mission `software_ready`.

## Nguồn gốc điều phối

- **Mission/task ID và bảng/checkpoint:** mission `timesheet-software-readiness`, gói WP5; các tác vụ WP5-PLAN, WP5-ASSESS-A, WP5-ASSESS-B, WP5-FIXB, WP5-FIXB-FREEZE, WP5-AC13, WP5-AC13-FREEZE và WP5-REL tại ảnh chụp (các tác vụ sau nằm trong biên bản nghiệm thu). Bảng: [ORCHESTRATION.json](ORCHESTRATION.json); checkpoint: [WORKFLOW_REVISION_CHECKPOINT.vi.md](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- **Định danh implementer/auditor độc lập; context riêng:** mỗi tác vụ chạy trong context subagent riêng. Hai auditor đánh giá không viết thay đổi nào. Audit cuối phải là một context mới chưa viết thay đổi WP5 nào, kể cả cái này.
- **Digest đã kiểm/review hiện tại; report/verdict:** [WP5_RECHECK](WP5_RECHECK.vi.md): PASS trên `014bd47a8d906c944d2781eba4f2b91c5a532419`, digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 file). Các review trước nằm trong biên bản nghiệm thu.
- **Task/dependency còn; một bước coordinator tiếp:** WP5-ACCEPT, rồi GOV-RECOVERY. Bước coordinator tiếp: ghi WP5-ACCEPT, rồi hỏi chủ sở hữu.
- **Tách sẵn sàng phần mềm và phép pilot của chủ đang chờ:** sẵn sàng phần mềm của WP5: đã chấp nhận (NAS CHƯA ĐƯỢC KIỂM CHỨNG). Phép pilot của chủ sở hữu: chưa xin và chưa cấp. Kết quả pilot: chưa có.

## Biên bản nghiệm thu (WP5-ACCEPT)

Do WP5-ACCREC chuẩn bị (chỉ ghi hồ sơ, không sửa mã nguồn). Các mục phía trên là ảnh chụp WP5-REL và bị biên bản này thay thế khi khác nhau (ví dụ digest, các câu "chưa qua cổng kiểm" và các phát hiện còn mở). Nguồn: các tác vụ trên bảng WP5-PLAN đến WP5-RECHECK (`decision`, `findings`, `notes`, `gate_notes`, `history`), `pending_owner_question`, `owner_decisions` và `runtime_observations`, các brief tác vụ cùng Kết quả của chúng, và các báo cáo [WP5_REVIEW_A](WP5_REVIEW_A.vi.md), [WP5_REVIEW_B](WP5_REVIEW_B.vi.md), [WP5_REVIEW_A2](WP5_REVIEW_A2.vi.md), [WP5_REVIEW_FINAL](WP5_REVIEW_FINAL.vi.md) và [WP5_RECHECK](WP5_RECHECK.vi.md). Không số liệu nào được chạy lại. Kết quả được báo cáo không phải bằng chứng độc lập; bằng chứng độc lập là các audit liệt kê dưới đây.

- **Nguồn được chấp nhận:** commit `014bd47a8d906c944d2781eba4f2b91c5a532419` (WP5-FIXD2-FREEZE, đã push; bằng `origin/main`), source digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` trên 779 file, không tính `handoff/` (WP5-REGATE2 PASS; WP5-RECHECK PASS trên cùng commit và digest; repository, dạng `git ls-tree` và bản export `git archive` sạch khớp nhau). Số liệu cuối:
  - WP5-REGATE2 trên `014bd47`: `npm ci` exit 0, lockfile không đổi, không dòng deprecation; lint exit 0; `npm run verify` exit 0 với 77 file, 1.759 test và smoke đạt; `npm audit --omit=dev` 0 lỗ hổng; `validate_package.py --preflight`, bộ kiểm điều phối và `check_recovery.py` exit 0/0/0;
  - WP5-REGATE (cổng đầy đủ) trên `9bcdd88`: 77 file, 1.759 test, smoke đạt; e2e 145 đạt và 5 bỏ qua; drill stage 1 đến 6 với `--wp3`, 208 `PASS` và 0 `FAIL` (33/31/57/35/27/23), image `sha256:bd17d061…` (110.002.055 byte), quét file bị cấm đạt; `docker compose config` cho dạng live, restored và rollback, exit 0 ba lần;
  - WP5-REGATE2 không lặp drill và e2e: phần chênh từ `9bcdd88` là một dòng trong mỗi file `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` của nó, và mọi file không phải tài liệu giống hệt từng byte, nên kết quả 208 và 145 được mang sang;
  - WP5-RECHECK, độc lập, trên bản export sạch của `014bd47`: `npm run verify` exit 0 (1.759 test, smoke đạt); AC-13 chạy riêng exit 0; probe máy chủ đã build 27 `PASS`, 0 `FAIL`;
  - Nhận dạng `dist/`: 230 file, 4.044.281 byte, giống hệt từng byte giữa `9bcdd88` và `014bd47` (WP5-REGATE2) và giữa `74d5bfe` và `014bd47` (WP5-RECHECK); WP5-FINAL-AUDIT thấy nó cũng bằng bản build `546cdda`;
  - NAS CHƯA ĐƯỢC KIỂM CHỨNG; SMTP thật chưa từng được chạy (`PRODUCTION_SENDING_ENABLED` không bao giờ được đặt).
- **AC-13** (kịch bản tích hợp hai tuần):
  - Lần chạy tích hợp: WP5-ASSESS-A lần 1 trên `546cdda`, một instance dạng pilot ở chế độ production với mail capture và năm người dùng tổng hợp: lần chạy probe ghi nhận là 12 cho 77 `PASS` và 0 `FAIL`, và probe lỗi lần ghi nhận là 3 cho 12 `PASS` và 0 `FAIL`. Lần 2 trên `74d5bfe` chạy lại probe máy chủ đã build (26 `PASS`, 0 `FAIL`, lần 2 là lần ghi nhận; lần 1 có lỗi ở probe).
  - Test đã commit: WP5-AC13 (`8e99d2c`), `tests/integration/ac13-two-week.test.ts` và `tests/integration/ac13-support.ts`, một test tất định, không đổi mã nguồn ứng dụng. Nó bao phủ 14 ngày, tổng được tính 8:30 và một lần ghi sổ cái, khởi động lại quanh lúc gửi mà không gửi mù, một hiệu chỉnh (revision 2, chỉ +30), một lần chi tiêu kép đồng thời bị từ chối, cô lập người dùng thứ hai (11 định danh bị hoán đổi) và đường quá hạn.
  - Các lần chạy lặp: WP5-AC13 ba lần, 1.705, 1.739 và 1.754 ms, đều exit 0; WP5-GATE ba lần, 4,08, 4,07 và 4,13 s; WP5-REGATE ba lần, 3,00, 2,91 và 2,97 s; WP5-ASSESS-A lần 2 ba lần cùng bốn múi giờ máy và hai đồng hồ treo tường dời; WP5-FINAL-AUDIT hai lần cùng `TZ=Asia/Tokyo`; WP5-REGATE2 và WP5-RECHECK mỗi bên một lần. Tất cả đạt.
  - Múi giờ thật: WP5-REGATE, với một wrapper đặt múi giờ trong môi trường tiến trình con của vitest và một test dò in ra múi giờ mà tiến trình thấy: Asia/Tokyo (offset -540) và America/New_York (offset 300), mỗi nơi 2 test đạt, exit 0, trên máy có múi giờ America/Los_Angeles. WP5-ASSESS-A lần 2 chứng minh lại bằng một preload (rủi ro R-A2-3: các lần chạy `TZ` trước đó của WP5-AC13 không hề đổi múi giờ, vì Git Bash bỏ `TZ`).
  - Đột biến (bản sao tạm, không bao giờ trong repository): đột biến 1 của WP5-AC13 (bỏ qua ngưỡng N, `> 0`) fail với `credit 2026-09-24: expected 30 to be +0`; đột biến 2 (ghi tín dụng hai lần) fail; WP5-ASSESS-A lần 2 lặp đột biến 1 (fail) và thêm đột biến 3 của riêng nó (đọc chữ ký không có bộ lọc quyền sở hữu), fail với `expected [403, 404] to include 200`. Mọi file bị đột biến đã được khôi phục.
- **Chuỗi cổng kiểm** (verifier, bản export sạch, Node 24.21.0, chỉ capture):
  - WP4-REGATE4 PASS trên `546cdda` (`26fcc969…`, 775 file): cơ sở đánh giá;
  - WP5-GATE PASS trên `74d5bfe` (`0a64a75f…`, 779 file): 77 file và 1.759 test, e2e 145 đạt và 5 bỏ qua, drill 208 `PASS`, image `sha256:0addd200…`, AC-13 ba lần;
  - WP5-REGATE PASS trên `9bcdd88` (`1b8ceae4…`, 779 file);
  - WP5-REGATE2 PASS trên `014bd47` (`150420e7…`, 779 file).
- **Chuỗi audit** (mỗi auditor là một context `timesheet-auditor` mới, tự báo `claude-opus-5-5`, không từng viết WP1–WP5):
  - WP5-ASSESS-A lần 1 trên `546cdda`: PASS, không phát hiện; rủi ro R-WA1 đến R-WA8;
  - WP5-ASSESS-A lần 2 trên `74d5bfe`: FIX REQUIRED, hai phát hiện Nhẹ về tài liệu (A2-01 sổ tay nói trạng thái hiển thị cờ gửi; A2-02 tự kiểm capture nêu một deep link trong thư đã capture mà không tồn tại); phần mềm đạt mọi kiểm tra khu vực A;
  - WP5-ASSESS-B trên `546cdda`: FIX REQUIRED (B-01 Trung bình: lệnh sổ tay không ràng buộc file env, thư mục dữ liệu hay image phát hành; B-02 Nhẹ: file env không được giữ cùng backup ngoài thiết bị);
  - WP5-FINAL-AUDIT trên `74d5bfe`: FIX REQUIRED (F-01 Nhẹ: cùng các khẳng định cờ trạng thái trong sổ tay và packet; F-02 Nhẹ: mục 8 của packet nêu một bước đã qua), với B-01 và B-02 đã giải quyết và khu vực B đạt trên digest mới (drill 208 `PASS`, một restore đã kiểm chứng độc lập, một bản phát hành tái lập được);
  - WP5-RECHECK trên `014bd47`: PASS, không phát hiện; F-01, F-02, A2-01 và A2-02 đã giải quyết; các sửa rủi ro nhỏ chính xác.
- **Người viết và bản sửa** (profile như ghi trên bảng; model tự báo):
  - WP5-FIXB, đóng băng `85838b5` (digest `ed604d0c…`, 775 file): ràng buộc Compose, tag image theo release và bản sao file env trong docs/11, cho B-01 và B-02;
  - WP5-AC13, đóng băng `8e99d2c` (digest `1e59ad31…`, 777 file): test AC-13 đã commit;
  - WP5-REL, đóng băng `74d5bfe` (digest `0a64a75f…`, 779 file): `docs/12_RELEASE_NOTES.md`, docs/11 mục 13 đến 16 và một dòng README;
  - WP5-PILOT: gói pilot, chỉ handoff (digest không đổi);
  - WP5-FIXD, đóng băng `9bcdd88` (digest `1b8ceae4…`): F-01, A2-01, A2-02 và F-02, cùng các sửa rủi ro nhỏ R-A2-1, R-A2-2, R-F1, R-F4, R-F5 và R-F6;
  - WP5-FIXD2, đóng băng `014bd47` (digest `150420e7…`): câu cờ trạng thái cuối cùng trong docs/11 mục 12; quét docs/05, 07, 11, 12, README và packet không thấy trúng nào khác;
  - WP5-PKTID: nhận dạng bản phát hành của packet được làm mới thành `014bd47` và `150420e7…`, chỉ handoff; thay đổi của nó là các file handoff chưa commit và chưa có commit (coordinator cho commit);
  - Các worker tự báo `claude-sonnet-5-5`.
- **Gói pilot:** [WP5_PILOT_PACKET](WP5_PILOT_PACKET.vi.md) và `.md` của nó. Nó chỉ có chỗ giữ chỗ và mẫu tổng hợp: nhận dạng bản phát hành, các kiểm tra URL, người gửi và người nhận cùng tự kiểm capture, mẫu email và PDF (8 thư đã capture, 4 PDF, 4 ảnh render), danh sách cài đặt, bằng chứng restore cùng mẫu NAS trống, thẻ rollback, danh sách NAS, bảng D-1 đến D-15, biên bản cho phép chưa ký và các giới hạn đã biết. Không ô nào được đánh dấu và mọi quyết định của chủ sở hữu đều ghi đang chờ. Giá trị thật nằm trong bản riêng của chủ sở hữu ngoài git (D-11).
- **Quyết định của chủ sở hữu D-1 đến D-15:** tất cả đang chờ; mỗi khuyến nghị là khuyến nghị, không phải quyết định (`owner_decisions` trên bảng không có câu trả lời). Chúng được liệt kê cùng khuyến nghị trong bảng phía trên ("Quyết định đang mở của chủ sở hữu"). D-1, D-7, D-8 và D-13 phải được trả lời trước khi kích hoạt. Một câu trả lời khác mặc định hiện tại của D-3, D-5, D-6 hoặc D-8 gây ra một vòng sửa (sửa, đóng băng, cổng kiểm, audit độc lập) trước khi kích hoạt, sau đó nhận dạng bản phát hành trong packet được làm mới.
- **Rủi ro mang tiếp** (không cái nào chặn nghiệm thu):
  - NAS CHƯA ĐƯỢC KIỂM CHỨNG (DSM, `sudo -i`, reverse proxy, bind mount thật, cảnh báo máy chủ, image arm64 gốc) và SMTP thật chưa từng được chạy (D-7, D-8);
  - từ WP5-ASSESS-A: R-WA1 (Nhẹ) lời văn thông báo kết quả sau khi phục hồi downtime; R-WA2 (Nhẹ) nghỉ một phần không hiện trên PDF; R-WA3 (Nhẹ) tài khoản chưa từng cấu hình, gồm quản trị viên bootstrap, nhận lời nhắc trước hạn sau khi kích hoạt; R-WA4 (Info) đổi chia sẻ cấp định danh mới; R-WA5 (Info) reset keep-alive phía probe; R-WA6 (Info) nhãn ngày lễ dài bị cắt bằng dấu ba chấm; R-WA7 (Info) đường runner sống được e2e và các suite bao phủ, không phải probe chạy bằng CLI; R-WA8 (Info) ngày không có bản ghi in "Worked" trên PDF tự động (quyết định của chủ sở hữu);
  - từ WP5-ASSESS-B: R-B5-1 ID image khác nhau cho mỗi lần build cùng nguồn, nên ID image trên NAS được ghi lúc build; R-B5-2 base image được ghim chậm một lần build lại Debian so với tag (quyết định làm mới trước bản build pilot); R-B5-3 cảnh báo `source-map-js` chỉ ở dev; R-B5-4 instance được restore báo backup `never` cho tới backup riêng đầu tiên; R-B5-5 `--prune` cùng ngày xóa backup trước nâng cấp đi kèm (R-RA2); R-B5-6 Git Bash viết lại đường dẫn container với người vận hành Windows; R-B5-7 `migrate` in `DATABASE_PATH` tuyệt đối;
  - từ WP5-ASSESS-A lần 2: R-A2-1 và R-A2-2 (đã sửa trong văn bản), R-A2-3 (các lần chạy TZ, đóng bởi WP5-REGATE), R-A2-4 một cảnh báo quá hạn có thể theo sau bản ghi quá hạn của nó tới một nhóm năm phút, R-A2-5 bổ sung test tùy chọn;
  - từ WP5-FINAL-AUDIT: R-F1 và R-F4 đến R-F6 (đã sửa trong văn bản), R-F2 bản sao restore trở thành instance sống thế nào sau rollback (ghi tài liệu trước khi dựa vào), R-F3 ID image theo từng build (R-B5-1), R-F7 ghim base image (R-B5-2);
  - từ WP5-RECHECK (đều Info, tùy chọn): R-RC-1 kiểm tra cờ `grep -c` chỉ khớp dòng chuẩn (`"true"` có ngoặc kép, hoặc cuối dòng CRLF trên Linux, in 0); R-RC-2 mục 13 bước 6 nói "chỉ sau khi bước 7 đạt" trong khi gạch đầu dòng kiểm tra link lời nhắc đầu của bước 7 chỉ chạy được sau bước 5; R-RC-3 mục 8 của packet chỉ nêu D-8, và khuyến nghị (a) của D-5 cũng khác khi có ghi số dư mở đầu; R-RC-4 mục 6 bước 3 vẫn nói "chế độ capture" cho instance được restore sau khi kích hoạt; R-RC-5 ghi chú root bao mục 13 đến 16 mà không bao các lệnh ở mục 4, 6 và 8; R-RC-6 mục 3 và 5 của packet dẫn WP5-REGATE2 cho `dist/` giống hệt, vốn so `9bcdd88`, còn WP5-RECHECK so trực tiếp `74d5bfe`;
  - các mục WP1–WP4 xếp loại liên quan pilot (PR) ở [WP5-PLAN](tasks/WP5-PLAN.md) mục F, được ghi trong sổ tay và ghi chú phát hành:
    - dòng nghỉ tương lai trên phiên đang mở và Clock out 422 khi chưa xác nhận;
    - WP3 R1 nhãn ngày lễ dài; R4 hash đã review gồm số dư OT (tải lại và review lại); R5 cho phép ký trước cuối kỳ; R8 tài khoản chưa từng cấu hình (lưu cài đặt nộp trước khi kích hoạt); R9 sự kiện seed hiện như tự động;
    - WP4 R-A2 `SQLITE_BUSY` khi nhiều bên cùng mở một database mới (chạy migrate một lần trước lần khởi động đầu); R-A8 CLI quay về database dev khi thiếu `DATABASE_PATH` (giữ cả hai đường dẫn tường minh); R-RA2; R-RA9 đích restore phải là một thư mục thật mới; R-B4-3 trên 64 sheet bị từ chối;
    - các ghi chú bàn giao WP4: trạng thái prune không được ghi, thời hạn lưu không hiện trên màn hình, thư giữ không thể bỏ từ màn hình;
    - mật khẩu tạm không có route đổi (D-9);
  - các mục chặn pilot, dưới dạng quyết định: D-1 (R-A3), D-7 và D-8 (mang từ WP3), và D-13 (NAS); mục quản trị GOV-RECOVERY (`check_recovery.py` độc lập với trạng thái mission sống) trước trạng thái `software_ready`.
- **Sự cố runtime** (2026-10-06, mỗi cái một dòng, không có định danh tiến trình):
  - WP5-PILOT: một worker đưa heredoc rỗng vào `python` qua stdin; một tác vụ nền lặp lỗi và ghi một file đầu ra rất lớn ngoài repository; coordinator đã dừng nó, và file để chủ sở hữu xóa (sự cố stdin thứ tư);
  - WP4-REGATE4: một probe dẫn qua `head` để lại một tiến trình con máy chủ Node 24 chạy, và một dạng xóa đệ quy lạc lối không có tác dụng; coordinator dừng agent, và danh sách tiến trình sau đó không còn tiến trình nào như vậy;
  - WP4-REGATE3 và trước đó: các agent đưa heredoc rỗng vào `python -`; coordinator dừng các tác vụ nền bị chặn, và prompt dispatch nay nêu quy tắc cấm stdin bằng chữ in hoa;
  - WP4-AUDIT-B: một probe heredoc mở một REPL Python tương tác lặp vô hạn và ghi khoảng 2,5 MiB/s ngoài repository; coordinator dừng nó và file để chủ sở hữu xóa;
  - WP4-GATE: một probe migrate đầu tiên chạy không có `DATABASE_PATH` và đã migrate database phát triển cục bộ của chủ sở hữu (ngoài repository, chỉ dữ liệu dev); các kiểm tra sau dùng đường dẫn trong thư mục tác vụ.
- **Hiệu chỉnh O-1 (từ WP5_REVIEW_FINAL):** WP5-B-01 là Trung bình. Ảnh chụp phía trên gọi các phát hiện khu vực B là "hai phát hiện nhẹ về tài liệu" và "(nhẹ, tài liệu)"; các chỗ đó đã được sửa. WP5-B-02 là Nhẹ.
- **Tách ba kết quả:**
  - sẵn sàng phần mềm của WP1–WP5: đã chấp nhận. WP5 đã được triển khai, qua cổng kiểm (WP5-REGATE2 PASS, cùng WP5-GATE và WP5-REGATE trên các freeze trước) và audit độc lập (WP5-RECHECK PASS trên `014bd47`, digest `150420e7…`), với đích NAS CHƯA ĐƯỢC KIỂM CHỨNG; coordinator ghi WP5-ACCEPT;
  - phép của chủ sở hữu: không xin ở đây, và chưa cấp. Gói pilot sẵn sàng cho chủ sở hữu xem xét. Không triển khai, không email thật, không dữ liệu thật, `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt, và không có thời điểm kích hoạt trên instance thật nào;
  - kết quả pilot: chưa có; chưa chạy pilot nào.
