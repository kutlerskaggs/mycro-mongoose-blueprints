'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        body: {
            type: String,
            required: true
        }
    });

    return connection.model('comment', schema);
};
