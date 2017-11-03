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
        FRICTION: 0.1,
    };

    global.COLLIDER = {
        NONE    : -1,
        CIRCLE  : 0,
        SQUARE  : 1,
    };

    global.PALETTE = {
        // From lightest to darkest
        BG      : ['#E8F7DD','#B2FCE1','#80FCE1','#0FF0D5','#26C9FA','#000'],
        PARTICLE: ['#FAA', '#AFA', '#AFF'],
        PLAYER  : ['#ECF081','#B3CC57','#FFBE40','#EF746F','#AB3E5B']
    };

    global.randomFromArray = (arr) => {
        return arr[parseInt(Math.random() * arr.length)];
    };

    global.NAMES = ['sesame', 'kiwi', 'paprika', 'oatmeal', 'pumpkin', 'pie', 'apple', 'cake',
                    'plum', 'almond', 'juice', 'bean', 'potato', 'tomato', 'sugar', 'sherry'];

    return true;
};

module.exports.loadGlobalConstants = loadGlobalConstants;