"""Danh sách quyền dùng chung (nguồn chân lý duy nhất).

Quyền = ENTITY (đối tượng) x ACTION (hành động). Seed & kiểm tra đều dựa vào đây.
"""

ENTITIES = [
    "company", "org_unit", "job_position", "subject", "role",
    "doc_type", "secrecy", "urgency", "partner",
    "book", "document",
    "field_config", "numbering_rule",
    "report", "setting", "import",
]

ACTIONS = ["read", "create", "write", "delete", "approve", "cancel", "print", "export"]

# Nhãn tiếng Việt để hiển thị ở màn cấu hình phân quyền
ENTITY_LABELS = {
    "company": "Công ty (pháp nhân)",
    "org_unit": "Cơ cấu tổ chức",
    "job_position": "Vị trí công việc",
    "subject": "Đối tượng/Tài khoản",
    "role": "Vai trò & phân quyền",
    "doc_type": "Loại văn bản",
    "secrecy": "Mức độ mật",
    "urgency": "Mức độ khẩn",
    "partner": "Đối tác (Nơi gửi/nhận)",
    "book": "Sổ văn bản",
    "document": "Văn bản",
    "field_config": "Thiết lập trường thông tin",
    "numbering_rule": "Quy tắc số hiệu",
    "report": "Báo cáo",
    "setting": "Cấu hình hệ thống",
    "import": "Nhập dữ liệu (Import)",
}

ACTION_LABELS = {
    "read": "Xem", "create": "Tạo", "write": "Sửa", "delete": "Xóa",
    "approve": "Duyệt", "cancel": "Hủy", "print": "In", "export": "Xuất",
}

# Phạm vi theo cấp bậc (tương đối với công ty/phòng ban của chính user)
# "assigned" (Được giao) = của mình HOẶC được phân bổ cho mình — dùng cho nhân viên thu mua trên PYC.
SCOPES = ["own", "assigned", "proc", "dept", "company", "all"]
SCOPE_LABELS = {
    "own": "Của mình", "assigned": "Được giao", "proc": "Thu mua (được giao + đã duyệt)",
    "dept": "Phòng ban", "company": "Công ty", "all": "Tất cả",
}
SCOPE_RANK = {"own": 0, "assigned": 1, "proc": 1, "dept": 2, "company": 3, "all": 4}
