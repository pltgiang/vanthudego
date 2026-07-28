import json
import os

from app.core.auth import hash_password
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.permissions import ENTITIES
import app.core.all_models

from app.modules.company.model import Company
from app.modules.org_unit.model import OrgUnit
from app.modules.subject.model import Subject, SubjectRole
from app.modules.role.model import Permission, Role
from app.modules.catalog.model import DocType, SecrecyLevel, UrgencyLevel

def run():
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.code == "admin").first()
        if not admin_role:
            admin_role = Role(code="admin", name="Quản trị hệ thống")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        for _ar in db.query(Role).filter(Role.code.in_(["admin", "ADMINISTRATOR"])).all():
            existing = {p.entity for p in db.query(Permission).filter(Permission.role_id == _ar.id).all()}
            for entity in ENTITIES:
                if entity not in existing:
                    db.add(Permission(
                         role_id=_ar.id, entity=entity, can_read=True, can_create=True,
                         can_write=True, can_delete=True, can_approve=True, can_cancel=True,
                         can_print=True, can_export=True, scope="all",
                    ))
        db.commit()

        company = db.query(Company).filter(Company.code == "DEGO").first()
        if not company:
            company = Company(code="DEGO", name="CÔNG TY TNHH DEGO HOLDING", tax_code="1801722464", is_active=True)
            db.add(company)
            db.commit()
            db.refresh(company)

        # Tạo OrgUnit gốc
        org = db.query(OrgUnit).filter(OrgUnit.org_level == "TONG_CONG_TY").first()
        if not org:
            org = OrgUnit(unit_code="DEGO", unit_name="CÔNG TY TNHH DEGO HOLDING", org_level="TONG_CONG_TY")
            db.add(org)
            db.commit()
            db.refresh(org)

        # Tạo admin Subject
        user = db.query(Subject).filter(Subject.account_phone == settings.ADMIN_CODE).first()
        if not user:
            user = Subject(
                is_user=True, is_employee=True,
                account_phone=settings.ADMIN_CODE,
                account_email="admin@example.com",
                subject_name="Quản trị viên",
                subject_code=settings.ADMIN_CODE,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                user_status="ACTIVE",
                employee_status="WORKING"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            db.add(SubjectRole(subject_id=user.id, role_id=admin_role.id))
            db.commit()
        else:
            user.password_hash = hash_password(settings.ADMIN_PASSWORD)
            db.commit()

        # Tạo tài khoản admin / admin
        admin2 = db.query(Subject).filter(Subject.account_phone == "admin").first()
        if not admin2:
            admin2 = Subject(
                is_user=True, is_employee=True,
                account_phone="admin",
                account_email="admin_dev@example.com",
                subject_name="Admin Toàn Quyền",
                subject_code="admin",
                password_hash=hash_password("admin"),
                user_status="ACTIVE",
                employee_status="WORKING"
            )
            db.add(admin2)
            db.commit()
            db.refresh(admin2)
            db.add(SubjectRole(subject_id=admin2.id, role_id=admin_role.id))
            db.commit()
        else:
            admin2.password_hash = hash_password("admin")
            db.commit()

        # Seed DocTypes
        doc_types = [
            {"name": "Biên bản", "abbreviation": "BB", "description": "Biên bản họp", "status": 1},
            {"name": "Chỉ thị", "abbreviation": "CT", "description": "Chỉ thị của ban TGĐ", "status": 1}
        ]
        for dt_data in doc_types:
            dt = db.query(DocType).filter(DocType.abbreviation == dt_data["abbreviation"]).first()
            if not dt:
                db.add(DocType(**dt_data))
        db.commit()

        # Seed SecrecyLevels
        secrecy_levels = [
            {"name": "Bình thường", "code": "BT", "rank": 0, "description": "Bất cứ nhân viên nào cũng có thể xem được", "status": 1},
            {"name": "Mật", "code": "M", "rank": 1, "description": "Chỉ có nhân viên có quyền mới xem được", "status": 1},
            {"name": "Tối mật", "code": "TM", "rank": 2, "description": "Cấp quản lý từ cấp 2 trở lên xem được", "status": 1},
            {"name": "Tuyệt mật", "code": "TM2", "rank": 3, "description": "Cấp quản lý từ cấp 4 trở lên xem được", "status": 1}
        ]
        for sl_data in secrecy_levels:
            sl = db.query(SecrecyLevel).filter(SecrecyLevel.code == sl_data["code"]).first()
            if not sl:
                db.add(SecrecyLevel(**sl_data))
        db.commit()

        # Seed UrgencyLevels
        urgency_levels = [
            {"name": "Bình thường", "code": "BT", "sla_hours": 24, "description": "Bất cứ nhân viên nào cũng có thể xem được", "status": 1},
            {"name": "Khẩn", "code": "K", "sla_hours": 1, "description": "Chỉ có nhân viên có quyền mới xem được", "status": 1},
            {"name": "Thượng khẩn", "code": "TK", "sla_hours": 0.25, "description": "Cấp quản lý từ cấp 2 trở lên xem được", "status": 1},
            {"name": "Hỏa tốc", "code": "HT", "sla_hours": 0.25, "description": "Cấp quản lý từ cấp 4 trở lên xem được", "status": 1}
        ]
        for ul_data in urgency_levels:
            ul = db.query(UrgencyLevel).filter(UrgencyLevel.code == ul_data["code"]).first()
            if not ul:
                db.add(UrgencyLevel(**ul_data))
        db.commit()

        print(f"Seed done. Admin login: {settings.ADMIN_CODE} / {settings.ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
