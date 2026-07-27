from fastapi import APIRouter, Depends, Request, BackgroundTasks, UploadFile, File, HTTPException
import uuid
from sqlalchemy.orm import Session

from app.core.auth import (create_access_token, create_refresh_token,
                           decode_token, get_current_user, get_user_permissions,
                           hash_password, verify_password)
from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.response import success
from app.modules.subject.model import Subject
from app.modules.org_unit.model import OrgUnit
from app.modules.job_position.model import JobPosition

from . import service
from . import schema, service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _me_payload(db: Session, user: Subject) -> dict:
    dept_name = ""
    pos_name = ""
    if user.org_units:
        dept = user.org_units[0].org_unit
        if dept:
            dept_name = dept.unit_name
    if user.job_position_id:
        pos = db.get(JobPosition, user.job_position_id)
        if pos:
            pos_name = pos.position_name
            
    return {
        "id": user.id,
        "email": user.account_email or "",
        "employee_id": user.id if user.is_employee else 0,
        "emp_code": user.subject_code or "",
        "company_id": 0, # TODO: resolve org tree
        "full_name": user.subject_name or user.account_email,
        "avatar": getattr(user, 'avatar', ''),
        "phone": user.contact_phone or "",
        "department_name": dept_name,
        "role_name": "", #TODO: resolve role
        "position": pos_name,
        "permissions": get_user_permissions(db, user),
    }


@router.post("/login")
@limiter.limit(settings.LOGIN_RATE_LIMIT)
def login(request: Request, data: schema.LoginInput, db: Session = Depends(get_db)):
    user = service.authenticate(db, data.username, data.password)
    return success({
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "user": _me_payload(db, user),
    }, "Đăng nhập thành công")

@router.post("/google")
@limiter.limit(settings.LOGIN_RATE_LIMIT)
def login_google(request: Request, data: schema.GoogleLoginInput, db: Session = Depends(get_db)):
    user = service.google_login(db, data.credential)
    return success({
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "user": _me_payload(db, user),
    }, "Đăng nhập Google thành công")


@router.post("/refresh")
def refresh(data: schema.RefreshInput, db: Session = Depends(get_db)):
    user_id = decode_token(data.refresh_token, "refresh")
    user = db.get(Subject, user_id)
    if not user or user.user_status != "ACTIVE":
        from fastapi import HTTPException
        raise HTTPException(401, "Tài khoản không hợp lệ")
    return success({"access_token": create_access_token(user.id)})


@router.get("/me")
def me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return success(_me_payload(db, user))


@router.post("/change-password")
def change_password(data: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Người dùng tự đổi mật khẩu (đang đăng nhập). Body: {old_password, new_password}."""
    old = (data.get("old_password") or "").strip()
    new = (data.get("new_password") or "").strip()
    if not verify_password(old, user.password_hash):
        raise HTTPException(400, "Mật khẩu hiện tại không đúng")
    if len(new) < 6:
        raise HTTPException(400, "Mật khẩu mới phải từ 6 ký tự trở lên")
    if verify_password(new, user.password_hash):
        raise HTTPException(400, "Mật khẩu mới không được trùng mật khẩu cũ")
    user.password_hash = hash_password(new)
    db.commit()
    return success(None, "Đã đổi mật khẩu thành công")

@router.post("/avatar")
def update_avatar(file: UploadFile = File(...), user=Depends(get_current_user), db: Session = Depends(get_db)):
    from app.core.storage import upload_fileobj
    try:
        key = f"avatar/{user.id}/{uuid.uuid4().hex}_{file.filename}"
        url = upload_fileobj(file.file, key, file.content_type or "")
        user.avatar = url
        db.commit()
        return success({"avatar": url}, "Đã cập nhật ảnh đại diện")
    except Exception as e:
        raise HTTPException(400, f"Lỗi tải ảnh: {str(e)}")


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, data: schema.ForgotPasswordInput, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(Subject).filter(Subject.account_email == data.email).first()
    if not user or user.user_status != "ACTIVE":
        return success(None, "Nếu email hợp lệ, hướng dẫn khôi phục mật khẩu đã được gửi.")
        
    full_name = user.subject_name or user.account_email
    
    from app.core.auth import create_reset_token
    token = create_reset_token(user.id)
    
    frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "http://localhost:5173"
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    from app.modules.notification.service import send_password_reset_email
    send_password_reset_email(db, user.id, background_tasks, full_name, user.account_email, reset_link)
    
    return success(None, "Nếu email hợp lệ, hướng dẫn khôi phục mật khẩu đã được gửi.")

@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, data: schema.ResetPasswordInput, db: Session = Depends(get_db)):
    from app.core.auth import hash_password
    try:
        user_id = decode_token(data.token, "reset_password")
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(400, "Token không hợp lệ hoặc đã hết hạn")
        
    user = db.get(Subject, user_id)
    if not user or user.user_status != "ACTIVE":
        from fastapi import HTTPException
        raise HTTPException(400, "Tài khoản không tồn tại hoặc đã bị khóa")
        
    user.password_hash = hash_password(data.new_password)
    db.commit()
    
    return success(None, "Đặt lại mật khẩu thành công")
