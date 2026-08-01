from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class HelpArticleSlideCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    step_order: int = 0

class HelpArticleSlideUpdate(BaseModel):
    image_url: Optional[str] = None
    caption: Optional[str] = None
    step_order: Optional[int] = None

class HelpArticleSlideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    article_id: int
    image_url: str
    caption: Optional[str] = None
    step_order: int

class HelpArticleCreate(BaseModel):
    title: str
    parent_id: Optional[int] = None
    content: str = ""
    sort_order: int = 0

class HelpArticleUpdate(BaseModel):
    title: Optional[str] = None
    parent_id: Optional[int] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None

class HelpArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    parent_id: Optional[int] = None
    sort_order: int
    
    # Optional field for the detailed view
    content: Optional[str] = None
    slides: List[HelpArticleSlideOut] = []
