# Checkpoint nhiệm vụ (đang triển khai WP2)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Package và vai trò: WP2 (đang triển khai); coordinator. Model thật claude-opus-5-5
  (chủ dự án chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = 8fae685949adb525ec137e5972202f58b408ac24, commit đóng băng cuối
    package WP2-T13.
  - Digest mã nguồn 8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2
    (tác giả tự báo; gate sẽ ghi digest chính thức).
  - Chưa commit (chỉ trong handoff): board, checkpoint này, dòng target trong brief gate và
    bằng chứng của T13-FREEZE.
  - Không có commit chưa push.
- Đã xong:
  - Quản trị:
    - Bản sửa quy trình v2 đã nghiệm thu (WF-AUDIT3 PASS, `1a25275..6578df8`;
      [bàn giao](WORKFLOW_HANDOFF.vi.md)).
    - GOV-E8 đã nghiệm thu (GOV-E8-AUDIT PASS trên ed92cb7;
      [báo cáo](GOV_E8_REVIEW.vi.md)).
  - WP1 đã nghiệm thu (kiểm tra lại PASS tại 68bbb31 / c6e24381; commit nghiệm thu
    f32978f).
  - Đã áp dụng quyết định E-2, E-3 và E-8 của chủ dự án ("dùng đề xuất"); commit quyết định
    393779d.
  - Các commit đóng băng WP2 đến nay:
    - T01: 396b399.
    - T02: 8930efe.
    - T03: 67c7e7a; đã chứng minh xử lý đồng thời.
    - T04: e92add0, kèm `.gitattributes` bỏ kiểm tra khoảng trắng cho bằng chứng.
  - Kiểm tra tư vấn sổ OT:
    - WP2-ADV-GATE PASS trên e92add0 (export sạch; chạy đồng thời x5).
    - WP2-ADV-REVIEW (opus mới): FINDINGS ADV-A-01..04 mức Low và ADV-A-05 mức Info
      ([báo cáo](WP2_ADV_LEDGER_REVIEW.vi.md)).
    - WP2-ADVFIX đã sửa ADV-A-01..04 (tác giả tự báo; verify 344 test).
  - WP2-T05 (không gian làm việc theo ngày) xong: migration 0003; tác giả tự báo verify
    387 test.
- Lần kiểm tra gần nhất: worker WP2-T05 chạy hai lệnh trên Node v24.21.0; cả hai là kết
  quả tác giả tự báo, chưa kiểm độc lập.
  - `npm run verify`: exit 0, 387 test.
  - `npm run digest`: exit 0.
- WP2-T06 (xem trước chính sách cá nhân) đã xong: tác giả tự báo verify 414 test.
  Committer đã đóng băng ở 1970536 mà không bị bộ phân loại chặn.
- WP2-T07 (quản trị người dùng) đã xong: tác giả tự báo verify 448 test, 5 mutation đều bị
  test phát hiện. Committer đã đóng băng ở a0f06f5.
- WP2-T08 (quản trị lịch) đã xong: tác giả tự báo verify 514 test, 11 mutation đều bị test
  phát hiện. Committer đã đóng băng ở 869bc8e.
  - Phát hiện: việc admin đổi `calendar_id` (WP2-T07) làm gom lại kỳ nháp của người dùng,
    làm các bảng giờ hiện có bị mồ côi và che mất trạng thái đã chốt.
  - WP2-CALFIX sẽ từ chối việc đổi lịch khi người dùng đã có dữ liệu. Đây là quyết định
    của coordinator, chủ dự án có thể đảo lại; đổi lịch theo hướng chỉ áp dụng về sau là
    phương án để chủ dự án chọn sau.
  - WP2-CALFIX đã xong: bước kiểm tra tài liệu đạt (không văn bản gốc nào yêu cầu cho đổi
    lịch), tác giả tự báo verify 524 test, 4/6 mutation bị phát hiện. Hai mutation còn lại
    bị khóa ngoại che mất.
- WP2-T05-FREEZE đã xong (hai commit của chủ dự án, e768b71 và a8a5890). Diễn biến của
  commit đóng băng:
  - Attempt 1 bị chặn. Bộ phân loại quyền của auto mode từ chối lệnh stage/kiểm tra với
    lý do "Credential Leakage". Không lệnh nào chạy và chưa có commit.
  - WP2-T05-PRIVSCAN (chỉ đọc) xác nhận bộ file sạch: không có thông tin đăng nhập hay dữ
    liệu cá nhân thật, không có dòng nào bị precommit chặn.
  - Chủ dự án đã xác nhận trực tiếp ngày 2026-10-03 (`owner_decisions` trên board).
    Attempt 2 trích nguyên văn lời xác nhận đó, nhưng bộ phân loại vẫn từ chối lệnh
    `git add` chạy riêng ("Credential Leakage"). Chưa có commit.
  - WF-CAPS2 (tra tài liệu, chỉ đọc) đã xong; kết quả nằm trong `auxiliary_lookups` trên
    board.
    - Tin nhắn của người dùng nêu rõ hành động và rủi ro cụ thể có thể gỡ một lần chặn.
    - Bộ phân loại chỉ đọc `autoMode` từ cài đặt người dùng hoặc cài đặt được quản lý,
      không đọc từ cài đặt của dự án.
  - Chủ dự án đã tự commit và push ("tôi đã commit xong, tiếp tục đi"). WP2-T05-RECON
    phát hiện commit e768b71c2a5e522bdfece8617599992f8f4a0abc (cha e92add0) chỉ chứa 23
    đường dẫn đã theo dõi có thay đổi.
    - Message của commit là Commit description trong chat của coordinator.
    - Mọi file mới vẫn chưa được theo dõi: migration 0003, dayEntries.ts, các test mới,
      báo cáo review tư vấn, brief và bằng chứng.
    - Vì vậy main đang tham chiếu tới các file chưa có trong git.
    - Digest khớp T05; validator và check_recovery exit 0.
  - Commit bổ sung a8a5890 của chủ dự án đã thêm các file mới. WP2-T05-RECON2 xác nhận:
    - hai commit cộng lại đúng bằng bộ file dự kiến;
    - cây HEAD có đủ các file mã nguồn và test mới;
    - không còn file nào sót;
    - digest khớp;
    - validator và check_recovery exit 0.
- Còn lại:
  - WP2-CALFIX, rồi WP2-T09A, T09B và T10..T13, mỗi task kèm commit đóng băng
    ([plan](tasks/WP2-PLAN.md)). T09 được chia theo WP2-T09-PREP (quyết định của
    coordinator).
  - Gate cuối package: export sạch, nâng cấp WP1→WP2, chạy đồng thời 20 lần và các luồng
    trình duyệt.
  - Hai audit bằng opus mới:
    - AUDIT-A: sổ OT và quyền riêng tư, tập trung vào thay đổi từ sau lần review tư vấn.
    - AUDIT-B: không gian làm việc, quản trị, UI và tích hợp.
  - Nghiệm thu WP2.
  - Sau đó WP3, WP4 và WP5 (WP5 bắt đầu bằng nghiệm thu độc lập), rồi pilot packet cụ
    thể. Pilot thật do chủ dự án quyết.
- Vướng mắc: không có. Rủi ro: bộ phân loại có thể lại chặn `git add` của committer ở các
  commit đóng băng sau. Coordinator không đổi cài đặt quyền và không lách qua lệnh
  chặn. Các phương án: chủ dự án nhắn duyệt nêu rõ hành động và rủi ro, tự commit, hoặc tự
  cấu hình `autoMode` trong cài đặt người dùng. Có thể gộp các commit đóng băng để giảm số
  lần gián đoạn.
- Ghi chú chuyển tiếp:
  - WP3 phải xử lý biến thể 'pending' của `CorrectionResult` và lưu các khoản trừ đang chờ.
  - OT tạm tính chỉ tính cho ngày có phiên làm việc (T04/T05), và bước chốt sổ ở WP3 phải
    bỏ các số tạm tính.
  - WP2-T06 tạo một vòng import ở mức hàm giữa policies.ts và timesheets.ts. AUDIT-B nên
    đánh giá điểm này.
  - Đổi lịch của người dùng ở WP2-T07: WP2-T08 đã xác nhận là có lỗi, WP2-CALFIX sẽ
    sửa. AUDIT-B kiểm tra lại.
  - Ghi chú thiết kế của WP2-T08 cho AUDIT-B:
    - các bước từ chối khi lưu chạy trước bước so hash, nên một yêu cầu giống hệt gửi lại
      sau khi mốc đã dời sẽ nhận `retroactive_change`;
    - lịch chưa có phiên bản nào sẽ bị từ chối.
  - Backlog quản trị vẫn để gộp vào một đợt GOV sau: R1 (check_recovery thừa hưởng trạng
    thái thật; sửa trước software_ready), R2 (mục 2 của AGENTS.vi), giới hạn của
    precommit và ADV-A-05.
- Ràng buộc không đổi:
  - Chỉ dùng dữ liệu giả lập và mail dry-run. Không gửi hay triển khai thật, không đổi
    billing, cài đặt toàn cục hay cài đặt quyền.
  - Commit chỉ qua timesheet-committer, trên main cho đến bản release đầu tiên. Không
    amend, force-push hay tạo tag.
- WP2-T09A đã xong: tác giả tự báo verify 524 test; test:e2e 7 đạt, 1 bỏ qua (test chỉ dành
  cho điện thoại khi chạy trên desktop), chạy trên Edge 153 có sẵn. Đã chụp 4 ảnh giả lập.
- WP2-T09A đã đóng băng ở 717db3e: ảnh chụp chỉ có dữ liệu giả lập, file lock chỉ thêm
  các gói Playwright.
- WP2-T09B đã xong: tác giả tự báo verify 541 test; test:e2e 15 đạt, 1 bỏ qua. Ngày trong
  tương lai đang hiện "missing record"; phần sửa hiển thị nằm trong T10.
- WP2-T09B đã đóng băng ở 9c36a7e: sáu ảnh chụp, tất cả là dữ liệu giả lập.
- WP2-T10 (màn sửa một ngày) đã xong: tác giả tự báo verify 571 test; test:e2e 42 đạt, 2 bỏ
  qua (chạy hai lần), có cả trường hợp giờ trùng khi đổi giờ mùa hè ở Sydney và giờ bị nhảy
  ở Los Angeles.
  - Ghi chú cho AUDIT-B: client hiển thị giờ dự kiến về và gợi ý giờ nghỉ bằng các hàm
    domain dùng chung, chỉ để hiển thị.
- WP2-T10 đã đóng băng ở 26fa7c9: 54 đường dẫn; đã xem 6 ảnh chụp, tất cả là dữ liệu giả
  lập.
- WP2-T11 (giao diện OT, lịch sử và bằng chứng) đã xong: tác giả tự báo verify 582 test;
  test:e2e 50 đạt, 2 bỏ qua. Số dư OT dùng cho e2e được tạo bằng mã chỉ dành cho test.
- Attempt 1 của WP2-T11-FREEZE bị chặn.
  - Bộ phân loại ("Credential Leakage") từ chối một lệnh vừa stage bộ file vừa in mẫu CSV
    và phần diff tạo bút toán chỉ dành cho test. Không lệnh nào chạy.
  - Đang chờ chủ dự án chỉ đạo: một tin nhắn duyệt nêu rõ hành động và rủi ro, hoặc tự
    commit bằng `git add -A`.
  - Brief WP2-T13 đã viết xong và giờ thuộc bộ file này.
  - Chủ dự án đã commit và push bộ file từ IDE ngày 2026-10-04. Hai cảnh báo font-family
    của IDE là báo nhầm (`var(--font-mono)` đã kết thúc bằng `monospace`); T12 sẽ thêm
    font dự phòng tường minh.
  - WP2-T11-RECON đã kiểm tra 55d3bb8:
    - cha của commit là 26fa7c9 (không phải amend);
    - đã push;
    - 35 đường dẫn khớp đúng bộ file dự kiến;
    - quét quyền riêng tư sạch;
    - digest khớp.
- WP2-T12 (màn cài đặt và quản trị) đã xong: tác giả tự báo verify 599 test; test:e2e 66
  đạt, 2 bỏ qua. Test tách biệt dữ liệu cho thấy:
  - mã của người dùng khác trả 404;
  - nhân viên gọi route admin nhận 403;
  - màn quản trị không hiện dữ liệu của nhân viên.
- WP2-T12 đã được committer đóng băng ở da0ffc4, không bị bộ phân loại chặn nhờ quy tắc
  không in nội dung test.
- WP2-T13 (dữ liệu mẫu, smoke, tài liệu, bàn giao WP2) đã xong. Chạy trên bản xuất sạch:
  verify 599 test, smoke 28; test:e2e 66 đạt, 2 bỏ qua; preflight 0.
- WP2-T13 đã đóng băng ở 8fae685 (commit đóng băng cuối package): 28 đường dẫn, mọi kiểm
  tra 0, preflight 0.
- WP2-GATE PASS trên 8fae685 (digest chính thức
  8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2).
  - Đều đạt: npm ci, verify có bật cảnh báo API lỗi thời, 599 test với đủ các bộ mẫu
    LG/DF, chạy đồng thời 20 lần, migration trên database mới và nâng cấp từ WP1, e2e 66
    đạt với đủ 12 luồng, và các validator.
  - Lỗi nhỏ F1: luồng không đủ số dư không có ảnh chụp. Coordinator chấp nhận; AUDIT-B sẽ
    chụp bổ sung.
- Ổ tạm B: chỉ còn 12 MB trống. WP2-TMPCLEAN (light) chỉ xóa các thư mục tạm e2e do dự án
  này để lại, trước khi chạy audit.
- WP2-TMPCLEAN đã xong. Ổ B: còn khoảng 548 MB trống; con số 12 MB lúc trước chỉ là tạm
  thời. Chỉ xóa phần thư mục e2e dự án để lại (khoảng 13 MB).
- Bước tiếp:
  1. Ghi kết quả WP2-AUDIT-A và WP2-AUDIT-B.
  2. Nếu cả hai PASS trên 8fae685, chạy WP2-ACCEPT: các báo cáo review, bằng chứng, record
     nghiệm thu trong HANDOFF, STATE và NEXT_ACTION.
  3. Nếu có audit FIX REQUIRED, lên các task sửa giới hạn phạm vi (`addresses_audit`), rồi
     đóng băng, chạy gate và kiểm tra lại.
  - WP2-T09-PREP đã xong. Kết quả chính:
    - Playwright 1.63.0 chạy được trên Edge có sẵn (channel msedge), không phải tải trình
      duyệt;
    - các biến CSS theo E-8, kèm bản sửa một lỗi tương phản ở chế độ tối;
    - đề xuất chia T09 thành hai phần.
  - Committer chạy quy trình bình thường một lần.
  - Nếu bộ phân loại chặn, coordinator dừng và xin chủ dự án một tin nhắn duyệt nêu rõ
    hành động và rủi ro, hoặc một commit tay. Khi đó Commit description trong chat sẽ
    đúng là message dự định và nhấn mạnh các file mới.
- Prompt tương ứng: handoff/prompts/ORCHESTRATE.md (WP2 theo WP2_IMPLEMENT.md).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). Board commit cuối trong git là bản khôi
  phục.
