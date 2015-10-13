// make it extremely unlikely that this test unintentionally drops someone's DB

//TODO
// 1. BookSchema.index({ title: 1, author: 1 }, { unique: true })这种情况下title和author不能够重复

var uniqueId = 'c90b6960-0109-11e2-9595-00248c45df8a'
  , dbURI = 'mongodb://localhost/mongodb-wiper-test-' + uniqueId
  , expect = require('chai').expect
  , mongoose = require('mongoose')
  , ObjectIdSchema = mongoose.Schema.ObjectId
  , ObjectId = mongoose.Types.ObjectId
  , RequireNumberDummy = mongoose.model('DummyNumberRequired', new mongoose.Schema({
    a: Number,
    b: {type: Number, required: true},
    c: {type: Number, required: true, default: 2},
    d: {type: Number},
    e: {type: Number},
    f: {type: Number}
  }))
  , RequireStringDummy = mongoose.model('DummyStringRequired', new mongoose.Schema({
    a: Number,
    b: {type: String, required: true},
    c: {type: String, required: true, enum: ['hongbosb', 'shijiesb']}
  }))
  , RequireDateDummy = mongoose.model('DummyDateRequired', new mongoose.Schema({
    a: Number,
    b: {type: Date, required: true}
  }))
  , RequireObjectIdDummy = mongoose.model('DummyObjectIdRequired', new mongoose.Schema({
    a: Number,
    b: {type: ObjectIdSchema, required: true}
  }))
  , RequireBooleanDummy = mongoose.model('DummyBooleanRequired', new mongoose.Schema({
    a: Number,
    b: {type: Boolean, required: true}
  }))
  , dboperator = require('../lib/dboperator.js')

RequireNumberDummy.schema.index({d: 1, e: 1}, {unique: true})
RequireNumberDummy.schema.index({f: 1})

mongoose.connect(dbURI)

describe("Randomly fill required fields", function () {

  beforeEach(function (done) {
    dboperator.removeCollections([RequireStringDummy, RequireNumberDummy, RequireObjectIdDummy, RequireBooleanDummy, RequireDateDummy], function (err) {
      expect(err).not.to.exist()
      done()
    })
  })

  it("String, and make it works when type is enum", function (done) {
    dboperator.insertData(RequireStringDummy, [{a: 1}, {a: 2}], function (err) {
      expect(err).not.exist()
      RequireStringDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(2)
        expect(docs[0].b).to.be.a('string')
        expect(docs[0].c).to.be.a('string')
        expect(docs[0].b).not.to.equal(docs[1].b)
        done()
      })
    })
  })

  it("Number", function (done) {
    dboperator.insertData(RequireNumberDummy, [{a: 1, d: 9}, {a: 2}], function () {
      RequireNumberDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(2)
        expect(docs[0].d).to.equal(9);
        expect(docs[0].b).to.be.a('number')
        expect(docs[0].b).not.to.equal(docs[1].b)
        done()
      })
    })
  })

  it("Date", function (done) {
    dboperator.insertData(RequireDateDummy, [{a: 1}, {a: 2}], function (err) {
      expect(err).not.exist()
      RequireDateDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(2)
        expect(docs[0].b).to.be.a('date')
        expect(docs[0].b).not.to.equal(docs[1].b)
        done()
      })
    })
  })

  it("ObjectIdSchema", function (done) {
    dboperator.insertData(RequireObjectIdDummy, [{a: 1}, {a: 2}], function (err) {
      expect(err).not.exist()
      RequireObjectIdDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(2)
        expect(docs[0].b instanceof ObjectId).to.be.true()
        expect(docs[0].b).not.to.equal(docs[1].b)
        done()
      })
    })
  })

  it("BooleanSchema", function (done) {
    dboperator.insertData(RequireBooleanDummy, [{a: 1}, {a: 2}], function (err) {
      expect(err).not.exist()
      RequireBooleanDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(2)
        done()
      })
    })
  })

  it("Only fill required fields", function (done) {
    dboperator.insertData(RequireBooleanDummy, [{b: true}], function (err) {
      expect(err).not.exist()
      RequireBooleanDummy.find({}, function (err, docs) {
        expect(docs[0].a).not.to.exist()
        done()
      })
    })
  })

  it("Don't insert value when have default value", function (done) {
    dboperator.insertData(RequireNumberDummy, [{a: 1, d: 3, b: 2}], function (err) {
      expect(err).not.exist()
      RequireNumberDummy.find({}, function (err, docs) {
        expect(err).not.exist()
        expect(docs[0].c).to.equal(2)
        expect(docs[0].b).to.equal(2)
        done()
      })
    })
  })

  it("All interface fit for single object parameter", function (done) {
    dboperator.insertData(RequireNumberDummy, {a: 1}, function () {
      RequireNumberDummy.find({}, function (err, docs) {
        expect(docs).to.have.length(1)
        done()
      })
    })
  });

  it("Init data", function (done) {
    dboperator.insertData(RequireNumberDummy, [{a: 1}, {a: 2}], function () {
      dboperator.initData(RequireNumberDummy, [{a: 1}, {a: 2}], function () {
        RequireNumberDummy.find({}, function (err, docs) {
          expect(docs).to.have.length(2)
          done()
        })
      })
    })
  });

  it("Should insert random value for unique schema", function (done) {
    dboperator.insertData(RequireNumberDummy, [{a: 1}, {a: 2}], function (err) {
      expect(err).not.exist()
      RequireNumberDummy.find({}, function (err, docs) {
        expect(err).not.exist()
        expect(docs).to.have.length(2)
        expect(docs[0]).to.have.property('d')
          .and.to.not.equal(docs[1].d)
        expect(docs[0]).to.not.have.property('f')
        done()
      })
    })
  })

  it("Should support async function", function () {
    //noinspection JSUnresolvedFunction
    return dboperator
      .init(RequireNumberDummy, [{a: 1}, {a: 2}])
      .then(function () {
        return RequireNumberDummy.count().exec();
      })
      .then(function (count) {
        expect(count).to.equal(2);
        return dboperator
          .init(RequireNumberDummy)
          .then(function () {
            return RequireNumberDummy
              .count()
              .exec();
          });
      })
      .then(function (count) {
        return expect(count).to.equal(0);
      });
  });

  it.only("Should insert empty objects", function () {
    return dboperator
      .init(RequireBooleanDummy, new Array(3))
      .then(function () {
        return RequireBooleanDummy.count().exec();
      })
      .then(function (count) {
        expect(count).to.equal(3);
      })
  })
});

