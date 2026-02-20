from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from bd.database import engine, get_db

app = FastAPI()


# 🔹 Test database connection on startup
@app.on_event("startup")
def startup():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✓ Database connection successful!")
        print(f"✓ Connected to: {engine.url.database}")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")


# 🔹 Simple test route
@app.get("/")
def read_root():
    return {"message": "FastAPI is running 🚀"}


# 🔹 Test DB route
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"status": "Database connected successfully ✅"}
