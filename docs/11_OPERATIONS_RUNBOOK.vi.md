# Sổ tay vận hành

Sổ tay này dành cho người cài đặt và duy trì ứng dụng Timesheet trên NAS Synology của chủ sở hữu. Sổ tay dùng các lệnh đang có trong code tại thời điểm đóng băng WP4. Tiếng Anh là nguồn chuẩn; [11_OPERATIONS_RUNBOOK.md](11_OPERATIONS_RUNBOOK.md) là bản gốc của bản dịch này. Các quy tắc được áp dụng nằm ở [07 Vận hành](07_DEPLOYMENT_AND_OPERATIONS.vi.md) và [03 Kiến trúc](03_ARCHITECTURE_AND_DATA.vi.md).

**Trạng thái: đích NAS CHƯA ĐƯỢC KIỂM CHỨNG.** Mọi lệnh dưới đây chỉ được chạy thử bằng bản diễn tập container của WP4 trên máy trạm của nhà phát triển (Docker Desktop, linux/amd64, chế độ capture, dữ liệu tổng hợp). Chưa có gì được chạy trên NAS của chủ sở hữu và chưa gửi email thật. Mỗi bước được gắn một trong hai nhãn:

- **[Drill stage N]**: được `npm run drill:container` thực thi (xem "Các stage của drill" bên dưới), kèm số stage.
- **[owner NAS step, unverified]**: bước trên máy chủ mà drill không làm được (màn hình DSM, Task Scheduler, thiết bị thứ hai, reverse proxy). Lần chạy đầu trên NAS chính là lần kiểm chứng.

Các mục 13 đến 16 (các mục pilot của WP5) được viết từ code và các lần review độc lập. Drill không bao giờ gửi thư thật và không bao giờ kích hoạt tự động nộp, nên mọi bước trong đó đều là **[owner NAS step, unverified]** và không có stage drill nào. Chúng chỉ được dùng sau khi chủ sở hữu cho phép rõ ràng việc gửi thật.

## Chỗ giữ chỗ và quy ước

Không có giá trị thật nào trong sổ tay này. Hãy thay các chỗ giữ chỗ trên NAS và chỉ giữ giá trị thật trong các file được bảo vệ trên máy chủ, không bao giờ đưa vào git, chat, ảnh chụp màn hình hay log.

- `<nas-host>`: tên máy chủ HTTPS công khai mà reverse proxy phục vụ.
- `<project>`: tên dự án Compose; `<project-dir>`: thư mục chứa bản export của release (`Dockerfile`, `compose.example.yaml`).
- `<data-dir>`: thư mục cục bộ trên máy chủ được mount thành `/data`; `<env-file>`: file môi trường được bảo vệ (quyền 600).
- `<backup-dir>`: thư mục máy chủ chứa các backup (`<data-dir>/backups`); `<backup-name>`: một thư mục backup, tên dạng `timesheet-backup-<UTC>-<8 hex>`.
- `<restore-dir>`: thư mục mới, rỗng trên máy chủ cho một lần restore; `<proxy-ip>`: địa chỉ mà ứng dụng thấy là peer kết nối của proxy.
- `<image>`: tag image của release `timesheet:<release-commit>`, mỗi release một tag (không bao giờ `latest`, không bao giờ dùng lại một tag cho lần build lại); `<previous-image>`: tag của release ngay trước đó.
- `<compose>` thay cho `docker compose --project-name <project> --file <project-dir>/compose.example.yaml`. Compose đọc bốn biến dưới đây từ `<project-dir>/.env` (quyền 600; file không chứa bí mật, chỉ có đường dẫn và một tag), nên mọi lệnh `<compose>` gắn đúng file môi trường, thư mục dữ liệu và image đã ghi. Nếu thiếu file đó, Compose lùi về `./timesheet.env`, `./data` và `timesheet:local`, điều này sai trên NAS.

  ~~~bash
  TIMESHEET_ENV_FILE=<env-file>
  TIMESHEET_DATA_DIR=<data-dir>
  TIMESHEET_IMAGE=<image>
  TIMESHEET_PORT=3000
  ~~~

- `<compose-restored>` thay cho `TIMESHEET_DATA_DIR=<restore-dir> docker compose --project-name <project>-restored --file <project-dir>/compose.example.yaml` (mục 6). Biến đặt trong shell thắng `<project-dir>/.env`, nên instance đã restore gắn `<restore-dir>` và có tên dự án Compose riêng; nó không bao giờ dùng chung dữ liệu hay dự án với bản đang chạy.
- `<compose-previous>` thay cho `TIMESHEET_IMAGE=<previous-image> TIMESHEET_DATA_DIR=<restore-dir> TIMESHEET_ENV_FILE=<rollback-env-file> docker compose --project-name <project>-rollback --file <project-dir>/compose.example.yaml` (mục 8); `<rollback-env-file>` là bản sao quyền 600 của `<env-file>` có thêm `JOB_RUNNER=off`.
- `<cli>` thay cho `node dist/server/cli.js` (công cụ dòng lệnh bên trong image).
- Các mục 13 đến 16 thêm các chỗ giữ chỗ sau: `<release-commit>`, `<source-digest>` và `<image-id>` (định danh bản phát hành ghi ở mục 1 bước 8 và trong [12 Ghi chú phát hành](12_RELEASE_NOTES.vi.md)); `<manifest-sha256>` (SHA-256 của `<backup-dir>/<backup-name>/manifest.json`); `<activation-instant-utc>` (một thời điểm UTC trong tương lai, viết `YYYY-MM-DDTHH:MM:SSZ`); `<reason>` (một đoạn ngắn cho dấu vết audit, không bao giờ là dữ liệu cá nhân).

## Các stage của drill

Drill là `npm run drill:container -- --work <thư mục rỗng> --project <tên> --wp3 <thư mục bản build trước>` (xem [DEVELOPMENT](../DEVELOPMENT.vi.md)). Stage 1 là cài đặt, bootstrap và khởi động lại; stage 2 là backup khi đang ghi; stage 3 là restore, tạm dừng gửi ra ngoài và đối soát; stage 4 là nâng cấp từ schema trước; stage 5 là rollback; stage 6 là nhập workbook và số dư mở đầu. Không có `--wp3` thì bỏ qua stage 4 và 5.

## 1. Cài đặt trên Synology Container Manager

1. Kiểm tra NAS trước **[owner NAS step, unverified]**: DSM đã cài Container Manager, và kiến trúc CPU từ `uname -m` (`x86_64` hoặc `aarch64`). Không phải NAS nào cũng hỗ trợ container.
2. Image được ghim: Dockerfile build từ `node:24.21.0-trixie-slim` theo digest của index đa kiến trúc (`ARG NODE_IMAGE_DIGEST`), không bao giờ dùng `latest`. Không dùng registry: build image từ bản export sạch của commit release đặt trong `<project-dir>`. `.dockerignore` giữ workbook, test, file handoff và mọi file `.env` ra ngoài image. Drill đã build image `linux/amd64`; image `arm64` chỉ được build dưới giả lập. **[Drill stage 1]** cho bản build amd64; bản build trên chính NAS **[owner NAS step, unverified]**.
3. Container chạy bằng một người dùng không phải root cố định, UID và GID `10001`. Thư mục trên máy chủ phải thuộc người dùng đó **[owner NAS step, unverified]**:

   ~~~bash
   mkdir -p <data-dir>
   chown 10001:10001 <data-dir>
   chmod 700 <data-dir>
   ~~~

