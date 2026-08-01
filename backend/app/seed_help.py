import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.modules.help_center.model import HelpArticle, HelpArticleSlide

# Define the structure
tree = [
    {
        "title": "Bắt đầu",
        "content": """
<h1 class="heraAdit-title heraComp_font-gilroy">Hướng dẫn sử dụng Trung tâm Hướng dẫn</h1>
<div class="readTimeAndTag">
  <span class="heraAdit-readTime" style="color: #646a73; font-size: 14px; display: flex; align-items: center; gap: 6px;">
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 8a1 1 0 1 1 2 0v3h3a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1V8Z" fill="currentColor"></path><path d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Zm0-2a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" fill="currentColor"></path></svg> 5 min read
  </span>
</div>

<div class="heraAdit-articleBody">
  <div>
    <h2>I. Giới thiệu</h2>
    <p>Chào mừng bạn đến với <strong>Trung tâm Hướng dẫn (Help Center)</strong> của hệ thống Procurement. Bài viết này giới thiệu cách bạn có thể tìm kiếm, tra cứu các quy trình và khai thác tối đa kho tài liệu nội bộ.</p>
    <p>Tùy thuộc vào quyền hạn (Vai trò) của bạn trong hệ thống, bạn sẽ nhìn thấy số lượng tài liệu khác nhau. Những người dùng không có quyền truy cập vào một chức năng cụ thể sẽ không thấy tài liệu hướng dẫn của chức năng đó.</p>
  </div>

  <div>
    <h2>II. Các bước thao tác</h2>
    
    <h3>Truy cập vào trang chủ Hướng dẫn</h3>
    <p>Từ bất kỳ đâu trên hệ thống Procurement, nhấp vào biểu tượng <strong>? Hướng dẫn</strong> hoặc <strong>Trung tâm Hướng dẫn</strong> ở thanh điều hướng để truy cập vào phân hệ này.</p>
    
    <h3>Sử dụng thanh điều hướng</h3>
    <ul>
      <li><strong>Mở rộng/Thu gọn thư mục:</strong> Nhấp vào biểu tượng mũi tên ở bên trái tên thư mục để mở rộng hoặc thu gọn danh sách các bài viết bên trong.</li>
      <li><strong>Bài viết đang đọc:</strong> Bài viết bạn đang mở sẽ được bôi nền màu xanh nhạt <span style="background-color: #e8f3ff; color: #3370ff; padding: 2px 6px; border-radius: 4px; font-weight: 500;">như thế này</span> ở thanh menu trái.</li>
    </ul>

    <h3>Tìm kiếm nội dung</h3>
    <p>Bạn có thể tra cứu nhanh chóng bất kỳ quy trình nào bằng thanh tìm kiếm ở góc trên màn hình.</p>
    <ul>
      <li>Nhấp vào ô tìm kiếm (hoặc bấm phím tắt <code>Ctrl + K</code> nếu có).</li>
      <li>Nhập từ khóa liên quan đến quy trình bạn cần (Ví dụ: <em>"Tạo PO"</em>, <em>"Thanh toán"</em>).</li>
      <li>Kết quả sẽ hiển thị ngay bên dưới. Nhấp vào kết quả để chuyển thẳng đến bài viết đó.</li>
    </ul>
  </div>

  <div>
    <h2>III. Điều hướng bài viết</h2>
    <div style="background-color: rgb(240, 244, 255); border-radius: 8px; padding: 16px; display: flex; gap: 12px;">
       <div style="font-size: 20px; line-height: 1;">💡</div>
       <div>
         <strong>Mẹo đọc tài liệu:</strong><br/>
         Ở cuối mỗi bài viết luôn có một nút <strong>Bài tiếp theo</strong>. Bạn có thể nhấn vào đó để đọc tài liệu theo một mạch xuyên suốt như đang đọc một cuốn sách.
       </div>
    </div>
  </div>
</div>
"""
    },
    {
        "title": "1. Tổng quan & Trang chủ",
        "content": """
<h1>Tổng quan hệ thống</h1>
<p>Hệ thống DMS Tool được thiết kế để số hóa toàn bộ quy trình từ yêu cầu mua sắm, khảo sát nhà cung cấp, đến khi hàng về kho và thanh toán công nợ.</p>
<h3>Trang chủ (Dashboard)</h3>
<p>Tại trang chủ, bạn có thể xem <strong>Báo cáo mua hàng</strong> và <strong>Báo cáo khảo sát</strong>.</p>
<ul>
    <li>Biểu đồ số lượng yêu cầu mua hàng theo trạng thái.</li>
    <li>Bảng xếp hạng nhà cung cấp theo mức độ uy tín.</li>
</ul>
        """,
        "slides": [
            {"img": "https://placehold.co/800x400/0ea5e9/ffffff?text=Dashboard+Chinh", "cap": "Giao diện Trang chủ tổng hợp tất cả báo cáo và biểu đồ."},
            {"img": "https://placehold.co/800x400/10b981/ffffff?text=Bieu+Do+Thong+Ke", "cap": "Xem trực quan các số liệu khảo sát và mua hàng."}
        ],
        "children": [
            {
                "title": "Báo cáo mua hàng",
                "content": "<p>Hiển thị các chỉ số mua hàng, bao gồm tổng chi tiêu, tỷ lệ hoàn thành PO, và số lượng hàng đang chờ nhập kho.</p>",
            }
        ]
    },
    {
        "title": "2. Dành cho Phòng ban (Người Yêu Cầu)",
        "content": "<h1>Quy trình Yêu cầu Mua Hàng (PYC)</h1><p>Các phòng ban có nhu cầu vật tư, thiết bị sẽ tạo Yêu cầu mua hàng trên hệ thống để chuyển đến bộ phận mua sắm.</p>",
        "children": [
            {
                "title": "Yêu cầu mua hàng",
                "content": """
<h2>Quản lý Yêu cầu mua hàng (PYC)</h2>
<p>Chức năng này cho phép bạn tạo, theo dõi và quản lý các yêu cầu mua sắm.</p>

<h3>1. Điểm bắt đầu</h3>
<p>Truy cập vào menu <strong>Mua hàng</strong> > <strong>Yêu cầu mua hàng</strong> (hoặc đường dẫn <code>/purchase-requests</code>). Sau đó nhấn nút <strong>+ Thêm mới</strong> ở góc trên bên phải màn hình.</p>

<h3>2. Hướng dẫn nhập thông tin chung (Header)</h3>
<ul>
    <li><strong>Tiêu đề:</strong> Đặt tên ngắn gọn cho yêu cầu (ví dụ: Mua sắm văn phòng phẩm T8).</li>
    <li><strong>Mức độ ưu tiên:</strong> Chọn Bình thường hoặc Gấp. Nếu Gấp, hệ thống sẽ tự động gắn cờ cảnh báo.</li>
    <li><strong>Ngày cần hàng:</strong> Hạn chót mà phòng ban cần nhận được vật tư. Hệ thống sẽ căn cứ vào ngày này để đánh giá KPI giao hàng.</li>
    <li><strong>Bộ phận:</strong> Tự động lấy theo bộ phận của bạn (Có thể chọn lại nếu bạn mua hộ bộ phận khác).</li>
    <li><strong>Lý do mua:</strong> (Không bắt buộc) Mô tả chi tiết lý do tại sao cần mua.</li>
</ul>

<h3>3. Hướng dẫn nhập chi tiết sản phẩm (Items)</h3>
<p>Bấm nút <strong>Thêm dòng</strong> để thêm các mặt hàng:</p>
<ul>
    <li><strong>Tên hàng:</strong> Chọn hoặc nhập tên hàng hóa cần mua.</li>
    <li><strong>Đơn vị tính:</strong> Chọn đơn vị (Cái, Hộp, Bộ...).</li>
    <li><strong>Số lượng:</strong> Nhập số lượng cần yêu cầu.</li>
    <li><strong>Ghi chú dòng:</strong> Ghi chú riêng cho mặt hàng này (VD: Yêu cầu màu xanh).</li>
</ul>

<h3>4. Kết thúc thao tác</h3>
<p>Sau khi đã điền đủ thông tin, bạn nhấn nút <strong>Lưu lại</strong> (để lưu nháp) hoặc <strong>Gửi duyệt (Next)</strong> ở cuối trang. Khi gửi duyệt, yêu cầu sẽ chuyển sang trạng thái "Chờ duyệt" và gửi thông báo đến Quản lý bộ phận của bạn.</p>
                """,
                "slides": [
                    {"img": "https://placehold.co/800x400/6366f1/ffffff?text=1.+Truy+Cap+Menu", "cap": "Vào Mua hàng -> Yêu cầu mua hàng -> Thêm mới."},
                    {"img": "https://placehold.co/800x400/8b5cf6/ffffff?text=2.+Dien+Thong+Tin+Chung", "cap": "Điền Tiêu đề, Mức độ ưu tiên và Ngày cần hàng."},
                    {"img": "https://placehold.co/800x400/d946ef/ffffff?text=3.+Them+San+Pham", "cap": "Thêm danh sách các mặt hàng cụ thể."},
                    {"img": "https://placehold.co/800x400/f43f5e/ffffff?text=4.+Gui+Duyet", "cap": "Sau khi điền đủ, nhấn nút Gửi duyệt để đẩy quy trình."}
                ]
            }
        ]
    },
    {
        "title": "3. Dành cho Nhân viên Mua hàng",
        "content": "<h1>Nghiệp vụ Mua hàng & Khảo sát</h1><p>Nhân viên mua sắm tiếp nhận yêu cầu, tiến hành khảo sát giá và lên đơn đặt hàng.</p>",
        "children": [
            {
                "title": "Yêu cầu báo giá",
                "content": "<p>Chức năng gom nhóm các mặt hàng từ nhiều Yêu cầu mua hàng khác nhau để tạo một danh sách cần xin báo giá từ Nhà cung cấp.</p><ul><li><strong>Nhóm hàng hóa:</strong> Giúp tối ưu quá trình lấy báo giá theo lô.</li></ul>"
            },
            {
                "title": "Khảo sát & Phiếu khảo sát",
                "content": """
<h2>Tiến hành Khảo sát Giá</h2>
<p>Sau khi có báo giá từ các nhà cung cấp, nhân viên mua sắm nhập dữ liệu vào hệ thống để so sánh và trình duyệt.</p>

<h3>1. Điểm bắt đầu</h3>
<p>Truy cập vào menu <strong>Mua hàng</strong> > <strong>Phiếu khảo sát</strong>. Nhấn nút <strong>+ Thêm mới</strong> ở góc trên bên phải màn hình.</p>

<h3>2. Hướng dẫn nhập thông tin (Header & Items)</h3>
<p>Trong Phiếu khảo sát, bạn cần điền các thông tin sau:</p>
<ul>
    <li><strong>Yêu cầu báo giá nguồn:</strong> Chọn mã Yêu cầu báo giá (nếu có) để hệ thống tự động tải danh sách sản phẩm.</li>
    <li><strong>Sản phẩm cần khảo sát:</strong> Thêm hoặc điều chỉnh danh sách hàng hóa cần mua.</li>
    <li><strong>Nhà cung cấp khảo sát:</strong> Tại mỗi sản phẩm, nhấn <strong>Thêm báo giá</strong> để nhập thông tin của các Nhà cung cấp tham gia. (Yêu cầu ít nhất 2-3 NCC để so sánh).</li>
    <li><strong>Đơn giá:</strong> Nhập giá tiền báo giá của từng NCC.</li>
    <li><strong>Chất lượng/Uy tín & Thời gian giao hàng:</strong> Đánh giá các tiêu chí phụ để làm căn cứ chọn lựa.</li>
</ul>

<h3>3. Kết thúc thao tác</h3>
<p>Sau khi nhập đủ thông tin báo giá, bạn nhấn nút <strong>Gửi duyệt (Next)</strong>. Phiếu sẽ được chuyển cho Quản lý mua hàng để xem xét. Quản lý sẽ so sánh và nhấn nút <strong>Chốt NCC</strong> trên giao diện để chọn ra đơn vị cung cấp tốt nhất.</p>
                """,
                "slides": [
                    {"img": "https://placehold.co/800x400/0ea5e9/ffffff?text=1.+Tao+Phieu+Khao+Sat", "cap": "Vào Mua hàng -> Phiếu khảo sát -> Thêm mới."},
                    {"img": "https://placehold.co/800x400/10b981/ffffff?text=2.+Chot+Nha+Cung+Cap", "cap": "Quản lý sẽ xem bảng so sánh và nhấn nút Chốt Nhà Cung Cấp tốt nhất."}
                ]
            },
            {
                "title": "Báo cáo khảo sát",
                "content": "<p>Tổng hợp hiệu quả khảo sát, xem lịch sử giá của một mặt hàng qua các thời kỳ.</p>"
            },
            {
                "title": "Đơn mua hàng (PO)",
                "content": """
<h2>Quản lý Đơn mua hàng (PO)</h2>
<p>Chức năng sinh ra Đơn đặt hàng chính thức gửi cho Nhà cung cấp được chọn. PO là trung tâm vòng đời mua hàng — khi nhận hàng, hệ thống tự động sinh phiếu nhập kho ngầm, cập nhật tồn kho, và tạo bút toán công nợ NCC.</p>

<h3>1. Điểm bắt đầu</h3>
<p>Để tạo Đơn mua hàng, bạn truy cập vào menu <strong>Mua hàng</strong> > <strong>Đơn mua hàng</strong> trên thanh điều hướng bên trái (hoặc đường dẫn <code>/purchase-orders</code>). Sau đó nhấn vào nút <strong>+ Thêm mới</strong> ở góc trên bên phải màn hình.</p>

<h3>2. Hướng dẫn nhập thông tin chung (Header)</h3>
<ul>
    <li><strong>Mã PO:</strong> Hệ thống tự động sinh (ví dụ: PO00045). Không cần nhập.</li>
    <li><strong>Mã đơn MISA:</strong> Nhập tay. <strong>Bắt buộc</strong> nhập trước khi Gửi duyệt. Đây là mã số trên hệ thống kế toán để tham chiếu.</li>
    <li><strong>Mã PYC nguồn:</strong> (Không bắt buộc) Nhập hoặc chọn từ danh sách gợi ý. Hệ thống sẽ tự điền Bộ phận và NSPT.</li>
    <li><strong>Mã phiếu khảo sát:</strong> (Không bắt buộc) Chọn mã phiếu khảo sát để truy vết.</li>
    <li><strong>Công ty nhận hóa đơn:</strong> Chọn công ty sẽ chịu trách nhiệm thanh toán. Ảnh hưởng đến phiếu nhập kho và công nợ.</li>
    <li><strong>Nhà cung cấp bán hàng:</strong> Chọn NCC từ danh sách. Tự động điền Tên NCC, Tỷ lệ VAT và Hình thức thanh toán. (Lưu ý: Không chọn các đơn vị vận chuyển ở đây).</li>
    <li><strong>Bộ phận:</strong> Điền bộ phận yêu cầu mua hàng.</li>
    <li><strong>NSPT phụ trách:</strong> Nhân viên phụ trách mua hàng. Tự sinh theo tên người tạo đơn hoặc kéo từ PYC.</li>
    <li><strong>Ngày đặt hàng:</strong> Chọn ngày. Mặc định là ngày hôm nay. Dùng làm ngày gốc để tính hạn giao hàng.</li>
    <li><strong>Tỷ lệ VAT chung:</strong> Tự điền từ cấu hình NCC (VD: 8%). Chỉ là mức mặc định tham khảo.</li>
    <li><strong>Hình thức thanh toán NCC:</strong> Tự điền từ NCC. Hệ thống trích xuất số ngày để tính hạn thanh toán (VD: "30 ngày").</li>
    <li><strong>Đơn gấp:</strong> Đánh dấu tích nếu đây là đơn khẩn cấp. Thông báo sẽ ưu tiên gửi đến Quản lý.</li>
    <li><strong>Ghi chú:</strong> Nhập các lưu ý về đơn hàng (Hiển thị trên bản in).</li>
    <li><strong>Trạng thái hồ sơ chứng từ:</strong> Chọn từ danh sách (Chưa có chứng từ / Đã có thông tin chứng từ / Đã đủ chứng từ). Kế toán dùng để theo dõi hồ sơ vật lý.</li>
</ul>

<h3>3. Hướng dẫn nhập chi tiết dòng hàng (Items)</h3>
<p>Bấm <strong>Thêm dòng</strong> để khai báo từng mặt hàng:</p>
<ul>
    <li><strong>Mã hàng VTBB/NL:</strong> Chọn sản phẩm. Tự động điền Tên hàng, ĐVT, Phân loại.</li>
    <li><strong>Tên hàng:</strong> Nhập tay nếu không chọn mã. <strong>Bắt buộc</strong> phải có để hệ thống ghi nhận dòng hàng.</li>
    <li><strong>Tên trên hóa đơn & Xuất xứ/TSKT:</strong> Các thông tin phụ hiển thị trên bản in.</li>
    <li><strong>Mã/Tên thành phẩm (FG):</strong> Gắn mã thành phẩm để truy vết nguồn gốc.</li>
    <li><strong>Số hóa đơn theo sản phẩm & Ngày hóa đơn:</strong> Nhập số hóa đơn VAT của NCC cấp cho mặt hàng này. Khi nhập, Ngày Hóa Đơn sẽ tự điền ngày hôm nay (có thể sửa).</li>
    <li><strong>Ngày giao chứng từ cho KT:</strong> Chọn ngày bàn giao chứng từ cho Kế toán. Tự động nâng tiến độ của dòng lên "Đã gửi ĐMH cho KT".</li>
    <li><strong>NCC có sẵn hàng:</strong> Đánh dấu nếu hàng có sẵn, ảnh hưởng đến số ngày quy định giao.</li>
    <li><strong>Ngày yêu cầu có hàng:</strong> Ngày bộ phận cần nhận hàng.</li>
    <li><strong>Đơn vị tính & Số lượng yêu cầu:</strong> Chọn ĐVT và nhập SL mà phòng ban cần.</li>
    <li><strong>Số lượng đặt NCC:</strong> Nhập số lượng thực tế chốt mua với NCC.</li>
    <li><strong>Đơn giá:</strong> Nhập giá tiền VNĐ.</li>
    <li><strong>VAT % của dòng:</strong> Mặc định 8%. Từng dòng tính thuế riêng.</li>
    <li><strong>Kho nhận mặc định:</strong> Chọn kho bãi chứa hàng. Là kho mặc định cho các lần giao.</li>
    <li><strong>Ghi chú dòng:</strong> Thông tin thêm cho từng mặt hàng.</li>
</ul>

<h3>4. Khai báo Lần giao hàng (Delivery)</h3>
<p>Chỉ khả dụng sau khi đơn đã <strong>Duyệt</strong>. Trong popup chi tiết dòng hàng, bấm Thêm lần giao:</p>
<ul>
    <li><strong>Kho nhận:</strong> Có thể ghi đè kho mặc định của dòng.</li>
    <li><strong>Đơn vị vận chuyển:</strong> Chọn "NCC tự vận chuyển" hoặc chọn 1 đơn vị vận tải. Nếu chọn ĐVVT thật và nhập Cước, hệ thống sẽ tạo công nợ riêng cho nhà vận chuyển.</li>
    <li><strong>Số lượng gửi & ĐVT:</strong> Nhập số lượng NCC báo gửi.</li>
    <li><strong>Số lượng thực nhận:</strong> <strong>Quan trọng:</strong> Khi nhập > 0, hệ thống tự động sinh Phiếu nhập kho, Tồn kho, và Công nợ hàng.</li>
    <li><strong>Ngày NCC cam kết & Ngày dự kiến nhận:</strong> Chọn ngày để đối soát tiến độ.</li>
    <li><strong>Ngày nhận thực tế:</strong> Chọn ngày thực tế nhận hàng. Dùng tính toán chênh lệch trễ hạn.</li>
    <li><strong>Số hóa đơn & Cước vận chuyển:</strong> Nhập số chứng từ và Đơn giá vận chuyển.</li>
    <li><strong>Kết quả QC:</strong> Đánh giá Đạt/Thiếu/Lỗi.</li>
</ul>

<h3>5. Kết thúc thao tác</h3>
<p>Sau khi đã điền đủ thông tin chung và dòng hàng, nhấn nút <strong>Lưu lại</strong> (để lưu nháp) hoặc <strong>Gửi duyệt</strong> ở góc phải. Hệ thống sẽ đổi trạng thái từ "Nháp" sang "Chờ duyệt", đồng thời gửi thông báo đến Quản lý mua hàng để phê duyệt đơn (Bước tiếp theo).</p>
                """,
                "slides": [
                    {"img": "https://placehold.co/800x400/8b5cf6/ffffff?text=1.+Menu+Mua+Hang", "cap": "Vào Mua hàng -> Đơn mua hàng -> Thêm mới."},
                    {"img": "https://placehold.co/800x400/d946ef/ffffff?text=2.+Dien+Header", "cap": "Điền đủ các trường Header. Lưu ý mã MISA là bắt buộc khi Gửi duyệt."},
                    {"img": "https://placehold.co/800x400/f43f5e/ffffff?text=3.+Chi+Tiet+Hang", "cap": "Thêm các dòng sản phẩm, đơn giá, số lượng."},
                    {"img": "https://placehold.co/800x400/10b981/ffffff?text=4.+Gui+Duyet", "cap": "Bấm Gửi duyệt để đẩy đơn cho Quản lý phê duyệt."}
                ]
            },
            {
                "title": "Tiến độ mua hàng",
                "content": """
<h2>Theo dõi Tiến độ mua hàng</h2>
<p>Theo dõi luồng trạng thái của từng dòng sản phẩm.</p>
<h3>1. Điểm bắt đầu</h3>
<p>Truy cập menu <strong>Mua hàng</strong> > <strong>Tiến độ mua hàng</strong>.</p>
<h3>2. Các trường dữ liệu</h3>
<p>Màn hình chỉ đọc, tổng hợp từ các đơn hàng. Cung cấp bộ lọc theo Thời gian, Nhân viên, NCC.</p>
<h3>3. Kết thúc</h3>
<p>Nhấn vào từng dòng để xem chi tiết hoặc xuất Excel báo cáo (Export).</p>
"""
            }
        ]
    },
    {
        "title": "4. Dành cho Kho & Kế toán",
        "content": "<h1>Quản lý Tồn kho & Công nợ</h1><p>Khi hàng được giao, bộ phận kho thực hiện nhập kho. Kế toán đối chiếu và xử lý thanh toán.</p>",
        "children": [
            {
                "title": "Tồn kho (Nhập/Xuất)",
                "content": """
<h2>Quản lý Hàng hóa Tồn kho</h2>
<p>Xác nhận số lượng hàng thực nhận so với Đơn đặt hàng (PO).</p>
<h3>Trường dữ liệu:</h3>
<ul>
    <li><strong>Kho nhận:</strong> Vị trí lưu kho.</li>
    <li><strong>Số lượng nhập:</strong> Khớp với phiếu giao hàng của NCC.</li>
</ul>
<h3>Thao tác:</h3>
<p>Tìm PO đang chờ giao, nhấn <strong>Nhập kho</strong>, điền số lượng và đính kèm hình ảnh biên bản giao nhận.</p>
                """,
                "slides": [
                    {"img": "https://placehold.co/800x400/f59e0b/ffffff?text=Man+Hinh+Nhap+Kho", "cap": "Thủ kho kiểm tra số lượng và nhấn Nhập Kho."}
                ]
            },
            {
                "title": "Công nợ & Yêu cầu thanh toán",
                "content": """
<h2>Xử lý Công nợ</h2>
<p>Tạo các hồ sơ thanh toán sau khi hoàn tất nhập kho và có đầy đủ chứng từ (hóa đơn, biên bản).</p>
<h3>Thao tác Yêu cầu thanh toán:</h3>
<p>1. Chọn Nhà cung cấp.<br/>2. Tick chọn các Đơn hàng (PO) chưa thanh toán.<br/>3. Hệ thống tính tổng số tiền.<br/>4. Trình duyệt thanh toán lên Kế toán trưởng/Giám đốc.</p>
                """,
                "slides": [
                    {"img": "https://placehold.co/800x400/ef4444/ffffff?text=Yeu+Cau+Thanh+Toan", "cap": "Kế toán tổng hợp chứng từ và tạo Yêu cầu thanh toán."}
                ]
            }
        ]
    },
    {
        "title": "5. Danh mục Master Data",
        "content": "<h1>Quản lý Dữ liệu gốc</h1><p>Khai báo danh mục để chuẩn hóa dữ liệu đầu vào cho toàn bộ hệ thống.</p>",
        "children": [
            { "title": "Nhà cung cấp", "content": "<p>Lưu thông tin: Tên công ty, MST, Địa chỉ, Thông tin liên hệ, Đánh giá uy tín.</p>" },
            { "title": "Sản phẩm", "content": "<p>Khai báo mã hàng, Tên hàng, Đơn vị tính, Phân loại, Hình ảnh sản phẩm.</p>" },
            { "title": "Hợp đồng", "content": "<p>Lưu trữ Hợp đồng nguyên tắc, thời hạn, cảnh báo hết hạn.</p>" },
            { "title": "Kho", "content": "<p>Danh sách các kho bãi chứa hàng.</p>" },
            { "title": "Đơn vị tính", "content": "<p>Ví dụ: Cái, Hộp, Chiếc, Lít...</p>" },
            { "title": "Phân loại", "content": "<p>Phân nhóm hàng hóa (Điện tử, Văn phòng phẩm, v.v.).</p>" },
            { "title": "Phòng ban", "content": "<p>Danh sách các bộ phận trong công ty.</p>" },
            { "title": "Phân công phụ trách", "content": "<p>Định nghĩa nhân sự Mua hàng nào phụ trách ngành hàng nào.</p>" }
        ]
    },
    {
        "title": "6. Quản trị Hệ thống",
        "content": "<h1>Thiết lập cốt lõi</h1><p>Dành riêng cho Quản trị viên (Admin) để cấu hình hệ thống và phân quyền.</p>",
        "children": [
            { "title": "Công ty", "content": "<p>Thiết lập thông tin công ty mẹ, chi nhánh.</p>" },
            { "title": "Nhân sự", "content": "<p>Thêm mới tài khoản người dùng, đổi mật khẩu, cấp quyền truy cập.</p>" },
            { "title": "Vai trò", "content": "<p>Định nghĩa các Role và phân quyền (RBAC) chi tiết từng thao tác.</p>" },
            { "title": "Cấu hình hệ thống", "content": "<p>Các thông số chung (Ngày khóa sổ, Giới hạn upload, Email server).</p>" },
            { "title": "Quản lý Import", "content": "<p>Xem lại lịch sử import dữ liệu từ Excel.</p>" },
            { "title": "Sao lưu CSDL", "content": "<p>Thực hiện dump file cơ sở dữ liệu để backup an toàn.</p>" }
        ]
    }
]

def seed_help():
    db = SessionLocal()
    try:
        # Clear existing data
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.execute(text("TRUNCATE TABLE tab_help_article_slide;"))
        db.execute(text("TRUNCATE TABLE tab_help_article;"))
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("Cleared existing help articles.")

        def create_article(node, parent_id=None, sort_order=0):
            article = HelpArticle(
                title=node["title"],
                content=node.get("content", ""),
                parent_id=parent_id,
                sort_order=sort_order
            )
            db.add(article)
            db.flush() # get ID
            
            # Create slides if any
            slides = node.get("slides", [])
            for idx, s in enumerate(slides):
                slide = HelpArticleSlide(
                    article_id=article.id,
                    image_url=s["img"],
                    caption=s["cap"],
                    step_order=idx + 1
                )
                db.add(slide)
            
            # Children
            children = node.get("children", [])
            for child_idx, child in enumerate(children):
                create_article(child, article.id, child_idx + 1)

        # Loop root
        for i, root_node in enumerate(tree):
            create_article(root_node, None, i + 1)
        
        db.commit()
        print("Seeded help articles successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_help()
