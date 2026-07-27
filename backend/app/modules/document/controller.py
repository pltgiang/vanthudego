from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require
from app.core.response import success
from app.core.base_controller import apply_filters, pagination
from app.core.crud import make_crud_router
from app.core.audit import record

from app.modules.document.model import RegisterBook, NumberingRule, Document
from app.modules.document.schema import (
    RegisterBookCreate, RegisterBookUpdate, RegisterBookOut,
    NumberingRuleCreate, NumberingRuleUpdate, NumberingRuleOut,
    DocumentCreate, DocumentUpdate, DocumentOut, DocumentForward
)
from app.modules.document.service import create_document, forward_document

from app.modules.document.model import RegisterBook, RegisterBookManager, RegisterBookViewer
from app.modules.document.service import create_register_book, update_register_book, delete_register_book

# 1. Register Book Router
register_book_router = APIRouter(prefix="/api/register_books", tags=["register_book"])

@register_book_router.get("")
def list_register_books(
    request: Request,
    direction: int = None,
    pg: dict = Depends(pagination),
    db: Session = Depends(get_db),
    user=Depends(require("register_book", "read"))
):
    q = apply_filters(db.query(RegisterBook), RegisterBook, request, ["name", "status", "org_unit_id", "year"])
    if direction:
        q = q.filter(RegisterBook.direction == direction)
        
    total = q.count()
    items = q.order_by(RegisterBook.id.desc()).offset(pg["offset"]).limit(pg["limit"]).all()
    
    res = []
    for book in items:
        out = RegisterBookOut.model_validate(book)
        out.manager_ids = [m.user_id for m in db.query(RegisterBookManager).filter(RegisterBookManager.book_id == book.id).all()]
        out.viewer_ids = [v.user_id for v in db.query(RegisterBookViewer).filter(RegisterBookViewer.book_id == book.id).all()]
        res.append(out.model_dump())
        
    return success({"total": total, "items": res})

@register_book_router.get("/{oid}")
def get_register_book(oid: int, db: Session = Depends(get_db), user=Depends(require("register_book", "read"))):
    book = db.get(RegisterBook, oid)
    if not book:
        raise HTTPException(404, "Không tìm thấy sổ văn bản")
    out = RegisterBookOut.model_validate(book)
    out.manager_ids = [m.user_id for m in db.query(RegisterBookManager).filter(RegisterBookManager.book_id == book.id).all()]
    out.viewer_ids = [v.user_id for v in db.query(RegisterBookViewer).filter(RegisterBookViewer.book_id == book.id).all()]
    return success(out.model_dump())

@register_book_router.post("")
def create_book(data: RegisterBookCreate, db: Session = Depends(get_db), user=Depends(require("register_book", "create"))):
    book = create_register_book(db, data, user.id)
    out = RegisterBookOut.model_validate(book)
    out.manager_ids = data.manager_ids
    out.viewer_ids = data.viewer_ids
    return success(out.model_dump(), "Tạo sổ văn bản thành công", 201)

@register_book_router.patch("/{oid}")
def update_book(oid: int, data: RegisterBookUpdate, db: Session = Depends(get_db), user=Depends(require("register_book", "write"))):
    book = update_register_book(db, oid, data, user.id)
    out = RegisterBookOut.model_validate(book)
    out.manager_ids = [m.user_id for m in db.query(RegisterBookManager).filter(RegisterBookManager.book_id == book.id).all()]
    out.viewer_ids = [v.user_id for v in db.query(RegisterBookViewer).filter(RegisterBookViewer.book_id == book.id).all()]
    return success(out.model_dump(), "Cập nhật thành công")

@register_book_router.delete("/{oid}")
def delete_book(oid: int, db: Session = Depends(get_db), user=Depends(require("register_book", "delete"))):
    delete_register_book(db, oid, user.id)
    return success(None, "Xóa sổ văn bản thành công")

# 2. Numbering Rule Router
numbering_rule_router = make_crud_router(
    prefix="/api/numbering_rules",
    entity="numbering_rule",
    Model=NumberingRule,
    CreateSchema=NumberingRuleCreate,
    UpdateSchema=NumberingRuleUpdate,
    OutSchema=NumberingRuleOut,
    filterable=["org_unit_id", "direction"]
)

# 3. Document Router
document_router = APIRouter(prefix="/api/documents", tags=["document"])

@document_router.get("")
def list_documents(
    request: Request, 
    direction: int = None,
    pg: dict = Depends(pagination),
    db: Session = Depends(get_db), 
    user=Depends(require("document", "read"))
):
    q = apply_filters(db.query(Document), Document, request, ["doc_no", "subject", "status", "doc_type_id", "org_unit_id", "book_id"])
    if direction:
        q = q.filter(Document.direction == direction)
        
    total = q.count()
    items = q.order_by(Document.id.desc()).offset(pg["offset"]).limit(pg["limit"]).all()
    return success({
        "total": total,
        "items": [DocumentOut.model_validate(i).model_dump() for i in items]
    })

