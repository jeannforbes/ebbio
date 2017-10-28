let PBody = require('./PBody.js').PBody;

const PARTICLE_TYPES = {
    DEFAULT: 0,
    CIRCLE: 1,
    SQUARE: 2,
    HALO: 3
};

class Particle{
    constructor(id){
        this.id = id;
        this.type = PARTICLE_TYPES.DEFAULT;
        this.color = global.randomFromArray(global.PALETTE.PARTICLE) || 'white';
        this.edible = false;
        this.timeUntilEdible = 1;

        this.pbody = new PBody();
        this.pbody.mass = 5;
        this.maxSpeed = 5;

        this.age = 0;
        this.lifetime = 5000; // server ticks
    }

    update(){
        this.age++;
        this.pbody.move(5);

        if(this.age > this.timeUntilEdible) this.edible = true;
    }
}

module.exports.Particle = Particle;