var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var crypto = require('crypto');

var users = {};

const PORT = process.env.PORT || 3000;

server.listen(PORT);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.emit('joining', {
        user: {
            name: getRandom(NAMES),
            id: crypto.randomBytes(20).toString('hex'),
            joined: Date.now()
        }
    });
    socket.on('joined', function(data){
        users[data.id] = data;
        io.emit('joined', users);

        console.log(data.id+' joined.');
    });
    socket.on('moved', function(data){
        if(users[data.id]) users[data.id].loc = data.loc;
        io.emit('moved', data);
    });
    socket.on('leaving', function(data){
        io.emit('leaving', data);
        delete users[data.id];

        console.log(data.id+' left.');
    })
});

function getRandom(arr){
    return arr[parseInt(Math.random()*arr.length)];
}

const NAMES = ['scrapple', 'balrug', 'ewe', 'pandini', 'fuchs'];