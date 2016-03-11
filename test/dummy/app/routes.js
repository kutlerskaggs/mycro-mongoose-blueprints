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
                    '/fields-whitelist': {
                        additionalPolicies: [
                            mycro.policies['query-fields']('whitelist', ['createdAt', 'body', 'status'])
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
                    }
                },
                '/users': {
                    options: {
                        model: 'user'
                    },
                    get: 'mongoose.query',
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
