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

    model.on('a', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
    });

    model.set('a', 1);
});
/*
tape('so many events', function(t){
    t.plan(1);

    var model = {};

    var emits = 0;

    var start = Date.now();

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('a', function(){
            emits++;
        });
    }

    console.log('attach', Date.now() - start);

    Enti.set(model, 'a', 2);

    console.log('triggered', Date.now() - start);

    t.equal(emits, 10000);
});
*/
tape('events own keys modified', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('*', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
    });

    model.set('a', 1);
});

tape('shared events', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object),
        model2 = new Enti(object);

    model1.on('a', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
    });

    model2.set('a', 1);
});

tape('swapped reference', function(t){
    t.plan(2);

    var object1 = {},
        object2 = {},
        model1 = new Enti(object1),
        model2 = new Enti(object2);

    model1.on('a', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
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

    itemsModel.on('*', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 0);
    });
    model.on('items', function(value, event){
        t.fail();
    });
    model.on('*', function(value, event){
        t.fail();
    });
    model.on('0', function(value, event){
        t.fail();
    });

    model.attach(object);

    model.push('items', 5);
});

tape('push self', function(t){
    t.plan(4);

    var object = [],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 0);
    });
    model.on('0', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 0);
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

    itemsModel.on('*', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 1);
    });
    model.on('items', function(value, event){
        t.fail();
    });
    model.on('*', function(value, event){
        t.fail();
    });
    model.on('1', function(value, event){
        t.fail();
    });

    model.attach(object);

    model.insert('items', 5, 1);
});

tape('insert self', function(t){
    t.plan(4);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 1);
    });
    model.on('1', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 1);
    });

    model.attach(object);

    model.insert(5, 1);
});

tape('remove', function(t){
    t.plan(3);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.equal(value, 2);
        t.equal(event.key, 'length');
    });
    model.on('length', function(value, event){
        t.equal(value, 2);
    });

    model.attach(object);

    model.remove('1');
});

tape('update', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object);

    model1.on('*', function(value, event){
        t.pass('model1 emitted');
    }).attach(object);

    model1.on('a', function(value, event){
        t.pass('model1 emitted');
    }).attach(object);

    model1.update({
        a:'bla',
        b:'bla',
        c:'bla',
        d:'bla'
    });
});

tape('detach during event', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object);
        model2 = new Enti(object);

    model1.on('foo', function(value, event){
        t.pass('model1 emitted');
        model1.detach();
    }).attach(object);

    model2.on('foo', function(value, event){
        t.pass('model2 emitted');
    }).attach(object);

    model1.set('foo', 1);
});

tape('detach other during event', function(t){
    t.plan(1);

    var object = {},
        model1 = new Enti(object);
        model2 = new Enti(object);

    model1.on('foo', function(value, event){
        t.pass('model1 emitted');
        model2.detach();
    }).attach(object);

    model2.on('foo', function(value, event){
        t.pass('model2 emitted');
    }).attach(object);

    model1.set('foo', 1);
});

tape('deep get', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}});

    t.equal(model1.get('a.b'), 1);
});

tape('deep set', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}});

    model1.set('a.b', 2);

    t.equal(model1.get('a.b'), 2);
});

tape('deep events', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a);

    model1.on('a.b', function(value, event){
        t.equal(value, 2);
    });

    model2.set('b', 2);
});
/*
tape('so many deep events', function(t){
    t.plan(1);

    var model = {
            a: {
                b: {
                    c: 1
                }
            }
        };

    var emits = 0;

    var start = Date.now();

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('a.b.c', function(){
            emits++;
        });
    }

    console.log('attach', Date.now() - start);

    Enti.set(model, 'a.b.c', 2);

    console.log('triggered', Date.now() - start);

    t.equal(emits, 10000);
});
*/
tape('deep events wildcard', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a);

    model1.on('*.b', function(){
        t.pass();
    });

    model2.set('b', 2);
});

tape('any depth events wildcard', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{c:1}}}),
        model2 = new Enti(model1._model.a.b);

    model1.on('**.c', function(value, event){
        t.pass();
    });

    model2.set('c', 2);
});

tape('any depth events wildcard deeper', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{c:1}}}),
        model2 = new Enti(model1._model.a.b);

    model1.on('**.b.c', function(value, event){
        t.pass();
    });

    model2.set('c', 2);
});
/*
tape('so many wildcarded deep events', function(t){
    t.plan(1);

    var model = {
            a: {
                b: {
                    c: 1
                }
            }
        };

    var emits = 0;

    var start = Date.now();

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('**.c', function(){
            emits++;
        });
    }

    console.log('attach', Date.now() - start);

    Enti.set(model, 'a.b.c', 2);

    console.log('triggered', Date.now() - start);

    t.equal(emits, 10000);
});
*/
/*
tape('wildcarded deep events with so many objects', function(t){
    t.plan(1);

    var model = {};

    for(var i = 0; i < 10000; i++){
        model[i] = {
            b: {
                c: 1
            }
        };
    }

    var emits = 0;

    var start = Date.now();

    new Enti(model).on('**.c', function(){
        emits++;
    });

    console.log('attach', Date.now() - start);

    Enti.set(model, '1.b.c', 2);

    console.log('triggered', Date.now() - start);

    t.equal(emits, 1);
});
*/
tape('deep events', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a);
        model3 = new Enti(model1._model.a.b);

    model1.on('a.b.c', function(value, event){
        t.deepEqual(value, {
            c:2
        });
    });

    model2.set('b', {
        c:2
    });

    model3.set('c', 4);
});

tape('nan target', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{}}});

    model1.on('a.b.*', function(value, event){
        t.pass();
    });

    model1.set('a.b.c', NaN);
});

tape('Late updates', function(t){
    t.plan(3);

    var data = {
            data: {}
        },
        model1 = new Enti();

    model1.on('data.*.*', function(value, event){
        t.pass();
    });

    model1.attach(data);

    Enti.set(model1._model.data, 'count', 0);

    Enti.update(data, 'data', {
        count: 1,
        rows: [{}]
    });

    Enti.remove(model1._model.data.rows, 1);
});