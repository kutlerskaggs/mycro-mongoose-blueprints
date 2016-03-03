'use strict';

var async = require('async'),
    joi = require('joi'),
    _ = require('lodash');

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
            size: joi.number().integer().min(options.pageSizeMin).max(options.pageSizeMax),
            number: joi.number().integer().min(1)
        })
    }).required();

    joi.validate(req.query, schema, {convert: true, allowUnknown: true}, function(err, validated) {
        if (err) {
            return cb(err);
        }

        // process fields
        _.transform(validated.fields, function(fields, value, key) {
            if (!_.isString(value)) {
                return;
            }
            let select = _.trim(value.split(',').join(' '));
            if (!select.length) {
                return;
            }
            fields[key] = select;
        }, validated.fields);

        // process include
        if (_.isString(validated.include)) {
            validated.include = validated.include.split(',');
        }
        if (!_.isArray(validated.include)) {
            validated.include = [];
        }

        _.defaults(validated, {
            page: {
                size: options.pageSize,
                number: 1
            }
        });

        // allow for disabling of query param filters
        if (_.get(options, 'filter.disable') === true) {
            validated.filter = {};
        }
        cb(null, validated);
    });
};
