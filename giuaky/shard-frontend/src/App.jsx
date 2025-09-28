import { useState } from 'react'
import './App.css'

export default function App() {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const addUser = async () => {
    if (!id || !name) return setError('Please fill both fields.')
    setError('')
    setAdding(true)
    try {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id), name })
      })
      setId('')
      setName('')
      fetchAll()
    } catch (err) {
      setError('Error adding user')
    } finally {
      setAdding(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/all')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const totalUsers = data.reduce((acc, s) => acc + s.rows.length, 0)

  return (
    <div className="app">
      <header className="app__header">
        <h1>Sharding pattern demo</h1>
        <p className="subtitle">Có tổng cộng n shards, mỗi shard i sẽ lưu các user có user_id % n == i</p>
      </header>

      <section className="panel panel--form">
        <div className="form-grid">
          <div className="field">
            <label>User ID</label>
            <input
              placeholder="e.g. 101"
              value={id}
              onChange={e => setId(e.target.value)}
              type="number"
            />
          </div>
          <div className="field">
            <label>Name</label>
            <input
              placeholder="Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn primary" onClick={addUser} disabled={adding}>
              {adding ? 'Adding...' : 'Add User'}
            </button>
            <button className="btn outline" onClick={fetchAll} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Shards'}
            </button>
          </div>
        </div>
        {error && <div className="alert">{error}</div>}
        {data.length > 0 && (
          <div className="summary">{data.length} shard(s) • {totalUsers} user(s)</div>
        )}
      </section>

      <section className="shards-section">
        {data.length === 0 && !loading && (
          <div className="empty-state">
            <p>No data loaded yet.</p>
            <button className="btn ghost" onClick={fetchAll}>Fetch All Shards</button>
          </div>
        )}
        {loading && (
          <div className="skeleton-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="shards-grid">
            {data.map(shard => (
              <div key={shard.shard} className="shard-card">
                <div className="shard-card__header">
                  <h3>Shard {shard.shard}</h3>
                  <span className="badge">{shard.rows.length}</span>
                </div>
                {shard.rows.length === 0 ? (
                  <p className="muted">No users</p>
                ) : (
                  <ul className="users-list">
                    {shard.rows.map(u => (
                      <li key={u.id}>
                        <span className="uid">{u.id}</span>
                        <span className="uname">{u.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
