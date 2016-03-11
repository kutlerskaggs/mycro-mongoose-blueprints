'use strict';

var joi = require('joi'),
    _ = require('lodash');

module.exports = function(options) {
    return function(req, res, next) {
        let errorService = req.mycro.services.error,
            interceptResponse = errorService.interceptResponse,
            wrapError = errorService.wrapError;

        let schema = joi.object({
            defaultSize: joi.number().integer().min(1),
            minSize: joi.number().integer().min(1),
            maxSize: joi.number().integer().min(1),
            number: joi.number().integer().min(1)
        }).required();

        let msg = 'Invalid `options` passed to `query-pagination` policy',
            cb = wrapError(500, msg, interceptResponse.call(errorService, res, true, function(err) {
                if (err) {
                    return next(false);
                }
                _.merge(req.options, {
                    blueprint: {
                        page: options
                    }
                });
                next();
            }));

        joi.validate(options, schema, {}, cb);
    };
};
