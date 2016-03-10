'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = {
    query(req, res) {
        let mycro = req.mycro,
            services = mycro.services;
        async.waterfall([
            function execQuery(fn) {
                services.mongoose.query(req, {}, services.error.intercept(fn));
            },

            function serializeResponse(data, fn) {
                services.serializer.serialize(_.get(req, 'options.model'), data, fn);
            }
        ], services.error.interceptResponse(res, function(payload) {
            res.json(200, payload);
        }));
    }
};
