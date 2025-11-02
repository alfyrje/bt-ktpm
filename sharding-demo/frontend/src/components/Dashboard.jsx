import React, { useEffect, useState } from 'react'
import API from '../api'
import QueryPanel from './QueryPanel'
import ShardManager from './ShardManager'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function Dashboard() {
  const [dist, setDist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDist() }, [])

  async function fetchDist() {
    setLoading(true)
    try {
      const r = await API.get('/distribution')
      const items = Object.keys(r.data).map(k => ({
        shard: `Shard ${k}`,
        shardId: k,
        count: r.data[k].count || 0,
        status: r.data[k].status || 'unknown',
        error: r.data[k].error
      }))
      setDist(items)
    } catch (e) {
      console.error('Failed to fetch distribution:', e)
    }
    setLoading(false)
  }

  const getBarColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'disabled': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
          <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
            Books: {data.count.toLocaleString()}
          </p>
          <p style={{ margin: '0', color: getBarColor(data.status), fontWeight: '500' }}>
            Status: {data.status}
          </p>
          {data.error && (
            <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '12px' }}>
              Error: {data.error}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '32px' }}>
          📊 Sharding demo
        </h1>
      </div>

      {/* Shard Management */}
      <ShardManager onShardChange={fetchDist} />

      {/* Data Distribution Chart */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Data Distribution Across Shards</h3>
        
        {loading ? (
          <div style={{ 
            height: '300px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#6b7280' 
          }}>
            Loading distribution data...
          </div>
        ) : (
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={dist} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="shard" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Number of Books" radius={[4, 4, 0, 0]}>
                  {dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Status Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginTop: '16px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
            <span>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
            <span>Disabled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
            <span>Error</span>
          </div>
        </div>
      </div>

      {/* Query Panel */}
      <QueryPanel onDone={fetchDist} />
    </div>
  )
}