- WP2-AUDIT-B (opus mới) cho kết quả FIX REQUIRED trên 8fae685 / 8ebce5fe.
  - WP2-B-01, mức Medium: khi nhập giờ tay, múi giờ nhập mặc định là múi giờ báo cáo, trong
    khi R-07 yêu cầu múi giờ hiển thị.
  - WP2-B-02, mức Low: một số giá trị CSS viết cứng thay vì dùng biến CSS.
  - Mọi phần khác của mảng B đều đạt, và F1 của gate không cần sửa code.
  - Brief sửa WP2-FIXB đã sẵn. Task này chỉ được giao sau khi WP2-AUDIT-A xong, vì không
    được có bên ghi mã nguồn chạy song song với audit.
- WP2-AUDIT-A (opus mới) cho kết quả FIX REQUIRED trên 8fae685 / 8ebce5fe.
  - WP2-A-01, mức Medium, về quyền riêng tư: bản xem trước import lịch của admin trả về số
    ngày nhập liệu của nhân viên theo từng ngày.
  - Mọi phần khác của sổ OT đều đạt: chạy đồng thời nhiều process 550 vòng, probe 119/119,
    nâng cấp từ WP1, và ADV-A-01..04 đã sửa.
  - R1–R4 không chặn nghiệm thu và được ghi lại cho các giai đoạn sau.
