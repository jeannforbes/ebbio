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

        this.pbody = new PBody();
        this.size = this.pbody.mass;
    }

    isColliding(){
        return false;
    }
}

module.exports.Particle = Particle;