from sqlalchemy import BigInteger, Boolean, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

from app.core.base_model import Base, AuditMixin


class PositionGroup(Base, AuditMixin):
    """Nhóm vị trí công việc (danh mục phụ)"""
    __tablename__ = "tab_position_group"

    group_name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(BigInteger, default=0)
    is_inactive: Mapped[bool] = mapped_column(Boolean, default=False)


class JobTitle(Base, AuditMixin):
    """Chức danh (danh mục phụ)"""
    __tablename__ = "tab_job_title"

    title_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=True)
    title_name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(BigInteger, default=0) # To keep the hierarchy (Chủ tịch -> Nhân viên)
    is_inactive: Mapped[bool] = mapped_column(Boolean, default=False)


class JobPosition(Base, AuditMixin):
    """Vị trí công việc (tab_job_position)"""
    __tablename__ = "tab_job_position"

    position_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    position_name: Mapped[str] = mapped_column(String(255))
    department_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_department.id"), nullable=True)
    title_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_job_title.id"), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    is_inactive: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    title: Mapped["JobTitle"] = relationship()
    companies: Mapped[List["JobPositionCompany"]] = relationship(
        back_populates="job_position", cascade="all, delete-orphan"
    )

class JobPositionCompany(Base):
    """Bảng trung gian liên kết Vị trí công việc và Công ty"""
    __tablename__ = "tab_job_position_company"

    job_position_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_job_position.id"), primary_key=True)
    company_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    job_position: Mapped["JobPosition"] = relationship(back_populates="companies")
