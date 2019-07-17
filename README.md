# enti

A super light-weight key-value 'observable' wrapper that works with references.

# usage

```javascript
var Enti = require('enti');

var object = {
    foo: 'bar'
};

Enti.on(object, 'foo', function(foo){
    // object.foo changed. do something.
});

Enti.set(object, 'foo', 'baz');
```

Enti knows about references too:


```javascript
Enti.on(object, 'foo', function(foo){
    // object.foo changed. do something.
});

Enti.set(object, 'foo', 'baz'); // sent into a different Enti, triggers events for all enti's
```

And you can use wildcards to watch for events:

Single level:
```javascript
Enti.on(object, '*', function(value){
    // object.<anything> changed. do something.
    // value will be undefined, because the target path contains a wildcard.
});

Enti.set(object, 'foo', 'baz');
```

Any level:
```javascript
Enti.on(object, '**', function(value){
    // object.<anything>.<anything>.<anything>.<etc...> changed. do something.
    // value will be undefined, because the target path contains a wildcard.
});

Enti.set(object, 'foo', 'baz');
```

Which can be combined with other keys:


```javascript
Enti.on(object, 'foo.*.bar', function(value){
    // object.foo.<anything>.bar changed. do something.
    // value will be undefined, because the target path contains a wildcard.
});

Enti.set(object, 'foo', 'baz', {
    bar:1
});
```

And used with filters, to specify what data you are actually after:

```javascript
Enti.on(object, 'foo|*.bar', function(foo){
    // object.foo.<anything>.bar changed. do something.
    // model.get(left hand side of the pipe (|)) will be passed as the first parameter.
});

Enti.set(object, 'foo', 'baz', {
    bar:1
});
```

All handlers will be passed an event object with the object the event was raised on, and the key and value that caused the event:

```javascript
Enti.on(object, 'something', function(value, event){
    event.key === 'something';
    event.value === value;
    event.target === Enti.get(model1, '.');
});
```

## API

### .get(path)

returns the value on the attached object at `path`

You can get the currently attached object using `'.'`

```javascript

Enti.get(object, '.') // -> object

```

### .set(object, path, value)

sets the value on the attached object at `path` to `value`

### .remove(object, path)

`delete`s or `splice`s the `path` on the attached object

### .push(object, [path,] value)

`push`s the `value` into the attached object, or the array at `path` on the attached object.

`push` will throw if the target of the push is not an array.

### .update(object, [path,] value[, options])

`updates`s the target at `path` to match `value.

`options` can contain:

`strategy`: 'merge' (default) or 'morph'

`merge`: Merge `value` into target, retaining untouched keys in `target`
`morph`: Merge `value` into target, removing any keys that are not in `value`

### .move([path,] index)

`move`s the target at `path` to `index`

`move` will throw if the target of the move is not an array.

## Paths

The path syntax is fairly minimal, with only 4 special tokens

# . (dot/period)

Used to drill down into the object. eg:

```javascript
var bar = Enti.get(object, 'foo.bar');
```

is equivilent to

```javascript
var bar = object.foo.bar;
```

# * (Wildcard)

Will match events from any key on the object

# ** (Feralcard)

Recursive wildecard. Will match events form any key, and any sub-key  on the object.

# | (Filter)

Functionally identical to a dot/period, but separates the target of an event from the rest of the path.

Given the below event listener:

```
model.on('foo|bar.baz', function(target){...})
```

If the model raises an event on `foo.bar.baz`, Enti will `get('foo')`, and pass the result to the handler.

## Lazy initialisation

If you want to create an Enti to be attached to data later, you can pass `false` to the constructor:

```
var unattachedModel = new Enti(false);
```

This creates a model that will not listen to or be able to cause events to fire, meaning lower cycles for other Enti's that are attached.

You can check if a model is attached with the method `.isAttached()`
