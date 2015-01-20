# enti

A super light-weight key-value 'observable' wrapper that works with references.

# usage

```
var Enti = require('enti');

var model = {
    foo: 'bar'
};

var enti1 = new Enti(model);

enti1.on('foo', function(foo){
    // model.foo changed. do something.
});

enti1.set('foo', 'baz');
```

Enti knows about references too:


```
var enti2 = new Enti(model);

enti2.on('foo', function(foo){
    // model.foo changed. do something.
});

enti1.set('foo', 'baz'); // sent into a different Enti, triggers events for all enti's
```
