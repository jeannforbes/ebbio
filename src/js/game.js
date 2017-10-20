var Game = function(socket, canvas, mouse){
	this.paletteBg = ['#848cff', '#88a2ff', '#97bdff', '#a9c9ff', '#c7dcff'];

	this.socket = socket;

	this.canvas = canvas;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	this.ctx = canvas.getContext('2d');

	this.players = {};
	this.myPlayer = new Player();

	this.crumbs = {};

	this.mouse = mouse;

	this.gameState = 'PLAYING';
};

Game.prototype.init = function(){
	var _this = this;

	this.socket = io.connect();

	this.socket.on('playerInfo', function(data){
		_this.myPlayer = new Player(data.id, data.name, data.type, data.color);
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
			var playerData = data[keys[i]];
			if(playerData.id === _this.players.id) continue;
			_this.players[playerData.id] = new Player(
											playerData.id,
											playerData.name,
											playerData.type,
											playerData.color);
			_this.players[playerData.id].loc = new Victor(playerData.loc.x, playerData.loc.y);
		}
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

	this.socket.on('collided', function(data){
		if(data.dead){
			this.gameState = 'QUIT';
			this.socket.disconnect();
			this.drawEndGame();
		}

		_this.players[data.id].collide(data);
		_this.myPlayer.collide(data);
	});

	this.socket.on('currentCrumbs', function(data){
		var keys = Object.keys(data);
		for(var i=0; i<keys.length; i++){
			var crumbData = data[keys[i]];
			if(crumbData.id === _this.crumbs.id) continue;
			_this.crumbs[crumbData.id] = new Crumb(
											crumbData.id,
											new Victor(crumbData.loc.x, crumbData.loc.y),
											crumbData.mass);
		}
	});

	this.socket.on('crumbAdded', function(data){
		_this.crumbs[data.id] = new Crumb(data.id, data.loc, data.mass);
	});

	this.socket.on('crumbRemoved', function(data){
		delete _this.crumbs[data.id];
	});

	this.socket.on('crumbEaten', function(data){
		_this.players[data.id].mass = data.mass;
	});

	var _this = this;
	this.canvas.onmousemove = function(e){
		_this.mouse.handleMove(e);
		_this.socket.emit('moved');
	}

	this.start();
};

Game.prototype.start = function(){
	window.requestAnimationFrame(() => {this.tick();});
}

Game.prototype.stop = function(){
	window.cancelAnimationFrame();
}

Game.prototype.tick = function(timestamp){
	if(this.mouse.loc.distance(this.myPlayer.loc) > 10){
		this.socket.emit('playerMoved', {
			id: this.myPlayer.id, 
			loc: {x: this.myPlayer.loc.x, y: this.myPlayer.loc.y}
		});
		this.myPlayer.move(this.mouse.loc, this.mouse.prevLoc);
	}

	this.checkPlayerCollisions();
	this.checkCrumbPlayerCollisions();
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
				id: keys[i]
			});
		}
	}
}

Game.prototype.checkCrumbPlayerCollisions = function(){
	var keys = Object.keys(this.crumbs);
	for(var i=0; i<keys.length; i++){
		if(this.myPlayer.checkCollision(this.crumbs[keys[i]])){
			this.myPlayer.eat(this.crumbs[keys[i]]);
			this.socket.emit('crumbRemoved', {id: keys[i]});
			this.socket.emit('crumbEaten', {id: this.myPlayer.id, mass: this.myPlayer.mass});
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
	this.drawCrumbs();
};

// Clear the canvas to an ugly shade of puce
Game.prototype.clearCanvas = function(){
	this.ctx.save();

	this.ctx.fillStyle = this.paletteBg[this.paletteBg.length];
	this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

	this.ctx.restore();
};

// Draw the background
Game.prototype.drawBackground = function(){
	this.ctx.save();

	this.ctx.fillStyle = this.paletteBg[1];
	this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

	this.ctx.restore();
};

// Draw all the players we know about
Game.prototype.drawPlayers = function(){
	var keys = Object.keys(this.players);
	for(var i=0; i<keys.length; i++){
		this.players[keys[i]].draw(this.ctx);
	}
};

Game.prototype.drawCrumbs = function(){
	var keys = Object.keys(this.crumbs);
	for(var i=0; i<keys.length; i++){
		this.crumbs[keys[i]].draw(this.ctx);
	}
}

// Bit of a misnomer, since it doesn't actually use the canvas
Game.prototype.drawEndGame = function() {
	var endDiv = document.createElement('div');
	var endP = document.createElement('p');

	endDiv.className = 'endDiv';
	endP.innerHTML = 'You were eaten!  Refresh the page to try again.';

	document.querySelector('#container').appendChild(endDiv);
	endDiv.appendChild(endP);
};