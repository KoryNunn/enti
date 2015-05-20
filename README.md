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
model1.on('*', function(value){
    // object.<anything> changed. do something.
});

model1.set('foo', 'baz');
```

Any level:
```
model1.on('**', function(value){
    // object.<anything>.<anything>.<anything>.<etc...> changed. do something.
});

model1.set('foo', 'baz');
```

Which can be combined with other keys:


```
model1.on('foo.*.bar', function(bar){
    // object.foo.<anything>.bar changed. do something.
});

model1.set('foo', 'baz', {
    bar:1
});
```

And used with filters, to specify what data you are actually after:

```
model1.on('foo|*.bar', function(foo){
    // object.foo.<anything>.bar changed. do something.
    // model.get(left hand side of the pipe (|)) will be passed as the first parameter.
});

model1.set('foo', 'baz', {
    bar:1
});
```

## API

### .get(path)

returns the value on the attached object at `path`

### .set(path, value)

sets the value on the attached object at `path` to `value`

### .remove(path)

`delete`s or `splice`s the `path` on the attached object

### .push([path,] value)

`push`s the `value` into the attached object, or the array at `path` on the attached object.

`push` will throw if the target of the push is not an array.

You can get the currently attached object using `'.'`

```javascript

model1.get('.') // -> object

```

## Paths

The path syntax is fairly minimal, with only 4 special tokens

# . (dot/period) 

Used to drill down into the object. eg:

```
var bar = get('foo.bar');
```

is equivilent to 

```
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