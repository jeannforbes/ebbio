const OBJ_TYPE = {
    PLAYER: 0,
    PARTICLE: 1,
    EMITTER: 2,
}

class Camera{

    constructor(width, height, pid){
        this.loc = new Vector(0,0);
        this.w = width || 100;
        this.h = height || 200;

        this.debug = false;
        this.pid = pid;
        this.p = undefined;
    }

    render(ctx, data){
        if(!data) return;

        this.p = data.players[this.pid];
        if(!this.p) return;

        this.centerOn(new Vector(this.p.pbody.loc.x, this.p.pbody.loc.y));

        ctx.save();
        this.drawBackground(ctx, data.world);
        this.drawAll(ctx, data.players, OBJ_TYPE.PLAYER);
        this.drawAll(ctx, data.emitters, OBJ_TYPE.EMITTER);

        let keys = Object.keys(data.emitters);
        for(let i=0; i<keys.length; i++){
            this.drawAll(ctx, data.emitters[keys[i]].particles, OBJ_TYPE.PARTICLE);
        }

        this.drawAll(ctx, data.particles, OBJ_TYPE.PARTICLE);

        if(this.debug) this.drawDebug(ctx, data);

        ctx.restore();
    }

    drawAll(ctx, map, type){
        if(!prevData) return;

        let keys = Object.keys(map);
        for(let i=0; i<keys.length; i++){
            let a = map[keys[i]];

            ctx.save();
            if(a.pbody){
                let aLoc = this.worldToCamera(new Vector(a.pbody.loc.x, a.pbody.loc.y));
                ctx.translate(aLoc.x, aLoc.y);
            }

            switch(type){
                case OBJ_TYPE.PLAYER:
                    this.drawPlayer(ctx, a);
                    break;
                case OBJ_TYPE.PARTICLE:
                    this.drawParticle(ctx, a);
                    break;
                case OBJ_TYPE.EMITTER:
                    this.drawEmitter(ctx, a);
                    break;
                default:
                    console.log('Failed to draw '+a);
                    break;
            }
            ctx.restore();
        }
    }

    drawPlayer(ctx, p){

        ctx.save();

        ctx.fillStyle = p.color || 'white';
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass * p.pbody.density, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // DEBUG -- Draw forward vectors
        if(this.debug) {
            let forward = new Vector(p.pbody.vel.x, p.pbody.vel.y).normalize();
            forward.x *= p.pbody.mass * p.pbody.density;
            forward.y *= p.pbody.mass * p.pbody.density;
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(forward.x, forward.y);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    drawParticle(ctx, p){
        ctx.save();

        ctx.fillStyle = p.color || 'white';
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass * p.pbody.density, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass * p.pbody.density, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // DEBUG -- Draw forward vectors
        if(this.debug) {
            let forward = new Vector(p.pbody.vel.x, p.pbody.vel.y).normalize();
            forward.x *= p.pbody.mass * p.pbody.density;
            forward.y *= p.pbody.mass * p.pbody.density;
            ctx.lineWidth = ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(forward.x, forward.y);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    drawEmitter(ctx, p){
        ctx.save();

        ctx.fillStyle = 'blue';
        ctx.globalAlpha = 0.1;

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    drawBackground(ctx, world){

        let origin = this.worldToCamera(new Vector(world.origin.x, world.origin.y));

        ctx.save();

        // Base color
        ctx.fillStyle = '#9AF';
        ctx.fillRect(0,0,this.w, this.h);

        // Gradient
        let grd = ctx.createRadialGradient(
            origin.x, origin.y, 
            75, 
            origin.x, origin.y, 
            world.radius);
        grd.addColorStop(0, '#8AF');
        grd.addColorStop(0.5, '#48A');
        grd.addColorStop(1, '#013');
        ctx.fillStyle = grd;
        ctx.globalAlpha = 0.8;

        ctx.fillRect(0,0,this.w,this.h);

        ctx.restore();
    }

    centerOn(fLoc){
        if(fLoc) this.loc = new Vector(fLoc.x - this.w/2, fLoc.y - this.h/2);
    };

    drawDebug(ctx, data){
        let p = data.players[this.pid];
        if(!p){ console.log('No player id!  Turning debugging off.');
                this.debug = false;
                return; 
        }

    }

    /* HELPER FUNCTIONS */

    worldToCamera(v){
        return v.clone().subtract(this.loc);
    }

    cameraToWorld(v){
        return v.clone().add(this.loc);
    }

    lerp(pos, targetPos, frac){
        let lerpVec = pos.clone();
        lerpVec.x += (targetPos.x + lerpVec.x) * frac;
        lerpVec.y += (targetPos.y + lerpVec.y) * frac;
        return lerpVec;
    }
}

class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    add(v){
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v){
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    distance(v){
        return Math.sqrt(Math.pow(this.x-v.x,2) + (this.y-v.y,2));
    }

    magnitude(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    normalize(){
        let m = this.magnitude();
        if(m != 0){
            this.x /= m;
            this.y /= m;
        }
        return this;
    }

    clone(){
        return new Vector(this.x, this.y);
    }

}