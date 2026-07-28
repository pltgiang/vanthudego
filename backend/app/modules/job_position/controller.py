from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.auth import get_current_user, require
from app.core.database import get_db
from app.core.response import success
from app.core.audit import record
from app.modules.job_position.model import JobPosition, PositionGroup, JobTitle
from app.modules.job_position.schema import (JobPositionCreate, JobPositionUpdate, 
                                             PositionGroupCreate, PositionGroupUpdate, PositionGroupOut,
                                             JobTitleCreate, JobTitleUpdate, JobTitleOut)
from app.modules.job_position import service

router = APIRouter(prefix="/api/v1/system", tags=["job-position"])


# --- Position Group ---
@router.get("/position-groups")
def get_position_groups(status: Optional[str] = None, user=Depends(require("job_position", "read")), db: Session = Depends(get_db)):
    query = db.query(PositionGroup)
    if status == "ACTIVE":
        query = query.filter(PositionGroup.is_inactive == False)
    elif status == "INACTIVE":
        query = query.filter(PositionGroup.is_inactive == True)
    
    items = query.order_by(PositionGroup.sort_order.asc(), PositionGroup.id.asc()).all()
    return success([PositionGroupOut.model_validate(i).model_dump() for i in items])

@router.post("/position-groups")
def create_position_group(data: PositionGroupCreate, user=Depends(require("job_position", "create")), db: Session = Depends(get_db)):
    db_obj = service.create_position_group(db, data)
    record(db, user.id, "job_position", db_obj.id, "CREATE_POS_GROUP", f"Thêm nhóm chức danh {db_obj.group_name}")
    return success({"id": db_obj.id}, "Thêm thành công")

