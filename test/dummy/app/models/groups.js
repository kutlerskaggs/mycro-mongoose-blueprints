'use strict';

module.exports = function(connection, Schema) {
    let schema = new Schema({
        name: String,
        desc: String,
        tags: [String],
        admins: [{type: Schema.Types.ObjectId, ref: 'users'}]
    });

    return connection.model('groups', schema);
};
