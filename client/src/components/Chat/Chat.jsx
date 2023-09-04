import React, {useRef, useState, useEffect} from 'react'

import "./Chat.css"

export default function Chat({ socket }) {

  const messageRef = useRef()
  const lastChatRef = useRef()

  const [messageList, setMessageList] = useState([])
  const [notificationList, setNotificationList] = useState([])
  const [userList, setUserList] = useState([])
  const [menuState, setMenuState] = useState(false)

  function notificateUserAction(message, type = "") {
    let notification = {
      message: message,
      class: type
    }

    setNotificationList((current) => [...current, notification])
    setTimeout(()=>{
      setNotificationList(notificationList.slice())
    }, 1000 * 4)
  }

  useEffect(()=>{
    goToLastMessage()
  }, [messageList])

  useEffect(()=>{
    socket.on("receive_message", data => {
      setMessageList((current) => [...current, data])
    })

    socket.on("user_connected", data => {
      notificateUserAction(`Usuário "${data.username}" conectado`, "alert")
    })

    socket.on("user_disconnected", data => {
      notificateUserAction(`Usuário "${data.username}" desconectado`, "danger")
    })

    socket.on("change_userlist", data => {
      setUserList(() => data)
    })

    return () => {
      socket.off('receive_message')
      socket.off("user_connected")
      socket.off("user_disconnected")
      socket.off("change_userlist")
    }
  }, [socket])

  function handleSubmit() {
    const message = messageRef.current.value
    if(!message.trim()) return
    socket.emit('message', message)
    clearInput()
  }

  function clearInput() {
    messageRef.current.value = ""
  }

  function goToLastMessage() {
    lastChatRef.current.scrollIntoView({behavior: 'smooth'})
  }

  function inputKeyPressed(e) {
    if(e.key === "Enter") handleSubmit()
  }

  return (
    <div className='chat-content'>
      <div className="user-list">
        <button onClick={() => setMenuState(true)} className={menuState ? "hidden" : ""}>Lista de Usuários</button>
        <div className={`open-menu ${!menuState ? "hidden" : ""}`}>
          <button onClick={() => setMenuState(false)}>Fechar</button>
          {
            Object.values(userList).map((user, index) => (
              <p key={index}>{user}</p>
            ))
          }
        </div>
        
      </div>
      <div className="notification">
        {
          notificationList.map((notification, index)=>(
            <p key={index} className={notification.class}>{notification.message}</p>
          ))
        }
      </div>
      <div className="messages">
        {
          messageList.map((message, index)=>(
            <div className={`message-container ${(message.authorId === socket.id) ? "user-message" : "stranger-message"}`}>
              <div className="single-message" key={index}>
              <p className='message-text'>{message.text}</p>
              <p className='author-name'>{message.author}</p>
            </div>
            </div>
            
          ))
        }
        <div className='bottom-chat' ref={lastChatRef}></div>
      </div>
      <div className="form-input">
        <input onKeyDown={(e) => inputKeyPressed(e)} type="text" ref={messageRef} placeholder='Mensagem'/>
        <button onClick={() => handleSubmit()}>Enviar</button>
      </div>
    </div>
  )
}
