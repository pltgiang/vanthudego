import sys
from app.core.database import SessionLocal
import app.core.all_models
from app.modules.company.model import Company

def main():
    db = SessionLocal()
    try:
        companies = db.query(Company).all()
        for c in companies:
            name_lower = c.name.lower()
            if "agricare" in name_lower:
                c.logo = "/logos/agricare.jpg"
            elif "icare" in name_lower:
                c.logo = "/logos/icare.jpg"
            elif "ida" in name_lower:
                c.logo = "/logos/ida.jpg"
            elif "aba" in name_lower:
                c.logo = "/logos/aba.jpg"
            
            print(f"Updated {c.name} with logo: {c.logo}")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
