var EventEmitter = require('events').EventEmitter,
    Set = require('es6-set');

function toArray(items){
    return Array.prototype.slice.call(items);
}

function lastKey(path){
    path+='';
    var match = path.match(/(?:.*\.)?([^.]*)$/);
    return match && match[1];
}

function matchDeep(path){
    path+='';
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

function isWildcardKey(key){
    return key.charAt(0) === '*';
}

function isFeralcardKey(key){
    return key === '**';
}

function emitForEventKey(enti, model, target, eventName, current, rest, key, value){
    if(!target || typeof target !== 'object'){
        return;
    }

    if(target !== model){
        return;
    }

    if(isWildcardKey(current)){
        enti.emit(eventName, target);
        return true;
    }

    if(current === key){
        enti.emit(eventName, enti.get(eventName === '*' ? '.' : eventName));
        return true;
    }
}

function emitForEventName(enti, model, eventName, key, value, lastTarget, rest){
    var target = lastTarget;
        
    if(arguments.length === 7 && !rest){
        return;
    }

    var keyIndex = -1;

    while(++keyIndex < rest.length){
        if(!target || typeof target !== 'object'){
            return;
        }

        var current = rest[keyIndex];

        if(isWildcardKey(current)){
            var wildcardKeys = Object.keys(target);
            for(var i = 0; i < wildcardKeys.length; i++){
                if(emitForEventName(enti, model, eventName, key, value, target[wildcardKeys[i]], rest.slice(keyIndex+1))){
                    return true;
                }
                if(isFeralcardKey(current)){
                    if(emitForEventName(enti, model, eventName, key, value, target[wildcardKeys[i]], ['**'].concat(rest.slice(keyIndex+1)))){
                        return true;
                    }
                }
            }
        }

        if(emitForEventKey(enti, model, target, eventName, current, rest.slice(keyIndex+1), key, value)){
            return true;
        }

        target = target[current];
    }
}

function emitForEnti(enti, model, key, value){
    if(!enti._events){
        return;
    }

    var eventNames = Object.keys(enti._events);

    for(var i = 0; i < eventNames.length; i++){
        if(!eventNames[i].match(/[*.]/) && model !== enti._model){
            continue;
        }
        emitForEventName(enti, model, eventNames[i], key, value, enti._model, eventNames[i].split('.'));
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
        emit(model, key);
    }
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
