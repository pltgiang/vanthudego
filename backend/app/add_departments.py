import sys
from app.core.database import SessionLocal
import app.core.all_models
from app.modules.department.model import Department
from app.core.utils import generate_code

departments = [
    "Sản xuất -Thu mua",
    "Hành chính",
    "Kiểm soát kế hoạch",
    "Lập trình & IT nội bộ",
    "Nhân sự",
    "Kế toán",
    "Dr.Xanh",
    "Bamboo",
    "IDA Global",
    "Icare",
    "Thiết kế",
    "ABA Chemical",
    "Điều phối",
    "N2SBIO",
    "Dego Lab",
    "Dego Organic",
    "Xây dựng"
]

def main():
    db = SessionLocal()
    try:
        count = 0
        for name in departments:
            existing = db.query(Department).filter(Department.name == name).first()
            if not existing:
                code = generate_code(db, Department, "PBA")
                dept = Department(name=name, code=code)
                db.add(dept)
                db.flush()
                count += 1
                print(f"Added {name} ({code})")
        
        db.commit()
        print(f"Total added: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
