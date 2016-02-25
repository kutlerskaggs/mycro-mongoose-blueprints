'use strict';

var adapter = require('mycro-mongoose');

module.exports = {
    mongo: {
        adapter: adapter,
        config: {
            host: process.env.MONGO_HOST || 'localhost',
            port: process.env.MONGO_PORT || 27017,
            database: 'mycro-mongoose-blueprints-test',
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PWD
        }
    }
};
