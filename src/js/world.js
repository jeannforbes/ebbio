/*
    Protype of a game world
*/

World = function(){
    
    //world's divided into 9 sectors
    //top-left, top-middle, top-right
    //middle-left, middle-middle, middle-right
    //bottom-left, bottom-middle, bottom-right
    this.sectors = {};
    
    this.sectors["tl"] = [];
    this.sectors["tm"] = [];
    this.sectors["tr"] = [];
    
    this.sectors["ml"] = [];
    this.sectors["mm"] = [];
    this.sectors["mr"] = [];
    
    this.sectors["bl"] = [];
    this.sectors["bm"] = [];
    this.sectors["bl"] = [];
};

World.prototype.gen = function(width, height) {
    
    //size of each sector
    var sectorW = Math.floor(width/3);
    var sectorH = Math.floor(height/3);
    
    //fill a world
    for(var row = 0; row < height; row++) {
        for(var column = 0; column < width; column++) {
            if(row < sectorH) {
                if(column < sectorW) {
                    this.sectors["tl"].push(new Victor(column, row));
                } else if(column < 2 * sectorW) {
                    this.sectors["tm"].push(new Victor(column, row));
                } else {
                    this.sectors["tr"].push(new Victor(column, row));
                }
            } else if(row < 2 * sectorH) {
                if(column < sectorW) {
                    this.sectors["ml"].push(new Victor(column, row));
                } else if(column < 2 * sectorW) {
                    this.sectors["mm"].push(new Victor(column, row));
                } else {
                    this.sectors["mr"].push(new Victor(column, row));
                }
            } else {
                if(column < sectorW) {
                    this.sectors["bl"].push(new Victor(column, row));
                } else if(column < 2 * sectorW) {
                    this.sectors["bm"].push(new Victor(column, row));
                } else {
                    this.sectors["br"].push(new Victor(column, row));
                }
            }
        }
    }
};