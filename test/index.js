require('es5-shim-sham');

var grape = require('grape'),
    Enti = require('../');

grape('get', function(t){
    t.plan(1);

    var model = new Enti({a:1});

    t.equal(model.get('a'), 1);
});

grape('set', function(t){
    t.plan(1);

    var model = new Enti({});

    model.set('a', 1);
    t.equal(model.get('a'), 1);
});

grape('events', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('a', function(value, previous){
        t.equal(value, 1);
        t.equal(previous, undefined);
    });

    model.set('a', 1);
});

grape('shared events', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object),
        model2 = new Enti(object);

    model1.on('a', function(value, previous){
        t.equal(value, 1);
        t.equal(previous, undefined);
    });

    model2.set('a', 1);
});

grape('swapped reference', function(t){
    t.plan(2);

    var object1 = {},
        object2 = {},
        model1 = new Enti(object1),
        model2 = new Enti(object2);

    model1.on('a', function(value, previous){
        t.equal(value, 1);
        t.equal(previous, undefined);
    });

    model1.attach(object2);

    model2.set('a', 1);
});

    var object1 = {},
        object2 = {},
        model1 = new Enti(object1),
        model2 = new Enti(object2);

    model1.on('a', function(value, previous){
        console.log(value, 1);
        console.log(previous, undefined);
    });

    model1.attach(object2);

    model2.set('a', 1);

// grape('lots of entis', function(t){
//     t.plan(2);

//     var object = {},
//         eventsFired = 0;

//     function makeEnti(){
//         var x = new Enti(object);

//         x.on('a', function(){
//             eventsFired++;
//         });
//     }

//     var start = Date.now();
//     for(var i = 0; i < 100000; i++){
//         makeEnti();
//     }
//     t.ok(Date.now() - start < 1000);

//     var model = new Enti(object);

//     var start = Date.now();
//     model.set('a', 1);
//     t.ok(Date.now() - start < 500);
// });