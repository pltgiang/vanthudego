# Hướng dẫn kết nối Frontend trên Vercel với Backend Local qua Ngrok

Tài liệu này ghi chú lại cách giải quyết lỗi "trắng dữ liệu" hoặc lỗi "Provisional headers are shown" khi gọi API từ Vercel xuống máy local.

## Bản chất vấn đề
- Khi chạy Docker ở local, chúng ta có 2 cổng:
  - Cổng Web / Frontend (Vite Dev Server): `8082` (hoặc `5173`).
  - Cổng API / Backend (FastAPI): `8001` (hoặc `8000`).
- Frontend trên Vercel là phiên bản đã được Build (tĩnh), nó **không cần** kết nối tới Vite Dev Server (`8082`) trên máy bạn nữa.
- Vercel chỉ cần **Dữ liệu**, do đó nó phải gọi thẳng vào **Cổng API Backend (8001)** trên máy bạn.

## Các bước thiết lập đúng 100%

### Bước 1: Khởi động Ngrok cho API
1. Đảm bảo Backend Docker đang chạy ở cổng 8001.
2. Mở terminal và chạy lệnh để tunnel cổng 8001:
   ```bash
   ngrok http 8001
   ```
3. Copy đường link Ngrok được sinh ra (ví dụ: `https://abcd-123.ngrok-free.dev`). 
   > **Lưu ý:** Không được tắt terminal này trong suốt quá trình test. Không copy thêm dấu `/` ở cuối link.

### Bước 2: Cấu hình trên Vercel
1. Đăng nhập vào trang quản trị Vercel.
2. Chọn dự án của bạn (ví dụ: `vanthudego`).
3. Chuyển sang tab **Settings** -> **Environment Variables**.
4. Sửa giá trị của biến `VITE_API_URL` thành đường link Ngrok vừa copy ở trên.
5. Nhấn **Save**.

### Bước 3: Redeploy (Bắt Buộc)
Do Frontend của Vite nhúng biến môi trường trực tiếp vào code JS lúc build, nên sau khi sửa biến môi trường, bạn **BẮT BUỘC** phải Redeploy:
1. Chuyển sang tab **Deployments**.
2. Tại bản deploy mới nhất, nhấn dấu 3 chấm (`...`) ở góc phải -> Chọn **Redeploy**.
3. Chờ quá trình build hoàn tất (khoảng 1 phút).

### Bước 4: Kiểm tra
Mở lại trang web Vercel (ví dụ: `https://vanthudego.vercel.app/`), mở tab Network trong F12 để kiểm tra. Các API request sẽ gọi thành công (200 OK) về link Ngrok, và giao diện sẽ hiển thị đầy đủ dữ liệu từ Database ở máy local của bạn.
