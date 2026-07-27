from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.org_unit.model import OrgUnit, OrgUnitBusinessArea
from app.modules.org_unit.schema import OrgUnitCreate, OrgUnitUpdate

ORG_LEVELS = [
    "TONG_CONG_TY",
    "CHI_NHANH",
    "VAN_PHONG",
    "PHONG_BAN",
    "PHAN_XUONG",
    "NHOM"
]

def check_org_level_hierarchy(parent_level: str, child_level: str) -> bool:
    if parent_level not in ORG_LEVELS or child_level not in ORG_LEVELS:
        return False
    return ORG_LEVELS.index(child_level) > ORG_LEVELS.index(parent_level)

def get_descendants(db: Session, org_id: int):
    descendants = []
    children = db.query(OrgUnit).filter(OrgUnit.parent_id == org_id).all()
    for child in children:
        descendants.append(child.id)
        descendants.extend(get_descendants(db, child.id))
    return descendants

def create_org_unit(db: Session, data: OrgUnitCreate) -> OrgUnit:
    if db.query(OrgUnit).filter(OrgUnit.unit_code == data.unit_code).first():
        raise HTTPException(409, "Mã đơn vị đã tồn tại. Vui lòng nhập mã khác.")

    if data.org_level == "TONG_CONG_TY":
        if db.query(OrgUnit).filter(OrgUnit.org_level == "TONG_CONG_TY").first():
            raise HTTPException(409, "Doanh nghiệp chỉ có một đơn vị cấp Tổng công ty/Công ty.")
        data.parent_id = 0

    if data.parent_id:
        parent = db.query(OrgUnit).filter(OrgUnit.id == data.parent_id).first()
        if not parent:
            raise HTTPException(400, "Không tìm thấy đơn vị cấp trên.")
        if not check_org_level_hierarchy(parent.org_level, data.org_level):
            raise HTTPException(400, "Cấp tổ chức của đơn vị con phải thấp hơn đơn vị cấp trên.")
    
    if data.org_level == "CHI_NHANH" and not data.accounting_type:
        raise HTTPException(400, "Vui lòng chọn hình thức hạch toán cho chi nhánh.")

    db_obj = OrgUnit(
        parent_id=data.parent_id or 0,
        unit_code=data.unit_code,
        short_name=data.short_name or "",
        unit_name=data.unit_name,
        org_level=data.org_level,
        accounting_type=data.accounting_type or "",
        sort_order=data.sort_order if data.sort_order is not None else 9999,
        manager_id=data.manager_id or 0,
        functions_duties=data.functions_duties or "",
        business_reg_no=data.business_reg_no or "",
        business_reg_date=data.business_reg_date,
        business_reg_place=data.business_reg_place or "",
        address=data.address or "",
        is_inactive=data.is_inactive if data.org_level != "TONG_CONG_TY" else False
    )
    db.add(db_obj)
    db.flush()

    if data.business_areas:
        for area in data.business_areas:
            db.add(OrgUnitBusinessArea(org_unit_id=db_obj.id, business_area=area))

    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_org_unit(db: Session, org_id: int, data: OrgUnitUpdate) -> OrgUnit:
    db_obj = db.query(OrgUnit).filter(OrgUnit.id == org_id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy cơ cấu tổ chức")

    if data.unit_code != db_obj.unit_code:
        if db.query(OrgUnit).filter(OrgUnit.unit_code == data.unit_code).first():
            raise HTTPException(409, "Mã đơn vị đã tồn tại. Vui lòng nhập mã khác.")

    if db_obj.org_level == "TONG_CONG_TY":
        data.org_level = "TONG_CONG_TY"
        data.parent_id = 0
        data.is_inactive = False
    
    if data.parent_id:
        if data.parent_id == org_id:
            raise HTTPException(400, "Không thể chọn đơn vị này làm đơn vị cấp trên.")
        descendants = get_descendants(db, org_id)
        if data.parent_id in descendants:
            raise HTTPException(400, "Không thể chọn đơn vị con làm đơn vị cấp trên.")
            
        parent = db.query(OrgUnit).filter(OrgUnit.id == data.parent_id).first()
        if not parent:
            raise HTTPException(400, "Không tìm thấy đơn vị cấp trên.")
        if not check_org_level_hierarchy(parent.org_level, data.org_level):
            raise HTTPException(400, "Cấp tổ chức của đơn vị con phải thấp hơn đơn vị cấp trên.")

    if data.org_level == "CHI_NHANH" and not data.accounting_type:
        raise HTTPException(400, "Vui lòng chọn hình thức hạch toán cho chi nhánh.")

    db_obj.parent_id = data.parent_id or 0
    db_obj.unit_code = data.unit_code
    db_obj.short_name = data.short_name or ""
    db_obj.unit_name = data.unit_name
    db_obj.org_level = data.org_level
    db_obj.accounting_type = data.accounting_type or ""
    db_obj.sort_order = data.sort_order if data.sort_order is not None else 9999
    db_obj.manager_id = data.manager_id or 0
    db_obj.functions_duties = data.functions_duties or ""
    db_obj.business_reg_no = data.business_reg_no or ""
    db_obj.business_reg_date = data.business_reg_date
    db_obj.business_reg_place = data.business_reg_place or ""
    db_obj.address = data.address or ""
    db_obj.is_inactive = data.is_inactive if data.org_level != "TONG_CONG_TY" else False

    # Update business areas
    db.query(OrgUnitBusinessArea).filter(OrgUnitBusinessArea.org_unit_id == org_id).delete()
    if data.business_areas:
        for area in data.business_areas:
            db.add(OrgUnitBusinessArea(org_unit_id=db_obj.id, business_area=area))

    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_org_unit(db: Session, org_id: int):
    db_obj = db.query(OrgUnit).filter(OrgUnit.id == org_id).first()
    if not db_obj:
        raise HTTPException(404, "Không tìm thấy cơ cấu tổ chức")
        
    if db_obj.org_level == "TONG_CONG_TY":
        raise HTTPException(400, "Không thể xóa đơn vị cấp Tổng công ty/Công ty.")
        
    children_count = db.query(OrgUnit).filter(OrgUnit.parent_id == org_id).count()
    if children_count > 0:
        raise HTTPException(400, f"Đơn vị đang có {children_count} đơn vị trực thuộc. Vui lòng xóa đơn vị con trước.")
        
    # TODO: Check if used in transactions (Subject, JobPosition)
    # db.query(SubjectOrgUnit).filter(SubjectOrgUnit.org_unit_id == org_id).count()
    
    db.delete(db_obj)
    db.commit()
