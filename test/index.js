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

tape('events own keys modified', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('*', function(value, previous){
        t.deepEqual(value, {a:1});
        t.equal(previous, undefined);
    });

    model.set('a', 1);

    model.set('a', 2);
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

tape('push', function(t){
    t.plan(2);

    var object = {
            items: []
        },
        model = new Enti(object),
        itemsModel = new Enti(object.items);

    itemsModel.on('*', function(value, previous){
        t.deepEqual(value, [5]);
        t.equal(previous, undefined);
    });
    model.on('items', function(value, previous){
        t.fail();
    });
    model.on('*', function(value, previous){
        t.fail();
    });
    model.on('0', function(value, previous){
        t.fail();
    });

    model.attach(object);

    model.push('items', 5);
});

tape('push self', function(t){
    t.plan(4);

    var object = [],
        model = new Enti(object);

    model.on('*', function(value, previous){
        t.deepEqual(value, [5]);
        t.equal(previous, undefined);
    });
    model.on('0', function(value, previous){
        t.deepEqual(value, 5);
        t.equal(previous, undefined);
    });

    model.attach(object);

    model.push(5);
});

tape('insert', function(t){
    t.plan(2);

    var object = {
            items: [1,2,3]
        },
        model = new Enti(object),
        itemsModel = new Enti(object.items);

    itemsModel.on('*', function(value, previous){
        t.deepEqual(value, [1, 5, 2, 3]);
        t.equal(previous, undefined);
    });
    model.on('items', function(value, previous){
        t.fail();
    });
    model.on('*', function(value, previous){
        t.fail();
    });
    model.on('1', function(value, previous){
        t.fail();
    });

    model.attach(object);

    model.insert('items', 5, 1);
});

tape('insert self', function(t){
    t.plan(4);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, previous){
        t.deepEqual(value, [1, 5, 2, 3]);
        t.equal(previous, undefined);
    });
    model.on('1', function(value, previous){
        t.deepEqual(value, 5);
        t.equal(previous, undefined);
    });

    model.attach(object);

    model.insert(5, 1);
});

tape('remove', function(t){
    t.plan(2);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value){
        t.deepEqual(value, [1,3]);
    });
    model.on('length', function(value){
        t.equal(value, 2);
    });

    model.attach(object);

    model.remove('1');
});

tape('detach during event', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object);
        model2 = new Enti(object);

    model1.on('foo', function(value){
        t.pass('model1 emitted');
        model1.detach();
    }).attach(object);

    model2.on('foo', function(value){
        t.pass('model2 emitted');
    }).attach(object);

    model1.set('foo', 1);
});

tape('detach other during event', function(t){
    t.plan(1);

    var object = {},
        model1 = new Enti(object);
        model2 = new Enti(object);

    model1.on('foo', function(value){
        t.pass('model1 emitted');
        model2.detach();
    }).attach(object);

    model2.on('foo', function(value){
        t.pass('model2 emitted');
    }).attach(object);

    model1.set('foo', 1);
});