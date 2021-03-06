var test = require('tape'),
    Enti = require('../');

test('get', function(t){
    t.plan(1);

    var model = new Enti({a:1});

    t.equal(model.get('a'), 1);
});

test('get dot', function(t){
    t.plan(1);

    var model = new Enti({a:1});

    t.equal(model.get('.'), model._model);
});

test('get deep', function(t){
    t.plan(1);

    var model = new Enti({
        a:{
            b: 1
        }
    });

    t.equal(model.get('a.b'), 1);
});

test('get filter', function(t){
    t.plan(1);

    var model = new Enti({
        a:{
            b: 1
        }
    });

    t.equal(model.get('a|b'), model.get('a'));
});

test('get dot filter', function(t){
    t.plan(1);

    var model = new Enti({
        a:{
            b: 1
        }
    });

    t.equal(model.get('.|a'), model._model);
});

test('get number', function(t){
    t.plan(1);

    var model = new Enti([1,2,3]);

    t.equal(model.get(2), 3);
});

test('set', function(t){
    t.plan(1);

    var model = new Enti({});

    model.set('a', 1);
    t.equal(model.get('a'), 1);
});

test('set deep', function(t){
    t.plan(1);

    var model = new Enti({
        a: {}
    });

    model.set('a.b', 1);
    t.equal(model.get('a.b'), 1);
});

test('set filter', function(t){
    t.plan(1);

    var model = new Enti({
        a: {}
    });

    model.set('a|b', 1);
    t.equal(model.get('a'), 1);
});

test('set number', function(t){
    t.plan(1);

    var model = new Enti([1,2,3]);

    model.set(2, 4);
    t.equal(model.get(2), 4);
});

test('events', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('a', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
    });

    model.set('a', 1);
});

test('so many events', function(t){
    t.plan(1);

    var model = {};

    var emits = 0;

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('a', function(){
            emits++;
        });
    }

    Enti.set(model, 'a', 2);

    t.equal(emits, 10000);
});

test('events own keys modified', function(t){
    t.plan(2);

    var model = new Enti({});

    model.on('*', function(value, event){
        t.equal(event.value, 1);
        t.equal(event.key, 'a');
    });

    model.set('a', 1);
});

test('shared events', function(t){
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

test('attach to non-object', function(t){
    t.plan(1);

    t.throws(function(){
        var x = new Enti();
        x.attach('majiggers');
    });
});

test('swapped reference', function(t){
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

test('dual bind same data different wrapper', function(t){
    t.plan(2);

    var data = { foo: 1 },
        model1 = new Enti(),
        model2 = new Enti();

    model1.attach({ data: data });
    model1.on('data.foo', function(){
        t.pass();
    });

    model2.attach({ data: data });
    model2.on('data.foo', function(){
        t.pass();
    });

    model1.set('data.foo', 2);
});

test('push', function(t){
    t.plan(2);

    var object = {
            items: []
        },
        model = new Enti(object),
        itemsModel = new Enti(object.items);

    itemsModel.on('*', function(value, event){
        t.deepEqual(event.value, 5);
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

test('push self', function(t){
    t.plan(4);

    var object = [],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(event.value, 5);
        t.equal(event.key, 0);
    });
    model.on('0', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 0);
    });

    model.attach(object);

    model.push(5);
});

test('insert', function(t){
    t.plan(2);

    var object = {
            items: [1,2,3]
        },
        model = new Enti(object),
        itemsModel = new Enti(object.items);

    itemsModel.on('*', function(value, event){
        t.deepEqual(event.value, 5);
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

test('insert self', function(t){
    t.plan(4);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(event.value, 5);
        t.equal(event.key, 1);
    });
    model.on('1', function(value, event){
        t.deepEqual(value, 5);
        t.equal(event.key, 1);
    });

    model.attach(object);

    model.insert(5, 1);
});

test('move forward one', function(t){
    t.plan(1);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(object, [2,1,3]);
    });

    model.attach(object);

    model.move('0', 1);
});

test('move forward two', function(t){
    t.plan(1);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(object, [2, 3, 1]);
    });

    model.attach(object);

    model.move('0', 2);
});

test('move backward one', function(t){
    t.plan(1);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(object, [2, 1, 3]);
    });

    model.attach(object);

    model.move('1', 0);
});