- Quyết định của coordinator (2026-10-04): bỏ các con số đó, vì ranh giới quyền riêng tư
  trong tài liệu gốc cao hơn câu chữ của kế hoạch. Chủ dự án có thể đảo lại.
- Thứ tự sửa: WP2-FIXA (quyền riêng tư), rồi WP2-FIXB (múi giờ mặc định và biến CSS). Sau
  đó là một commit đóng băng chung, WP2-GATE2, rồi hai lượt kiểm tra lại bằng auditor mới,
  WP2-AUDIT-A2 và WP2-AUDIT-B2.
- WP2-FIXA đã xong (tác giả tự báo).
  - Bản xem trước không còn con số nào lấy từ dữ liệu nhân viên, và `finalized_conflicts`
    chỉ còn ngày.
  - Test hồi quy đỏ 3, sau khi sửa xanh 29.
  - verify 600 test; e2e 66 đạt.
  - Digest 73db9c0a… (working tree).
- WP2-FIXB lượt đầu đã xong (tác giả tự báo):
  - múi giờ mặc định là múi giờ hiển thị (kiểm tra R-07 đạt; không đổi tài liệu);
  - giờ dự kiến về được suy ra và hiện theo múi giờ hiển thị;
  - chuyển sang biến CSS, có probe chứng minh style tính ra không đổi;
  - verify 603 test; e2e 68 đạt, 2 bỏ qua; digest 01110f75….
