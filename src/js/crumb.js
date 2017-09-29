Crumb = new function(x,y,mass){
    this.id = crypto.randomBytes(20).toString('hex'),
    this.loc = new Victor(x,y);
    this.mass = 1;
};