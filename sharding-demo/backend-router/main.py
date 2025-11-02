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

DISABLED_SHARDS = set()

class Strategy(BaseModel):
    strategy: str

@app.get('/get/{book_id}')
async def get_book(book_id: int):
    sid = sharder.which_shard(book_id)
    if sid == -1:
        raise HTTPException(status_code=404, detail='Not found in lookup')
    
    if sid in DISABLED_SHARDS:
        raise HTTPException(status_code=503, detail=f"Shard {sid} is currently disabled")
    
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
                if sid in DISABLED_SHARDS:
                    out[sid] = {'error': 'disabled', 'count': 0, 'status': 'disabled'}
                else:
                    r = await client.get(f"{u}/count")
                    result = r.json()
                    result['status'] = 'active'
                    out[sid] = result
            except Exception:
                out[sid] = {'error': 'unavailable', 'count': 0, 'status': 'error'}
    return out

@app.post('/strategy')
async def set_strategy(s: Strategy):
    sharder.set_strategy(s.strategy)
    return {"strategy": s.strategy}

@app.get('/strategy')
async def get_strategy():
    return {"strategy": sharder.strategy}

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

@app.post('/shard/{sid}/disable')
async def disable_shard(sid: int):
    if sid not in SHARDS:
        raise HTTPException(status_code=404, detail="Shard not found")
    DISABLED_SHARDS.add(sid)
    return {"message": f"Shard {sid} disabled", "disabled_shards": list(DISABLED_SHARDS)}

@app.post('/shard/{sid}/enable')
async def enable_shard(sid: int):
    if sid not in SHARDS:
        raise HTTPException(status_code=404, detail="Shard not found")
    DISABLED_SHARDS.discard(sid)
    return {"message": f"Shard {sid} enabled", "disabled_shards": list(DISABLED_SHARDS)}

@app.get('/shards/status')
async def get_shards_status():
    status = {}
    async with httpx.AsyncClient() as client:
        for sid, url in SHARDS.items():
            if sid in DISABLED_SHARDS:
                status[sid] = {"status": "disabled", "url": url}
            else:
                try:
                    r = await client.get(f"{url}/health", timeout=2.0)
                    status[sid] = {"status": "active", "url": url}
                except Exception:
                    status[sid] = {"status": "error", "url": url}
    return status
