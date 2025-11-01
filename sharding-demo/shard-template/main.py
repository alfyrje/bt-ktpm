from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
import os

DB_PATH = os.environ.get('DB_PATH','/data/shard1.db')
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
app = FastAPI()

@app.get('/get/{book_id}')
def get_book(book_id: int):
    with engine.connect() as conn:
        r = conn.execute(text("SELECT * FROM books WHERE book_id = :id"), {"id": book_id}).fetchone()
        if not r:
            raise HTTPException(status_code=404)
        return dict(r._mapping)

@app.get('/count')
def count():
    with engine.connect() as conn:
        r = conn.execute(text("SELECT COUNT(*) as c FROM books")).fetchone()
        return {"count": r[0]}

@app.get('/health')
def health():
    return {"status": "ok"}
