from sqlalchemy import BigInteger, Boolean, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import List

from app.core.base_model import Base, AuditMixin


class Subject(Base, AuditMixin):
    """Đối tượng (Người dùng / Nhân viên) - tab_subject"""
    __tablename__ = "tab_subject"

    is_user: Mapped[bool] = mapped_column(Boolean, default=False)
    is_employee: Mapped[bool] = mapped_column(Boolean, default=False)

    subject_name: Mapped[str] = mapped_column(String(100))
    birth_date: Mapped[date] = mapped_column(Date, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True) # Nam, Nu, Khac
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    subject_code: Mapped[str] = mapped_column(String(50), nullable=True, unique=True)
    job_position_id: Mapped[int] = mapped_column(BigInteger, default=0, nullable=True)
    department_id: Mapped[int] = mapped_column(BigInteger, default=0, nullable=True)
    direct_manager_id: Mapped[int] = mapped_column(BigInteger, default=0, nullable=True)
    join_date: Mapped[date] = mapped_column(Date, nullable=True)
    probation_date: Mapped[date] = mapped_column(Date, nullable=True)
    official_date: Mapped[date] = mapped_column(Date, nullable=True)
    resign_date: Mapped[date] = mapped_column(Date, nullable=True)
    account_phone: Mapped[str] = mapped_column(String(20), nullable=True, unique=True, index=True)
    account_email: Mapped[str] = mapped_column(String(255), nullable=True, unique=True, index=True)
    vpn_access: Mapped[str] = mapped_column(String(255), default="")
    
    # MISA ID fields or auth fields
    password_hash: Mapped[str] = mapped_column(String(255), default="")
    avatar: Mapped[str] = mapped_column(String(500), default="")

    user_status: Mapped[str] = mapped_column(String(20), default="PENDING_CONFIRM") # PENDING_CONFIRM, ACTIVE, INACTIVE
    employee_status: Mapped[str] = mapped_column(String(20), default="WORKING") # WORKING, RESIGNED

    # Relationships
    companies: Mapped[List["SubjectCompany"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    org_units: Mapped[List["SubjectOrgUnit"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    departments: Mapped[List["SubjectDepartment"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    job_titles: Mapped[List["SubjectJobTitle"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    roles: Mapped[List["SubjectRole"]] = relationship(
        primaryjoin="Subject.id == SubjectRole.subject_id",
        foreign_keys="[SubjectRole.subject_id]",
        viewonly=True
    )
    job_position: Mapped["JobPosition"] = relationship(
        primaryjoin="Subject.job_position_id == JobPosition.id",
        foreign_keys="[Subject.job_position_id]",
        viewonly=True
    )
    direct_manager: Mapped["Subject"] = relationship(
        primaryjoin="Subject.direct_manager_id == Subject.id",
        foreign_keys="[Subject.direct_manager_id]",
        viewonly=True
    )

from sqlalchemy import ForeignKey

class SubjectCompany(Base):
    """Bảng trung gian liên kết Đối tượng và Công ty (Pháp nhân)"""
    __tablename__ = "tab_subject_company"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    company_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="companies")
    company: Mapped["Company"] = relationship(
        primaryjoin="SubjectCompany.company_id == Company.id",
        foreign_keys="[SubjectCompany.company_id]",
        viewonly=True
    )

class SubjectOrgUnit(Base):
    """Bảng trung gian liên kết Đối tượng và Đơn vị công tác"""
    __tablename__ = "tab_subject_org_unit"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    org_unit_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="org_units")


class SubjectRole(Base, AuditMixin):
    __tablename__ = "tab_subject_role"

    subject_id: Mapped[int] = mapped_column(BigInteger, index=True)
    role_id: Mapped[int] = mapped_column(BigInteger, index=True)


class SubjectScope(Base, AuditMixin):
    __tablename__ = "tab_subject_scope"

    subject_id: Mapped[int] = mapped_column(BigInteger, index=True)
    role_id: Mapped[int] = mapped_column(BigInteger, default=0, index=True)
    entity: Mapped[str] = mapped_column(String(50), default="", index=True)
    dim: Mapped[str] = mapped_column(String(20), default="org_unit") # org_unit | subject
    value: Mapped[str] = mapped_column(String(100), default="")
    is_exclude: Mapped[bool] = mapped_column(Boolean, default=False)


class SubjectDepartment(Base):
    """Bảng trung gian liên kết Đối tượng và Phòng ban"""
    __tablename__ = "tab_subject_department"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    department_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="departments")
    department: Mapped["Department"] = relationship(
        primaryjoin="SubjectDepartment.department_id == Department.id",
        foreign_keys="[SubjectDepartment.department_id]",
        viewonly=True
    )


class SubjectJobTitle(Base):
    """Bảng trung gian liên kết Đối tượng và Chức danh"""
    __tablename__ = "tab_subject_job_title"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    job_title_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="job_titles")
    job_title: Mapped["JobTitle"] = relationship(
        primaryjoin="SubjectJobTitle.job_title_id == JobTitle.id",
        foreign_keys="[SubjectJobTitle.job_title_id]",
        viewonly=True
    )