4. Volume dữ liệu là một thư mục cục bộ trên máy chủ, mount thành `/data`: CSDL `/data/timesheet.db`, file riêng tư `/data/private-data` (PDF, chữ ký, nguồn nhập, capture) và backup `/data/backups`. Phải là volume cục bộ của NAS, không bao giờ là chia sẻ SMB hay NFS từ xa và không bao giờ là thư mục đồng bộ. **[Drill stage 1]** cho việc mount; hệ thống file của NAS **[owner NAS step, unverified]**.
5. Sao chép `.env.example` thành `<env-file>`, quyền 600, và đặt tối thiểu `APP_ORIGINS`, `PUBLIC_BASE_URL` (https), `MAIL_FROM` và `TRUSTED_PROXY_ADDRESSES`. Production từ chối khởi động nếu thiếu `DATA_DIR` và `DATABASE_PATH` tuyệt đối tường minh, `APP_ORIGINS` và `PUBLIC_BASE_URL`. Giữ `OUTBOUND_MODE=capture` và không bao giờ đặt `PRODUCTION_SENDING_ENABLED`: gửi thật thuộc pilot (mục 13), sau khi chủ sở hữu cho phép. Ứng dụng không cần session secret; thông tin đăng nhập SMTP là bí mật duy nhất nó có thể giữ. Sau đó tạo `<project-dir>/.env` với bốn biến ở "Chỗ giữ chỗ và quy ước" (phần đầu `.env.example` chỉ gợi ý một đường dẫn: `<env-file>` là nơi `TIMESHEET_ENV_FILE` trỏ tới). **[Drill stage 1]** (drill ghi một file env tổng hợp và đặt bốn biến).
6. Mạng: ví dụ Compose chỉ publish cổng trên loopback (`127.0.0.1:3000`). Đặt reverse proxy của Synology phía trước với HTTPS và chuyển tiếp tới cổng đó; không bao giờ publish cổng ra internet. Đặt `TRUSTED_PROXY_ADDRESSES` đúng địa chỉ IP của proxy như ứng dụng thấy được là peer kết nối (không CIDR, không tên máy), ví dụ gateway của cầu Docker. Nếu để trống, mọi header chuyển tiếp bị bỏ qua và mọi client dùng chung giới hạn đăng nhập của địa chỉ proxy. **[owner NAS step, unverified]**
7. Thời gian: bật NTP trong DSM để hạn nộp, backup và thời điểm hết hạn đúng **[owner NAS step, unverified]**.
8. Khởi động và kiểm tra:

   ~~~bash
   <compose> up --detach --build
   <compose> ps
   <compose> logs --no-color timesheet
   docker image inspect --format '{{.Id}}' <image>
   ~~~

   Dịch vụ phải trở thành healthy (health check gọi `/api/ready`). Ghi lại ID image mà lệnh cuối in ra ngay lúc build, cùng commit release và digest nguồn: nó định danh release (build lại cùng mã nguồn có thể cho ID khác). **[Drill stage 1]**

## 2. Danh sách kiểm tra NAS

Đánh dấu từng mục trên NAS và ghi ngày; cho đến lúc đó NAS CHƯA ĐƯỢC KIỂM CHỨNG. Mọi mục đều là **[owner NAS step, unverified]**.

- [ ] Đã ghi kiến trúc (`uname -m`), phiên bản DSM và Container Manager.
- [ ] `<data-dir>` nằm trên volume cục bộ (không SMB, NFS hay thư mục đồng bộ), thuộc UID/GID `10001`, quyền 700.
- [ ] `<env-file>` có quyền 600 và không chứa giá trị nào đồng thời nằm trong git hoặc chat.
- [ ] Dịch vụ healthy sau `up`, sau `<compose> restart` và sau khi khởi động lại NAS (`restart: unless-stopped`).
- [ ] `https://<nas-host>/api/ready` trả 200 chỉ với các số schema, và `https://<nas-host>/api/health` trả 200.
- [ ] Màn hình Setup chỉ xuất hiện một lần và quản trị viên đăng nhập được (mục 3).
- [ ] Giới hạn đăng nhập tính theo từng client (hai client sau proxy không bị chặn chung), điều này cho thấy `TRUSTED_PROXY_ADDRESSES` đúng.
- [ ] NTP đang bật và đồng hồ NAS đúng.
- [ ] Một bản nộp tổng hợp render được PDF (font nằm trong image) và mail của nó rơi vào capture, không ra mạng.
- [ ] Backup, restore cô lập và các bước đối soát (mục 4, 6 và 7) chạy được trên NAS với dữ liệu tổng hợp, và bản sao trên thiết bị riêng tồn tại.
- [ ] Một bản sao được bảo vệ của `<env-file>` (quyền 600) được giữ cùng bản sao backup trên thiết bị riêng, kèm commit release, digest nguồn và ID image (mục 4 bước 3).
- [ ] Trạng thái quản trị hiển thị backup, dung lượng đĩa trống và chế độ gửi ra ngoài (mục 12).
- [ ] Cảnh báo độc lập từ máy chủ (mục 11) kêu khi thử.

## 3. Bootstrap lần chạy đầu

Bản cài mới chưa có lịch và chưa có quản trị viên. Bootstrap tạo lịch công ty và chính sách mặc định một lần, rồi cấp một token thiết lập dùng một lần. Trong file không có dữ liệu cá nhân.

1. Chuẩn bị `<data-dir>/bootstrap.json` gồm lịch công ty, ngày lễ, quy tắc kỳ lương và chính sách mặc định, theo dạng của `reference/examples/*.json`. File được kiểm tra trước khi mở bất kỳ CSDL nào. Một lần từ chối nêu trường và quy tắc bị lỗi và có thể trích một ngày hoặc một số trong chính sách từ file (ví dụ ngày lễ không hợp lệ hoặc số phút không khớp); không bao giờ trích tên, múi giờ báo cáo hay bí mật.
2. Chạy bootstrap trong container đang chạy. Lệnh in số lượng và token thiết lập một lần; token chỉ hiện trên terminal này và chỉ lưu hash của nó. **[Drill stage 1]**

   ~~~bash
   <compose> exec -T timesheet <cli> bootstrap --config /data/bootstrap.json
   ~~~

3. Mở `https://<nas-host>/`, gõ token vào màn hình Setup và tạo quản trị viên đầu tiên (email, tên hiển thị, mật khẩu 12 đến 256 ký tự). Token có hiệu lực 60 phút và chỉ dùng được một lần; token sai, hết hạn hoặc đã dùng nhận cùng một lời từ chối giống nhau. **[Drill stage 1]**
4. Nếu token hết hạn mà chưa dùng, in token mới. Chỉ làm được khi chưa có quản trị viên. **[owner NAS step, unverified]** (được `tests/integration/bootstrap.test.ts` bao phủ, không phải drill)

   ~~~bash
   <compose> exec -T timesheet <cli> bootstrap --new-token
   ~~~

