import React, {useState} from 'react'
import API from '../api'

export default function QueryPanel({onDone}){
  const [id,setId] = useState('')
  const [res,setRes] = useState(null)

  async function run(){
    try{
      const r = await API.get(`/get/${id}`)
      setRes(r.data)
    }catch(e){
      setRes({error: e.response?.data?.detail || e.message})
    }
  }

  async function compare(){
    try{
      const r = await API.get(`/compare/${id}`)
      setRes(r.data)
    }catch(e){
      setRes({error: e.response?.data?.detail || e.message})
    }
  }

  return <div style={{marginTop:20}}>
    <input value={id} onChange={e=>setId(e.target.value)} placeholder="book_id" />
    <button onClick={run}>Query Sharded</button>
    <button onClick={compare}>Compare with Full</button>
    <div style={{marginTop:10}}>
      <pre>{JSON.stringify(res,null,2)}</pre>
    </div>
  </div>
}
