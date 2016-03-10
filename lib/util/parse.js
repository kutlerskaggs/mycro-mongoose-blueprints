'use strict';

var async = require('async'),
    joi = require('joi'),
    moment = require('moment'),
    ObjectId = require('mongodb').ObjectId,
    utils = require('./generic'),
    _ = require('lodash');

let internal = {
    isMongoId(id) {
        if (id === null) return false;
        var test = _.cloneDeep(id);
        if(typeof test.toString !== 'undefined') test = id.toString();
        return test.match(/^[a-fA-F0-9]{24}$/) ? true : false;
    },


    normalizeClause(model, clause, cb) {
        let self = this,
            logicalOperators = ['or', 'and', 'nor'],
            keys = Object.keys(clause);

        async.reduce(keys, {}, function(result, key, fn) {
            let value = clause[key];
            if (logicalOperators.indexOf(key) !== -1) {
                key = '$' + key;
                if (!_.isArray(value)) {
                    return fn({
                        status: 400,
                        title: 'Invalid Filter Clause',
                        detail: 'Logical operator `' + key.slice(1) + '` requires an array value',
                        meta: {
                            [key]: value
                        }
                    });
                }
                async.mapLimit(value, 5, function(_clause, _fn) {
                    self.normalizeClause(model, _clause, _fn);
                }, function(err, processedClauses) {
                    if (err) {
                        return fn(err);
                    }
                    result[key] = processedClauses;
                    return fn(null, result);
                });
            } else {
                self.normalizeExpression(model, key, value, function(err, processed) {
                    if (err) {
                        return fn(err);
                    }
                    if (key === 'id' && !_.has(clause, '_id')) {
                        key = '_id';
                    }
                    result[key] = processed;
                    return fn(null, result);
                });
            }
        }, cb);
    },


    normalizeExpression(model, field, expression, cb) {
        let self = this;
        if (_.isPlainObject(expression) && !_.isDate(expression)) {
            let keys = Object.keys(expression);
            return async.reduce(keys, {}, function(result, modifier, fn) {
                let value = expression[modifier];
                if (modifier === 'not') {
                    if (!(_.isPlainObject(value) && !_.isDate(value))) {
                        return fn({
                            status: 400,
                            title: 'Invalid Query Expression',
                            detail: 'The `not` operator requires a `clause` value'
                        });
                    }
                    return self.normalizeExpression(model, field, value, function(err, processed) {
                        if (err) {
                            return fn(err);
                        }
                        result.$not = processed;
                        return fn(null, result);
                    });
                } else if (['nin', 'ne', 'gt', 'gte', 'lt', 'lte', 'regex', 'in'].indexOf(modifier) !== -1) {
                    modifier = '$' + modifier;
                    return self.normalizeValue(model, field, modifier, value, function(err, processed) {
                        if (err) {
                            return fn(err);
                        }
                        result[modifier] = processed;
                        return fn(null, result);
                    });
                } else {
                    return fn({
                        status: 400,
                        title: 'Invalid Query Expression',
                        detail: 'The `' + modifier + '` is not supported at this time'
                    });
                }
            }, cb);
        }
        if (_.isArray(expression)) {
            return self.normalizeValue(model, field, '$in', expression, function(err, processed) {
                if (err) {
                    return cb(err);
                }
                cb(null, {
                    $in: processed
                });
            });
        }
        return self.normalizeValue(model, field, undefined, expression, function(err, processed) {
            if (err) {
                return cb(err);
            }
            cb(null, {
                $eq: processed
            });
        });
    },


    normalizeQuery(model, filter, cb) {
        let self = this;
        if (!_.isPlainObject(filter)) {
            return cb({
                status: 400,
                title: 'Invalid Filter Parameter',
                detail: 'Filter must be an object'
            });
        }
        return self.normalizeClause(model, filter, cb);
    },


    normalizeValue(model, field, modifier, value, cb) {
        let type = _.get(model, ['schema', 'tree', field].join('.')),
            self = this,
            normalized;
        if (_.isArray(type) && type.length >= 1) {
            type = type[0];
        }
        if (_.isPlainObject(type)) {
            type = type.type;
        }
        if (modifier === '$regex') {
            if (!_.isString(value)) {
                return cb({
                    status: 400,
                    title: 'Invalid Query Expression',
                    detail: 'The `regex` modifier requires a string value',
                    meta: {
                        regex: value
                    }
                });
            }
            normalized = new RegExp(value);
            return cb(null, normalized);
        } else if (type === Number) {
            normalized = parseFloat(value);
            if (isNaN(normalized)) {
                return cb({
                    status: 400,
                    title: 'Invalid Query Expression',
                    detail: 'Unable to parse number type',
                    meta: {
                        [modifier]: value
                    }
                });
            }
            return cb(null, normalized);
        } else if (type === Date) {
            normalized = moment(value);
            if (!normalized.isValid()) {
                return cb({
                    status: 400,
                    title: 'Invalid Query Expression',
                    detail: 'Unable to parse date type',
                    meta: {
                        [modifier]: value
                    }
                });
            }
            return cb(null, normalized.toDate());
        } else if (type === ObjectId) {
            if (!self.isMongoId(value)) {
                return cb({
                    status: 400,
                    title: 'Invalid Query Expression',
                    detail: 'Unable to parse ObjectId type',
                    meta: {
                        [modifier]: value
                    }
                });
            }
            if (_.isArray(value)) {
                normalized = value.map(function(id) {
                    return new ObjectId(id.toString());
                });
            } else {
                normalized = new ObjectId(value.toString());
            }
            cb(null, normalized);
        } else {
            cb(null, value);
        }
    }
};

