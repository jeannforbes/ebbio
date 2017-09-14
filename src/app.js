var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var victor = require('victor');
var crypto = require('crypto');

const PORT = process.env.PORT || 3000;

server.listen(PORT);

app.get('/', function(req, res){ res.sendFile(__dirname + '/index.html'); });

app.get('/style.css', function(req, res){ res.sendFile(__dirname + '/css/style.css'); });

app.get('/victor.js', function(req, res){ res.sendFile(__dirname + '/lib/victor-1.1.0/build/victor.min.js'); });

app.get('/main.js', function(req, res){ res.sendFile(__dirname + '/js/main.js'); });
app.get('/game.js', function(req, res){ res.sendFile(__dirname + '/js/game.js'); });
app.get('/mouse.js', function(req, res){ res.sendFile(__dirname + '/js/mouse.js'); });
app.get('/player.js', function(req, res){ res.sendFile(__dirname + '/js/player.js'); });

// What does the server need to track?

var players = {};

/*
 *  WEBSOCKETS, BABY!
 */

io.on('connect', function(socket) {
    // Assign the new player an id
    var newPlayer = {
        name: getRandom(NAMES), // name
        id: crypto.randomBytes(20).toString('hex'), // id
        type: 0, // type
        joined: Date.now(),
        lastTimeoutCheck: Date.now(),
    };
    players[newPlayer.id] = newPlayer;
    socket.emit('playerInfo', newPlayer); // let the new player know their info
    io.emit('newPlayer', newPlayer); // let everyone know there's a new player

    // Update player location on move
    socket.on('playerMoved', function(data){
        io.emit('playerMoved', data);
    });

    // Update player list when a player leaves
    socket.on('playerLeft', function(data){
        io.emit('playerLeft', data);
        delete players[data.id];

        console.log(data.id+' left.');
    });

    var timeoutcheck = setInterval(function(){
        io.emit('timeoutCheck');
    }, 3000);

    socket.on('timeoutCheck', function(data){
        players[data.id].lastTimeoutCheck = Date.now();
    });

    // Returns the list of current players when requested
    socket.on('currentPlayers', function(){
        socket.emit('currentPlayers', players);
    });
});

function deleteTimedOutPlayers(plist){
    var keys = Object.keys(plist);
    for(var i=0; i<keys.length; i++){
        if(plist[keys[i]].lastTimeoutCheck < Date.now() - 150000){
            delete plist[keys[i]];
            io.emit('playerLeft', {id: keys[i]});
        }
    }
}

function getRandom(arr){
    return arr[parseInt(Math.random()*arr.length)];
}

const NAMES = ['scrapple', 'balrug', 'ewe', 'pandini', 'fuchs'];