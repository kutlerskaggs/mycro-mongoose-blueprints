'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = {
    findFilterDisable(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'posts',
                    filter: {
                        disable: true
                    },
                    processQuery(query, cb) {
                        query.or([{
                            author: req.headers['x-user-id']
                        }]);
                        cb();
                    }
                }, error.intercept(fn));
            },

            function serialize(posts, fn) {
                let serializer = mycro.services.serializer;
                serializer.serialize('posts', posts, error.intercept(fn));
            }
        ], error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    },


    findFilterServer(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'posts',
                    processQuery(query, cb) {
                        query.or([{
                            author: req.headers['x-user-id']
                        }]);
                        cb();
                    }
                }, error.intercept(fn));
            },

            function serialize(posts, fn) {
                let serializer = mycro.services.serializer;
                serializer.serialize('posts', posts, error.intercept(fn));
            }
        ], error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    }
};
