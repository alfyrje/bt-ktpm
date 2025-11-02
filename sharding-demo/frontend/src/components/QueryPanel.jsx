import React, { useState } from 'react'
import API from '../api'

export default function QueryPanel({ onDone }) {
  const [id, setId] = useState('')
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    if (!id.trim()) return
    setLoading(true)
    try {
      const r = await API.get(`/get/${id}`)
      setRes({ type: 'sharded', data: r.data })
    } catch (e) {
      setRes({ type: 'error', data: { error: e.response?.data?.detail || e.message } })
    }
    setLoading(false)
  }

  async function compare() {
    if (!id.trim()) return
    setLoading(true)
    try {
      const r = await API.get(`/compare/${id}`)
      setRes({ type: 'comparison', data: r.data })
    } catch (e) {
      setRes({ type: 'error', data: { error: e.response?.data?.detail || e.message } })
    }
    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      run()
    }
  }

  const formatResult = (result) => {
    if (!result) return null

    const getResultColor = (type) => {
      switch (type) {
        case 'sharded': return '#10b981'
        case 'comparison': return '#3b82f6'
        case 'error': return '#ef4444'
        default: return '#6b7280'
      }
    }

    const getResultTitle = (type) => {
      switch (type) {
        case 'sharded': return '🔍 Sharded Query Result'
        case 'comparison': return '⚖️ Performance Comparison'
        case 'error': return '❌ Query Error'
        default: return 'Result'
      }
    }

    return (
      <div style={{
        border: `2px solid ${getResultColor(result.type)}`,
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#ffffff',
        marginTop: '16px'
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          color: getResultColor(result.type),
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {getResultTitle(result.type)}
        </h4>
        
        {result.type === 'sharded' && result.data.data && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                <strong>Shard:</strong> {result.data.shard}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                <strong>Time:</strong> {result.data.time_ms?.toFixed(2)}ms
              </div>
            </div>
            {result.data.data.title && (
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{result.data.data.title}</h5>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                  by {result.data.data.authors} • Rating: {result.data.data.average_rating}/5
                </p>
              </div>
            )}
          </div>
        )}

        {result.type === 'comparison' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #d1fae5' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#065f46' }}>Sharded Query</h5>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>Shard: {result.data.sharded?.shard}</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>Time: {result.data.sharded?.time_ms?.toFixed(2)}ms</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Full DB Query</h5>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>Time: {result.data.full_time_ms?.toFixed(2)}ms</p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: result.data.sharded?.time_ms < result.data.full_time_ms ? '#059669' : '#dc2626' }}>
                {result.data.sharded?.time_ms < result.data.full_time_ms ? '✓ Faster' : '⚠ Slower'}
              </p>
            </div>
          </div>
        )}

        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            Raw JSON Response
          </summary>
          <pre style={{
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            margin: '8px 0 0 0',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Query Books</h3>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          value={id}
          onChange={e => setId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter book ID (e.g., 1, 100, 5000)"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            ':focus': { borderColor: '#3b82f6' }
          }}
        />
        <button
          onClick={run}
          disabled={loading || !id.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading || !id.trim() ? '#9ca3af' : '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: loading || !id.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            minWidth: '120px'
          }}
        >
          {loading ? 'Querying...' : 'Query Sharded'}
        </button>
        <button
          onClick={compare}
          disabled={loading || !id.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading || !id.trim() ? '#9ca3af' : '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: loading || !id.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            minWidth: '120px'
          }}
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {formatResult(res)}
    </div>
  )
}
