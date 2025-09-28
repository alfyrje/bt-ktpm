import express from 'express'
import pkg from 'pg'
import cors from 'cors'

const { Pool } = pkg

const shards = [
  new Pool({ connectionString: process.env.SHARD0_URL }),
  new Pool({ connectionString: process.env.SHARD1_URL }),
  new Pool({ connectionString: process.env.SHARD2_URL })
]

for (const pool of shards) {
  await pool.query('CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY, name TEXT)')
}

const app = express()
app.use(express.json())
app.use(cors())

function getShard(id) {
  return shards[id % shards.length]
}

app.post('/users', async (req,res) => {
  const { id, name } = req.body
  await getShard(id).query('INSERT INTO users VALUES ($1,$2)', [id,name])
  res.sendStatus(200)
})

app.get('/all', async (_,res) => {
  const results = await Promise.all(
    shards.map(async (db,i)=>({
      shard: i,
      rows: (await db.query('SELECT * FROM users ORDER BY id')).rows
    }))
  )
  res.json(results)
})

app.listen(3000, ()=> console.log('Backend running on 3000'))