test('move backward two', function(t){
    t.plan(1);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(object, [3, 1, 2]);
    });

    model.attach(object);

    model.move('2', 0);
});

test('move two from back', function(t){
    t.plan(1);

    var object = [1,2,3,4,5],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.deepEqual(object, [2,3,1,4,5]);
    });

    model.attach(object);

    model.move('0', -2);
});

test('remove', function(t){
    t.plan(3);

    var object = [1,2,3],
        model = new Enti(object);

    model.on('*', function(value, event){
        t.equal(event.value, 2);
        t.equal(event.key, 'length');
    });
    model.on('length', function(value, event){
        t.equal(value, 2);
    });

    model.attach(object);

    model.remove('1');
});

test('update', function(t){
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

test('update object to null', function(t){
    t.plan(1);

    var object = {
        x: {}
    }

    Enti.update(object, {
        x: null
    })

    t.deepEqual(object, {
        x: null
    })
});

test('update deep missing object', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object);

    model1.on('*.*', function(value, event){
        t.pass('model1 emitted *.*');
    }).attach(object);

    model1.on('a', function(value, event){
        t.pass('model1 emitted a');
    }).attach(object);

    model1.update('a', { b: 'foo' });
});

test('update cyclic', function(t){
    t.plan(1);

    var object = {},
        model1 = new Enti(object);

    object.object = object;

    model1.on('*', function(value, event){
        t.pass('model1 emitted');
    }).attach(object);

    model1.update(object);
});

test('update with dates', function(t){
    t.plan(1);

    var object = {
            a: new Date(2000,1,1)
        },
        model1 = new Enti(object);

    model1.update({
        a: new Date(2002,2,2)
    });

    t.deepEqual(model1.get('a'), new Date(2002,2,2))
});

test('update with morph strategy', function(t){
    t.plan(1);

    var object = {
            foo: [1, 2, 3]
        },
        model1 = new Enti(object);

    model1.update('foo', [1, 2], { strategy: 'morph' });

    t.deepEqual(model1.get('foo'), [1, 2]);
});

test('deep update with morph strategy', function(t){
    t.plan(2);

    var object = {
            foo: [1, {
                bar: 1
            }, 3]
        },
        model1 = new Enti(object);

    var mutatedObject = object.foo[1];

    model1.update('foo', [1, {
        baz: 2
    }], { strategy: 'morph' });

    t.deepEqual(model1.get('foo'), [1, {
        baz: 2
    }], 'Correct structure');

    t.equal(model1.get('foo.1'), mutatedObject, 'Reference retained');
});

test('set during event', function(t){
    t.plan(4);

    var object = {},
        model1 = new Enti(object),
        model2 = new Enti(object);

    model1.on('foo', function(value, event){
        t.pass('model1 emitted');
        model2.set('foo', 1);
    }).attach(object);

    model2.on('foo', function(value, event){
        t.pass('model2 emitted');
        model2.set('bar', 1);
    }).attach(object);

    model2.on('bar', function(value, event){
        t.pass('model2 emitted');
        model2.set('baz', 1);
    }).attach(object);

    model2.on('baz', function(value, event){
        t.pass('model2 emitted');
    }).attach(object);

    model1.set('foo', 1);
});

test('detach during event', function(t){
    t.plan(2);

    var object = {},
        model1 = new Enti(object),
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

test('detach other during event', function(t){
    t.plan(1);

    var object = {},
        model1 = new Enti(object),
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

test('detach all then event', function(t){
    t.plan(1);

    var object = {},
        model1 = new Enti(object);

    model1.on('foo', function(value, event){
        t.pass('model1 emitted');
        model1.detach();
    }).attach(object);

    Enti.set(object, 'foo', 1);
    Enti.set(object, 'foo', 2);
});

test('detach doesn\'t ruin sibling enti', function(t){
    t.plan(3);

    var object = {},
        model1 = new Enti(object),
        model2 = new Enti(object);

    model1.on('foo', function(value, event){
        t.pass('model1 emitted');
    }).attach(object);

    model2.on('foo', function(value, event){
        t.pass('model2 emitted');
    }).attach(object);

    Enti.set(object, 'foo', 1);

    model1.detach();

    Enti.set(object, 'foo', 2);
});

test('deep get', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}});

    t.equal(model1.get('a.b'), 1);
});

