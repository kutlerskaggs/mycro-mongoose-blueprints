'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = {
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
