let loaded = false;

// This should only ever be called ONCE
// at the start of the server
loadGlobalConstants = () =>{
    if(loaded) return false;
    loaded = true;

    global.CONSTANT = {

        GROWTH_THRESHOLDS: {
            PARASITE: [],
            SYMBIOTE: [],
        },
    };

    global.COLLIDER = {
        NONE    : -1,
        CIRCLE  : 0,
        SQUARE  : 1,
    };

    return true;
};

module.exports.loadGlobalConstants = loadGlobalConstants;