const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const msg = require('./utils/messages')
const users = require('./utils/users')
const { getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname,'../public')))

io.on('connection',(socket)=>{

    socket.on('join',(joinData,callback)=>{

        const {error, user} = users.addUser({ id: socket.id, ...joinData })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', msg.generateMessage('Welcome!'))
        socket.to(user.room).broadcast.emit('message', msg.generateMessage(user.username,`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: users.getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        const user = users.getUser(socket.id)
        io.to(user.room).emit('message', msg.generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = users.removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',msg.generateMessage(user.username,`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(myLocation,callback)=>{
        const user = users.getUser(socket.id)
        io.to(user.room).emit('locationMessage', msg.generateLocationMessage(user.username, 'https://google.com/maps?q='+myLocation.latitude+','+myLocation.longitude))
        callback()
    })
})

server.listen(port , ()=>{
    console.log(`Server listening on port: ${port}`)
})