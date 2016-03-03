'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        body: String,
        status: {
            type: String,
            enum: ['draft', 'published', 'archived']
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: 'comments'
        }],
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'users'
        }],
        nested: {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    });

    return connection.model('posts', schema);
};
