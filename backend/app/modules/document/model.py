from sqlalchemy import Boolean, String, Text, BigInteger, SmallInteger, ForeignKey, Date, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import Any

from app.core.base_model import Base, AuditMixin


class RegisterBook(Base, AuditMixin):
    __tablename__ = "tab_register_book"
    direction: Mapped[int] = mapped_column(SmallInteger) # 1=đến, 2=đi, 3=nội bộ
    name: Mapped[str] = mapped_column(String(255))
    org_unit_id: Mapped[int] = mapped_column(BigInteger)
    year: Mapped[int] = mapped_column(SmallInteger, default=2026)
    status: Mapped[int] = mapped_column(SmallInteger, default=1)


class RegisterBookManager(Base, AuditMixin):
    __tablename__ = "tab_register_book_manager"
    book_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_register_book.id"))
    user_id: Mapped[int] = mapped_column(BigInteger)


class RegisterBookViewer(Base, AuditMixin):
    __tablename__ = "tab_register_book_viewer"
    book_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_register_book.id"))
    user_id: Mapped[int] = mapped_column(BigInteger)


class Document(Base, AuditMixin):
    __tablename__ = "tab_document"
    direction: Mapped[int] = mapped_column(SmallInteger)
    book_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_register_book.id"), nullable=True)
    org_unit_id: Mapped[int] = mapped_column(BigInteger)
    doc_type_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_doc_type.id"))
    
    doc_no: Mapped[str] = mapped_column(String(100), nullable=True)
    seq_no: Mapped[int] = mapped_column(BigInteger, nullable=True)
    symbol: Mapped[str] = mapped_column(String(50), nullable=True)
    
    subject: Mapped[str] = mapped_column(Text)
    body_summary: Mapped[str] = mapped_column(Text, nullable=True)
    
    issued_date: Mapped[date] = mapped_column(Date, nullable=True)
    received_date: Mapped[date] = mapped_column(Date, nullable=True)
    effective_date: Mapped[date] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=True)
    review_date: Mapped[date] = mapped_column(Date, nullable=True)
    
    partner_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_partner.id"), nullable=True)
    signer_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    signer_title: Mapped[str] = mapped_column(String(150), nullable=True)
    owner_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    
    secrecy_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_secrecy_level.id"), nullable=True)
    urgency_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_urgency_level.id"), nullable=True)
    
    status: Mapped[str] = mapped_column(String(30))
    current_version: Mapped[int] = mapped_column(SmallInteger, default=1)
    is_hot_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    
    custom_fields: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    
    approvals: Mapped[list['DocumentApproval']] = relationship("DocumentApproval", backref="document", cascade="all, delete-orphan")


class DocumentVersion(Base, AuditMixin):
    __tablename__ = "tab_document_version"
    document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    version_no: Mapped[int] = mapped_column(SmallInteger)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    change_note: Mapped[str] = mapped_column(Text, nullable=True)
    superseded_by: Mapped[int] = mapped_column(BigInteger, nullable=True)
    effective_date: Mapped[date] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=True)


class DocumentFile(Base, AuditMixin):
    __tablename__ = "tab_document_file"
    document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    version_no: Mapped[int] = mapped_column(SmallInteger, nullable=True)
    storage_key: Mapped[str] = mapped_column(String(500))
    file_name: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=True)
    sha256: Mapped[str] = mapped_column(String(64))
    is_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    ocr_text: Mapped[str] = mapped_column(Text, nullable=True)


class DocumentLink(Base, AuditMixin):
    __tablename__ = "tab_document_link"
    from_document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    to_document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"), nullable=True)
    external_ref: Mapped[str] = mapped_column(String(255), nullable=True)
    link_type: Mapped[str] = mapped_column(String(30))


class FieldConfig(Base, AuditMixin):
    __tablename__ = "tab_field_config"
    direction: Mapped[int] = mapped_column(SmallInteger)
    org_unit_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    field_key: Mapped[str] = mapped_column(String(50))
    label: Mapped[str] = mapped_column(String(150))
    data_type: Mapped[str] = mapped_column(String(20))
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    options: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)
    display_order: Mapped[int] = mapped_column(SmallInteger, nullable=True)


class NumberingRule(Base, AuditMixin):
    __tablename__ = "tab_numbering_rule"
    org_unit_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    direction: Mapped[int] = mapped_column(SmallInteger, nullable=True)
    
    template: Mapped[str] = mapped_column(String(200))
    start_number: Mapped[int] = mapped_column(BigInteger, default=1)
    reset_cycle: Mapped[str] = mapped_column(String(20), default="YEAR") # YEAR, CONTINUOUS
    is_editable: Mapped[bool] = mapped_column(Boolean, default=False)
    
    is_all_doc_types: Mapped[bool] = mapped_column(Boolean, default=True)
    doc_type_ids: Mapped[list[int]] = mapped_column(JSON, default=list)
    
    is_all_books: Mapped[bool] = mapped_column(Boolean, default=True)
    is_no_book: Mapped[bool] = mapped_column(Boolean, default=False)
    book_ids: Mapped[list[int]] = mapped_column(JSON, default=list)
    
    padding: Mapped[int] = mapped_column(SmallInteger, default=2)
    priority: Mapped[int] = mapped_column(SmallInteger, default=0)


class NumberingCounter(Base, AuditMixin):
    __tablename__ = "tab_numbering_counter"
    scope_key: Mapped[str] = mapped_column(String(200), unique=True)
    current_no: Mapped[int] = mapped_column(BigInteger, default=0)


class DocumentApproval(Base, AuditMixin):
    __tablename__ = "tab_document_approval"
    document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    approver_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="PENDING")
    step_order: Mapped[int] = mapped_column(SmallInteger, default=1)
    note: Mapped[str] = mapped_column(Text, nullable=True)


class DocSecurityPolicy(Base, AuditMixin):
    __tablename__ = "tab_doc_security_policy"
    doc_type_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_doc_type.id"), nullable=True)
    secrecy_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_secrecy_level.id"), nullable=True)
    requires_2fa: Mapped[bool] = mapped_column(Boolean, default=False)
    allowed_roles: Mapped[list[str]] = mapped_column(JSON, default=list) # e.g. ["BOD"]


class DocAccessRequest(Base, AuditMixin):
    __tablename__ = "tab_doc_access_request"
    document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    requester_id: Mapped[int] = mapped_column(BigInteger)
    approver_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="PENDING") # PENDING, APPROVED, REJECTED, EXPIRED
    expires_at: Mapped[Any] = mapped_column(DateTime, nullable=True)


class DocAccessLog(Base, AuditMixin):
    __tablename__ = "tab_doc_access_log"
    document_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_document.id"))
    user_id: Mapped[int] = mapped_column(BigInteger)
    action: Mapped[str] = mapped_column(String(50)) # VIEW_FILE, DOWNLOAD_FILE, REQUEST_2FA
    ip_address: Mapped[str] = mapped_column(String(100), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)


class ApprovalFlowConfig(Base, AuditMixin):
    __tablename__ = "tab_approval_flow_config"
    doc_type_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_doc_type.id"))
    steps: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list) # [{"step": 1, "role": "MANAGER"}, ...]

