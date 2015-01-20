var EventEmitter = require('events').EventEmitter,
    flatMerge = require('flat-merge'),
    deepEqual = require('deep-equal'),
    WM = require('./weakmap'),
    arrayProto = [],
    rootKey = '$';

var attachedEnties = new WM();

function emit(model, key, value, original){
    var references = attachedEnties.get(model);

    if(!references || !references.length){
        return;
    }

    for(var i = 0; i < references.length; i++){
        references[i].emit(key, value, original);
    }
}

function Enti(model){
    if(!model || (typeof model !== 'object' && typeof model !== 'function')){
        model = {};
    }
        
    this.attach(model);
}
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

    references.splice(references.indexOf(this._model),1);
};
Enti.prototype.get = function(key){
    return this._model[key];
};

Enti.prototype.set = function(key, value){
    var original = this._model[key];

    if(value && typeof value !== 'object' && value === original){
        return;
    }

    this._model[key] = value;

    emit(this._model, key, value, original);
};

module.exports = Enti;
