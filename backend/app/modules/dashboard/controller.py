from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.response import success

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def stats(days: str = "30", db: Session = Depends(get_db), user=Depends(get_current_user)):
    return success({
        "suppliers": 0,
        "products": 0,
        "employees": 0,
        "pr_total": 0,
        "pr_pending": 0,
        "pr_processing": 0,
        "survey_pending": 0,
        "po_ordered": 0,
        "po_delivered": 0,
        "po_partial": 0,
        "po_completed": 0,
        "trends": [],
    })


@router.get("/overview")
def overview(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return success({
        "year": str(datetime.now().year),
        "kpi": {},
        "cost_12m": [],
        "categories": [],
        "top_suppliers": [],
        "dept_spend": [],
        "po_status": [],
        "ap_aging": [],
        "recent_pos": [],
        "recent_prs": [],
        "low_stock": [],
        "alerts": [],
        "alert_total": 0,
        "can": {},
        "pending_prs_list": [],
        "pending_srs_list": [],
        "pending_surveys_list": [],
        "late_deliveries_list": [],
    })


@router.get("/tasks")
def my_tasks(request: Request, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return success({"total": 0, "by_type": {}, "page": 1, "page_size": 20, "items": []})
