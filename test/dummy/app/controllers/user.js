'use strict';

var async = require('async'),
    joi = require('joi'),
    _ = require('lodash');

module.exports = {
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
