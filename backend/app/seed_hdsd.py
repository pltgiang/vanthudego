import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.help_center.model import HelpArticle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

data = {
    "1. Dành cho Người Yêu Cầu (Các phòng ban)": {
        "Trang chủ": """
            <h2>1. Giới thiệu Trang chủ</h2>
            <p>Trang chủ là trung tâm điều khiển (Dashboard) của bạn, nơi tổng hợp các công việc cần xử lý và các chỉ số thống kê quan trọng nhất liên quan đến bạn.</p>
            <h2>2. Hướng dẫn đọc các thông tin</h2>
            <ul>
                <li><strong>Thống kê nhanh (Widget):</strong> Các khối thông tin hiển thị số lượng Yêu cầu mua hàng đang chờ duyệt, Đơn hàng đang giao, v.v. Nhấn vào từng widget để đi đến danh sách chi tiết.</li>
                <li><strong>Danh sách việc cần làm (To-do list):</strong> Liệt kê các Yêu cầu, Đơn hàng hoặc Báo giá đang chờ bạn phê duyệt hoặc xử lý. Nhấn vào biểu tượng con mắt <i class="ti ti-eye"></i> để xem chi tiết và thao tác.</li>
                <li><strong>Biểu đồ chi phí (Nếu có quyền):</strong> Hiển thị biến động ngân sách mua sắm theo tháng.</li>
            </ul>
        """,
        "Yêu cầu mua hàng (PYC)": """
            <h2>1. Giới thiệu</h2>
            <p>Chức năng <strong>Yêu cầu mua hàng (PYC)</strong> giúp nhân viên các phòng ban tạo đề xuất mua sắm tài sản, thiết bị hoặc dịch vụ. Sau khi tạo, yêu cầu sẽ được gửi lên Trưởng phòng hoặc Ban Giám đốc để phê duyệt trước khi chuyển sang bộ phận Mua hàng.</p>
            
            <h2>2. Mô tả các trường thông tin</h2>
            <table class="table table-bordered">
                <thead><tr><th>Trường dữ liệu</th><th>Bắt buộc</th><th>Mô tả & Ghi chú nhập</th></tr></thead>
                <tbody>
                    <tr><td><strong>Mã PYC</strong></td><td>Hệ thống tự tạo</td><td>Mã phiếu yêu cầu (VD: PYC-2023-0001).</td></tr>
                    <tr><td><strong>Ngày cần hàng</strong></td><td>Có</td><td>Chọn ngày bạn mong muốn nhận được hàng. Phải lớn hơn hoặc bằng ngày hiện tại.</td></tr>
                    <tr><td><strong>Lý do mua</strong></td><td>Có</td><td>Mô tả chi tiết mục đích mua hàng (VD: Thay thế thiết bị hỏng, cấp phát nhân sự mới).</td></tr>
                    <tr><td><strong>Độ ưu tiên</strong></td><td>Không</td><td>Chọn mức độ (Bình thường / Gấp / Rất gấp).</td></tr>
                    <tr><td><strong>Sản phẩm/Hàng hóa</strong></td><td>Có</td><td>Chọn từ danh mục Sản phẩm. Nếu không có trong danh mục, liên hệ Admin để thêm.</td></tr>
                    <tr><td><strong>Số lượng</strong></td><td>Có</td><td>Nhập số lượng cần mua (số dương).</td></tr>
                    <tr><td><strong>Đơn vị tính</strong></td><td>Có</td><td>Tự động điền theo sản phẩm đã chọn.</td></tr>
                </tbody>
            </table>

            <h2>3. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>Thêm mới:</strong> Nhấn nút <button class="btn btn-primary btn-sm"><i class="ti ti-plus"></i> Tạo mới</button> ở góc trên bên phải. Điền đầy đủ thông tin và nhấn "Lưu nháp" hoặc "Gửi duyệt".</li>
                <li><strong>Sửa/Xóa:</strong> Trong bảng danh sách, cột Thao tác, nhấn icon <i class="ti ti-edit"></i> để sửa (chỉ khi đang ở trạng thái Nháp). Nhấn <i class="ti ti-trash"></i> để xóa phiếu nháp.</li>
                <li><strong>Gửi duyệt:</strong> Chọn phiếu đang ở trạng thái Nháp, nhấn <i class="ti ti-send"></i> để chuyển cho quản lý phê duyệt.</li>
                <li><strong>Theo dõi trạng thái:</strong> Cột "Trạng thái" trong lưới dữ liệu sẽ hiển thị (Nháp, Chờ duyệt, Đã duyệt, Từ chối).</li>
            </ul>
        """,
    },
    "2. Dành cho Nhân viên Mua hàng": {
        "Yêu cầu báo giá (RFQ)": """
            <h2>1. Giới thiệu</h2>
            <p>Tính năng <strong>Yêu cầu báo giá</strong> cho phép tạo thư mời báo giá từ các Nhà cung cấp (NCC) dựa trên các PYC đã được duyệt.</p>
            
            <h2>2. Mô tả các trường thông tin</h2>
            <table class="table table-bordered">
                <thead><tr><th>Trường dữ liệu</th><th>Bắt buộc</th><th>Mô tả & Ghi chú nhập</th></tr></thead>
                <tbody>
                    <tr><td><strong>Tên đợt báo giá</strong></td><td>Có</td><td>Nhập tiêu đề ngắn gọn (VD: Báo giá mua laptop tháng 10).</td></tr>
                    <tr><td><strong>Hạn chót nhận báo giá</strong></td><td>Có</td><td>Ngày cuối cùng NCC có thể gửi báo giá.</td></tr>
                    <tr><td><strong>Nhà cung cấp</strong></td><td>Có</td><td>Chọn một hoặc nhiều NCC từ danh sách NCC tiềm năng.</td></tr>
                    <tr><td><strong>Danh sách mặt hàng</strong></td><td>Có</td><td>Kéo các mặt hàng từ các PYC đã duyệt vào đợt báo giá.</td></tr>
                </tbody>
            </table>

            <h2>3. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>Tạo đợt báo giá:</strong> Nhấn <button class="btn btn-primary btn-sm"><i class="ti ti-plus"></i> Tạo RFQ</button>.</li>
                <li><strong>Nhập giá báo:</strong> Sau khi NCC phản hồi, vào chi tiết RFQ, nhấn nút <i class="ti ti-currency-dollar"></i> (Nhập giá) tương ứng với từng NCC để cập nhật đơn giá, thuế, và phí vận chuyển.</li>
                <li><strong>So sánh & Chọn NCC:</strong> Hệ thống tự động bôi đậm giá thấp nhất. Tick chọn NCC trúng thầu và nhấn "Chốt báo giá".</li>
            </ul>
        """,
        "Đơn mua hàng (PO)": """
            <h2>1. Giới thiệu</h2>
            <p><strong>Đơn mua hàng (Purchase Order - PO)</strong> được lập ra để gửi cho Nhà cung cấp chính thức đặt hàng. PO có thể được sinh tự động từ Báo giá đã chốt hoặc tạo tay độc lập.</p>
            
            <h2>2. Mô tả các trường thông tin</h2>
            <table class="table table-bordered">
                <thead><tr><th>Trường dữ liệu</th><th>Mô tả & Ghi chú nhập</th></tr></thead>
                <tbody>
                    <tr><td><strong>Nhà cung cấp</strong></td><td>Chọn NCC sẽ thực hiện đơn hàng này.</td></tr>
                    <tr><td><strong>Điều khoản thanh toán</strong></td><td>Ghi rõ số ngày thanh toán (VD: 30 ngày sau khi nhận hàng).</td></tr>
                    <tr><td><strong>VAT & Chiết khấu</strong></td><td>Nhập % thuế suất và số tiền chiết khấu (nếu có).</td></tr>
                    <tr><td><strong>Chi tiết hàng hóa</strong></td><td>Kiểm tra lại số lượng, đơn giá, tổng tiền.</td></tr>
                </tbody>
            </table>

            <h2>3. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>In PDF:</strong> Nhấn nút <i class="ti ti-printer"></i> In PO để xuất file PDF theo template của công ty, gửi kèm email cho NCC.</li>
                <li><strong>Gửi duyệt PO:</strong> Trình quản lý duyệt PO trước khi chính thức đặt hàng.</li>
                <li><strong>Cập nhật trạng thái:</strong> Đổi trạng thái PO thành "Đang giao", "Hoàn thành" hoặc "Hủy".</li>
            </ul>
        """,
        "Tiến độ mua hàng": """
            <h2>1. Giới thiệu</h2>
            <p>Màn hình <strong>Tiến độ mua hàng</strong> giúp theo dõi các Đơn mua hàng (PO) đang trong quá trình thực hiện, cập nhật số lượng hàng đã giao và chưa giao.</p>
            
            <h2>2. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>Ghi nhận giao hàng:</strong> Tại cột thao tác, nhấn <i class="ti ti-truck"></i> (Nhận hàng). Nhập số lượng thực tế NCC giao (có thể nhận từng phần).</li>
                <li><strong>Cảnh báo trễ hạn:</strong> Các PO quá ngày cần hàng sẽ bị tô đỏ. Nhấn vào PO để xem chi tiết hoặc thêm ghi chú đốc thúc.</li>
            </ul>
        """,
    },
    "3. Quản lý Kho & Công nợ": {
        "Tồn kho": """
            <h2>1. Giới thiệu</h2>
            <p>Tính năng <strong>Tồn kho</strong> hiển thị số lượng hiện tại của từng mặt hàng trong các kho, giúp cảnh báo các mặt hàng sắp hết để chủ động mua sắm.</p>
            
            <h2>2. Các trường thông tin</h2>
            <ul>
                <li><strong>Tên sản phẩm:</strong> Mã và tên mặt hàng.</li>
                <li><strong>Kho:</strong> Vị trí kho đang lưu trữ.</li>
                <li><strong>Số lượng tồn:</strong> Tồn kho thực tế hiện tại.</li>
                <li><strong>Tồn tối thiểu:</strong> Mức cảnh báo. Nếu Tồn kho < Tồn tối thiểu, hệ thống sẽ đánh dấu cảnh báo màu đỏ.</li>
            </ul>
        """,
        "Công nợ": """
            <h2>1. Giới thiệu</h2>
            <p>Quản lý và thống kê tình hình Công nợ của từng Nhà cung cấp dựa trên các đơn hàng đã nhận.</p>
            <h2>2. Thao tác</h2>
            <p>Bạn có thể theo dõi Công nợ đầu kỳ, Phát sinh trong kỳ (nhập hàng) và Đã thanh toán (từ các yêu cầu thanh toán đã duyệt). Dữ liệu này tự động cập nhật, bạn có thể xuất Excel báo cáo công nợ bằng nút <i class="ti ti-file-export"></i>.</p>
        """,
        "Yêu cầu thanh toán": """
            <h2>1. Giới thiệu</h2>
            <p><strong>Yêu cầu thanh toán</strong> dùng để tạo phiếu đề nghị Kế toán thanh toán tiền cho NCC.</p>
            
            <h2>2. Hướng dẫn thao tác Yêu cầu thanh toán</h2>
            <ul>
                <li><strong>Tạo yêu cầu:</strong> Nhấn nút Tạo mới. Chọn NCC và chọn các Đơn mua hàng (PO) cần thanh toán.</li>
                <li><strong>Số tiền đề nghị:</strong> Nhập số tiền cần thanh toán đợt này (có thể thanh toán một phần).</li>
                <li><strong>Đính kèm:</strong> Nhấn icon <i class="ti ti-paperclip"></i> để tải lên hóa đơn, biên bản bàn giao.</li>
                <li><strong>Duyệt thanh toán:</strong> Quản lý vào duyệt phiếu. Sau khi phiếu được Kế toán đánh dấu "Đã chi", công nợ của NCC sẽ tự động giảm tương ứng.</li>
            </ul>
        """,
    },
    "4. Dành cho Quản lý / Trưởng phòng": {
        "Báo cáo mua hàng": """
            <h2>1. Giới thiệu</h2>
            <p>Màn hình <strong>Báo cáo mua hàng</strong> cung cấp các biểu đồ và số liệu tổng hợp về chi phí mua sắm theo thời gian, theo phòng ban và theo nhà cung cấp.</p>
            
            <h2>2. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>Lọc dữ liệu:</strong> Sử dụng thanh công cụ phía trên để lọc theo Khoảng thời gian (Từ ngày - Đến ngày), Phòng ban yêu cầu, hoặc NCC.</li>
                <li><strong>Xem biểu đồ:</strong> Rê chuột vào các cột biểu đồ để xem con số chi tiết.</li>
                <li><strong>Xuất Excel:</strong> Nhấn nút <button class="btn btn-outline-primary btn-sm"><i class="ti ti-download"></i> Xuất Excel</button> để tải dữ liệu chi tiết về máy tính.</li>
            </ul>
        """,
        "Phiếu khảo sát & Báo cáo khảo sát": """
            <h2>1. Giới thiệu</h2>
            <p>Chức năng đánh giá chất lượng Nhà cung cấp (NCC) định kỳ (về giá, chất lượng, tiến độ giao hàng, thái độ dịch vụ).</p>
            
            <h2>2. Hướng dẫn thao tác</h2>
            <ul>
                <li><strong>Tạo phiếu khảo sát:</strong> Tại mục "Phiếu khảo sát", tạo đợt đánh giá mới, chọn NCC và chọn bộ tiêu chí đánh giá.</li>
                <li><strong>Thực hiện đánh giá:</strong> Cho điểm (1-5 sao) hoặc nhập nhận xét text cho từng tiêu chí.</li>
                <li><strong>Xem báo cáo:</strong> Chuyển sang mục "Báo cáo khảo sát" để xem biểu đồ radar so sánh năng lực giữa các NCC, hoặc điểm trung bình của một NCC qua các tháng.</li>
            </ul>
        """,
    },
    "5. Quản lý Danh mục (Master Data)": {
        "Nhà cung cấp, Sản phẩm, Hợp đồng, Kho, Đơn vị tính, Phân loại, Phòng ban, Phân công phụ trách": """
            <h2>1. Giới thiệu</h2>
            <p>Khu vực <strong>Danh mục</strong> lưu trữ toàn bộ dữ liệu gốc của hệ thống. Dữ liệu này được sử dụng làm danh sách chọn (Dropdown) cho các chức năng khác (PYC, PO...).</p>
            
            <h2>2. Mô tả thao tác chung</h2>
            <table class="table table-bordered">
                <thead><tr><th>Thao tác</th><th>Ý nghĩa & Hướng dẫn</th></tr></thead>
                <tbody>
                    <tr><td><strong>Thêm mới</strong></td><td>Nhấn nút "Tạo mới". Nhập các trường thông tin bắt buộc (có dấu * đỏ).</td></tr>
                    <tr><td><strong>Sửa</strong></td><td>Nhấn biểu tượng cây bút <i class="ti ti-edit"></i> trên từng dòng để cập nhật thông tin.</td></tr>
                    <tr><td><strong>Import Excel</strong></td><td>Nhấn <i class="ti ti-upload"></i> Import. Tải file mẫu về, điền dữ liệu theo đúng định dạng cột, sau đó upload file lên để thêm hàng loạt.</td></tr>
                    <tr><td><strong>Khóa/Mở khóa</strong></td><td>Các bản ghi không dùng nữa không nên Xóa (vì liên kết dữ liệu cũ). Hãy dùng nút <i class="ti ti-lock"></i> Khóa. Bản ghi bị khóa sẽ không hiển thị ở các màn hình chọn nữa.</td></tr>
                </tbody>
            </table>
            
            <h2>3. Chú ý các trường Danh mục</h2>
            <ul>
                <li><strong>Sản phẩm:</strong> Phải liên kết với 1 Phân loại và 1 Đơn vị tính hợp lệ.</li>
                <li><strong>Phòng ban & Phân công phụ trách:</strong> Dùng để định tuyến duyệt PYC. Mỗi phòng ban cần gán 1 người Quản lý.</li>
            </ul>
        """,
    },
    "6. Dành cho Quản trị viên Hệ thống (Admin)": {
        "Công ty, Nhân sự, Vai trò (RBAC)": """
            <h2>1. Giới thiệu</h2>
            <p>Hệ thống phân quyền dựa trên Vai trò (Role). Một người dùng có thể có nhiều vai trò. Mỗi vai trò quy định quyền thao tác (Xem, Thêm, Sửa, Xóa, Duyệt) trên từng đối tượng (PYC, PO...).</p>
            
            <h2>2. Hướng dẫn thao tác Phân quyền</h2>
            <ul>
                <li><strong>Quản lý Vai trò:</strong> Vào Hệ thống > Vai trò. Tạo vai trò mới (VD: "Trưởng phòng Mua hàng"). Check chọn các quyền tương ứng.</li>
                <li><strong>Gán Phạm vi dữ liệu (Data Scope):</strong> Rất quan trọng! Khi gán quyền "Xem", hãy cấu hình phạm vi dữ liệu: "Chỉ dữ liệu của tôi", "Dữ liệu của phòng ban tôi", hoặc "Toàn bộ công ty".</li>
                <li><strong>Gán Vai trò cho Nhân sự:</strong> Vào Hệ thống > Nhân sự. Nhấn biểu tượng <i class="ti ti-shield"></i> để chọn vai trò cho nhân sự đó.</li>
            </ul>
        """,
        "Cấu hình hệ thống, Quản lý Import, Sao lưu CSDL": """
            <h2>1. Cấu hình hệ thống</h2>
            <p>Cho phép tinh chỉnh các tham số toàn cục (VD: Số ngày tự động hủy PYC, Bật/tắt gửi email thông báo, Định dạng mã phiếu tự động sinh). Nhấn "Lưu cấu hình" sau khi thay đổi.</p>
            
            <h2>2. Quản lý Import</h2>
            <p>Xem lại lịch sử các file Excel đã Import vào hệ thống, kiểm tra các dòng lỗi và tải file kết quả về máy.</p>

            <h2>3. Sao lưu CSDL (Backup)</h2>
            <p>Bảo vệ an toàn dữ liệu. Nhấn <button class="btn btn-outline-secondary btn-sm"><i class="ti ti-download"></i> Tạo bản Backup</button> để xuất file `.sql` dữ liệu hiện hành. Trong trường hợp có sự cố, dùng chức năng Restore để phục hồi.</p>
        """,
    }
}

def seed_hdsd():
    db = SessionLocal()
    try:
        # Xóa liên kết cha con để tránh lỗi foreign key
        db.query(HelpArticle).update({HelpArticle.parent_id: None})
        db.commit()
        
        # Xóa toàn bộ HDSD cũ (cẩn thận, chỉ dùng trong seed script)
        db.query(HelpArticle).delete()
        db.commit()
        
        # Bắt đầu seed
        order_root = 1
        for root_title, children in data.items():
            root_article = HelpArticle(
                title=root_title,
                content="",
                parent_id=None,
                sort_order=order_root,
                created_by=1
            )
            db.add(root_article)
            db.flush() # Lấy ID
            
            order_child = 1
            for child_title, child_content in children.items():
                child_article = HelpArticle(
                    title=child_title,
                    content=child_content,
                    parent_id=root_article.id,
                    sort_order=order_child,
                    created_by=1
                )
                db.add(child_article)
                order_child += 1
            
            order_root += 1
            
        db.commit()
        logger.info("Successfully seeded HDSD articles.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding HDSD: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_hdsd()
