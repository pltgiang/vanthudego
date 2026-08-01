import os
import sys
import re

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import markdown
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.help_center.model import HelpArticle

DOC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "doc_temp")
EXCLUDE_FILES = ["00-muc-luc.md", "README.md", "thiet-ke-luu-va-trang-thai-dong.md"]

def md_to_html(md_text):
    if not md_text.strip():
        return ""
    html = markdown.markdown(md_text, extensions=['tables', 'fenced_code'])
    return f'<div style="font-size: 15px; line-height: 1.6; color: #333;">{html}</div>'

def parse_markdown_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the main title (# Title)
    main_title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if main_title_match:
        main_title = main_title_match.group(1).strip()
        # Remove the main title from the content to not duplicate it
        content = content.replace(main_title_match.group(0), '', 1)
    else:
        # Fallback to filename
        main_title = os.path.basename(filepath).replace('.md', '').replace('-', ' ').title()

    # Split by level 2 headings
    sections = re.split(r'^##\s+', content, flags=re.MULTILINE)
    
    # First part is intro (under main title, before first ##)
    intro_text = sections[0].strip()
    
    parsed_sections = []
    for section in sections[1:]:
        lines = section.split('\n', 1)
        sub_title = lines[0].strip()
        sub_content = lines[1].strip() if len(lines) > 1 else ""
        
        # if the sub_title has a number like "1. Something", we could keep it or strip it, keeping is fine
        parsed_sections.append({
            "title": sub_title,
            "content": sub_content
        })

    return {
        "title": main_title,
        "intro": intro_text,
        "sections": parsed_sections
    }

def import_docs():
    db: Session = SessionLocal()
    try:
        # Clear existing safely by setting foreign key checks to 0
        from sqlalchemy import text
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.execute(text("TRUNCATE TABLE tab_help_article;"))
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()

        # Root Node
        root = HelpArticle(title="Hướng dẫn sử dụng", sort_order=0, parent_id=None)
        db.add(root)
        db.commit()
        db.refresh(root)

        files = sorted(os.listdir(DOC_DIR))
        order = 1

        for filename in files:
            if not filename.endswith('.md') or filename in EXCLUDE_FILES:
                continue

            filepath = os.path.join(DOC_DIR, filename)
            doc_data = parse_markdown_file(filepath)

            # Create Level 1 node
            lvl1 = HelpArticle(
                title=doc_data["title"],
                content=md_to_html(doc_data["intro"]),
                sort_order=order,
                parent_id=root.id
            )
            db.add(lvl1)
            db.commit()
            db.refresh(lvl1)
            
            # Create Level 2 nodes
            sub_order = 1
            for section in doc_data["sections"]:
                lvl2 = HelpArticle(
                    title=section["title"],
                    content=md_to_html(section["content"]),
                    sort_order=sub_order,
                    parent_id=lvl1.id
                )
                db.add(lvl2)
                sub_order += 1
                
            order += 1
            print(f"Imported: {doc_data['title']} ({len(doc_data['sections'])} sections)")

        db.commit()
        print("Import thành công toàn bộ tài liệu!")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_docs()
