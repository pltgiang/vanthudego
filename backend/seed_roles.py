import os
import sys
import markdown

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.help_center.model import HelpArticle
from sqlalchemy import text

def md_to_html(md_text):
    if not md_text.strip():
        return ""
    return markdown.markdown(md_text, extensions=['tables', 'fenced_code'])

def seed_roles():
    db: Session = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.execute(text("TRUNCATE TABLE tab_help_article;"))
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()

        # --- LEVEL 1: VAI TRÒ ---
        
        role_nspt = HelpArticle(title="Nhân viên Mua hàng (NSPT)", sort_order=1, parent_id=None)
        db.add(role_nspt)
        
        role_tp = HelpArticle(title="Trưởng phòng / Quản lý", sort_order=2, parent_id=None)
        db.add(role_tp)
        
        db.commit()
        db.refresh(role_nspt)
        db.refresh(role_tp)

        # --- LEVEL 2 & 3 CHO NSPT ---
        
        # 1. Khảo sát giá
        survey = HelpArticle(title="Khảo sát giá", sort_order=1, parent_id=role_nspt.id)
        db.add(survey)
        db.commit()
        db.refresh(survey)
        
        survey_intro = HelpArticle(
            title="1. Giới thiệu Yêu cầu Khảo sát",
            sort_order=1,
            parent_id=survey.id,
            content=md_to_html("""
Bài viết này giúp bạn làm quen với giao diện Khảo sát giá và nắm được mục đích của chức năng này trong hệ thống.

## Mục đích của Yêu cầu Khảo sát
Tính năng này giúp bạn thu thập báo giá từ nhiều nhà cung cấp khác nhau cho cùng một danh sách mặt hàng, sau đó hệ thống sẽ giúp bạn so sánh và lựa chọn nhà cung cấp có mức giá, chính sách tốt nhất.

## Truy cập tính năng
Trên thanh menu bên trái, nhấp vào **Mua hàng** > **Khảo sát giá**.
Giao diện sẽ hiển thị danh sách tất cả các Yêu cầu khảo sát bạn đang phụ trách.
""")
        )
        db.add(survey_intro)

        survey_ops = HelpArticle(
            title="2. Thao tác tạo và gửi Khảo sát",
            sort_order=2,
            parent_id=survey.id,
            content=md_to_html("""
## Bước 1: Tạo mới Yêu cầu Khảo sát
1. Tại màn hình danh sách, nhấn nút **Thêm mới** ở góc trên cùng bên phải.
2. Điền các thông tin chung: Tiêu đề khảo sát, Hạn chót nhận báo giá, Ghi chú.
3. Ở phần chi tiết, nhấn **Thêm mặt hàng** để chọn các sản phẩm cần mua.

## Bước 2: Thêm Nhà cung cấp
Bạn cần chỉ định ít nhất 2 nhà cung cấp để hệ thống có thể thực hiện so sánh. Nhấp vào tab **Nhà cung cấp** và chọn các NCC từ danh sách.

## Bước 3: Gửi báo giá
Sau khi nhập đầy đủ thông tin, nhấn **Lưu nháp** để kiểm tra lại, hoặc nhấn **Gửi duyệt** để chuyển cho Trưởng phòng phê duyệt tiến hành khảo sát.
""")
        )
        db.add(survey_ops)
        
        # 2. Đơn mua hàng
        po = HelpArticle(title="Đơn mua hàng (PO)", sort_order=2, parent_id=role_nspt.id)
        db.add(po)
        db.commit()
        db.refresh(po)

        po_intro = HelpArticle(
            title="1. Tổng quan Đơn mua hàng",
            sort_order=1,
            parent_id=po.id,
            content=md_to_html("""
Đơn mua hàng (PO) là chứng từ chính thức xác nhận việc mua hàng với nhà cung cấp. 
Hệ thống sẽ dựa vào PO để tự động theo dõi tiến độ giao hàng, nhập kho và tính toán công nợ.

## Thông tin quan trọng
- Khi bạn lưu Đơn mua hàng, hệ thống chưa tính công nợ ngay.
- Chỉ khi Trưởng phòng đã **Duyệt**, bạn mới có thể thực hiện thao tác nhận hàng.
""")
        )
        db.add(po_intro)

        # --- LEVEL 2 CHO TRƯỞNG PHÒNG ---
        
        tp_duyet = HelpArticle(
            title="Hướng dẫn phê duyệt Chứng từ",
            sort_order=1,
            parent_id=role_tp.id,
            content=md_to_html("""
Là Trưởng phòng / Quản lý, nhiệm vụ chính của bạn là kiểm tra và phê duyệt các chứng từ do Nhân viên Mua hàng đệ trình.

## Cách xem danh sách chờ duyệt
1. Truy cập vào menu **Cần xử lý** trên thanh điều hướng.
2. Hệ thống sẽ liệt kê toàn bộ Yêu cầu Mua hàng, Phiếu khảo sát và Đơn mua hàng đang ở trạng thái **Chờ duyệt**.

## Xử lý chứng từ
- **Duyệt:** Nhấn nút Duyệt nếu thông tin hợp lệ. Chứng từ sẽ được chuyển sang bước tiếp theo.
- **Từ chối:** Trả lại chứng từ cho nhân viên kèm theo lý do bắt buộc.
""")
        )
        db.add(tp_duyet)

        db.commit()
        print("Đã tạo dữ liệu mẫu Hướng dẫn sử dụng theo Role-based thành công!")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
