let World = function(size){
    this.origin = new Victor(0,0);
    this.radius = size;

    this.players = {};
    this.crumbs = {};
    this.hotspots = {}; // coming soon to a crumb-lover near you!
}

World.prototype.isInBounds = function(obj){
    if(obj.loc){
        let dist = obj.loc.clone().subtract(this.origin);
        if(dist < this.radius) return true;
    }
    return false;
}