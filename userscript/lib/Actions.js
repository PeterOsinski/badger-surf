import cssPath from 'css-path'

window.cssPath = cssPath
const ELEM_CACHE = new Map()

let socket            = null,
    mouseMoveInterval = null,
    pos               = {x: 0, y: 0},
    last

const getPosition = ({pageX: x, pageY: y}) => {
  let width  = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth,

      body   = document.body,
      html   = document.documentElement,
      height = Math.max(body.offsetHeight),
      elem   = document.elementFromPoint(x, y),
      bcr    = elem.getBoundingClientRect()

  let nX = (x - bcr.left) / bcr.width * 100,
      nY = (y - bcr.top) / bcr.height * 100

  pos = {
    x: (nX || 0).toFixed(2),
    y: (nY || 0).toFixed(2),
    cssPath: cssPath(elem)
  }
}

export default class Actions {

  constructor(io) {
    socket = io
  }

  _getUser(data) {
    if (!data) {
      socket.emit('message', {
        type: 'createUser',
        data: {name: prompt('Name?') || `default_${Math.random().toString()}`}
      })
    }
  }

  _createUser(data) {
    this.joinRoom()
    console.log(data)
  }

  createRoom(name) {
    socket.emit('message', {type: 'createRoom', data: {name: name}})
  }

  _createRoom(data) {
    console.log(data)
  }

  getRooms() {
    socket.emit('message', {type: 'getRooms', data: {}})
  }

  _getRooms(data) {
    console.log(data)
  }

  joinRoom(name) {
    socket.emit('message', {type: 'joinRoom', data: {name: prompt('Room?')}})
  }

  _joinRoom(data) {
    console.log(data)
    this.startMouseInterval()
  }

  getRoomUsers(name) {
    socket.emit('message', {type: 'getRoomUsers', data: {name}})
  }

  _getRoomUsers(data) {
    console.log(data)
  }

  getAllFuntions() {
    socket.emit('message', {type: 'getAllFunctions', data: {}})
  }

  _getAllFunctions(data) {
    console.log(data)
  }

  mousePosition(data) {
    socket.emit('message', {type: 'mousePosition', data: data})
  }

  _mousePosition(data) {

    Reflect.ownKeys(data).forEach(function (key) {

      let elem     = ELEM_CACHE.get(key),
          incoming = data[key],
          iElem    = document.querySelector(incoming.cssPath),
          bodyBcr  = document.body.getBoundingClientRect(),
          bcr      = iElem.getBoundingClientRect(),
          cX       = bcr.width * incoming.x / 100 + bcr.left - bodyBcr.left,
          cY       = bcr.height * incoming.y / 100 + bcr.top

      if (iElem) {
        console.log(iElem)
      }

      if (last && incoming.cssPath !== last) {
        document.querySelector(last).style.border = ''
      }
      last = incoming.cssPath
      iElem.style.border = '1px solid red'

      return

      if (!elem) {
        elem = document.createElement('div')
        elem.style.position = 'absolute'
        elem.style.width = '10px'
        elem.style.height = '10px'
        elem.style.backgroundColor = 'red'
        document.body.appendChild(elem)
      }

      elem.style.left = `${cX}px`
      elem.style.top = `${cY}px`
      ELEM_CACHE.set(key, elem)
    })
  }

  startMouseInterval() {
    console.log('called')
    if (mouseMoveInterval) {
      return false
    } else {
      document.addEventListener('mousemove', getPosition)
      mouseMoveInterval = setInterval(() => this.mousePosition(pos), 50)
    }
  }

  stopMouseInterval() {
    clearInterval(mouseMoveInterval)
    mouseMoveInterval = null
  }

}