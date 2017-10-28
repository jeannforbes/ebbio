let Victor = require('victor');
let PBody = require('../PBody.js').PBody;
let Ability = new (require('./Abilities/Abilities.js').Abilities)();

const PLAYER_STATE = {
    'DEFAULT': 0,
    'INVULNERABLE': 1
};

class Player{
    constructor(id){
        this.id = id;
        this.state = PLAYER_STATE.DEFAULT;
        this.color = global.randomFromArray(global.PALETTE.PLAYER) || 'white';

        this.pbody = new PBody();
        this.speed = 20;
        this.maxSpeed = 10;

        // Event/input handlers
        this._onCollision = Ability.bite.bind(this);
        this._onClick = Ability.dash.bind(this);
        this._onRightClick = undefined;
    }

    get onCollision(){
        if(this._onCollision) return this._onCollision;
        return () => {};
    }

    get onClick(){
        if(this._onClick) return this._onClick;
        return () => {};
    }

    get onRightClick(){
        if(this._onRightClick) return this._onRightClick;
        return () => {};
    }

    moveToMouse(data){
        // Camera coords in world space
        let cameraLoc = new Victor(this.pbody.loc.x + data.w/2, this.pbody.loc.y + data.h/2);
        // Mouse coords in world space
        let mouseLoc = cameraLoc.clone().subtract(new Victor(data.x, data.y));
        // Vector from player to mouse
        let playerToMouse = this.pbody.loc.clone().subtract(mouseLoc);

        // If the mouse is close enough to the player, hold still
        /*if(playerToMouse.magnitude() < 10){
            this.pbody.vel.x = this.pbody.vel.y = 1;
            return;
        }*/

        // Vector from player to mouse
        let force = playerToMouse.normalize();
        force.x *= this.speed;
        force.y *= this.speed;
        this.pbody.applyForce(force);
    }

    update(){
        if(this.pbody.mass <= 0){
            this.pbody = new PBody();
            return;
        }
        this.pbody.move(this.maxSpeed);
        if(this.pbody.loc.magnitude() > 500) this.pbody.loc = new Victor(0,0);
    }
}

module.exports.Player = Player;