- Worker phát hiện khi sửa múi giờ của một phiên đã lưu, độ lệch múi giờ cũ vẫn bị giữ.
  Coordinator giao tiếp cho chính worker FIXB sửa luôn lỗi này, có test viết trước, trước
  khi đóng băng; như vậy tránh phải thêm một vòng audit.
- WP2-FIXB đã xong, kể cả phần bổ sung (tác giả tự báo):
  - đổi múi giờ của phiên đã lưu thì giờ đã nhập được hiểu lại theo múi giờ mới;
  - verify 606 test; e2e 74 đạt, 2 bỏ qua;
  - digest 4c2bd7ef… (working tree, gồm FIXA và FIXB).
- WP2-FIX-FREEZE đã commit và push, SHA f79413b (attempt 2, 152 đường dẫn).
  - Attempt 1 hỏng vì một dòng trống cuối file record và vì Python hệ thống thiếu dữ liệu
    múi giờ.
  - f79413b là commit đóng băng cuối package mới.
- WP2-GATE2 PASS trên f79413b; digest chính thức
  4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528.
  - 606 test với đủ các bộ mẫu LG/DF; chạy đồng thời 20 lần; migration; e2e 74 đạt với đủ
    12 luồng; các validator.
  - Các test hồi quy của FIXA và FIXB có mặt và đều đạt.
  - F1 vẫn chỉ là ghi chú về bằng chứng.
