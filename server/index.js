const app = require("express")()
const server = require("http").createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: "chat.richardytanure.com",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

const userList = new Map()

io.on('connection', socket => {
  console.log("Usuário conectado: ", socket.id)
  function sendUserList() {
    io.emit("change_userlist", Object.fromEntries(userList))
  }

  socket.on('disconnect', reason => {
    io.emit("user_disconnected", {
      username: socket.data.username
    })
    userList.delete(socket.id)
    sendUserList()
    console.log("Usuário desconectado: ", socket.id)
    
  })

  socket.on('set_username', username => {
    
    if(userList.set(socket.id, username)) {
      socket.data.username = username
      io.emit('user_connected', {
        username: socket.data.username
      })
      sendUserList()
      userList.set(socket.id, username)
    }
  })

  

  socket.on('message', text => {
    io.emit('receive_message', {
      text,
      authorId: socket.id,
      author: socket.data.username
    })
  })
})

server.listen(PORT, () => console.log("Server running..."))