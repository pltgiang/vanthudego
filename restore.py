import json

log_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\048cebec-e625-442c-9441-94cc446b9c09\.system_generated\logs\transcript.jsonl"
file_content = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'TOOL_RESPONSE' and data.get('status') == 'DONE':
            output = data.get('content', '')
            if 'JobPositionList.tsx' in output and 'Total Lines: 539' in output:
                # Extract the file content
                lines = output.split('\n')
                is_code = False
                for l in lines:
                    if l.startswith('1: '):
                        is_code = True
                    if is_code:
                        if l.startswith('The above content shows the entire, complete file'):
                            break
                        parts = l.split(': ', 1)
                        if len(parts) == 2 and parts[0].isdigit():
                            file_content.append(parts[1])
                        else:
                            file_content.append(l)
                if len(file_content) > 100:
                    break

with open(r"d:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\pages\JobPositionList.tsx", "w", encoding="utf-8") as out:
    for c in file_content:
        out.write(c + "\n")
