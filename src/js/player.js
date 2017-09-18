/*
 *  Player.js
 *  
 *  Describes a user/player's attributes and methods
 */

Player = function(id, name, type){
	this.id = id;
	this.name = name || 'anonymous';
	this.type = type || 0;
	this.size = 25;

	this.loc = new Victor(0,0); // What's the vector, Victor?
	this.rot = 0;

	this.isColliding = false;
	this.color = 'white';
};

Player.prototype.move = function(loc, prevLoc){
	this.loc = new Victor(loc.x, loc.y);
	this.rot = 0; //this should calculate rotation
};

Player.prototype.draw = function(ctx) {
	ctx.save();

	ctx.fillStyle = this.color || 'white';
	
	ctx.beginPath();

	ctx.arc(this.loc.x, this.loc.y, this.size, 0, 2*Math.PI);
	ctx.translate(this.loc.x-20, this.loc.y+10);
	ctx.rotate(this.rot);

	ctx.fill();

	ctx.restore();
};

Player.prototype.collide = function(bool){
	this.isColliding = true;
	this.color = 'red';
}

Player.prototype.checkCollision = function(collider){
	var distBtwn = this.loc.distance(collider.loc);
	if(distBtwn < (this.size/2 + collider.size/2)){
		this.collide(true);
		return true;
	}
	return false;
}