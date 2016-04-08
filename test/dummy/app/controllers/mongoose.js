'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = {
    create(req, res) {
        let mycro = req.mycro,
            type = _.get(req, 'options.model');
        async.waterfall([
            function createDocument(fn) {
                mycro.services.mongoose.create(req, {
                    processQuery(query, cb) {
                        cb = mycro.services.error.wrapError(400, 'Invalid Request Paylod', true, cb);
                        mycro.services.serializer.deserialize(query.data, function(err, data) {
                            _.extend(query, { data: data[type] });
                            cb();
                        });
                    }
                }, mycro.services.error.wrapError(500, 'Create Error', true, fn));
            },

            function serializeResponse(data, fn) {
                fn = mycro.services.error.wrapError(500, 'Serialize Error', fn);
                mycro.services.serializer.serialize(type, data, fn);
            }
        ], mycro.services.error.interceptResponse(res, function(payload) {
            res.json(201, payload);
        }));
    },


    detail(req, res) {
        let mycro = req.mycro,
            services = mycro.services;
        async.waterfall([
            function execQuery(fn) {
                services.mongoose.detail(req, {
                    processQuery(results, cb) {
                        if (_.isFunction(services.mongoose._testHook)) {
                            services.mongoose._testHook(results);
                        }
                        if (_.isFunction(services.mongoose._processQuery)) {
                            return services.mongoose._processQuery(results, cb);
                        }
                        async.setImmediate(cb);
                    }
                }, services.error.intercept(function(err, data) {
                    if (err) {
                        return fn(err);
                    }
                    if (!data) {
                        return fn({
                            status: 404,
                            title: 'Not Found',
                            detail: 'Either the specified record (' + req.params.id + ') does not exist or you do not have permission to access it.'
                        });
                    }
                    fn(null, data);
                }));
            },

            function serializeResponse(data, fn) {
                services.serializer.serialize(_.get(req, 'options.model'), data, {
                    req: req,
                    pageSize: _.get(req, 'query.page.size') || 20,
                    nextPage: (_.get(req, 'query.page.number') || 1) + 1
                }, fn);
            }
        ], services.error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    },


    query(req, res) {
        let mycro = req.mycro,
            services = mycro.services;
        async.waterfall([
            function execQuery(fn) {
                services.mongoose.query(req, {
                    processQuery(results, cb) {
                        if (_.isFunction(services.mongoose._testHook)) {
                            services.mongoose._testHook(results);
                        }
                        if (_.isFunction(services.mongoose._processQuery)) {
                            return services.mongoose._processQuery(results, cb);
                        }
                        async.setImmediate(cb);
                    }
                }, services.error.intercept(fn));
            },

            function serializeResponse(data, fn) {
                services.serializer.serialize(_.get(req, 'options.model'), data, {
                    req: req,
                    pageSize: _.get(req, 'query.page.size') || 20,
                    nextPage: (_.get(req, 'query.page.number') || 1) + 1
                }, fn);
            }
        ], services.error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    }
};
