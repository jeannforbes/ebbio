/*
 *   All functions are meant to be wrapped in other functions when first hooked up to
 *     objects' input handlers and bound to that object.
 *
 *     TL;DR Do not call any of these functions directly.
 */

class PlayerAbility{
    constructor(){
        // Stare into the void
    }

    bite(target){
        if(target.pbody){
            console.log(this.biteDamage);
            target.pbody.mass -= this.biteDamage;
        }
    }

    dash(){
        
    }

}

module.exports.PlayerAbility = PlayerAbility;