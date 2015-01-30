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

## When events are fired

```javsacript

var object = {},
    model = new Enti(object);

model.set('a', 1); // Triggers 'a', and '*'.

model.set('a', 2); // Triggers 'a', but not '*', since no keys changed.

model.set('b', 1); // Triggers 'b', and '*'