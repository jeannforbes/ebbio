const OBJ_TYPE = {
    PLAYER: 0,
    PARASITE: 1,
    SYMBIOTE: 2,
    PARTICLE: 3,
    EMITTER: 4,
}

class Camera{

    constructor(width, height, pid){
        this.loc = new Vector(0,0);
        this.w = width || 100;
        this.h = height || 200;

        this.debug = false;
        this.pid = pid;
    }

    render(ctx, data){
        if( !(data && prevData) ) return;

        let p = data.players[this.pid];
        let prevP = prevData.players[this.pid];
        if( !(p && prevP) ) return;

        let camLerp = lerp(
            new Vector(prevP.pbody.loc.x, prevP.pbody.loc.y),
            new Vector(p.pbody.loc.x, p.pbody.loc.y),
            1);
        this.centerOn(camLerp);

        ctx.save();
        this.drawBackground(ctx, data.world);
        this.drawAll(ctx, data.players, prevData.players, OBJ_TYPE.PARASITE);
        this.drawAll(ctx, data.emitters, prevData.players, OBJ_TYPE.EMITTER);

        let keys = Object.keys(data.emitters);
        for(let i=0; i<keys.length; i++){
            if(!prevData.emitters[keys[i]]) continue;
            this.drawAll(ctx, 
                data.emitters[keys[i]].particles,
                prevData.emitters[keys[i]].particles,
                OBJ_TYPE.PARTICLE);
        }

        this.drawAll(ctx, data.particles, prevData.particles, OBJ_TYPE.PARTICLE);

        if(this.debug) this.drawDebug(ctx, data);

        ctx.restore();
    }

    drawAll(ctx, map, prevMap, type){
        if(!prevMap) return;

        let keys = Object.keys(map);
        for(let i=0; i<keys.length; i++){
            let prevA = prevMap[keys[i]];
            let a = map[keys[i]];
            if(!prevA) continue;

            ctx.save();
            if(a.pbody){
                let prevLoc = this.worldToCamera(new Vector(prevA.pbody.loc.x, prevA.pbody.loc.y));
                let aLoc = this.worldToCamera(new Vector(a.pbody.loc.x, a.pbody.loc.y));
                let aLerped = lerp(aLoc, prevLoc, 0.2);
                ctx.translate(aLerped.x, aLerped.y);
            }

            switch(type){
                case OBJ_TYPE.PLAYER:
                    this.drawPlayer(ctx, a);
                    break;
                case OBJ_TYPE.PARASITE:
                    this.drawParasite(ctx, a);
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

    drawParasite(ctx, p){
        ctx.save();

        // Draw segments
        this.drawParasiteSegment(ctx, p.segment, p.pbody);

        ctx.globalAlpha = 1;

        // Draw main body
        ctx.fillStyle = p.color || 'white';
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass * p.pbody.density, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Draw jaw
        let jawLoc = new Vector(
            p.jaw.relativeLoc.x - p.pbody.loc.x, 
            p.jaw.relativeLoc.y - p.pbody.loc.y);
        ctx.fillStyle = p.jaw.color || 'white';
        ctx.beginPath();
        ctx.arc(jawLoc.x,jawLoc.y, p.jaw.pbody.mass * p.jaw.pbody.density, 0, Math.PI*2);
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

    drawParasiteSegment(ctx, segment, pbody){
        if(!segment) return;
        ctx.globalAlpha *= 0.75;
        console.log(segment.pbody.loc);
        let segLoc = new Vector(
            segment.pbody.loc.x - pbody.loc.x,
            segment.pbody.loc.y - pbody.loc.y);
        ctx.fillStyle = segment.color || 'white';
        ctx.beginPath();
        ctx.arc(segLoc.x,segLoc.y, segment.pbody.mass * segment.pbody.density, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        if(segment.next) this.drawParasiteSegment(ctx, segment.next, pbody);
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

const lerp = (pos, targetPos, frac) => {
    let lerpVec = pos.clone();
    lerpVec.x += (targetPos.x - lerpVec.x) * frac;
    lerpVec.y += (targetPos.y - lerpVec.y) * frac;
    return lerpVec;
}