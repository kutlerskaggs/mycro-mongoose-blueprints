'use strict';

var _ = require('lodash');

module.exports = function(connection, Schema) {
    let schema = new Schema({
        first: String,
        last: String,
        email: String,
        createdAt: Date,
        password: String,
        department: String,
        status: {
            type: String,
            enum: ['active', 'inactive', 'unverified', 'pending']
        },
        phone: {
            mobile: String,
            office: String,
            home: String
        }
    }, {
        strict: false
    });

    schema.set('toObject', {
        getters: true,
        transform: function(doc, ret, options) {
            let blacklist = ['password'];
            if (_.isArray(options.blacklist)) {
                blacklist = blacklist.concat(options.blacklist);
            }
            blacklist.forEach(function(attr) {
                _.unset(ret, attr);
            });
        }
    });

    return connection.model('user', schema);
};
