let Camera = function(width, height, world){
  this.loc = new Victor(0,0);
  this.world = world;

  this.w = width;
  this.h = height;

  this.defaultColor = 'black';

  this.focus = undefined;
};

Camera.prototype.render = function(ctx){
    this.clear(ctx);

    if(this.world){
        if(this.focus) this.centerOn(this.focus.loc);
        ctx.save();
        this.drawBG(ctx);
        this.drawCrumbs(ctx);
        this.drawPlayers(ctx);
        ctx.restore();
    }

    ctx.restore();
};

Camera.prototype.clear = function(ctx){
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,this.w, this.h);
    ctx.restore();
};

Camera.prototype.drawPlayers = function(ctx){
    let players = this.world.players;
    let keys = Object.keys(players);

    for(var i=0; i<keys.length; i++){
        let p = players[keys[i]];
        //if(this.isVisible(p)){
            let camLoc = this.worldToCamera(p.loc);
            ctx.save();
            ctx.translate(camLoc.x, camLoc.y);
            p.draw(ctx);
            ctx.restore();
       // }
    }
};

Camera.prototype.drawCrumbs = function(ctx){
    let crumbs = this.world.crumbs;
    let keys = Object.keys(crumbs);

    for(let i=0; i<keys.length; i++){
        let c = crumbs[keys[i]];
         //if(this.isVisible(c)){
             let camLoc = this.worldToCamera(c.loc);
             ctx.save();
             ctx.translate(camLoc.x, camLoc.y);
             c.draw(ctx);
             ctx.restore();
        // }
    }
};

Camera.prototype.drawBG = function(ctx) {
    ctx.save();

    // Base color
    ctx.fillStyle = '#9AF';
    ctx.fillRect(0,0,this.w, this.h);

    // Gradient
    let origin = this.worldToCamera(this.world.origin);
    let dist = this.getCenter().distance(origin);
    let grd = ctx.createRadialGradient(origin.x, origin.y, 75, origin.x, origin.y, this.world.radius);
    grd.addColorStop(1, this.world.paletteBG[0]);
    grd.addColorStop(0.5, this.world.paletteBG[1]);
    grd.addColorStop(0, this.world.paletteBG[2]);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,this.w,this.h);

    ctx.restore();
};

Camera.prototype.worldToCamera = function(loc){
    return loc.clone().subtract(this.loc);
};

Camera.prototype.cameraToWorld = function(loc){
    return loc.clone().add(this.loc);
};

Camera.prototype.isVisible = function(loc){
    if(   loc &&
        ( loc.x > this.loc.x ) && ( loc.x < this.loc.x + this.w ) &&
        ( loc.y > this.loc.y ) && ( loc.y < this.loc.y + this.h ) ){

        return true;
    }

    return false;
};

Camera.prototype.follow = function(obj){
    this.focus = obj;
};

Camera.prototype.centerOn = function(fLoc){
    if(fLoc) this.loc = new Victor(fLoc.x - this.w/2, fLoc.y - this.h/2);
    //console.log(this.loc);
};

Camera.prototype.getCenter = function(){
    let loc = this.loc.clone();
    return new Victor(loc.x - this.w/2, loc.y - this.h/2);
}