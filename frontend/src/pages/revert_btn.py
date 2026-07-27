import os

file_path = r"D:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\pages\JobPositionList.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Revert outline to btn-outline
content = content.replace('btn outline primary', 'btn btn-outline-primary')
content = content.replace('btn outline', 'btn btn-outline')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

css_path = r"D:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\index.css"
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = css_content.replace('.btn.outline.primary', '.btn-outline-primary')
css_content = css_content.replace('.btn.outline', '.btn-outline')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Reverted files")
