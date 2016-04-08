'use strict';

module.exports = function(mycro) {
    return {
        'v1.0.0': {
            '/api': {
                policies: [
                    'authenticated'
                ],
                '/posts': {
                    options: {
                        model: 'post'
                    },
                    get: 'mongoose.query',
                    '/fields-blacklist': {
                        additionalPolicies: [
                            mycro.policies['query-fields']('blacklist', ['createdAt'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/fields-whitelist': {
                        additionalPolicies: [
                            mycro.policies['query-fields']('whitelist', ['createdAt', 'body', 'status'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/pagination': {
                        additionalPolicies: [
                            mycro.policies['query-pagination']({
                                minSize: 5,
                                maxSize: 15,
                                defaultSize: 10
                            })
                        ],
                        get: 'mongoose.query'
                    },
                    '/query-blacklist': {
                        additionalPolicies: [
                            mycro.policies['query-filter']('blacklist', ['nested.user'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/query-policy': {
                        additionalPolicies: ['posts/query'],
                        get: 'mongoose.query'
                    },
                    '/:id': {
                        get: 'mongoose.detail',
                        '/query-policy': {
                            additionalPolicies: ['posts/query'],
                            get: 'mongoose.detail'
                        }
                    }
                },
                '/users': {
                    options: {
                        model: 'user'
                    },
                    get: 'mongoose.query',
                    post: 'mongoose.create',
                    '/fields-whitelist': {
                        additionalPolicies: [
                            mycro.policies['query-fields']('whitelist', ['first', 'last'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/query-blacklist': {
                        additionalPolicies: [
                            mycro.policies['query-filter']('blacklist', ['department', 'phone.house'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/query-policy': {
                        additionalPolicies: ['users/query'],
                        get: 'mongoose.query'
                    },
                    '/query-whitelist': {
                        additionalPolicies: [
                            mycro.policies['query-filter']('whitelist', ['department'])
                        ],
                        get: 'mongoose.query'
                    },
                    '/:id': {
                        post: 'user.create'
                    }
                }
            },
            '/health': {
                get(req, res) {
                    res.json(200, {status: 'healthy'});
                }
            }
        }
    };
};