5. Không bao giờ dán token vào chat, ticket hay log. Lệnh `seed` tổng hợp bị từ chối ở production; quản trị viên tạo các tài khoản thật trong ứng dụng. Mật khẩu là tạm thời và WP4 không có route đổi mật khẩu (quyết định E-11, xem [10 Quyết định](10_DECISIONS_AND_SOURCES.vi.md)).

## 4. Lịch backup

Mục tiêu (cần kiểm tra, không phải cam kết): backup hằng đêm, điểm phục hồi 24 giờ và restore trong một giờ.

1. Backup nhất quán trong khi server vẫn ghi: dùng online backup của SQLite, sao chép các file riêng tư mà bản sao tham chiếu, kiểm tra từng hash và ghi `manifest.json` vào một thư mục mới `<backup-name>` dưới `<backup-dir>`. Đích phải nằm ngoài `DATA_DIR` (`/data/private-data`); `/data/backups` được chấp nhận. Lệnh chỉ in số lượng và thoát với mã 0 (thành công), 1 (thất bại, có ghi nhận) hoặc 2 (bị từ chối). **[Drill stage 2]**

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups
   ~~~

2. Lên lịch hằng đêm trong DSM Task Scheduler bằng script do người dùng định nghĩa chạy cùng lệnh đó kèm `--prune` (chính sách giữ ở mục 5). Lệnh có `--prune` chỉ xóa backup cũ sau khi backup mới thành công. **[Drill stage 2]** cho backup; bản thân `--prune` được `tests/integration/backup-prune.test.ts` bao phủ và drill chạy lượt thử khô của nó; mục Task Scheduler **[owner NAS step, unverified]**.

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups --prune
   ~~~

3. Backup trên cùng volume không bảo vệ khi mất đĩa. Sau mỗi backup, sao chép `<backup-dir>` sang một thiết bị riêng (Synology Hyper Backup hoặc đĩa USB). Đây là bước cài đặt của chủ sở hữu, không phải code ứng dụng (quyết định F-5 của chủ sở hữu). Backup chứa dữ liệu cá nhân, PDF và chữ ký: bảo vệ như dữ liệu đang chạy. Backup không chứa cấu hình, nên hãy giữ một bản sao được bảo vệ của `<env-file>` (quyền 600, không bao giờ đưa vào git hay chat) cùng bản sao trên thiết bị riêng, và commit release, digest nguồn cùng ID image của release đã ghi dữ liệu. Thiếu chúng thì instance đã restore không khởi động được (`APP_ORIGINS`, `PUBLIC_BASE_URL`, `MAIL_FROM`, `TRUSTED_PROXY_ADDRESSES` và về sau là thông tin đăng nhập SMTP). **[owner NAS step, unverified]**
4. Kiểm tra kết quả: dòng in ra có `"outcome":"succeeded"` và trạng thái quản trị hiển thị lần thành công gần nhất cùng tuổi của nó (mục 12).

## 5. Chính sách giữ lại

- **Backup (F-5).** `--prune` giữ backup mới nhất của mỗi ngày UTC trong 7 ngày gần nhất, của mỗi tuần ISO trong 4 tuần gần nhất và của mỗi tháng UTC trong 6 tháng gần nhất, và luôn giữ backup mới nhất. Chỉ tác động lên thư mục do công cụ backup tạo (đúng tên thư mục và manifest hợp lệ); mọi mục khác chỉ được đếm. Các cửa sổ là cửa sổ lịch tính từ đồng hồ, nên sau một khoảng dài không có backup chỉ backup mới nhất còn lại. Nếu có backup mang ngày muộn hơn đồng hồ máy chủ (đồng hồ bị đặt lùi), `--prune` và lần chạy thử từ chối cả lượt với exit 2 (`clock_behind_backups`) và không xóa gì: hãy sửa giờ máy chủ trước. Kết quả của lần prune gần nhất không được ghi vào trạng thái quản trị. Xem trước một lần prune; lệnh không xóa gì: **[Drill stage 2]**

  ~~~bash
  <compose> exec -T timesheet <cli> backup prune --in /data/backups --dry-run
  ~~~

- **Dòng job (F-4).** Một job hằng ngày chỉ xóa các dòng `deadline_scan` và `reminder_scan` đã thành công và cũ hơn 30 ngày. Không bao giờ xóa dòng gửi, PDF hay delivery. Không cần lên lịch gì: bộ chạy của server tự làm. Lần chạy gần nhất và số dòng đã xóa nằm trong JSON của `GET /api/admin/operations` (`operations.retention`); màn hình quản trị không hiển thị chúng. Được `tests/integration/job-retention.test.ts` bao phủ, không phải drill.
- **File mồ côi.** Một lượt quét hằng ngày xóa file riêng tư không có dòng nào tham chiếu và cũ hơn 24 giờ; không bao giờ xóa file đang được tham chiếu, kể cả nguồn nhập. Được `tests/integration/jobs-sweep.test.ts` bao phủ, không phải drill.
- Timesheet, sổ OT, revision và nhật ký kiểm toán không bao giờ bị xóa. Theo dõi dung lượng đĩa trống (mục 12).

## 6. Restore cô lập

Restore vào một thư mục mới rỗng, không bao giờ ghi đè lên dữ liệu đang chạy. Công cụ từ chối đích nằm trong `DATA_DIR` đang chạy hoặc đích đã chứa CSDL đang chạy. Nó xác minh hash trong manifest, kiểm tra toàn vẹn và schema (từ chối schema mới hơn), sao chép CSDL và file, đặt tạm dừng gửi ra ngoài với lý do `restored`, và chỉ in số lượng cùng kết quả kiểm tra manifest. Mã thoát 0, 1 (kiểm tra thất bại; không để lại gì) hoặc 2 (bị từ chối).

1. Chọn `<backup-name>` (mới nhất, hoặc bản mà rollback cần) và tạo `<restore-dir>` rỗng thuộc UID/GID `10001` **[owner NAS step, unverified]**.
2. Restore trong một container dùng một lần, không mạng và root chỉ đọc, như drill làm. **[Drill stage 3]**

   ~~~bash
   docker run --rm --read-only --network none --tmpfs /tmp:size=64m,mode=1777 --env-file <env-file> \
     --volume <backup-dir>:/backups:ro --volume <restore-dir>:/restore \
     <image> <cli> restore --from /backups/<backup-name> --to /restore
   ~~~

3. Kết quả là `<restore-dir>/timesheet.db` và `<restore-dir>/private-data`. Để kiểm tra, dừng instance đang chạy trước (không bao giờ chạy hai hàng đợi trên cùng dữ liệu, và không bao giờ để hàng đợi production cũ và hàng đợi đã restore chạy cùng lúc), rồi khởi động instance thứ hai có `/data` là `<restore-dir>`, ở chế độ capture, dưới tên dự án Compose riêng. Dùng `<compose-restored>` (mục "Chỗ giữ chỗ và quy ước"); image phải có sẵn, nên không build. **[Drill stage 3]** (drill dừng nguồn rồi mới khởi động instance đã restore)

   ~~~bash
   <compose-restored> up --detach --no-build
   <compose-restored> ps
   ~~~

   Dừng nó bằng `<compose-restored> down` khi kiểm tra xong.