test('deep set', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}});

    model1.set('a.b', 2);

    t.equal(model1.get('a.b'), 2);
});

test('deep events', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a);

    model1.on('a.b', function(value, event){
        t.equal(value, 2);
    });

    model2.set('b', 2);
});

test('so many deep events', function(t){
    t.plan(1);

    var model = {
            a: {
                b: {
                    c: 1
                }
            }
        };

    var emits = 0;

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('a.b.c', function(){
            emits++;
        });
    }

    Enti.set(model, 'a.b.c', 2);

    t.equal(emits, 10000);
});


test('deep events wildcard', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a);

    model1.on('*.b', function(){
        t.pass();
    });

    model2.set('b', 2);
});

test('any depth events wildcard', function(t){
    t.plan(2);

    var model1 = new Enti({a:{b:{c:1}}}),
        model2 = new Enti(model1._model.a.b);

    model1.on('**', function(value, event){
        t.pass();
    });

    model2.set('c', 2);
    model2.set('d', 3);
});

test('any depth events wildcard 2', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{c:1}}}),
        model2 = new Enti(model1._model.a.b);

    model1.on('**.c', function(value, event){
        t.pass();
    });

    model2.set('c', 2);
    model2.set('d', 3);
});

test('any depth events wildcard deeper', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{c:1}}}),
        model2 = new Enti(model1._model.a.b);

    model1.on('**.b.c', function(value, event){
        t.pass();
    });

    model2.set('c', 2);
});

test('so many wildcarded deep events', function(t){
    t.plan(1);

    var model = {
            a: {
                b: {
                    c: 1
                }
            }
        };

    var emits = 0;

    function addEmit(){
        emits++;
    }

    for(var i = 0; i < 10000; i++){
        new Enti(model).on('**.c', addEmit);
    }

    Enti.set(model, 'a.b.c', 2);

    t.equal(emits, 10000);
});

test('wildcarded deep events with so many objects', function(t){
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

    new Enti(model).on('**.c', function(){
        emits++;
    });

    Enti.set(model, '1.b.c', 2);

    t.equal(emits, 1);
});

test('so many objects and so many emits', function(t){
    t.plan(1);

    var data = {};

    var emits = 0;
    var model = new Enti(data);

    for(var i = 0; i < 100; i++){
        var model = new Enti(data);
        for(var j = 0; j < 1000; j++){
            model.on(j, function(){
                emits++;
            });
        }
    }

    for(var i = 0; i < 1000; i++){
        Enti.set(data, i, i);
    }

    t.equal(emits, 1e5);
});

test('deep events 2', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:1}}),
        model2 = new Enti(model1._model.a),
        model3 = new Enti(model1._model.a.b);

    model1.on('a.b.c', function(value, event){
        t.equal(value, 2);
    });

    model2.set('b', {
        c:2
    });

    model3.set('c', 4);
});

test('nan target', function(t){
    t.plan(1);

    var model1 = new Enti({a:{b:{}}});

    model1.on('a.b.*', function(value, event){
        t.pass();
    });

    model1.set('a.b.c', NaN);
});

