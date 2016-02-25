'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        first: String,
        last: String,
        email: String,
        password: String,
        phone: {
            mobile: String,
            office: String,
            home: String
        },
        groups: [{type: Schema.Types.ObjectId, ref: 'groups'}]
    }, {
        strict: false
    });

    return connection.model('users', schema);
};
