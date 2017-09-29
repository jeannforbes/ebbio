var Mouse = function(){
	this.loc = new Victor(0,0);
	this.prevLoc = this.loc;
};

Mouse.prototype.handleMove = function(e) {
	this.prevLoc = this.loc;
    this.loc = new Victor(e.clientX, e.clientY);
};