from sqlalchemy import Boolean, String, Text, BigInteger, SmallInteger, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base_model import Base, AuditMixin


class DocType(Base, AuditMixin):
    __tablename__ = "tab_doc_type"
    org_unit_id: Mapped[int] = mapped_column(BigInteger, default=0) # 0 = global
    name: Mapped[str] = mapped_column(String(150))
    abbreviation: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text, default="")
    tier: Mapped[int] = mapped_column(SmallInteger, default=1)
    is_versioned: Mapped[bool] = mapped_column(Boolean, default=True)
    needs_decision: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=1)


class SecrecyLevel(Base, AuditMixin):
    __tablename__ = "tab_secrecy_level"
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(20), unique=True)
    rank: Mapped[int] = mapped_column(SmallInteger, default=0)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[int] = mapped_column(SmallInteger, default=1)


class UrgencyLevel(Base, AuditMixin):
    __tablename__ = "tab_urgency_level"
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(20), unique=True)
    sla_hours: Mapped[float] = mapped_column(Float, default=24.0)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[int] = mapped_column(SmallInteger, default=1)


class Partner(Base, AuditMixin):
    __tablename__ = "tab_partner"
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(Text, default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(30), default="")
    status: Mapped[int] = mapped_column(SmallInteger, default=1)
