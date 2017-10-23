const WORLD_RADIUS = 1000;

var Game = function(socket, canvas, mouse){
	this.paletteBg = ['#848cff', '#88a2ff', '#97bdff', '#a9c9ff', '#c7dcff'];

	this.socket = socket;

	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');

	this.world;
	this.camera;

	this.myPlayer = new Player();

	this.mouse = mouse;
    
    // !!!! This should be renamed to something more descriptive
    //        i.e. "mapRoot" or "partitionsRoot"
    //this.root = new Node();

    this.gameState = 'PLAYING';
};

Game.prototype.init = function(){
	var _this = this;

	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;

	this.world = new World(WORLD_RADIUS);
	this.camera = new Camera(this.canvas.width, this.canvas.height, this.world);
	this.mouse.camera = this.camera;

    //setup quadtree
    //this.root.init(4096, 4096);
    
	this.socket = io.connect();

	this.socket.on('playerInfo', function(data){
		_this.myPlayer = new Player(data.id, data.name, data.type, data.color, this.root);
		_this.world.players[data.id] = _this.myPlayer;
		console.log('Connected with id: '+_this.myPlayer.id);

		_this.camera.follow(_this.myPlayer);
	});

	window.onbeforeunload = function(){
		this.socket.emit('playerLeft', {id: this.myPlayer.id});
	}

	this.socket.on('update', function(data){
		let players = _this.world.players;
		let crumbs = _this.world.crumbs;

		// Update players
		var keys = Object.keys(data.players);
		for(var i=0; i<keys.length; i++){
			var p = data.players[keys[i]];
			if(p.id === players.id) continue;
			players[p.id] = new Player(
											p.id,
											p.name,
											p.type,
											p.color);
			players[p.id].loc = new Victor(p.loc.x, p.loc.y);
			players[p.id].forward = new Victor(p.forward.x, p.forward.y);
		}

		// Update crumbs
		keys = Object.keys(data.crumbs);
		for(var i=0; i<keys.length; i++){
			var crumbData = data.crumbs[keys[i]];
			if(crumbData.id === crumbs.id) continue;
			crumbs[crumbData.id] = new Crumb(
											crumbData.id,
											new Victor(crumbData.loc.x, crumbData.loc.y),
											crumbData.mass);
		}
	});

	this.socket.on('newPlayer', function(data){
		if(!data) return;
		console.log('player joined: '+data);
		_this.world.players[data.id] = new Player(data.id, data.name, data.type, data.color);
	});

	this.socket.on('playerMoved', function(data){
		if(_this.world.players[data.id]){
			_this.world.players[data.id].loc = new Victor(data.loc.x, data.loc.y);
			_this.world.players[data.id].forward = new Victor(data.forward.x, data.forward.y);
		}
	});

	this.socket.on('playerLeft', function(data){
		delete _this.world.players[data.id];
	});

	this.socket.on('bite', function(data){
		if(data.bitee === _this.myPlayer.id){
			console.log(data.biter+' bit you!');
			_this.myPlayer.takeDamage();
			_this.sendPlayerUpdate(_this.myPlayer);
		}
		if(data.biter === _this.myPlayer.id) console.log('Bit '+data.bitee);
	});

	this.socket.on('crumbAdded', function(data){
		_this.world.crumbs[data.id] = new Crumb(data.id, data.loc, data.mass, this.root);
	});

	this.socket.on('crumbRemoved', function(data){
		delete _this.world.crumbs[data.id];
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
	if(this.mouse.loc.distance(this.myPlayer.loc) > 5){
		this.socket.emit('playerMoved', {
			id: this.myPlayer.id, 
			loc: {x: this.myPlayer.loc.x, y: this.myPlayer.loc.y},
			forward: {x: this.myPlayer.forward.x, y: this.myPlayer.forward.y},
		});
		this.myPlayer.move(this.mouse.loc);

		// When the mouse isn't moving, we still are
		if( this.mouse.loc.distance(new Victor(this.camera.w, this.camera.h)) > 11 ){
			this.mouse.loc.add(this.myPlayer.forward);
		}

		// Bound the player to a certain distance from world origin
		if(	this.myPlayer.loc.distance(this.world.origin) > this.world.radius){
			let vecToPlayer = this.myPlayer.loc.clone().subtract(this.world.origin);
			vecToPlayer.normalize();
			vecToPlayer.x *= this.myPlayer.maxSpeed;
			vecToPlayer.y *= this.myPlayer.maxSpeed;
			this.myPlayer.loc.subtract(vecToPlayer);
		}
	}
    
    //this.root.checkNumObjs();

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
	var keys = Object.keys(this.world.players);
	for(var i=0; i<keys.length; i++){
		let p = this.world.players[keys[i]];
		if(this.myPlayer.isColliding(p) && this.myPlayer.id != keys[i]){
			// Check who's biting whom
			if(this.myPlayer.isBehind(p)){
				this.socket.emit('bite', {
					id: keys[i]
				});
			}
		}
	}
}

Game.prototype.checkCrumbPlayerCollisions = function(){
	let crumbs = this.world.crumbs;

	let keys = Object.keys(crumbs);
	for(let i=0; i<keys.length; i++){
		if(this.myPlayer.isColliding(crumbs[keys[i]])){
			this.myPlayer.eat(crumbs[keys[i]]);
			this.socket.emit('crumbRemoved', {id: keys[i]});
			this.socket.emit('crumbEaten', {id: this.myPlayer.id, mass: this.myPlayer.mass});
		}
	}
}

Game.prototype.sendPlayerUpdate = function(data){
	this.socket.emit('playerUpdate', data);
};

/*
 *  CANVAS, DRAWING, ACTION!
 */

 // Main draw function
Game.prototype.draw = function(){
	this.camera.render(this.ctx);
};

// Bit of a misnomer, since it doesn't actually use the canvas
Game.prototype.drawEndGame = function() {
	var endDiv = document.createElement('div');
	var endP = document.createElement('p');

	endDiv.className = 'endDiv';
	endP.innerHTML = 'You were eaten!  Refresh the page to try again.';

	document.querySelector('#container').appendChild(endDiv);
	endDiv.appendChild(endP);
};
