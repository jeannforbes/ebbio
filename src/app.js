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
var clients = [];

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

    // Add a new client
    clients[newPlayer.id] = socket;

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

    /*var timeoutcheck = setInterval(function(){
        io.emit('timeoutCheck');
        var keys = Object.keys(players);
        for(var i=0; i<keys.length; i++){
            if(Date.now() - players[keys[i]].lastTimeoutCheck > 150000){
                io.emit('playerLeft', { id: keys[i] });
                delete players[keys[i]];
            }
        }
    }, 3000);*/

    /*
    socket.on('timeoutCheck', function(data){
        if(players[data.id]) players[data.id].lastTimeoutCheck = Date.now();
    });
    */

    socket.on('collision', function(data){
        // Need some collision checking here
        //   to prevent peter-cheaters
        if(!clients[data.id2] || !clients[data.id1]) return;

        clients[data.id2].emit('collided', {
            id1: data.id1,
            id2: data.id2
        });
        clients[data.id1].emit('collided', {
            id1: data.id1,
            id2: data.id2
        });
    })

    // Returns the list of current players when requested
    socket.on('currentPlayers', function(){
        socket.emit('currentPlayers', players);
    });
});

/*function deleteTimedOutPlayers(plist){
    var keys = Object.keys(plist);
    for(var i=0; i<keys.length; i++){
        if(plist[keys[i]].lastTimeoutCheck < Date.now() - 150000){
            delete plist[keys[i]];
            io.emit('playerLeft', {id: keys[i]});
        }
    }
}*/

function getRandom(arr){
    return arr[parseInt(Math.random()*arr.length)];
}

const NAMES = ['scrapple', 'balrug', 'ewe', 'pandini', 'fuchs'];