var tape = require('tape'),
    Enti = require('../');

tape('get', function(t){
    t.plan(1);

    var model = new Enti({a:1});

    t.equal(model.get('a'), 1);
});

tape('set', function(t){
    t.plan(1);

    var model = new Enti({});

    model.set('a', 1);
    t.equal(model.get('a'), 1);
});

tape('events', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('a', function(value, previous){
        t.equal(value, 1);
        t.equal(previous, undefined);
    });

    model.set('a', 1);
});

tape('shared events', function(t){
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

tape('swapped reference', function(t){
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