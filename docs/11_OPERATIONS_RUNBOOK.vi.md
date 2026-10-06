# Sổ tay vận hành

Sổ tay này dành cho người cài đặt và duy trì ứng dụng Timesheet trên NAS Synology của chủ sở hữu. Sổ tay dùng các lệnh đang có trong code tại thời điểm đóng băng WP4. Tiếng Anh là nguồn chuẩn; [11_OPERATIONS_RUNBOOK.md](11_OPERATIONS_RUNBOOK.md) là bản gốc của bản dịch này. Các quy tắc được áp dụng nằm ở [07 Vận hành](07_DEPLOYMENT_AND_OPERATIONS.vi.md) và [03 Kiến trúc](03_ARCHITECTURE_AND_DATA.vi.md).

**Trạng thái: đích NAS CHƯA ĐƯỢC KIỂM CHỨNG.** Mọi lệnh dưới đây chỉ được chạy thử bằng bản diễn tập container của WP4 trên máy trạm của nhà phát triển (Docker Desktop, linux/amd64, chế độ capture, dữ liệu tổng hợp). Chưa có gì được chạy trên NAS của chủ sở hữu và chưa gửi email thật. Mỗi bước được gắn một trong hai nhãn:

- **[Drill stage N]**: được `npm run drill:container` thực thi (xem "Các stage của drill" bên dưới), kèm số stage.
- **[owner NAS step, unverified]**: bước trên máy chủ mà drill không làm được (màn hình DSM, Task Scheduler, thiết bị thứ hai, reverse proxy). Lần chạy đầu trên NAS chính là lần kiểm chứng.

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
5. Sao chép `.env.example` thành `<env-file>`, quyền 600, và đặt tối thiểu `APP_ORIGINS`, `PUBLIC_BASE_URL` (https), `MAIL_FROM` và `TRUSTED_PROXY_ADDRESSES`. Production từ chối khởi động nếu thiếu `DATA_DIR` và `DATABASE_PATH` tuyệt đối tường minh, `APP_ORIGINS` và `PUBLIC_BASE_URL`. Giữ `OUTBOUND_MODE=capture` và không bao giờ đặt `PRODUCTION_SENDING_ENABLED`: gửi thật thuộc pilot WP5, sau khi chủ sở hữu cho phép. Ứng dụng không cần session secret; thông tin đăng nhập SMTP là bí mật duy nhất nó có thể giữ. Sau đó tạo `<project-dir>/.env` với bốn biến ở "Chỗ giữ chỗ và quy ước" (phần đầu `.env.example` chỉ gợi ý một đường dẫn: `<env-file>` là nơi `TIMESHEET_ENV_FILE` trỏ tới). **[Drill stage 1]** (drill ghi một file env tổng hợp và đặt bốn biến).
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

- Nhịp của bộ chạy, thời điểm kích hoạt tự động, chế độ và cờ của bộ gửi, và tổng số job và lần gửi.
- Backup: kết quả gần nhất, thời điểm lần thử và lần thành công gần nhất, mã lỗi và tuổi tính từ lần thành công gần nhất (cảnh báo sau 26 giờ, báo lỗi khi lần thử mới nhất thất bại).
- Đĩa: số byte trống và tổng của volume dữ liệu (không bao giờ là đường dẫn).
- Gửi ra ngoài: có đang tạm dừng không, từ khi nào và vì sao (`restored`), số lần gửi đang chờ quyết định, và số job gửi đang xếp hàng và đang bị giữ.
- Giữ lại (chỉ có trong JSON của `GET /api/admin/operations`, không có trên màn hình): lần dọn dòng job gần nhất khi nào và đã xóa bao nhiêu dòng.
- Theo từng người: các kỳ có revision kèm người nhận, với mã lỗi đã che.

**[Drill stage 3]** đọc trạng thái tạm dừng gửi từ route này sau restore; **[Drill stage 2]** tạo ra một backup mà trạng thái báo cáo. Không hiển thị: kết quả của lần `--prune` gần nhất, và mọi thứ về máy chủ. Vì vậy cần mục 11.

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