test('Late updates', function(t){
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

test('is attached', function(t){
    t.plan(2);

    var model = new Enti(false);

    t.notOk(model.isAttached());

    model.attach();

    t.ok(model.isAttached());
});

test('late attach events', function(t){
    t.plan(1);

    var model = new Enti(false);

    model.on('foo', t.pass);

    model.attach(model.get('.'));

    model.set('foo', 'bar');
});

test('event filters', function(t){
    t.plan(1);

    var model = new Enti({
        foo:{
            bar:1
        }
    });

    model.on('foo|bar', function(value){
        t.equal(value, model.get('foo'));
    });

    model.set('foo.bar', 2);
});

test('event filters wildcard', function(t){
    t.plan(1);

    var model = new Enti({
        foo:{
            bar:1
        }
    });

    model.on('foo|*', function(value){
        t.equal(value, model.get('foo'));
    });

    model.set('foo.bar', 2);
});

test('event filters deep wildcard', function(t){
    t.plan(1);

    var model = new Enti({
        foo:{
            bar:{
                baz: 1
            }
        }
    });

    model.on('foo|**', function(value){
        t.equal(value, model.get('foo'));
    });

    model.set('foo.bar.baz', 2);
});

test('event filters self deep wildcard', function(t){
    t.plan(1);

    var model = new Enti({
        foo:{
            bar:{
                baz: 1
            }
        }
    });

    model.on('.|**', function(data){
        t.equal(data, model.get('.'));
    });

    model.set('foo.bar.baz', 2);
});

test('set enti instance as data within enti', function(t){
    t.plan(2);

    var targetModel = new Enti({}),
        model = new Enti({
            foo: null
        });

    model.on('foo|**', function(foo){
        t.equal(foo, targetModel);
    });

    model.set('foo', targetModel);

    targetModel.set('bar', 'baz');
});

test('set enti instance as data of its self..', function(t){
    t.plan(2);

    var model = new Enti({
            foo: null
        });

    model.on('.|**', function(data){
        t.equal(data.foo, model);
    });

    model.set('foo', model);

    model.set('bar', 'baz');
});

test('isEnti', function(t){
    t.plan(1);

    var model = new Enti();

    t.ok(Enti.isEnti(model));
});

test('store shallow', function(t){
    t.plan(2);

    var person = {};

    var entiModel = new Enti(person);

    entiModel.on('firstName', function(firstName){
        t.ok(firstName, 'bob');
    });

    entiModel.on('surname', function(surname){
        t.ok(surname, 'down');
    });

    Enti.store(person, 'firstName', 'bob');

    Enti.store(person, 'surname', 'down');
});

test('store deep', function(t){
    t.plan(1);

    var person = {
        stuff: {}
    };

    var entiModel = new Enti(person);

    entiModel.on('stuff.majigger', function(majigger){
        t.ok(majigger, 'dooby');
    });

    Enti.store(person, 'stuff.majigger', 'dooby');
});

test('emit', function(t){
    t.plan(2);

    var model = {},
        entiModel = new Enti(model);

    entiModel.on('dooby', function(dooby, event){

        // Emitted value of dooby is 'dooby'.
        t.equal(event.value, 'dooby');

        // Actual value of dooby is undefined.
        t.equal(dooby, undefined);
    });

    Enti.emit(model, 'dooby', 'dooby');
});

test('destroy', function(t){
    t.plan(1);

    var model = {},
        entiModel = new Enti(model);

    entiModel.on('dooby', function(dooby, event){
        t.fail('should not recieve event');
    });

    entiModel.destroy();

    Enti.emit(model, 'dooby', 'dooby');

    t.pass('complete');
});

test('memory test, ~1GB total allocation, new objects', function(t){
    t.plan(1);

    var data = {};
    var model1 = new Enti(data);
    var model2 = new Enti(data);
    model1.on('.|**', () => {});
    model2.on('.|**', () => {});
    var iterations = 0;

    while(iterations++ < 1000) {
        var testData = {};
        for(var i = 0; i < 1000; i++){
            testData['key' + i] = 'Did you ever hear the tragedy of Darth Plagueis The Wise? I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.';
        }
        Enti.set(data, 'x', testData);
        new Enti(data);
    }

    t.pass('Didn\'t crash');
});

test('memory test, 1000 new keys', function(t){
    t.plan(1);

    var data = {};
    var model1 = new Enti(data);
    var iterations = 0;

    while(iterations++ < 100) {
        model1.on('key' + iterations, () => {});
    }

    for(var i = 0; i < 1000; i++){
        for(var j = 0; j < iterations; j++){
            model1.set('key' + j, i);
        }
    }

    t.pass('Didn\'t crash');
});

test('memory test, no leaks, should take under 10 seconds on pretty much any machine', function(t){
    t.plan(1);

    var data = {};
    var model1 = new Enti(data);
    model1.on('.|**', () => {});
    var iterations = 0;

    while(iterations++ < 1000000) {
        model1.set('key', Math.random());
    }

    t.pass('Didn\'t crash');
});

test('construct without new', function(t){
    t.plan(2);

    var model = Enti({});

    model.on('a', function(value, event){
        t.equal(value, 1);
        t.equal(event.key, 'a');
    });

    model.set('a', 1);
});

test('new observable api', function(t){
    t.plan(2);

    var data = {};

    var observable = Enti.create({
        'a': function(value, event){
            t.equal(value, 1);
            t.equal(event.key, 'a');
        }
    });

    observable.attach(data);

    Enti.set(data, 'a', 1);
});