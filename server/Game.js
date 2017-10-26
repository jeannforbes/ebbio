let Victor = require('victor');

let World = require('./World.js').World;
let Player = require('./Player.js').Player;
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
    }

    initialize() {
        this.world = new World(this.io);
        this.state = GAME_STATES.PAUSED;

        let _this = this;
        this.io.on('connection', function(socket){
            
            // Handle client joining
            let player = new Player(socket.id);
            player.pbody.loc = new Victor(100,100);
            _this.world.players[player.id] = player;
            socket.join(_this.world.room, function(){ socket.leave(socket.id); });
            socket.emit('joined', player);

            // Handle client mouse movement
            socket.on('mouseMove', (data) => {
                _this.world.playerMouseMoved(socket, data);
            });

            // Handle client mouse clicks
            socket.on('mouseClick', (data) => {
                _this.world.playerClicked(socket, data);
            });

            // Handle client disconnecting
            socket.on('disconnect', (data) => {
                console.log(socket.id+' disconnect detected');
                _this.world.playerDisconnect(socket, data);
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