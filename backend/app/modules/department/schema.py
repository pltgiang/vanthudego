from pydantic import BaseModel, Field
from typing import Optional


class DepartmentBase(BaseModel):
    code: str
    name: str
    company_id: int = 0
    parent_id: int = 0
    manager_id: Optional[int] = 0
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    company_id: Optional[int] = None
    parent_id: Optional[int] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None


class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True
