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
        this.emitters[e.id] = e;

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
            if(a.pbody && b.pbody) a.pbody.collide(b.pbody);

            if(a.pbody.isBehind(b.pbody)){
                a.onCollision(b);
            }
        });

        // player v particle
        this.checkCollisions(this.players, this.particles, (a,b) => {
            if(!b.edible) return;
            console.log('particle collision');
            a.eatParticle(b);
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
                if(!a || !b) continue;
                if( a.id === b.id) continue;

                // Advanced player
                if(a.isParasite || a.isSymbiote){
                    // Check main body
                    if(a.jaw.pbody.isColliding(b.pbody)){
                        resolve(a,b);
                    // Check segments or baubles
                    } else if(b.isParasite){
                        if(this.checkParasiteCollision(a.jaw,b))
                            resolve(a,b);
                    } else if(a.isParasite && b.isSymbiote){
                        if(this.checkCollisionWithSymbiote(a.jaw,b))
                            resolve(a,b);
                    }
                }
                // Simple player
                else{
                    if(a.pbody.isColliding(b.pbody)){
                        resolve(a,b);
                    }
                    if(b.isParasite){
                        if(this.checkCollisionWithParasite(a,b)) 
                            resolve(a,b);
                    }
                    else if(b.isSymbiote){
                        if(this.checkCollisionWithSymbiote(a,b))
                            resolve(a,b);
                    }
                }

                /* DEPRECATED COLLISION CHECKS

                // If they have a jaw
                if( (a.isParasite || a.isSymbiote) && a.jaw.pbody.isColliding(b.pbody)){
                    resolve(a,b);
                }
                // If they don't have a jaw
                else if(a.pbody.isColliding(b.pbody)){
                    resolve(a,b);
                }
                // If they're a parasite with segments
                if(b.isParasite){
                    // Check segment collisions
                    let next = b.segment;
                    while(next){
                        if(a.pbody.isColliding(next.pbody)){ resolve(a, next); return; }
                        else{ next = next.next; }
                    }
                }
                // If they're a symbiote with baubles
                if(b.isSymbiote){
                    // Check bauble collisions
                    for(let i=0; i<b.baubles.length; i++){
                        if(a.pbody.isColliding(b.baubles[i].pbody)){ 
                            resolve(a, b.baubles[i]);
                        }
                    }
                }*/
            }
        }
    }

    checkCollisionWithParasite(a,b) {
        let next = b.segment;
        while(next){
            if(a.pbody.isColliding(next.pbody)) { return true; }
            else { next = next.next; }
        }
    }

    checkCollisionWithSymbiote(a,b){
        for(let i=0; i<b.baubles.length; i++){
            if(a.pbody.isColliding(b.baubles[i].pbody)){ return true; }
        }
    }
}

module.exports.World = World;