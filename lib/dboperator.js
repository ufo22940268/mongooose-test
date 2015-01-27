/**
 * Created by ccheng on 1/26/15.
 */
"use strict";

var random = require('./../random.js');
var async = require('async');
var SchemaDate = require('mongoose').Schema.Types.Date;
var SchemaObjectId = require('mongoose').Schema.ObjectId;
var SchemaBoolean = require('mongoose').Schema.Types.Boolean;

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

exports.insertData = function (model, docs, done) {

    var isInternal = function (name) {
        return name.length > 0 && name.charAt(0) == '_'
    };

    model.schema.eachPath(function (name, type) {
        if (!isInternal(name) && docs[name] === undefined) {
            docs.forEach(function (t) {
                if (t[name] == undefined && type.options['required'] !== undefined && type.options['default'] === undefined) {
                    t[name] = new RandomType(type).toRandom()
                }
            })
        }
    })

    model.create(docs, function (err) {
        done(err)
    })
}

exports.removeCollections = function (models, done) {
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
}
