'use strict';

var async = require('async'),
    EventEmitter = require('events').EventEmitter,
    ObjectId = require('mongodb').ObjectId,
    parse = require('../util/parse'),
    util = require('util'),
    _ = require('lodash');

module.exports = function(mycro) {
    function Service(options) {
        EventEmitter.call(this);
        this._options = _.cloneDeep(options);
    }
    util.inherits(Service, EventEmitter);


    /**
     * Create a new record
     *
     * @param  {Request} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
    Service.prototype.create = function(req, options, cb) {
        if (_.isFunction(options)) {
            cb = options;
            options = {};
        }
        async.auto({
            type: parse.type(req, options),
            data: function(fn) {
                let data = req.body || {};
                async.setImmediate(function() {
                    fn(null, data);
                });
            },
            model: ['type', parse.model(req, options)],
            process: ['model', 'data', function(fn, r) {
                if (_.isFunction(options.processQuery)) {
                    if (options.processQuery.length === 2) {
                        return options.processQuery(r, fn);
                    }
                    options.processQuery(r);
                }
                async.setImmedtiate(fn);
            }],
            query: ['process', function(fn, r) {
                // define query, apply filters
                let query = r.model.create(r.data, function(err, result) {
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


    /**
     * Find a specific record by id
     *
     * @param  {Request} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
    Service.prototype.detail = function(req, options, cb) {
        if (_.isFunction(options)) {
            cb = options;
            options = {};
        }
        let idParam = _.get(req, 'options.idParam') || options.idParam || 'id',
            id = _.get(req, 'params.' + idParam);
        if (!id) {
            return cb({
                status: 500,
                title: 'Primary Key Required',
                detail: 'Unable to locate url param with name `' + idParam + '`'
            });
        }
        async.auto({
            type: parse.type(req, options),
            fields: parse.fields(req, options),
            model: ['type', parse.model(req, options)],
            filter: ['model', parse.filter(req, options)],
            process: ['filter', 'fields', 'model', function(fn, r) {
                if (_.isFunction(options.processQuery)) {
                    return options.processQuery(r, fn);
                }
                async.setImmedtiate(fn);
            }],
            query: ['process', function(fn, r) {
                // define query, apply filters
                _.extend(r.filter, {
                    _id: new ObjectId(id)
                });
                let query = r.model.findOne(r.filter);

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


    /**
     * Find records
     *
     * @param  {Request} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
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


    /**
     * Remove a record
     *
     * @param  {Request} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
    Service.prototype.remove = function(req, options, cb) {

    };


    /**
     * Update an existing record
     *
     * @param  {Request} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
    Service.prototype.update = function(req, options, cb) {
        if (_.isFunction(options)) {
            cb = options;
            options = {};
        }
        let idParam = _.get(req, 'options.idParam') || options.idParam || 'id',
            id = _.get(req, 'params.' + idParam);
        if (!id) {
            return cb({
                status: 500,
                title: 'Primary Key Required',
                detail: 'Unable to locate url param with name `' + idParam + '`'
            });
        }
        async.auto({
            type: parse.type(req, options),
            fields: parse.fields(req, options),
            model: ['type', parse.model(req, options)],
            filter: ['model', parse.filter(req, options)],
            process: ['filter', 'fields', 'model', function(fn, r) {
                if (_.isFunction(options.processQuery)) {
                    return options.processQuery(r, fn);
                }
                async.setImmedtiate(fn);
            }],
            query: ['process', function(fn, r) {
                // define query, apply filters
                _.extend(r.filter, {
                    _id: new ObjectId(id)
                });
                let query = r.model.where(r.filter);

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
