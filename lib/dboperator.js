/**
 * Created by ccheng on 1/26/15.
 */
"use strict";

var random = require('./../random.js');
var async = require('async');
var SchemaDate = require('mongoose').Schema.Types.Date;
var SchemaObjectId = require('mongoose').Schema.ObjectId;
var SchemaBoolean = require('mongoose').Schema.Types.Boolean;
var _ = require('lodash');
var Promise = require('bluebird');

function RandomType(type) {
  this.type = type;
  this.typeName = type.instance;
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
};

var prepareDocs = function (docs) {
  //If all elements in docs is undefined, then reinitialized docs.
  var docsWithValue = docs.filter(function (d) {
    return d !== undefined;
  });

  if (docsWithValue.length == 0) {
    var newDocs = [];
    for (var i = 0; i < docs.length; i++) {
      newDocs.push({});
    }

    return newDocs;
  }

  return docs;
};

var insertData = function (model, docs, done) {

  var isInternal = function (name) {
    return name.length > 0 && name.charAt(0) == '_'
  };

  if (!(docs instanceof Array)) {
    docs = [docs]
  }

  docs = prepareDocs(docs);

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
        //If docs contains undefined value. For example, if user pass in new Array(3). Then every element in array is undefined.
        if (t === undefined) t = {};

        if ((t[name] == undefined && type.options['required'] !== undefined && type.options['default'] === undefined)
          || (_.includes(indexKeys, name) && t[name] == undefined)) {
          t[name] = new RandomType(type).toRandom()
        }
      })
    }
  });

  model.create(docs, function (err, result) {
    var models = arguments[1];
    models.forEach(function (model) {
      return model.toObject();
    });
    models.unshift(err);

    done.apply(this, models);
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
  if (!model) {
    return done(new Error("Model is null"));
  }
  removeCollections(model, function (err) {
    if (err) throw done(err);
    if (docs) {
      insertData(model, docs, done)
    } else {
      done();
    }
  })
};

//Deprecated. Don't use.
exports.initData = initData;

exports.init = function (model, docs) {
  var initDataAsync = Promise.promisify(initData, null);

  if (!model) {
    return Promise.resolve(new Error("Model can't be null"));
  }
  return initDataAsync(model, docs);
};
