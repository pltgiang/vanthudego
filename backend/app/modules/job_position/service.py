from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.job_position.model import JobPosition, JobPositionCompany, PositionGroup, JobTitle
from app.modules.company.model import Company
from app.modules.department.model import Department
from app.modules.job_position.schema import JobPositionCreate, JobPositionUpdate, PositionGroupCreate, PositionGroupUpdate, JobTitleCreate, JobTitleUpdate

# --- Position Group ---
def create_position_group(db: Session, data: PositionGroupCreate) -> PositionGroup:
    if db.query(PositionGroup).filter(PositionGroup.group_name == data.group_name).first():
        raise HTTPException(409, "Nhóm chức danh đã tồn tại")
    db_obj = PositionGroup(**data.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_position_group(db: Session, id: int, data: PositionGroupUpdate) -> PositionGroup:
    db_obj = db.query(PositionGroup).filter(PositionGroup.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy nhóm chức danh")
    if data.group_name != db_obj.group_name:
        if db.query(PositionGroup).filter(PositionGroup.group_name == data.group_name).first():
            raise HTTPException(409, "Nhóm chức danh đã tồn tại")
    
    for k, v in data.model_dump().items():
        setattr(db_obj, k, v)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_position_group(db: Session, id: int):
    db_obj = db.query(PositionGroup).filter(PositionGroup.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy nhóm chức danh")
    if db.query(JobPosition).filter(JobPosition.group_id == id).first():
        raise HTTPException(400, "Không thể xóa nhóm chức danh đang được sử dụng")
    db.delete(db_obj)
    db.commit()

# --- Job Title ---
def create_job_title(db: Session, data: JobTitleCreate) -> JobTitle:
    if data.title_code and db.query(JobTitle).filter(JobTitle.title_code == data.title_code).first():
        raise HTTPException(409, "Mã chức danh đã tồn tại")
    if db.query(JobTitle).filter(JobTitle.title_name == data.title_name).first():
        raise HTTPException(409, "Chức danh đã tồn tại")
    db_obj = JobTitle(**data.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_job_title(db: Session, id: int, data: JobTitleUpdate) -> JobTitle:
    db_obj = db.query(JobTitle).filter(JobTitle.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy chức danh")
    if data.title_code and data.title_code != db_obj.title_code:
        if db.query(JobTitle).filter(JobTitle.title_code == data.title_code).first():
            raise HTTPException(409, "Mã chức danh đã tồn tại")
    if data.title_name != db_obj.title_name:
        if db.query(JobTitle).filter(JobTitle.title_name == data.title_name).first():
            raise HTTPException(409, "Chức danh đã tồn tại")
    
    for k, v in data.model_dump().items():
        setattr(db_obj, k, v)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_job_title(db: Session, id: int):
    db_obj = db.query(JobTitle).filter(JobTitle.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy chức danh")
    if db.query(JobPosition).filter(JobPosition.title_id == id).first():
        raise HTTPException(400, "Không thể xóa chức danh đang được sử dụng")
    db.delete(db_obj)
    db.commit()


# --- Job Position ---
def create_job_position(db: Session, data: JobPositionCreate) -> JobPosition:
    if db.query(JobPosition).filter(JobPosition.position_code == data.position_code).first():
        raise HTTPException(409, "Mã vị trí công việc đã tồn tại")

    db_obj = JobPosition(
        position_code=data.position_code,
        position_name=data.position_name,
        department_id=data.department_id,
        title_id=data.title_id,
        description=data.description or "",
        is_inactive=data.is_inactive
    )
    db.add(db_obj)
    db.flush()

    if data.company_ids:
        for c_id in data.company_ids:
            db.add(JobPositionCompany(job_position_id=db_obj.id, company_id=c_id))

    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_job_position(db: Session, id: int, data: JobPositionUpdate) -> JobPosition:
    db_obj = db.query(JobPosition).filter(JobPosition.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy vị trí công việc")

    if data.position_code != db_obj.position_code:
        if db.query(JobPosition).filter(JobPosition.position_code == data.position_code).first():
            raise HTTPException(409, "Mã vị trí công việc đã tồn tại")
            
    if data.report_to_position_id == id:
        raise HTTPException(400, "Không thể báo cáo cho chính vị trí này")

    db_obj.position_code = data.position_code
    db_obj.position_name = data.position_name
    db_obj.department_id = data.department_id
    db_obj.title_id = data.title_id
    db_obj.description = data.description or ""
    db_obj.is_inactive = data.is_inactive

    db.query(JobPositionCompany).filter(JobPositionCompany.job_position_id == id).delete()
    if data.company_ids:
        for c_id in data.company_ids:
            db.add(JobPositionCompany(job_position_id=db_obj.id, company_id=c_id))

    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_job_position(db: Session, id: int):
    db_obj = db.query(JobPosition).filter(JobPosition.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy vị trí công việc")

    db.delete(db_obj)
    db.commit()
