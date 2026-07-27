from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class DocAccessRequestCreate(BaseModel):
    document_id: int
    note: Optional[str] = None

class DocAccessRequestOut(BaseModel):
    id: int
    document_id: int
    requester_id: int
    approver_id: Optional[int]
    status: str
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class DocSecurityPolicyBase(BaseModel):
    doc_type_id: Optional[int]
    secrecy_id: Optional[int]
    requires_2fa: bool = False
    allowed_roles: List[str] = []

class ApprovalFlowConfigBase(BaseModel):
    doc_type_id: int
    steps: List[dict] # [{"step": 1, "role": "MANAGER"}]

class HotLockRequest(BaseModel):
    is_hot_locked: bool
