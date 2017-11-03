let Victor = require('victor');

let World = require('./World.js').World;
let Player = require('./Player/Player.js').Player;
let Parasite = require('./Player/Parasite.js').Parasite;
let Symbiote = require('./Player/Symbiote.js').Symbiote;
let Particle = require('./Particle.js').Particle;

const GAME_STATES = {
    UNINITIALIZED: -1,
    PAUSED: 0,
    RUNNING: 1
};

class Game{

    constructor(io) {
        this.io = io;

        this.state = GAME_STATES.UNINITIALIZED;
        this.updateInterval = undefined;
        this.updateRate = 100;

        this.world = undefined; // yggdrasil confirmed

        // Enables client-side developer tools
        this.devMode = true;
    }

    initialize() {
        this.world = new World(this.io);
        this.state = GAME_STATES.PAUSED;

        let _this = this;
        this.io.on('connection', function(socket){
            
            // Handle client joining
            let player = new Player(socket.id);
            // Random username
            player.username = global.randomFromArray(global.NAMES);
            // Random spawn location
            let pLoc = new Victor(Math.random()-0.5, Math.random()-0.5);
            pLoc.x *= _this.world.radius;
            pLoc.y *= _this.world.radius;
            player.pbody.loc = pLoc;

            // Okay, let's make the player
            _this.world.players[player.id] = player;
            socket.join(_this.world.room, function(){ socket.leave(socket.id); });
            socket.emit('joined', {id: player.id});
            console.log(socket.id+' joined.');

            // Handle client mouse movement
            socket.on('mouseMove', (data) => {
                _this.world.clientMouseMoved(socket, data);
            });

            // Handle client mouse clicks
            socket.on('mouseClick', (data) => {
                _this.world.clientClicked(socket, data);
            });

            // Handle client disconnecting
            socket.on('disconnect', (data) => {
                console.log(socket.id+' left.');
                _this.world.clientDisconnect(socket, data);
            });

            /*
             *   DEV MODE, baby!
             */

             socket.on('addMass', (data) => {
                _this.world.findPlayerById(socket.id).pbody.mass += 1;
             });

             socket.on('subtractMass', (data) => {
                _this.world.findPlayerById(socket.id).pbody.mass -= 1;
             });

             socket.on('cyclePlayerType', (data) => {
                let w = _this.world.findWorldByPlayerId(socket.id);
                let p = w.players[socket.id];
                if(p.isParasite) w.players[socket.id] = new Symbiote();
                else if(p.isSymbiote) w.players[socket.id] = new Player();
                else w.players[socket.id] = new Parasite();
             });

        });
    }

    start() {
        if(this.state === GAME_STATES.PAUSED){
            console.log('Starting...');
            this.updateInterval = setInterval(this.update.bind(this), this.updateRate);
            this.state = GAME_STATES.RUNNING;
        }
    }

    pause() {
        clearInterval(this.updateInterval);
        this.updateInterval = undefined;
        this.state = GAME_STATES.PAUSED;
    }

    update() {
        if(this.state === GAME_STATES.RUNNING){
            this.world.update(this.io);
        }
    }

}

module.exports.Game = Game;