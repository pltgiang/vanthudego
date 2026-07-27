import sys

# 1. Update schema.py
with open('app/modules/subject/schema.py', 'r', encoding='utf-8') as f:
    schema_content = f.read()

if 'department_ids' not in schema_content:
    schema_content = schema_content.replace(
        'org_unit_ids: Optional[List[int]] = []\n    job_position_id: Optional[int] = None\n    direct_manager_id: Optional[int] = None',
        'org_unit_ids: Optional[List[int]] = []\n    department_ids: Optional[List[int]] = []\n    job_title_ids: Optional[List[int]] = []\n    job_position_id: Optional[int] = None\n    direct_manager_id: Optional[int] = None'
    )
    schema_content = schema_content.replace(
        'org_unit_ids: List[int]\n    role_ids: List[int]',
        'org_unit_ids: List[int]\n    department_ids: List[int]\n    job_title_ids: List[int]\n    role_ids: List[int]'
    )
    with open('app/modules/subject/schema.py', 'w', encoding='utf-8') as f:
        f.write(schema_content)

# 2. Update service.py
with open('app/modules/subject/service.py', 'r', encoding='utf-8') as f:
    service_content = f.read()

# Add imports for SubjectDepartment, SubjectJobTitle
if 'SubjectDepartment' not in service_content:
    service_content = service_content.replace(
        'from app.modules.subject.model import Subject, SubjectOrgUnit, SubjectRole',
        'from app.modules.subject.model import Subject, SubjectOrgUnit, SubjectRole, SubjectDepartment, SubjectJobTitle'
    )

# create_subject
if 'db.add(SubjectDepartment' not in service_content:
    service_content = service_content.replace(
        '''    if data.org_unit_ids:
        for ou_id in data.org_unit_ids:
            db.add(SubjectOrgUnit(subject_id=db_obj.id, org_unit_id=ou_id))
            
    if data.role_ids:''',
        '''    if data.org_unit_ids:
        for ou_id in data.org_unit_ids:
            db.add(SubjectOrgUnit(subject_id=db_obj.id, org_unit_id=ou_id))
            
    if data.department_ids:
        for d_id in data.department_ids:
            db.add(SubjectDepartment(subject_id=db_obj.id, department_id=d_id))
            
    if data.job_title_ids:
        for t_id in data.job_title_ids:
            db.add(SubjectJobTitle(subject_id=db_obj.id, job_title_id=t_id))
            
    if data.role_ids:'''
    )

# update_subject
if 'db.query(SubjectDepartment)' not in service_content:
    service_content = service_content.replace(
        '''    db.query(SubjectOrgUnit).filter(SubjectOrgUnit.subject_id == id).delete()
    if data.org_unit_ids:
        for ou_id in data.org_unit_ids:
            db.add(SubjectOrgUnit(subject_id=db_obj.id, org_unit_id=ou_id))
            
    db.query(SubjectRole).filter(SubjectRole.subject_id == id).delete()''',
        '''    db.query(SubjectOrgUnit).filter(SubjectOrgUnit.subject_id == id).delete()
    if data.org_unit_ids:
        for ou_id in data.org_unit_ids:
            db.add(SubjectOrgUnit(subject_id=db_obj.id, org_unit_id=ou_id))
            
    db.query(SubjectDepartment).filter(SubjectDepartment.subject_id == id).delete()
    if data.department_ids:
        for d_id in data.department_ids:
            db.add(SubjectDepartment(subject_id=db_obj.id, department_id=d_id))
            
    db.query(SubjectJobTitle).filter(SubjectJobTitle.subject_id == id).delete()
    if data.job_title_ids:
        for t_id in data.job_title_ids:
            db.add(SubjectJobTitle(subject_id=db_obj.id, job_title_id=t_id))
            
    db.query(SubjectRole).filter(SubjectRole.subject_id == id).delete()'''
    )
    with open('app/modules/subject/service.py', 'w', encoding='utf-8') as f:
        f.write(service_content)

print("Updates applied to schema.py and service.py")
