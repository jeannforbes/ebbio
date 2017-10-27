const OBJ_TYPE = {
    PLAYER: 0,
    PARTICLE: 1,
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
        if(!data) return;

        let p = data.players[this.pid];
        if(!p) return;

        this.centerOn(new Vector(p.pbody.loc.x, p.pbody.loc.y));

        ctx.save();
        this.drawBackground(ctx, data.origin);
        this.drawAll(ctx, data.players, OBJ_TYPE.PLAYER);
        this.drawAll(ctx, data.particles, OBJ_TYPE.PARTICLE);

        if(this.debug) this.drawDebug(ctx, data);

        ctx.restore();
    }

    drawPlayer(ctx, p){
        ctx.save();

        ctx.fillStyle = p.color || 'white';
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    drawParticle(ctx, p){
        ctx.save();

        ctx.fillStyle = p.color || 'white';
        ctx.beginPath();
        ctx.arc(0, 0, p.pbody.mass, 0, Math.PI*2);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    drawAll(ctx, map, type){

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
                default:
                    console.log('Failed to draw '+a);
                    break;
            }
            ctx.restore();
        }
    }

    drawBackground(ctx, worldOrigin){

        let origin = this.worldToCamera(new Vector(worldOrigin.x, worldOrigin.y));

        ctx.save();

        // Base color
        ctx.fillStyle = '#9AF';
        ctx.fillRect(0,0,this.w, this.h);

        // Gradient
        let grd = ctx.createRadialGradient(origin.x, origin.y,75, origin.x, origin.y, 1000);
        grd.addColorStop(0, '#8AF');
        grd.addColorStop(0.5, '#48A');
        grd.addColorStop(1, '#013');
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,this.w,this.h);

        ctx.restore();
    }

    worldToCamera(v){
        return v.clone().subtract(this.loc);
    }

    cameraToWorld(v){
        return v.clone().add(this.loc);
    }

    centerOn(fLoc){
        if(fLoc) this.loc = new Vector(fLoc.x - this.w/2, fLoc.y - this.h/2);
        //if(fLoc) this.loc = fLoc.clone();
    };

    drawDebug(ctx, data){
        let p = data.players[this.pid];
        if(!p){
            console.log('No player id!  Turning debugging off.');
            this.debug = false;
            return;
        }

        let cameraLoc = this.worldToCamera(this.loc);
        let playerLoc = this.worldToCamera(new Vector(p.pbody.loc.x, p.pbody.loc.y));

        // Line from mouse's location to player's location
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(playerLoc.x, playerLoc.y);
        ctx.lineTo(cameraLoc.x, cameraLoc.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();


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

    clone(){
        return new Vector(this.x, this.y);
    }

}