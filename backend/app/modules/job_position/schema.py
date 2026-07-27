from typing import List, Optional
from pydantic import BaseModel, ConfigDict


# Position Group
class PositionGroupBase(BaseModel):
    group_name: str
    description: Optional[str] = None
    sort_order: Optional[int] = 9999
    is_inactive: Optional[bool] = False

class PositionGroupCreate(PositionGroupBase):
    pass

class PositionGroupUpdate(PositionGroupBase):
    pass

class PositionGroupOut(PositionGroupBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Job Title
class JobTitleBase(BaseModel):
    title_code: Optional[str] = None
    title_name: str
    description: Optional[str] = None
    sort_order: Optional[int] = 9999
    is_inactive: Optional[bool] = False

class JobTitleCreate(JobTitleBase):
    pass

class JobTitleUpdate(JobTitleBase):
    pass

class JobTitleOut(JobTitleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Job Position
class JobPositionBase(BaseModel):
    position_code: str
    position_name: str
    group_id: Optional[int] = None
    title_id: Optional[int] = None
    report_to_position_id: Optional[int] = None
    description: Optional[str] = None
    is_inactive: Optional[bool] = False
    org_unit_ids: Optional[List[int]] = []

class JobPositionCreate(JobPositionBase):
    pass

class JobPositionUpdate(JobPositionBase):
    pass

class JobPositionOut(JobPositionBase):
    id: int
    org_unit_ids: List[int]
    
    # extra fields for join
    group_name: Optional[str] = None
    title_name: Optional[str] = None
    report_to_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
