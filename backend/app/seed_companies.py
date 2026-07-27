import csv
from io import StringIO
from app.core.database import SessionLocal
from app.core.all_models import *
from app.modules.company.model import Company

data = """ID,Mã,Tên pháp nhân,MST,Địa chỉ,Email hóa đơn,Thuộc công ty,Người đại diện,Chức danh,Trạng thái
15,DEGO HOLDING,CÔNG TY TNHH DEGO HOLDING,'1801722464,"B19 đường dẫn cầu Cần Thơ, QL1A, Khu dân cư Trung tâm văn hóa Tây Đô, Phường Cái Răng, Thành phố Cần Thơ, Việt Nam.",,0,,,Hoạt động
14,AGC,CÔNG TY TNHH PHÂN BÓN NHẬP KHẨU AGRICARE,'0313538685,"C1-2, Đường số 4, Khu đô thị mới Long Thịnh, Phường Hưng Phú, TP. Cần Thơ",,0,Chim Cẩm Chi,,Hoạt động
13,SAM,CÔNG TY TNHH SAM GROUP,'1801485943,"108 Trần Đình Xu, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",,0,,,Hoạt động
12,AGRIPLANT,CÔNG TY TNHH NÔNG NGHIỆP AGRIPLANT,'1801436689,"Lầu 2, C1-2, Đường số 4, Khu đô thị mới Long Thịnh, Phường Hưng Phú, TP. Cần Thơ",,0,,,Hoạt động
11,NN ABA,CÔNG TY TNHH HÓA CHẤT NÔNG NGHIỆP ABA,'1801818328,"B18 đường dẫn cầu Cần Thơ, QL1A, Khu dân cư Trung tâm văn hóa Tây Đô, Phường Cái Răng, Thành phố Cần Thơ, Việt Nam.",,0,Chim Cẩm Chi,,Hoạt động
10,NN DEGO,CÔNG TY TNHH SẢN XUẤT VÀ XUẤT NHẬP KHẨU HOÁ CHẤT NÔNG NGHIỆP DEGO,'0318430011,"Tầng 9, tòa nhà K&M Tower, 33 Ung Văn Khiêm, Phường Thạnh Mỹ Tây, TP Hồ Chí Minh, Việt Nam",,0,Nguyễn Nhật Minh,,Hoạt động
9,N2SBIO,CÔNG TY TNHH N2SBIO VIỆT NAM,'0318776965,"108 Trần Đình Xu, Phường Nguyễn Cư Trinh, Quận 1, TP Hồ Chí Minh",,0,Trần Quang Phú,,Hoạt động
8,BAMBOO,CÔNG TY TNHH XUẤT NHẬP KHẨU SẢN XUẤT THƯƠNG MẠI BAMBOO VIỆT NAM,'0318629897,"Tầng 18, Tòa nhà ROX Tower, 180-192 Nguyễn Công Trứ, Phường Bến Thành, Thành phó Hồ Chí Minh, Việt Nam.",,0,Phạm Khánh Ngân,,Hoạt động
7,HỘ KD DR.XANH,HỘ KINH DOANH DR XANH,'578005750,"Ấp Qui Lân 1, Xã Thạnh Quới, Huyện Vĩnh Thạnh, TP Cần Thơ, Việt Nam",,0,Trần Ngọc Huỳnh,,Hoạt động
6,NPP DR.XANH,NHÀ PHÂN PHỐI DR XANH,'578010406,"Số 124, Đường Võ Văn Kiệt, khu vực Bình Trung, Phường Long Hòa, Quận Bình Thủy, TP.Cần Thơ",,0,Mai Thị Yến Ly,,Hoạt động
5,ICARE,CÔNG TY TNHH DƯỢC PHẨM ICARE,'0315593265,"108 Trần Đình Xu, Phường Cầu Ông Lãnh, Thành phố Hồ Chí Minh, Việt Nam",,0,Lê Phước Hữu,,Hoạt động
3,ABA,CÔNG TY TNHH SẢN XUẤT HÓA CHẤT ABA,'0316342296,"108 Trần Đình Xu, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",,0,Chim Cẩm Chi,,Hoạt động
2,IDA,CÔNG TY TNHH XUẤT NHẬP KHẨU IDA GLOBAL,'0314562909,"Số 68 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh",,0,Vương Hoàng Thân,,Hoạt động
1,DEGO,CÔNG TY TNHH DEGO HOLDING,'1801722464,"B19 đường dẫn cầu Cần Thơ, QL1A, Khu dân cư Trung tâm văn hóa Tây Đô, Phường Cái Răng, Thành phố Cần Thơ, Việt Nam.",,0,Phan Thị Chúc Ly,,Hoạt động"""

def run():
    db = SessionLocal()
    try:
        reader = csv.DictReader(StringIO(data))
        for row in reader:
            cid = int(row["ID"])
            company = db.query(Company).filter(Company.id == cid).first()
            tax_code = row["MST"]
            if tax_code.startswith("'"): tax_code = tax_code[1:]
            
            is_active = row["Trạng thái"] == "Hoạt động"
            if company:
                company.code = row["Mã"]
                company.name = row["Tên pháp nhân"]
                company.tax_code = tax_code
                company.address = row["Địa chỉ"]
                company.invoice_email = row["Email hóa đơn"]
                company.legal_rep_name = row["Người đại diện"]
                company.legal_rep_title = row["Chức danh"]
                company.is_active = is_active
            else:
                company = Company(
                    id=cid,
                    code=row["Mã"],
                    name=row["Tên pháp nhân"],
                    tax_code=tax_code,
                    address=row["Địa chỉ"],
                    invoice_email=row["Email hóa đơn"],
                    legal_rep_name=row["Người đại diện"],
                    legal_rep_title=row["Chức danh"],
                    is_active=is_active
                )
                db.add(company)
        db.commit()
        print("Seed companies done.")
    finally:
        db.close()

if __name__ == "__main__":
    run()
