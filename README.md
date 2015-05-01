# enti

A super light-weight key-value 'observable' wrapper that works with references.

# usage

```
var Enti = require('enti');

var object = {
    foo: 'bar'
};

var model1 = new Enti(object);

model1.on('foo', function(foo){
    // object.foo changed. do something.
});

model1.set('foo', 'baz');
```

Enti knows about references too:


```
var model2 = new Enti(object);

model2.on('foo', function(foo){
    // object.foo changed. do something.
});

model1.set('foo', 'baz'); // sent into a different Enti, triggers events for all enti's
```

And you can use wildcards to watch for events:

Single level:
```
model1.on('*', function(foo){
    // object.<anything> changed. do something.
});

model1.set('foo', 'baz');
```

Any level:
```
model1.on('**', function(foo){
    // object.<anything>.<anything>.<anything>.<etc...> changed. do something.
});

model1.set('foo', 'baz');
```

Which can be combined with other keys:


```
model1.on('foo.*.bar', function(foo){
    // object.foo.<anything>.bar changed. do something.
});

model1.set('foo', 'baz', {
    bar:1
});
```

## API

### .get(key)

returns the value on the attached object at `key`

### .set(key, value)

sets the value on the attached object at `key` to `value`

### .remove(key)

`delete`s or `splice`s the `key` on the attached object

### .push([key,] value)

`push`s the `value` into the attached object, or the array at `key` on the attached object.

`push` will throw if the target of the push is not an array.

You can get the currently attached object using `'.'`

```javascript

model1.get('.') // -> object

```

## Lazy initialisation

If you want to create an Enti to be attached to data later, you can pass `false` to the constructor:

```
var unattachedModel = new Enti(false);
```

This creates a model that will not listen to or be able to cause events to fire, meaning lower cycles for other Enti's that are attached.