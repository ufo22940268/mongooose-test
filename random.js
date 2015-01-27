/**
 * Created by ccheng on 1/26/15.
 */
"use strict";

var ObjectId = require('mongoose').Types.ObjectId;

var random = {
    randomNumber: function () {
        return Math.random() * 10000;
    },

    _randonString: function (len, an) {
        an = an && an.toLowerCase();
        var str = "", i = 0, min = an == "a" ? 10 : 0, max = an == "n" ? 10 : 62;
        for (; i++ < len;) {
            var r = Math.random() * (max - min) + min << 0;
            str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
        }
        return str;
    },

    randomString: function (options) {
        if (!options || !options.enum) {
            return this._randonString(10, "B")
        } else {
            return options.enum[parseInt(options.enum.length * Math.random())]
        }
    },

    randomDate: function () {
        var date = new Date();
        date.setHours(date.getHours() - Math.random() * 80);
        return date;
    },

    randomObjectId: function () {
        return new ObjectId()
    },

    randomBoolean: function() {
        return Math.random() > 0.5 ? true : false
    }
}

module.exports = random