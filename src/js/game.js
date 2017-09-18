var Game = function(socket, canvas, mouse){
	this.socket = socket;

	this.canvas = canvas;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	this.ctx = canvas.getContext('2d');

	this.players = {};
	this.myPlayer = new Player();

	this.mouse = mouse;
};

Game.prototype.init = function(){
	var _this = this;

	this.socket = io.connect();

	this.socket.on('playerInfo', function(data){
		_this.myPlayer = new Player(data.id, data.name, data.type);
		_this.players[data.id] = _this.myPlayer;
		console.log('Connected with id: '+_this.myPlayer.id);
	});

	window.onbeforeunload = function(){
		this.socket.emit('playerLeft', {id: this.myPlayer.id});
	}

	this.socket.emit('currentPlayers');
	this.socket.on('currentPlayers', function(data){
		var keys = Object.keys(data);
		for(var i=0; i<keys.length; i++){
			console.log(data[keys[i]]);
			if(data[keys[i]].id == _this.players.id) continue;
			_this.players[data[keys[i]].id] = new Player(data[keys[i]].id,data[keys[i]].name,data[keys[i]].type)
		}
		console.log(this.players);
	});

	this.socket.on('newPlayer', function(data){
		if(!data) return;
		console.log('player joined: '+data);
		_this.players[data.id] = new Player(data.id, data.name, data.type);
	});

	this.socket.on('playerMoved', function(data){
		if(_this.players[data.id]) _this.players[data.id].loc = data.loc;
	});

	this.socket.on('playerLeft', function(data){
		delete _this.players[data.id];
	});

	this.socket.on('timeoutCheck', function(data){
		_this.socket.emit('timeoutCheck', {id: _this.myPlayer.id});
	});

	this.socket.on('kicked', function(){
		console.log("KICKED");
		this.socket.emit('currentPlayers');
	});

	this.socket.on('collided', function(data){
		if(_this.myPlayer) _this.myPlayer.isColliding = true;
	});

	var _this = this;
	this.canvas.onmousemove = function(e){
		_this.mouse.handleMove(e);
		_this.socket.emit('moved');
	}

	window.requestAnimationFrame(() => {this.tick();});
};

Game.prototype.tick = function(timestamp){
	if(this.mouse.loc.distance(this.myPlayer.loc) > 10){
		this.socket.emit('playerMoved', {id: this.myPlayer.id, loc: this.myPlayer.loc});
		this.myPlayer.move(this.mouse.loc);
	}

	this.checkPlayerCollisions();
	this.draw();

	// Which browsers is this supported for?
	window.requestAnimationFrame(() => {this.tick();});
};

/*
 *  GAAAAME LOGIC
 */

Game.prototype.checkPlayerCollisions = function(){
	var keys = Object.keys(this.players);
	for(var i=0; i<keys.length; i++){
		if(this.myPlayer.checkCollision(this.players[keys[i]]) && this.myPlayer.id != keys[i]){
			this.socket.emit('collision', {
				id1: this.myPlayer.id,
				id2: keys[i]
			});
		}
	}
}

/*
 *  CANVAS, DRAWING, ACTION!
 */

 // Main draw function
Game.prototype.draw = function(){
	this.clearCanvas();
	this.drawBackground();
	this.drawPlayers();
};

// Clear the canvas to an ugly shade of puce
Game.prototype.clearCanvas = function(){
	this.ctx.save();

	this.ctx.fillStyle = "#cc8899";
	this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

	this.ctx.restore();
};

// Draw the background
Game.prototype.drawBackground = function(){
	this.ctx.save();

	this.ctx.fillStyle = "black"
	this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

	this.ctx.restore();
};

// Draw all the players we know about
Game.prototype.drawPlayers = function(){
	var keys = Object.keys(this.players);
	for(var i=0; i<keys.length; i++){
		var color = 'white';
		if(this.players[keys[i]].isColliding) color = 'red';
		this.players[keys[i]].draw(this.ctx, color);
	}
};