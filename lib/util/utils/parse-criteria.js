'use strict';

var async = require('async'),
    joi = require('joi');

module.exports = function parseCriteria(req, options, cb) {
    // define valid query params
    let schema = joi.object({
        fields: joi.object().pattern(/.+/, joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        )),
        filter: joi.object(),
        include: joi.alternatives().try(
            joi.string(),
            joi.array().items(joi.string())
        ),
        page: joi.object({
            size: joi.number().integer().min(options.pageSizeMin).max(options.pageSizeMax).default(options.pageSize),
            number: joi.number().integer().min(1)
        })
    }).required();

    joi.validate(req.query, schema, {convert: true, allowUnknown: true}, cb);
};
