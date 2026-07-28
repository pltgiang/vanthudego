from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.auth import get_current_user, require
from app.core.database import get_db
from app.core.response import success
from app.core.audit import record
from app.modules.subject.model import Subject
from app.modules.subject.schema import SubjectCreate, SubjectUpdate
from app.modules.subject import service

router = APIRouter(prefix="/api/v1/system/subjects", tags=["subject"])

@router.get("")
def get_subjects(
    status: Optional[str] = None,
    q: Optional[str] = None,
    company_id: Optional[int] = None,
    department_id: Optional[int] = None,
    role_id: Optional[int] = None,
    is_employee: Optional[bool] = None,
    user=Depends(require("subject", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Subject)
    
    if status == "ACTIVE":
        query = query.filter(Subject.user_status == "ACTIVE")
    elif status == "INACTIVE":
        query = query.filter(Subject.user_status == "INACTIVE")
    elif status == "LOCKED":
        query = query.filter(Subject.user_status == "LOCKED")
        
    if is_employee is not None:
        query = query.filter(Subject.is_employee == is_employee)
        
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Subject.subject_code.like(search),
                Subject.subject_name.like(search),
                Subject.account_email.like(search),
                Subject.account_phone.like(search)
            )
        )
        
    if company_id:
        query = query.filter(Subject.companies.any(company_id=company_id))
        
    if department_id:
        query = query.filter(Subject.departments.any(department_id=department_id))
        
    if role_id:
        query = query.filter(Subject.roles.any(role_id=role_id))
        
    items = query.order_by(Subject.id.desc()).all()
    
    out = []
    for item in items:
        obj = {
            "id": item.id,
            "subject_code": item.subject_code,
            "subject_name": item.subject_name,
            "is_employee": item.is_employee,
            "contact_email": item.contact_email,
            "contact_phone": item.contact_phone,
            "account_email": item.account_email,
            "account_phone": item.account_phone,
            "user_status": item.user_status,
            "employee_status": item.employee_status,
            "vpn_access": item.vpn_access,
            "avatar": item.avatar,
            "join_date": item.join_date,
            "probation_date": item.probation_date,
            "official_date": item.official_date,
            "resign_date": item.resign_date,
            "job_position_id": item.job_position_id,
            "job_position_name": item.job_position.position_name if item.job_position else "",
            "direct_manager_id": item.direct_manager_id,
            "direct_manager_name": item.direct_manager.subject_name if item.direct_manager else "",
            "company_ids": [c.company_id for c in item.companies],
            "company_names": [c.company.name for c in item.companies if getattr(c, "company", None)],
            "department_ids": [d.department_id for d in item.departments],
            "department_names": [d.department.name for d in item.departments if getattr(d, "department", None)],
            "job_title_ids": [t.job_title_id for t in item.job_titles],
            "job_title_names": [t.job_title.title_name for t in item.job_titles if getattr(t, "job_title", None)],
            "role_ids": [r.role_id for r in item.roles]
        }
        out.append(obj)
    return success(out)

@router.get("/check-code")
def check_code(code: str, user=Depends(require("subject", "read")), db: Session = Depends(get_db)):
    exists = db.query(Subject).filter(Subject.subject_code == code).first() is not None
    return success({"exists": exists})

@router.get("/{id}")
def get_subject(id: int, user=Depends(require("subject", "read")), db: Session = Depends(get_db)):
    item = db.query(Subject).filter(Subject.id == id).first()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy đối tượng")
        
    obj = {
        "id": item.id,
        "subject_code": item.subject_code,
        "subject_name": item.subject_name,
        "is_employee": item.is_employee,
        "contact_email": item.contact_email,
        "contact_phone": item.contact_phone,
        "account_email": item.account_email,
        "account_phone": item.account_phone,
        "user_status": item.user_status,
        "employee_status": item.employee_status,
        "vpn_access": item.vpn_access,
        "avatar": item.avatar,
        "join_date": item.join_date,
        "probation_date": item.probation_date,
        "official_date": item.official_date,
        "resign_date": item.resign_date,
        "job_position_id": item.job_position_id,
        "job_position_name": item.job_position.position_name if item.job_position else "",
        "direct_manager_id": item.direct_manager_id,
        "direct_manager_name": item.direct_manager.subject_name if item.direct_manager else "",
        "company_ids": [c.company_id for c in item.companies],
        "company_names": [c.company.name for c in item.companies if getattr(c, "company", None)],
        "department_ids": [d.department_id for d in item.departments],
        "department_names": [d.department.name for d in item.departments if getattr(d, "department", None)],
        "job_title_ids": [t.job_title_id for t in item.job_titles],
        "job_title_names": [t.job_title.title_name for t in item.job_titles if getattr(t, "job_title", None)],
        "role_ids": [r.role_id for r in item.roles]
    }
    return success(obj)

@router.post("")
def create_subject(data: SubjectCreate, user=Depends(require("subject", "create")), db: Session = Depends(get_db)):
    db_obj = service.create_subject(db, data)
    record(db, user.id, "subject", db_obj.id, "CREATE_SUBJECT", f"Thêm đối tượng {db_obj.subject_code}")
    return success({"id": db_obj.id}, "Thêm thành công")

@router.put("/{id}")
def update_subject(id: int, data: SubjectUpdate, user=Depends(require("subject", "write")), db: Session = Depends(get_db)):
    db_obj = service.update_subject(db, id, data)
    record(db, user.id, "subject", db_obj.id, "UPDATE_SUBJECT", f"Sửa đối tượng {db_obj.subject_code}")
    return success({"id": db_obj.id}, "Cập nhật thành công")

from pydantic import BaseModel
class VpnUpdate(BaseModel):
    vpn_access: str

@router.patch("/{id}/vpn")
def update_vpn_access(id: int, data: VpnUpdate, user=Depends(require("subject", "write")), db: Session = Depends(get_db)):
    db_obj = db.query(Subject).filter(Subject.id == id).first()
    from fastapi import HTTPException
    import json
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy nhân sự")
    old_access = db_obj.vpn_access or ""
    db_obj.vpn_access = data.vpn_access
    db.commit()
    
    changes = {"Quyền truy cập VPN": data.vpn_access}
    record(db, user.id, "subject", db_obj.id, "update", json.dumps(changes, ensure_ascii=False))
    
    return success({"id": db_obj.id}, "Cập nhật quyền VPN thành công")

@router.delete("/{id}")
def delete_subject(id: int, user=Depends(require("subject", "delete")), db: Session = Depends(get_db)):
    service.delete_subject(db, id)
    record(db, user.id, "subject", id, "DELETE_SUBJECT", f"Xóa đối tượng {id}")
    return success(None, "Xóa thành công")

@router.patch("/{id}/status")
def change_status(id: int, data: dict, user=Depends(require("subject", "write")), db: Session = Depends(get_db)):
    user_status = data.get("user_status")
    employee_status = data.get("employee_status")
    
    db_obj = db.query(Subject).filter(Subject.id == id).first()
    if not db_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy đối tượng")
        
    if user_status:
        db_obj.user_status = user_status
    if employee_status:
        db_obj.employee_status = employee_status
        
    db.commit()
    
    # Xoá cache permissions
    from app.core.auth import perm_cache_clear
    perm_cache_clear(id)
    
    record(db, user.id, "subject", db_obj.id, "CHANGE_SUBJECT_STATUS", f"Đổi trạng thái {db_obj.subject_code}")
    return success(None, "Cập nhật trạng thái thành công")
