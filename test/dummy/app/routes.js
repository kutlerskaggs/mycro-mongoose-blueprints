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
                    '/query-policy': {
                        additionalPolicies: ['users/query'],
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
