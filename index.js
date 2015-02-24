var EventEmitter = require('events').EventEmitter,
    WM = require('./weakmap');

function toArray(items){
    return Array.prototype.slice.call(items);
}

var attachedEnties = new WM();

function emit(model, key, value){
    var references = attachedEnties.get(model);

    if(!references || !references.length){
        return;
    }

    var toEmit = references.slice();

    for(var i = 0; i < toEmit.length; i++){
        if(~references.indexOf(toEmit[i])){
            toEmit[i].emit(key, value);
        }
    }
}

function Enti(model){
    if(!model || (typeof model !== 'object' && typeof model !== 'function')){
        model = {};
    }
        
    this.attach(model);
}
Enti.get = function(model, key){
    if(key === '.'){
        return model;
    }
    return model[key];
};
Enti.set = function(model, key, value){
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
    var target;
    if(arguments.length < 3){
        value = key;
        key = '.';
        target = model;
    }else{
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
    var target;
    if(arguments.length < 4){
        index = value;
        value = key;
        key = '.';
        target = model;
    }else{
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
    var target,
        isArray = Array.isArray(value);

    if(arguments.length < 3){
        value = key;
        key = '.';
        target = model;
    }else{
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

    var references = attachedEnties.get(model);


    if(!references){
        references = [];
        attachedEnties.set(model, references);
    }


    references.push(this);

    this._model = model;
};
Enti.prototype.detach = function(){
    if(!this._model){
        return;
    }

    var references = attachedEnties.get(this._model);

    if(!references){
        return;
    }

    references.splice(references.indexOf(this),1);

    if(!references.length){
        attachedEnties.delete(this._model);
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
