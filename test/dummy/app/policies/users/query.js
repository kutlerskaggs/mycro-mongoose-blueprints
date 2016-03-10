'use strict';

var joi = require('joi'),
    _ = require('lodash');

module.exports = function(req, res, next) {
    let errorService = req.mycro.services.error,
        wrapError = errorService.wrapError,
        interceptResponse = errorService.interceptResponse;

    let filterSchema = joi.object({
        id: joi.any(),
        first: joi.any(),
        last: joi.any(),
        email: joi.any(),
        department: joi.any()
    });

    let roles = _.get(req, 'session.roles') || [],
        blacklist = ['password'];
    if (roles.indexOf('admin') !== -1) {
        filterSchema.unknown(true);
    } else {
        filterSchema.unknown(false);
        blacklist.push('phone');
    }

    _.merge(req, {
        options: {
            blueprint: {
                fields: {
                    user: {
                        blacklist: ['password', 'phone']
                    }
                }
            }
        }
    });

    let querySchema = joi.object({
        fields: joi.object(),
        filter: filterSchema,
        page: joi.object({
            size: joi.number().integer().min(1).max(100).default(20),
            number: joi.number().integer().min(1)
        }),
        sort: joi.string()
    });

    let cb = wrapError(400, 'Invalid Request Query', interceptResponse.call(errorService, res, true, function(err) {
        if (err) {
            return next(false);
        }
        next();
    }));

    joi.validate(req.query, querySchema, {}, cb);
};
