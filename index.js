var EventEmitter = require('events').EventEmitter,
    Set = require('es6-set');

function toArray(items){
    return Array.prototype.slice.call(items);
}

function lastKey(path){
    var match = path.match(/(?:.*\.)?([^.]*)$/);
    return match && match[1];
}

function matchDeep(path){
    return path.match(/\./);
}

var attachedEnties = new Set();

function leftAndRest(path){
    var match = matchDeep(path);
    if(match){
        return [path.slice(0, match.index), path.slice(match.index+1)];
    }
    return path;
}

function emitForEntiEvent(enti, model, target, event, path, key, value){
    if(!target || typeof target !== 'object'){
        return;
    }

    var path = leftAndRest(path);

    if(!Array.isArray(path)){
        if(path === key && model === target){
            enti.emit(event, value);
        }
        return;
    }

    var rootKey = path[0],
        rest = path[1],
        targetKey = lastKey(rest),
        anyKey = rootKey.match(/^\*.?/),
        anyDepth = rootKey.match(/^\*\*/);;

    if(targetKey !== key){
        return;
    }

    if(anyKey){
        for(modelKey in target){
            emitForEntiEvent(enti, model, target[modelKey], event, rest, key, value);
            if(anyDepth){
                emitForEntiEvent(enti, model, target[modelKey], event, rootKey + '.' + rest, key, value);
            }
        }
        return;
    }

    if(rootKey in target){
        emitForEntiEvent(enti, model, target[rootKey], event, rest, key, value);
    }
}

function emitForEnti(enti, model, key, value){
    if(!enti._events || !key){
        return;
    }

    if(model === enti._model && key in enti._events){
        enti.emit(key, value);
        return;
    }

    var keys = Object.keys(enti._events);

    for(var i = 0; i < keys.length; i++){
        emitForEntiEvent(enti, model, enti._model, keys[i], keys[i], key, value);
    }
}

function emit(model, key, value){
    attachedEnties.forEach(function (enti) {
        emitForEnti(enti, model, key, value);
    });
}

function Enti(model){
    if(!model || (typeof model !== 'object' && typeof model !== 'function')){
        model = {};
    }
        
    this.attach(model);
}
Enti.get = function(model, key){
    if(!model || typeof model !== 'object'){
        return;
    }

    if(key === '.'){
        return model;
    }

    var path = leftAndRest(key);
    if(Array.isArray(path)){
        return Enti.get(model[path[0]], path[1]);
    }

    return model[key];
};
Enti.set = function(model, key, value){
    if(!model || typeof model !== 'object'){
        return;
    }

    var path = leftAndRest(key);
    if(Array.isArray(path)){
        return Enti.set(model[path[0]], path[1], value);
    }

    var original = model[key];

    if(typeof value !== 'object' && value === original){
        return;
    }

    var keysChanged = !(key in model);

    model[key] = value;

    emit(model, key, value);

    if(keysChanged){
        emit(model, '*', model);
        if(Array.isArray(model)){
            emit(model, 'length', model.length);
        }
    }
};
Enti.push = function(model, key, value){
    if(!model || typeof model !== 'object'){
        return;
    }

    var target;
    if(arguments.length < 3){
        value = key;
        key = '.';
        target = model;
    }else{
        var path = leftAndRest(key);
        if(Array.isArray(path)){
            return Enti.push(model[path[0]], path[1], value);
        }

        target = model[key];
    }

    if(!Array.isArray(target)){
        throw 'The target is not an array.';
    }

    target.push(value);

    emit(target, target.length-1, value);

    emit(target, 'length', target.length);

    emit(target, '*', target);
};
Enti.insert = function(model, key, value, index){
    if(!model || typeof model !== 'object'){
        return;
    }


    var target;
    if(arguments.length < 4){
        index = value;
        value = key;
        key = '.';
        target = model;
    }else{
        var path = leftAndRest(key);
        if(Array.isArray(path)){
            return Enti.insert(model[path[0]], path[1], value, index);
        }

        target = model[key];
    }

    if(!Array.isArray(target)){
        throw 'The target is not an array.';
    }

    target.splice(index, 0, value);

    emit(target, index, value);

    emit(target, 'length', target.length);

    emit(target, '*', target);
};
Enti.remove = function(model, key, subKey){
    if(!model || typeof model !== 'object'){
        return;
    }

    var path = leftAndRest(key);
    if(Array.isArray(path)){
        return Enti.remove(model[path[0]], path[1], subKey);
    }
    
    // Remove a key off of an object at 'key'
    if(subKey != null){
        new Enti.remove(model[key], subKey);
        return;
    }

    if(key === '.'){
        throw '. (self) is not a valid key to remove';
    }

    if(Array.isArray(model)){
        model.splice(key, 1);
        emit(model, 'length', model.length);
    }else{
        delete model[key];
    }

    emit(model, '*', model);
};
Enti.move = function(model, key, index){
    if(!model || typeof model !== 'object'){
        return;
    }

    var path = leftAndRest(key);
    if(Array.isArray(path)){
        return Enti.move(model[path[0]], path[1], index);
    }
    
    var model = model;

    if(key === index){
        return;
    }

    if(!Array.isArray(model)){
        throw 'The model is not an array.';
    }

    var item = model[key];

    model.splice(key, 1);

    model.splice(index - (index > key ? 0 : 1), 0, item);

    emit(model, '*', model);
};
Enti.update = function(model, key, value){
    if(!model || typeof model !== 'object'){
        return;
    }
    
    var target,
        isArray = Array.isArray(value);

    if(arguments.length < 3){
        value = key;
        key = '.';
        target = model;
    }else{
        var path = leftAndRest(key);
        if(Array.isArray(path)){
            return Enti.update(model[path[0]], path[1], value);
        }

        target = model[key];

        if(target == null){
            model[key] = isArray ? [] : {};
        }
    }

    if(typeof value !== 'object'){
        throw 'The value is not an object.';
    }

    if(typeof target !== 'object'){
        throw 'The target is not an object.';
    }

    for(var key in value){
        target[key] = value[key];
        emit(target, key, value[key]);
    }
    
    if(isArray){
        emit(target, 'length', target.length);
    }

    emit(target, '*', target);
};
Enti.prototype = Object.create(EventEmitter.prototype);
Enti.prototype.constructor = Enti;
Enti.prototype.attach = function(model){    
    this.detach();
    attachedEnties.add(this);

    this._model = model;
};
Enti.prototype.detach = function(){
    if(attachedEnties.has(this)){
        attachedEnties.delete(this);
    }

    this._model = {};
};
Enti.prototype.get = function(key){
    return Enti.get(this._model, key);
};

Enti.prototype.set = function(key, value){
    return Enti.set(this._model, key, value);
};

Enti.prototype.push = function(key, value){
    return Enti.push.apply(null, [this._model].concat(toArray(arguments)));
};

Enti.prototype.insert = function(key, value, index){
    return Enti.insert.apply(null, [this._model].concat(toArray(arguments)));
};

Enti.prototype.remove = function(key, subKey){
    return Enti.remove.apply(null, [this._model].concat(toArray(arguments)));
};

Enti.prototype.move = function(key, index){
    return Enti.move.apply(null, [this._model].concat(toArray(arguments)));
};

Enti.prototype.update = function(key, index){
    return Enti.update.apply(null, [this._model].concat(toArray(arguments)));
};

module.exports = Enti;