4. Kiểm tra kết quả toàn vẹn, người dùng, số dư OT tiêu biểu, số revision, các file cùng hash và một PDF. Instance đã restore ghi log `Outbound delivery PAUSED since <UTC instant> (reason: restored)` khi khởi động và hiển thị biểu ngữ tạm dừng trong trạng thái quản trị. Không có gì được gửi cho đến khi hoàn tất mục 7. **[Drill stage 3]**
5. Nguồn nhập được restore cùng hash, nên các lần nhập đã restore vẫn còn file nguồn. **[Drill stage 3]**

## 7. Đối soát sau restore

Restore giữ lại mọi job `send_email` và `send_reminder` đang xếp hàng hoặc đang được thuê của backup, và đánh dấu mọi lần gửi bị gián đoạn là không chắc chắn. Mail mà nguồn có thể đã gửi không bao giờ được gửi lại. Job tạo sau restore không bị giữ; chúng chỉ chờ lệnh resume. Mỗi bước dưới đây đều được ghi nhật ký kiểm toán như sự kiện hệ thống. Chạy các lệnh trên instance đã restore: viết `<compose-restored>` ở chỗ chúng ghi `<compose>`.

1. Liệt kê những gì đang bị giữ. Không có `--confirm`, lệnh chỉ in id job, loại, số lần thử và điều chặn, và thoát với mã 2. **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound release
   ~~~

2. Với mỗi lần gửi bị giữ, kiểm tra hộp thư thật (hoặc thư mục capture) để biết nguồn đã gửi chưa. Với mỗi lần gửi không chắc chắn, ghi quyết định trong lịch sử gửi của ứng dụng trước; lệnh resume bị từ chối khi còn lần gửi nào chờ quyết định.
3. Xem trước lệnh resume, rồi gỡ tạm dừng. Với `--confirm` chỉ thành công khi không còn lần gửi nào chờ quyết định (nếu không thì mã thoát 1). **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound resume
   <compose> exec -T timesheet <cli> outbound resume --confirm
   ~~~

4. Giải phóng một lần gửi bị giữ, hoặc tất cả sau khi xem số lượng đã in. Việc giải phóng bị từ chối với `attempt_uncertain`, `delivery_attempt_open` hoặc `superseded_by_later_send` khi lần gửi có thể trùng lặp; job được giải phóng sau đó theo quy tắc gửi bình thường và được gửi đúng một lần. **[Drill stage 3]**

   ~~~bash
   <compose> exec -T timesheet <cli> outbound release --job <job-id> --confirm
   <compose> exec -T timesheet <cli> outbound release --all --confirm
   ~~~

5. Bỏ một lời nhắc bị giữ mà không còn cần (không thể bỏ một lần gửi bị giữ, chỉ giải phóng hoặc để nguyên bị giữ). **[owner NAS step, unverified]** (được `tests/integration/restore.test.ts` bao phủ, không phải drill)

   ~~~bash
   <compose> exec -T timesheet <cli> outbound drop --job <job-id> --confirm
   ~~~

Khi đối soát xong, hãy tạo một backup (mục 4): instance đã restore báo backup là `never` cho đến backup đầu tiên của chính nó.

## 8. Nâng cấp và rollback

### Nâng cấp

1. Trước hết tạo và kiểm tra một backup, ghi lại tên thư mục của nó: đó là backup ghép đôi trước nâng cấp cho rollback. Ghi lại cả tag image đang chạy và ID image của nó (`docker image inspect --format '{{.Id}}' <image>`): tag vẫn gắn với image đó, nên nó là đích rollback. **[Drill stage 4]** (drill tạo backup ghép đôi của schema cũ bằng công cụ mới)
2. Build image mới từ bản export release mới dưới một tag mới, mỗi release một tag: đặt `TIMESHEET_IMAGE=timesheet:<new-release-commit>` trong `<project-dir>/.env` (tag cũ trở thành `<previous-image>`), rồi build và khởi động, và ghi ID image mới như ở mục 1 bước 8. Không bao giờ build lại dưới tag cũ: làm vậy thay mất image mà rollback cần. Migration chạy một lần khi khởi động, dưới khóa độc quyền, trong một transaction; khởi động lại không áp dụng gì thêm. **[Drill stage 4]**

   ~~~bash
   <compose> up --detach --build
   ~~~

3. Kiểm tra `/api/ready` (schema đạt số mới nhất của chính image), tính toàn vẹn và trạng thái quản trị. **[Drill stage 4]**

### Rollback

Bản build cũ từ chối CSDL của schema mới hơn, nên không bao giờ chỉ khởi động image cũ trên CSDL đã nâng cấp. **[Drill stage 5]**

1. Dừng instance đã nâng cấp.
2. Restore backup ghép đôi trước nâng cấp bằng công cụ của bản build mới và `--keep-schema`, không chạy migration. Backup có schema cũ hơn bản có tạm dừng gửi ra ngoài thì không giữ được trạng thái tạm dừng: không có `--confirm` thì restore từ chối (mã 2, `unpaused_schema_unconfirmed`) và không ghi gì; có `--confirm` thì nó giữ các job gửi trong backup và cảnh báo ở stderr. **[Drill stage 5]**

   ~~~bash
   docker run --rm --read-only --network none --tmpfs /tmp:size=64m,mode=1777 --env-file <env-file> \
     --volume <backup-dir>:/backups:ro --volume <restore-dir>:/restore \
     <image> <cli> restore --from /backups/<paired-backup-name> --to /restore --keep-schema --confirm
   ~~~

3. Khởi động image trước đó (tag `<previous-image>`, không bao giờ là bản build lại cùng tag) trên `<restore-dir>` với `JOB_RUNNER=off` trong môi trường, bằng `<compose-previous> up --detach --no-build` (nó dùng file env rollback). Schema cũ đã restore không có tạm dừng gửi ra ngoài, nên job tạo sau rollback không bị giữ: giữ bộ chạy tắt cho đến khi đối soát xong. Drill chỉ chứng minh bản build trước, khi bật bộ chạy, không gửi gì từ các job bị giữ (`JOB_RUNNER=off` là quy tắc đã ghi, không phải bước của drill).
4. Đối soát. Bản build trước không có lệnh `outbound`: việc đối soát diễn ra sau khi nâng cấp lại, làm migrate dữ liệu đã restore và cung cấp công cụ tạm dừng và giải phóng. Thay đổi thực hiện sau backup ghép đôi không có trong bản đã restore.
5. Nếu từ backup chưa có migration nào được áp dụng (schema tương thích), image trước đó có thể khởi động trên dữ liệu đang chạy. Đường này chưa được diễn tập. **[owner NAS step, unverified]**

## 9. Làm mới digest của image

Làm mới image nền khi có bản vá bảo mật, và luôn làm cùng nhau: tag và digest.

