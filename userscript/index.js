import io from 'socket.io-client/socket.io.js'

let socket = io('http://172.28.2.105:8080')

socket.on('news', function (data) {
  console.log(data)
  socket.emit('my other event', { my: 'data' })
})