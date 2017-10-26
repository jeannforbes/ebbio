let Victor = require('victor');

class PBody{
    constructor(loc, vel, accel, mass){
        this.loc = loc || new Victor(0,0);
        this.vel = vel || new Victor(0,0);
        this.accel = accel || new Victor(0,0);

        this.mass = mass || 10;
    }

    // F = m * a
    applyForce(force){
        let f = force.clone();
        f.x /= this.mass;
        f.y /= this.mass;
        this.accel.add(f);
    }

    move(limit){
        this.vel.add(this.accel);

        // Limit velocity
        if(this.vel.magnitude() > limit) 
            this.vel.normalize().multiply(new Victor(limit, limit));

        this.loc.add(this.vel);

        this.accel.x = this.accel.y = 0;
    }
}

module.exports.PBody = PBody;