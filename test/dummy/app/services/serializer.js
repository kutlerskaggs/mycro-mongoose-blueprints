'use strict';

var async = require('async'),
    qs = require('qs'),
    Serializer = require('json-api-ify'),
    _ = require('lodash');

module.exports = function(mycro) {
    let serializer = new Serializer({
        baseUrl: 'https://www.example.com/api',
        id: 'id',
        links: {
            self(resource, options, cb) {
                let link = options.baseUrl + '/' + options.type + '/' + resource.id;
                cb(null, link);
            }
        },
        processResource(resource, cb) {
            if (_.isFunction(resource.toObject)) {
                resource = resource.toObject({getters: true});
            }
            cb(null, resource);
        }
    });

    serializer.on('error', function(err) {
        mycro.log('error', err);
    });

    serializer.initialize = function(done) {
        let types = {
            users: {
                blacklist: ['password']
            },
            posts: {
                relationships: {
                    author: {
                        type: 'users',
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
                        type: 'comments',
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
                        type: 'users',
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
                        type: 'users',
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
            },
            comments: {
                relationships: {
                    author: {
                        type: 'users',
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
