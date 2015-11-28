var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);
console.log('The server is running at 8080 port')

function handler (req, res) {
  fs.readFile(__dirname + '/dist/app.js',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading /dist/app.js');
    }

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
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

  var name
  var users = []

  this.addMember = function(user) {
    users.push(user)
  }

  removeUser = function(user){
    users.splice(users.indexOf(user), 1)
  }

}

io.on('connection', function (socket) {
  socket.on('get-user', function(uid){
    if(!uid || !users[uid]){
      return false
    }

    return users[uid]
  })

  // socket.on()

  socket.on('create-room', function (data) {
    console.log(data);
  });
});
