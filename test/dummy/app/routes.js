'use strict';

module.exports = function(mycro) {
    return {
        'v1.0.0': {
            '/api': {
                '/groups': {
                    options: {
                        model: 'groups'
                    },
                    get: 'mongoose.find'
                },
                '/users': {
                    options: {
                        model: 'users',
                        blacklist: ['department'],
                        processQuery(query, cb) {
                            query.where('first').equals('tim');
                            console.log(query);
                            cb();
                        }
                    },
                    get: 'mongoose.find'
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
