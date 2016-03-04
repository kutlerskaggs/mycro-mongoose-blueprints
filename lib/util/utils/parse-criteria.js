'use strict';

var async = require('async'),
    joi = require('joi'),
    _ = require('lodash');

module.exports = function parseCriteria(req, options, cb) {
    // define valid query params
    let schema = joi.object({
        fields: joi.object().pattern(/.+/, joi.string()),
        filter: joi.object(),
        include: joi.string(),
        page: joi.object({
            size: joi.number().integer().min(options.pageSizeMin).max(options.pageSizeMax),
            number: joi.number().integer().min(1)
        })
    }).required();

    async.parallel({
        options: function(fn) {
            joi.validate(_.get(req, 'options.criteria') || {}, schema, {convert: true, allowUnknown: true}, fn);
        },

        query: function(fn) {
            joi.validate(req.query, schema, {convert: true, allowUnknown: true}, fn);
        }
    }, function(err, r) {
        if (err) {
            return cb(err);
        }

        let validated = r.query;

        if (_.get(options, 'fields.disabled') === true) {
            validated.fields = {};
        } else {
            // process fields
            _.transform(validated.fields, function(fields, value, key) {
                // get array of fields
                let select = value.split(',');
                if (!select.length) {
                    return;
                }

                let shouldWhitelist =

                fields[key] = select;
            }, validated.fields);
        }

        // process include
        if (_.isString(validated.include)) {
            validated.include = validated.include.split(',');
        }
        if (!_.isArray(validated.include)) {
            validated.include = [];
        }

        // merge request options
        validated = _.merge({
            page: {
                size: options.pageSize,
                number: 1
            }
        }, validated, r.options);

        // allow for disabling of query param filters
        if (_.get(options, 'filter.disable') === true) {
            validated.filter = {};
        }
        cb(null, validated);
    });
};
