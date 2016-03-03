'use strict';

var async = require('async'),
    joi = require('joi'),
    _ = require('lodash');

module.exports = {
    find(req, res) {
        let mycro = req.mycro;
        async.auto({
            find(fn) {
                mycro.services.mongoose.find(req, {
                    model: 'users',
                    filter: {
                        whitelist: ['first', 'last', 'email', 'department', 'status']
                    },
                    processQuery(query, cb) {
                        cb();
                    },
                    include: {
                        //disable: true,
                        //always: ['groups'],
                        //blacklist: ['groups'],
                        //whitelist: ['groups'],
                        options: {
                            groups: {
                                select: 'name',
                                options: {
                                    //skip: 1,
                                    limit: 10
                                }
                            }
                        }
                    }
                }, fn);
            }
        }, function(err, r) {
            if (err) {
                return res.json(500, {errors: [err]});
            }
            res.json(200, r.find);
        });
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
    },


    findFilterWhitelist(req, res) {
        let mycro = req.mycro,
            error = mycro.services.error;
        async.waterfall([
            function find(fn) {
                let blueprints = mycro.services.mongoose;
                blueprints.find(req, {
                    model: 'users',
                    filter: {
                        whitelist: ['status', 'department']
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
