import React, {useEffect,useState} from 'react'
import API from '../api'
import QueryPanel from './QueryPanel'
import {BarChart,Bar,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer} from 'recharts'

export default function Dashboard(){
  const [dist,setDist] = useState([])

  useEffect(()=>{fetchDist()},[])

  async function fetchDist(){
    try{
      const r = await API.get('/distribution')
      const items = Object.keys(r.data).map(k=>({shard:k,count:r.data[k].count||0}))
      setDist(items)
    }catch(e){console.log(e)}
  }

  return <div>
    <div style={{height:300,width:'80%'}}>
      <ResponsiveContainer>
        <BarChart data={dist}>
          <XAxis dataKey="shard" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <QueryPanel onDone={fetchDist} />
  </div>
}
