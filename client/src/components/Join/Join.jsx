import React, { useRef } from 'react'
import io from 'socket.io-client'

import './Join.css'

export default function Join({setChatVisibility, setSocket}) {
  const usernameRef = useRef()
  
  async function handleSubmit() {
    const username = usernameRef.current.value
    if(!username.trim()) return
    // const socket = await io.connect('http://localhost:3001')
    const socket = await io.connect('https://socketio-chat-server.vercel.app/')
    socket.emit('set_username', username)
    setSocket(socket)
    setChatVisibility(true)
  }
  

  return (
    <div className='join-content'>
      <div className="form-login">
        <h1>Entrar</h1>
        <input type="text" ref={usernameRef} placeholder='Nome de Usuário'/>
        <button onClick={()=>handleSubmit()}>Entrar</button>
      </div>
    </div>
  )
}
