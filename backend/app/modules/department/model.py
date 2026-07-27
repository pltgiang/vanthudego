from sqlalchemy import BigInteger, Boolean, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import Base, AuditMixin


class Department(Base, AuditMixin):
    """Phòng ban (tab_department)"""
    __tablename__ = "tab_department"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    company_id: Mapped[int] = mapped_column(BigInteger, default=0)
    parent_id: Mapped[int] = mapped_column(BigInteger, default=0)
    manager_id: Mapped[int] = mapped_column(BigInteger, default=0, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
