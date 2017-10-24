/*
 *  Player.js
 *  
 *  Describes a user/player's attributes and methods
 */

Player = function(id, name, type, color, root){
	this.id = id;
	this.name = name || 'anonymous';
	this.type = type || 0;
	this.mass = 25;
	this.maxMass = 60;
	this.maxSpeed = 5;
    
    this.rootRef = root;
    
	// What's the vector, Victor?
	this.accel = new Victor(0,0);
	this.vel = new Victor(0,0);
	this.loc = new Victor(0,0);
	this.forward = new Victor(0,0);
    
    // Add this player to its partition in the world
    //root.addObj(this);

	this.color = color;
};

Player.prototype.move = function(pos){
	// Get accel from mouse pos
	this.accel.add(pos.clone().subtract(this.loc).normalize());
	this.vel.add(this.accel);

	// Limit velocity
	if(this.vel.magnitude() > this.maxSpeed) 
		this.vel.normalize().multiply(new Victor(this.maxSpeed, this.maxSpeed));
	this.loc.add(this.vel);

	// Calculate forward vector
	var tempVel = this.vel.clone();
	tempVel.x *= 5; tempVel.y *= 5;
	this.forward = tempVel;

	// Reset accel after calculating forces
	this.accel = new Victor(0,0);

    // Partitioning voodoun
    //this.node.removeObj(this);
    //this.rootRef.addObj(this);
};

// What happens to me when bitten?
Player.prototype.takeDamage = function(){
	this.mass -= 5;
	if(this.mass < 0) this.reset(new Victor(0,0), 10);
};

Player.prototype.eat = function(crumb){
	if(this.mass < this.maxMass) this.mass += crumb.mass;
	this.color = crumb.color;
}

Player.prototype.reset = function(origin, mass) {
	if(!origin) origin = new Victor(0,0);
	if(!mass) mass = 10;

	this.loc = origin.clone();
	this.mass = mass;
};

// Draws the player to the canvas
Player.prototype.draw = function(ctx) {
	ctx.save();

	// style
	ctx.fillStyle = this.color || 'white';
	
	// Draw body
	ctx.beginPath();
	ctx.arc(0, 0, this.mass/2, 0, 2*Math.PI);
	ctx.fill();

	ctx.lineWidth = 5;

	// Draw forward vector
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(this.forward.x, this.forward.y);
	ctx.stroke();

	// transforms

	ctx.restore();
};

Player.prototype.isBehind = function(collider){
	if(    this.id == collider.id
		|| !collider.loc
		|| !collider.forward ) return false;

	var vecToLoc = collider.loc.clone().subtract(this.loc);
	var angleBtwn = this.forward.angle(vecToLoc);
	var distToTheirButt = vecToLoc.distance(this.forward);
	var distToYourButt = vecToLoc.distance(collider.forward);

	if( distToTheirButt < distToYourButt){
		return true;
	}
	return false;
}

// Returns true if colliding
Player.prototype.isColliding = function(collider){
	// Ignore collisions with yourself
	if(this.id == collider.id) return;

	// Check distance
	var distBtwn = this.loc.distance(collider.loc);
	if(distBtwn < (this.mass/2 + collider.mass/2)){
		return true;
	}
	return false;
};