1. Đọc digest của index đa kiến trúc của tag (đã đọc theo cách này trong WP4-T04, trên máy nhà phát triển; không phải stage của drill). **[owner NAS step, unverified]**

   ~~~bash
   docker buildx imagetools inspect node:24.21.0-trixie-slim
   ~~~

2. Sửa `ARG NODE_IMAGE_DIGEST` và tag được nêu trong chú thích của Dockerfile cùng nhau (và `.nvmrc` khi đổi phiên bản Node). Không bao giờ dùng `latest`.
3. Đặt trước một tag `TIMESHEET_IMAGE` mới (mục 8 bước 2), rồi build lại không dùng cache và chạy drill trước khi triển khai; drill build image từ Dockerfile. Build lại dưới tag đang chạy sẽ thay mất image đó. **[Drill stage 1]**

   ~~~bash
   <compose> build --no-cache
   ~~~

4. Triển khai như một lần nâng cấp (mục 8). Thay đổi đi qua gate và quy tắc commit thông thường của dự án.

## 10. Nhập workbook và số dư mở đầu

Dành cho những người của chủ sở hữu. Mỗi người chỉ nhập workbook của chính mình; quản trị viên không thể nhập cho ai khác (quyết định F-1 của chủ sở hữu). Ứng dụng không bao giờ đọc công thức, macro hay liên kết ngoài của workbook.

1. Đăng nhập và mở Import (`#/import`). Tải lên một file `.xlsx` tối đa 2 MiB (workbook có macro bị từ chối). Bản xem trước liệt kê mọi ngày kèm ô nguồn, nhãn lạ, ngày trùng, ngày lễ thả nổi, các lỗi đã biết của template và xung đột với bản ghi hiện có. **[Drill stage 6]** (qua API; các màn hình được `tests/e2e/import.spec.ts` bao phủ)
2. Quyết định cho từng ngày được liệt kê. Mặc định là bỏ qua; chỉ có các lựa chọn mà bản xem trước cho phép. Sau đó xem lại và commit. **[Drill stage 6]**
3. Kỳ đã nhập hiển thị "Imported, unverified". Đó là lịch sử chỉ đọc: không sự kiện sổ cái, không sign-off hay nộp (409 `imported_period`), không nhắc hạn và không tự động gửi. Tải cùng file lần nữa, hoặc commit hai lần, không thay đổi gì ("Already imported"). **[Drill stage 6]**
4. Số dư OT mở đầu là khoản OT mang sang duy nhất. Nhập số phút có dấu khác không, ngày hiệu lực, lý do và tham chiếu bằng chứng, rồi xác nhận. Khoản này được ghi một lần; lặp lại là không làm gì, còn giá trị khác bị từ chối. Chỉ thay đổi bằng một điều chỉnh có lý do (điều chỉnh làm số dư ròng về không bị từ chối, câu hỏi mở I-4). **[Drill stage 6]**
5. Việc nhập không làm gì: không bao giờ tạo phiên làm việc hay giờ chấm công, OT, sign-off hay lần gửi; "Off day (overtime used)" bị bỏ qua (I-2); kỳ nháp của ứng dụng không bao giờ nhận ngày nhập (I-1); kỳ chưa kết thúc, hoặc đã kết thúc nhưng chưa đến hạn lương, chỉ được bỏ qua (I-3 và mặc định an toàn của nó, tài liệu 10).
6. Giữ workbook cá nhân ngoài git, chat và image. Template được theo dõi là mẫu đã làm sạch và không bao giờ được lưu lại.

Các route API đứng sau những màn hình này, đều chỉ dành cho chủ sở hữu: `POST /api/imports`, `GET /api/imports`, `GET /api/imports/{id}`, `POST /api/imports/{id}/commit`, và `GET`, `POST` và `PUT /api/ot/opening-balance`.

## 11. Cảnh báo độc lập từ máy chủ

Ứng dụng không thể báo lỗi của chính nó qua mail của chính nó: SMTP hỏng không thể báo rằng SMTP hỏng, và container đã dừng không thể tự báo. Hãy thêm một kiểm tra chạy bên ngoài ứng dụng **[owner NAS step, unverified]**:

1. Một tác vụ DSM Task Scheduler thứ hai, hằng ngày, dạng script do người dùng định nghĩa. Nó cảnh báo khi thư mục mới nhất của `<backup-dir>` cũ hơn giới hạn (26 giờ khớp với cảnh báo của ứng dụng) hoặc khi dung lượng trống của volume dữ liệu thấp hơn mức bạn chọn:

   ~~~bash
   find <backup-dir> -maxdepth 1 -name 'timesheet-backup-*' -mmin -1560 | grep -q . || echo "backup too old"
   df -h <data-dir>
   ~~~

2. Chuyển cảnh báo qua dịch vụ thông báo của chính DSM (Control Panel, Notification), không qua SMTP của ứng dụng.
3. Theo dõi thêm tình trạng health của container trong Container Manager.
4. Thử cảnh báo một lần bằng cách chỉnh giới hạn để nó kêu.

## 12. Trạng thái quản trị hiển thị gì

Quản trị viên thấy vận hành và gửi thư, không bao giờ thấy chi tiết timesheet (docs/03). Màn hình đọc `GET /api/admin/operations`, và danh sách tài khoản có cờ "Not set up" cho tài khoản chưa từng lưu cài đặt nộp. Route trả về nhiều hơn một chút so với màn hình hiển thị: lần chạy giữ lại (bên dưới) chỉ có trong JSON.

- Nhịp của bộ chạy, thời điểm kích hoạt tự động, việc đã cấu hình địa chỉ người gửi hay chưa ("Sender address") và chế độ gửi ra ngoài ("Outbound mode"; không bao giờ là cờ gửi, cờ chỉ nằm trong `<env-file>`), và tổng số job và lần gửi.
- Backup: kết quả gần nhất, thời điểm lần thử và lần thành công gần nhất, mã lỗi và tuổi tính từ lần thành công gần nhất (cảnh báo sau 26 giờ, báo lỗi khi lần thử mới nhất thất bại).
- Đĩa: số byte trống và tổng của volume dữ liệu (không bao giờ là đường dẫn).
- Gửi ra ngoài: có đang tạm dừng không, từ khi nào và vì sao (`restored`), số lần gửi đang chờ quyết định, và số job gửi đang xếp hàng và đang bị giữ.
- Giữ lại (chỉ có trong JSON của `GET /api/admin/operations`, không có trên màn hình): lần dọn dòng job gần nhất khi nào và đã xóa bao nhiêu dòng.
- Theo từng người: các kỳ có revision kèm người nhận, với mã lỗi đã che.

**[Drill stage 3]** đọc trạng thái tạm dừng gửi từ route này sau restore; **[Drill stage 2]** tạo ra một backup mà trạng thái báo cáo. Không hiển thị: kết quả của lần `--prune` gần nhất, và mọi thứ về máy chủ. Vì vậy cần mục 11.

## 13. Kích hoạt pilot

