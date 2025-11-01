from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import time
import json
from sharding import Sharder
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('shard_map.json') as f:
    SHARD_CFG = json.load(f)

SHARDS = {int(k):v for k,v in SHARD_CFG['shards'].items()}
sharder = Sharder(SHARDS)

class Strategy(BaseModel):
    strategy: str

@app.get('/get/{book_id}')
async def get_book(book_id: int):
    sid = sharder.which_shard(book_id)
    if sid == -1:
        raise HTTPException(status_code=404, detail='Not found in lookup')
    url = SHARDS[sid]
    start = time.time()
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{url}/get/{book_id}")
        elapsed = (time.time() - start) * 1000
        return {"data": r.json(), "shard": sid, "time_ms": elapsed}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Shard {sid} unavailable: {e}")

@app.get('/distribution')
async def distribution():
    out = {}
    async with httpx.AsyncClient() as client:
        for sid,u in SHARDS.items():
            try:
                r = await client.get(f"{u}/count")
                out[sid] = r.json()
            except Exception:
                out[sid] = {'error': 'unavailable'}
    return out

@app.post('/strategy')
async def set_strategy(s: Strategy):
    sharder.set_strategy(s.strategy)
    return {"strategy": s.strategy}

@app.get('/compare/{book_id}')
async def compare(book_id: int):
    start = time.time()
    try:
        async with httpx.AsyncClient() as client:
            r_full = await client.get(f"http://{SHARD_CFG['full_db']}/get/{book_id}")
    except Exception:
        raise HTTPException(status_code=503, detail='Error querying full DB')
    t_full = (time.time() - start) * 1000
    res = await get_book(book_id)
    return {"sharded": res, "full_time_ms": t_full}

@app.post('/toggle_shard/{sid}')
async def toggle_shard(sid: int):
    if sid not in SHARDS:
        raise HTTPException(status_code=404)
    return {"toggled": sid}
