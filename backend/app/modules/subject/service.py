from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.subject.model import Subject, SubjectCompany, SubjectRole, SubjectDepartment, SubjectJobTitle
from app.modules.subject.schema import SubjectCreate, SubjectUpdate
from app.core.auth import hash_password

def create_subject(db: Session, data: SubjectCreate) -> Subject:
    if db.query(Subject).filter(Subject.subject_code == data.subject_code).first():
        raise HTTPException(409, "Mã đối tượng đã tồn tại")
    if data.account_email and db.query(Subject).filter(Subject.account_email == data.account_email).first():
        raise HTTPException(409, "Email đăng nhập đã tồn tại")
    if data.account_phone and db.query(Subject).filter(Subject.account_phone == data.account_phone).first():
        raise HTTPException(409, "Số điện thoại đăng nhập đã tồn tại")
        
    db_obj = Subject(
        subject_code=data.subject_code,
        subject_name=data.subject_name,
        is_employee=data.is_employee,
        contact_email=data.contact_email or "",
        contact_phone=data.contact_phone or "",
        account_email=data.account_email or "",
        account_phone=data.account_phone or "",
        user_status=data.user_status,
        employee_status=data.employee_status,
        join_date=data.join_date,
        probation_date=data.probation_date,
        official_date=data.official_date,
        resign_date=data.resign_date,
        job_position_id=data.job_position_id,
        direct_manager_id=data.direct_manager_id,
        avatar=data.avatar
    )
    
    # Generate default password based on email or phone
    default_pw = data.account_phone or "dego123"
    db_obj.password_hash = hash_password(default_pw)
    
    db.add(db_obj)
    db.flush()
    
    if data.company_ids:
        for c_id in data.company_ids:
            db.add(SubjectCompany(subject_id=db_obj.id, company_id=c_id))
            
    if data.department_ids:
        for d_id in data.department_ids:
            db.add(SubjectDepartment(subject_id=db_obj.id, department_id=d_id))
            
    if data.job_title_ids:
        for t_id in data.job_title_ids:
            db.add(SubjectJobTitle(subject_id=db_obj.id, job_title_id=t_id))
            
    if data.role_ids:
        for r_id in data.role_ids:
            db.add(SubjectRole(subject_id=db_obj.id, role_id=r_id))
            
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_subject(db: Session, id: int, data: SubjectUpdate) -> Subject:
    db_obj = db.query(Subject).filter(Subject.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy đối tượng")
        
    if data.subject_code != db_obj.subject_code:
        if db.query(Subject).filter(Subject.subject_code == data.subject_code).first():
            raise HTTPException(409, "Mã đối tượng đã tồn tại")
    if data.account_email and data.account_email != db_obj.account_email:
        if db.query(Subject).filter(Subject.account_email == data.account_email).first():
            raise HTTPException(409, "Email đăng nhập đã tồn tại")
    if data.account_phone and data.account_phone != db_obj.account_phone:
        if db.query(Subject).filter(Subject.account_phone == data.account_phone).first():
            raise HTTPException(409, "Số điện thoại đăng nhập đã tồn tại")
            
    if data.direct_manager_id == id:
        raise HTTPException(400, "Không thể chọn báo cáo cho chính mình")
            
    db_obj.subject_code = data.subject_code
    db_obj.subject_name = data.subject_name
    db_obj.is_employee = data.is_employee
    db_obj.contact_email = data.contact_email or ""
    db_obj.contact_phone = data.contact_phone or ""
    db_obj.account_email = data.account_email or ""
    db_obj.account_phone = data.account_phone or ""
    db_obj.user_status = data.user_status
    db_obj.employee_status = data.employee_status
    db_obj.join_date = data.join_date
    db_obj.probation_date = data.probation_date
    db_obj.official_date = data.official_date
    db_obj.resign_date = data.resign_date
    db_obj.job_position_id = data.job_position_id
    db_obj.direct_manager_id = data.direct_manager_id
    db_obj.avatar = data.avatar
    
    db.query(SubjectCompany).filter(SubjectCompany.subject_id == id).delete()
    if data.company_ids:
        for c_id in data.company_ids:
            db.add(SubjectCompany(subject_id=db_obj.id, company_id=c_id))
            
    db.query(SubjectDepartment).filter(SubjectDepartment.subject_id == id).delete()
    if data.department_ids:
        for d_id in data.department_ids:
            db.add(SubjectDepartment(subject_id=db_obj.id, department_id=d_id))
            
    db.query(SubjectJobTitle).filter(SubjectJobTitle.subject_id == id).delete()
    if data.job_title_ids:
        for t_id in data.job_title_ids:
            db.add(SubjectJobTitle(subject_id=db_obj.id, job_title_id=t_id))
            
    db.query(SubjectRole).filter(SubjectRole.subject_id == id).delete()
    if data.role_ids:
        for r_id in data.role_ids:
            db.add(SubjectRole(subject_id=db_obj.id, role_id=r_id))
            
    # Xoá cache permissions
    from app.core.auth import perm_cache_clear
    perm_cache_clear(id)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_subject(db: Session, id: int):
    db_obj = db.query(Subject).filter(Subject.id == id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy đối tượng")
        
    if db.query(Subject).filter(Subject.direct_manager_id == id).first():
        raise HTTPException(400, "Không thể xóa đối tượng đang là quản lý trực tiếp của người khác")
        
    db.delete(db_obj)
    
    # Xoá cache permissions
    from app.core.auth import perm_cache_clear
    perm_cache_clear(id)
    
    db.commit()
