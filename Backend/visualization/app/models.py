from pydantic import BaseModel

class Product(BaseModel):
    id: int
    title: str
    description: str
    category: str
    image: str
    price: float
