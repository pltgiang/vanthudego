import asyncio
import os
import sys

# Thêm đường dẫn backend vào sys.path để import được app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.help_center.model import HelpArticle

incoming_content = """
<h1>Hướng dẫn Tạo Văn bản đến</h1>
<p>Chức năng <strong>Thêm mới văn bản đến</strong> giúp bạn ghi nhận các công văn, quyết định hoặc thông báo gửi đến công ty từ các cơ quan bên ngoài hoặc nội bộ.</p>

<h2>Bước 1: Truy cập chức năng</h2>
<ul>
  <li>Mở <strong>Menu trái (Left Menu)</strong>.</li>
  <li>Chọn mục <strong>Văn bản đến</strong>.</li>
  <li>Click vào nút <strong><i class="ti ti-plus"></i> Thêm mới</strong> ở góc phải màn hình để mở giao diện thêm mới văn bản.</li>
</ul>

<h2>Bước 2: Tải lên Tệp văn bản</h2>
<p>Tại khối <strong>Tệp văn bản</strong>, bạn có thể tải lên file scan hoặc file gốc của văn bản đến:</p>
<ul>
  <li>Kéo thả tệp trực tiếp vào khu vực tải lên.</li>
  <li>Hoặc click vào nút <strong>Tải tệp từ máy tính</strong> để chọn file (.pdf, .docx, ...).</li>
</ul>

<h2>Bước 3: Nhập Thông tin chính</h2>
<p>Điền các thông tin quan trọng nhất của văn bản vào các trường sau:</p>
<ul>
  <li><strong>Tên văn bản (*)</strong>: Nhập trích yếu hoặc tên gọi ngắn gọn của văn bản.</li>
  <li><strong>Số văn bản (*)</strong>: Nhập số/ký hiệu được ghi trên văn bản đến.</li>
  <li><strong>Quan trọng / Khẩn cấp</strong>: Click vào nút nếu văn bản có tính chất tương ứng.</li>
  <li><strong>Ngày trên văn bản (*)</strong>: Chọn ngày ký được ghi trên văn bản.</li>
  <li><strong>Loại văn bản</strong>: Chọn phân loại (Quyết định, Thông báo, Công văn...).</li>
  <li><strong>Người phê duyệt</strong>: Chọn Trưởng phòng hoặc người có thẩm quyền xử lý tiếp theo.</li>
  <li><strong>Thời hạn yêu cầu / Thông tin liên hệ</strong>: Bổ sung thêm thời gian cần phản hồi hoặc thông tin của người gửi.</li>
</ul>

<h2>Bước 4: Thiết lập Tình trạng xử lý</h2>
<p>Đây là khối quản lý luồng công việc đối với văn bản này:</p>
<ul>
  <li><strong>Tình trạng</strong>: Chọn trạng thái hiện tại (Chưa xử lý / Đang xử lý / Đã xử lý).</li>
  <li><strong>Hạn xử lý</strong>: Ngày cuối cùng phải hoàn tất công việc liên quan.</li>
  <li><strong>Người liên quan / Người xử lý / Người nhận báo cáo</strong>: Chọn danh sách nhân sự tham gia vào luồng xử lý văn bản này. Bạn có thể chọn nhiều người.</li>
  <li><strong>Kết quả xử lý</strong>: Ghi chú ngắn gọn kết quả sau khi đã xử lý xong.</li>
</ul>

<h2>Bước 5: Bổ sung Thông tin lưu trữ</h2>
<ul>
  <li><strong>Hình thức văn bản</strong>: Chọn Bản giấy hoặc Bản điện tử.</li>
  <li><strong>Vào sổ</strong>: Chọn sổ lưu trữ (ví dụ: Sổ đến 2023).</li>
  <li><strong>Ngày đến</strong>: Mặc định là ngày hôm nay.</li>
  <li><strong>Vị trí lưu trữ</strong>: Ghi chú nơi cất giữ bản cứng (ví dụ: Tủ A, Tầng 2).</li>
  <li><strong>Số đến</strong>: Số thứ tự lưu trong sổ văn thư.</li>
  <li><strong>Trích yếu nội dung</strong>: Tóm tắt chi tiết nội dung văn bản (có thể định dạng văn bản tại đây).</li>
</ul>

<h2>Bước 6: Lưu văn bản</h2>
<p>Sau khi đã điền đầy đủ các thông tin (đặc biệt là các trường có dấu <strong>*</strong>), bạn click vào nút <strong>Lưu</strong> ở góc trên bên phải màn hình để hoàn tất.</p>
"""

