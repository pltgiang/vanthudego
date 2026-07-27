from sqlalchemy import BigInteger, Boolean, String, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import List

from app.core.base_model import Base, AuditMixin


class OrgUnit(Base, AuditMixin):
    """Cơ cấu tổ chức (tab_org_unit)"""

    __tablename__ = "tab_org_unit"

    parent_id: Mapped[int] = mapped_column(BigInteger, default=0)
    unit_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    short_name: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    unit_name: Mapped[str] = mapped_column(String(255))
    org_level: Mapped[str] = mapped_column(String(50)) # TONG_CONG_TY, CHI_NHANH, VAN_PHONG, PHONG_BAN, PHAN_XUONG, NHOM
    accounting_type: Mapped[str] = mapped_column(String(50), default="", nullable=True) # DEPENDENT, INDEPENDENT
    sort_order: Mapped[int] = mapped_column(Integer, default=9999)
    manager_id: Mapped[int] = mapped_column(BigInteger, default=0, nullable=True)
    functions_duties: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    business_reg_no: Mapped[str] = mapped_column(String(50), default="", nullable=True)
    business_reg_date: Mapped[date] = mapped_column(Date, nullable=True)
    business_reg_place: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    address: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    is_inactive: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    business_areas: Mapped[List["OrgUnitBusinessArea"]] = relationship(
        back_populates="org_unit", cascade="all, delete-orphan"
    )

from sqlalchemy import ForeignKey
class OrgUnitBusinessArea(Base):
    """Lĩnh vực hoạt động của Cơ cấu tổ chức"""
    __tablename__ = "tab_org_unit_business_area"

    org_unit_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_org_unit.id"), primary_key=True)
    business_area: Mapped[str] = mapped_column(String(50), primary_key=True) # SAN_XUAT, KINH_DOANH, HO_TRO, VAN_PHONG, CUA_HANG, NHA_HANG

    org_unit: Mapped["OrgUnit"] = relationship(back_populates="business_areas")
