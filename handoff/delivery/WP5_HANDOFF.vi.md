# Bàn giao WP5 — Nghiệm thu độc lập và chuẩn bị pilot (ảnh chụp trước cổng kiểm)

Hoàn thành từ [HANDOFF](../templates/HANDOFF.vi.md). Bản gốc: [WP5_HANDOFF.md](WP5_HANDOFF.md). Đây là ảnh chụp trước cổng kiểm cuối gói WP5-GATE. Nó ghi những gì đang có và những gì còn mở. Biên bản nghiệm thu ở cuối được để trống có chủ ý; WP5-ACCREC điền sau khi audit cuối đạt. Không có gì ở đây là nghiệm thu, và không số liệu nào được chạy lại để viết nó.

## Biên bản bàn giao

- **Giai đoạn/phạm vi, ngày, người làm:** chỉ WP5, theo [WP5-PLAN](tasks/WP5-PLAN.md), [WP5_IMPLEMENT](../prompts/WP5_IMPLEMENT.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md). Ảnh chụp ngày 2026-10-06, do tác vụ WP5-REL viết ([brief](tasks/WP5-REL.md)).
- **Model/effort/tốc độ thật, hoặc không quan sát được:** WP5-REL: tự báo `claude-sonnet-5-5` (profile timesheet-worker); effort và tốc độ không quan sát được từ trong phiên. Các tác vụ khác tự báo trong brief của chúng.
- **Commit SHA, source digest và commit chưa push, hoặc source archive đủ:**
  - Cơ sở của WP5-REL: commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` (WP5-AC13-FREEZE), bằng `origin/main`, digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` trên 777 file (không tính `handoff/`).
  - Tại thời điểm ảnh chụp này, WP5-REL chưa được commit. Source digest của nó, sau các tài liệu mới, nằm ở Kết quả của [brief WP5-REL](tasks/WP5-REL.md); commit đóng băng cuối gói và digest của nó do WP5-GATE ghi.
  - Các commit của bản ứng viên đã chấp nhận: WP1 đến WP4 được chấp nhận tại `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081` (775 file); biên bản chấp nhận WP4 `e7fe5144dc62f5047c79dd5ef69d973f60dfd14d`.
- **Trạng thái triển khai; trạng thái review độc lập:**
  - Xong và đã đóng băng: đánh giá độc lập (khu vực A PASS, khu vực B có hai phát hiện nhẹ về tài liệu), bản sửa sổ tay WP5-FIXB (commit `85838b515a86b3cca40cfbba189ba290ec06de58`) và test AC-13 tích hợp WP5-AC13 (commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741`).
  - Đã viết, chưa đóng băng hay qua cổng kiểm: WP5-REL (ghi chú phát hành, kích hoạt pilot, hủy kích hoạt, thẻ rollback, ghi chú vận hành).
  - Chưa chạy: WP5-GATE, WP5-PILOT, audit độc lập cuối. Chưa có lần recheck độc lập cho bản sửa sổ tay WP5-FIXB; báo cáo khu vực B nêu nó là mục cần recheck.
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
  | Đánh giá khu vực B: phát hành tái lập được, drill stage 1 đến 6, restore độc lập | Docker Desktop, linux/amd64, dữ liệu tổng hợp | không nhắc lại | phát hiện WP5-B-01 và WP5-B-02 (nhẹ, tài liệu) | `evidence/WP5-ASSESS-B/` |
  | WP5-AC13 `npm run verify` | Node 24.21.0 | 0 | 77 file test, 1.759 test, smoke đạt | `evidence/WP5-AC13/verify.txt` |
  | Các kiểm tra WP5-REL | Node 24.21.0 | xem brief WP5-REL | đối chiếu EN/VI, kiểm tra khóa env, verify, precommit, preflight, digest | `evidence/WP5-REL/` |

  Số liệu chính xác nằm trong bằng chứng đã nêu; WP5-GATE tái lập chúng trên commit đóng băng cuối gói.
- **ID AC bao phủ; phần chưa chạy/bị chặn thật:**
  - AC-13 có test tích hợp (WP5-AC13) và probe độc lập (khu vực A). AC-14 và AC-15 được bao phủ ở chế độ capture, bằng drill WP4 và restore khu vực B.
  - Chưa chạy: SMTP thật (lời nhắc lặp lại, lỗi chứng chỉ, gửi trước khi có PDF), đích NAS (CHƯA ĐƯỢC KIỂM CHỨNG), kỳ pilot thật của chủ sở hữu, và các bước mục 13 đến 16 của sổ tay (viết từ code; không stage drill nào bao phủ).
- **Ảnh/PDF/capture giả:** các ảnh render PDF `*-synthetic.png` và danh sách capture đã che nằm trong `evidence/WP5-ASSESS-A/`. Mẫu email và PDF chính xác của pilot thuộc WP5-PILOT và chưa tồn tại.
- **Lỗi đã sửa, lỗi còn và backlog tùy chọn:**
  - Đã sửa: WP5-B-01 (ràng buộc Compose) và WP5-B-02 (file env được giữ cùng backup ngoài thiết bị) bằng WP5-FIXB, đang chờ recheck độc lập.
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
- **Một bước tiếp và prompt tương ứng:** chạy WP5-GATE (verifier) trên commit đóng băng WP5-REL như [WP5-PLAN](tasks/WP5-PLAN.md) mục E, dùng [WP5_REVIEW](../prompts/WP5_REVIEW.md) cho các audit sau.

## Nguồn gốc điều phối

- **Mission/task ID và bảng/checkpoint:** mission `timesheet-software-readiness`, gói WP5; các tác vụ WP5-PLAN, WP5-ASSESS-A, WP5-ASSESS-B, WP5-FIXB, WP5-FIXB-FREEZE, WP5-AC13, WP5-AC13-FREEZE và WP5-REL. Bảng: [ORCHESTRATION.json](ORCHESTRATION.json); checkpoint: [WORKFLOW_REVISION_CHECKPOINT.vi.md](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- **Định danh implementer/auditor độc lập; context riêng:** mỗi tác vụ chạy trong context subagent riêng. Hai auditor đánh giá không viết thay đổi nào. Audit cuối phải là một context mới chưa viết thay đổi WP5 nào, kể cả cái này.
- **Digest đã kiểm/review hiện tại; report/verdict:** các review của bản ứng viên: [WP5_REVIEW_A](WP5_REVIEW_A.vi.md) (PASS) và [WP5_REVIEW_B](WP5_REVIEW_B.vi.md) tại `546cdda`, digest `26fcc969…`. Chưa có review nào cho commit đóng băng cuối gói.
- **Task/dependency còn; một bước coordinator tiếp:** đóng băng WP5-REL, WP5-GATE, WP5-PILOT, WP5-FINAL-AUDIT, WP5-ACCREC, WP5-ACCEPT, rồi GOV-RECOVERY. Bước coordinator tiếp: dispatch đóng băng WP5-REL, rồi WP5-GATE.
- **Tách sẵn sàng phần mềm và phép pilot của chủ đang chờ:** sẵn sàng phần mềm của WP5: đã viết, chưa qua cổng kiểm hay audit cuối. Phép pilot của chủ sở hữu: chưa xin và chưa cấp. NAS CHƯA ĐƯỢC KIỂM CHỨNG.

## Biên bản nghiệm thu

(Để trống. WP5-ACCREC điền mục này sau khi WP5-FINAL-AUDIT đạt.)
