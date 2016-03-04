'use strict';

module.exports = function(req, res, next) {
    req.options.criteria = {
        filter: {
            author: req.user.id
        }
    };
    next();
};