module.exports = {
    fields(req, options) {
        return function(cb) {
            // extract field selection from query params
            let fields = _.get(req, 'query.fields') || {};
            fields = _.transform(fields, function(result, value, type) {
                if (!_.isString(value)) {
                    return;
                }
                let config = {
                        include: [],
                        exclude: []
                    },
                    list = value.split(',');
                list.forEach(function(item) {
                    if (!item.length) {
                        return;
                    }
                    if (item.charAt(0) === '-') {
                        config.exclude.push(item.slice(1));
                    } else {
                        config.include.push(item);
                    }
                });
                result[type] = config;
            }, {});

            // process field selections based on blueprint options
            let fieldOptions = _.get(req, 'options.blueprint.fields');
            _.each(fieldOptions, function(config, type) {
                console.log(type, config);
                if (!fields[type]) {
                    fields[type] = {
                        include: [],
                        exclude: []
                    };
                }
                let shouldWhitelist = config.whitelist && config.whitelist.length ? true : false,
                    shouldBlacklist = shouldWhitelist ? false : (config.blacklist && config.blacklist.length ? true : false);
                if (shouldWhitelist) {
                    if (fields[type].include.length) {
                        fields[type].include = fields[type].include.filter(function(item) {
                            return config.whitelist.indexOf(item) !== -1;
                        });
                    } else {
                        fields[type].include = config.whitelist;
                        if (fields[type].exclude.length) {
                            fields[type].include = fields[type].include.filter(function(item) {
                                return config.blacklist.indexOf(item) === -1;
                            });
                        }
                    }
                } else if (shouldBlacklist) {
                    if (fields[type].include.length) {
                        fields[type].include = fields[type].include.filter(function(item) {
                            return config.blacklist.indexOf(item) === -1;
                        });
                    } else {
                        fields[type].exclude = _.uniq(fields[type].exclude.concat(config.blacklist));
                    }
                }
            });
            cb(null, fields);
        };
    },


    filter(req, options) {
        return function(cb, results) {
            let model = _.get(results, 'model');
            if (!model) {
                return cb({
                    status: 500,
                    title: 'Invalid Filter Call',
                    detail: 'Filter has a hard dependency on #parseModel'
                });
            }

            // extract filter from request
            let filter = _.get(req, 'query.filter');
            if (filter) {
                filter = _.cloneDeep(filter);
            } else {
                filter = {};
            }

            // apply blacklist/whitelist
            let whitelist = _.get(req, 'options.blueprint.filter.whitelist') || [],
                blacklist = _.get(req, 'options.blueprint.filter.blacklist') || [],
                shouldWhitelist = whitelist && whitelist.length ? true : false,
                shouldBlacklist = shouldWhitelist ? false : (blacklist && blacklist.length ? true : false);
            if (shouldWhitelist) {
                filter = utils.pickNested(filter, whitelist);
            } else if (shouldBlacklist) {
                filter = utils.omitNested(filter, blacklist);
            }

            // merge request options
            let serverFilters = _.get(req, 'options.filter');
            if (serverFilters) {
                _.merge(filter, serverFilters);
            }

            internal.normalizeQuery(model, filter, cb);
        };
    },


    model(req, options) {
        return function(cb, results) {
            if (!results) {
                results = {};
            }
            let model = req.mycro.models[results.type];
            if (!model) {
                return cb({
                    status: 500,
                    title: 'Unable to parse model from request/options',
                    detail: 'Unable to locate model `' + results.type + '`'
                });
            }
            cb(null, model);
        };
    },


    pagination(req, options, cb) {
        return function(cb) {
            let page = _.get(req, 'query.page') || {},
                pageOptions = _.get(req, 'options.blueprint.page') || {},
                minPageSize = pageOptions.minSize || 1,
                defaultPageSize = pageOptions.defaultSize || 20,
                maxPageSize = pageOptions.maxPageSize || 100,
                pageSchema = joi.object({
                    number: joi.number().integer().min(1).default(1),
                    size: joi.number().integer().min(minPageSize < 1 ? 1 : minPageSize)
                        .max(maxPageSize).default(defaultPageSize)
                });
            joi.validate(page, pageSchema, {}, function(err, validated) {
                if (err) {
                    return cb({
                        status: 400,
                        title: 'Invalid Pagination Request',
                        details: err.message
                    });
                }
                if (pageOptions.size) {
                    validated.size = pageOptions.size;
                }
                cb(null, validated);
            });
        };
    },


    sort(req, options) {
        return function(cb) {
            let sort = _.get(req, 'query.sort');
            if (typeof sort === 'undefined') {
                return cb();
            } else if (!_.isString(sort)) {
                return cb({
                    status: 400,
                    title: 'Invalid Sort Request',
                    detail: 'Paramter `sort` must be a string'
                });
            } else {
                sort = _.reduce(sort.split(','), function(result, item) {
                    if (item.charAt(0) === '-') {
                        result[item.slice(1)] = -1;
                    } else {
                        result[item] = 1;
                    }
                    return result;
                }, {});
                cb(null, sort);
            }
        };
    },


    type(req, options) {
        return function(cb) {
            let modelName = options.model || _.get(req, 'options.model');
            if (!modelName) {
                return cb({
                    status: 500,
                    title: 'Unable to parse type from request/options'
                });
            }
            cb(null, modelName);
        };
    }
};
