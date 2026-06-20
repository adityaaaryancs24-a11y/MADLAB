from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products
from app.database import engine, Base
from app.models import product, user  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Verity Backend", version="1.0.0")

# Configure CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Verity API"}
