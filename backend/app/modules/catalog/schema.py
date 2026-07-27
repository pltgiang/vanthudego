from pydantic import BaseModel

# ---- DocType ----
class DocTypeCreate(BaseModel):
    name: str
    abbreviation: str = ""
    description: str = ""
    tier: int = 1
    is_versioned: bool = True
    needs_decision: bool = False
    status: int = 1

class DocTypeUpdate(BaseModel):
    name: str | None = None
    abbreviation: str | None = None
    description: str | None = None
    tier: int | None = None
    is_versioned: bool | None = None
    needs_decision: bool | None = None
    status: int | None = None

class DocTypeOut(DocTypeCreate):
    id: int
    model_config = {"from_attributes": True}

# ---- SecrecyLevel ----
class SecrecyLevelCreate(BaseModel):
    name: str
    code: str
    rank: int = 0
    description: str = ""
    status: int = 1

class SecrecyLevelUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    rank: int | None = None
    description: str | None = None
    status: int | None = None

class SecrecyLevelOut(SecrecyLevelCreate):
    id: int
    model_config = {"from_attributes": True}

# ---- UrgencyLevel ----
class UrgencyLevelCreate(BaseModel):
    name: str
    code: str
    sla_hours: float = 24.0
    description: str = ""
    status: int = 1

class UrgencyLevelUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    sla_hours: float | None = None
    description: str | None = None
    status: int | None = None

class UrgencyLevelOut(UrgencyLevelCreate):
    id: int
    model_config = {"from_attributes": True}

# ---- Partner ----
class PartnerCreate(BaseModel):
    name: str
    address: str = ""
    email: str = ""
    phone: str = ""
    status: int = 1

class PartnerUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    email: str | None = None
    phone: str | None = None
    status: int | None = None

class PartnerOut(PartnerCreate):
    id: int
    model_config = {"from_attributes": True}
