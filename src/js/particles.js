let Particle = function(id){
    this.id = id;

    this.lifetime = 5000; // in milliseconds
    this.mass = 5;

    this.type = 'circle';
    this.color = 'white';
    this.alpha = 1;
    this.solid = true;

    this.accel = new Victor(0,0);
    this.vel = new Victor(0,0);
    this.loc = new Victor(0,0);

    this.friction = 5;
};

Particle.prototype.move = function(force){
    this.vel.add(this.accel);
    this.loc.add(this.vel);

    this.accel = Victor(0,0);
};

// F = m * a, baby!
Particle.prototype.applyForce = function(force){
    force.x /= this.mass;
    force.y /= this.mass;
    this.accel.add(force);
};

Particle.prototype.draw = function(ctx){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.strokeWidth = 2;
    switch(this.type){
        case 'circle':
            ctx.beginPath();
            ctx.arc(0,0,this.mass,0,Math.PI*2);
            if(this.solid) ctx.fill();
            else ctx.stroke();
            ctx.closePath();
            break;
        case 'square':
            if(this.solid) ctx.fillRect(0,0,this.mass,this.mass);
            else ctx.strokeRect(0,0,this.mass,this.mass);
            break;
        case 'halo':
            // main circle
            ctx.beginPath();
            ctx.arc(0,0,this.mass,0,Math.PI*2);
            if(this.solid) ctx.fill();
            else ctx.stroke();
            // halo
            ctx.globalAlpha = this.alpha/2;
            ctx.beginPath();
            ctx.arc(0,0,this.mass*2,0,Math.PI*2);
            if(this.solid) ctx.fill();
            else ctx.stroke();
            ctx.closePath();
            break;
        default:
            break;

    }
    ctx.restore();
};