let Victor = require('victor');
let PBody = require('./PBody.js').PBody;
let Particle = require('./Particle.js').Particle;

const DIRECTION = {
    LEFT    : Victor(-1, 0),
    UP      : Victor( 0, 1),
    RIGHT   : Victor( 1, 0),
    DOWN    : Victor( 0,-1),
    NONE    : Victor( 0, 0),
};

class Emitter{
    constructor(id){
        this.id = id;

        this.pbody = new PBody();

        this.rate = 30;
        this.volume = 5;
        this.direction = DIRECTION.NONE;
        this.spread = 50;
        this.speed = 5;

        this.lastEmission = 0;

        this.particles = {};
    }

    update(){
        this.lastEmission++;
        if(this.lastEmission > this.rate) this.emit();
        this.updateParticles();
    }

    updateParticles(){
        let keys = Object.keys(this.particles);
        for(var i=0; i<keys.length; i++){
            let p = this.particles[keys[i]];
            p.update();
            if(p.age > p.lifetime) delete this.particles[keys[i]];
        }
    }

    emit(){
        this.lastEmission = 0;
        for(let i=0; i<this.volume; i++){
            let p = new Particle(Date.now());
            p.pbody.loc = this.pbody.loc.clone();
            
            let force = this.direction.clone();
            force.add(new Victor(Math.random()-0.5, Math.random()-0.5));
            force.x *= this.speed;
            force.y *= this.speed;
            p.pbody.applyForce(force);

            this.particles[p.id] = p;
        }
    }
}

module.exports.Emitter = Emitter;