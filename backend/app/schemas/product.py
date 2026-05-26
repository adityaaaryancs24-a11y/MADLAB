from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class PriceSchema(BaseModel):
    id: int
    retailer: str
    price: float
    in_stock: Optional[bool] = True
    logo: Optional[str] = None
    url: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PriceHistorySchema(BaseModel):
    id: int
    price: float
    store: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    upc: str
    name: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    prices: List[PriceSchema] = []
    price_history: List[PriceHistorySchema] = []

    model_config = ConfigDict(from_attributes=True)
