from app.core.crud import make_crud_router

from .model import DocType, SecrecyLevel, UrgencyLevel, Partner
from .schema import (DocTypeCreate, DocTypeOut, DocTypeUpdate,
                     SecrecyLevelCreate, SecrecyLevelOut, SecrecyLevelUpdate,
                     UrgencyLevelCreate, UrgencyLevelOut, UrgencyLevelUpdate,
                     PartnerCreate, PartnerOut, PartnerUpdate)

doc_type_router = make_crud_router(
    "/api/doc-types", "doc_type", DocType,
    DocTypeCreate, DocTypeUpdate, DocTypeOut, ["name", "status"],
    csv_headers={"id": "ID", "name": "Tên loại văn bản"}
)

secrecy_level_router = make_crud_router(
    "/api/secrecy-levels", "secrecy", SecrecyLevel,
    SecrecyLevelCreate, SecrecyLevelUpdate, SecrecyLevelOut, ["name", "level", "status"],
    csv_headers={"id": "ID", "name": "Độ mật", "level": "Cấp độ"}
)

urgency_level_router = make_crud_router(
    "/api/urgency-levels", "urgency", UrgencyLevel,
    UrgencyLevelCreate, UrgencyLevelUpdate, UrgencyLevelOut, ["name", "level", "status"],
    csv_headers={"id": "ID", "name": "Độ khẩn", "level": "Cấp độ"}
)

partner_router = make_crud_router(
    "/api/partners", "partner", Partner,
    PartnerCreate, PartnerUpdate, PartnerOut, ["name", "status"],
    csv_headers={"id": "ID", "name": "Tên đối tác", "contact": "Liên hệ"}
)
