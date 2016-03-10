'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        body: String,
        status: {
            type: String,
            enum: ['draft', 'published', 'archived']
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: 'comment'
        }],
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        nested: {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    });

    return connection.model('post', schema);
};
