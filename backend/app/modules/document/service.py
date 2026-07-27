from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from app.modules.document.model import Document, NumberingRule, NumberingCounter, DocumentLink, RegisterBook, RegisterBookManager, RegisterBookViewer
from app.modules.document.schema import DocumentCreate, DocumentUpdate, DocumentForward, RegisterBookCreate, RegisterBookUpdate
from app.core.audit import record

from app.modules.catalog.model import DocType

def generate_doc_number(db: Session, direction: int, doc_type_id: int, book_id: int | None, org_unit_id: int) -> tuple[str, int]:
    doc_type = db.get(DocType, doc_type_id)
    doc_type_code = doc_type.code if doc_type else ""

    rules = db.query(NumberingRule).filter(
        NumberingRule.direction == direction
    ).order_by(NumberingRule.priority.desc()).all()
    
    matched_rule = None
    for r in rules:
        # Check doc_type
        if not r.is_all_doc_types and doc_type_id not in r.doc_type_ids:
            continue
        # Check book
        if not r.is_all_books:
            if book_id is None:
                if not r.is_no_book:
                    continue
            else:
                if book_id not in r.book_ids:
                    continue
        matched_rule = r
        break
        
    if not matched_rule:
        return "", 0
        
    rule = matched_rule
    now = datetime.now()
    year, month, day = now.year, now.month, now.day
    
    scope_key = f"RULE_{rule.id}"
    if rule.reset_cycle == "YEAR":
        scope_key += f"_{year}"
        
    counter = db.query(NumberingCounter).filter(NumberingCounter.scope_key == scope_key).first()
    if not counter:
        counter = NumberingCounter(scope_key=scope_key, current_no=rule.start_number - 1)
        db.add(counter)
        db.flush()
        
    counter.current_no += 1
    seq_no = counter.current_no
    
    doc_no = rule.template
    doc_no = doc_no.replace("{STT}", str(seq_no).zfill(rule.padding))
    doc_no = doc_no.replace("{Ngay}", str(day).zfill(2))
    doc_no = doc_no.replace("{Thang}", str(month).zfill(2))
    doc_no = doc_no.replace("{Nam}", str(year))
    doc_no = doc_no.replace("{LoaiVB}", doc_type_code)
    
    # Old tags fallback
    doc_no = doc_no.replace("{seq}", str(seq_no).zfill(rule.padding))
    doc_no = doc_no.replace("{year}", str(year))
    doc_no = doc_no.replace("{month}", str(month).zfill(2))
    
    return doc_no, seq_no

