import sys

with open('app/modules/subject/controller.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Update get_subjects filtering
if 'Subject.departments.any(department_id=department_id)' not in content:
    content = content.replace(
        '        query = query.filter(Subject.department_id == department_id)',
        '        query = query.filter(Subject.departments.any(department_id=department_id))'
    )

# Update get_subjects out mapping
if '"department_ids":' not in content:
    content = content.replace(
        '''            "direct_manager_name": item.direct_manager.subject_name if item.direct_manager else "",
            "org_unit_ids": [ou.org_unit_id for ou in item.org_units],
            "role_ids": [r.role_id for r in item.roles]''',
        '''            "direct_manager_name": item.direct_manager.subject_name if item.direct_manager else "",
            "org_unit_ids": [ou.org_unit_id for ou in item.org_units],
            "department_ids": [d.department_id for d in item.departments],
            "job_title_ids": [t.job_title_id for t in item.job_titles],
            "role_ids": [r.role_id for r in item.roles]'''
    )

with open('app/modules/subject/controller.py', 'w', encoding='utf-8') as f:
    f.write(content)
