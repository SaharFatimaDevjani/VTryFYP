from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="Product API",
    description="Basic FastAPI App for managing products",
    version="1.0.0"
)

app.include_router(router, prefix="/products", tags=["Products"])
