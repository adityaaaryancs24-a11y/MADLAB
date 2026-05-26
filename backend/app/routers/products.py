import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.product import ProductResponse
from app.services import product_service

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

def validate_barcode(upc: str):
    # Validates EAN-8 (8), UPC-E (8), UPC-A (12), EAN-13 (13) lengths consisting only of digits
    if not re.match(r'^(\d{8}|\d{12}|\d{13})$', upc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid barcode format. Must be an 8, 12, or 13 digit numeric string."
        )

@router.get("/{upc}", response_model=ProductResponse)
def read_product(upc: str, db: Session = Depends(get_db)):
    validate_barcode(upc)
    return product_service.get_product_by_upc(db=db, upc=upc)
