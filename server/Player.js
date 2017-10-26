let PBody = require('./PBody.js').PBody;
let Victor = require('victor');

const PLAYER_STATE = {
    'DEFAULT': 0,
    'INVULNERABLE': 1
};

class Player{
    constructor(id){
        this.id = id;
        this.state = PLAYER_STATE.DEFAULT;
        this.color = 'white';

        this.pbody = new PBody();
        this.speed = 10;
        this.maxSpeed = 10;

        this.mouseLoc = new Victor(0,0);
    }

    moveToMouse(data){
        let cameraLoc = new Victor(this.pbody.loc.x + data.w/2, this.pbody.loc.y + data.h/2);
        let mouseLoc = cameraLoc.clone().subtract(new Victor(data.x, data.y));
        //let force = this.mouseLoc.clone().subtract(this.pbody.loc).clone().normalize();
        // What are the mouse coords in the world?
        // Coords from player to mouse
        let force = this.pbody.loc.clone().subtract(mouseLoc).normalize();
        force.x *= this.speed;
        force.y *= this.speed;
        this.pbody.applyForce(force);
    }

    update(){
        //if(this.mouseLoc) this.moveToMouse();
        this.pbody.move(this.maxSpeed);
    }

    isColliding(){
        return false;
    }
}

module.exports.Player = Player;