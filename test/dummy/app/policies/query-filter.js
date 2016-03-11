'use strict';

var _ = require('lodash');

module.exports = function(listType) {
    // define blacklist
    let items = [];
    if (_.isArray(arguments[1])) {
        items = arguments[1];
    } else {
        for (var i = 1; i < arguments.length; i++) {
            if (_.isString(arguments[i])) {
                items.push(arguments[i]);
            }
        }
    }

    return function(req, res, next) {
        if (listType !== 'blacklist' && listType !== 'whitelist') {
            let payload = req.mycro.services.serializer.serializeError({
                status: 500,
                title: 'Invalid `listType` provided',
                detail: 'Valid `listType` values include (whitelist, blacklist)',
                meta: {
                    listType: listType
                }
            });
            res.json(500, payload);
            return next(false);
        }
        let originalItems = _.get(req.options, 'blueprint.filter.' + listType) || [];
        items = originalItems.concat(items);
        _.merge(req.options, {
            blueprint: {
                filter: {
                    [listType]: items
                }
            }
        });
        next();
    };
};
