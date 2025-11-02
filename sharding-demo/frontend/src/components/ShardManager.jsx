import React, { useState, useEffect } from 'react'
import API from '../api'

export default function ShardManager({ onShardChange }) {
  const [shards, setShards] = useState({})
  const [currentStrategy, setCurrentStrategy] = useState('hash')

  useEffect(() => {
    fetchShardStatus()
    fetchCurrentStrategy()
  }, [])

  async function fetchShardStatus() {
    try {
      const r = await API.get('/shards/status')
      setShards(r.data)
    } catch (e) {
      console.error('Failed to fetch shard status:', e)
    }
  }

  async function fetchCurrentStrategy() {
    try {
      const r = await API.get('/strategy')
      setCurrentStrategy(r.data.strategy)
    } catch (e) {
      console.error('Failed to fetch strategy:', e)
    }
  }

  async function toggleShard(shardId, isEnabled) {
    try {
      const endpoint = isEnabled ? 'disable' : 'enable'
      await API.post(`/shard/${shardId}/${endpoint}`)
      await fetchShardStatus()
      if (onShardChange) onShardChange()
    } catch (e) {
      console.error(`Failed to ${endpoint} shard:`, e)
    }
  }

  async function changeStrategy(strategy) {
    try {
      await API.post('/strategy', { strategy })
      setCurrentStrategy(strategy)
      if (onShardChange) onShardChange()
    } catch (e) {
      console.error('Failed to change strategy:', e)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'disabled': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'disabled': return 'Disabled'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Shard Management</h3>

      {/* Shard Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {Object.entries(shards).map(([shardId, info]) => (
          <div
            key={shardId}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '15px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#1f2937' }}>Shard {shardId}</h4>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(info.status)
                }}
              />
            </div>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#6b7280' }}>
              Status: <span style={{ color: getStatusColor(info.status), fontWeight: '600' }}>
                {getStatusText(info.status)}
              </span>
            </p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#9ca3af' }}>
              {info.url}
            </p>
            <button
              onClick={() => toggleShard(parseInt(shardId), info.status === 'active')}
              disabled={info.status === 'error'}
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: info.status === 'active' ? '#ef4444' : '#10b981',
                color: '#ffffff',
                cursor: info.status === 'error' ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                opacity: info.status === 'error' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {info.status === 'active' ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}