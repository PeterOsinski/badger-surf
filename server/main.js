var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var path = require('path')
var _ = require('lodash')

app.listen(8080);
console.log('The server is running at 8080 port')

function handler (req, res) {

  if(req.url === '/index'){
    return res.end(fs.readFileSync(__dirname + '/index.html'))
  }

  fs.readFile(__dirname + '/../dist/app.js',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading /dist/app.js');
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.writeHead(200);
    res.end(data);
  });
}

var rooms = {};
var users = {};

var mousePositions = {}

var User = function(name, id){
  var id = id
  var name = name
  var roomName

  this.setRoomName = function(name){
    roomName = name
  }

  this.getRoomName = function(){
    return roomName
  }

  this.getId = function(){
    return id;
  }

  this.getName = function(){
    return name;
  }

  this.getSocketId = function(){
    return socketId
  }
}


var Room = function(name){

  var name = name
  var pin = Math.round(Math.random()*1000)
  var uids = []

  this.addUser = function(uid) {
    if(uids.indexOf(uid) >= 0){
      return
    }
    uids.push(uid)
  }

  this.removeUser = function(uid){
    if(uids.indexOf(uid) === -1){
      return
    }
    uids.splice(uids.indexOf(uid), 1)
  }

  this.getName = function(){
    return name
  }

  this.getUids = function(uid){
    return uids
  }

}

var handlers = {
  getUser: function(data, callback, socket){
    if(!users[socket.id]){
      callback(false)
      return
    }

    callback({
      user: users[socket.id]
    })
  },
  createUser: function(data, callback, socket){
    var u = new User(data.name, socket.id)

    users[u.getId()] = u

    callback({
      uid: u.getId(),
    })

    console.log(users)
  },
  createRoom: function(data, callback, socket){
   
    callback({
      status: true
    })
  },
  getRooms: function(data, callback){
    callback({
      rooms:_.map(rooms, function(room, name){
        return room.getName()
      })
    })

  },
  getRoomUsers: function(data, callback, socket){
    u = {}
    
    _.each(rooms[data.name].getUids(), function(uid){
      u[uid] = users[uid].getName()
    })

    callback({
      users: u
    })
  },
  joinRoom: function(data, callback, socket){

    if(!data.name){
      return
    }
    
    if(!rooms[data.name]){
        var r = new Room(data.name)
        rooms[r.getName()] = r
    }

    rooms[data.name].addUser(socket.id)
    users[socket.id].setRoomName(data.name)

    callback(true)

    console.log(rooms)
    
  },
  mousePosition: function(data, callback, socket){
    mousePositions[socket.id] = {
      cssPath: data.cssPath,
      x: data.x,
      y: data.y
    }

    user = users[socket.id]

    if(!user){
      return
    }

    roomName = user.getRoomName()

    if(!roomName){
      return
    }

    uids = rooms[roomName].getUids()

    positions = {}
    
    uids.forEach(function(uid){
      if(mousePositions[uid] && uid === socket.id){
        positions[uid] = mousePositions[uid]
      }
    })


    uids.forEach(function(uid){
      if(uid !== socket.id){
        io.to(uid).emit('message', {type:'_mousePosition', data:positions})
      }
    })
  },

  getAllFunctions: function(data, callback){
    var fns = Object.keys(handlers)
    callback(fns)
  }
}

io.on('connection', function (socket) {

  socket.on('disconnect', function(){
    console.log('Disconnecting: ', socket.id)
    delete users[socket.id]
    delete mousePositions[socket.id]
    _.each(rooms, function(room){
      room.removeUser(socket.id)
    })

  })

  console.log('Connecting: ', socket.id)
  socket.on('message', function(msg){

    console.log('Received message', msg)

    if(!msg || !msg.data){
      console.error('No data')
      return
    }

    handlers[msg.type](msg.data, function(data){

      // console.log('Emmited message', msg)
      socket.emit('message',{data:data, type: '_'+msg.type})

    }, socket)
  })

});
