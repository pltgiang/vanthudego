import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require
from app.core.database import get_db
from app.core.response import success
from app.core.storage import upload_fileobj
from app.core.file_registry import ext_of

from . import service
from .schema import HelpArticleCreate, HelpArticleUpdate, HelpArticleOut

router = APIRouter(prefix="/api/v1/help-center", tags=["help_center"])

@router.get("/tree")
def get_help_tree(db: Session = Depends(get_db)):
    """Lấy danh sách cấu trúc cây bài viết"""
    return success(service.get_tree(db))

@router.get("/search")
def search_help_articles(q: str = "", db: Session = Depends(get_db)):
    """Tìm kiếm bài viết"""
    items = service.search_articles(db, q)
    return success([{"id": i.id, "title": i.title} for i in items])

@router.get("/{article_id}")
def get_help_article(article_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết 1 bài viết bao gồm cả nội dung HTML"""
    article = service.get_article(db, article_id)
    return success(HelpArticleOut.model_validate(article).model_dump())

@router.post("")
def create_help_article(data: HelpArticleCreate, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Tạo mới thư mục / bài viết"""
    article = service.create_article(db, data, user.id)
    return success(HelpArticleOut.model_validate(article).model_dump(), "Đã tạo bài viết")

@router.put("/{article_id}")
def update_help_article(article_id: int, data: HelpArticleUpdate, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Cập nhật bài viết"""
    article = service.update_article(db, article_id, data, user.id)
    return success(HelpArticleOut.model_validate(article).model_dump(), "Đã cập nhật bài viết")

@router.delete("/{article_id}")
def delete_help_article(article_id: int, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Xóa bài viết"""
    service.delete_article(db, article_id, user.id)
    return success(None, "Đã xóa bài viết")

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require("setting", "write"))
):
    """Upload ảnh và trả về URL để chèn vào trình soạn thảo"""
    ext = ext_of(file.filename or "")
    if ext not in {"jpg", "jpeg", "png", "gif", "webp", "svg"}:
        raise HTTPException(400, "Chỉ cho phép upload hình ảnh (jpg, png, gif, webp, svg)")
        
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > 10 * 1024 * 1024:
        raise HTTPException(400, "Kích thước ảnh tối đa 10MB")
        
    key = f"help_center/{uuid.uuid4().hex}_{file.filename}"
    try:
        url = upload_fileobj(file.file, key, file.content_type or "")
        return success({"url": url}, "Tải ảnh thành công")
    except Exception as e:
        raise HTTPException(400, f"Lỗi tải ảnh: {str(e)}")

from .schema import HelpArticleSlideCreate, HelpArticleSlideUpdate, HelpArticleSlideOut

@router.post("/{article_id}/slides")
def add_article_slide(article_id: int, data: HelpArticleSlideCreate, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Thêm 1 slide ảnh vào bài viết"""
    slide = service.add_slide(db, article_id, data, user.id)
    return success(HelpArticleSlideOut.model_validate(slide).model_dump(), "Đã thêm slide")

@router.put("/slides/{slide_id}")
def update_article_slide(slide_id: int, data: HelpArticleSlideUpdate, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Cập nhật caption hoặc thứ tự slide"""
    slide = service.update_slide(db, slide_id, data, user.id)
    return success(HelpArticleSlideOut.model_validate(slide).model_dump(), "Đã cập nhật slide")

@router.delete("/slides/{slide_id}")
def delete_article_slide(slide_id: int, db: Session = Depends(get_db), user=Depends(require("setting", "write"))):
    """Xóa 1 slide khỏi bài viết"""
    service.delete_slide(db, slide_id, user.id)
    return success(None, "Đã xóa slide")
