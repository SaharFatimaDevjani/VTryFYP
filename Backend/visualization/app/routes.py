from fastapi import APIRouter, HTTPException
from .models import Product

router = APIRouter()

# In-memory fake database
fake_db = []

@router.post("/", response_model=Product)
def create_product(product: Product):
    fake_db.append(product)
    return product

@router.get("/", response_model=list[Product])
def list_products():
    return fake_db

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int):
    for product in fake_db:
        if product.id == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, updated_product: Product):
    for index, product in enumerate(fake_db):
        if product.id == product_id:
            fake_db[index] = updated_product
            return updated_product
    raise HTTPException(status_code=404, detail="Product not found")

@router.delete("/{product_id}")
def delete_product(product_id: int):
    for index, product in enumerate(fake_db):
        if product.id == product_id:
            fake_db.pop(index)
            return {"message": "Product deleted"}
    raise HTTPException(status_code=404, detail="Product not found")
