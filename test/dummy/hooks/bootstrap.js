'use strict';

var async = require('async');

module.exports = function(done) {
    let mycro = this;
    async.parallel([
        function responseHandler(fn) {
            mycro.services.error.responseHandler = function(res, err) {
                let payload = mycro.services.serializer.serializeError(err),
                    status = payload.meta.status;
                res.json(status, payload);
            };
            fn();
        },

        // initialize serializer
        function serializer(fn) {
            mycro.services.serializer.initialize(fn);
        },

        function mongoose(fn) {
            if (['staging', 'production'].indexOf(process.env.NODE_ENV) === -1) {
                mycro.connections.mongo.adapter.mongoose.set('debug', true);
            }
            fn();
        },

        function blueprints(fn) {
            mycro.services.mongoose.on('error', function(err) {
                mycro.services.error.notify(err);
            });
            fn();
        }
    ], done);
};
