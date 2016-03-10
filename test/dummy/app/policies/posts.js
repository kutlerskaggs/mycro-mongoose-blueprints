'use strict';

var joi = require('joi'),
    _ = require('lodash');

function wrapError(status, title, cb) {
    return function(err) {
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
    };
}

module.exports = function(req, res, next) {
    let services = req.mycro.services;

    let schema = joi.object({
        status: joi.any(),
        author: joi.any(),
        createdAt: joi.any(),
        'nested.user': joi.any()
    }).unknown(false);

    let wrapped = wrapError(400, 'Bad Request', function(err) {
        if (err) {
            return next(false);
        }

        if (!req.session.roles.length) {
            req.options.filter = req.options.filter || {};
            req.options.filter.or = req.options.filter.or || [];
            req.options.filter.or.push.apply(req.options.filter.or, [{
                author: req.session.user.id
            }, {
                status: 'published'
            }]);
        }
        next();
    });

    let cb = services.error.interceptResponse(res, true, wrapped);

    joi.validate(req.query, schema, {}, cb);
};
