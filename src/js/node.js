/* Origin is top-left corner of node
to confirm presense, subtract the origin from the position of the object
if the results are less than or equal to the width and height of the node, they're in

collision checking has you look at your sibling nodes and cousin nodes (check parent.children[0-3] besides the one that you're in, then check parent.parent.children[0-3] besides the one you're in)
level is used to remember how deep in the tree you are.
*/

Node = function() {
    this.parent = null;
    this.children = null;
    
    this.level = 0;
    this.width = 0;
    this.height = 0;
    
    this.objs = {};
    
    this.maxObj = 20;
    
    this.origin = new Victor(0,0);
}

Node.prototype.init = function(x, y) {
    this.level = 0;
    this.width = x;
    this.height = y;
    this.origin = new Victor(0,0);
}

Node.prototype.createChildren = function() {
    this.children = [];
    
    for(var i = 0; i < 4; i++) {
    
        var childTemplate = new Node();

        childTemplate.parent = this;
        childTemplate.width = this.width/2;
        childTemplate.height = this.height/2;
        childTemplate.level = this.level + 1;
        
        this.children[i] = childTemplate;
    }
    
    this.children[0].origin = this.origin.copy();
    this.children[1].origin = this.origin.copy().add(new Victor(this.width/2, 0));
    this.children[2].origin = this.origin.copy().add(new Victor(0, this.height/2));
    this.children[3].origin = this.origin.copy().add(new Victor(this.width/2, this.height/2));
    
    this.redistObjs();
}

Node.prototype.redistObj(){
    for(var i = 0; i < this.objs.length; i++) {
        for(var c = 0; c < children.length; c++) {
            if(this.children[c].contains(this.objs[i])) {
                this.objs[i].node = this.children[c];
            }
        }
    }
}

Node.prototype.isLeaf = function() {
    if(this.children) {
        return false;
    }
    
    return true;
}

Node.prototype.equals = function(other) {
    if(this.origin.equals(other.origin) && this.level === other.level) {
        return true;
    }
    
    return false;
}

Node.protype.contains = function(obj) {
    return obj.loc.x - this.orgin.x <= this.width && obj.loc.y - this.origin.y <= this.height;
}

Node.prototype.addObj = function(obj) {
    if(this.contains(obj)) {
        this.objs.push(obj);

        if(this.isLeaf()) {
            obj.node = this;
        } else {
            for(var i = 0; i < children.length; i++) {
                this.children[i].addObj(obj);
            }
        }
    }
}

Node.prototype.removeObj = function(obj) {
    var index = this.objs.findIndex(function() {
        return this.id === obj.id;
    });
    
    if(index > -1) {
        this.objs.splice(index, 1);
        
        if(parent) {
            parent.removeObj(obj);
        }
    }
    
}

//call from the top go down
Node.prototype.checkNumObjs = function(){
    if(this.objs.length >= this.maxObj && this.isLeaf()) {
        this.createChildren();
    } else if(this.objs.length <= this.maxObj && !this.isLeaf()) {
        for(var i = 0; i < this.objs.length; i++) {
            this.objs[i].node = this;
        }
        
        this.children = [];
    }
    
    if(!this.isLeaf()) {
        for(var c = 0; c < this.children.length; c++) {
            this.children[c].checkNumObjs();
        }
    }
}