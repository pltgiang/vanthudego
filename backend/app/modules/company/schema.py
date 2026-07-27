from pydantic import BaseModel


class CompanyBase(BaseModel):
    code: str = ""
    name: str
    short_name: str = ""
    logo: str = ""
    business_type: str = "Doanh nghiệp"
    tax_code: str = ""
    foundation_date: str = ""
    business_registration_code: str = ""
    issue_date: str = ""
    issue_place: str = ""
    legal_rep_name: str = ""
    legal_representative_id: int | None = None
    legal_rep_title: str = ""
    address: str = ""
    province: str = ""
    district: str = ""
    ward: str = ""
    phone: str = ""
    fax: str = ""
    invoice_email: str = ""
    website: str = ""
    parent: int = 0
    is_group_model: bool = False
    is_active: bool = True


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    short_name: str | None = None
    logo: str | None = None
    business_type: str | None = None
    tax_code: str | None = None
    foundation_date: str | None = None
    business_registration_code: str | None = None
    issue_date: str | None = None
    issue_place: str | None = None
    legal_rep_name: str | None = None
    legal_representative_id: int | None = None
    legal_rep_title: str | None = None
    address: str | None = None
    province: str | None = None
    district: str | None = None
    ward: str | None = None
    phone: str | None = None
    fax: str | None = None
    invoice_email: str | None = None
    website: str | None = None
    parent: int | None = None
    is_group_model: bool | None = None
    is_active: bool | None = None


class CompanyOut(CompanyBase):
    id: int
    export_tax_code: str | None = None
    model_config = {"from_attributes": True}