@document_router.get("/{oid}")
def get_doc(request: Request, oid: int, db: Session = Depends(get_db), user=Depends(require("document", "read"))):
    doc = db.get(Document, oid)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
        
    from app.modules.document.security_service import check_document_access
    # Pass user roles here for RBAC if implemented, currently passing empty list as fallback.
    # Typically, you'd get roles from user profile.
    # allowed_roles check is handled in check_document_access
    roles = [] 
    if hasattr(user, 'roles'):
        roles = [r.role_code for r in user.roles]
    check_document_access(db, oid, user.id, "VIEW_METADATA", request, roles)
    
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
    return success(DocumentOut.model_validate(doc).model_dump())

@document_router.post("")
def create_doc(data: DocumentCreate, db: Session = Depends(get_db), user=Depends(require("document", "create"))):
    doc = create_document(db, data, user.id)
    return success(DocumentOut.model_validate(doc).model_dump(), "Tạo văn bản thành công", 201)

@document_router.patch("/{oid}")
def update_doc(oid: int, data: DocumentUpdate, db: Session = Depends(get_db), user=Depends(require("document", "write"))):
    doc = db.get(Document, oid)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
        
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(doc, k, v)
        
    doc.updated_by = user.id
    db.commit()
    db.refresh(doc)
    record(db, user.id, "document", oid, "update")
    
    return success(DocumentOut.model_validate(doc).model_dump(), "Cập nhật thành công")

@document_router.post("/{oid}/forward")
def forward_doc(oid: int, data: DocumentForward, db: Session = Depends(get_db), user=Depends(require("document", "write"))):
    doc = forward_document(db, oid, data, user.id)
    return success(DocumentOut.model_validate(doc).model_dump(), "Luân chuyển thành công")

from app.modules.document.schema import ApprovalAction
from app.modules.document.service import approve_document, reject_document, request_edit_document

@document_router.post("/{oid}/approve")
def api_approve_document(oid: int, data: ApprovalAction, db: Session = Depends(get_db), user=Depends(require("document", "approve"))):
    doc = approve_document(db, oid, data, user.id)
    return success(DocumentOut.model_validate(doc).model_dump(), "Phê duyệt thành công")

@document_router.post("/{oid}/reject")
def api_reject_document(oid: int, data: ApprovalAction, db: Session = Depends(get_db), user=Depends(require("document", "approve"))):
    doc = reject_document(db, oid, data, user.id)
    return success(DocumentOut.model_validate(doc).model_dump(), "Từ chối thành công")

@document_router.post("/{oid}/request-edit")
def api_request_edit_document(oid: int, data: ApprovalAction, db: Session = Depends(get_db), user=Depends(require("document", "approve"))):
    doc = request_edit_document(db, oid, data, user.id)
    return success(DocumentOut.model_validate(doc).model_dump(), "Đã yêu cầu chỉnh sửa")

from app.modules.document.security_schema import HotLockRequest, DocAccessRequestOut
from app.modules.document.security_service import set_hot_lock, request_2fa_access, approve_2fa_access

@document_router.post("/{oid}/hot-lock")
def api_hot_lock(oid: int, data: HotLockRequest, db: Session = Depends(get_db), user=Depends(require("document", "write"))):
    doc = set_hot_lock(db, oid, data.is_hot_locked)
    record(db, user.id, "document", oid, "hot-lock", f"Trạng thái: {data.is_hot_locked}")
    return success({"is_hot_locked": doc.is_hot_locked}, "Đã cập nhật trạng thái khóa nóng")

@document_router.post("/{oid}/request-access")
def api_request_access(oid: int, db: Session = Depends(get_db), user=Depends(require("document", "read"))):
    req = request_2fa_access(db, oid, user.id)
    return success(DocAccessRequestOut.model_validate(req).model_dump(), "Đã gửi yêu cầu truy cập")

from app.modules.document.model import DocAccessRequest
@document_router.get("/requests/pending")
def list_pending_requests(db: Session = Depends(get_db), user=Depends(require("document", "approve"))):
    reqs = db.query(DocAccessRequest).filter(DocAccessRequest.status == "PENDING").all()
    return success({
        "items": [DocAccessRequestOut.model_validate(r).model_dump() for r in reqs]
    })

@document_router.post("/requests/{req_id}/approve")
def api_approve_access(req_id: int, db: Session = Depends(get_db), user=Depends(require("document", "approve"))): # Assuming approve role can approve 2FA
    # Session is hardcoded to 30 mins
    req = approve_2fa_access(db, req_id, user.id, session_minutes=30)
    return success(DocAccessRequestOut.model_validate(req).model_dump(), "Đã phê duyệt yêu cầu truy cập")

