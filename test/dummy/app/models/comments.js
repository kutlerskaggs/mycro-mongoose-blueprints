'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        body: {
            type: String,
            required: true
        }
    });

    return connection.model('comments', schema);
};
