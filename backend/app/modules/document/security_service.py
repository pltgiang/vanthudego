from sqlalchemy.orm import Session
from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from app.modules.document.model import Document, DocSecurityPolicy, DocAccessRequest, DocAccessLog
from app.core.auth import require

def check_document_access(db: Session, document_id: int, user_id: int, action: str, request: Request, allowed_roles: list[str] = None):
    """
    Gateway to check if user can access the document based on Hot Lock, 2FA Policy and RBAC.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Tài liệu không tồn tại")

    # 1. Hot Lock Check
    if doc.is_hot_locked:
        # Only admin or owner can access hot-locked document
        # Let's say we get the user profile to check admin, for now assume owner
        if doc.owner_id != user_id:
            raise HTTPException(403, "Tài liệu đang bị khóa nóng, không thể truy cập.")

    # 2. Security Policy Check (2FA / Secret level)
    policy = db.query(DocSecurityPolicy).filter(
        (DocSecurityPolicy.doc_type_id == doc.doc_type_id) | 
        (DocSecurityPolicy.secrecy_id == doc.secrecy_id)
    ).first()

    if policy and policy.requires_2fa:
        # check if user has allowed role
        if allowed_roles and not any(role in policy.allowed_roles for role in allowed_roles):
            # check if they have an active session
            active_request = db.query(DocAccessRequest).filter(
                DocAccessRequest.document_id == document_id,
                DocAccessRequest.requester_id == user_id,
                DocAccessRequest.status == "APPROVED",
                DocAccessRequest.expires_at > datetime.now()
            ).first()
            if not active_request:
                raise HTTPException(403, "ERR_2FA_REQUIRED")

    # 3. Log access
    client_ip = request.client.host if request and request.client else ""
    user_agent = request.headers.get("user-agent", "")
    
    log = DocAccessLog(
        document_id=document_id,
        user_id=user_id,
        action=action,
        ip_address=client_ip,
        user_agent=user_agent
    )
    db.add(log)
    db.commit()

    return True

def request_2fa_access(db: Session, document_id: int, user_id: int):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Tài liệu không tồn tại")
        
    # Check if existing pending request
    existing = db.query(DocAccessRequest).filter(
        DocAccessRequest.document_id == document_id,
        DocAccessRequest.requester_id == user_id,
        DocAccessRequest.status == "PENDING"
    ).first()
    if existing:
        return existing
        
    req = DocAccessRequest(
        document_id=document_id,
        requester_id=user_id,
        status="PENDING"
    )
    db.add(req)
    
    # Log the action
    log = DocAccessLog(document_id=document_id, user_id=user_id, action="REQUEST_2FA")
    db.add(log)
    db.commit()
    db.refresh(req)
    
    # TODO: Send notification to BOD
    return req

def approve_2fa_access(db: Session, request_id: int, approver_id: int, session_minutes: int = 30):
    req = db.query(DocAccessRequest).filter(DocAccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(404, "Yêu cầu không tồn tại")
    if req.status != "PENDING":
        raise HTTPException(400, "Yêu cầu đã được xử lý")
        
    req.status = "APPROVED"
    req.approver_id = approver_id
    req.expires_at = datetime.now() + timedelta(minutes=session_minutes)
    
    db.commit()
    return req

def set_hot_lock(db: Session, document_id: int, is_locked: bool):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Tài liệu không tồn tại")
        
    doc.is_hot_locked = is_locked
    db.commit()
    return doc
