'use strict';

module.exports = function(mycro) {
    return {
        'v1.0.0': {
            '/api': {
                policies: [
                    'authenticated'
                ],
                '/posts': {
                    '/disable-filter': {
                        get: 'posts.findFilterDisable'
                    },
                    '/server-filter': {
                        get: 'posts.findFilterServer'
                    },
                    '/server-options': {
                        additionalPolicies: [
                            'owner'
                        ],
                        get: 'posts.find'
                    }
                },
                '/users': {
                    options: {
                        model: 'user'
                    },
                    get: 'mongoose.query'
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
