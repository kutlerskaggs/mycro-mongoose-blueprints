'use strict';

var async = require('async'),
    EventEmitter = require('events').EventEmitter,
    parse = require('../util/parse'),
    util = require('util'),
    _ = require('lodash');

module.exports = function(mycro) {
    function Service(options) {
        EventEmitter.call(this);
        this._options = _.cloneDeep(options);
    }
    util.inherits(Service, EventEmitter);

    Service.prototype.query = function(req, options, cb) {
        if (_.isFunction(options)) {
            cb = options;
            options = {};
        }
        async.auto({
            type: parse.type(req, options),
            fields: parse.fields(req, options),
            page: parse.pagination(req, options),
            sort: parse.sort(req, options),
            model: ['type', parse.model(req, options)],
            filter: ['model', parse.filter(req, options)],
            process: ['filter', 'fields', 'page', 'sort', 'model', function(fn, r) {
                if (_.isFunction(options.processQuery)) {
                    return options.processQuery(r, fn);
                }
                async.setImmedtiate(fn);
            }],
            query: ['process', function(fn, r) {
                // define query, apply filters
                let query = r.model.find(r.filter);

                // apply pagination
                let pageSize = r.page.size,
                    pageNumber = r.page.number;
                query.limit(pageSize).skip(pageSize * (pageNumber - 1));

                // apply field selections
                let fields = _.get(r.fields, r.type) || {};
                if (fields.include && fields.include.length) {
                    fields = _.transform(fields.include, function(result, field) {
                        result[field] = 1;
                    }, {});
                } else if (fields.exclude && fields.exclude.length) {
                    fields = _.transform(fields.exclude, function(result, field) {
                        result[field] = 0;
                    }, {});
                }
                if (Object.keys(fields).length) {
                    query.select(fields);
                }

                // apply sort
                let sort = r.sort;
                if (sort) {
                    query.sort(sort);
                }

                query.exec(function(err, result) {
                    if (err) {
                        return fn({
                            status: 500,
                            title: 'Query Error',
                            detail: _.get(err, 'message') || err
                        });
                    }
                    fn(null, result);
                });
            }]
        }, function(err, r) {
            if (err) {
                return cb(err);
            }
            cb(null, r.query);
        });
    };

    return Service;
};
