import os

file_path = r"D:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\pages\JobPositionList.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Tab buttons
content = content.replace(
    "`btn ${tab === 'position' ? 'btn-primary' : 'btn-default'}`",
    "`btn ${tab === 'position' ? 'btn-outline active' : 'btn-outline'}`"
)
content = content.replace(
    "`btn ${tab === 'group' ? 'btn-primary' : 'btn-default'}`",
    "`btn ${tab === 'group' ? 'btn-outline active' : 'btn-outline'}`"
)
content = content.replace(
    "`btn ${tab === 'title' ? 'btn-primary' : 'btn-default'}`",
    "`btn ${tab === 'title' ? 'btn-outline active' : 'btn-outline'}`"
)

# Replace 'btn btn-default icon-btn' with 'btn btn-outline icon-btn' (for pagination and refresh/settings)
content = content.replace('btn btn-default icon-btn', 'btn btn-outline icon-btn')

# Replace 'btn btn-primary dis-flex' with 'btn btn-outline-primary dis-flex' (for the Add buttons)
content = content.replace('btn btn-primary dis-flex', 'btn btn-outline-primary dis-flex')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated JobPositionList.tsx")
