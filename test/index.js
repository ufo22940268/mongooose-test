// make it extremely unlikely that this test unintentionally drops someone's DB
var uniqueId = 'c90b6960-0109-11e2-9595-00248c45df8a'
    , dbURI = 'mongodb://localhost/mongodb-wiper-test-' + uniqueId
    , expect = require('chai').expect
    , mongoose = require('mongoose')
    , ObjectIdSchema = mongoose.Schema.Types.ObjectId
    , ObjectId = mongoose.Types.ObjectId
    , RequireNumberDummy = mongoose.model('DummyNumberRequired', new mongoose.Schema({
        a: Number,
        b: {type: Number, required: true}
    }))
    , RequireStringDummy = mongoose.model('DummyStringRequired', new mongoose.Schema({
        a: Number,
        b: {type: String, required: true}
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
    , dboperator = require('../dboperator.js')

mongoose.connect(dbURI)

describe("Randomly fill required fields", function () {

    before(function (done) {
        dboperator.removeCollections([RequireStringDummy, RequireNumberDummy, RequireObjectIdDummy, RequireBooleanDummy], function (err) {
            expect(err).not.to.exist()
            done()
        })
    })

    it("String", function (done) {
        dboperator.insertData(RequireStringDummy, [{a: 1}, {a: 2}], function () {
            RequireStringDummy.find({}, function (err, docs) {
                expect(docs).to.have.length(2)
                expect(docs[0].b).to.be.a('string')
                expect(docs[0].b).not.to.equal(docs[1].b)
                done()
            })
        })
    })

    it("Number", function (done) {
        dboperator.insertData(RequireNumberDummy, [{a: 1}, {a: 2}], function () {
            RequireNumberDummy.find({}, function (err, docs) {
                expect(docs).to.have.length(2)
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

    it.only("BooleanSchema", function (done) {
        dboperator.insertData(RequireBooleanDummy, [{a: 1}, {a: 2}], function (err) {
            expect(err).not.exist()
            RequireBooleanDummy.find({}, function (err, docs) {
                expect(docs).to.have.length(2)
                done()
            })
        })
    })
})

