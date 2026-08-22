# quick fastapi experiment, not hooked up to the actual node backend or
# the frontend yet - was testing whether a python service made sense here
from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="Product API",
    description="Basic FastAPI App for managing products",
    version="1.0.0"
)

app.include_router(router, prefix="/products", tags=["Products"])
