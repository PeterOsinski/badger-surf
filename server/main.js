var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var path = require('path')

app.listen(8080);
console.log('The server is running at 8080 port')

function handler (req, res) {
  fs.readFile(path.resolve('../dist/app.js'),
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading /dist/app.js');
      }

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Credentials', true)
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-setHeaders', 'Content-Type')
      res.writeHead(200);
      res.end(data);
    });
}

var rooms = [];
var users = {};

var User = function(name){
  var id = Math.random().toString().slice(2)
  var name = name
  this.getId = function(){
    return id;
  }
}


var Room = function(name){

  var name = name
  var pin = Math.round(Math.rand()*1000)
  var uids = []

  this.addUser = function(uid) {
    uids.push(uid)
  }

  this.removeUser = function(uid){
    uids.splice(uids.indexOf(uid), 1)
  }

  this.getName = function(){
    return name
  }

}

var handlers = {
  getUser: function(data, callback){
    if(!uid || !users[uid]){
      return false
    }

    callback({
      user:users[uid]
    })
  },
  createUser: function(data, callback){
    var u = new User(data.name)

    users[user.getId()] = u
    callback({
      uid:user.getId()
    })
  },
  createRoom: function(data, callback){
    var r = new Room(data.name)
    r.addUser(uid)

    callback({
      status: true
    })
  },
  getRooms: function(data, callback){
    callback('success')

  },
  joinRoom: function(data, callback){

    callback({
      rooms:rooms.map(function(room){
        return room.getName()
      })
    })
  }
}

io.on('connection', function (socket) {
  socket.on('message', function(msg){

    console.log('Received message', msg)

    handlers[msg.type](msg.data, function(data){

      console.log('Emmited message', msg)
      socket.emit('message',{data:data, type: '_'+msg.type})

    })
  })

});
