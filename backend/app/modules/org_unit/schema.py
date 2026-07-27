from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import date


class OrgUnitBusinessAreaBase(BaseModel):
    business_area: str

class OrgUnitBase(BaseModel):
    parent_id: Optional[int] = None
    unit_code: str
    short_name: Optional[str] = None
    unit_name: str
    org_level: str
    accounting_type: Optional[str] = None
    sort_order: Optional[int] = 9999
    manager_id: Optional[int] = None
    functions_duties: Optional[str] = None
    business_reg_no: Optional[str] = None
    business_reg_date: Optional[date] = None
    business_reg_place: Optional[str] = None
    address: Optional[str] = None
    is_inactive: Optional[bool] = False
    business_areas: Optional[List[str]] = []

class OrgUnitCreate(OrgUnitBase):
    pass

class OrgUnitUpdate(OrgUnitBase):
    pass

class OrgUnitOut(OrgUnitBase):
    id: int
    parent_id: int
    
    model_config = ConfigDict(from_attributes=True)
