'use strict';

module.exports = function(req, res, next) {
    if (!req.headers['x-user-id']) {
        res.json(401, 'Unauthorized');
        return next(false);
    }
    req.user = {
        id: req.headers['x-user-id']
    };
    next();
};
