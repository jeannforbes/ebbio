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
    }

    moveToMouse(data){
        // Camera coords in world space
        let cameraLoc = new Victor(this.pbody.loc.x + data.w/2, this.pbody.loc.y + data.h/2);
        // Mouse coords in world space
        let mouseLoc = cameraLoc.clone().subtract(new Victor(data.x, data.y));
        // Vector from player to mouse
        let playerToMouse = this.pbody.loc.clone().subtract(mouseLoc);

        // If the mouse is close enough to the player, hold still
        if(playerToMouse.magnitude() < 10){
            this.pbody.vel.x = this.pbody.vel.y = 0;
            return;
        }

        // Vector from player to mouse
        let force = playerToMouse.normalize();
        force.x *= this.speed;
        force.y *= this.speed;
        this.pbody.applyForce(force);
    }

    update(){
        this.pbody.move(this.maxSpeed);
    }
}

module.exports.Player = Player;