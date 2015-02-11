/**
 * Created by ccheng on 1/26/15.
 */
"use strict";

var random = require('./../random.js');
var async = require('async');
var SchemaDate = require('mongoose').Schema.Types.Date;
var SchemaObjectId = require('mongoose').Schema.ObjectId;
var SchemaBoolean = require('mongoose').Schema.Types.Boolean;
var _ = require('lodash')

function RandomType(type) {
    this.type = type
    this.typeName = type.instance
}


RandomType.prototype.toRandom = function () {
    if (this.typeName === 'Number') {
        return random.randomNumber()
    } else if (this.typeName === 'String') {
        return random.randomString(this.type.options)
    } else if (this.type instanceof SchemaDate) {
        return random.randomDate()
    } else if (this.type instanceof SchemaBoolean) {
        return random.randomBoolean()
    } else if (this.type instanceof SchemaObjectId || this.type.instance == 'ObjectID') {
        return random.randomObjectId()
    }
}

var insertData = function (model, docs, done) {


    var isInternal = function (name) {
        return name.length > 0 && name.charAt(0) == '_'
    };

    if (!(docs instanceof Array)) {
        docs = [docs]
    }


    if (model.schema._indexes) {
        var indexKeys = _.flatten(model.schema._indexes.filter(function (t) {
            return _.any(t, 'unique')
        }).map(function (t) {
            return _.keys(t[0])
        }))
    }

    model.schema.eachPath(function (name, type) {
        if (!isInternal(name) && docs[name] === undefined) {
            _.forEach(docs, function (t) {
                if (t[name] == undefined && type.options['required'] !== undefined && type.options['default'] === undefined || _.includes(indexKeys, name)) {
                    t[name] = new RandomType(type).toRandom()
                }
            })
        }
    })

    model.create(docs, function (err) {
        done(err)
    })
};

exports.insertData = insertData


var removeCollections = function (models, done) {
    if (!(models instanceof Array)) {
        models = [models]
    }
    var tasks = models.map(function (model) {
        return function (callback) {
            model.remove({}, function (err) {
                callback(err)
            })
        }
    })

    async.parallel(tasks, function (err, results) {
        done(err)
    });
};
exports.removeCollections = removeCollections

var initData = function (model, docs, done) {
    removeCollections(model, function (err) {
        if (err) throw err
        else insertData(model, docs, done)
    })
}

exports.initData = initData