outgoing_content = """
<h1>Hướng dẫn Tạo Văn bản đi</h1>
<p>Chức năng <strong>Thêm mới văn bản đi</strong> giúp bạn ban hành và quản lý các tài liệu do công ty/phòng ban phát hành gửi ra bên ngoài hoặc lưu hành nội bộ.</p>

<h2>Bước 1: Truy cập chức năng</h2>
<ul>
  <li>Mở <strong>Menu trái (Left Menu)</strong>.</li>
  <li>Chọn mục <strong>Văn bản đi</strong>.</li>
  <li>Click vào nút <strong><i class="ti ti-plus"></i> Thêm mới</strong> ở góc phải màn hình để mở giao diện tạo văn bản đi.</li>
</ul>

<h2>Bước 2: Tạo Tệp văn bản</h2>
<p>Khác với văn bản đến, bạn có thể tạo văn bản đi từ <strong>Thư viện biểu mẫu</strong> của hệ thống:</p>
<ul>
  <li>Click vào nút <strong>Chọn từ biểu mẫu</strong> để mở danh sách các mẫu văn bản có sẵn (như Đơn xin nghỉ phép, Hợp đồng, v.v.).</li>
  <li>Hệ thống sẽ tự động điền các thông tin hồ sơ của bạn vào biểu mẫu.</li>
  <li>Hoặc bạn có thể click <strong>Tải tệp từ máy tính</strong> nếu bạn đã soạn sẵn file.</li>
</ul>

<h2>Bước 3: Nhập Thông tin chính</h2>
<p>Điền các trường thông tin cơ bản sau:</p>
<ul>
  <li><strong>Tên văn bản (*)</strong>: Nhập tên/trích yếu của văn bản.</li>
  <li><strong>Số văn bản (*)</strong>: Hệ thống có thể tự động cấp số dựa trên <strong>Quy tắc đánh số</strong> hoặc bạn tự nhập.</li>
  <li><strong>Ngày ban hành (*)</strong>: Ngày chính thức phát hành văn bản.</li>
  <li><strong>Đơn vị soạn thảo</strong>: Phòng ban chịu trách nhiệm soạn văn bản này.</li>
  <li><strong>Người ký</strong>: Tên hoặc chức danh của người có thẩm quyền ký ban hành.</li>
  <li><strong>Nơi nhận</strong>: Chọn cá nhân/đơn vị sẽ nhận văn bản này (có thể chọn nhiều).</li>
  <li><strong>Người phê duyệt</strong>: Trưởng phòng duyệt nội dung trước khi ban hành.</li>
</ul>

<h2>Bước 4: Thiết lập Tình trạng xử lý</h2>
<p>Giao việc và theo dõi sau khi ban hành:</p>
<ul>
  <li><strong>Tình trạng</strong>: Chọn trạng thái xử lý của văn bản.</li>
  <li><strong>Người liên quan / Người xử lý / Người nhận báo cáo</strong>: Phân công cho những nhân sự cần thực hiện hoặc biết thông tin.</li>
</ul>

<h2>Bước 5: Thông tin lưu trữ và Liên kết</h2>
<ul>
  <li><strong>Vào sổ</strong>: Chọn Sổ văn bản đi tương ứng.</li>
  <li><strong>Văn bản liên quan</strong>: Nếu văn bản này dùng để trả lời cho một Văn bản đến nào đó, hãy chọn mã Văn bản đến tại đây để liên kết chúng với nhau.</li>
  <li><strong>Vị trí lưu trữ</strong>: Nơi lưu trữ bản cứng có chữ ký tươi.</li>
  <li><strong>Trích yếu nội dung</strong>: Viết tóm tắt đầy đủ nội dung để dễ tìm kiếm về sau.</li>
</ul>

<h2>Bước 6: Lưu và Ban hành</h2>
<p>Kiểm tra lại toàn bộ thông tin và nhấn nút <strong>Lưu</strong> ở góc trên bên phải màn hình để ghi nhận vào hệ thống.</p>
"""

def seed_data():
    db: Session = SessionLocal()
    try:
        # Create a parent folder for User Guides if it doesn't exist
        root_folder = db.query(HelpArticle).filter_by(title="Hướng dẫn sử dụng", parent_id=None).first()
        if not root_folder:
            root_folder = HelpArticle(title="Hướng dẫn sử dụng", sort_order=0, parent_id=None)
            db.add(root_folder)
            db.commit()
            db.refresh(root_folder)
        
        # Insert Incoming Document Guide
        incoming = db.query(HelpArticle).filter_by(title="Tạo Văn bản đến").first()
        if not incoming:
            incoming = HelpArticle(
                title="Tạo Văn bản đến",
                content=incoming_content,
                sort_order=1,
                parent_id=root_folder.id
            )
            db.add(incoming)
        else:
            incoming.content = incoming_content
            
        # Insert Outgoing Document Guide
        outgoing = db.query(HelpArticle).filter_by(title="Tạo Văn bản đi").first()
        if not outgoing:
            outgoing = HelpArticle(
                title="Tạo Văn bản đi",
                content=outgoing_content,
                sort_order=2,
                parent_id=root_folder.id
            )
            db.add(outgoing)
        else:
            outgoing.content = outgoing_content
            
        db.commit()
        print("Đã thêm bài hướng dẫn Tạo Văn bản đến và Tạo Văn bản đi thành công!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