- WP2-AUDIT-A2 PASS trên f79413b: WP2-A-01 đã hết, không có lỗi hồi quy. Hai ghi chú: A2-01
  (Info, chú thích cũ) và A2-02 (Low, `refreshed_pay_period` cho biết kỳ lương đã có bảng
  giờ hay chưa).
- WP2-AUDIT-B2 FIX REQUIRED: các bản sửa sản phẩm đều đúng.
  - WP2-B2-01 mức Medium: một test e2e viết cứng giờ mùa hè (PDT) nên sẽ hỏng vào mùa
    đông.
  - WP2-B2-02 mức Low: vẫn còn một số giá trị CSS viết cứng.
  - Auditor B2 đã xóa file `nul` lạ ở gốc repo do chính nó tạo.
- Quyết định của coordinator (ghi trên board):
  - WP2-FIXB2 sửa B2-01 và B2-02, đồng thời gộp A2-02 và A2-01;
  - sau đó đóng băng và chạy WP2-GATE3;
  - rồi kiểm tra lại cả hai mảng bằng auditor mới trên digest mới: WP2-AUDIT-A2 lần 2 (kết
    quả PASS lần 1 mất hiệu lực vì mã nguồn đổi, vẫn giữ trong lịch sử) và WP2-AUDIT-B3.
