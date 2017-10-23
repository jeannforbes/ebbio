var Mouse = function(camera){
	this.loc = new Victor(0,0);
	this.prevLoc = this.loc;
    this.camera = camera;
};

Mouse.prototype.handleMove = function(e) {
    this.prevLoc = this.loc;

    if(this.camera) 
        this.loc = this.camera.cameraToWorld(new Victor(e.clientX, e.clientY));
    else 
        this.loc = new Victor(e.clientX, e.clientY);
};