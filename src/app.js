var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Victor = require('victor');
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
app.get('/camera.js', function(req, res){ res.sendFile(__dirname + '/js/camera.js'); });
app.get('/world.js', function(req, res){ res.sendFile(__dirname + '/js/world.js'); });
app.get('/particles.js', function(req, res){ res.sendFile(__dirname + '/js/particles.js'); });

// Starting CONSTs

const MASS = 25;

// What does the server need to track?

var players = {};
var crumbs = {};
var clients = [];

var paletteCrumb   = ['#a8e6cf','#dcedc1','#ffd3b6','#ffaaa5','#ff8b94'];
var palettePlayer = ['#ee4035','#f37736','#fdf498','#7bc043','#0392cf'];

let clientUpdateInterval = setInterval(function(){
    io.emit('update', {players: players, crumbs: crumbs});
}, 100);

/*
 *  WEBSOCKETS, BABY!
 */

 var crumbMaker = setInterval(addCrumb, 2500);

io.on('connect', function(socket) {

    // Assign the new player an id
    var newPlayer = {
        name: getRandom(NAMES), // name
        id: socket.id,
        type: 0, // type
        joined: Date.now(),
        lastTimeoutCheck: Date.now(),
        loc: {x:0,y:0},
        color: palettePlayer[parseInt(Math.random()*palettePlayer.length)],
        mass: MASS,
        forward: {x:0, y:0},
    };
    players[newPlayer.id] = newPlayer;
    socket.emit('playerInfo', newPlayer); // let the new player know their info
    io.emit('newPlayer', newPlayer); // let everyone know there's a new player
    io.emit('currentCrumbs', crumbs);

    // Add a new client
    clients[newPlayer.id] = socket;

    // Update player location on move
    socket.on('playerMoved', function(data){
        if(!players[data.id]) return;

        if(data.loc) players[data.id].loc = {x: data.loc.x, y: data.loc.y};
        else players[data.id].loc = {x: 0, y: 0};
        if(data.forward) players[data.id].forward = {x: data.forward.x, y: data.forward.y};
        else players[data.id].forward = {x: 0, y: 0};
        io.emit('playerMoved', data);
    });

    socket.on('disconnect', function(data){
        delete players[socket.id];
        io.emit('playerLeft', {id: socket.id});
    });

    socket.on('bite', function(data){

        /*
         *  We will need some collision checking here to prevent cheating
         */

        //Check that these clients exist
        if(!clients[data.id] || !clients[socket.id]) return;

        var p1 = players[socket.id];
        var p2 = players[data.id];

        io.emit('bite', {biter: p1.id, bitee: p2.id});
    });

    socket.on('playerUpdate', function(data){
        players[socket.id] = data;
    });

    socket.on('crumbRemoved', function(data){
        delete crumbs[data.id];
        if(data.playerId && data.playerMass) players[data.playerId].mass = data.playerMass;
        io.emit('crumbRemoved', data);
    });

    socket.on('currentCrumbs', function(){
        socket.emit('currentCrumbs', crumbs);
    });

    // Returns the list of current players when requested
    socket.on('currentPlayers', function(){
        socket.emit('currentPlayers', players);
    });

    socket.on('crumbEaten', function(data){
        if(!players[data.id]) return;
        players[data.id].mass = data.mass;
        socket.emit('crumbEaten', data);
    });
});

function getRandom(arr){
    return arr[parseInt(Math.random()*arr.length)];
};

function populateCrumbs(num){
    for(let i=0; i<num; i++){
        addCrumb();
    }
}

function applyForce(obj, force){
    obj.accel = {
        x:obj.accel.x+force.x,
        y:obj.accel.y+force.y };
}

function moveObj(obj){
    obj.vel = {
        x:obj.accel.x+obj.vel.x,
        y:obj.accel.y+obj.vel.y };
    obj.loc = {
        x:obj.loc.x+obj.vel.x,
        y:obj.loc.y+obj.vel.y };

    obj.accel = {x:0,y:0};
}

function addCrumb(){
    let id = Date.now();
    let crumb = {
        id   : id,
        loc  : {x: 300, y: 0 },
        vel  : {x: 0, y: 0 },
        accel: {x: 0, y: 0},
        mass : parseInt(Math.random()*5)+2,
        color: paletteCrumb[parseInt(Math.random()*paletteCrumb.length,10)],
        type : 'halo',
    };
    crumbs[id] = crumb;

    applyForce(crumb, {x:Math.random()*2-1,y:Math.random()*2-1});
    setInterval(function(){ moveObj(crumb); }, 100);
    setTimeout(function(){ removeCrumb(id); }, 10000 + Math.random()*10000);

    io.emit('crumbAdded', crumb);
};

function removeCrumb(id){
    delete crumbs[id];
    io.emit('crumbRemoved', {id: id});
};

const NAMES = ['scrapple', 'balrug', 'ewe', 'pandini', 'fuchs'];