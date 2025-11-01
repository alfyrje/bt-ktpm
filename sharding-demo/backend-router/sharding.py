import hashlib
from typing import Dict

class Sharder:
    def __init__(self, shards: Dict[int,str]):
        self.shards = shards
        self.n = len(shards)
        self.lookup = {}
        self.strategy = "hash"

    def set_strategy(self, s: str):
        self.strategy = s

    def hash_shard(self, key: int) -> int:
        h = int(hashlib.sha1(str(key).encode()).hexdigest(), 16)
        return h % self.n

    def range_shard(self, key: int) -> int:
        per = 10000 // self.n
        return min(key // max(1, per), self.n - 1)

    def lookup_shard(self, key: int) -> int:
        return self.lookup.get(key, -1)

    def which_shard(self, key: int) -> int:
        if self.strategy == "hash":
            return self.hash_shard(key)
        if self.strategy == "range":
            return self.range_shard(key)
        if self.strategy == "lookup":
            return self.lookup_shard(key)
        return self.hash_shard(key)
