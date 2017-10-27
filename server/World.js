let Victor = require('victor');

let Player = require('./Player.js').Player;
let Emitter = require('./Emitter.js').Emitter;

class World{
    constructor(io, room, origin, radius) {
        this.io = io;
        this.room = room || 'default';

        this.origin = origin || new Victor(0,0);
        this.radius = radius || 1000;

        this.subWorlds = {}; // worlds inside this one
        this.players = {}; // players
        this.emitters = {}; // crumb emitters
        this.particles = {};

        let e = new Emitter(Date.now());
        e.pbody.loc.y = -200;
        this.emitters[e.id] = e;
    }

    /*
     *  CLIENT INPUT HANDLERS
     */

    // Applies force based on mouse location
    playerMouseMoved(socket, data){
        let sRoom = socket.rooms[Object.keys(socket.rooms)[0]];
        let pworld = this.findWorldByRoom(sRoom);
        if(pworld && pworld.players[socket.id]){
            let p = pworld.players[socket.id];
            p.moveToMouse(data);
        }
    }

    playerClicked(socket, data){
        console.log(socket.id + ' clicked.');
    }

    playerDisconnect(socket, data){
        let pworld = this.findWorldByPlayerId(socket.id);
        if(pworld && pworld.players[socket.id]){
            delete pworld.players[socket.id];
        }
    }

    /*
     *  HELPER METHODS
     */

     findWorldByRoom(room){
        if(this.room === room) return this;
        let keys = Object.keys(this.subWorlds);
        for(let i=0; i<keys.length; i++){
            return this.subWorlds[keys[i]].findWorldByRoom(room);
        }

        return false;
     }

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

        // Players & Players
        this.checkCollisions(this.players, this.players, (a,b) => {
            let aToB = b.pbody.loc.clone().subtract(a.pbody.loc);
            let dist = aToB.magnitude();
            aToB.normalize();
            aToB.x *= - (a.pbody.size + b.pbody.size - dist) *10;
            aToB.y *= - (a.pbody.size + b.pbody.size - dist) *10;
            a.pbody.applyForce(aToB);
        });

        // Players & Particles
        this.checkCollisions(this.players, this.particles, (a,b) => {
            console.log('particle collision');
            a.pbody.mass += b.pbody.mass;
            
            // Delete the particle
            delete this.particles[b.id];
        });

        let eKeys = Object.keys(this.emitters);
        for(let i=0; i<eKeys.length; i++){
            let e = this.emitters[eKeys[i]];
            this.checkCollisions(this.players, e.particles, (a,b) => {
                a.pbody.mass += b.pbody.mass;

                delete e.particles[b.id];
            });
        }

        this.updateAll(this.players);
        this.updateAll(this.emitters);
        this.updateAll(this.particles);
        this.updateAll(this.worlds);

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
            map[keys[i]].update();
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