def create_document(db: Session, data: DocumentCreate, user_id: int) -> Document:
    # Nếu chưa có doc_no thì sinh tự động
    seq_no = None
    doc_no = data.doc_no
    if not doc_no:
        doc_no, seq_no = generate_doc_number(db, data.direction, data.doc_type_id, data.book_id, data.org_unit_id)
        
    doc_dict = data.model_dump(exclude={"approver_id"})
    doc_dict["doc_no"] = doc_no
    doc_dict["seq_no"] = seq_no
    
    if data.approver_id:
        doc_dict["status"] = "Chờ phê duyệt"
    
    doc = Document(**doc_dict, created_by=user_id, updated_by=user_id)
    db.add(doc)
    db.flush()
    
    if data.approver_id:
        from app.modules.document.model import DocumentApproval
        approval = DocumentApproval(
            document_id=doc.id,
            approver_id=data.approver_id,
            status="PENDING",
            step_order=1,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(approval)
        
    db.commit()
    db.refresh(doc)
    record(db, user_id, "document", doc.id, "create")
    return doc

def forward_document(db: Session, doc_id: int, data: DocumentForward, user_id: int) -> Document:
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
        
    # Tạo link chuyển tiếp
    link = DocumentLink(
        from_document_id=doc_id,
        link_type="FORWARD",
        created_by=user_id,
        updated_by=user_id
    )
    # Trong thực tế, có thể lưu to_user_id vào một bảng DocumentAssignee
    # Ở đây lưu log đơn giản vào audit
    db.add(link)
    
    doc.status = "Đang xử lý"
    doc.owner_id = data.to_user_id
    doc.updated_by = user_id
    
    db.commit()
    db.refresh(doc)
    record(db, user_id, "document", doc.id, f"forward_to_{data.to_user_id}")
    return doc

def create_register_book(db: Session, data: RegisterBookCreate, user_id: int) -> RegisterBook:
    book_dict = data.model_dump(exclude={"manager_ids", "viewer_ids"})
    book = RegisterBook(**book_dict, created_by=user_id, updated_by=user_id)
    db.add(book)
    db.flush()
    
    for uid in data.manager_ids:
        db.add(RegisterBookManager(book_id=book.id, user_id=uid, created_by=user_id, updated_by=user_id))
        
    for uid in data.viewer_ids:
        db.add(RegisterBookViewer(book_id=book.id, user_id=uid, created_by=user_id, updated_by=user_id))
        
    db.commit()
    db.refresh(book)
    record(db, user_id, "register_book", book.id, "create")
    return book

def update_register_book(db: Session, book_id: int, data: RegisterBookUpdate, user_id: int) -> RegisterBook:
    book = db.get(RegisterBook, book_id)
    if not book:
        raise HTTPException(404, "Không tìm thấy sổ văn bản")
        
    update_data = data.model_dump(exclude_unset=True, exclude={"manager_ids", "viewer_ids"})
    for k, v in update_data.items():
        setattr(book, k, v)
    
    if data.manager_ids is not None:
        db.query(RegisterBookManager).filter(RegisterBookManager.book_id == book.id).delete()
        for uid in data.manager_ids:
            db.add(RegisterBookManager(book_id=book.id, user_id=uid, created_by=user_id, updated_by=user_id))
            
    if data.viewer_ids is not None:
        db.query(RegisterBookViewer).filter(RegisterBookViewer.book_id == book.id).delete()
        for uid in data.viewer_ids:
            db.add(RegisterBookViewer(book_id=book.id, user_id=uid, created_by=user_id, updated_by=user_id))
            
    book.updated_by = user_id
    db.commit()
    db.refresh(book)
    record(db, user_id, "register_book", book.id, "update")
    return book

def delete_register_book(db: Session, book_id: int, user_id: int):
    book = db.get(RegisterBook, book_id)
    if not book:
        raise HTTPException(404, "Không tìm thấy sổ văn bản")
        
    # Check if there are any documents in this book
    doc_count = db.query(Document).filter(Document.book_id == book_id).count()
    if doc_count > 0:
        raise HTTPException(400, "Không thể xóa sổ đã có văn bản")
        
    db.query(RegisterBookManager).filter(RegisterBookManager.book_id == book.id).delete()
    db.query(RegisterBookViewer).filter(RegisterBookViewer.book_id == book.id).delete()
    db.delete(book)
    db.commit()
    record(db, user_id, "register_book", book_id, "delete")
    return True

from app.modules.document.schema import ApprovalAction

def approve_document(db: Session, doc_id: int, data: ApprovalAction, user_id: int) -> Document:
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
    
    from app.modules.document.model import DocumentApproval
    approval = db.query(DocumentApproval).filter(
        DocumentApproval.document_id == doc_id,
        DocumentApproval.approver_id == user_id,
        DocumentApproval.status == "PENDING"
    ).first()
    
    if not approval:
        raise HTTPException(403, "Bạn không có quyền duyệt hoặc văn bản không ở trạng thái chờ duyệt")
        
    approval.status = "APPROVED"
    approval.note = data.note
    approval.updated_by = user_id
    
    from app.modules.document.model import ApprovalFlowConfig, DocumentApproval
    config = db.query(ApprovalFlowConfig).filter(ApprovalFlowConfig.doc_type_id == doc.doc_type_id).first()
    
    if config and config.steps:
        current_step = approval.step_order
        next_step_config = next((s for s in config.steps if s.get("step") == current_step + 1), None)
        if next_step_config:
            next_approval = DocumentApproval(
                document_id=doc.id,
                status="PENDING",
                step_order=current_step + 1,
                created_by=user_id,
                updated_by=user_id
            )
            db.add(next_approval)
            doc.status = f"Đang duyệt (Bước {current_step + 1})"
        else:
            doc.status = "Đã phê duyệt"
    else:
        doc.status = "Đã phê duyệt"
        
    doc.updated_by = user_id
    
    db.commit()
    db.refresh(doc)
    record(db, user_id, "document", doc.id, "approve")
    return doc

def reject_document(db: Session, doc_id: int, data: ApprovalAction, user_id: int) -> Document:
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
    
    from app.modules.document.model import DocumentApproval
    approval = db.query(DocumentApproval).filter(
        DocumentApproval.document_id == doc_id,
        DocumentApproval.approver_id == user_id,
        DocumentApproval.status == "PENDING"
    ).first()
    
    if not approval:
        raise HTTPException(403, "Bạn không có quyền từ chối hoặc văn bản không ở trạng thái chờ duyệt")
        
    approval.status = "REJECTED"
    approval.note = data.note
    approval.updated_by = user_id
    
    doc.status = "Từ chối"
    doc.updated_by = user_id
    
    db.commit()
    db.refresh(doc)
    record(db, user_id, "document", doc.id, "reject")
    return doc

def request_edit_document(db: Session, doc_id: int, data: ApprovalAction, user_id: int) -> Document:
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Không tìm thấy văn bản")
    
    from app.modules.document.model import DocumentApproval
    approval = db.query(DocumentApproval).filter(
        DocumentApproval.document_id == doc_id,
        DocumentApproval.approver_id == user_id,
        DocumentApproval.status == "PENDING"
    ).first()
    
    if not approval:
        raise HTTPException(403, "Bạn không có quyền thao tác hoặc văn bản không ở trạng thái chờ duyệt")
        
    approval.status = "REQUEST_EDIT"
    approval.note = data.note
    approval.updated_by = user_id
    
    doc.status = "Yêu cầu chỉnh sửa"
    doc.updated_by = user_id
    
    db.commit()
    db.refresh(doc)
    record(db, user_id, "document", doc.id, "request_edit")
    return doc
