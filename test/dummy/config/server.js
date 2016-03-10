'use strict';

var qs = require('qs'),
    _ = require('lodash');

module.exports = {
    port: 8080,
    middleware: [
        'acceptParser',
        'dateParser',
        function(mycro) {
            return function(req, res, next) {
                req.query = req.query || {};
                if (!_.isPlainObject(req.query)) {
                    req.query = {};
                }
                _.merge(req.query, qs.parse(req.getQuery(), {allowDots: false}));
                next();
            };
        },
        'bodyParser',
        'morgan',
        'request',
        'request-all-params'
    ]
};
