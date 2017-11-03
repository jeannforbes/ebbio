let Victor = require('victor');

let Player = require('./Player.js').Player;
let PBody = require('../PBody.js').PBody;
let Ability = new (require('./Abilities/Abilities.js').Abilities)();

class Symbiote extends Player{
    constructor(id){
        super(id);

        this.jaw = new Jaw(this);

        this.baubles = [];

        this.isSymbiote = true;

        this.innerWorld;

    }

    grow(){
        let b = new Bauble(this);
        b.pbody.loc = this.pbody.loc.clone();
        this.baubles.push(b);

        this.pbody.mass /= 2;
        for(let i=0; i<this.baubles.length; i++){
            this.baubles[i].pbody.mass += this.pbody.mass/this.baubles.length * 0.2;
        }
    }

    update(){
        // Grow the symbiote at mass thresholds
        if(this.pbody.mass > 20){
            this.grow();
        }

        super.update();

        // Snap the jaw onto the front of the symbiote
        this.jaw.pbody.mass = this.pbody.mass/2;
        if(this.jaw.pbody.mass < 5) this.jaw.pbody.mass = 5;
        this.jaw.snapToFront();

        // Move the baubles
        for(let i=0; i<this.baubles.length; i++){
            for(let k=0; k<this.baubles.length; k++){
                if( i !== k) this.baubles[i].collideWithBauble(this.baubles[k]);
            }
            this.baubles[i].move(new Victor(this.pbody.loc.x, this.pbody.loc.y));
        }

        return;
    }
}

class Jaw{
    constructor(parent){
        this.parentBody = parent.pbody;
        this.pbody = new PBody();

        this.color = 'red';

        this.relativeLoc = this.parentBody.loc.clone();
    }

    snapToFront(){
        this.relativeLoc = this.parentBody.forward.clone();
        this.relativeLoc.x *= this.parentBody.size;
        this.relativeLoc.y *= this.parentBody.size;
        this.pbody.loc = this.relativeLoc.add(this.parentBody.loc);
    };
}

class Bauble{
    constructor(parent){
        this.pParent = parent.pbody;
        this.color = parent.color;

        this.pbody = new PBody();
    }

    move(loc){
        if(!loc) return;
        let aToB = loc.clone().subtract(this.pbody.loc);
        let dist = aToB.magnitude() - this.pParent.mass*this.pParent.density *1.25;
        aToB.normalize();
        aToB.x *= 10 * dist - 5;
        aToB.y *= 10 * dist - 5;
        if(dist > 5) this.pbody.applyForce(aToB);
        this.pbody.move(10);
    }

    collideWithBauble(b){
        if(this.pbody.isColliding(b.pbody)){
            this.pbody.collide(b.pbody);
        }
    }
}

module.exports.Symbiote = Symbiote;