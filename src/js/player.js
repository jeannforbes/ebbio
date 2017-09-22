/*
 *  Player.js
 *  
 *  Describes a user/player's attributes and methods
 */

Player = function(id, name, type){
	this.id = id;
	this.name = name || 'anonymous';
	this.type = type || 0;
	this.mass = 25;
	this.maxSpeed = 100;

	// What's the vector, Victor?
	this.accel = new Victor(0,0);
	this.vel = new Victor(0,0);
	this.loc = new Victor(0,0);

	this.isColliding = false;
	this.color = 'white';
};

Player.prototype.move = function(pos, prevPos){
	this.accel = pos.clone().subtract(this.loc).normalize();
	this.vel.add(this.accel);
	if(this.vel.magnitude() > 5) this.vel.normalize().multiply(new Victor(5,5));
	this.loc.add(this.vel);
};

Player.prototype.collide = function(bool){
	this.isColliding = false;
	this.color = 'white';
	if(bool){
		this.isColliding = true;
		this.color = 'red';
	}
};

Player.prototype.draw = function(ctx) {
	ctx.save();

	// style
	ctx.fillStyle = this.color || 'white';
	
	// drawing
	ctx.beginPath();
	ctx.arc(this.loc.x, this.loc.y, this.mass, 0, 2*Math.PI);
	ctx.fill();

	// transforms
	ctx.translate(this.loc.x-20, this.loc.y+10);

	ctx.restore();
};

Player.prototype.checkCollision = function(collider){
	if(this.id == collider.id) return;
	var distBtwn = this.loc.distance(collider.loc);
	if(distBtwn < (this.mass + collider.mass)){
		this.collide(true);
		collider.collide(true);
		return true;
	}
	this.collide();
	collider.collide();
	return false;
};