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
                    '/blacklist': {
                        get: 'users.findFilterBlacklist'
                    },
                    '/fields-disabled': {
                        get: 'users.findFieldsDisabled'
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
