Crumb = function(id,loc,mass, root){
    this.palette = ['#ffeead', '#ff6f69', '#ffcc5c', '#88d8b0'];

    this.id = id,
    this.loc = new Victor(loc.x,loc.y);
    this.color = this.palette[parseInt(Math.random()*this.palette.length)];
    this.mass = mass;
    
    this.rootRef = root;
    
    //root.addObj(this);
    
};

Crumb.prototype.draw = function(ctx){
    ctx.save();

    // style
    ctx.fillStyle = this.color || '#ffeead';
    
    // drawing
    ctx.beginPath();
    ctx.arc(this.loc.x, this.loc.y, this.mass, 0, 2*Math.PI);
    ctx.fill();

    // style
    ctx.globalAlpha = 0.5;

    // drawing
    ctx.beginPath();
    ctx.arc(this.loc.x, this.loc.y, this.mass*3, 0, 2*Math.PI);
    ctx.fill();

    // transforms
    ctx.translate(this.loc.x-20, this.loc.y+10);

    ctx.restore();
}

Crumb.prototype.destroy = function(){
    this.node.remove(this);
    delete this;
}