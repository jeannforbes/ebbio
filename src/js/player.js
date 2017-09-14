/*
 *  Player.js
 *  
 *  Describes a user/player's attributes and methods
 */

Player = function(id, name, type){
	this.id = id;
	this.name = name || 'anonymous';
	this.type = type || 0;

	this.loc = new Victor(0,0); //this should use melonjs' me.Vector2d
	this.rot = 0;

	this.color = 'white';
};

Player.prototype.move = function(loc, prevLoc){
	this.loc = {x:loc.x, y:loc.y};
	this.rot = 0; //this should calculate rotation
};

Player.prototype.draw = function(ctx) {
	ctx.save();

	ctx.fillStyle = this.color;
	
	ctx.beginPath();

	ctx.arc(this.loc.x, this.loc.y, 25, 0, 2*Math.PI);
	ctx.translate(this.loc.x-20, this.loc.y+10);
	ctx.rotate(this.rot);

	ctx.fill();

	ctx.restore();
};