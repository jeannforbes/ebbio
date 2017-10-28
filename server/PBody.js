let Victor = require('victor');

class PBody{

    constructor(loc, vel, accel, mass){
        this.loc = loc || new Victor(0,0);
        this.vel = vel || new Victor(0,0);
        this.accel = accel || new Victor(0,0);

        this.mass = mass || 10;
        this.density = 1;

        this.collider = global.COLLIDER.CIRCLE;

    }

    get size(){ return this.mass * this.density; }
    get forward(){ return this.vel.clone().normalize(); }

    // F = m * a
    applyForce(force){
        let f = force.clone();
        f.x /= this.mass * 0.25;
        f.y /= this.mass * 0.25;
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

    collide(b){
        let aToB = b.loc.clone().subtract(this.loc);
        let dist = aToB.magnitude();
        aToB.normalize();
        aToB.x *= - (this.size + b.size - dist) * 10;
        aToB.y *= - (this.size + b.size - dist) * 10;
        this.applyForce(aToB);
    }

    isColliding(pb){
        switch(pb.collider){
            case COLLIDER.CIRCLE:
                let dist = this.loc.distance(pb.loc);
                if(dist < this.size + pb.size) return true;
                return false;
                break;
            case COLLIDER.SQUARE:
                // Unimplemented
                break;
            default:
                break;
        }
    }

    isBehind(pb){
        if(!this.isFacing(pb, 20)) return false;

        // Distance from your front to their loc
        let distA = this.forward.distance(pb.loc);

        // Distance from their front to your loc
        let distB = pb.forward.distance(this.loc);

        if(distA > distB) return true;
        return false;
    }

    isFacing(pb, tolerance){
        if(!tolerance) tolerance = 10;

        let angle = this.loc.dot(pb.loc);
        if(90 - angle < tolerance) return true;
        else return false;

    }
}

module.exports.PBody = PBody;