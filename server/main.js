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

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

var rooms = [];

var User = function(name){
    var id = 
}

var Room = function(name){

  var name
  var users = []

  function addMember(user) {
    users.push(user)
  }

  function removeUser(user){
    users.splice(users.indexOf(user), 1)
  }

}