import sys

with open('app/modules/subject/model.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add SubjectDepartment and SubjectJobTitle classes at the end
if 'SubjectDepartment' not in content:
    content += '''

class SubjectDepartment(Base):
    """Bảng trung gian liên kết Đối tượng và Phòng ban"""
    __tablename__ = "tab_subject_department"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    department_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="departments")


class SubjectJobTitle(Base):
    """Bảng trung gian liên kết Đối tượng và Chức danh"""
    __tablename__ = "tab_subject_job_title"

    subject_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tab_subject.id"), primary_key=True)
    job_title_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    subject: Mapped["Subject"] = relationship(back_populates="job_titles")
'''

# Update Subject model to include relationships
if 'departments: Mapped[List["SubjectDepartment"]]' not in content:
    content = content.replace(
        'org_units: Mapped[List["SubjectOrgUnit"]] = relationship(\n        back_populates="subject", cascade="all, delete-orphan"\n    )',
        '''org_units: Mapped[List["SubjectOrgUnit"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    departments: Mapped[List["SubjectDepartment"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )
    job_titles: Mapped[List["SubjectJobTitle"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )'''
    )

with open('app/modules/subject/model.py', 'w', encoding='utf-8') as f:
    f.write(content)
