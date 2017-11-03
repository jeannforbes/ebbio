let Player = require('./Player.js').Player;
let PBody = require('../PBody.js').PBody;
let Ability = new (require('./Abilities/Abilities.js').Abilities)();

class Parasite extends Player{
    constructor(id){
        super(id);

        this.jaw = new Jaw(this);

        this.segment = new Segment(this);
        this.segment.color = this.color;

        this.isParasite = true;

    }

    grow(){
        if(this.segment){
            this.pbody.mass = parseInt(this.pbody.mass/2);
            this.segment.grow(this.pbody.mass);
        } else {
            this.segment = new Segment(this);
        }
    }

    update(){
        // Grow the parasite at mass thresholds
        if(this.pbody.mass > 20) this.grow();
        else if(this.pbody.mass > 100) this.grow();
        else if(this.pbody.mass > 200) this.grow();

        super.update();

        // Snap the jaw onto the front of the parasite
        this.jaw.pbody.mass = this.pbody.mass/2;
        if(this.jaw.pbody.mass < 5) this.jaw.pbody.mass = 5;
        this.jaw.snapToFront();

        // Watch out: danger noodle
        if(this.segment) this.segment.move(this.pbody.loc);

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

class Segment{
    constructor(prev){
        this.prev = prev.pbody;
        this.next = undefined;

        this.pbody = new PBody();

        this.color = 'red';
    }

    move(loc){

        if(!loc) return;
        let aToB = loc.clone().subtract(this.pbody.loc);
        let dist = aToB.magnitude() - this.prev.mass*this.prev.density *1.25;
        aToB.normalize();
        aToB.x *= 100 * dist;
        aToB.y *= 100 * dist;
        if(dist > 0) this.pbody.applyForce(aToB);
        this.pbody.move(dist);

        if(this.next) this.next.move(this.pbody.loc);
    }

    killNext(){
        delete this.next;
        console.log(this.next);
    }

    grow(mass){
        if(mass <= 0) return;

        this.pbody.mass += mass/4;
        if(this.pbody.mass > 30) this.pbody.mass = 30;

        if(this.next){
            this.next.grow(this.pbody.mass/4);
        } else {
            this.next = new Segment(this);
            this.next.color = this.color;
            this.next.pbody.loc = this.pbody.loc.clone();
            return;
        }

        return;
    }
}

module.exports.Parasite = Parasite;