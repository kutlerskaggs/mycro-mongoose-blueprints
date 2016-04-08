'use strict';

var async = require('async'),
    _ = require('lodash');

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
        },

        function error(fn) {
            mycro.services.error.wrapError = function(status, title, intercept, cb) {
                // handle optional intercept argument
                if (_.isFunction(intercept)) {
                    cb = intercept;
                    intercept = false;
                }

                // define return function
                let callback = function(err) {
                    if (err) {
                        return cb({
                            status: status,
                            title: title,
                            detail: err.message || err
                        });
                    }
                    let args = [];
                    for (var i = 0; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    cb.apply(this, args);
                }.bind(this);

                // intercept the return function if applicable
                if (intercept === true) {
                    callback = mycro.services.error.intercept(false, callback, this);
                }
                return callback;
            };
            fn();
        }
    ], done);
};
