let Victor = require('victor');

let Player = require('./Player/Player.js').Player;
let Particle = require('./Particle.js').Particle;
let Emitter = require('./Emitter.js').Emitter;

class World{
    constructor(io, room, origin, radius) {
        this.io = io;
        this.room = room || 'default';

        this.origin = origin || new Victor(0,0);
        this.radius = radius || 500;

        this.subWorlds = {}; // worlds directly inside this one
        this.players = {}; // players
        this.emitters = {}; // particle emitters
        this.particles = {}; // stray particles

        let e = new Emitter(Date.now());
        e.pbody.loc.y = -200;
        this.emitters[e.id] = e;

        let e2 = new Emitter(Date.now());
        e2.pbody.loc.y = 400;
        this.emitters[e2.id] = e2;

        global.rootWorld = this;
    }

    /*
     *  CLIENT INPUT HANDLERS
     */

    // Applies force based on mouse location
    clientMouseMoved(socket, data){
        this.findPlayerById(socket.id).moveToMouse(data);
    }

    clientClicked(socket, data){
        this.findPlayerById(socket.id).onClick(data);
    }

    clientRightClicked(socket, data){
        this.findPlayerById(socket.id).onRightClick(data);
    }

    clientDisconnect(socket, data){
        let pworld = this.findWorldByPlayerId(socket.id);
        if(pworld && pworld.players[socket.id]){
            delete pworld.players[socket.id];
        }
    }

    /*
     *  HELPER METHODS
     */

     findPlayerById(id){
        if(this.players[id]) return this.players[id];
        let keys = Object.keys(this.subWorlds);
        for(let i=0; i<keys.length; i++){
            return this.subWorlds[keys[i]].findPlayerbyId(id);
        }
     }

     findWorldByPlayerId(id){
        if(this.players[id]) return this;
        let keys = Object.keys(this.subWorlds);
        for(let i=0; i<keys.length; i++){
            return this.subWorlds[keys[i]];
        }
     }


    /*
     *  UPDATE LOGIC
     */

    update(io) {
        let _this = this;

        /* CHECK COLLISIONS */

        // player v player
        this.checkCollisions(this.players, this.players, (a,b) => {
            console.log(a.pbody);
            console.log(b.pbody);
            if(a.pbody && b.pbody) a.pbody.collide(b.pbody);

            if(a.pbody.isBehind(b.pbody)){
                a.onCollision(b);
            }
        });

        // player v particle
        this.checkCollisions(this.players, this.particles, (a,b) => {
            if(!b.edible) return;
            console.log('particle collision');
            a.pbody.mass += b.pbody.mass;
            delete this.particles[b.id];
        });

        // We have to check emitter particles separately
        let eKeys = Object.keys(this.emitters);
        for(let i=0; i<eKeys.length; i++){
            let e = this.emitters[eKeys[i]];
            this.checkCollisions(this.players, e.particles, (a,b) => {
                a.pbody.mass += b.pbody.mass;

                delete e.particles[b.id];
            });
        }

        /* UPDATE */

        this.updateAll(this.players);
        this.updateAll(this.emitters);
        this.updateAll(this.particles);
        this.updateAll(this.worlds);

        // send update to this world's players
        io.to(this.room).emit('update', {
            world: {
                origin: _this.origin,
                radius: _this.radius,
            },
            players: _this.players,
            emitters: _this.emitters,
            particles: _this.particles
        });

        return true;
    }

    updateAll(map){
        if(!map) return false;
        let keys = Object.keys(map);
        for(let i=0; i<keys.length; i++){
            let m = map[keys[i]];
            m.update();
        }

        return true;
    }

    checkCollisions(map1, map2, resolve) {
        let k1 = Object.keys(map1);
        let k2 = Object.keys(map2);
        for(let i=0; i<k1.length; i++){
            let a = map1[k1[i]];
            for(let j=0;j<k2.length;j++){
                let b = map2[k2[j]];
                if(!a || !b) return;
                if(a.id !== b.id && a.pbody.isColliding(b.pbody)){
                    console.log(a.id+' collides with '+b.id);
                    resolve(a,b);
                }
            }
        }

        return true;
    }
}

module.exports.World = World;