Việc gửi thật và thời điểm kích hoạt cần chủ sở hữu cho phép rõ ràng ([06 Nghiệm thu](06_TEST_AND_ACCEPTANCE.vi.md)). Không làm gì trong mục này trước khi có phép đó. Sẵn sàng phần mềm, phép của chủ sở hữu, nhà cung cấp chấp nhận và người nhận đã nhận là bốn sự thật tách biệt; ghi từng cái riêng. Các lựa chọn dưới đây là khuyến nghị; owner decision pending (D-1 đến D-15 ở [WP5-PLAN](../handoff/delivery/tasks/WP5-PLAN.md) mục D). Các khóa cấu hình chỉ được nêu tên ở đây và giá trị của chúng chỉ nằm trong `<env-file>`. Trên DSM, các lệnh dữ liệu, backup và Docker ở mục 13 đến 16 cần quyền root (`sudo -i`): `<data-dir>` có quyền 700 và thuộc UID 10001. Trình duyệt có thể yêu cầu người vận hành gõ "allow pasting" trước khi một dòng dán vào console được chạy.

1. Điều kiện tiên quyết. Nếu có điều nào sai, hãy dừng. **[owner NAS step, unverified]**
   - Phép nằm trong hồ sơ riêng của chủ sở hữu.
   - Danh sách ở mục 2 đã được đánh dấu và ghi ngày (recommended; owner decision pending (D-13)); cho tới lúc đó NAS CHƯA ĐƯỢC KIỂM CHỨNG và kết quả là "phần mềm sẵn sàng, pilot đang chờ".
   - Backup, restore cô lập và đối soát (mục 4, 6, 7) đã chạy được trên NAS với dữ liệu tổng hợp.
   - `<release-commit>`, `<source-digest>` và `<image-id>` đã được ghi (mục 1 bước 8).
   - Các giá trị thật (`MAIL_FROM`, các khóa `SMTP_*`, `PUBLIC_BASE_URL`, `APP_ORIGINS`, `TRUSTED_PROXY_ADDRESSES`) nằm trong bản riêng của chủ sở hữu, ngoài git, chat và ảnh chụp màn hình.
2. Tự kiểm tra ở chế độ capture. Giữ `OUTBOUND_MODE=capture` và để trống `PRODUCTION_SENDING_ENABLED`. **[owner NAS step, unverified]**
   - Trạng thái quản trị cho thấy "Outbound mode: Capture only (nothing leaves the server)" và kích hoạt "Not activated". Trạng thái không có trường nào cho cờ gửi: kiểm tra trong file, `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `0` (in ra `1` khi cờ được đặt; lệnh không bao giờ in giá trị).
   - Với hai tài khoản tổng hợp của [07 Vận hành](07_DEPLOYMENT_AND_OPERATIONS.vi.md) "Trình tự setup" (địa chỉ trên `example.invalid`), ký xác nhận và nộp một kỳ tổng hợp. Thư mục capture dưới `/data/private-data` phải chứa đúng các người nhận đã cấu hình và nội dung đã đóng băng, cùng một PDF có SHA-256 bằng bản PDF tải về. Không có gì rời khỏi NAS.
   - Kiểm tra `PUBLIC_BASE_URL` và `APP_ORIGINS`: mở `https://<nas-host>/#/review/<payroll-date>` (dạng của mọi link nhắc nhở); nó phải yêu cầu đăng nhập rồi mở màn hình review. Một bản nộp đã capture không chứa link nào, và không có lời nhắc nào được quyết định trước khi đặt thời điểm kích hoạt. Một yêu cầu thay đổi trạng thái từ origin đó phải được chấp nhận.
   - Lưu cài đặt nộp của tài khoản chủ sở hữu và của mọi tài khoản khác sẽ tồn tại, rồi vô hiệu hóa các tài khoản tổng hợp trong màn hình quản trị và bảo đảm không tài khoản nào bật tự động nộp (mục 16).
   - Trạng thái quản trị không được có job gửi nào đang xếp hàng hay đang giữ lease. Một job còn xếp hàng khi bật gửi thật sẽ được gửi thật.
3. Backup trước kích hoạt, kèm tên và hash. **[owner NAS step, unverified]**

   ~~~bash
   <compose> exec -T timesheet <cli> backup --to /data/backups
   ls -1 <backup-dir>
   sha256sum <backup-dir>/<backup-name>/manifest.json
   ~~~

   Backup in ra `"outcome":"succeeded"`. `<backup-name>` là thư mục mới nhất (tên xếp theo thời gian UTC). Ghi lại `<backup-name>` và `<manifest-sha256>`: manifest liệt kê hash của mọi file, nên hash của chính nó định danh backup đó. Chép `<backup-dir>` sang thiết bị riêng (mục 4 bước 3) và giữ cùng đó một bản sao được bảo vệ của `<env-file>` ở chế độ capture: thẻ rollback (mục 15) cần nó.
