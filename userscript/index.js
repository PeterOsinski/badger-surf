import io from 'socket.io-client/socket.io.js'
import Actions from './lib/Actions'

let socket  = io('http://172.27.130.76:8080'),
    actions = new Actions(socket)

window.actions = actions

Array.from(document.querySelectorAll('*')).forEach(elem => elem.style.boxSizing = 'border-box')

socket.on('message', ({type, data}) => {
  actions[type] ? actions[type](data) : console.log('Event type %s not supported', type)
})

socket.emit('message', {type: 'getUser', data: {}})

socket.on('news', function (data) {
  console.log(data)
  socket.emit('my other event', {my: 'data'})
})
