from sqlalchemy import BigInteger, Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import Base, AuditMixin


class Company(Base, AuditMixin):
    """Pháp nhân nhận hóa đơn (có phân cấp qua `parent`)."""

    __tablename__ = "tab_company"

    code: Mapped[str] = mapped_column(String(25), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    short_name: Mapped[str] = mapped_column(String(255), default="")
    logo: Mapped[str] = mapped_column(Text, default="")
    business_type: Mapped[str] = mapped_column(String(100), default="Doanh nghiệp")
    tax_code: Mapped[str] = mapped_column(String(25), default="")
    
    foundation_date: Mapped[str] = mapped_column(String(20), default="")
    business_registration_code: Mapped[str] = mapped_column(String(50), default="")
    issue_date: Mapped[str] = mapped_column(String(20), default="")
    issue_place: Mapped[str] = mapped_column(String(255), default="")
    
    legal_rep_name: Mapped[str] = mapped_column(String(100), default="")
    legal_representative_id: Mapped[int] = mapped_column(BigInteger, nullable=True) # Legacy
    legal_rep_title: Mapped[str] = mapped_column(String(100), default="")
    
    address: Mapped[str] = mapped_column(Text, default="")
    province: Mapped[str] = mapped_column(String(100), default="")
    district: Mapped[str] = mapped_column(String(100), default="")
    ward: Mapped[str] = mapped_column(String(100), default="")
    phone: Mapped[str] = mapped_column(String(50), default="")
    fax: Mapped[str] = mapped_column(String(50), default="")
    invoice_email: Mapped[str] = mapped_column(String(255), default="")
    website: Mapped[str] = mapped_column(String(255), default="")
    
    parent: Mapped[int] = mapped_column(BigInteger, default=0)  # 0 = gốc
    is_group_model: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationship to Subject for legal representative
    legal_rep = relationship(
        "Subject",
        primaryjoin="foreign(Company.legal_representative_id) == Subject.id",
        uselist=False,
        viewonly=True
    )

    @property
    def export_tax_code(self) -> str:
        return f"'{self.tax_code}" if self.tax_code else ""
