# mongooose-test

A few test helper to make testing mongoose easier.

[![Build Status](https://travis-ci.org/ufo22940268/mongooose-test.svg?branch=master)](https://travis-ci.org/ufo22940268/mongooose-test)

##How to use

###Clean collections


```javascript

    var mongooseTest = require('mongoose-test')
    var RequireNumberDummy = mongoose.model('DummyNumberRequired', new mongoose.Schema({
        a: Number,
        b: {type: Number, required: true}
    }))

    mongooseTest.removeCollections([RequireStringDummy], function (err) {
        done()
    })

````

###Insert new document

```javascript

    var RequireStringDummy = mongoose.model('DummyStringRequired', new mongoose.Schema({
        a: Number,
        b: {type: String, required: true},
        c: {type: String, required: true, enum: ['hongbosb', 'shijiesb']}
    }))
    var mongooseTest = require('mongoose-test')
    mongooseTest.insertData(RequireStringDummy, [{a: 1}, {a: 2}], function (err) {
    }

```

When the inserted document contains some required fields that doesn't have value, mongooseTest will automatically generate some dummy data according its type.
In the above example, we don't need to specify `b` and `c` these two required fields. But after call `insertData` we will still find some strings in these fields.
So with this strategy, you only need to concentrate on the fields you care, let let `mongoose-test` do the rest work.

##Install

    npm install --save mongoose-test
