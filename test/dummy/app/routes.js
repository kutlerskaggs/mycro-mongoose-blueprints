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
                    }
                },
                '/users': {
                    get: {
                        additionalPolicies: [
                            mycro.policies.validate('query', function(joi) {
                                return joi.object({
                                    filter: joi.object({
                                        first: joi.any(),
                                        last: joi.any(),
                                        email: joi.any(),
                                        department: joi.any(),
                                        status: joi.any()
                                    }).unknown(false)
                                });
                            })
                        ],
                        handler: 'users.find'
                    },
                    '/whitelist': {
                        get: 'users.findFilterWhitelist'
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
