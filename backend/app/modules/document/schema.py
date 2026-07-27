from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date

# -----------------
# Register Book
# -----------------
class RegisterBookBase(BaseModel):
    name: str
    direction: int
    org_unit_id: int
    year: int = 2026
    status: int = 1

class RegisterBookCreate(RegisterBookBase):
    manager_ids: List[int]
    viewer_ids: List[int] = []

class RegisterBookUpdate(BaseModel):
    name: Optional[str] = None
    direction: Optional[int] = None
    org_unit_id: Optional[int] = None
    year: Optional[int] = None
    status: Optional[int] = None
    manager_ids: Optional[List[int]] = None
    viewer_ids: Optional[List[int]] = None

class RegisterBookOut(RegisterBookBase):
    id: int
    manager_ids: List[int] = []
    viewer_ids: List[int] = []
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Numbering Rule
# -----------------
class NumberingRuleBase(BaseModel):
    org_unit_id: Optional[int] = None
    direction: Optional[int] = None
    
    template: str
    start_number: int = 1
    reset_cycle: str = "YEAR"
    is_editable: bool = False
    
    is_all_doc_types: bool = True
    doc_type_ids: List[int] = []
    
    is_all_books: bool = True
    is_no_book: bool = False
    book_ids: List[int] = []
    
    padding: int = 2
    priority: int = 0

class NumberingRuleCreate(NumberingRuleBase):
    pass

class NumberingRuleUpdate(NumberingRuleBase):
    pass

class NumberingRuleOut(NumberingRuleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Document
# -----------------
class DocumentBase(BaseModel):
    direction: int
    book_id: Optional[int] = None
    org_unit_id: int
    doc_type_id: int
    
    doc_no: Optional[str] = None
    seq_no: Optional[int] = None
    symbol: Optional[str] = None
    
    subject: str
    body_summary: Optional[str] = None
    
    issued_date: Optional[date] = None
    received_date: Optional[date] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    review_date: Optional[date] = None
    
    partner_id: Optional[int] = None
    signer_id: Optional[int] = None
    signer_title: Optional[str] = None
    owner_id: Optional[int] = None
    
    secrecy_id: Optional[int] = None
    urgency_id: Optional[int] = None
    
    status: str
    current_version: int = 1
    custom_fields: Dict[str, Any] = {}

class DocumentCreate(DocumentBase):
    approver_id: Optional[int] = None

class DocumentUpdate(BaseModel):
    book_id: Optional[int] = None
    doc_type_id: Optional[int] = None
    doc_no: Optional[str] = None
    subject: Optional[str] = None
    body_summary: Optional[str] = None
    issued_date: Optional[date] = None
    received_date: Optional[date] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    partner_id: Optional[int] = None
    signer_id: Optional[int] = None
    signer_title: Optional[str] = None
    owner_id: Optional[int] = None
    secrecy_id: Optional[int] = None
    urgency_id: Optional[int] = None
    status: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None

class DocumentOut(DocumentBase):
    id: int
    approvals: List['DocumentApprovalOut'] = []
    model_config = ConfigDict(from_attributes=True)

# -----------------
# Forward Payload
# -----------------
class DocumentForward(BaseModel):
    to_user_id: int
    cc_user_ids: List[int] = []
    note: Optional[str] = None

# -----------------
# Document Approval
# -----------------
class DocumentApprovalBase(BaseModel):
    document_id: int
    approver_id: Optional[int] = None
    status: str
    step_order: int = 1
    note: Optional[str] = None

class DocumentApprovalOut(DocumentApprovalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ApprovalAction(BaseModel):
    note: Optional[str] = None
