// Node packages
let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let crypto = require('crypto');
let Victor = require('victor');

// Serverside code modules
require('./server/Global.js').loadGlobalConstants();

let Game = require('./server/Game.js').Game;
let World = require('./server/World.js').World;
let PBody = require('./server/PBody.js').PBody;
let Player = require('./server/Player.js').Player;
let Emitter = require('./server/Emitter.js').Emitter;
let Particle = require('./server/Particle.js').Particle;


// CONSTANTS
const PORT = process.env.PORT || 3000;

const startServer = () => {
    server.listen(PORT);

    app.get('/', (req, res) => { res.sendFile('index.html', { root: './client/' }); });
    app.get('/script.js', (req, res) => { res.sendFile('script.js', { root: './client/' }); });
    app.get('/style.css', (req, res) => { res.sendFile('style.css', { root: './client/' }); });

    let game = new Game(io);
    game.initialize();
    game.start();
};

startServer();