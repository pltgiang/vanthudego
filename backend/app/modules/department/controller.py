from fastapi import APIRouter
from app.core.crud import make_crud_router
from app.modules.department.model import Department
from app.modules.department.schema import DepartmentCreate, DepartmentUpdate, DepartmentOut

router = make_crud_router(
    prefix="/api/departments",
    entity="org_unit",
    Model=Department,
    CreateSchema=DepartmentCreate,
    UpdateSchema=DepartmentUpdate,
    OutSchema=DepartmentOut,
    filterable=["code", "name", "company_id", "parent_id", "is_active"],
    csv_headers={
        "code": "Mã PB",
        "name": "Tên phòng ban",
        "company_id": "Mã công ty",
        "parent_id": "Mã PB cha",
        "is_active": "Trạng thái",
    },
)
