'use strict';

var async = require('async'),
    mongoose = require('mongoose'),
    qs = require('qs'),
    Serializer = require('json-api-ify'),
    _ = require('lodash');

module.exports = function(mycro) {
    let serializer = new Serializer({
        baseUrl: 'https://www.example.com/api',
        id: 'id',
        includeSerializationTime: true,
        links: {
            self(resource, options, cb) {
                let link = options.baseUrl + '/' + options.type + 's/' + resource.id;
                cb(null, link);
            }
        },
        processResource(resource) {
            if (typeof resource.toObject === 'function') {
                resource = resource.toObject({getters: true});
            } else if (resource instanceof mongoose.Types.ObjectId) {
                resource = resource.toString();
            }
            return resource;
        }
    });

    serializer.on('error', function(err) {
        let error = _.pick(err, ['status', 'title', 'detail']);
        if (!Object.keys(error).length) {
            error = err.message || err;
        }
        mycro.log('error', error);
    });

    serializer.initialize = function(done) {
        let types = {
            user: {
                blacklist: ['password']
            },
            post: {
                relationships: {
                    author: {
                        type: 'user',
                        include: true,
                        links: {
                            self(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/relationships/author';
                                cb(null, link);
                            },
                            related(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/author';
                                cb(null, link);
                            }
                        }
                    },
                    comments: {
                        type: 'comment',
                        include: true,
                        links: {
                            self(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/relationships/comments';
                                cb(null, link);
                            },
                            related(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/comments';
                                cb(null, link);
                            }
                        }
                    },
                    likes: {
                        type: 'user',
                        include: true,
                        links: {
                            self(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/relationships/likes';
                                cb(null, link);
                            },
                            related(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/likes';
                                cb(null, link);
                            }
                        }
                    },
                    'nested.user': {
                        type: 'user',
                        include: true,
                        links: {
                            self(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/relationships/nested-user';
                                cb(null, link);
                            },
                            related(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/nested-user';
                                cb(null, link);
                            }
                        }
                    }
                },
                topLevelLinks: {
                    self(options, cb) {
                        let query = qs.stringify(_.get(options, 'req.query') || {}, {encode: false}),
                            link = options.baseUrl + '/' + options.type + 's';
                        if (query.length) {
                            link += '?' + query;
                        }
                        cb(null, link);
                    },
                    next(options, cb) {
                        let query = _.get(options, 'req.query') || {};
                        _.merge(query, {
                            page: {
                                size: options.pageSize || 10,
                                number: options.nextPage || 2
                            }
                        });
                        let link = options.baseUrl + '/' + options.type + 's?' + qs.stringify(query, {encode: false});
                        cb(null, link);
                    }
                }
            },
            comment: {
                relationships: {
                    author: {
                        type: 'user',
                        include: true,
                        links: {
                            self(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/relationships/author';
                                cb(null, link);
                            },
                            related(resource, options, cb) {
                                let link = options.baseUrl + '/posts/' + resource.id + '/author';
                                cb(null, link);
                            }
                        }
                    }
                },
                topLevelLinks: {
                    self(options, cb) {
                        let link = options.baseUrl + '/' + options.type;
                        cb(null, link);
                    },
                    next(options, cb) {
                        let query = {
                            page: {
                                size: options.pageSize || 10,
                                number: options.nextPage || 2
                            }
                        };
                        let link = options.baseUrl + '/' + options.type + '?' + qs.stringify(query, {encode: false});
                        cb(null, link);
                    }
                }
            }
        };
        async.each(_.keys(types), function(type, fn) {
            let config = types[type];
            serializer.define(type, config, fn);
        }, done);
    };

    return serializer;
};
