window.onload = function(){
	var socket;
	
	game = new Game(socket, document.querySelector('canvas'), new Mouse());
	game.init();
}