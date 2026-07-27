from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.limiter import limiter
from app.core.response import error
from app.modules.attachment.controller import router as attachment_router
from app.modules.audit.controller import router as audit_router
from app.modules.auth.controller import router as auth_router
from app.modules.catalog.controller import (doc_type_router, secrecy_level_router,
                                            urgency_level_router, partner_router)
from app.modules.dashboard.controller import router as dashboard_router
# from app.modules.report.controller import router as report_router
# from app.modules.alert.controller import router as alert_router
from app.modules.company.controller import router as company_router
from app.modules.product.controller import router as product_router
from app.modules.role.controller import router as role_router
from app.modules.setting.controller import router as setting_router
from app.modules.notification.controller import router as notification_router
from app.modules.push.controller import router as push_router
from app.modules.org_unit.controller import router as org_unit_router
from app.modules.job_position.controller import router as job_position_router
from app.modules.subject.controller import router as subject_router
from app.modules.document.controller import (
    document_router, register_book_router, numbering_rule_router
)
from app.modules.department.controller import router as department_router
# from app.modules.import_tool.controller import router as import_tool_router

app = FastAPI(title="DMS Tool API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return error(str(exc.detail), code=str(exc.status_code), status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return error("Dữ liệu không hợp lệ", code="validation_error", status_code=422,
                 details=exc.errors())


@app.get("/api/health")
def health():
    return {"success": True, "message": "ok"}


app.include_router(auth_router)
app.include_router(company_router)
app.include_router(product_router)
app.include_router(role_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(attachment_router)
app.include_router(doc_type_router)
app.include_router(secrecy_level_router)
app.include_router(urgency_level_router)
app.include_router(partner_router)
# app.include_router(report_router)
# app.include_router(alert_router)
app.include_router(setting_router)
app.include_router(notification_router)
app.include_router(push_router)
app.include_router(org_unit_router)
app.include_router(job_position_router)
app.include_router(subject_router)
app.include_router(department_router)
app.include_router(document_router)
app.include_router(register_book_router)
app.include_router(numbering_rule_router)
# app.include_router(import_tool_router)

