let Victor = require('victor');

let Player = require('./Player.js').Player;

class World{
    constructor(io, room, origin, radius) {
        this.io = io;
        this.room = room || 'default';

        this.origin = origin || new Victor(0,0);
        this.radius = radius || 1000;

        this.subWorlds = {}; // worlds inside this one
        this.players = {}; // players
        this.hotspots = {}; // crumb emitters
        this.particles = {};
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
            console.log('Deleting player '+socket.id);
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

        this.checkCollisions(this.players,this.players);
        this.checkCollisions(this.players, this.particles);

        this.updateAll(this.players);
        this.updateAll(this.hotspots);
        this.updateAll(this.particles);
        this.updateAll(this.worlds);

        io.to(this.room).emit('update', {
            origin: this.origin,
            players: _this.players,
            hotspots: _this.hotspots,
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
                if(a !== b && a.isColliding(b)){
                    resolve(a,b);
                }
            }
        }

        return true;
    }
}

module.exports.World = World;