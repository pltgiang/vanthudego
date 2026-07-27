import os

file_path = r"D:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\pages\JobPositionList.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('outline-primary', 'outline primary')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated JobPositionList.tsx")
