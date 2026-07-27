from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.auth import verify_password
from app.modules.subject.model import Subject, SubjectRole

def authenticate(db: Session, username: str, password: str) -> Subject:
    # 1. Thử tìm theo account_phone
    user = db.query(Subject).filter(Subject.account_phone == username).first()
    
    # 2. Nếu không tìm thấy, thử tìm theo account_email
    if not user and "@" in username:
        user = db.query(Subject).filter(Subject.account_email == username).first()

    if not user or user.user_status != "ACTIVE" or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Sai tài khoản hoặc mật khẩu")

    # Nhân viên phải đang làm việc
    if user.is_employee and user.employee_status != "WORKING":
        raise HTTPException(403, "Nhân viên đã ngừng hoạt động")
        
    return user

def google_login(db: Session, credential: str) -> Subject:
    from google.oauth2 import id_token
    from google.auth.transport import requests
    from app.core.config import settings

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(500, "Chưa cấu hình GOOGLE_CLIENT_ID")

    try:
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), settings.GOOGLE_CLIENT_ID, clock_skew_in_seconds=60)
    except ValueError as e:
        print(f"Google Token error: {e}")
        raise HTTPException(401, f"Google Token không hợp lệ: {e}")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(401, "Không lấy được email từ Google")

    # Check if subject exists
    user = db.query(Subject).filter(Subject.account_email == email).first()
    if not user:
        raise HTTPException(403, "Email không hợp lệ, vui lòng liên hệ Admin để được hỗ trợ")

    if user.user_status != "ACTIVE":
        raise HTTPException(403, "Tài khoản đã bị khóa")

    if user.is_employee and user.employee_status != "WORKING":
        raise HTTPException(403, "Nhân sự đã ngừng hoạt động")

    # Update avatar
    if not user.avatar and idinfo.get("picture"):
        user.avatar = idinfo.get("picture", "")
        db.commit()

    return user
