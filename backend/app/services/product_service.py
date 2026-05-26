from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.models.product import Product
from fastapi import HTTPException, status


def get_product_by_upc(db: Session, upc: str) -> Product:
    """
    Fetch a product by its UPC barcode, eagerly loading related
    prices and price_history in a single optimized query.
    """
    product = (
        db.query(Product)
        .options(
            joinedload(Product.prices),
            joinedload(Product.price_history),
        )
        .filter(Product.upc == upc)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No product found for UPC: {upc}",
        )

    return product
