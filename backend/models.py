from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    id: str
    brand: str
    name: str
    price: float
    mrp: float
    discount: str
    best_price: str
    image_url: str
    product_url: str
    gender: str  # Added for filtering


class ChatRequest(BaseModel):
    gender: str  # "men" or "women"
    message: str


class ChatResponse(BaseModel):
    message: str
    products: List[Product]