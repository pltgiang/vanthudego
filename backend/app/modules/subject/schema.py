from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import date


class SubjectBase(BaseModel):
    subject_code: str
    subject_name: str
    is_employee: Optional[bool] = True
    
    # Contact info
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    
    # Account info
    account_email: Optional[str] = None
    account_phone: Optional[str] = None
    user_status: Optional[str] = "ACTIVE" # ACTIVE, INACTIVE, LOCKED
    
    # Employee details
    employee_status: Optional[str] = "WORKING" # WORKING, MATERNITY, RESIGNED
    join_date: Optional[date] = None
    probation_date: Optional[date] = None
    official_date: Optional[date] = None
    resign_date: Optional[date] = None
    
    # Links
    org_unit_ids: Optional[List[int]] = []
    department_ids: Optional[List[int]] = []
    job_title_ids: Optional[List[int]] = []
    job_position_id: Optional[int] = None
    direct_manager_id: Optional[int] = None
    
    # RBAC
    role_ids: Optional[List[int]] = []
    
    vpn_access: Optional[str] = ""

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    org_unit_ids: List[int]
    department_ids: List[int]
    job_title_ids: List[int]
    role_ids: List[int]
    
    # Join fields
    job_position_name: Optional[str] = None
    direct_manager_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
