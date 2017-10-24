let World = function(size){
    this.origin = new Victor(0,0);
    this.radius = size;

    this.players = {};
    this.crumbs = {};
    this.hotspots = {}; // coming soon to a crumb-lover near you!

    this.paletteBG = ['#0C1E29','#204F5F','#74A8A1','#CAE6D1','#EBEFCC'];
};

World.prototype.isInBounds = function(obj){
    if(obj.loc){
        let dist = obj.loc.clone().subtract(this.origin);
        if(dist < this.radius) return true;
    }
    return false;
};

World.prototype.moveCrumbs = function(){
    let keys = Object.keys(this.crumbs);

    for(let i=0; i<keys.length; i++){
        let c = this.crumbs[keys[i]];
        c.move();
    }
};