@router.put("/position-groups/{id}")
def update_position_group(id: int, data: PositionGroupUpdate, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    db_obj = service.update_position_group(db, id, data)
    record(db, user.id, "job_position", db_obj.id, "UPDATE_POS_GROUP", f"Sửa nhóm chức danh {db_obj.group_name}")
    return success({"id": db_obj.id}, "Cập nhật thành công")

@router.delete("/position-groups/{id}")
def delete_position_group(id: int, user=Depends(require("job_position", "delete")), db: Session = Depends(get_db)):
    service.delete_position_group(db, id)
    record(db, user.id, "job_position", id, "DELETE_POS_GROUP", f"Xóa nhóm chức danh {id}")
    return success(None, "Xóa thành công")

@router.patch("/position-groups/{id}/inactive")
def toggle_group_inactive(id: int, data: dict, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    is_inactive = data.get("is_inactive", False)
    db_obj = db.query(PositionGroup).filter(PositionGroup.id == id).first()
    if not db_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy nhóm chức danh")
    db_obj.is_inactive = is_inactive
    db.commit()
    record(db, user.id, "job_position", db_obj.id, "TOGGLE_POS_GROUP", f"Đổi trạng thái nhóm chức danh {id}")
    return success(None, "Cập nhật trạng thái thành công")


# --- Job Title ---
@router.get("/job-titles")
def get_job_titles(status: Optional[str] = None, user=Depends(require("job_position", "read")), db: Session = Depends(get_db)):
    query = db.query(JobTitle)
    if status == "ACTIVE":
        query = query.filter(JobTitle.is_inactive == False)
    elif status == "INACTIVE":
        query = query.filter(JobTitle.is_inactive == True)
    
    items = query.order_by(JobTitle.sort_order.asc(), JobTitle.id.asc()).all()
    return success([JobTitleOut.model_validate(i).model_dump() for i in items])

@router.post("/job-titles")
def create_job_title(data: JobTitleCreate, user=Depends(require("job_position", "create")), db: Session = Depends(get_db)):
    db_obj = service.create_job_title(db, data)
    record(db, user.id, "job_title", db_obj.id, "CREATE_JOB_TITLE", f"Thêm chức danh {db_obj.title_name}")
    return success({"id": db_obj.id}, "Thêm thành công")

@router.put("/job-titles/{id}")
def update_job_title(id: int, data: JobTitleUpdate, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    old_obj = db.query(JobTitle).filter(JobTitle.id == id).first()
    if not old_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy chức danh")
        
    changes = {}
    if data.title_code is not None and old_obj.title_code != data.title_code:
        changes["title_code"] = data.title_code
    if data.title_name is not None and old_obj.title_name != data.title_name:
        changes["title_name"] = data.title_name
    if data.description is not None and old_obj.description != data.description:
        changes["description"] = data.description
    if data.is_inactive is not None and old_obj.is_inactive != data.is_inactive:
        changes["is_inactive"] = data.is_inactive
        
    db_obj = service.update_job_title(db, id, data)
    
    if changes:
        import json
        record(db, user.id, "job_title", db_obj.id, "UPDATE", json.dumps(changes, ensure_ascii=False))
    else:
        record(db, user.id, "job_title", db_obj.id, "UPDATE_JOB_TITLE", f"Sửa chức danh {db_obj.title_name}")
        
    return success({"id": db_obj.id}, "Cập nhật thành công")

@router.delete("/job-titles/{id}")
def delete_job_title(id: int, user=Depends(require("job_position", "delete")), db: Session = Depends(get_db)):
    service.delete_job_title(db, id)
    record(db, user.id, "job_title", id, "DELETE_JOB_TITLE", f"Xóa chức danh {id}")
    return success(None, "Xóa thành công")

@router.patch("/job-titles/{id}/inactive")
def toggle_title_inactive(id: int, data: dict, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    is_inactive = data.get("is_inactive", False)
    db_obj = db.query(JobTitle).filter(JobTitle.id == id).first()
    if not db_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy chức danh")
    db_obj.is_inactive = is_inactive
    db.commit()
    record(db, user.id, "job_title", db_obj.id, "TOGGLE_JOB_TITLE", f"Đổi trạng thái chức danh {id}")
    return success(None, "Cập nhật trạng thái thành công")


# --- Job Position ---
@router.get("/job-positions")
def get_job_positions(
    status: Optional[str] = None,
    q: Optional[str] = None,
    department_id: Optional[int] = None,
    user=Depends(require("job_position", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(JobPosition)
    if status == "ACTIVE":
        query = query.filter(JobPosition.is_inactive == False)
    elif status == "INACTIVE":
        query = query.filter(JobPosition.is_inactive == True)
        
    if q:
        search = f"%{q}%"
        query = query.filter(or_(JobPosition.position_code.like(search), JobPosition.position_name.like(search)))
        
    if department_id:
        query = query.filter(JobPosition.department_id == department_id)
        
    items = query.order_by(JobPosition.id.desc()).all()
    
    out = []
    for item in items:
        # Load department name
        from app.modules.department.model import Department
        dept = db.query(Department).filter(Department.id == item.department_id).first() if item.department_id else None
        
        # Load company names
        from app.modules.company.model import Company
        company_ids = [c.company_id for c in item.companies]
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all() if company_ids else []
        
        obj = {
            "id": item.id,
            "position_code": item.position_code,
            "position_name": item.position_name,
            "department_id": item.department_id,
            "department_name": dept.department_name if dept else "",
            "title_id": item.title_id,
            "title_name": item.title.title_name if item.title else "",
            "description": item.description,
            "is_inactive": item.is_inactive,
            "company_ids": company_ids,
            "company_names": [c.company_name for c in companies]
        }
        out.append(obj)
    return success(out)

@router.get("/job-positions/next-code")
def get_next_job_position_code(user=Depends(require("job_position", "read")), db: Session = Depends(get_db)):
    last_position = db.query(JobPosition).filter(JobPosition.position_code.like("VTR%")).order_by(JobPosition.position_code.desc()).first()
    if not last_position:
        return success({"next_code": "VTR001"})
    
    import re
    match = re.search(r'VTR(\d+)', last_position.position_code)
    if match:
        next_num = int(match.group(1)) + 1
        return success({"next_code": f"VTR{next_num:03d}"})
    return success({"next_code": "VTR001"})

@router.get("/job-positions/check-code")
def check_job_position_code(code: str, user=Depends(require("job_position", "read")), db: Session = Depends(get_db)):
    exists = db.query(JobPosition).filter(JobPosition.position_code == code).first() is not None
    return success({"exists": exists})

@router.get("/job-positions/{id}")
def get_job_position(id: int, user=Depends(require("job_position", "read")), db: Session = Depends(get_db)):
    item = db.query(JobPosition).filter(JobPosition.id == id).first()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy vị trí công việc")
    # Load department name
    from app.modules.department.model import Department
    dept = db.query(Department).filter(Department.id == item.department_id).first() if item.department_id else None
    
    # Load company names
    from app.modules.company.model import Company
    company_ids = [c.company_id for c in item.companies]
    companies = db.query(Company).filter(Company.id.in_(company_ids)).all() if company_ids else []
    
    obj = {
        "id": item.id,
        "position_code": item.position_code,
        "position_name": item.position_name,
        "department_id": item.department_id,
        "department_name": dept.department_name if dept else "",
        "title_id": item.title_id,
        "title_name": item.title.title_name if item.title else "",
        "description": item.description,
        "is_inactive": item.is_inactive,
        "company_ids": company_ids,
        "company_names": [c.company_name for c in companies]
    }
    return success(obj)

@router.post("/job-positions")
def create_job_position(data: JobPositionCreate, user=Depends(require("job_position", "create")), db: Session = Depends(get_db)):
    db_obj = service.create_job_position(db, data)
    record(db, user.id, "job_position", db_obj.id, "CREATE_JOB_POS", f"Thêm vị trí công việc {db_obj.position_code}")
    return success({"id": db_obj.id}, "Thêm thành công")

@router.put("/job-positions/{id}")
def update_job_position(id: int, data: JobPositionUpdate, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    db_obj = service.update_job_position(db, id, data)
    record(db, user.id, "job_position", db_obj.id, "UPDATE_JOB_POS", f"Sửa vị trí công việc {db_obj.position_code}")
    return success({"id": db_obj.id}, "Cập nhật thành công")

@router.delete("/job-positions/{id}")
def delete_job_position(id: int, user=Depends(require("job_position", "delete")), db: Session = Depends(get_db)):
    service.delete_job_position(db, id)
    record(db, user.id, "job_position", id, "DELETE_JOB_POS", f"Xóa vị trí công việc {id}")
    return success(None, "Xóa thành công")

@router.patch("/job-positions/{id}/inactive")
def toggle_position_inactive(id: int, data: dict, user=Depends(require("job_position", "write")), db: Session = Depends(get_db)):
    is_inactive = data.get("is_inactive", False)
    db_obj = db.query(JobPosition).filter(JobPosition.id == id).first()
    if not db_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy vị trí công việc")
    db_obj.is_inactive = is_inactive
    db.commit()
    record(db, user.id, "job_position", db_obj.id, "TOGGLE_JOB_POS", f"Đổi trạng thái vị trí công việc {id}")
    return success(None, "Cập nhật trạng thái thành công")
