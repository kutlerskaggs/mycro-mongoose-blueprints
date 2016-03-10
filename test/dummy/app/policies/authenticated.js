'use strict';

var _ = require('lodash');

module.exports = function(req, res, next) {
    if (!req.headers['x-user-id']) {
        res.json(401, 'Unauthorized');
        return next(false);
    }
    req.session = {
        roles: _.compact([req.headers['x-user-role']]),
        user: {
            id: req.headers['x-user-id']
        }
    };
    next();
};