4. Bật gửi thật. **[owner NAS step, unverified]**
   - Sửa `<env-file>` (quyền 600): `OUTBOUND_MODE=smtp`; `PRODUCTION_SENDING_ENABLED=true`, đúng giá trị đó; `SMTP_HOST`; `SMTP_PORT`; `SMTP_SECURITY` là `starttls` hoặc `tls`; `SMTP_USER` và `SMTP_PASSWORD` đi cùng nhau, hoặc đều không có; `MAIL_FROM` là một địa chỉ người gửi mà nhà cung cấp chấp nhận. Giữ `PUBLIC_BASE_URL`, `APP_ORIGINS` và `TRUSTED_PROXY_ADDRESSES` như đã thử ở bước 2.
   - Ở chế độ SMTP mà thiếu cờ thì server từ chối khởi động, và các lệnh CLI đọc cài đặt thư (`backup`, `restore`) cũng vậy; các lệnh khác thì không. Thông báo nêu tên cờ, không bao giờ nêu giá trị. Khởi động lại đơn thuần không đọc lại `<env-file>`, nên hãy tạo lại container:

     ~~~bash
     <compose> up --detach --force-recreate --no-build
     <compose> ps
     <compose> logs --no-color timesheet
     ~~~

   - Trạng thái quản trị giờ cho thấy "Outbound mode: SMTP (real sending)", và `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `1`. Thời điểm kích hoạt vẫn trống ("Not activated").
5. Đặt thời điểm kích hoạt. Trong kỳ đầu theo giai đoạn (bước 6) hãy để trống. Khi chủ sở hữu quyết định bật tự động nộp, đăng nhập bằng quản trị viên, mở developer console của trình duyệt tại `https://<nas-host>/` và chạy **[owner NAS step, unverified]** (không có màn hình cho việc này; lệnh gọi được các test tích hợp bao phủ, không phải drill):

   ~~~js
   await (await fetch('/api/admin/automation/activation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active_from: '<activation-instant-utc>', reason: '<reason>' }) })).json()
   ~~~

   - Thời điểm không được ở quá khứ (422 `activation_in_past`) và bắt buộc có lý do (422 `reason_required`). Origin phải có trong `APP_ORIGINS` (403 `origin_rejected`).
   - Chỉ kỳ có hạn nộp bằng hoặc sau cả thời điểm này và thời điểm tự động nộp hiệu lực của chính tài khoản mới được tự động chốt; tài khoản chưa từng lưu cài đặt thì không bao giờ ([05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Đến hạn và phục hồi"). Hãy chọn thời điểm sau khi kỳ đầu đã được ký xác nhận bằng tay.
   - Lệnh gọi được ghi audit. Kiểm tra trạng thái quản trị hiển thị thời điểm đó. Nó hiển thị theo múi giờ của trình duyệt và không có nhãn múi giờ, nên `2027-01-01T00:00:00Z` hiện thành ngày giờ địa phương của trình duyệt.
6. Kỳ đầu theo giai đoạn (recommended; owner decision pending (D-12)).
   - Ký xác nhận bằng tay với gửi thật; tắt tự động nộp; không có thời điểm kích hoạt.
   - Lần gửi thật đầu tiên đi tới địa chỉ của chính chủ sở hữu. Việc đổi người nhận không tới được một revision đã có (phong bì đã đổi cần một revision mới được xem, [05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Sửa và gửi lại"), nên hãy đặt người nhận của kỳ đầu trong cài đặt của chủ sở hữu trước khi ký, và cùng chủ sở hữu quyết định bộ phận lương nhận thư của kỳ đầu hay một revision sau đó.
   - Giữ workbook Excel làm đối chiếu cho kỳ đó.
   - Bật tự động nộp từ kỳ kế tiếp (bước 5), và chỉ sau khi bước 7 đạt.
7. Sau lần gửi thật đầu tiên. Nhà cung cấp chấp nhận và người nhận đã nhận là hai sự thật tách biệt; ghi từng cái cùng thời điểm của nó. **[owner NAS step, unverified]**
   - Nhà cung cấp chấp nhận: lịch sử gửi của revision cho thấy lần thử ở trạng thái accepted kèm xác nhận của nhà cung cấp. Khi lỗi sẽ có mã lỗi đã được che: `smtp_auth_failed`, `smtp_tls_failed` và `smtp_config_invalid` là lỗi cấu hình cần sửa trong `<env-file>` rồi tạo lại container (bước 4). Lỗi xác minh chứng chỉ hiện được xếp là tạm thời: nó thử lại rồi cần can thiệp (khuyến nghị: xếp là vĩnh viễn; owner decision pending (D-8)).
   - Link: khi đã đặt thời điểm kích hoạt (bước 5), mở link của lời nhắc đầu tiên đến. Nó phải là `https://<nas-host>/#/review/<payroll-date>`, yêu cầu đăng nhập rồi mở màn hình review.
   - Người nhận đã nhận: chủ sở hữu xác nhận trong hộp thư rằng đúng một thư đã đến từ người gửi `MAIL_FROM`, có PDF, và PDF đó bằng bản trong ứng dụng (kể cả thư mục spam). Một thư được chấp nhận mà không bao giờ đến là việc của nhà cung cấp hoặc hộp thư, không phải kết quả của ứng dụng.
   - Một lần thử `uncertain` không được gửi lại một cách mù quáng: kiểm tra hộp thư và nhà cung cấp, rồi ghi quyết định vào lịch sử gửi trước (mục 7 bước 2, [05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Gửi bền vững").
   - Sau sự cố ở SMTP thật, một lời nhắc có thể đến hai lần (khuyến nghị: chấp nhận; owner decision pending (D-7)).
   - Log và trạng thái không chứa mật khẩu hay token. Hãy backup sau kỳ thật đầu tiên (mục 4).
   - Có gì bất thường: hủy kích hoạt (mục 14).

## 14. Hủy kích hoạt

Hủy kích hoạt khi một lần gửi sai hoặc bất ngờ, nhà cung cấp lỗi, hoặc chủ sở hữu quyết định dừng. Dữ liệu được giữ nguyên. **[owner NAS step, unverified]**

1. Nếu đã đặt thời điểm kích hoạt thì xóa nó trước, khi ứng dụng đang chạy (lệnh gọi được ghi audit và sau đó không có gì được tự động chốt). Dùng lệnh gọi console ở mục 13 bước 5 với `active_from: null` và một lý do. Kiểm tra trạng thái quản trị hiển thị "Not activated".
2. Xem trạng thái quản trị để biết có lần gửi nào đang xếp hàng hay giữ lease không. Job gửi chạy sau bước 4 sẽ ghi vào thư mục capture: đó không phải thư thật. Lịch sử của chủ sở hữu hiện nó là "Accepted by the mail server", và chỉ bản ghi API của lần thử mới cho thấy provider response `captured` cùng provider id bắt đầu bằng `capture-`. Hãy chờ tới khi không còn gì xếp hàng hay giữ lease (runner khỏe tìm thấy việc trong khoảng một phút), hoặc chấp nhận rằng các lần gửi đó chỉ được capture và báo người nhận bằng tay.
3. Sửa `<env-file>`: bỏ đặt hoặc xóa `PRODUCTION_SENDING_ENABLED` và đặt `OUTBOUND_MODE=capture`. Xóa các giá trị `SMTP_*` khỏi file và chỉ giữ chúng trong bản riêng của chủ sở hữu.
4. Tạo lại container để file được đọc, rồi kiểm tra trạng thái:

   ~~~bash
   <compose> up --detach --force-recreate --no-build
   <compose> ps
   ~~~

   Trạng thái quản trị cho thấy "Outbound mode: Capture only (nothing leaves the server)" và kích hoạt "Not activated". Rồi kiểm tra file: `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` phải in ra `0`.
5. Giữ dữ liệu: không bao giờ xóa `<data-dir>`. Không bao giờ chạy hai hàng đợi: không khởi động instance khác trên cùng dữ liệu và không bao giờ khởi động instance đã restore (mục 6) khi bản đang chạy còn chạy.
6. Một kỳ đã nộp nhầm vẫn nằm trong hồ sơ (đã chốt, đã ghi sổ cái, có audit). Nó được sửa bằng một hiệu chỉnh có lý do, không bao giờ bị xóa ([05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Sửa và gửi lại").
7. Ghi ngày và lý do vào nhật ký riêng của chủ sở hữu.

## 15. Thẻ rollback cho lần cài đặt đầu tiên

Pilot là lần cài đặt đầu tiên, nên không có schema hay image production cũ hơn để rollback về. Rollback nghĩa là dừng gửi thật và quay lại Excel. Hãy điền thẻ này trước khi kích hoạt. Bản riêng của chủ sở hữu giữ giá trị thật; bản được theo dõi chỉ giữ các chỗ giữ chỗ (recommended; owner decision pending (D-11)).

| Trường | Giá trị |
|---|---|
| Commit phát hành | `<release-commit>` |
| Source digest | `<source-digest>` |
| Image ID build trên NAS | `<image-id>` |
| Backup trước kích hoạt | `<backup-name>` |
| Hash manifest của backup đó | `<manifest-sha256>` |
| Bản sao trên thiết bị riêng của backup và `<env-file>` ở chế độ capture | nơi giữ |
| Ngày kích hoạt | thời điểm UTC |

1. Hủy kích hoạt (mục 14).
2. Giữ dữ liệu. Không xóa `<data-dir>` hay `<backup-dir>`.
3. Quay lại workbook Excel cho kỳ đó (bản riêng của chủ sở hữu; template được theo dõi chỉ là mẫu). Dữ liệu ứng dụng vẫn là hồ sơ về những gì đã nộp.
4. Thư đã gửi không thu hồi được. Đọc từ lịch sử gửi xem những gì đã đi, để không gì bị gửi hay nhập hai lần bằng tay.
5. Chỉ restore khi dữ liệu hỏng hoặc sai, không bao giờ đè lên dữ liệu đang chạy. Đối chiếu `sha256sum <backup-dir>/<backup-name>/manifest.json` với `<manifest-sha256>`, rồi restore `<backup-name>` cô lập (mục 6) vào một thư mục thật mới, và đối soát (mục 7). Instance đã restore bị tạm dừng, và các thay đổi sau backup đó không có trong nó. Với instance restore chỉ để kiểm tra, trỏ `TIMESHEET_ENV_FILE` tới bản sao được bảo vệ của `<env-file>` ở chế độ capture đã giữ ở mục 13 bước 3; file đang chạy chứa chế độ SMTP và cờ sau khi kích hoạt. Không bao giờ chạy hai hàng đợi.
6. Quy tắc R-A3 (recommended; owner decision pending (D-1)): khi rollback restore một backup của schema cũ hơn, bản build cũ chạy với `JOB_RUNNER=off` cho tới khi đối soát xong (mục 8, Rollback). Ở lần cài đặt đầu tiên không có schema production cũ hơn, nên điều này chỉ quan trọng sau một lần nâng cấp sau này có thêm migration; hãy xem lại trước lần nâng cấp đó.
7. Để thử lại, lặp lại mục 13 từ bước tự kiểm tra với một backup trước kích hoạt mới.

## 16. Ghi chú vận hành cho pilot

1. Migrate một lần trước lần khởi động đầu tiên (R-A2). Nhiều tiến trình cùng mở một file CSDL hoàn toàn mới có thể gặp `SQLITE_BUSY`. Khởi động một instance, chờ tới khi `<compose> ps` báo nó khỏe, rồi mới chạy lệnh CLI nào hoặc khởi động thứ khác trên dữ liệu đó. Để migrate tường minh trước: `<compose> run --rm --no-deps timesheet <cli> migrate`. **[owner NAS step, unverified]**
2. Giữ đường dẫn tường minh khi dùng CLI trên máy chủ (R-A8). Production từ chối khi thiếu `DATABASE_PATH`, nhưng một lệnh bảo trì CLI chạy ngoài container mà thiếu nó sẽ quay về CSDL phát triển. Trong container, file env đặt cả hai; trên máy chủ hãy đặt `DATA_DIR` và `DATABASE_PATH` tường minh, là đường dẫn tuyệt đối trên `<data-dir>`, cho mọi lệnh.
3. Bảo vệ backup trước nâng cấp (R-RA2). Một lần `--prune` sau đó trong cùng ngày UTC xóa backup trước nâng cấp đã ghép đôi: hãy chép nó sang chỗ khác (mục 4 bước 3) trước khi nâng cấp, hoặc chạy lần dọn đầu vào ngày khác.
4. Restore vào một thư mục thật mới (R-RA9). Tạo `<restore-dir>` bằng `mkdir`; không bao giờ trỏ nó vào junction hay liên kết tượng trưng (khi đó restore lỗi `write_failed` thay vì bị từ chối là nằm trong dữ liệu đang chạy).
5. Lưu cài đặt nộp trước khi kích hoạt (WP3 R8, R-WA3). Khi tự động nộp đã kích hoạt, tài khoản chưa từng lưu chúng nhận lời nhắc trước hạn, kể cả tài khoản quản trị tạo bởi bootstrap. Hãy dùng tài khoản quản trị làm tài khoản timesheet của chủ sở hữu, hoặc lưu cài đặt của nó; kiểm tra cờ "Not set up" trong danh sách tài khoản quản trị đã trống với mọi tài khoản đang hoạt động.
6. Sau restore và đối soát của nó, hãy backup: instance đã restore báo backup là `never` cho tới lúc đó (mục 7).

## Bảng ánh xạ lệnh

| Lệnh hoặc bước | Nơi đã kiểm chứng |
|---|---|
| `<compose> up --detach --build`, `ps`, `logs`, `restart` | Drill stage 1 |
| `<cli> bootstrap --config /data/bootstrap.json` | Drill stage 1 |
| `<cli> bootstrap --new-token` | Owner NAS step, unverified (chỉ có test tích hợp) |
| `<cli> backup --to /data/backups` | Drill stage 2 |
| `<cli> backup --to /data/backups --prune` | Drill stage 2 (backup); `--prune` bằng test tích hợp; mục Task Scheduler là owner NAS step, unverified |
| `<cli> backup prune --in /data/backups --dry-run` | Drill stage 2 |
| `<cli> restore --from ... --to ...` trong container dùng một lần | Drill stage 3 |
| `<cli> outbound release` (xem trước), `--job <id> --confirm`, `--all --confirm` | Drill stage 3 |
| `<cli> outbound resume`, `outbound resume --confirm` | Drill stage 3 |
| `<cli> outbound drop --job <id> --confirm` | Owner NAS step, unverified (chỉ có test tích hợp) |
| Nâng cấp: `<compose> up --detach --build` trên schema cũ hơn | Drill stage 4 |
| Rollback: `<cli> restore ... --keep-schema` (bị từ chối), rồi `--keep-schema --confirm` | Drill stage 5 |
| Bản build trước khởi động với `JOB_RUNNER=off` | Owner NAS step, unverified (quy tắc của docs/07) |
| `docker buildx imagetools inspect <tag>` | Owner NAS step, unverified (chạy một lần trong WP4-T04) |
| `<compose> build --no-cache` | Drill stage 1 (drill build image) |
| Nhập và số dư mở đầu qua `/api/imports` và `/api/ot/opening-balance` | Drill stage 6 |
| Cài đặt NAS: chủ sở hữu thư mục, file env, reverse proxy, NTP, Task Scheduler, bản sao trên thiết bị riêng, cảnh báo máy chủ | Owner NAS step, unverified |
| Kích hoạt pilot: tự kiểm tra capture, backup trước kích hoạt và `sha256sum` của manifest, `OUTBOUND_MODE=smtp` với `PRODUCTION_SENDING_ENABLED=true`, `<compose> up --detach --force-recreate --no-build` | Owner NAS step, unverified (drill không bao giờ gửi thư thật) |
| `PUT /api/admin/automation/activation` từ console trình duyệt của quản trị viên đã đăng nhập (đặt và xóa) | Owner NAS step, unverified (chỉ có test tích hợp) |
| Hủy kích hoạt: xóa thời điểm, `OUTBOUND_MODE=capture`, bỏ cờ, tạo lại container | Owner NAS step, unverified |
| Thẻ rollback cho lần cài đặt đầu tiên | Owner NAS step, unverified |
| `<compose> run --rm --no-deps timesheet <cli> migrate` | Owner NAS step, unverified |
