'use strict';

var async = require('async'),
    joi = require('joi'),
    _ = require('lodash');

module.exports = {
    create(req, res) {
        let mycro = req.mycro;
        async.waterfall([
            function createRecord(fn) {
                mycro.services.mongoose.create(req, {
                    processQuery(query, cb) {
                        mycro.services.serializer.deserialize(query.data, function(err, data) {
                            _.extend(query, {
                                data: data.user ? _.pick(data.user, ['first', 'last', 'email', 'secret', 'phone']) : null
                            });
                            console.log(JSON.stringify(query.data));
                            cb();
                        });
                    }
                }, mycro.services.error.wrapError(500, 'Create Error', true, fn));
            }
        ]);
    },


    findFieldsDisabled(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'users',
                    fields: {
                        disable: true
                    }
                }, error.intercept(fn));
            },

            function serialize(posts, fn) {
                let serializer = mycro.services.serializer;
                serializer.serialize('users', posts, error.intercept(fn));
            }
        ], error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    },


    findFieldsWhitelist(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'users',
                    fields: {
                        users: {
                            whitelist: ['first', 'last', 'email', 'status']
                        }
                    }
                }, error.intercept(fn));
            },

            function serialize(posts, fn) {
                let serializer = mycro.services.serializer;
                serializer.serialize('users', posts, error.intercept(fn));
            }
        ], error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    },


    findFilterBlacklist(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'users',
                    filter: {
                        blacklist: ['department']
                    }
                }, error.intercept(fn));
            },

            function serialize(posts, fn) {
                let serializer = mycro.services.serializer;
                serializer.serialize('users', posts, error.intercept(fn));
            }
        ], error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    }
};
