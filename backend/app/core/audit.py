"""Ghi & đọc nhật ký thao tác (audit log) dùng chung."""
from sqlalchemy.orm import Session


def record(db: Session, user_id: int, entity: str, entity_id: int, action: str, message: str = ""):
    from app.modules.audit.model import AuditLog

    db.add(AuditLog(entity=entity, entity_id=entity_id, action=action, message=message,
                    created_by=user_id, updated_by=user_id))
    db.commit()


def resolve_actor(db: Session, user_id: int) -> str:
    from app.modules.subject.model import Subject

    if not user_id:
        return "Hệ thống"
    user = db.get(Subject, user_id)
    if not user:
        return f"User #{user_id}"
    return user.subject_name or user.account_email or f"User #{user_id}"


def resolve_actor_profile(db: Session, user_id: int) -> dict:
    """Thông tin nhân sự của người dùng để in phiếu: họ tên, chức vụ, bộ phận, trưởng BP."""
    from app.modules.subject.model import Subject
    from app.modules.org_unit.model import OrgUnit
    from app.modules.job_position.model import JobPosition

    out = {"name": resolve_actor(db, user_id), "position": "", "department": "", "manager": ""}
    user = db.get(Subject, user_id) if user_id else None
    if not user:
        return out
        
    if user.job_position_id:
        pos = db.get(JobPosition, user.job_position_id)
        if pos:
            out["position"] = pos.position_name or ""
            
    if user.org_units:
        first_org = user.org_units[0].org_unit
        if first_org:
            out["department"] = first_org.unit_name or ""
            if first_org.manager_id:
                mgr = db.get(Subject, first_org.manager_id)
                if mgr:
                    out["manager"] = mgr.subject_name or ""
    return out
