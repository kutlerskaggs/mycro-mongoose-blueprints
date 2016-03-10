'use strict';

var joi = require('joi'),
    _ = require('lodash');

module.exports = function(req, res, next) {
    let errorService = req.mycro.services.error,
        wrapError = errorService.wrapError,
        interceptResponse = errorService.interceptResponse;

    let schema = joi.object({
        fields: joi.object({
            user: joi.string()
        }).unknown(false),
        filter: joi.object({
            status: joi.any(),
            author: joi.any(),
            createdAt: joi.any(),
            'nested.user': joi.any()
        }).unknown(false),
        page: joi.object({
            size: joi.number().integer().min(1).max(100),
            number: joi.number().integer().min(1)
        }).unknown(false),
        sort: joi.string()
    }).unknown(false);

    let cb = wrapError(400, 'Invalid Request Query', interceptResponse.call(errorService, res, true, function(err) {
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
    }));

    joi.validate(req.query, schema, {}, cb);
};
