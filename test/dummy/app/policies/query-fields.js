'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = function(listType) {
    let items;
    if (_.isArray(arguments[1])) {
        items = arguments[1];
    } else {
        items = [];
        for (var i = 1; i < arguments.length; i++) {
            items.push(arguments[i]);
        }
    }
    
    return function(req, res, next) {
        if (listType !== 'whitelist' && listType !== 'blacklist') {
            let payload = req.mycro.services.serializer.serializeError({
                status: 500,
                title: 'Invalid `listType` provided to `query-fields` policy',
                detail: 'The `listType` \'' + listType + '\' is not supported'
            });
            res.json(500, payload);
            return next(false);
        }
        let originalItems = _.get(req.options, 'blueprint.fields.' + req.options.model + '.' + listType) || [];
        items = originalItems.concat(items);
        _.merge(req.options, {
            blueprint: {
                fields: {
                    [req.options.model]: {
                        [listType]: items
                    }
                }
            }
        });
        next();
    };
};
