from app.core.database import SessionLocal
from app.modules.job_position.model import PositionGroup, JobTitle
from sqlalchemy import select

groups = [
    "Hành chính",
    "Nhân sự",
    "Kế toán",
    "Kinh doanh",
    "Kỹ thuật",
    "Công nhân",
    "Quản lý",
    "Lãnh đạo"
]

titles = [
    "Chủ tịch HĐQT",
    "Tổng giám đốc",
    "Phó tổng giám đốc",
    "Giám đốc",
    "Phó giám đốc",
    "Trưởng phòng",
    "Phó phòng",
    "Nhân viên"
]

def seed_data():
    with SessionLocal() as db:
        # Seed groups
        for idx, group_name in enumerate(groups):
            result = db.execute(select(PositionGroup).where(PositionGroup.group_name == group_name))
            existing = result.scalars().first()
            if not existing:
                new_group = PositionGroup(group_name=group_name, sort_order=idx + 1)
                db.add(new_group)
                print(f"Added Position Group: {group_name}")
            else:
                existing.sort_order = idx + 1

        # Seed titles
        for idx, title_name in enumerate(titles):
            result = db.execute(select(JobTitle).where(JobTitle.title_name == title_name))
            existing = result.scalars().first()
            if not existing:
                new_title = JobTitle(title_name=title_name, sort_order=idx + 1)
                db.add(new_title)
                print(f"Added Job Title: {title_name}")
            else:
                existing.sort_order = idx + 1
        
        db.commit()
        print("Done seeding job positions data!")

if __name__ == "__main__":
    seed_data()
