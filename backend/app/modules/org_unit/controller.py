from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.core.auth import get_current_user, require
from app.core.database import get_db
from app.core.response import success
from app.core.audit import record
from app.modules.org_unit.model import OrgUnit
from app.modules.org_unit.schema import OrgUnitCreate, OrgUnitUpdate
from app.modules.org_unit import service

router = APIRouter(prefix="/api/v1/system/org-units", tags=["org-unit"])

@router.get("")
def get_org_units(
    status: Optional[str] = None,
    q: Optional[str] = None,
    tree: Optional[bool] = False,
    user=Depends(require("org_unit", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(OrgUnit)
    
    if status == "ACTIVE":
        query = query.filter(OrgUnit.is_inactive == False)
    elif status == "INACTIVE":
        query = query.filter(OrgUnit.is_inactive == True)
        
    if q:
        search = f"%{q}%"
        query = query.filter(
            (OrgUnit.unit_code.like(search)) |
            (OrgUnit.unit_name.like(search)) |
            (OrgUnit.short_name.like(search))
        )
        
    query = query.order_by(OrgUnit.sort_order.asc(), OrgUnit.id.asc())
    orgs = query.all()
    
    # Format out
    out = []
    for o in orgs:
        obj = {
            "id": o.id,
            "parent_id": o.parent_id,
            "unit_code": o.unit_code,
            "unit_name": o.unit_name,
            "short_name": o.short_name,
            "org_level": o.org_level,
            "address": o.address,
            "is_inactive": o.is_inactive,
            "accounting_type": o.accounting_type,
            "sort_order": o.sort_order,
            "manager_id": o.manager_id,
            "functions_duties": o.functions_duties,
            "business_reg_no": o.business_reg_no,
            "business_reg_date": o.business_reg_date,
            "business_reg_place": o.business_reg_place,
            "business_areas": [ba.business_area for ba in o.business_areas]
        }
        out.append(obj)
        
    if tree:
        # Build tree
        node_map = {node["id"]: node for node in out}
        tree_out = []
        for node in out:
            node["children"] = []
            
        for node in out:
            parent_id = node.get("parent_id")
            if parent_id and parent_id in node_map:
                node_map[parent_id]["children"].append(node)
            else:
                tree_out.append(node)
        return success(tree_out)
        
    return success(out)


@router.get("/check-code")
def check_code(code: str, user=Depends(require("org_unit", "read")), db: Session = Depends(get_db)):
    exists = db.query(OrgUnit).filter(OrgUnit.unit_code == code).first() is not None
    return success({"exists": exists})


@router.get("/{id}")
def get_org_unit(id: int, user=Depends(require("org_unit", "read")), db: Session = Depends(get_db)):
    o = db.query(OrgUnit).filter(OrgUnit.id == id).first()
    if not o:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy cơ cấu tổ chức")
    obj = {
        "id": o.id,
        "parent_id": o.parent_id,
        "unit_code": o.unit_code,
        "unit_name": o.unit_name,
        "short_name": o.short_name,
        "org_level": o.org_level,
        "address": o.address,
        "is_inactive": o.is_inactive,
        "accounting_type": o.accounting_type,
        "sort_order": o.sort_order,
        "manager_id": o.manager_id,
        "functions_duties": o.functions_duties,
        "business_reg_no": o.business_reg_no,
        "business_reg_date": o.business_reg_date,
        "business_reg_place": o.business_reg_place,
        "business_areas": [ba.business_area for ba in o.business_areas]
    }
    return success(obj)


@router.post("")
def create_org_unit(data: OrgUnitCreate, user=Depends(require("org_unit", "create")), db: Session = Depends(get_db)):
    db_obj = service.create_org_unit(db, data)
    record(db, user.id, "org_unit", db_obj.id, "CREATE_ORG_UNIT", f"Thêm cơ cấu tổ chức {db_obj.unit_code}")
    return success({"id": db_obj.id}, "Thêm cơ cấu tổ chức thành công.")


@router.put("/{id}")
def update_org_unit(id: int, data: OrgUnitUpdate, user=Depends(require("org_unit", "write")), db: Session = Depends(get_db)):
    db_obj = service.update_org_unit(db, id, data)
    record(db, user.id, "org_unit", db_obj.id, "UPDATE_ORG_UNIT", f"Sửa cơ cấu tổ chức {db_obj.unit_code}")
    return success({"id": db_obj.id}, "Cập nhật cơ cấu tổ chức thành công.")


@router.delete("/{id}")
def delete_org_unit(id: int, user=Depends(require("org_unit", "delete")), db: Session = Depends(get_db)):
    service.delete_org_unit(db, id)
    record(db, user.id, "org_unit", id, "DELETE_ORG_UNIT", f"Xóa cơ cấu tổ chức {id}")
    return success(None, "Xóa cơ cấu tổ chức thành công.")


@router.patch("/{id}/inactive")
def toggle_inactive(id: int, data: dict, user=Depends(require("org_unit", "write")), db: Session = Depends(get_db)):
    is_inactive = data.get("is_inactive", False)
    db_obj = db.query(OrgUnit).filter(OrgUnit.id == id).first()
    if not db_obj:
        from fastapi import HTTPException
        raise HTTPException(404, "Không tìm thấy cơ cấu tổ chức")
    if db_obj.org_level == "TONG_CONG_TY":
        from fastapi import HTTPException
        raise HTTPException(400, "Không thể ngừng theo dõi đơn vị cấp Tổng công ty/Công ty.")
        
    db_obj.is_inactive = is_inactive
    db.commit()
    record(db, user.id, "org_unit", db_obj.id, "TOGGLE_ORG_UNIT_STATUS", f"Đổi trạng thái ngừng theo dõi {db_obj.unit_code}")
    return success(None, "Cập nhật trạng thái thành công.")