- WP2-FIXB2 đã xong (tác giả tự báo):
  - test e2e R-07 không còn phụ thuộc mùa (helper zoneOracle và unit test);
  - thêm 4 biến CSS;
  - phản hồi 201 khi tạo ngoại lệ kỳ lương chỉ còn chính ngoại lệ đó, có test so sánh;
  - sửa chú thích;
  - verify 611 test; e2e 74 đạt; digest 5b370621….
- WP2-FIXB2-FREEZE đã commit và push, SHA a3d1b65 (151 đường dẫn, mọi kiểm tra 0). Đây là
  commit đóng băng cuối package mới.
- WP2-GATE3 PASS trên a3d1b65; digest chính thức
  5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581.
  - 611 test; chạy đồng thời 20 lần; migration; e2e 74 đạt với đủ 12 luồng.
  - Các test hồi quy của FIXA, FIXB và FIXB2 có mặt và đều đạt.
- WP2-AUDIT-A2 lần 2 PASS trên a3d1b65 / 5b370621.
  - A2-02 đã hết và A-01 vẫn giữ; chạy đồng thời 770 vòng.
  - A3-01 (Info, bản ghi audit vẫn lưu cờ cập nhật kỳ lương) được chuyển sang WP3.
- WP2-AUDIT-B3 FIX REQUIRED, có hai lỗi Low. Mọi mục trong phạm vi đều đạt, kể cả chạy với
  đồng hồ mùa đông và so sánh 159.460 giá trị style không lệch.
  - WP2-B3-01: giá trị font-weight và letter-spacing viết cứng.
  - WP2-B3-02: chú thích về giờ trùng trong zoneOracle.
- WP2-FIXB3 đã xong (tác giả tự báo):
  - danh sách giá trị viết cứng giảm từ 67 chỗ xuống 0; chỉ còn các điều kiện media, có ghi
    chú lý do;
  - style tính ra: 230.692 giá trị không lệch; bản đối chứng cố ý làm sai bị phát hiện;
  - helper báo lỗi khi gặp giờ trùng hoặc giờ bị nhảy;
  - verify 613 test; e2e 74 đạt; digest e61fa914….
  - Coordinator đã dừng agent sau khi nó bàn giao.
- Đang chạy: WP2-FIXB3-FREEZE (committer).
- Tiếp theo: commit đóng băng, rồi WP2-GATE4, rồi WP2-AUDIT-A2 lần 3 (chỉ kiểm tra phần thay
  đổi, vì mã nguồn đổi thì PASS mảng A mất hiệu lực) và WP2-AUDIT-B4.
- Process còn sống: không biết có process nào ngoài committer.
- Digest gần nhất: 809215583… (tác giả tự báo). Chưa có audit package WP2 nào chạy.
- Usage/reset: không quan sát được.
