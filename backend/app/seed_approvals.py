import os
from app.core.database import SessionLocal
import app.core.all_models
from app.modules.org_unit.model import OrgUnit
from app.modules.subject.model import Subject, SubjectRole, SubjectOrgUnit
from app.modules.role.model import Role, Permission
from app.core.auth import hash_password
from app.modules.document.model import Document, DocumentApproval
from datetime import datetime

def seed():
    db = SessionLocal()
    print("Seeding approvals data...")
    try:
        # 1. Departments
        dego = db.query(OrgUnit).filter(OrgUnit.unit_code == "DEGO").first()
        parent_id = dego.id if dego else 0
        
        hc = db.query(OrgUnit).filter(OrgUnit.unit_code=="HC").first()
        if not hc:
            hc = OrgUnit(unit_code="HC", unit_name="Phòng Hành chính", org_level="PHONG_BAN", parent_id=parent_id)
            db.add(hc)
            
        kd = db.query(OrgUnit).filter(OrgUnit.unit_code=="KD").first()
        if not kd:
            kd = OrgUnit(unit_code="KD", unit_name="Phòng Kinh doanh", org_level="PHONG_BAN", parent_id=parent_id)
            db.add(kd)
            
        vt = db.query(OrgUnit).filter(OrgUnit.unit_code=="VT").first()
        if not vt:
            vt = OrgUnit(unit_code="VT", unit_name="Phòng Văn thư", org_level="PHONG_BAN", parent_id=parent_id)
            db.add(vt)
            
        db.commit()
        db.refresh(hc); db.refresh(kd); db.refresh(vt)
        
        # 2. Roles
        def get_or_create_role(code, name):
            r = db.query(Role).filter(Role.code == code).first()
            if not r:
                r = Role(code=code, name=name)
                db.add(r)
                db.commit()
                db.refresh(r)
            return r

        nv_role = get_or_create_role("NV_DEGO", "Nhân viên Dego")
        tp_role = get_or_create_role("TP_DEGO", "Trưởng bộ phận Dego")
        nv_vt_role = get_or_create_role("NV_VT", "Văn thư Dego")
        tp_vt_role = get_or_create_role("TP_VT", "Trưởng bộ phận văn thư Dego")
        
        # Setup permissions for "document"
        def setup_perm(role_id, scope, can_approve=False):
            p = db.query(Permission).filter(Permission.role_id == role_id, Permission.entity == "document").first()
            if not p:
                p = Permission(role_id=role_id, entity="document")
                db.add(p)
            p.can_read = True
            p.can_create = True
            p.can_write = True
            p.can_approve = can_approve
            p.scope = scope
            db.commit()

        setup_perm(nv_role.id, "own", False)
        setup_perm(tp_role.id, "dept", True)
        setup_perm(nv_vt_role.id, "all", False)
        setup_perm(tp_vt_role.id, "all", True)
        
        # 3. Users
        def create_user(username, name, role_id, org_id, manager_id=None):
            u = db.query(Subject).filter(Subject.account_phone == username).first()
            
            # Dummy data for the new fields
            contact_email = f"{username.lower()}@dego.com.vn"
            account_email = f"{username.lower()}@dego.com.vn"
            contact_phone = f"098{abs(hash(username)) % 10000000:07d}"
            birth_date = datetime.strptime("1995-01-01", "%Y-%m-%d").date()
            gender = "Nam" if "HanhChinh" in username else "Nữ"
            address = "123 Đường ABC, Hà Nội"
            
            if not u:
                u = Subject(
                    is_user=True, is_employee=True,
                    account_phone=username,
                    subject_name=name,
                    subject_code=username,
                    password_hash=hash_password(username),
                    user_status="ACTIVE",
                    employee_status="WORKING",
                    department_id=org_id,
                    direct_manager_id=manager_id,
                    contact_email=contact_email,
                    account_email=account_email,
                    contact_phone=contact_phone,
                    birth_date=birth_date,
                    gender=gender,
                    address=address
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                db.add(SubjectRole(subject_id=u.id, role_id=role_id))
                db.add(SubjectOrgUnit(subject_id=u.id, org_unit_id=org_id))
                db.commit()
            else:
                u.department_id = org_id
                u.subject_name = name
                u.contact_email = contact_email
                u.account_email = account_email
                u.contact_phone = contact_phone
                u.birth_date = birth_date
                u.gender = gender
                u.address = address
                if manager_id:
                    u.direct_manager_id = manager_id
                db.commit()
            return u
            
        tp_hc = create_user("TPHanhChinh", "Trưởng phòng hành chính", tp_role.id, hc.id)
        nv_hc = create_user("NVHanhChinh", "Nhân viên hành chính", nv_role.id, hc.id, tp_hc.id)
        
        tp_kd = create_user("TPKinhDoanh", "Trưởng phòng kinh doanh IDA", tp_role.id, kd.id)
        nv_kd = create_user("NVKinhDoanh", "Nhân viên kinh doanh IDA", nv_role.id, kd.id, tp_kd.id)
        
        tp_vt = create_user("TPVanThu", "Trưởng phòng văn thư", tp_vt_role.id, vt.id)
        nv_vt = create_user("NVVanThu", "Nhân viên văn thư", nv_vt_role.id, vt.id, tp_vt.id)
        
        # 4. Dummy Documents
        doc_count = db.query(Document).filter(Document.subject == "Đề xuất mua sắm trang thiết bị").count()
        if doc_count == 0:
            doc = Document(
                direction=2,
                org_unit_id=hc.id,
                doc_type_id=1,
                subject="Đề xuất mua sắm trang thiết bị",
                status="Chờ phê duyệt",
                created_by=nv_hc.id,
                updated_by=nv_hc.id,
                custom_fields={}
            )
            db.add(doc)
            db.flush()
            
            approval = DocumentApproval(
                document_id=doc.id,
                approver_id=tp_hc.id,
                status="PENDING",
                created_by=nv_hc.id,
                updated_by=nv_hc.id
            )
            db.add(approval)
            db.commit()
            
        print("Seed approvals done!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
